-- Catalogo (servicos, profissionais, quem faz o que) e escrita de owner.
-- services.price alimenta deposit_for_services() -> o deposito do Stripe.
-- staff.role e rotulo de cargo; a autorizacao vem de app_accounts, e por isso
-- ninguem se auto-promove escrevendo em staff.
--
-- USING e WITH CHECK SEMPRE explicitos: omitir WITH CHECK faz o Postgres
-- reusar o USING em silencio, e a decisao fica implicita.

-- anon: so leitura (agendar.html monta o catalogo com a chave publica).
revoke all on public.services       from anon;
revoke all on public.staff          from anon;
revoke all on public.staff_services from anon;
grant select on public.services, public.staff, public.staff_services to anon;

-- services
drop policy if exists "authenticated insert services" on public.services;
drop policy if exists "authenticated update services" on public.services;
drop policy if exists "authenticated delete services" on public.services;

create policy "owner insert services" on public.services
  for insert to authenticated with check ((select public.is_owner()));
create policy "owner update services" on public.services
  for update to authenticated
  using ((select public.is_owner())) with check ((select public.is_owner()));
create policy "owner delete services" on public.services
  for delete to authenticated using ((select public.is_owner()));

-- staff
drop policy if exists "authenticated insert staff" on public.staff;
drop policy if exists "authenticated update staff" on public.staff;
drop policy if exists "authenticated delete staff" on public.staff;

create policy "owner insert staff" on public.staff
  for insert to authenticated with check ((select public.is_owner()));
create policy "owner update staff" on public.staff
  for update to authenticated
  using ((select public.is_owner())) with check ((select public.is_owner()));
create policy "owner delete staff" on public.staff
  for delete to authenticated using ((select public.is_owner()));

-- staff_services: tabela de ligacao. Nao existia policy de UPDATE e nao
-- passa a existir: reamarrar par (staff, service) e delete + insert.
drop policy if exists "authenticated insert staff_services" on public.staff_services;
drop policy if exists "authenticated delete staff_services" on public.staff_services;

create policy "owner insert staff_services" on public.staff_services
  for insert to authenticated with check ((select public.is_owner()));
create policy "owner delete staff_services" on public.staff_services
  for delete to authenticated using ((select public.is_owner()));

revoke update on public.staff_services from authenticated;
