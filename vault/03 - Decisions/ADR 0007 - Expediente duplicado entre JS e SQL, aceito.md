# ADR 0007 — Expediente duplicado entre JS e SQL, aceito conscientemente

- **Data:** 08/08/2026
- **Status:** aceito (dívida deliberada)
- **Decisor:** Raphael

## Contexto
`shared/salon.js` centralizou `OPEN_HOUR`/`CLOSE_HOUR`/`SLOT_MINUTES`/
`CLOSED_WEEKDAYS` para as três páginas. Depois a migration
`harden_public_appointment_insert` acrescentou `is_public_booking_window()`
como proteção server-side do INSERT anônimo — com **sua própria cópia
hardcoded** do expediente.

## Decisão
Aceitar a duplicação enquanto o Orenzi for single-establishment.

## Alternativas consideradas
- **Config lida do banco pelos dois lados** — a solução correta. Descartada
  **por ora**: para um salão só, acrescenta uma consulta em todo caminho de
  desenho para eliminar uma duplicação de quatro constantes.
- **Gerar o SQL a partir do JS** — descartado: exigiria um passo de build, que
  o [[ADR 0002 - Sem build, sem framework]] recusa.

## Consequências
São papéis **diferentes**, e é isso que torna a duplicação perigosa:
- `shared/salon.js` é o que a **UI desenha**;
- `is_public_booking_window()` é o que o **banco aceita**.

**Mudar expediente exige revisar os dois.** Mudar só o JS faz a UI oferecer
horário que a RLS recusa (a cliente vê "não foi possível confirmar" sem
entender). Mudar só o SQL faz o banco aceitar horário que a UI nunca oferece.

O painel tem a terceira cópia, via `OrenziSalon`.

## Reversibilidade
A centralização definitiva fica para quando o produto virar
multi-estabelecimento, com expedientes diferentes por salão. **Esse é o gatilho**
— não "quando sobrar tempo".

## Links
[[Schedule Availability]] · [[Technical Debt]] · [[ADR Index]]
