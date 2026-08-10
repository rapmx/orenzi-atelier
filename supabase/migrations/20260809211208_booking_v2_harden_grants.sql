-- Correcao encontrada nos testes da Booking V2.2 foundation.
--
-- REVOKE ... FROM PUBLIC nao e suficiente no Supabase: anon e authenticated
-- recebem EXECUTE/SELECT por DEFAULT PRIVILEGES, com grant proprio, que
-- sobrevive a revogacao de PUBLIC. Comprovado em teste:
--   * anon executou generate_booking_reference() -> HTTP 200
--   * anon executou lock_staff_for_booking()     -> HTTP 204 (lock adquirido)
--
-- lock_staff_for_booking e o caso relevante: permitia a um chamador anonimo
-- adquirir advisory lock sobre qualquer profissional (transaction-scoped, logo
-- curto, mas e contencao gratuita que ninguem de fora deveria poder causar).
-- Ambas sao helpers internos das RPCs SECURITY DEFINER, que rodam como owner
-- e nao dependem destes grants para funcionar.
REVOKE ALL ON FUNCTION public.lock_staff_for_booking(uuid) FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.generate_booking_reference() FROM anon, authenticated;

-- appointment_services / appointment_events: RLS sem policy ja negava toda
-- linha (respondiam 200 []), entao nao houve vazamento. Ainda assim o grant de
-- tabela mantinha as duas na superficie publica da API, mais frouxo que
-- appointments (que responde 401 por nao ter grant). Defesa em profundidade:
-- so as RPCs SECURITY DEFINER devem tocar estas tabelas, como a migration
-- original ja documentava.
--
-- authenticated tambem perde acesso direto de proposito: o painel nao le estas
-- tabelas nesta fase. Quando ler, entra policy + grant explicitos na migration
-- correspondente, em vez de depender de privilegio default herdado.
REVOKE ALL ON TABLE public.appointment_services FROM anon, authenticated;
REVOKE ALL ON TABLE public.appointment_events FROM anon, authenticated;

NOTIFY pgrst, 'reload schema';
