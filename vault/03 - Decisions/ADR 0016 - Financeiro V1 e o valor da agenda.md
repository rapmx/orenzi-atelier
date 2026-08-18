# ADR 0016 — Financeiro V1 é o valor da agenda, não caixa

**Data:** 18/08/2026 · **Status:** aceito

## Contexto

O Financeiro estava como conceito desde 03/08, travado por três perguntas — a
nota da época chamava-se "Financeiro - futuro" e foi substituída por
[[Financeiro]]:

1. Cancellation Policy V2 — ainda aberta;
2. valor editável por atendimento — **resolvida** em 17/08 por `final_price`;
3. o que "receita" significa — resolvida por este ADR.

A terceira era a que impedia qualquer tela: sinal recebido? valor cobrado no
salão? os dois? Com o Stripe em sandbox e
`LIVE PAYMENTS BLOCKED UNTIL CANCELLATION POLICY V2 IS APPROVED` em vigor,
qualquer tela que falasse de dinheiro recebido falaria de dinheiro que ninguém
recebeu.

## Decisão

O Financeiro V1 responde **uma** pergunta: *quanto vale a agenda, e como esse
valor está mudando ao longo do tempo?*

```
Financeiro V1 = agenda value, not cash accounting
```

Nenhum número sai de `payments` nem do Stripe. Tudo vem de `appointments`, pela
regra canônica `appointmentRevenue()`. A copy é vinculante, não estilística:
*valor*, *em atendimentos*, *já atendidos*, *ainda agendado*, *total do
período* — nunca recebido, caixa, pago, a receber, faturamento, lucro, margem,
comissão, transação ou extrato.

A separação com a Insights fica assim, e é o que impede as duas de virarem a
mesma tela:

```
Insights   = operational diagnosis      (ocupação, ritmo, €/h)
Financeiro = monetary value evolution   (€ absoluto, ticket, mix, trajetória)
```

`financeiro` é capability de `owner`. A tela não trouxe RBAC novo: a capability
existia desde a fundação, justamente para não precisar de retrofit.

## Alternativas recusadas

- **Esperar a Cancellation Policy V2.** Ela trava a tela de *pagamento*, não a
  de *valor da agenda*. Segurar o Financeiro por ela seria confundir as duas.
- **Ler `payments` para mostrar sinal recebido.** Sandbox — mostraria número
  que não existe, e abriria grant numa tabela hoje inalcançável pelo browser.
- **Dividir `final_price` entre `appointment_services`.** Sem os snapshots (a
  tabela é `REVOKE ALL` para o browser) só daria para inventar uma proporção.
  Divisão silenciosa é pior que atribuição declaradamente grosseira.
- **Abrir grant em `appointment_services`** só para o ranking por serviço
  fechar. Não se abre superfície de dado para desenhar um bloco.
- **Derivar "já atendido" de `status`.** O produto não tem fluxo de concluído /
  não compareceu; `starts_at < agora` é o que o app realmente sabe.

## Consequências

- O ranking de "Valor por serviço" pode não reconciliar com o total do período
  em atendimento multi-serviço. **Limite conhecido e reportado** por
  `finValidar()` como nota, nunca silenciado.
- A navegação final aprovada entrou junto (`Início · Agenda · Clientes ·
  Insights · Financeiro · Estoque` para `owner`), porque agora existe tela.
  Para `staff` o rodapé continua com quatro abas.
- `€1k` / `€1,5k` passa a ser exceção **registrada** de `docs/06 §24`, válida só
  em rótulo de tick de eixo analítico e sob três condições — ver `§24.1`.
- A Insights **não** foi redesenhada nesta rodada. Ela continua com "Tendência"
  e "Onde está o dinheiro", e por um período as duas abas mostram o mesmo valor
  por caminhos diferentes. O preview `insights-pos-financeiro.html` está
  aprovado e é a próxima rodada.
- Nenhum backend novo, nenhum grant novo. Se o Financeiro V2 precisar de
  backend, ele nasce com `is_owner()` — [[ADR 0015 - RBAC V1 - staff opera tudo, owner ve o negocio]].

## Links

[[Financeiro]] · [[Insights]] · [[RBAC]] · [[Payments - Stripe]] ·
[[Production Blockers]] · [[Technical Debt]] · [[ADR Index]]
