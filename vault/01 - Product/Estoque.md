# Estoque

**Estado: Fase 1 do roadmap visual concluída (02/08/2026). Migração para o
Design System apenas PLANEJADA — aguarda 4 decisões.**

## Por que a aba existe

Estoque ocupou o lugar de **Equipe** em 02/08/2026. Com uma profissional só,
"Profissionais" era uma tela de uma linha.

Abas hoje: **Início · Insights · Agenda · Clientes · Estoque · Questionário**.

## Modelo de dados

`products` (com `code`, `supplier`, `favorite`, `expires_at`, `image_url`) +
`product_movements` — o histórico:

| campo | regra |
|---|---|
| `kind` | `entrada` \| `saida` \| `ajuste` |
| `quantity` | **sempre positivo** — o sinal vem do `kind` |
| `resulting_quantity` | o saldo congelado naquele momento |

⚠ **Só `saida` conta como consumo.** Entrada é compra, ajuste é correção de
contagem. Somar os três **inflaria a previsão** de reposição.

Bucket `product-photos` (público, mesmas políticas de `client-photos`).

## Visual

Padrão `.list-row.stock-row`. Item em alerta de mínimo recebe fundo tingido,
borda grossa, título e quantidade em vermelho e tag "Repor".

FAB circular flutuante é **só do Estoque e Clientes** — na Agenda o `+` virou
squircle na linha de controle.

Folha parcial (`BottomSheet`) segue correta e em uso aqui: escolha curta é
folha, fluxo de várias etapas é tela.

## Bloqueado

A migração do Estoque para os componentes `.o-*` do Design System está
**planejada e parada**, aguardando 4 decisões que ainda não foram tomadas.
Não implementar por conta própria.

Ver [[Product Backlog]].

## Source of truth

`app/CLAUDE.md` §"Regras do domínio" (bloco de `product_movements`) ·
`docs/roadmap.md` Fase 1.
Âncoras: `renderStock()`, `renderStockList()`, `renderStockInsights()`,
`openProductModal()`.

## Links

[[Insights]] · [[Product Backlog]] · [[Estado Atual do Produto]]
