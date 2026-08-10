-- BOOKING V2.2 — Booking Core + Self-service Foundation
-- Aditiva. NAO altera get_busy_slots, a policy publica de INSERT do V1,
-- appointments.service_id, o CHECK de status, nem triggers existentes.
-- Coopera com o guard de double-booking existente reusando a MESMA chave de
-- advisory lock e a MESMA funcao de blocos de trabalho (staff_work_blocks).

ALTER TABLE public.appointments
  ADD COLUMN total_price numeric,
  ADD COLUMN total_duration_minutes integer,
  ADD COLUMN booking_reference text,
  ADD COLUMN manage_token_hash text,
  ADD COLUMN manage_token_expires_at timestamptz,
  ADD COLUMN cancelled_at timestamptz;

ALTER TABLE public.appointments
  ADD CONSTRAINT appointments_booking_reference_key UNIQUE (booking_reference);

ALTER TABLE public.appointments
  ADD CONSTRAINT appointments_manage_token_hash_key UNIQUE (manage_token_hash);

ALTER TABLE public.appointments
  ADD CONSTRAINT appointments_total_price_nonneg CHECK (total_price IS NULL OR total_price >= 0);

ALTER TABLE public.appointments
  ADD CONSTRAINT appointments_total_duration_positive CHECK (total_duration_minutes IS NULL OR total_duration_minutes > 0);

CREATE TABLE public.appointment_services (
  id                          uuid primary key default gen_random_uuid(),
  appointment_id              uuid not null references public.appointments(id) on delete cascade,
  service_id                  uuid references public.services(id) on delete set null,
  service_name_snapshot       text not null,
  price_snapshot              numeric not null check (price_snapshot >= 0),
  duration_minutes_snapshot   integer not null check (duration_minutes_snapshot > 0),
  sort_order                  integer not null default 0 check (sort_order >= 0),
  created_at                  timestamptz not null default now()
);

CREATE INDEX appointment_services_appointment_id_idx
  ON public.appointment_services (appointment_id);

ALTER TABLE public.appointment_services ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.appointment_events (
  id             uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references public.appointments(id) on delete cascade,
  event_type     text not null check (event_type in ('created','rescheduled','cancelled')),
  occurred_at    timestamptz not null default now(),
  actor          text,
  metadata       jsonb
);

CREATE INDEX appointment_events_appointment_id_idx
  ON public.appointment_events (appointment_id);

ALTER TABLE public.appointment_events ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.lock_staff_for_booking(p_staff_id uuid)
RETURNS void
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  -- FORMULA OBRIGATORIAMENTE IDENTICA A DO GUARD appointments_guard_conflict().
  -- A forma de UM bigint e a de DOIS ints ocupam espacos de lock DIFERENTES em
  -- Postgres e nao se bloqueiam entre si. Reentrante na mesma transacao.
  PERFORM pg_advisory_xact_lock(hashtextextended(p_staff_id::text, 0));
END;
$$;

REVOKE EXECUTE ON FUNCTION public.lock_staff_for_booking(uuid) FROM PUBLIC;

CREATE OR REPLACE FUNCTION public.generate_booking_reference()
RETURNS text
LANGUAGE sql
SET search_path = ''
AS $$
  SELECT 'BK-' || (
    SELECT string_agg(substr('0123456789ABCDEFGHJKMNPQRSTVWXYZ', (floor(random() * 32) + 1)::int, 1), '')
    FROM generate_series(1, 6)
  );
$$;

REVOKE EXECUTE ON FUNCTION public.generate_booking_reference() FROM PUBLIC;

CREATE OR REPLACE FUNCTION public.create_public_booking(
  p_service_ids uuid[],
  p_staff_pref uuid,
  p_starts_at timestamptz,
  p_client_name text,
  p_client_phone text,
  p_client_email text,
  p_notes text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_service_count  int;
  v_total_duration int;
  v_total_price    numeric;
  v_ends_at        timestamptz;
  v_staff_id       uuid;
  v_client_id      uuid;
  v_token          text;
  v_token_hash     text;
  v_reference      text;
  v_appointment_id uuid;
  v_attempt        int := 0;
  v_conflict       boolean;
  v_idx            int;
  v_candidate_ids  uuid[];
  v_cand_id        uuid;
BEGIN
  IF p_service_ids IS NULL OR array_length(p_service_ids, 1) IS NULL THEN
    RAISE EXCEPTION 'invalid_service';
  END IF;

  IF array_length(p_service_ids, 1) <> (SELECT count(DISTINCT x) FROM unnest(p_service_ids) x) THEN
    RAISE EXCEPTION 'invalid_service';
  END IF;

  SELECT count(*) INTO v_service_count
  FROM public.services WHERE id = ANY(p_service_ids);
  IF v_service_count <> array_length(p_service_ids, 1) THEN
    RAISE EXCEPTION 'invalid_service';
  END IF;

  SELECT coalesce(sum(duration_minutes), 0), coalesce(sum(price), 0)
    INTO v_total_duration, v_total_price
  FROM public.services WHERE id = ANY(p_service_ids);

  v_ends_at := p_starts_at + make_interval(mins => v_total_duration);

  IF NOT public.is_public_booking_window(p_starts_at, v_ends_at) THEN
    RAISE EXCEPTION 'outside_booking_window';
  END IF;

  IF p_staff_pref IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM public.staff st WHERE st.id = p_staff_pref AND st.active) THEN
      RAISE EXCEPTION 'invalid_staff_for_services';
    END IF;
    IF (SELECT count(DISTINCT ss.service_id) FROM public.staff_services ss
        WHERE ss.staff_id = p_staff_pref AND ss.service_id = ANY(p_service_ids))
       <> array_length(p_service_ids, 1) THEN
      RAISE EXCEPTION 'invalid_staff_for_services';
    END IF;

    PERFORM public.lock_staff_for_booking(p_staff_pref);

    SELECT EXISTS (
      SELECT 1 FROM public.staff_work_blocks(p_staff_pref, p_starts_at, v_ends_at, NULL) b
      WHERE p_starts_at < b.busy_end AND v_ends_at > b.busy_start
    ) INTO v_conflict;
    IF v_conflict THEN
      RAISE EXCEPTION 'slot_conflict';
    END IF;

    v_staff_id := p_staff_pref;
  ELSE
    SELECT array_agg(st.id ORDER BY st.id) INTO v_candidate_ids
    FROM public.staff st
    WHERE st.active
      AND (SELECT count(DISTINCT ss.service_id) FROM public.staff_services ss
           WHERE ss.staff_id = st.id AND ss.service_id = ANY(p_service_ids))
          = array_length(p_service_ids, 1);

    IF v_candidate_ids IS NULL THEN
      RAISE EXCEPTION 'no_staff_available';
    END IF;

    FOREACH v_cand_id IN ARRAY v_candidate_ids LOOP
      PERFORM public.lock_staff_for_booking(v_cand_id);
    END LOOP;

    FOR v_cand_id IN
      SELECT st.id FROM public.staff st
      WHERE st.id = ANY(v_candidate_ids)
      ORDER BY st.created_at, st.id
    LOOP
      SELECT EXISTS (
        SELECT 1 FROM public.staff_work_blocks(v_cand_id, p_starts_at, v_ends_at, NULL) b
        WHERE p_starts_at < b.busy_end AND v_ends_at > b.busy_start
      ) INTO v_conflict;
      IF NOT v_conflict THEN
        v_staff_id := v_cand_id;
        EXIT;
      END IF;
    END LOOP;

    IF v_staff_id IS NULL THEN
      RAISE EXCEPTION 'slot_conflict';
    END IF;
  END IF;

  IF coalesce(trim(p_client_name), '') = '' OR coalesce(trim(p_client_phone), '') = '' THEN
    RAISE EXCEPTION 'invalid_client_data';
  END IF;
  IF p_client_email IS NULL OR p_client_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' THEN
    RAISE EXCEPTION 'invalid_client_data';
  END IF;

  v_client_id := public.find_or_create_client(
    p_client_name, p_client_phone, p_client_email, NULL, NULL
  );

  LOOP
    v_attempt := v_attempt + 1;
    v_reference := public.generate_booking_reference();
    v_token := encode(extensions.gen_random_bytes(32), 'hex');
    v_token_hash := encode(extensions.digest(v_token, 'sha256'), 'hex');
    BEGIN
      INSERT INTO public.appointments (
        client_id, staff_id, service_id, starts_at, ends_at, status, source, notes,
        total_price, total_duration_minutes, booking_reference,
        manage_token_hash, manage_token_expires_at,
        work_before_minutes, gap_minutes, work_after_minutes
      ) VALUES (
        v_client_id, v_staff_id, p_service_ids[1], p_starts_at, v_ends_at, 'confirmed', 'online', p_notes,
        v_total_price, v_total_duration, v_reference,
        v_token_hash, v_ends_at + interval '30 days',
        v_total_duration, 0, 0
      ) RETURNING id INTO v_appointment_id;
      EXIT;
    EXCEPTION
      WHEN unique_violation THEN
        IF v_attempt >= 5 THEN
          RAISE EXCEPTION 'internal_error';
        END IF;
      WHEN exclusion_violation THEN
        RAISE EXCEPTION 'slot_conflict';
    END;
  END LOOP;

  FOR v_idx IN 1 .. array_length(p_service_ids, 1) LOOP
    INSERT INTO public.appointment_services (
      appointment_id, service_id, service_name_snapshot, price_snapshot, duration_minutes_snapshot, sort_order
    )
    SELECT v_appointment_id, s.id, s.name, s.price, s.duration_minutes, v_idx
    FROM public.services s WHERE s.id = p_service_ids[v_idx];
  END LOOP;

  INSERT INTO public.appointment_events (appointment_id, event_type, actor, metadata)
  VALUES (v_appointment_id, 'created', 'client_online', jsonb_build_object(
    'starts_at', p_starts_at, 'ends_at', v_ends_at, 'staff_id', v_staff_id, 'service_ids', p_service_ids
  ));

  RETURN jsonb_build_object(
    'appointment_id', v_appointment_id,
    'booking_reference', v_reference,
    'manage_token', v_token,
    'staff', (SELECT jsonb_build_object('id', id, 'name', name, 'role', role) FROM public.staff WHERE id = v_staff_id),
    'starts_at', p_starts_at,
    'ends_at', v_ends_at,
    'total_price', v_total_price,
    'total_duration_minutes', v_total_duration,
    'services', (
      SELECT jsonb_agg(jsonb_build_object(
        'name', service_name_snapshot, 'price', price_snapshot,
        'duration_minutes', duration_minutes_snapshot, 'sort_order', sort_order
      ) ORDER BY sort_order)
      FROM public.appointment_services WHERE appointment_id = v_appointment_id
    )
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.create_public_booking(
  uuid[], uuid, timestamptz, text, text, text, text
) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_public_booking(
  uuid[], uuid, timestamptz, text, text, text, text
) TO anon;

CREATE OR REPLACE FUNCTION public.get_booking_by_token(p_token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_hash            text;
  v_appt            record;
  v_was_rescheduled boolean;
  v_last_resched    timestamptz;
BEGIN
  IF p_token IS NULL OR length(p_token) = 0 THEN
    RAISE EXCEPTION 'invalid_token';
  END IF;
  v_hash := encode(extensions.digest(p_token, 'sha256'), 'hex');

  SELECT * INTO v_appt FROM public.appointments WHERE manage_token_hash = v_hash;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'invalid_token';
  END IF;
  IF v_appt.manage_token_expires_at IS NULL OR v_appt.manage_token_expires_at < now() THEN
    RAISE EXCEPTION 'expired_token';
  END IF;

  SELECT (count(*) > 0), max(occurred_at) INTO v_was_rescheduled, v_last_resched
  FROM public.appointment_events
  WHERE appointment_id = v_appt.id AND event_type = 'rescheduled';

  RETURN jsonb_build_object(
    'booking_reference', v_appt.booking_reference,
    'status', v_appt.status,
    'was_rescheduled', coalesce(v_was_rescheduled, false),
    'last_rescheduled_at', v_last_resched,
    'starts_at', v_appt.starts_at,
    'ends_at', v_appt.ends_at,
    'total_price', v_appt.total_price,
    'total_duration_minutes', v_appt.total_duration_minutes,
    'staff', (SELECT jsonb_build_object('name', name, 'role', role) FROM public.staff WHERE id = v_appt.staff_id),
    'services', (
      SELECT jsonb_agg(jsonb_build_object(
        'name', service_name_snapshot, 'price', price_snapshot,
        'duration_minutes', duration_minutes_snapshot, 'sort_order', sort_order
      ) ORDER BY sort_order)
      FROM public.appointment_services WHERE appointment_id = v_appt.id
    ),
    'cancellable', (v_appt.status = 'confirmed'),
    'reschedulable', (v_appt.status = 'confirmed'),
    'within_free_cancellation_window', (v_appt.starts_at - now() >= interval '12 hours')
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_booking_by_token(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_booking_by_token(text) TO anon;

CREATE OR REPLACE FUNCTION public.reschedule_booking_by_token(
  p_token text,
  p_new_starts_at timestamptz
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_hash        text;
  v_appt        record;
  v_new_ends_at timestamptz;
  v_conflict    boolean;
BEGIN
  IF p_token IS NULL THEN RAISE EXCEPTION 'invalid_token'; END IF;
  v_hash := encode(extensions.digest(p_token, 'sha256'), 'hex');

  SELECT * INTO v_appt FROM public.appointments WHERE manage_token_hash = v_hash FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'invalid_token'; END IF;
  IF v_appt.manage_token_expires_at IS NULL OR v_appt.manage_token_expires_at < now() THEN
    RAISE EXCEPTION 'expired_token';
  END IF;
  IF v_appt.status <> 'confirmed' THEN
    RAISE EXCEPTION 'booking_not_reschedulable';
  END IF;

  v_new_ends_at := p_new_starts_at + (v_appt.ends_at - v_appt.starts_at);

  IF NOT public.is_public_booking_window(p_new_starts_at, v_new_ends_at) THEN
    RAISE EXCEPTION 'outside_booking_window';
  END IF;

  PERFORM public.lock_staff_for_booking(v_appt.staff_id);

  SELECT EXISTS (
    SELECT 1 FROM public.staff_work_blocks(v_appt.staff_id, p_new_starts_at, v_new_ends_at, v_appt.id) b
    WHERE p_new_starts_at < b.busy_end AND v_new_ends_at > b.busy_start
  ) INTO v_conflict;
  IF v_conflict THEN
    RAISE EXCEPTION 'slot_conflict';
  END IF;

  BEGIN
    UPDATE public.appointments
    SET starts_at = p_new_starts_at,
        ends_at = v_new_ends_at,
        manage_token_expires_at = v_new_ends_at + interval '30 days'
    WHERE id = v_appt.id;
  EXCEPTION WHEN exclusion_violation THEN
    RAISE EXCEPTION 'slot_conflict';
  END;

  INSERT INTO public.appointment_events (appointment_id, event_type, actor, metadata)
  VALUES (v_appt.id, 'rescheduled', 'client_online', jsonb_build_object(
    'old_starts_at', v_appt.starts_at, 'new_starts_at', p_new_starts_at,
    'old_ends_at', v_appt.ends_at, 'new_ends_at', v_new_ends_at,
    'within_free_window', (v_appt.starts_at - now() >= interval '12 hours')
  ));

  RETURN jsonb_build_object(
    'booking_reference', v_appt.booking_reference,
    'starts_at', p_new_starts_at,
    'ends_at', v_new_ends_at,
    'staff', (SELECT jsonb_build_object('name', name, 'role', role) FROM public.staff WHERE id = v_appt.staff_id)
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.reschedule_booking_by_token(text, timestamptz) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reschedule_booking_by_token(text, timestamptz) TO anon;

CREATE OR REPLACE FUNCTION public.cancel_booking_by_token(p_token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_hash text;
  v_appt record;
BEGIN
  IF p_token IS NULL THEN RAISE EXCEPTION 'invalid_token'; END IF;
  v_hash := encode(extensions.digest(p_token, 'sha256'), 'hex');

  SELECT * INTO v_appt FROM public.appointments WHERE manage_token_hash = v_hash FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'invalid_token'; END IF;
  IF v_appt.manage_token_expires_at IS NULL OR v_appt.manage_token_expires_at < now() THEN
    RAISE EXCEPTION 'expired_token';
  END IF;
  IF v_appt.status <> 'confirmed' THEN
    RAISE EXCEPTION 'booking_not_cancellable';
  END IF;

  UPDATE public.appointments SET status = 'cancelled', cancelled_at = now() WHERE id = v_appt.id;

  INSERT INTO public.appointment_events (appointment_id, event_type, actor, metadata)
  VALUES (v_appt.id, 'cancelled', 'client_online', jsonb_build_object(
    'within_free_window', (v_appt.starts_at - now() >= interval '12 hours'),
    'starts_at_at_cancellation', v_appt.starts_at
  ));

  RETURN jsonb_build_object(
    'booking_reference', v_appt.booking_reference,
    'staff', (SELECT jsonb_build_object('name', name, 'role', role) FROM public.staff WHERE id = v_appt.staff_id),
    'starts_at', v_appt.starts_at,
    'ends_at', v_appt.ends_at,
    'services', (
      SELECT jsonb_agg(jsonb_build_object(
        'name', service_name_snapshot, 'price', price_snapshot,
        'duration_minutes', duration_minutes_snapshot, 'sort_order', sort_order
      ) ORDER BY sort_order)
      FROM public.appointment_services WHERE appointment_id = v_appt.id
    )
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.cancel_booking_by_token(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cancel_booking_by_token(text) TO anon;

NOTIFY pgrst, 'reload schema';
