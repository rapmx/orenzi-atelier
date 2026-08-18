# Financeiro

**Estado: V1 em produção desde 18/08/2026.** Aba owner-only.

```
Financeiro V1 = agenda value, not cash accounting
```

## A pergunta da aba

*Quanto vale a agenda, e como esse valor está mudando ao longo do tempo?*

Uma pergunta, uma tela. O que **não** é, e a distinção não é de vocabulário:
caixa, contabilidade, conciliação bancária, recebimento, lucro, margem,
comissão. Nenhum número sai de `payments` nem do Stripe — tudo vem de
`appointments`, que é a **agenda**.

O app não sabe o que entrou na conta. Sabe o que foi marcado e o que foi
cobrado. Por isso a copy fala em *valor*, *em atendimentos*, *já atendidos*,
*ainda agendado*, *total do período*, *ticket médio*, *valor por serviço* — e
nunca em recebido, caixa, pago, a receber, faturamento, lucro, margem,
comissão, transação ou extrato.

Enquanto `LIVE PAYMENTS BLOCKED UNTIL CANCELLATION POLICY V2 IS APPROVED`
valer, essa fronteira é **obrigatória**, não estilística: uma tela que falasse
de dinheiro recebido estaria falando de dinheiro que ninguém recebeu. Ver
[[Production Blockers]].

## Separação com a Insights

```
Insights   = operational diagnosis
Financeiro = monetary value evolution
```

A divisão que resolve a sobreposição das duas:

| Bloco | Onde vive | Por quê |
|---|---|---|
| € absoluto por serviço, participação % | **Financeiro** | é "quanto vale" |
| €/h de cadeira | **Insights** | é "quanto rende por hora" |
| Ocupação, ritmo, capacidade | **Insights** | não tem quantia nenhuma |
| Evolução do valor por período fechado | **Financeiro** | é a trajetória do dinheiro |

✅ **A Insights foi redesenhada em 18/08/2026**, na rodada seguinte. "Tendência"
e "Onde está o dinheiro" saíram de lá; o Hero dela virou ocupação. A separação
está fechada nas duas pontas — nenhum valor absoluto sobrou na Insights, e
nenhum diagnóstico operacional veio para cá. Ver [[Insights]].

## Ordem dos blocos — não reordenar sem pedido

```
Período → Hero → Indicadores → Evolução → Distribuição
        → Valor por serviço → Histórico de atendimentos
```

**Evolução antes de Distribuição** de propósito: a pergunta é "quanto vale e
está subindo?", e a trajetória precede a leitura interna do período. Não existe
bloco de comparativos — Hero, Indicadores e Evolução já respondem isso três
vezes.

## Decisões desta V1

- **Distribuição Analytical.** Das três variações do protótipo, a aprovada foi
  a Analytical. As outras duas não foram portadas e **não existe switch A/B em
  produção**.
- **Escala com topo arredondado**, não "maior barra = 100%". A altura ganha
  unidade monetária, e é isso que separa um instrumento de leitura de uma barra
  decorativa.
- **`€1k` / `€1,5k` só no eixo.** Exceção deliberada, registrada em
  `docs/06 §24.1`. Em toda quantia que a Juliane lê, o valor continua completo.
- **Sem backend novo.** Nenhum grant, nenhuma RPC, nenhuma view. Tudo é
  calculado no browser sobre dado que a Agenda e a Home já leem. Se um dia
  precisar de backend, ele nasce com `is_owner()` — [[RBAC]].
- **Classificação temporal por `starts_at`, nunca por status.** O produto não
  tem fluxo de "concluído"/"não compareceu", e derivar isso de `confirmed`
  seria inventar.

## Limitação conhecida — multi-serviço

O ranking de "Valor por serviço" **pode não fechar com o total do período**, e a
causa é de dado:

- `final_price` é **total por appointment** (V1), e `appointment_services` tem
  `REVOKE ALL` para o browser desde a blindagem da Booking V2;
- o agrupamento cai no `service_id` legado, que a Booking V2 grava como o
  **primeiro** serviço. Num multi-serviço o valor inteiro vai para ele.

Decidido: **não dividir proporcionalmente** (inventaria precisão) e **não abrir
grant só para desenhar um bloco**. O total do período continua correto — soma
appointments, não serviços. `finValidar()` reporta a diferença como *nota*,
nunca como falha silenciosa.

Fechar isso é decisão de arquitetura financeira, junto com o item do Stripe que
também não lê `final_price`. Ver [[Technical Debt]].

## Fonte de verdade

Âncoras: `renderFinanceiro()`, `finComputePeriod()`, `finContentHtml()`,
`finAnalyticalHtml()`, `finEscalaNice()`, `finTick()`, `finPintarReadout()`,
`finRolar()`, `finServicos()`, `finValidar()`. Regra de valor:
`appointmentRevenue()` — ponto único, sem segunda fórmula.

## Links

[[Insights]] · [[RBAC]] · [[Payments - Stripe]] · [[Production Blockers]] ·
[[Technical Debt]] · [[ADR 0016 - Financeiro V1 e o valor da agenda]] ·
[[ADR 0015 - RBAC V1 - staff opera tudo, owner ve o negocio]]
