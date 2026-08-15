# Insights

**Estado: encerrado** (commit `42e6e43`). Junto com **Início/Home**, é o
**modelo visual de referência** do app — o padrão que as outras telas foram
levadas a seguir.

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

[[Agenda]] · [[Clientes]] · [[Schedule Availability]] · [[Estado Atual do Produto]]
