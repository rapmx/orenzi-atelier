-- ════════════════════════════════════════════════════════════════════════
-- VALOR FINAL DO ATENDIMENTO (Passo 0.5 — 17/08/2026)
-- ════════════════════════════════════════════════════════════════════════
-- A Juliane avalia o cabelo quando a cliente chega e define quanto aquele
-- atendimento vai custar de verdade. Ate aqui o painel so conhecia o
-- snapshot do booking (appointments.total_price), que para 9 dos 15
-- servicos e o valor BASE — o piso, nunca o cobrado.
--
-- Esta migration acrescenta a camada posterior e OPCIONAL:
--
--     valor canonico = final_price ?? total_price ?? services.price ?? 0
--
-- ⚠ total_price NUNCA e sobrescrito. Ele continua sendo o registro do que
--   foi combinado no agendamento — e e ele que sustenta o deposito ja
--   cobrado pelo Stripe. Perder esse valor quebraria a conciliacao de um
--   pagamento que ja aconteceu.
--
-- ⚠ V1 e TOTAL POR APPOINTMENT. Num atendimento multi-servico o final_price
--   substitui a soma inteira; os 25 euros de diferenca entre 155 e 180 NAO
--   sao redistribuidos entre os servicos de appointment_services. A
--   decomposicao por item fica para quando existir demanda real.
--
-- ⚠ Stripe NAO le final_price. Deposito, PaymentIntent, refund e saldo
--   continuam saindo de deposit_for_services()/total_price. Alterar isso
--   exige a rodada de arquitetura financeira, nao esta.
-- ════════════════════════════════════════════════════════════════════════

-- ── 1) Colunas ─────────────────────────────────────────────────────────
-- Aditivas e anulaveis: nenhuma linha existente muda de valor, e o
-- fallback para total_price acontece sozinho enquanto final_price for NULL.
ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS final_price numeric NULL,
  ADD COLUMN IF NOT EXISTS final_price_updated_at timestamptz NULL;

-- Zero e valor LEGITIMO (cortesia, retoque sem cobranca) — por isso >= 0 e
-- nao > 0, e por isso o frontend compara contra NULL e nunca usa `||`.
ALTER TABLE public.appointments
  DROP CONSTRAINT IF EXISTS appointments_final_price_nonneg;
ALTER TABLE public.appointments
  ADD CONSTRAINT appointments_final_price_nonneg
  CHECK (final_price IS NULL OR final_price >= 0);

COMMENT ON COLUMN public.appointments.final_price IS
  'Valor final do atendimento, definido a mao pela profissional depois da avaliacao presencial. NULL = ainda nao definido, e o valor canonico cai para total_price. Vence total_price em toda leitura de valor. Nao e usado pelo Stripe.';
COMMENT ON COLUMN public.appointments.final_price_updated_at IS
  'Quando final_price foi definido pela ultima vez. Vai a NULL junto com final_price no reset — o carimbo descreve um valor que passou a nao existir.';

-- ── 2) Operacao de escrita ─────────────────────────────────────────────
-- RPC dedicada em vez de UPDATE direto. Nao e porque falte permissao:
-- `authenticated` JA tem UPDATE em appointments (policy "authenticated
-- update appointments", sem WITH CHECK) e o painel ja usa isso no detalhe
-- do atendimento. E justamente por isso que a RPC importa — pelo caminho
-- direto o browser pode escrever QUALQUER coluna, inclusive total_price,
-- status e os campos do Stripe. Esta funcao toca duas colunas e mais nada,
-- valida o sinal no servidor e carimba a hora numa operacao so.
--
-- Nao ha RBAC aqui, de proposito: o produto ainda nao tem papeis, e o
-- modelo em vigor e "autenticado = a Juliane". Sem hardcode de e-mail.
CREATE OR REPLACE FUNCTION public.set_appointment_final_price(
  p_appointment_id uuid,
  p_final_price    numeric
)
RETURNS TABLE (
  id                     uuid,
  final_price            numeric,
  final_price_updated_at timestamptz,
  total_price            numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
declare
  v_existe boolean;
begin
  -- SECURITY DEFINER roda como owner e ignora RLS: a checagem de sessao
  -- tem de ser explicita aqui dentro, senao a funcao viraria uma porta
  -- aberta caso alguem conceda EXECUTE a anon por engano no futuro.
  if auth.role() is distinct from 'authenticated' then
    raise exception 'AUTH_REQUIRED'
      using errcode = '42501',
            hint = 'Faca login para definir o valor final do atendimento.';
  end if;

  if p_appointment_id is null then
    raise exception 'APPOINTMENT_ID_REQUIRED' using errcode = '22004';
  end if;

  -- Negativo e recusado no SERVIDOR, nao so no formulario. O CHECK da
  -- tabela ja barraria, mas com uma mensagem que a tela nao sabe traduzir.
  if p_final_price is not null and p_final_price < 0 then
    raise exception 'FINAL_PRICE_NEGATIVE'
      using errcode = '22023',
            hint = 'O valor final nao pode ser negativo.';
  end if;

  select true into v_existe from appointments a where a.id = p_appointment_id;
  if not found then
    raise exception 'APPOINTMENT_NOT_FOUND' using errcode = 'P0002';
  end if;

  -- ⚠ A lista de colunas do SET e a garantia central desta migration:
  -- total_price, status, servicos, horarios e qualquer campo de pagamento
  -- ficam fora. No reset (p_final_price IS NULL) o carimbo vai junto para
  -- NULL — manter a data de um valor que deixou de existir descreveria
  -- algo que nao esta mais la.
  update appointments a
     set final_price = p_final_price,
         final_price_updated_at = case when p_final_price is null then null else now() end
   where a.id = p_appointment_id;

  return query
    select a.id, a.final_price, a.final_price_updated_at, a.total_price
      from appointments a
     where a.id = p_appointment_id;
end;
$function$;

-- ── 3) Superficie ──────────────────────────────────────────────────────
-- Convencao de 09/08/2026: REVOKE de PUBLIC **e** de anon/authenticated
-- explicitamente — o Supabase concede EXECUTE a esses papeis por default
-- privileges, com grant proprio, que sobrevive a revogacao de PUBLIC.
-- Depois, GRANT so para quem deve mesmo executar.
REVOKE ALL ON FUNCTION public.set_appointment_final_price(uuid, numeric)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.set_appointment_final_price(uuid, numeric)
  TO authenticated;

COMMENT ON FUNCTION public.set_appointment_final_price(uuid, numeric) IS
  'Define ou reseta appointments.final_price. p_final_price NULL reseta (e limpa o carimbo); 0 e valor valido; negativo e recusado. Nao toca total_price, status, servicos nem pagamento.';
