# Handoff — Stripe depósito sandbox (14/08/2026)

**Commit:** `d342808` · **Migration aplicada:** `20260814171351` ·
**Estado: SANDBOX. Live bloqueado.**

## O que entrou

- `deposit_for_services(uuid[])` — 20% do valor **base**, calculado no banco
- Hold = `appointments.status='pending'` + `hold_expires_at` (12min → 15min)
- `appointment_occupies_agenda()` — regra única de expiração preguiçosa
- Edge Function nova `stripe-webhook` (v4, `verify_jwt=false`)
- `handle_stripe_event()` — efeito em transação única
- Tabelas `payments` e `stripe_webhook_events`
- E-mail `created` migrou da Edge do booking para o webhook

## Decisões tomadas nesta rodada

- [[ADR 0008 - Confirmacao pelo webhook, nunca pelo browser]]
- [[ADR 0012 - Hold como pending, nao entidade nova]]
- Nenhum refund automático — `charge.refunded` só registra
- `manage_token` rotacionado na confirmação

## Bloqueio deixado de propósito

**LIVE PAYMENTS BLOCKED UNTIL CANCELLATION POLICY V2 IS APPROVED.**
As duas Edge Functions recusam chave que não comece com `sk_test_`.
Ver [[Production Blockers]].

## Armadilha achada e resolvida

**Payment Element não sobrevive a `innerHTML`.** `renderStepBody()` desenha a
casca uma vez por abertura; só `updatePayStatus()` escreve depois. Medido:
1 mount em 7 renders. O dano seria perder o formulário de cartão no meio da
digitação.

## Links

[[Payments - Stripe]] · [[Booking Architecture]] · [[Production Blockers]]
