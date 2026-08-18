# Insights

**Estado: encerrado** (commit `42e6e43`). Junto com **Início/Home**, é o
**modelo visual de referência** do app — o padrão que as outras telas foram
levadas a seguir.

⚠ **Redesenho pós-Financeiro pendente (18/08/2026).** Com o [[Financeiro]] em
produção, a divisão passou a ser:

```
Insights   = operational diagnosis      (ocupação, ritmo, €/h)
Financeiro = monetary value evolution   (€ absoluto, ticket, mix, trajetória)
```

O preview `preview/insights-pos-financeiro.html` está **aprovado e não
portado**: hero vira ocupação com barra de capacidade, os indicadores viram
`Atendimentos · Horas ocupadas · Clientes novas · Conversão`, "Tendência" migra
para **Evolução** no Financeiro e "Onde está o dinheiro" vira **Eficiência por
serviço** (só €/h, sem € absoluto).

Até isso acontecer, as duas abas mostram o mesmo valor por caminhos diferentes —
**consequência aceita e temporária**, registrada em
[[ADR 0016 - Financeiro V1 e o valor da agenda]]. Nada da Insights foi tocado
em 18/08 além de ela ser owner-only.

## O que define a tela

**Honestidade das métricas derivadas.** É o princípio explicitamente preservado
pela auditoria de 03/08. Nenhum número aparece se não puder ser sustentado.

**Capacidade só conta dia em que o salão abriu** (`isSalonOpenDay`), e **toda
conta passa por `profissionaisAtivos()`**.

⚠ O bug que gerou essa regra: sem o filtro de ativas, o denominador saía 5×
maior. Num dia com 525 dos 540 minutos reservados o painel mostrava **19% de
ocupação e "36h livres"** num expediente de 9 horas. Com o filtro: 97% e
"Agenda praticamente lotada".

**Ocupação mede contra 9h–18h (540min), não contra a janela de desenho da
timeline (8h–19h).** Medir contra a janela de desenho dava um denominador que o
booking nunca consegue preencher. Ver [[Schedule Availability]].

## Padrão visual que saiu daqui

O card `.appt-modern-card` da Home virou `.list-row` e foi generalizado:
`--color-surface` + borda `--color-divider` + `border-radius: 16px` + leve
elevação ao toque. Estoque, Agenda e Clientes migraram para ele.

Cor de alerta fixada no par `--color-accent-2-100` / `--color-accent-2-700` — o
mesmo vermelho de "Agenda praticamente lotada". **Sem amarelo**: o degrau de
atenção é o caramelo da marca.

## Diferença deliberada em relação à Agenda

A Home **continua mostrando o selo de status** no card de atendimento. A
timeline não. São telas diferentes e a limpeza de 10/08 foi pedida só sobre a
timeline. Ver [[Agenda]].

## Source of truth

Âncoras: `renderHome()`, `renderInsights()`, `computeIndicatorsData()`,
`occupancyPct()`, `monthOccupancyPct()`, `weekOccupancyPct()`, `dayAggregate()`.

## Links

[[Agenda]] · [[Clientes]] · [[Financeiro]] · [[RBAC]] · [[Schedule Availability]] ·
[[Estado Atual do Produto]]
