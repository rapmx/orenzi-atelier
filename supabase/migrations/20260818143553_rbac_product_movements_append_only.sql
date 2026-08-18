-- product_movements e o historico do estoque: 'entrada' | 'saida' | 'ajuste',
-- com resulting_quantity congelado no instante. Reescrever uma linha reescreve
-- o passado e a previsao de consumo sai errada. O painel so INSERE.
-- Append-only vira regra do banco, nao convencao de codigo.

drop policy if exists "authenticated update product_movements" on public.product_movements;
drop policy if exists "authenticated delete product_movements" on public.product_movements;

revoke update, delete on public.product_movements from authenticated;

-- Correcao de contagem ja tem caminho proprio: um movimento kind='ajuste'.
comment on table public.product_movements is
  'Append-only: sem policy nem grant de UPDATE/DELETE para authenticated. '
  'Corrigir contagem = inserir movimento kind=''ajuste'', nunca editar historico.';
