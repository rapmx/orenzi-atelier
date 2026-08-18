# Handoff — Financeiro V1 (18/08/2026)

Dois blocos entraram hoje: **RBAC V1** (que o handoff de 17/08 anunciava como
"próximo" e nunca ganhou handoff próprio) e, sobre ele, o **Financeiro V1**.

## O que é o Financeiro V1

```
Financeiro V1 = agenda value, not cash accounting

Insights   = operational diagnosis
Financeiro = monetary value evolution
```

Uma pergunta: *quanto vale a agenda, e como esse valor está mudando ao longo do
tempo?* Nenhum número sai de `payments` nem do Stripe — tudo vem de
`appointments`, pela regra canônica `appointmentRevenue()`.

A copy é vinculante: *valor*, *em atendimentos*, *já atendidos*, *ainda
agendado*, *total do período*, *ticket médio*, *valor por serviço*. **Nunca**
recebido, caixa, pago, a receber, faturamento, lucro, margem, comissão,
transação, extrato. Enquanto
`LIVE PAYMENTS BLOCKED UNTIL CANCELLATION POLICY V2 IS APPROVED` valer, isso não
é estilo — é a diferença entre falar de dinheiro que existe e de dinheiro que
ninguém recebeu.

Detalhe completo em [[Financeiro]] e em `app/CLAUDE.md` §"Financeiro V1".
Rationale em [[ADR 0016 - Financeiro V1 e o valor da agenda]].

## Estrutura entregue

```
Período (Semana · Mês · Ano, default Mês, estado próprio)
  → Hero → Indicadores → Evolução → Distribuição
  → Valor por serviço → Histórico de atendimentos
```

Portado do preview aprovado `preview/financeiro-v1.html`, variação
**Analytical**. As variações horizontal e vertical do protótipo **não** foram
portadas e **não existe switch A/B em produção**.

## Navegação — a final aprovada, agora aplicada

| Papel | Rodapé |
|---|---|
| owner | Início · Agenda · Clientes · Insights · Financeiro · Estoque |
| staff | Início · Agenda · Clientes · Estoque |

A reordenação estava aprovada desde 17/08 e foi segurada até existir tela. O
rodapé é desenhado por capability (`aplicarNavPorPapel()`), não por papel.
Questionário continua fora, como capability contextual de Clientes.

## RBAC — nada novo, e é esse o ponto

`financeiro` já era capability de `owner` desde a fundação do RBAC, justamente
para não precisar de retrofit. Esta rodada só acrescentou **a tela e a rota**
(`TABS_ROTEAVEIS`). Quem protege continua sendo o guard central de `render()`.

Verificado nesta rodada, no painel real:

- **owner** → Financeiro abre, seis abas na ordem aprovada;
- **staff** com `state.tab = 'financeiro'` forçado por código → guard redireciona
  para `inicio`, rodapé com quatro abas;
- **sem papel** → `renderSemAcesso()`, nenhum dado carregado.

**Nenhum grant novo, nenhuma RPC, nenhuma view.** Se o Financeiro V2 precisar de
backend, ele nasce com `is_owner()`.

## Três coisas que não devem ser reabertas por engano

**1 · Classificação temporal é tempo, nunca status.**
`starts_at < agora` = já atendido; `>= agora` = ainda agendado. O produto não
tem fluxo de concluído/não compareceu, e derivar isso de `confirmed` seria
inventar. O instante do corte é o mesmo de `insApptsBetween()`, e é isso que faz
a Distribuição fechar exatamente com o Hero.

**2 · A escala do eixo não normaliza pelo maior dado.**
`finEscalaNice()` arredonda o topo para um passo redondo (1, 2, 2,5 ou 5 × 10ⁿ).
Topo ≥ maior barra, eixo em €0, último tick = topo, 3 a 6 ticks. É o que dá
unidade monetária à altura da barra.

**3 · `€1k` / `€1,5k` só no eixo.** Exceção registrada em `docs/06 §24.1`, com
três condições. Em toda quantia que a Juliane lê, o valor continua completo.

## Limitação conhecida — multi-serviço

O ranking de "Valor por serviço" **pode não fechar com o total do período**:
`final_price` é total por appointment e `appointment_services` tem `REVOKE ALL`
para o browser, então o agrupamento cai no `service_id` legado — o **primeiro**
serviço do agendamento.

Decidido: **não** dividir proporcionalmente (inventaria precisão) e **não** abrir
grant só para desenhar um bloco. O total continua correto; é o ranking que pode
não reconciliar, e `finValidar()` reporta isso como *nota*, nunca como falha
silenciosa. Registrado em [[Technical Debt]], com gatilho amarrado à mesma
rodada que resolver o Stripe não ler `final_price`.

## Invariantes

`finValidar()` no console do painel roda os três períodos e verifica: total =
atendido + agendado · Σ distribuição = cada lado · ticket × atendimentos =
atendido · topo ≥ maior barra · eixo em 0 · último tick = topo · 3–6 ticks ·
evolução só com períodos fechados. Fechou nos três, inclusive com `final_price`
injetado nos dados de teste.

## O que NÃO foi feito, de propósito

**A Insights não foi redesenhada.** O preview `insights-pos-financeiro.html`
está aprovado e não portado — a Insights de hoje continua com "Tendência" e
"Onde está o dinheiro". Por um período as duas abas mostram o mesmo valor por
caminhos diferentes. **É a próxima rodada.**

## Estado local que continua fora dos commits

`.claude/launch.json` e `tools/README.md` seguem modificados desde rodadas
anteriores (entrada `orenzi-preview` e a documentação dela), deliberadamente
fora destes commits. A decisão de 17/08 — se entram ou voltam atrás — continua
pendente.

⚠ **`preview/` é gitignored**: `financeiro-v1.html` e
`insights-pos-financeiro.html` vivem só no HD do Raphael. Servidor local:
`preview_start` com `orenzi-preview` (porta 3100).

## Próxima iniciativa

**Redesenho da Insights** a partir do preview aprovado: hero de ocupação com
barra de capacidade, indicadores `Atendimentos · Horas ocupadas · Clientes novas
· Conversão`, "Onde está o dinheiro" → **Eficiência por serviço** (só €/h),
"Tendência" sai (já virou Evolução no Financeiro).

## Links

[[Financeiro]] · [[Insights]] · [[RBAC]] · [[Estado Atual do Produto]] ·
[[Technical Debt]] · [[Production Blockers]] · [[Payments - Stripe]] ·
[[ADR 0016 - Financeiro V1 e o valor da agenda]] ·
[[ADR 0015 - RBAC V1 - staff opera tudo, owner ve o negocio]] ·
[[Handoff 2026-08-17 Valor Final e Questionario em Clientes]]
