# Notifications

**O que é.** E-mail transacional via **Resend**. Não há SMS nem WhatsApp
implementado.

## Dois caminhos, e um deles é histórico

| Caminho | Quando dispara | Estado |
|---|---|---|
| Trigger `trg_notify_new_appointment` | **todo INSERT** em `appointments` | ativo, chama `send-appointment-email` |
| `stripe-webhook` → e-mail `created` | após `payment_intent.succeeded` | ativo, é o caminho do Booking com sinal |

⚠ **Cuidado ao inserir dado de teste em `appointments`** — o trigger dispara
e-mail de verdade.

O e-mail `created` **saiu da Edge do booking e foi para o webhook** (14/08):
só é enviado depois do pagamento confirmar. Ganhou total / sinal pago / saldo
restante.

## Idempotência

`created:{request_key}` como chave no Resend — um e-mail por operação, mesmo
que o webhook reentregue.

## Bloqueador ativo

**O domínio `orenziatelier.com` não está verificado na Resend.** Enquanto isso,
os e-mails de agendamento só chegam ao dono da conta — a cliente real não
recebe.

Isso é bloqueador de produção, não detalhe. Ver [[Production Blockers]] e
[[Waiting on Juliane]].

## Credencial

`RESEND_API_KEY` vive como secret da Edge Function. Cópia local **fora do
projeto**, em `C:\Users\schul\.secrets\orenzi-resend-api-key.txt`.
Nunca no repo, nunca neste vault.

## Não implementado

- WhatsApp Business — depende de setup da Juliane
- SMS — não está no escopo
- lembrete pré-atendimento — não decidido
- notificação para a Juliane no painel — não existe

## Links

[[Edge Functions]] · [[Production Blockers]] · [[Waiting on Juliane]] ·
[[Booking Architecture]]
