-- Backfill: as contas que ja existiam sao as duas donas do produto (Raphael e
-- Juliane). Sem citar e-mail: quem ja tinha login antes do RBAC e owner por
-- definicao. Toda conta criada DEPOIS nasce sem linha aqui, logo sem acesso.
-- staff_id fica NULL: owner enxerga tudo, nao precisa de vinculo com staff.

insert into public.app_accounts (user_id, role, active)
select u.id, 'owner', true
  from auth.users u
 where u.created_at < now()
on conflict (user_id) do nothing;
