-- ═══════════════════════════════════════════════════════════════════════════
-- STRIPE DEPOSIT — SANDBOX FOUNDATION (14/08/2026)
--
-- Deposito de 20% do valor BASE server-side + slot hold via appointment
-- status='pending' com hold_expires_at.
--
-- ⚠ LIVE PAYMENTS BLOCKED UNTIL CANCELLATION POLICY V2 IS APPROVED.
--   A policy v1 corrente promete taxa fixa de EUR 16 e diz que "o sinal e
--   descontado de qualquer taxa de cancelamento". Com deposito de 20% isso
--   implica devolver dinheiro em cancelamento tardio — regra financeira que
--   ninguem decidiu. Sandbox pode rodar sob a v1; producao NAO.
--
-- Migration ADITIVA. Nenhuma linha existente muda de comportamento:
--   - hold_expires_at nasce NULL em todos os appointments existentes;
--   - a regra de expiracao so tem efeito sobre status='pending', e nao existe
--     nenhum appointment 'pending' no banco (medido antes de aplicar).
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1) appointments.hold_expires_at ────────────────────────────────────────
-- NULL = appointment normal. NOT NULL = hold de pagamento em andamento.
-- Depois do pagamento confirmado volta a NULL: o hold deixa de existir como
-- conceito, o appointment passa a ser operacional.
ALTER TABLE public.appointments
  ADD COLUMN hold_expires_at timestamptz;

ALTER TABLE public.appointments
  ADD CONSTRAINT appointments_hold_only_when_pending
  CHECK (hold_expires_at IS NULL OR status = 'pending');

-- Holds vivos sao poucos e consultados por janela — indice parcial basta.
CREATE INDEX appointments_active_hold_idx
  ON public.appointments (staff_id, starts_at)
  WHERE status = 'pending' AND hold_expires_at IS NOT NULL;

-- ── 2) Regra unica de "esta linha ocupa a agenda?" ─────────────────────────
-- Existe para NAO haver tres copias divergentes da mesma regra em
-- staff_work_blocks / get_busy_slots / get_chair_load. Mudou aqui, mudou nas
-- tres. STABLE (nao IMMUTABLE) porque depende de now().
--
--   cancelled                      -> livre
--   pending + hold futuro          -> ocupado   (hold de pagamento vivo)
--   pending + hold vencido         -> livre     (expiracao preguicosa)
--   pending sem hold_expires_at    -> ocupado   (pending "operacional", legado)
--   confirmed / completed / no_show -> ocupado
CREATE FUNCTION public.appointment_occupies_agenda(
  p_status text, p_hold_expires_at timestamptz
) RETURNS boolean
LANGUAGE sql STABLE
SET search_path = ''
AS $$
  SELECT p_status IS DISTINCT FROM 'cancelled'
     AND (p_status IS DISTINCT FROM 'pending'
          OR p_hold_expires_at IS NULL
          OR p_hold_expires_at > now());
$$;

-- ── 3) Disponibilidade: as tres funcoes passam a usar a regra acima ────────
-- Nenhuma outra linha destas funcoes muda. O UNION ALL de schedule_blocks
-- continua intacto (bloqueio manual, 13/08/2026) e o gap de appointment
-- continua livre.
CREATE OR REPLACE FUNCTION public.staff_work_blocks(
  p_staff_id uuid, p_from timestamptz, p_to timestamptz, p_exclude_id uuid DEFAULT NULL::uuid
) RETURNS TABLE(busy_start timestamptz, busy_end timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
  with ag as (
    select a.starts_at, a.ends_at,
      coalesce(a.work_before_minutes, s.work_before_minutes,
               (extract(epoch from (a.ends_at - a.starts_at)) / 60)::int) as wb,
      coalesce(a.gap_minutes,        s.gap_minutes,        0) as gp,
      coalesce(a.work_after_minutes, s.work_after_minutes,  0) as wa
    from appointments a
    left join services s on s.id = a.service_id
    where a.staff_id = p_staff_id
      and appointment_occupies_agenda(a.status, a.hold_expires_at)
      and a.starts_at < p_to and a.ends_at > p_from
      and (p_exclude_id is null or a.id <> p_exclude_id)
  )
  select starts_at, starts_at + make_interval(mins => wb) from ag
  union all
  select ends_at - make_interval(mins => wa), ends_at from ag where wa > 0
  union all
  select b.starts_at, b.ends_at
  from schedule_blocks b
  where b.staff_id = p_staff_id
    and b.starts_at < p_to and b.ends_at > p_from
$function$;

CREATE OR REPLACE FUNCTION public.get_busy_slots(
  p_staff_id uuid, p_from timestamptz, p_to timestamptz
) RETURNS TABLE(busy_start timestamptz, busy_end timestamptz)
LANGUAGE sql SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
  with ag as (
    select a.starts_at, a.ends_at,
      coalesce(a.work_before_minutes, s.work_before_minutes,
               (extract(epoch from (a.ends_at - a.starts_at)) / 60)::int) as wb,
      coalesce(a.gap_minutes,        s.gap_minutes,        0) as gp,
      coalesce(a.work_after_minutes, s.work_after_minutes,  0) as wa
    from appointments a
    left join services s on s.id = a.service_id
    where a.staff_id = p_staff_id
      and appointment_occupies_agenda(a.status, a.hold_expires_at)
      and a.starts_at < p_to and a.ends_at > p_from
  )
  select starts_at, starts_at + make_interval(mins => wb) from ag
  union all
  select ends_at - make_interval(mins => wa), ends_at from ag where wa > 0
  union all
  select b.starts_at, b.ends_at
  from schedule_blocks b
  where b.staff_id = p_staff_id
    and b.starts_at < p_to and b.ends_at > p_from
$function$;

CREATE OR REPLACE FUNCTION public.get_chair_load(
  p_from timestamptz, p_to timestamptz
) RETURNS TABLE(occupied_start timestamptz, occupied_end timestamptz)
LANGUAGE sql SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
  with ag as (
    select a.starts_at, a.ends_at,
      coalesce(a.work_before_minutes, s.work_before_minutes,
               (extract(epoch from (a.ends_at - a.starts_at)) / 60)::int) as wb,
      coalesce(a.gap_minutes,        s.gap_minutes,        0) as gp,
      coalesce(a.work_after_minutes, s.work_after_minutes,  0) as wa
    from appointments a
    left join services s on s.id = a.service_id
    where appointment_occupies_agenda(a.status, a.hold_expires_at)
      and a.starts_at < p_to and a.ends_at > p_from
  )
  select starts_at, starts_at + make_interval(mins => wb) from ag
  union all
  select ends_at - make_interval(mins => wa), ends_at from ag where wa > 0
  union all
  select b.starts_at, b.ends_at
  from schedule_blocks b
  where b.starts_at < p_to and b.ends_at > p_from
$function$;

-- ── 3b) schedule_blocks_guard_conflict: mesma regra ────────────────────────
-- Este guard (13/08/2026) tem copia PROPRIA da consulta de blocos de trabalho —
-- nao delega a staff_work_blocks. Sem esta correcao um hold VENCIDO continuaria
-- impedindo a Juliane de bloquear a agenda dela, porque a copia so conhecia
-- `status is distinct from 'cancelled'`.
-- Hold VIVO continua bloqueando de proposito: o horario esta reservado para
-- alguem que esta com o cartao na tela.
CREATE OR REPLACE FUNCTION public.schedule_blocks_guard_conflict()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
declare
  v_conflito text;
begin
  if new.staff_id is null then
    return new;
  end if;

  if current_setting('transaction_isolation') <> 'read committed' then
    raise exception 'BOOKING_CONFLICT_GUARD_REQUIRES_READ_COMMITTED'
      using errcode = '25001',
            detail  = 'Nível de isolamento: ' || current_setting('transaction_isolation'),
            hint    = 'Crie/edite bloqueios em READ COMMITTED.';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(new.staff_id::text, 0));

  with ag as (
    select a.starts_at, a.ends_at,
      coalesce(a.work_before_minutes, s.work_before_minutes,
               (extract(epoch from (a.ends_at - a.starts_at)) / 60)::int) as wb,
      coalesce(a.work_after_minutes, s.work_after_minutes, 0) as wa
    from appointments a
    left join services s on s.id = a.service_id
    where a.staff_id = new.staff_id
      and appointment_occupies_agenda(a.status, a.hold_expires_at)
      and a.starts_at < new.ends_at and a.ends_at > new.starts_at
  ),
  wblocks as (
    select starts_at, starts_at + make_interval(mins => wb) as busy_end from ag
    union all
    select ends_at - make_interval(mins => wa), ends_at from ag where wa > 0
  )
  select to_char(w.starts_at at time zone 'Europe/Dublin', 'DD/MM HH24:MI')
         || '-' || to_char(w.busy_end at time zone 'Europe/Dublin', 'HH24:MI')
    into v_conflito
  from wblocks w
  where tstzrange(w.starts_at, w.busy_end, '[)') && tstzrange(new.starts_at, new.ends_at, '[)')
  limit 1;

  if v_conflito is not null then
    raise exception 'BLOCK_CONFLICTS_WITH_APPOINTMENT'
      using errcode = '23P01',
            detail  = 'Já existe atendimento em ' || v_conflito || '.',
            hint    = 'Resolva o atendimento (remarque ou cancele) antes de bloquear este horário.';
  end if;

  return new;
end;
$function$;

-- ── 4) Price authority — 20% do valor BASE, server-side ────────────────────
-- Fonte unica: services.price. O browser nunca manda preco; o amount do Stripe
-- nunca deriva do frontend. Servicos com price_varies=true usam o mesmo campo
-- numerico, que e o valor BASE/MINIMO (decisao de produto congelada 14/08).
CREATE FUNCTION public.deposit_for_services(p_service_ids uuid[])
RETURNS TABLE(total_cents int, deposit_cents int)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT
    round(coalesce(sum(s.price), 0) * 100)::int,
    -- 20%: arredonda sobre o total em cents, nao servico a servico — somar
    -- arredondamentos por item faria EUR 33,33 + EUR 33,33 + EUR 33,34 fechar
    -- em cents diferentes do total.
    round(coalesce(sum(s.price), 0) * 100 * 0.20)::int
  FROM public.services s
  WHERE s.id = ANY(p_service_ids);
$$;
REVOKE ALL ON FUNCTION public.deposit_for_services(uuid[]) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.deposit_for_services(uuid[]) TO service_role;

-- ── 5) payments ────────────────────────────────────────────────────────────
-- Entidade propria, mesmo espirito de schedule_blocks: appointments NAO vira
-- tabela de pagamentos. Uma linha por PaymentIntent.
--
-- client_secret NUNCA e armazenado aqui, nem em lugar nenhum: ele vive
-- HTTPS -> memoria da Edge -> memoria do browser -> [fim].
CREATE TABLE public.payments (
  id                        uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
  appointment_id            uuid NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  request_key               uuid NOT NULL REFERENCES public.booking_operation_requests(request_key),
  stripe_payment_intent_id  text NOT NULL UNIQUE,
  kind                      text NOT NULL DEFAULT 'deposit' CHECK (kind IN ('deposit')),
  amount_total_cents        int  NOT NULL CHECK (amount_total_cents >= 0),
  amount_cents              int  NOT NULL CHECK (amount_cents >= 0),
  currency                  text NOT NULL DEFAULT 'eur',
  status                    text NOT NULL DEFAULT 'requires_payment_method'
    CHECK (status IN ('requires_payment_method','requires_action','processing',
                      'succeeded','canceled','failed',
                      'refunded','partially_refunded','needs_manual_refund')),
  paid_at                   timestamptz,
  refunded_cents            int NOT NULL DEFAULT 0 CHECK (refunded_cents >= 0),
  refunded_at               timestamptz,
  last_stripe_event_id      text,
  created_at                timestamptz NOT NULL DEFAULT now(),
  updated_at                timestamptz NOT NULL DEFAULT now()
);
-- Uma tentativa logica (request_key) = no maximo um deposito.
CREATE UNIQUE INDEX payments_request_key_deposit_idx
  ON public.payments (request_key) WHERE kind = 'deposit';
CREATE INDEX payments_appointment_idx ON public.payments (appointment_id);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.payments FROM PUBLIC, anon, authenticated;

-- ── 6) stripe_webhook_events ───────────────────────────────────────────────
-- Autoridade de dedup do webhook. event_id como PK: mesmo evento entregue N
-- vezes produz UM efeito. Se a transacao do handler falhar, a linha some junto
-- (rollback) e a reentrega do Stripe tenta de novo — que e o comportamento
-- desejado, nao um bug.
CREATE TABLE public.stripe_webhook_events (
  event_id          text PRIMARY KEY,
  type              text NOT NULL,
  payment_intent_id text,
  received_at       timestamptz NOT NULL DEFAULT now(),
  processed_at      timestamptz,
  error             text
);
ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.stripe_webhook_events FROM PUBLIC, anon, authenticated;

-- ── 7) appointment_events: tipos de pagamento ──────────────────────────────
ALTER TABLE public.appointment_events
  DROP CONSTRAINT appointment_events_event_type_check;
ALTER TABLE public.appointment_events
  ADD CONSTRAINT appointment_events_event_type_check
  CHECK (event_type = ANY (ARRAY[
    'created','rescheduled','cancelled',
    'hold_created','payment_succeeded','payment_failed','hold_released'
  ]));

-- ── 8) _create_booking_core — aceita nascer como hold ──────────────────────
-- Assinatura ganha DOIS parametros no fim, ambos com DEFAULT. Os chamadores
-- antigos (create_public_booking, create_public_booking_orchestrated) passam 9
-- argumentos posicionais e continuam valendo sem uma linha alterada.
--
-- DROP + CREATE em vez de CREATE OR REPLACE: uma sobrecarga de 11 args com
-- defaults conviveria com a de 9 e toda chamada de 9 viraria "function is not
-- unique". Uma funcao so, sempre.
DROP FUNCTION public._create_booking_core(
  uuid[], uuid, timestamptz, text, text, text, text, boolean, text
);
CREATE FUNCTION public._create_booking_core(
  p_service_ids uuid[], p_staff_pref uuid, p_starts_at timestamptz,
  p_client_name text, p_client_phone text, p_client_email text,
  p_notes text, p_policy_accepted boolean, p_notified_via text,
  p_status text DEFAULT 'confirmed',
  p_hold_expires_at timestamptz DEFAULT NULL
) RETURNS jsonb
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
        policy_id, policy_accepted_at, notified_via, hold_expires_at
      ) VALUES (
        v_client_id, v_staff_id, p_service_ids[1], p_starts_at, v_ends_at, p_status, 'online', p_notes,
        v_total_price, v_total_duration, v_reference,
        v_token_hash, v_ends_at + interval '30 days',
        v_total_duration, 0, 0,
        v_policy_id, now(), p_notified_via, p_hold_expires_at
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
  VALUES (
    v_appointment_id,
    CASE WHEN p_hold_expires_at IS NULL THEN 'created' ELSE 'hold_created' END,
    'client_online',
    jsonb_build_object(
      'starts_at', p_starts_at, 'ends_at', v_ends_at, 'staff_id', v_staff_id,
      'service_ids', p_service_ids, 'policy_id', v_policy_id,
      'hold_expires_at', p_hold_expires_at
    )
  );

  RETURN jsonb_build_object(
    'appointment_id', v_appointment_id,
    'booking_reference', v_reference,
    'manage_token', v_token,
    'staff', (SELECT jsonb_build_object('id', id, 'name', name, 'role', role) FROM public.staff WHERE id = v_staff_id),
    'starts_at', p_starts_at,
    'ends_at', v_ends_at,
    'total_price', v_total_price,
    'total_duration_minutes', v_total_duration,
    'status', p_status,
    'hold_expires_at', p_hold_expires_at,
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
REVOKE ALL ON FUNCTION public._create_booking_core(
  uuid[], uuid, timestamptz, text, text, text, text, boolean, text, text, timestamptz
) FROM PUBLIC, anon, authenticated;

-- ── 9) create_booking_hold_orchestrated ────────────────────────────────────
-- Mesma arquitetura de idempotencia de create_public_booking_orchestrated:
-- claim atomico em booking_operation_requests, row lock, advisory lock por
-- profissional dentro do core, guard de conflito no trigger.
--
-- event_type = 'created' de proposito: o hold E a criacao do booking, so que
-- em dois tempos. A mesma request_key atravessa hold -> PaymentIntent ->
-- confirmacao, e por isso retry do browser devolve o MESMO appointment_id.
--
-- Diferencas do fluxo antigo:
--   - nasce status='pending' com hold_expires_at;
--   - notified_via='edge' => trg_notify_new_appointment NAO dispara;
--   - manage_token NAO e devolvido (nem armazenado): o token que vale e
--     gerado de novo em confirm_booking_payment, e so existe dentro do e-mail.
CREATE FUNCTION public.create_booking_hold_orchestrated(
  p_request_key uuid,
  p_service_ids uuid[], p_staff_pref uuid, p_starts_at timestamptz,
  p_client_name text, p_client_phone text, p_client_email text,
  p_notes text DEFAULT NULL, p_policy_accepted boolean DEFAULT false,
  p_hold_minutes int DEFAULT 12
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_row      record;
  v_appt     record;
  v_result   jsonb;
  v_expires  timestamptz;
  v_conflict boolean;
BEGIN
  IF p_request_key IS NULL THEN
    RAISE EXCEPTION 'invalid_request';
  END IF;
  IF p_hold_minutes IS NULL OR p_hold_minutes < 1 OR p_hold_minutes > 60 THEN
    RAISE EXCEPTION 'invalid_request';
  END IF;

  INSERT INTO public.booking_operation_requests (request_key, event_type)
  VALUES (p_request_key, 'created')
  ON CONFLICT (request_key) DO NOTHING;

  SELECT * INTO v_row FROM public.booking_operation_requests
    WHERE request_key = p_request_key FOR UPDATE;

  -- ── Replay: nunca cria um segundo hold. ──
  IF v_row.status = 'completed' THEN
    SELECT * INTO v_appt FROM public.appointments
      WHERE id = v_row.appointment_id FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'internal_error';
    END IF;

    IF v_appt.status = 'confirmed' THEN
      RETURN v_row.result
        || jsonb_build_object('replay', true, 'status', 'confirmed', 'hold_expires_at', NULL);
    END IF;

    IF v_appt.status <> 'pending' THEN
      RAISE EXCEPTION 'booking_not_holdable';
    END IF;

    PERFORM public.lock_staff_for_booking(v_appt.staff_id);

    -- Hold vencido: o slot pode ter sido tomado enquanto isso. Reconferir
    -- antes de reviver — excluindo o proprio appointment do calculo.
    IF v_appt.hold_expires_at IS NOT NULL AND v_appt.hold_expires_at <= now() THEN
      SELECT EXISTS (
        SELECT 1 FROM public.staff_work_blocks(
          v_appt.staff_id, v_appt.starts_at, v_appt.ends_at, v_appt.id) b
        WHERE v_appt.starts_at < b.busy_end AND v_appt.ends_at > b.busy_start
      ) INTO v_conflict;
      IF v_conflict THEN
        RAISE EXCEPTION 'slot_conflict';
      END IF;
      IF NOT public.is_public_booking_window(v_appt.starts_at, v_appt.ends_at) THEN
        RAISE EXCEPTION 'outside_booking_window';
      END IF;
    END IF;

    v_expires := greatest(coalesce(v_appt.hold_expires_at, now()),
                          now() + make_interval(mins => p_hold_minutes));
    UPDATE public.appointments SET hold_expires_at = v_expires WHERE id = v_appt.id;

    RETURN v_row.result
      || jsonb_build_object('replay', true, 'status', 'pending', 'hold_expires_at', v_expires);
  END IF;

  -- ── Primeira vez: cria o hold. ──
  v_expires := now() + make_interval(mins => p_hold_minutes);

  v_result := public._create_booking_core(
    p_service_ids, p_staff_pref, p_starts_at,
    p_client_name, p_client_phone, p_client_email, p_notes, p_policy_accepted,
    'edge', 'pending', v_expires
  );

  UPDATE public.booking_operation_requests
  SET status = 'completed',
      appointment_id = (v_result->>'appointment_id')::uuid,
      result = v_result - 'manage_token',
      updated_at = now()
  WHERE request_key = p_request_key;

  -- O token bruto morre aqui: nao vai pro result, nao vai pro retorno, nao vai
  -- pro browser. Quem vale e o gerado em confirm_booking_payment.
  RETURN (v_result - 'manage_token') || jsonb_build_object('replay', false);
END;
$$;
REVOKE ALL ON FUNCTION public.create_booking_hold_orchestrated(
  uuid, uuid[], uuid, timestamptz, text, text, text, text, boolean, int
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_booking_hold_orchestrated(
  uuid, uuid[], uuid, timestamptz, text, text, text, text, boolean, int
) TO service_role;

-- ── 10) extend_booking_hold ────────────────────────────────────────────────
-- Chamada logo depois de o PaymentIntent existir: e a partir dai que a cliente
-- pode ficar minutos numa tela de 3DS do banco dela.
CREATE FUNCTION public.extend_booking_hold(p_request_key uuid, p_minutes int DEFAULT 15)
RETURNS timestamptz
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_appt_id uuid;
  v_expires timestamptz;
BEGIN
  SELECT appointment_id INTO v_appt_id FROM public.booking_operation_requests
    WHERE request_key = p_request_key;
  IF v_appt_id IS NULL THEN RETURN NULL; END IF;

  UPDATE public.appointments
  SET hold_expires_at = greatest(coalesce(hold_expires_at, now()),
                                 now() + make_interval(mins => p_minutes))
  WHERE id = v_appt_id AND status = 'pending' AND hold_expires_at IS NOT NULL
  RETURNING hold_expires_at INTO v_expires;

  RETURN v_expires;
END;
$$;
REVOKE ALL ON FUNCTION public.extend_booking_hold(uuid, int) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.extend_booking_hold(uuid, int) TO service_role;

-- ── 11) register_payment_intent ────────────────────────────────────────────
-- Grava/reusa a linha de payments. Idempotente pelo UNIQUE de
-- stripe_payment_intent_id e pelo unico deposito por request_key.
CREATE FUNCTION public.register_payment_intent(
  p_request_key uuid,
  p_appointment_id uuid,
  p_payment_intent_id text,
  p_amount_total_cents int,
  p_amount_cents int,
  p_currency text DEFAULT 'eur',
  p_status text DEFAULT 'requires_payment_method'
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_row public.payments%rowtype;
BEGIN
  INSERT INTO public.payments AS pay (
    appointment_id, request_key, stripe_payment_intent_id, kind,
    amount_total_cents, amount_cents, currency, status
  ) VALUES (
    p_appointment_id, p_request_key, p_payment_intent_id, 'deposit',
    p_amount_total_cents, p_amount_cents, coalesce(p_currency, 'eur'), p_status
  )
  ON CONFLICT (stripe_payment_intent_id) DO UPDATE
    -- Nunca rebaixa um pagamento ja concluido por causa de uma corrida entre a
    -- resposta da API do Stripe e o webhook, que pode chegar primeiro.
    SET status = CASE WHEN pay.status IN
                        ('succeeded','refunded','partially_refunded','needs_manual_refund')
                      THEN pay.status ELSE excluded.status END,
        updated_at = now()
  RETURNING * INTO v_row;

  RETURN jsonb_build_object(
    'payment_id', v_row.id,
    'status', v_row.status,
    'amount_cents', v_row.amount_cents,
    'amount_total_cents', v_row.amount_total_cents,
    'currency', v_row.currency
  );
END;
$$;
REVOKE ALL ON FUNCTION public.register_payment_intent(uuid, uuid, text, int, int, text, text)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.register_payment_intent(uuid, uuid, text, int, int, text, text)
  TO service_role;

-- ── 12) handle_stripe_event — TRANSACAO UNICA do webhook ───────────────────
-- Dedup + efeito + marcacao de processado, tudo num commit so. Se qualquer
-- passo falhar, a linha de stripe_webhook_events some junto e o Stripe
-- reentrega — que e exatamente o que se quer.
--
-- Nao confia em ordem de eventos: cada ramo decide pelo ESTADO ATUAL da linha,
-- nunca por uma sequencia presumida.
--
-- ⚠ Nao existe refund automatico aqui. charge.refunded so REGISTRA o que o
--   Stripe ja fez (refund manual pelo dashboard). Ver policy v2 pendente.
CREATE FUNCTION public.handle_stripe_event(
  p_event_id text,
  p_type text,
  p_payment_intent_id text,
  p_payload jsonb DEFAULT '{}'::jsonb
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_inserted int;
  v_pay      public.payments%rowtype;
  v_appt     public.appointments%rowtype;
  v_token      text;
  v_token_hash text;
  v_refunded   int;
  v_email      text;
  v_result   jsonb;
BEGIN
  IF p_event_id IS NULL OR p_type IS NULL THEN
    RAISE EXCEPTION 'invalid_request';
  END IF;

  INSERT INTO public.stripe_webhook_events (event_id, type, payment_intent_id)
  VALUES (p_event_id, p_type, p_payment_intent_id)
  ON CONFLICT (event_id) DO NOTHING;
  GET DIAGNOSTICS v_inserted = ROW_COUNT;
  IF v_inserted = 0 THEN
    RETURN jsonb_build_object('duplicate', true, 'action', 'none');
  END IF;

  IF p_payment_intent_id IS NULL THEN
    UPDATE public.stripe_webhook_events
    SET processed_at = now(), error = 'no_payment_intent' WHERE event_id = p_event_id;
    RETURN jsonb_build_object('ignored', true, 'action', 'none');
  END IF;

  SELECT * INTO v_pay FROM public.payments
    WHERE stripe_payment_intent_id = p_payment_intent_id FOR UPDATE;
  IF NOT FOUND THEN
    -- PaymentIntent que nao nasceu aqui (ou criado antes de register). Responder
    -- 200 e seguir: reentregar nao resolveria e travaria a fila do Stripe.
    UPDATE public.stripe_webhook_events
    SET processed_at = now(), error = 'unknown_payment_intent' WHERE event_id = p_event_id;
    RETURN jsonb_build_object('ignored', true, 'action', 'none');
  END IF;

  SELECT * INTO v_appt FROM public.appointments WHERE id = v_pay.appointment_id FOR UPDATE;

  v_result := jsonb_build_object('action', 'none');

  IF p_type = 'payment_intent.succeeded' THEN
    UPDATE public.payments
    SET status = 'succeeded',
        paid_at = coalesce(paid_at, now()),
        last_stripe_event_id = p_event_id,
        updated_at = now()
    WHERE id = v_pay.id;

    IF v_appt.status = 'pending' THEN
      -- Token rotacionado NA CONFIRMACAO: o token do hold nunca chegou a
      -- lugar nenhum e morre aqui. O novo existe so em memoria desta
      -- transacao -> resposta da RPC -> corpo do e-mail -> [fim].
      v_token := encode(extensions.gen_random_bytes(32), 'hex');
      v_token_hash := encode(extensions.digest(v_token, 'sha256'), 'hex');

      UPDATE public.appointments
      SET status = 'confirmed',
          hold_expires_at = NULL,
          manage_token_hash = v_token_hash,
          manage_token_expires_at = v_appt.ends_at + interval '30 days'
      WHERE id = v_appt.id;

      INSERT INTO public.appointment_events (appointment_id, event_type, actor, metadata)
      VALUES (v_appt.id, 'payment_succeeded', 'stripe', jsonb_build_object(
        'payment_intent_id', p_payment_intent_id,
        'amount_cents', v_pay.amount_cents,
        'currency', v_pay.currency,
        'stripe_event_id', p_event_id
      ));

    ELSIF v_appt.status = 'confirmed' THEN
      -- Ja confirmado (reentrega tardia com event_id novo, ou confirmacao por
      -- outro caminho). Nao rotaciona token nem reenvia e-mail.
      v_token := NULL;
    ELSE
      -- Pagou e o appointment nao esta mais disponivel (cancelado no meio).
      -- NAO estornar por conta propria: marcar e avisar. Regra financeira e
      -- decisao da Juliane (policy v2).
      UPDATE public.payments SET status = 'needs_manual_refund', updated_at = now()
      WHERE id = v_pay.id;
      UPDATE public.stripe_webhook_events SET processed_at = now(),
        error = 'appointment_not_confirmable:' || v_appt.status WHERE event_id = p_event_id;
      RETURN jsonb_build_object('action', 'manual_refund_needed',
        'appointment_id', v_appt.id, 'appointment_status', v_appt.status);
    END IF;

    SELECT c.email INTO v_email FROM public.clients c WHERE c.id = v_appt.client_id;

    v_result := jsonb_build_object(
      'action', CASE WHEN v_token IS NULL THEN 'none' ELSE 'send_created_email' END,
      'appointment_id', v_appt.id,
      'request_key', v_pay.request_key,
      'manage_token', v_token,
      'client_email', v_email,
      'client_name', (SELECT name FROM public.clients WHERE id = v_appt.client_id),
      'booking_reference', v_appt.booking_reference,
      'starts_at', v_appt.starts_at,
      'staff', (SELECT jsonb_build_object('name', name) FROM public.staff WHERE id = v_appt.staff_id),
      'services', (
        SELECT jsonb_agg(jsonb_build_object('name', service_name_snapshot, 'price', price_snapshot)
               ORDER BY sort_order)
        FROM public.appointment_services WHERE appointment_id = v_appt.id
      ),
      'total_cents', v_pay.amount_total_cents,
      'deposit_cents', v_pay.amount_cents,
      'balance_cents', v_pay.amount_total_cents - v_pay.amount_cents,
      'currency', v_pay.currency
    );

  ELSIF p_type = 'payment_intent.payment_failed' THEN
    -- Hold NAO e liberado: a cliente pode tentar outro cartao dentro do TTL.
    UPDATE public.payments
    SET status = 'failed', last_stripe_event_id = p_event_id, updated_at = now()
    WHERE id = v_pay.id AND status NOT IN ('succeeded','refunded','partially_refunded');

    INSERT INTO public.appointment_events (appointment_id, event_type, actor, metadata)
    VALUES (v_appt.id, 'payment_failed', 'stripe', jsonb_build_object(
      'payment_intent_id', p_payment_intent_id, 'stripe_event_id', p_event_id));

  ELSIF p_type = 'payment_intent.canceled' THEN
    UPDATE public.payments
    SET status = 'canceled', last_stripe_event_id = p_event_id, updated_at = now()
    WHERE id = v_pay.id AND status <> 'succeeded';

    IF v_appt.status = 'pending' AND v_appt.hold_expires_at IS NOT NULL THEN
      UPDATE public.appointments
      SET status = 'cancelled', hold_expires_at = NULL, cancelled_at = now()
      WHERE id = v_appt.id;
      INSERT INTO public.appointment_events (appointment_id, event_type, actor, metadata)
      VALUES (v_appt.id, 'hold_released', 'stripe', jsonb_build_object(
        'payment_intent_id', p_payment_intent_id, 'stripe_event_id', p_event_id));
    END IF;

  ELSIF p_type = 'charge.refunded' THEN
    -- So REGISTRA. Nenhum refund e disparado por este codigo.
    v_refunded := coalesce((p_payload->>'amount_refunded')::int, 0);
    UPDATE public.payments
    SET refunded_cents = greatest(refunded_cents, v_refunded),
        refunded_at = coalesce(refunded_at, now()),
        status = CASE WHEN v_refunded >= v_pay.amount_cents THEN 'refunded'
                      ELSE 'partially_refunded' END,
        last_stripe_event_id = p_event_id,
        updated_at = now()
    WHERE id = v_pay.id;
  END IF;

  UPDATE public.stripe_webhook_events SET processed_at = now() WHERE event_id = p_event_id;
  RETURN v_result;
END;
$$;
REVOKE ALL ON FUNCTION public.handle_stripe_event(text, text, text, jsonb)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.handle_stripe_event(text, text, text, jsonb) TO service_role;

-- ── 13) get_booking_state_by_request_key — o polling do browser ────────────
-- Devolve SO o suficiente para a tela decidir entre "processando" e "pronto".
-- Sem PII, sem manage_token, sem client_secret, sem id de PaymentIntent.
CREATE FUNCTION public.get_booking_state_by_request_key(p_request_key uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_appt_id uuid;
  v_appt    public.appointments%rowtype;
  v_pay     public.payments%rowtype;
BEGIN
  SELECT appointment_id INTO v_appt_id FROM public.booking_operation_requests
    WHERE request_key = p_request_key;
  IF v_appt_id IS NULL THEN
    RETURN jsonb_build_object('found', false);
  END IF;

  SELECT * INTO v_appt FROM public.appointments WHERE id = v_appt_id;
  SELECT * INTO v_pay FROM public.payments WHERE request_key = p_request_key AND kind = 'deposit';

  RETURN jsonb_build_object(
    'found', true,
    'appointment_status', v_appt.status,
    'payment_status', v_pay.status,
    'confirmed', (v_appt.status = 'confirmed' AND v_pay.status = 'succeeded'),
    'hold_expires_at', v_appt.hold_expires_at,
    'booking_reference', v_appt.booking_reference,
    'starts_at', v_appt.starts_at,
    'ends_at', v_appt.ends_at,
    'total_duration_minutes', v_appt.total_duration_minutes,
    'total_price', v_appt.total_price,
    'deposit_cents', v_pay.amount_cents,
    'total_cents', v_pay.amount_total_cents,
    'balance_cents', v_pay.amount_total_cents - v_pay.amount_cents,
    'currency', v_pay.currency,
    'staff', (SELECT jsonb_build_object('id', id, 'name', name) FROM public.staff WHERE id = v_appt.staff_id),
    'services', (
      SELECT jsonb_agg(jsonb_build_object(
        'name', service_name_snapshot, 'price', price_snapshot,
        'duration_minutes', duration_minutes_snapshot, 'sort_order', sort_order
      ) ORDER BY sort_order)
      FROM public.appointment_services WHERE appointment_id = v_appt_id
    )
  );
END;
$$;
REVOKE ALL ON FUNCTION public.get_booking_state_by_request_key(uuid)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_booking_state_by_request_key(uuid) TO service_role;

NOTIFY pgrst, 'reload schema';
