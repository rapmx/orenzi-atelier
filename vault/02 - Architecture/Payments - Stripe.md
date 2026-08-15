# Payments — Stripe

**Estado: SANDBOX. Implementação fechada, operação bloqueada.**

> ⚠ **LIVE PAYMENTS BLOCKED UNTIL CANCELLATION POLICY V2 IS APPROVED.**

## Por que está bloqueado

A cancellation policy v1, em produção, promete **taxa fixa de €16** e diz que
"o sinal é descontado de qualquer taxa de cancelamento". Com depósito de 20%,
um serviço de €290 gera sinal de €58 — descontar €58 de uma taxa de €16
implica **devolver dinheiro** em cancelamento tardio. É uma regra financeira
que ninguém decidiu.

Sandbox pode rodar sob a v1. Produção não.

**Guard técnico:** as duas Edge Functions recusam qualquer `STRIPE_SECRET_KEY`
que não comece com `sk_test_`. Não é só documentação — é código.

Ver [[Production Blockers]] e [[Waiting on Juliane]].

## Depósito = 20% do valor BASE

Calculado **no banco** por `deposit_for_services(uuid[])` → `total_cents`,
`deposit_cents`. O browser nunca manda preço; o `amount` do Stripe nunca deriva
do frontend.

⚠ **Copy:** serviços com `price_varies = true` usam o mesmo campo numérico, que
é o valor **base/mínimo**. Highlights cobra 20% de €290 mesmo podendo custar
€370. A copy do Review diz **"20% do valor base"** — nunca "do valor final".
Dizer "final" ali seria falso em **9 dos 15 serviços**.

## Hold = `status='pending'` + `hold_expires_at`

Não é entidade nova. Escolhido porque `staff_work_blocks` já contava `pending`
como ocupado — ver [[ADR 0006 - Disponibilidade delega tudo a staff_work_blocks]].

- TTL 12min, estendido para 15 quando o PaymentIntent nasce (3DS demora).
- **Expiração é preguiçosa, na leitura** — `appointment_occupies_agenda()` é a
  regra única. **Não existe cron**, e não pode passar a existir como mecanismo
  de correção: seria só limpeza cosmética.
- `schedule_blocks_guard_conflict()` tem cópia própria da consulta e precisou
  ser corrigida também — senão um hold vencido impediria a Juliane de bloquear
  a própria agenda.
- **Hold não aparece na agenda** (decisão de produto): `loadAppointments()`
  separa `state.paymentHolds` de `state.appointments`. O único ponto que
  precisa saber é `busyBlocksForStaffOnDate()`, e é sobre disponibilidade.

## Confirmação é do servidor

`stripe.confirmPayment()` resolver sem erro **não é "confirmado"**. Quem
confirma é o webhook, dentro de `handle_stripe_event` (transação única).

O browser faz polling de `booking_state` (~1s por 15s) e, se o webhook demorar,
mostra estado intermediário **honesto** — nunca erro, nunca sucesso falso.
Ver [[ADR 0008 - Confirmacao pelo webhook, nunca pelo browser]].

## Nenhum refund automático

`charge.refunded` só **registra** o que o Stripe já fez. "Pagou e o horário
sumiu" vira `payments.status='needs_manual_refund'` + log — nunca estorno por
conta própria.

## `manage_token` é rotacionado na confirmação

O token do hold nunca sai do banco. `handle_stripe_event` gera um novo, que
existe só em memória → corpo do e-mail → fim. Consequência: a tela de sucesso
**não** tem o token e cai no caminho "use o link enviado por e-mail".

## Chaves

| Chave | Onde | Público? |
|---|---|---|
| `pk_test_` | `app/agendar.html` | sim, por desenho do Stripe |
| `sk_test_` | secret da Edge Function | **não** |
| `whsec_` | secret da Edge Function | **não** |
| `client_secret` | vai ao browser | nunca gravado nem logado |

## Source of truth

`app/CLAUDE.md` §"Depósito de 20% + slot hold" ·
`supabase/functions/stripe-webhook/index.ts` ·
`supabase/migrations/20260814120000_stripe_deposit_sandbox_foundation.sql`

## Links

[[Booking Architecture]] · [[Production Blockers]] · [[Edge Functions]] ·
[[Waiting on Juliane]]
