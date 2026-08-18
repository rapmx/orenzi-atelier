# Handoff — Insights pós-Financeiro (18/08/2026)

Terceiro bloco do dia, depois do RBAC V1 e do Financeiro V1. Fecha a separação
que o Financeiro tinha aberto pela metade.

```
Insights   = operational diagnosis
Financeiro = monetary value evolution
```

Detalhe em [[Insights]] e em `app/CLAUDE.md` §"Insights pós-Financeiro".

## O que saiu da Insights

| Saiu | Para onde |
|---|---|
| Hero de receita | virou Hero de **ocupação**, com barra de capacidade |
| KPI "Gasto médio" | ticket é do Financeiro |
| Bloco "Tendência" | virou **Evolução** no Financeiro |
| "Onde está o dinheiro" | virou **Eficiência por serviço**, só €/h |
| Considerações de receita e gasto médio | viraram **horas ocupadas** |
| "Potencial estimado: +€X" nas Sugestões | virou impacto em horas e atendimentos |
| Sugestão do Ano citando receita absoluta | passou a citar **tempo de cadeira** |

Nova ordem: `Período → Hero → Indicadores → Considerações → Sugestões → Onde há
espaço → Eficiência por serviço → Como as clientes chegam`.

## A regra que impede a sobreposição de voltar

⚠ **Todo `€` da Insights é uma taxa por hora.** `insValidar()` remove do HTML
renderizado as três formas legítimas (`€107/h`, `€107 por hora`, `€/h`) e falha
se sobrar qualquer símbolo. Não é contagem por bloco — pega Hero, Indicadores,
Considerações, Sugestões e qualquer bloco futuro de uma vez.

Isso não é zelo de copy: sem a trava, um `formatCurrency` a mais numa
Consideração reintroduz a sobreposição em silêncio, e as duas telas voltam a
responder a mesma pergunta.

## Dois achados desta rodada

**1 · O Hero mentia por arredondamento.** Mostrava `81% de ocupação` com a
legenda `7h ocupadas de 9h` — e 7/9 é 78%. A causa: as horas eram arredondadas
na **origem** (`Math.round(minutos / 60)`), enquanto a percentagem saía dos
minutos. Corrigido guardando as horas exatas e arredondando só na **exibição**,
com uma casa decimal quando o inteiro mentiria (`insFmtHoras()`, `docs/06 §25`).
Hoje: `7,3h ocupadas · 1,8h livres de 9h`, e 7,3/9 = 81%. O invariante exige
essa igualdade **sem tolerância**.

Vale registrar porque é o tipo de erro que a Insights existe para não cometer —
o princípio da tela desde 03/08 é que nenhum número aparece se não puder ser
sustentado pelos outros.

**2 · Removi por engano duas definições compartilhadas.** `insEmCursoLabel()` e
`WEEKDAY_LABELS_3` ficavam **no meio** do trecho que foi substituído, e as duas
são usadas pelo **Financeiro** (o rodapé do card de Evolução e os rótulos dos
buckets da Semana). Quebrou a aba inteira. Restauradas junto das outras
constantes compartilhadas, com comentário dizendo quem as consome — que é o que
faltava para o erro não acontecer.

## Decisões e custos aceitos

- **Degrau tonal dos tiles subiu de 0,55/0,20 para 0,70/0,40.** Este salão opera
  entre 15% e 50% de ocupação; com o corte antigo praticamente toda fatia caía
  em "muito livre" e a grade ficava escura, sem contraste entre uma semana cheia
  e uma vazia. Um degrau que nunca distingue não é degrau.
- **A tabela dia×faixa da Semana saiu.** Os três níveis passaram a ter uma
  gramática só — tiles. A dimensão "manhã / início da tarde / fim da tarde"
  deixou de aparecer no bloco de exibição, mas continua viva onde decide alguma
  coisa: `insDayFaixaMatrix()` alimenta a Sugestão de espaço. **Custo aceito**,
  não descuido.
- **Fatia de capacidade zero não aparece.** 31/08/2026 cai numa segunda e o
  salão fecha segunda — mostrar "0h" tracejado prometeria espaço num dia em que
  ninguém atende.
- **Dois pisos de amostra convivendo.** `INS_MIN_SERVICO` (4) para o app
  *afirmar* algo sobre um serviço; `insMinServico(kind)` (2/3/8) para um serviço
  *entrar* no ranking. Uma frase declarada exige mais base que uma linha de
  ranking.
- ⚠ **O peso de ordenação das Sugestões continua usando ticket e receita/hora.**
  É invisível — nunca chega à tela — e decide só qual candidata aparece
  primeiro. Trocá-lo mudaria **quais** sugestões a Juliane vê, o que é mudança
  de comportamento e não estava no escopo. É por isso que `insComputePeriod()`
  ainda calcula `receita` e `ticket`.

## Não foi tocado

Financeiro, RBAC, Home, Clientes, Booking, Stripe, navegação. Verificado: o
Financeiro renderiza os cinco blocos, a Evolução mostra "Este mês em andamento",
a Analytical desenha os eixos da Semana e do Mês, e o histórico traz as 30
linhas. `finValidar()` fecha nos três períodos.

## Estado local que continua fora dos commits

`.claude/launch.json` e `tools/README.md` seguem modificados desde rodadas
anteriores, deliberadamente fora destes commits. A decisão de 17/08 — se entram
ou voltam atrás — continua pendente.

⚠ `preview/` é gitignored: os dois previews vivem só no HD do Raphael.

## Links

[[Insights]] · [[Financeiro]] · [[RBAC]] · [[Estado Atual do Produto]] ·
[[Schedule Availability]] · [[Technical Debt]] ·
[[ADR 0016 - Financeiro V1 e o valor da agenda]] ·
[[Handoff 2026-08-18 Financeiro V1]]
