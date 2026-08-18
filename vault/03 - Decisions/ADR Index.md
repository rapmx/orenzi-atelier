# ADR Index

Decisões congeladas. **Não reabrir sem o Raphael pedir.**

**Anterior a 08/2026**

- [[ADR 0001 - Tema escuro recusado]] — recusado pela cliente
- [[ADR 0002 - Sem build, sem framework]] — sem npm, sem bundler, tudo inline

**Julho–agosto de 2026**

- [[ADR 0005 - Timezone Europe Dublin]] — 27/07 · todo horário é de Dublin, nunca do aparelho
- [[ADR 0004 - Cor por categoria de servico]] — 02/08 · cor por categoria, não por profissional
- [[ADR 0011 - Painel e demo sao espelhos]] — 02/08 · `painel_demo.html` é espelho obrigatório
- [[ADR 0003 - VIP manual]] — 03/08 · VIP manual, não derivado de contagem de visitas
- [[ADR 0006 - Disponibilidade delega tudo a staff_work_blocks]] — 08/08 · a decisão mais rentável do projeto
- [[ADR 0007 - Expediente duplicado entre JS e SQL, aceito]] — 08/08 · dívida deliberada
- [[ADR 0009 - Reschedule como evento]] — 09/08 · reagendamento é evento, não UPDATE destrutivo
- [[ADR 0013 - Bloqueio de agenda e entidade propria]] — 13/08 · bloqueio não é appointment fake
- [[ADR 0008 - Confirmacao pelo webhook, nunca pelo browser]] — 14/08 · quem confirma é o servidor
- [[ADR 0012 - Hold como pending, nao entidade nova]] — 14/08 · hold é status, não tabela
- [[ADR 0010 - Questionario e consulta manual]] — 15/08 · não deriva regra nenhuma, de propósito
- [[ADR 0014 - Graphify reaberto com escopo enxuto]] — 15/08 · **substitui a recusa de 02/08**
- [[ADR 0015 - RBAC V1 - staff opera tudo, owner ve o negocio]] — 18/08 · staff opera o salão inteiro; Insights e Financeiro são de owner
- [[ADR 0016 - Financeiro V1 e o valor da agenda]] — 18/08 · Financeiro é valor da agenda, não caixa; nenhum número vem do Stripe

Todos com status **aceito**.

## Decisões menores, que vivem só em `docs/10 §17`

Sem amarelo (o degrau de atenção é o caramelo) · sem camada de alias de tokens ·
sem funcionalidade inexistente na UI · o código é fonte de verdade da
identidade. **Não duplicadas aqui de propósito** — são regras de DS, e a casa
delas é o documento.

## Esta pasta é a casa única do rationale

`docs/10 §17` foi atualizado em 15/08/2026 para apontar para cá. **Não criar
`/docs/adr/`** — a pasta nunca existiu e duas casas de ADR é como se perde ADR.
O **template oficial** continua sendo o de `docs/10 §19`.

## Template

`docs/10 §19` tem o template oficial: Contexto · Decisão · Alternativas
consideradas · Consequências · Reversibilidade. A seção de **alternativas** é a
que tem valor daqui a um ano.

## Links

[[Source of Truth]] · [[Estado Atual do Produto]]