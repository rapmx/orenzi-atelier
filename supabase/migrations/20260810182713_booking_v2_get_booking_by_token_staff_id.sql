-- Achado ao implementar gerenciar.html: o picker de reagendamento precisa do
-- staff_id para chamar get_busy_slots (discovery de disponibilidade). Sem ele
-- a tela teria que fingir disponibilidade -- exatamente o workaround proibido.
-- staff_id NAO e PII da cliente (e so o identificador da profissional, cujo
-- nome ja e exibido) -- expor e seguro. Assinatura de get_booking_by_token
-- continua identica.
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
    'staff', (SELECT jsonb_build_object('id', id, 'name', name, 'role', role) FROM public.staff WHERE id = v_appt.staff_id),
    'services', (
      SELECT jsonb_agg(jsonb_build_object(
        'name', service_name_snapshot, 'price', price_snapshot,
        'duration_minutes', duration_minutes_snapshot, 'sort_order', sort_order
      ) ORDER BY sort_order)
      FROM public.appointment_services WHERE appointment_id = v_appt.id
    ),
    'cancellable', (v_appt.status = 'confirmed'),
    'reschedulable', (v_appt.status = 'confirmed'),
    'within_free_cancellation_window', (v_appt.starts_at - now() >= interval '12 hours'),
    'policy', (
      SELECT jsonb_build_object('version', version, 'summary', summary, 'body', body, 'accepted_at', v_appt.policy_accepted_at)
      FROM public.cancellation_policies WHERE id = v_appt.policy_id
    )
  );
END;
$$;
REVOKE ALL ON FUNCTION public.get_booking_by_token(text) FROM PUBLIC, authenticated;
GRANT EXECUTE ON FUNCTION public.get_booking_by_token(text) TO anon;
NOTIFY pgrst, 'reload schema';
