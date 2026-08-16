# Financeiro — futuro

**Estado: CONCEITO. Sem escopo, sem decisão, sem código.**

## O que existe hoje que toca dinheiro

| Peça | Estado |
|---|---|
| `services.price` (+ `price_varies`) | em produção |
| `deposit_for_services()` — 20% do valor base | em produção, **sandbox** |
| `payments` | em produção, **sandbox** |
| `cancellation_policies` | tabela existe; a **policy v1** está em produção |
| receita nos Insights | `total_price ?? services.price` desde 16/08/2026 |

## Três coisas que precisam ser decididas antes de qualquer tela financeira

1. **Cancellation Policy V2.** Trava tudo. A v1 promete taxa fixa de €16 com o
   sinal descontado — com sinal de 20% isso implica devolver dinheiro.
   Ver [[Production Blockers]].

2. **Valor editável por atendimento.** Adiado em 03/08 (D2: *não agora*).
   Exigiria `appointments.price` e mudaria **toda** conta de receita para
   `a.price ?? s.price`. Enquanto isso não existe, "receita" no app é sempre o
   preço de tabela — que para 9 dos 15 serviços é o **piso**, não o cobrado.

3. **O que "receita" significa.** Sinal recebido? Valor cobrado no salão?
   Os dois? Hoje o app não distingue, e qualquer tela financeira teria que
   distinguir.

## Não confundir com Product Map / SaaS

São coisas diferentes. Product Map é a frente de produto-como-serviço, e está
explicitamente **depois** do Orenzi estar finalizado. Financeiro é uma tela
dentro do Orenzi.

## Links

[[Payments - Stripe]] · [[Production Blockers]] · [[Product Backlog]] ·
[[Insights]]
