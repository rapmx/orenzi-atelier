# Insights

**Estado: V2 pós-Financeiro em produção desde 18/08/2026.** Aba owner-only.

```
Insights   = operational diagnosis
Financeiro = monetary value evolution
```

Junto com **Início/Home**, continua sendo o **modelo visual de referência** do
app — o padrão que as outras telas foram levadas a seguir.

## A pergunta da aba

*Como o salão está operando, o que está acontecendo e onde existe oportunidade
de melhorar?*

Ela **não** responde "quanto vale a agenda". Isso passou a ser do
[[Financeiro]] em 18/08/2026, e a separação é definitiva:

| Bloco | Onde vive | Por quê |
|---|---|---|
| Ocupação, capacidade, ritmo, espaço livre | **Insights** | não tem quantia nenhuma |
| €/h de cadeira | **Insights** | é produtividade de cadeira |
| € absoluto por serviço, participação % | **Financeiro** | é "quanto vale" |
| Ticket, evolução do valor, histórico monetário | **Financeiro** | idem |

## O que define a tela

**Honestidade das métricas derivadas.** É o princípio preservado desde a
auditoria de 03/08: nenhum número aparece se não puder ser sustentado.

Foi esse princípio que forçou a correção mais fina desta rodada. O Hero
mostrava **81% de ocupação** com a legenda **"7h ocupadas de 9h"** — e 7/9 é
78%. As horas passaram a não ser arredondadas na origem: hoje a legenda diz
`7,3h de 9h`, que sustenta os 81%. Ver `insFmtHoras()`.

**Capacidade só conta dia em que o salão abriu** (`isSalonOpenDay`), e **toda
conta passa por `profissionaisAtivos()`**.

⚠ O bug que gerou essa regra: sem o filtro de ativas, o denominador saía 5×
maior. Num dia com 525 dos 540 minutos reservados o painel mostrava **19% de
ocupação e "36h livres"** num expediente de 9 horas.

**Ocupação mede contra 9h–18h (540min)**, não contra a janela de desenho da
timeline (8h–19h). Ver [[Schedule Availability]].

**Delta de ocupação em pontos percentuais.** 22% → 27% é `+5 p.p.`, nunca
`+23%` — a tela gira em torno de uma taxa, e tratar a variação de uma taxa como
variação percentual é o erro clássico dessa família de indicador.

## Ordem dos blocos

```
Período → Hero (ocupação) → Indicadores → Considerações → Sugestões
        → Onde há espaço → Eficiência por serviço → Como as clientes chegam
```

Considerações e Sugestões vêm **antes** dos blocos de evidência: são a única
parte da tela que já fez a leitura pela usuária. Os blocos abaixo existem para
conferir essa leitura.

## Year-to-date no Ano

O Ano é **YTD** — 1º de janeiro até agora, comparado com o mesmo ponto do ano
anterior. Setembro–dezembro **não** entram como "hora livre" de um acumulado em
agosto: não se conta capacidade de um período que ainda não começou.

Vale para o Hero **e** para o "Onde há espaço", que no Ano mostra só os meses
já iniciados — as duas janelas coincidem de propósito.

## Passado vazio ≠ futuro vazio

```
passado vazio = ociosidade   (um fato)
futuro vazio  = oportunidade (ainda dá para vender)
```

Os dois nunca são somados. No **Mês** a janela do "Onde há espaço" vai além da
do Hero — espaço daqui a duas semanas ainda é acionável — e as fatias futuras
saem com **contorno tracejado**, nunca preenchidas. Na **Semana** o mesmo. No
**Ano** não existe fatia futura.

## Eficiência por serviço

Sucessora de "Onde está o dinheiro". Só **€/h de cadeira**: valor absoluto e
participação foram para o Financeiro.

Dois pisos de amostra, com papéis diferentes — `INS_MIN_SERVICO` (4) para o app
**afirmar** algo sobre um serviço; `insMinServico(kind)` (2 / 3 / 8) para um
serviço **entrar** no ranking. Uma frase declarada exige mais base que uma linha
de ranking. Serviços abaixo do piso não somem: vão para um grupo recolhido que
expande inline, sem posição numérica e com a explicação escrita uma vez.

## A única quantia permitida

⚠ **Todo `€` da Insights é uma taxa por hora.** `insValidar()` remove do HTML
renderizado as formas legítimas (`€107/h`, `€107 por hora`, `€/h`) e falha se
sobrar qualquer símbolo. Se alguém reintroduzir um valor absoluto, o console
denuncia em vez de as duas telas voltarem a responder a mesma coisa.

## Custo aceito nesta rodada

**A tabela dia×faixa da Semana saiu.** Os três níveis passaram a ter uma
gramática só — tiles. A dimensão "manhã / início da tarde / fim da tarde"
deixou de aparecer no bloco de exibição, mas continua viva onde decide alguma
coisa: `insDayFaixaMatrix()` alimenta a Sugestão de espaço ("ofereça a manhã de
quinta").

## Source of truth

Âncoras: `renderInsights()`, `insComputePeriod()`, `insContentHtml()`,
`insOccupancy()`, `insCapacityMinutes()`, `insFmtHoras()`, `insSpaceBlock()`,
`insEficiencia()`, `insMinServico()`, `insCanais()`, `insConversao()`,
`insValidar()`.

`insTrendSeries()` e `insTrendSvg()` continuam no bloco da Insights por
histórico, mas **quem as consome hoje é o Financeiro**.

## Links

[[Agenda]] · [[Clientes]] · [[Financeiro]] · [[RBAC]] ·
[[Schedule Availability]] · [[Estado Atual do Produto]] ·
[[ADR 0016 - Financeiro V1 e o valor da agenda]]
