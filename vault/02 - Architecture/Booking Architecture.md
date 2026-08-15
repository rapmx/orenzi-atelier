# Booking Architecture

**O que é.** A divisão de responsabilidade entre browser, Edge Function e
Postgres no agendamento.

## A regra em uma linha

> Browser = UX. Edge = orquestração + notificação. RPC = **autoridade de
> negócio**.

Está escrita no topo de `supabase/functions/booking-orchestrator/index.ts` e é
a decisão estrutural mais importante do projeto.

**Por quê.** A página da cliente roda com a chave anônima, em ambiente que ela
controla. Preço, duração, disponibilidade e elegibilidade **nunca** são aceitos
do browser — são calculados dentro de funções `SECURITY DEFINER` no banco. Sem
isso, um sinal de €58 vira €0,58 mudando um campo no DevTools.

## As três camadas

| Camada | Onde | O que pode | O que nunca faz |
|---|---|---|---|
| Browser | `app/agendar.html`, `app/gerenciar.html` | desenhar, coletar, chamar | decidir preço, duração ou disponibilidade |
| Edge | `booking-orchestrator`, `stripe-webhook` | orquestrar, falar com Stripe/Resend, guardar o `service_role` | conter regra de negócio |
| Postgres | RPCs `SECURITY DEFINER` + triggers | **decidir** | confiar em argumento do browser |

## Fluxo de criação (hoje)

```
agendar.html
  └─ sb.functions.invoke('booking-orchestrator', { event_type: 'payment_intent' })
       └─ RPC create_public_booking_orchestrated
            └─ _create_booking_core
                 ├─ lock_staff_for_booking   (advisory lock por staff_id)
                 ├─ staff_work_blocks        (disponibilidade — a autoridade)
                 ├─ INSERT appointments      (status 'pending' + hold_expires_at)
                 └─ INSERT appointment_services
       └─ Stripe PaymentIntent  (Idempotency-Key = pi:{request_key})
  └─ Payment Element → stripe.confirmPayment()
  └─ polling de booking_state (~1s por 15s)

Stripe ──webhook──> stripe-webhook
                      └─ RPC handle_stripe_event  (transação única)
                           ├─ appointments.status = 'confirmed'
                           ├─ payments
                           ├─ rotaciona manage_token
                           └─ dispara e-mail 'created' (Resend)
```

**A confirmação é do servidor, nunca do browser.** `confirmPayment()` resolver
sem erro não é "confirmado" — ver [[Payments - Stripe]] e
[[ADR 0008 - Confirmacao pelo webhook, nunca pelo browser]].

## Idempotência

Uma `request_key` atravessa hold → PaymentIntent → confirmação:

| Camada | Garantia | Como |
|---|---|---|
| operação | uma só | `booking_operation_requests` |
| PaymentIntent | um só | `pi:{request_key}` como Idempotency-Key |
| efeito do webhook | um por evento | `stripe_webhook_events.event_id` é PK |
| e-mail | um só | `created:{request_key}` no Resend |

## Self-service

`app/gerenciar.html` entra por `manage_token` na URL:
`get_booking_by_token` → `reschedule_booking_by_token` /
`cancel_booking_by_token` (e as variantes `_orchestrated` via Edge).

O token bruto **nunca** é gravado nem logado: trafega HTTPS → memória da Edge →
corpo do e-mail → fim. É rotacionado a cada confirmação.

## Source of truth

- regra de negócio detalhada → `app/CLAUDE.md` §"Depósito de 20% + slot hold"
- implementação → `supabase/functions/booking-orchestrator/index.ts`,
  `supabase/migrations/2026081*_booking_v2_*.sql`
- navegação → `graphify path "commitBooking()" "public.create_public_booking_orchestrated()"`

## Pendências

- Live payments bloqueado — [[Production Blockers]]
- `event_type: 'created'` (caminho sem pagamento) ainda existe na Edge e na RPC,
  mas o Booking público não usa. É porta dos fundos se alguém reativar —
  ver [[Technical Debt]].

## Links

[[Payments - Stripe]] · [[Schedule Availability]] · [[Edge Functions]] ·
[[Supabase e Database]] · [[Booking Experience]]
