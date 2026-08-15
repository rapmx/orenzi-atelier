# Handoff — Agenda Visual V2 (15/08/2026)

**Commit:** `f36d908` · **Escopo:** só visual. Nenhuma regra de negócio mudou.

## O que entrou

- **Escala única** `PX_PER_MINUTE`; todo `top`/`height` por `minutesToPx()`
- **Altura vem só da duração** — saiu o piso em minutos
- **Card mostra faixa de horário** ("9:00–11:30"), não duração; 24h sem zero à
  esquerda; duração sobrevive só no `aria-label`
- **Pager de dias por arrasto**, trilho 1:1 com o dedo, commit por distância ou
  velocidade
- **Cabeçalho** com mês por extenso e chevron
- **Saiu:** cards de "Xh livres", rótulo da pausa, `renderAgendaGridTransition()`

## O que NÃO foi tocado

Conflito · disponibilidade · gaps · `schedule_blocks` · booking · Stripe ·
Questionário · Clientes · Insights.

`computeFreeGaps()`, `freeSlotLabel()`, `AGENDA_FREE_MIN_MINUTES` e
`openNewApptModalAt()` continuam intactos — saiu **só o desenho**. O que morreu
foi `bindFreeSlotClicks()`, que não tinha mais elemento para amarrar.

## Números que precisam mudar juntos

`--appt-head-h` e `APPT_HEAD_SAFE` 44 → **40**, e
`AGENDA_APPT_COMPACT_MAX_MINUTES` 60 → **45**. Com padding de 8px as duas linhas
medem 36,8px e cabem num card de 45min (43px); com 12px não cabiam.

## Verificado no navegador

09:30 → 0,5000 entre as linhas · 09:40 → 0,6667 · 10:35 → 0,5833 ·
12:30 → 0,5000.

## Links

[[Agenda]] · [[Schedule Availability]]
