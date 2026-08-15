# ADR 0012 — Hold de pagamento é `pending`, não entidade nova

- **Data:** 14/08/2026
- **Status:** aceito
- **Decisor:** Raphael

## Contexto

Com sinal obrigatório, o horário precisa ficar reservado enquanto a cliente
paga — sem que outra pessoa o tome no meio.

## Decisão

**`appointments.status = 'pending'` + `hold_expires_at`.** Nenhuma tabela nova.
TTL 12min, estendido para 15 quando o PaymentIntent nasce (3DS demora).

## Alternativas consideradas

- **Tabela `slot_holds`** — descartada pelo argumento decisivo:
  `staff_work_blocks` **já contava `pending` como ocupado**. Com hold como
  status, o guard de conflito, `get_busy_slots`, `get_chair_load` e as RPCs de
  criação/reagendamento passaram a respeitar hold sem **uma linha de lógica
  nova**. Ver [[ADR 0006 - Disponibilidade delega tudo a staff_work_blocks]].
- **Cron de expiração** — descartado, e **não pode voltar como mecanismo de
  correção**. A expiração é **preguiçosa, na leitura**:
  `appointment_occupies_agenda(status, hold_expires_at)` é a regra única. Um
  cron seria só limpeza cosmética; se a correção depender dele, existe uma
  janela em que o banco mente.

## Consequências

- **Hold NÃO aparece na agenda** (decisão de produto): `loadAppointments()`
  separa `state.paymentHolds` de `state.appointments`. O resto do painel não
  sabe que hold existe.
- O único ponto que precisa saber é `busyBlocksForStaffOnDate()`, e é sobre
  **disponibilidade** — o modal de novo agendamento não pode oferecer horário
  reservado.
- Hold vencido **não entra** nem em `state.paymentHolds` — a tela tem que
  concordar com o banco.
- ⚠ `schedule_blocks_guard_conflict()` tem cópia própria da consulta e precisou
  ser corrigida à parte: sem isso, um hold vencido impediria a Juliane de
  bloquear a própria agenda.
- `pending` na timeline **não ganha selo**: o status existe no schema mas o
  produto não definiu quando um agendamento deveria ficar pendente, e um selo
  inventaria o significado junto.

## Reversibilidade

Média. Migrar para tabela própria exigiria reescrever os quatro consumidores de
disponibilidade — exatamente o custo que esta decisão evitou.

## Links

[[Payments - Stripe]] · [[Schedule Availability]] · [[Agenda]] · [[ADR Index]]
