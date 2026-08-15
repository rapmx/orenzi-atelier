# ADR 0009 — Reagendamento é evento, não UPDATE destrutivo

- **Data:** 09/08/2026
- **Status:** aceito
- **Decisor:** Raphael

## Contexto
A cliente pode remarcar sozinha por `manage_token`. Um UPDATE direto em
`appointments` apagaria o horário original.

## Decisão
`appointment_events` guarda o histórico. `reschedule_booking_by_token`
(e a variante `_orchestrated`) registra o evento além de mover o agendamento.

## Alternativas consideradas
- **UPDATE direto** — descartado: sem histórico não há como responder "quantas
  vezes ela remarcou" nem auditar um horário disputado.
- **Cancelar + criar novo** — descartado: quebraria a continuidade do
  `manage_token` e do pagamento já feito.

## Consequências
`appointments` guarda o estado corrente; `appointment_events` guarda a
trajetória. Qualquer relatório de comportamento da cliente (remarcações
frequentes) já tem o dado — mesmo que a tela ainda não exista.

⚠ `appointment_events` **não está listada** em `app/CLAUDE.md` §Banco.
Ver [[Technical Debt]].

## Reversibilidade
Alta — a tabela pode ser ignorada sem quebrar nada. Mas o dado perdido não volta.

## Links
[[Booking Experience]] · [[Booking Architecture]] · [[Supabase e Database]] · [[ADR Index]]
