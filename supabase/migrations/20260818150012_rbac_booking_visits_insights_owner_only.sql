-- booking_visits e o UNICO dataset que so a Insights consome: o painel o le
-- em loadBookingVisits() e o usa em um lugar so, o bloco "Canais"
-- (visitas da pagina publica no periodo). Nenhuma tela operacional o toca.
-- Por isso da pra fechar no banco sem custo operacional nenhum — ao
-- contrario de appointments, que a Agenda, a Home e Clientes precisam ler.
--
-- INSERT continua publico: quem escreve e agendar.html com a chave anonima.

drop policy if exists "authenticated read booking_visits" on public.booking_visits;

create policy "owner read booking_visits" on public.booking_visits
  for select to authenticated using ((select public.is_owner()));
