# ADR 0006 — Disponibilidade delega tudo a `staff_work_blocks`

- **Data:** 08/08/2026 (consolidado em 13/08 e 14/08)
- **Status:** aceito
- **Decisor:** Raphael

## Contexto

Havia quatro consumidores de disponibilidade — o trigger de conflito, a RPC
pública `get_busy_slots`, a ocupação de cadeiras `get_chair_load`, e as RPCs de
criação/reagendamento. Cada tipo novo de ocupação ameaçava exigir mudança nos
quatro.

## Decisão

**Um único `UNION ALL` de intervalos opacos, em `staff_work_blocks()`.** Todo
consumidor delega para lá. `get_busy_slots` é o espelho público (com grant para
`anon`); `staff_work_blocks` é interno e sem grant.

## Alternativas consideradas

- **Cada consumidor com a própria consulta** — foi o estado anterior de fato.
  Descartado: quatro cópias divergem, e a divergência aqui é silenciosa
  (aparece como overbooking, não como erro).
- **Uma view materializada** — descartada: disponibilidade muda a cada INSERT e
  a invalidação seria mais cara que a consulta.

## Consequências

Isto foi o investimento mais rentável do projeto. Dois tipos novos de ocupação
entraram com **zero linha de lógica nova**:

| Ocupação | Data | Custo |
|---|---|---|
| bloqueio manual (`schedule_blocks`) | 13/08/2026 | zero |
| hold de pagamento (`pending` + `hold_expires_at`) | 14/08/2026 | zero |

**Fica mais caro:** qualquer bug em `staff_work_blocks` é um bug em tudo ao
mesmo tempo.

⚠ **Uma exceção existe e mordeu:** `schedule_blocks_guard_conflict()` tem cópia
própria da consulta e **não** delega. Ela precisou ser corrigida separadamente
quando o hold entrou — senão um hold vencido impediria a Juliane de bloquear a
própria agenda. Se surgir um terceiro tipo de ocupação, **esse é o lugar que
vai ser esquecido**.

## Reversibilidade

Alta em teoria, cara na prática: voltar a consultas separadas exigiria
reescrever os quatro consumidores e não há razão para querer isso.

## Links

[[Schedule Availability]] · [[ADR 0012 - Hold como pending, nao entidade nova]] ·
[[ADR 0013 - Bloqueio de agenda e entidade propria]] · [[Supabase e Database]]
