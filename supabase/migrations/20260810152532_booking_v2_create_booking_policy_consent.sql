-- create_public_booking passa a exigir e registrar o aceite da politica.
--
-- DROP + CREATE (nao CREATE OR REPLACE): acrescentar parametro produz uma
-- funcao NOVA, e as duas coexistindo dariam ambiguidade de sobrecarga no
-- PostgREST (PGRST203).
--
-- Divisao de responsabilidade do consentimento:
--   o browser SO pode atestar que a cliente marcou a caixa (p_policy_accepted);
--   QUAL politica e QUANDO sao derivados no servidor (is_current + now()).
DROP FUNCTION IF EXISTS public.create_public_booking(
  uuid[], uuid, timestamptz, text, text, text, text
);

CREATE FUNCTION public.create_public_booking(
  p_service_ids uuid[],
  p_staff_pref uuid,
  p_starts_at timestamptz,
  p_client_name text,
  p_client_phone text,
  p_client_email text,
  p_notes text DEFAULT NULL,
  p_policy_accepted boolean DEFAULT false
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
  v_policy_id      uuid;
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

  -- Consentimento e pre-requisito do agendamento publico, nao detalhe de UI:
  -- barrado aqui, o booking nao existe sem aceite mesmo que alguem chame a RPC
  -- fora da tela.
  IF p_policy_accepted IS NOT TRUE THEN
    RAISE EXCEPTION 'policy_not_accepted';
  END IF;
  SELECT id INTO v_policy_id FROM public.cancellation_policies WHERE is_current;
  IF v_policy_id IS NULL THEN
    RAISE EXCEPTION 'internal_error';
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

  UPDATE public.clients
  SET email = p_client_email
  WHERE id = v_client_id
    AND (email IS NULL OR btrim(email) = '');

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
        work_before_minutes, gap_minutes, work_after_minutes,
        policy_id, policy_accepted_at
      ) VALUES (
        v_client_id, v_staff_id, p_service_ids[1], p_starts_at, v_ends_at, 'confirmed', 'online', p_notes,
        v_total_price, v_total_duration, v_reference,
        v_token_hash, v_ends_at + interval '30 days',
        v_total_duration, 0, 0,
        v_policy_id, now()
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
    'starts_at', p_starts_at, 'ends_at', v_ends_at, 'staff_id', v_staff_id,
    'service_ids', p_service_ids, 'policy_id', v_policy_id
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
    'policy_version', (SELECT version FROM public.cancellation_policies WHERE id = v_policy_id),
    'policy_accepted_at', (SELECT policy_accepted_at FROM public.appointments WHERE id = v_appointment_id),
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

REVOKE ALL ON FUNCTION public.create_public_booking(
  uuid[], uuid, timestamptz, text, text, text, text, boolean
) FROM PUBLIC, authenticated;
GRANT EXECUTE ON FUNCTION public.create_public_booking(
  uuid[], uuid, timestamptz, text, text, text, text, boolean
) TO anon;

NOTIFY pgrst, 'reload schema';
