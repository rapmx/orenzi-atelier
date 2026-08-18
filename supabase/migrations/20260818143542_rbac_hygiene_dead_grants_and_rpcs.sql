-- Higiene: grants que nao servem a nenhum caminho vivo do app.
-- Nada aqui muda comportamento; retira privilegio que so a RLS estava segurando.

-- 1) lookup_attempts: escrito SO por find_client_by_phone_lastname (SECURITY
--    DEFINER, roda como postgres). Zero policy; o grant era inerte e perigoso.
revoke all on public.lookup_attempts from anon, authenticated;

-- 2) cancellation_policies: a unica leitura publica e a policy 'is_current'.
revoke all on public.cancellation_policies from anon, authenticated;
grant select on public.cancellation_policies to anon, authenticated;

-- 3) booking_visits: agendar.html INSERE (anon); o painel so leria.
revoke all on public.booking_visits from anon, authenticated;
grant insert on public.booking_visits to anon, authenticated;
grant select on public.booking_visits to authenticated;

-- 4) Estoque nao e publico: anon nao tem caminho nenhum em products/movements.
revoke all on public.products          from anon;
revoke all on public.product_movements from anon;

-- 5) client_photos: todas as policies exigem authenticated; grant anon era morto.
revoke all on public.client_photos from anon;

-- 6) clients: agendar.html nao usa .from('clients') — entra por
--    find_or_create_client (SECURITY DEFINER). O grant anon era morto.
--    A policy 'public insert clients' (WITH CHECK true) FICA de pe por ora:
--    mexer nela e trabalho da rodada de appointments/clients.
revoke all on public.clients from anon;

-- 7) TRUNCATE/REFERENCES/TRIGGER nunca sao filtrados por RLS e nao existem na
--    superficie PostgREST. Privilegio morto nas tabelas desta rodada.
revoke truncate, references, trigger on
  public.services, public.staff, public.staff_services,
  public.products, public.product_movements, public.client_photos
from anon, authenticated;

-- 8) Funcoes de TRIGGER expostas em /rest/v1/rpc/. O disparo do trigger nao
--    consulta EXECUTE; so a chamada direta pelo PostgREST e que sumia.
revoke all on function public.notify_new_appointment()     from public, anon, authenticated;
revoke all on function public.appointments_guard_conflict() from public, anon, authenticated;
