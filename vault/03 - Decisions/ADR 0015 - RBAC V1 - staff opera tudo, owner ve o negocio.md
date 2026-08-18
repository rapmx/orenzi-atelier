# ADR 0015 — RBAC V1: staff opera tudo, owner vê o negócio

**Data:** 18/08/2026 · **Status:** aceito

## Contexto

O produto vai ganhar uma segunda pessoa: a assistente da Juliane. A
auditoria de 18/08 mostrou que "autenticado = a Juliane" era o modelo em
vigor e que qualquer sessão autenticada alcançava tudo.

A primeira proposta de arquitetura sugeria restringir colunas de
`appointments` e escopar a agenda por profissional. O requisito real do
produto é o oposto: **a assistente é quem vai operar o sistema todo dia.**

## Decisão

Dois papéis. `staff` tem acesso operacional completo — Agenda, Clientes,
Questionário, Estoque, incluindo criar, editar, remarcar, cancelar,
bloquear horário e **definir o valor final do atendimento**. A única
restrição é gerencial: Insights e Financeiro são capabilities de `owner`.

`staff` **não** é escopada aos próprios atendimentos.

O papel vive em `app_accounts`, tabela sem grant para o browser, lida só por
`current_app_role()`/`is_owner()`. Nunca por e-mail ou nome.

## Alternativas recusadas

- **Escopar por `staff_id`** — tornaria o produto inútil para quem mais o
  usa. Recusada por requisito de produto.
- **Restringir `total_price`/`final_price` para `staff`** — protegeria a
  Insights e quebraria o registro do valor final, que é operacional.
- **RPC agregada owner-only para a Insights** — não acrescenta proteção
  enquanto as linhas operacionais continuam legíveis. Indireção sem ganho.
- **Papel em `staff.role`** — a coluna é rótulo de cargo, a tabela é legível
  por `anon` e era escrevível por qualquer autenticado.

## Consequências

- Uma assistente com devtools consegue recomputar receita a partir dos dados
  operacionais. **Limite conhecido e aceito**; fechá-lo custaria o
  operacional.
- `booking_visits`, único dado exclusivo da Insights, foi fechado na RLS.
- Qualquer backend do Financeiro nasce com `is_owner()`.
- Escrita de catálogo (`services`, `staff`, `staff_services`) fica
  owner-only: é administrativo e o painel não tem tela para isso. Se um dia
  a assistente precisar editar preço pelo app, a decisão se reabre.

## Links

[[RBAC]] · [[Insights]] · [[Financeiro - futuro]] · [[ADR Index]]
