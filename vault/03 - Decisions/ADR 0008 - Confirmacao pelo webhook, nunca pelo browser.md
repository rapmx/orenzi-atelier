# ADR 0008 — Confirmação de pagamento é do webhook, nunca do browser

- **Data:** 14/08/2026
- **Status:** aceito
- **Decisor:** Raphael

## Contexto
`stripe.confirmPayment()` resolve no browser. É tentador tratar isso como
"pago" e mostrar sucesso.

## Decisão
**Quem confirma é o webhook**, dentro de `handle_stripe_event`, em transação
única. O browser faz polling de `booking_state` (~1s por 15s).

## Alternativas consideradas
- **Confirmar no retorno de `confirmPayment()`** — descartado: o browser pode
  fechar, perder rede ou mentir. O dinheiro entra no Stripe, não no browser.
- **Bloquear a tela até o webhook chegar** — descartado: 3DS e latência de
  webhook tornariam isso uma espera indefinida.

## Consequências
Se o webhook demorar, a tela mostra **estado intermediário honesto** — nunca
erro, nunca sucesso falso. O dinheiro entrou e o horário já é dela.

**Efeito colateral aceito:** `manage_token` é rotacionado na confirmação e
existe só em memória → corpo do e-mail → fim. Por isso a tela de sucesso **não
tem o token** e cai no caminho "use o link enviado por e-mail".

Idempotência atravessa tudo pela mesma `request_key`:
`booking_operation_requests` (uma operação) · `pi:{request_key}` (um
PaymentIntent) · `stripe_webhook_events.event_id` PK (um efeito) ·
`created:{request_key}` (um e-mail).

## Reversibilidade
Nenhuma desejável. Confiar no browser aqui é a definição do bug.

## Links
[[Payments - Stripe]] · [[Booking Architecture]] · [[Edge Functions]] · [[ADR Index]]
