# ADR 0004 — Cor do atendimento por categoria de serviço

- **Data:** 02/08/2026
- **Status:** aceito
- **Decisor:** Raphael (decisão D1 do roadmap Fase 2)

## Contexto
A cor do card na agenda vinha de `colorForStaff()` — hash do profissional.

## Decisão
`colorForService()`, com paleta fixa pelas **5 categorias reais**
(Alisamento, Coloração, Corte, Outros, Tratamentos).

## Alternativas consideradas
- **Manter por profissional** — descartado por um achado no caminho: com só a
  Juliane ativa, `colorForStaff()` devolvia **a mesma cor para tudo**. A agenda
  já era monocromática; não era "cor errada", era ausência de cor.
- **Cor por status** — descartado: status já é comunicado por texto, e cor sem
  rótulo vira legenda invisível (mesmo motivo que matou a `.status-dot`).

## Consequências
A paleta **evita o vermelho** de `--color-accent-2`, reservado para alerta.
A mesma correção foi aplicada em Início → "Próximos horários", que tinha o
mesmo defeito.

## Reversibilidade
Trivial — é uma função de cor.

## Links
[[Agenda]] · [[Insights]] · [[ADR Index]]
