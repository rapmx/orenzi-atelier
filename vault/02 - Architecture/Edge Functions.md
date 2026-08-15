# Edge Functions

**Três ativas em produção, todas com fonte no repositório** (desde 15/08/2026).

| Slug | Versão | `verify_jwt` | Fonte |
|---|---|---|---|
| `booking-orchestrator` | v7 | `true` | `supabase/functions/booking-orchestrator/index.ts` |
| `stripe-webhook` | v4 | `false` | `supabase/functions/stripe-webhook/index.ts` |
| `send-appointment-email` | v8 | `false` | `supabase/functions/send-appointment-email/index.ts` |

`send-appointment-email` rodava **sem fonte versionada** até 15/08/2026 — a
fonte exata da v8 foi puxada do Supabase e gravada sem alteração de
comportamento, sem redeploy. É a função que o trigger
`trg_notify_new_appointment` aciona.

## `send-appointment-email` — o que ela faz

Autenticação por **segredo compartilhado** (`x-webhook-secret` == `WEBHOOK_SECRET`),
só entre o gatilho do banco e ela — sem isso qualquer um na internet a
chamaria. Recebe `client_name`, `client_email`, `service_name`, `staff_name`,
`starts_at` e manda o e-mail de confirmação pela Resend.

⚠ **Formata no fuso do salão, não no do servidor.** O Deno da Supabase roda em
UTC; sem `timeZone` explícito o e-mail mostrava **uma hora a menos** que a tela
no horário de verão irlandês, e um agendamento na primeira meia hora do dia
aparecia com a **data do dia anterior**. O instante gravado sempre esteve certo
— só a apresentação estava errada. Usa IANA (`Europe/Dublin`), nunca offset
fixo: `UTC+1`/`GMT`/`IST` quebrariam duas vezes por ano. Mesma família de
armadilha do [[ADR 0005 - Timezone Europe Dublin]].

`resolveTimezone()` já aceita um `timezone` vindo no payload — preparado para
multi-tenant sem precisar de deploy novo. Enquanto isso cai no padrão do salão.

⚠ Remetente ainda é `onboarding@resend.dev`, não o domínio do salão — ver
[[Production Blockers]].

## Por que o booking e o webhook são duas, e não uma

As duas são públicas mas autenticam de formas **incompatíveis**:

- `booking-orchestrator` — chamada pelo **browser** da cliente, com JWT do Supabase;
- `stripe-webhook` — chamada pelo **Stripe**, autenticada só por assinatura HMAC,
  e precisa do corpo **cru** (`req.text()`).

Juntar as duas seria uma superfície com dois modelos de auth e um parser
condicional. Separadas, cada uma tem uma regra só.

`verify_jwt = false` no webhook **não é buraco**: sem assinatura válida do
Stripe nada é lido do payload — a verificação acontece antes de qualquer uso.

## O que só existe aqui

O `service_role` key. Nunca no browser. O `manage_token` bruto trafega
HTTPS → memória da function → corpo do e-mail → fim: nunca toca `pg_net`,
nunca uma tabela, nunca um log do Postgres.

## Import dinâmico do Stripe — decisão deliberada

`booking-orchestrator` carrega o Booking público inteiro
(`created`/`rescheduled`/`cancelled`) e já está em produção. Um `import`
estático de `npm:stripe` que falhasse ao resolver derrubaria **também** o
agendamento, que não tem nada a ver com pagamento.

Com import dinâmico, no pior caso só o caminho de pagamento cai — e cai
devolvendo **503, não 500**.

## Configuração

Por env/secret, nunca editando o arquivo:
`MANAGE_BASE_URL`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
`RESEND_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.

`MANAGE_BASE_URL` tem default `https://orenziatelier.com/gerenciar.html` — que
**não é onde o app está hospedado** (Vercel). Definir o secret quando o domínio
de produção existir. Ver [[Waiting on Juliane]].

## Eventos tratados pelo webhook

`payment_intent.succeeded` · `payment_intent.payment_failed` ·
`payment_intent.canceled` · `charge.refunded`

Qualquer outro recebe **200 e é ignorado**: devolver erro faria o Stripe
reentregar por 3 dias um evento que nunca vai ser processado.

## Links

[[Booking Architecture]] · [[Payments - Stripe]] · [[Notifications]] ·
[[Technical Debt]]
