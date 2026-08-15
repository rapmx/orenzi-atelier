# ADR 0013 — Bloqueio manual é entidade própria, não appointment fake

- **Data:** 13/08/2026
- **Status:** aceito
- **Decisor:** Raphael

## Contexto

A profissional precisa marcar um período como indisponível (dia inteiro ou
intervalo), com motivo interno opcional.

## Decisão

Tabela `schedule_blocks`. **Não** é appointment com cliente falsa.

## Alternativas consideradas

- **Appointment fake** — descartado: poluiria toda conta de receita, ocupação e
  histórico da cliente, e o trigger `trg_notify_new_appointment` dispararia
  e-mail a cada bloqueio.
- **Bloqueio de salão inteiro** — fora desta fase: `staff_id` é **obrigatório**.
- **Recorrência** — fora desta fase: só bloqueios pontuais.

## Consequências

**"Dia inteiro" é o dia civil local completo** (`Europe/Dublin`): `00:00` do dia
escolhido → `00:00` do seguinte. **Nunca** `09:00`–`18:00` — se o expediente
mudar, um bloqueio de dia inteiro continua significando dia inteiro. Na Agenda
vira **faixa no topo do dia**, nunca um card de `00:00`–`24:00` na timeline
(mentiria sobre a proporção do dia).

**Gap de appointment continua livre:** um bloqueio pode ocupar exatamente a
pausa de um atendimento — a tinta agindo, a profissional livre — sem conflitar
com ele. Só não pode tocar `work_before`/`work_after`.

**Conflito é bidirecional e decidido no banco, nunca só no frontend**, com o
mesmo advisory lock por `staff_id` dos dois lados. Nunca apaga, cancela nem move
o appointment — só recusa e devolve o motivo para a UI mostrar.

**O motivo nunca chega ao Booking público:** `get_busy_slots` devolve só
`busy_start`/`busy_end`, sem `reason`.

**Visual:** hachurado, neutro, **sem barra de destaque** — o oposto semântico da
pausa, que clareia porque "cabe encaixar alguém". Toque abre
`openBlockDetailSheet()`, **não** o Appointment Detail: é outra entidade. Botão
sempre "Remover bloqueio", nunca "Cancelar".

## Reversibilidade

Alta — a tabela é aditiva e nada depende dela para existir.

## Links

[[Schedule Availability]] · [[Agenda]] ·
[[ADR 0006 - Disponibilidade delega tudo a staff_work_blocks]] · [[ADR Index]]
