-- RBAC fundacao: identidade x papel, separada de public.staff.
-- staff.role e rotulo de cargo ('Boss', 'Recepcao') e NAO autoriza nada.

create table if not exists public.app_accounts (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  staff_id   uuid references public.staff(id) on delete set null,
  role       text not null check (role in ('owner','staff')),
  active     boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.app_accounts is
  'Papel de autorizacao por conta do auth. Sem grant para anon/authenticated: '
  'inalcancavel pelo PostgREST, so as funcoes SECURITY DEFINER a leem. '
  'Conta sem linha aqui = sem acesso.';

create index if not exists app_accounts_staff_id_idx
  on public.app_accounts (staff_id) where staff_id is not null;

alter table public.app_accounts enable row level security;
-- Sem policy nenhuma, de proposito: so service_role (que ignora RLS) alcanca.

revoke all on public.app_accounts from public, anon, authenticated;

create or replace function public.app_accounts_set_updated_at()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin new.updated_at = now(); return new; end $$;

revoke all on function public.app_accounts_set_updated_at() from public, anon, authenticated;

drop trigger if exists trg_app_accounts_updated_at on public.app_accounts;
create trigger trg_app_accounts_updated_at
  before update on public.app_accounts
  for each row execute function public.app_accounts_set_updated_at();

-- Helpers. STABLE para o planner avaliar uma vez por statement.
-- Nas policies usar sempre (select public.is_owner()), nunca is_owner() cru.

create or replace function public.current_app_role()
returns text language sql stable security definer set search_path = '' as $$
  select a.role from public.app_accounts a
   where a.user_id = (select auth.uid()) and a.active
$$;

create or replace function public.current_staff_id()
returns uuid language sql stable security definer set search_path = '' as $$
  select a.staff_id from public.app_accounts a
   where a.user_id = (select auth.uid()) and a.active
$$;

-- exists() nunca devolve null: anon e sessao sem conta recebem false, nao null.
create or replace function public.is_owner()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.app_accounts a
     where a.user_id = (select auth.uid()) and a.active and a.role = 'owner'
  )
$$;

revoke all on function public.current_app_role() from public, anon, authenticated;
revoke all on function public.current_staff_id() from public, anon, authenticated;
revoke all on function public.is_owner()        from public, anon, authenticated;

grant execute on function public.current_app_role() to authenticated;
grant execute on function public.current_staff_id() to authenticated;
grant execute on function public.is_owner()        to authenticated;
