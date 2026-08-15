# Schedule Availability

**O que é.** A regra única de "este horário está livre?". É o coração do
sistema e a parte com mais decisões congeladas.

## A decisão que faz tudo caber

**Toda disponibilidade delega para `staff_work_blocks()`.** Ela devolve um
`UNION ALL` de intervalos opacos, e por isso cada tipo novo de ocupação
custou quase nada:

| Tipo de ocupação | Entrou em | Linhas de lógica nova |
|---|---|---|
| bloco de trabalho de appointment | origem | — |
| bloqueio manual (`schedule_blocks`) | 13/08/2026 | **zero** |
| hold de pagamento (`pending` + `hold_expires_at`) | 14/08/2026 | **zero** |

`get_busy_slots` (pública, anon) espelha `staff_work_blocks` (interna).
`appointments_guard_conflict()`, `get_chair_load` e todas as RPCs de criação e
reagendamento já liam de lá.

Isso é [[ADR 0006 - Disponibilidade delega tudo a staff_work_blocks]] — o
argumento de arquitetura mais rentável do projeto.

## Modelo de segmentos

Um atendimento tem até três partes:

```
work_before_minutes → gap_minutes → work_after_minutes
     (trabalho)      (tinta agindo)    (finalização)
```

**Durante a pausa a profissional e a cadeira ficam livres.** É isso que permite
encaixar outra cliente dentro dela.

**Conflito só existe quando um bloco de TRABALHO encosta em outro.** Pausa
sobre pausa, ou trabalho dentro de pausa alheia, é permitido — e é o ponto.

Leitura sempre `a.campo ?? s.campo ?? default`.

## Expediente

**9h–18h, fecha domingo e segunda.** O atendimento tem que **terminar** até 18h.

Duas faixas convivem e não podem ser confundidas:

| Constante | Valor | Serve pra |
|---|---|---|
| `OPEN_HOUR`/`CLOSE_HOUR`/`WORK_MINUTES_PER_DAY` | 9h–18h (540min) | **contas** — ocupação, capacidade |
| `AGENDA_START_HOUR`/`AGENDA_END_HOUR` | 8h–19h | **desenho** — altura da timeline |

Medir ocupação contra 8h–19h dava denominador que o booking nunca preenche.

⚠ **O expediente está duplicado em três lugares**: `app/shared/salon.js` (o que
a UI desenha), `is_public_booking_window()` no SQL (o que a RLS **aceita**), e
o painel. Mudar num só quebra silenciosamente. Ver
[[ADR 0007 - Expediente duplicado entre JS e SQL, aceito]].

## Fuso — `Europe/Dublin`

**A armadilha mais cara do projeto**, e ela morde nos dois sentidos.

**Ida:** nunca construir horário com `new Date('YYYY-MM-DDT00:00:00')` — isso é
meia-noite no fuso do celular. Um telefone no horário do Brasil gravava "9h"
como 13h em Dublin, **sem erro nenhum**. Use `salonTimeToInstant()`.

**Volta (bug real em produção, 13/08/2026):** a Juliane tocava `22/08` e o
atendimento era gravado em `21/08`. Causa: `d.toISOString().split('T')[0]` sobre
meia-noite **local**. Em Dublin no horário de verão (IST, UTC+1) esse instante é
`23:00 UTC do dia anterior`.

Três coisas tornaram isso cruel:
- o número na tela vinha de `d.getDate()` (correto) — só o `data-date` mentia;
- **só existe metade do ano** — no inverno Dublin é UTC+0 e o bug some;
- falha silenciosa e **coerente**: tela, e-mail e banco concordavam, todos no
  dia errado.

**Regra:** data civil sai de `dateInputValue(d)` (componentes locais), nunca de
`toISOString()`. Ver [[ADR 0005 - Timezone Europe Dublin]].

## Só a Juliane atende

Outras profissionais existem com `active = false`, mantidas por histórico.
Onde há uma só ativa, a escolha some da interface.

⚠ **Toda conta de capacidade passa por `profissionaisAtivos()`.** Nunca
`state.staff.length` — a lista traz cinco e o denominador saía 5× maior. Num
dia com 525 dos 540 minutos reservados o painel mostrava **19% de ocupação e
"36h livres"** num expediente de 9 horas. Com o filtro: 97%.

## Source of truth

`app/CLAUDE.md` §"Regras do domínio" e §"Bloqueio manual de agenda".
Navegação: `graphify query "schedule blocks availability busy slots"`.

## Links

[[Agenda]] · [[Booking Architecture]] · [[Payments - Stripe]] ·
[[Supabase e Database]] · [[Handoff 2026-08-13 Schedule Blocks]]
