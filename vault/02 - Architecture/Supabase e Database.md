# Supabase e Database

Projeto: `gsagtsxkhqlpxuvrijgw`.

## As 19 tabelas em produção (verificado 15/08/2026)

| Grupo | Tabelas |
|---|---|
| Agendamento | `appointments`, `appointment_services`, `appointment_events`, `schedule_blocks` |
| Cliente | `clients`, `client_photos`, `client_questionnaires` |
| Catálogo | `services`, `staff`, `staff_services`, `salon_settings` |
| Estoque | `products`, `product_movements` |
| Booking V2 | `booking_operation_requests`, `booking_visits`, `lookup_attempts`, `cancellation_policies` |
| Pagamento | `payments`, `stripe_webhook_events` |

⚠ `app/CLAUDE.md` §Banco lista só 15 — faltam `appointment_events`,
`appointment_services`, `booking_operation_requests` e `cancellation_policies`.
Registrado em [[Technical Debt]].

## Migrations: o local é espelho PARCIAL

`supabase/migrations/` tem **11 arquivos**; o Supabase registra **38**
migrations aplicadas. Só de `booking_v2` (09/08) em diante existe arquivo
local. Tudo anterior — `clients`, `products`, `client_questionnaires`,
`normalize_ie_phone`, `find_or_create_client` — existe **apenas no banco**.

Consequência prática: uma busca no repo por um objeto antigo não acha nada, e
isso não significa que ele não exista. Confirmar no Supabase.

⚠ Os **timestamps dos arquivos locais não batem** com as versões aplicadas
(ex.: local `20260815120000_questionnaire_v2...` vs aplicado `20260814233019`).
Os nomes locais foram escritos à mão. A versão aplicada é a autoridade.

## Convenção de segurança de objeto novo (09/08/2026)

Vale para **o que for criado daqui pra frente**, não é pedido de refactor.

1. **RLS não substitui privilege.** Tabela com RLS e sem policy nega linha, mas
   se o papel tem `SELECT` ela continua exposta na API — responde `200 []` em
   vez de `401`.
2. **`REVOKE ... FROM PUBLIC` não remove `anon`/`authenticated`.** O Supabase
   concede por *default privileges*, com grant próprio. Revogar dos dois papéis
   **explicitamente**. Medido: mesmo após revogar `PUBLIC`, `anon` executou
   `lock_staff_for_booking()` e **adquiriu o lock**.
3. **Helper interno não é API** — não dar `EXECUTE` a `anon`/`authenticated`.
4. **`SECURITY DEFINER` público só quando for deliberadamente RPC pública**, com
   toda validação de confiança feita dentro.
5. **Testar a superfície REAL** com `curl` no PostgREST e a chave anônima. O SQL
   Editor roda como owner e passa em tudo — ele é incapaz de revelar essa classe
   de furo.

Detalhe completo em `app/CLAUDE.md` §"Segurança de objetos novos no Supabase".

## RPCs que importam

| RPC | Para quê |
|---|---|
| `get_busy_slots` | disponibilidade para a página pública (anon) |
| `get_chair_load` | ocupação de cadeiras |
| `staff_work_blocks` | **a autoridade real** de disponibilidade — interna, sem grant |
| `_create_booking_core` | criação de appointment + serviços |
| `create_public_booking[_orchestrated]` | entrada pública de criação |
| `reschedule_booking_by_token[_orchestrated]` | self-service |
| `cancel_booking_by_token[_orchestrated]` | self-service |
| `get_booking_by_token` | leitura do self-service |
| `deposit_for_services(uuid[])` | cálculo do sinal, **no banco** |
| `handle_stripe_event` | efeito do webhook, em transação única |
| `appointment_occupies_agenda` | regra única de hold vencido |
| `find_or_create_client` + `normalize_ie_phone` | dedup de telefone (só no banco) |

## Triggers

- `trg_notify_new_appointment` — dispara Resend a **cada INSERT** em
  `appointments`. ⚠ cuidado com dado de teste.
- `appointments_guard_conflict()` — recusa conflito de bloco de trabalho.
- `trg_schedule_blocks_no_appointment_conflict` — o lado espelho, para bloqueios.

## Chaves

`sb_publishable_*` é pública por desenho e pode ficar no código.
`service_role`, `sk_test_`, `whsec_` e a chave da Resend **nunca** entram no
repo — vivem como secrets das Edge Functions. A chave da Resend está em
`C:\Users\schul\.secrets\` (fora do projeto).

## Links

[[Booking Architecture]] · [[Schedule Availability]] · [[Edge Functions]] ·
[[Payments - Stripe]] · [[Technical Debt]]
