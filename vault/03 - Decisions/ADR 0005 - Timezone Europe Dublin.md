# ADR 0005 — Todo horário é `Europe/Dublin`

- **Data:** 27/07/2026 (reforçado em 13/08/2026 após bug em produção)
- **Status:** aceito
- **Decisor:** Raphael

## Contexto
O expediente é o do salão, em Dublin. Quem agenda pode estar em qualquer fuso.

## Decisão
Todo instante é construído e lido em `Europe/Dublin`, nunca no fuso do
aparelho. `salonTimeToInstant()`, `salonToday()`, `salonClock()`.

## Consequências — as duas armadilhas

**Ida.** Nunca `new Date('YYYY-MM-DDT00:00:00')` — isso é meia-noite no fuso do
celular. Um telefone no horário do Brasil gravava "9h" como 13h em Dublin,
**sem erro nenhum**.

**Volta (bug real, 13/08/2026).** A Juliane tocava `22/08` e o atendimento era
gravado em `21/08`. Causa: `d.toISOString().split('T')[0]` sobre meia-noite
local. Em Dublin no horário de verão (IST, UTC+1) esse instante é
`23:00 UTC do dia anterior`.

Três coisas tornaram isso especialmente cruel:
- o número na tela vinha de `d.getDate()` (local, correto) — só o `data-date`
  mentia. Não era bug de exibição: a data errada era **persistida**;
- **só existe metade do ano** — no inverno Dublin é UTC+0 e o fatiamento acerta.
  Por isso passou por várias revisões sem aparecer;
- falha **silenciosa e coerente**: horários, review, confirmação e banco
  concordavam entre si, todos no dia errado.

**Regra:** data civil sai de `dateInputValue(d)` (componentes locais), nunca de
`toISOString()`. `toISOString().slice(0,10)` só é seguro sobre um `Date`
construído com `Date.UTC(...)` — é o que `agendar.html` faz, e é por isso que o
Booking público nunca teve este bug.

## Reversibilidade
Nenhuma. É requisito, não preferência.

## Links
[[Schedule Availability]] · [[Booking Experience]] · [[ADR Index]]
