# ADR 0010 — O questionário é consulta manual e não deriva regra

- **Data:** 15/08/2026 (auditoria em 14/08)
- **Status:** aceito
- **Decisor:** Raphael

## Contexto
A auditoria de 14/08 mediu o uso funcional das respostas do questionário:
**zero**. Nenhuma resposta influenciava nada no sistema. A pergunta natural era
"então para que serve?".

## Decisão
**Manter assim, de propósito.** A Juliane entrega o tablet, a cliente responde,
as respostas ficam no perfil para leitura humana.

Nenhuma resposta deriva duração, preço, serviço, alerta, recomendação ou
qualquer regra de agendamento.

## Alternativas consideradas
- **Derivar alerta químico** (ex.: henna → avisar na agenda) — descartado:
  transformaria a resposta de uma cliente num bloqueio operacional, e um falso
  positivo custaria um atendimento.
- **Derivar duração/preço** — descartado pelo mesmo motivo, com dinheiro no meio.
- **Remover o questionário** — descartado: a Juliane usa a informação, só que
  lendo.

## Consequências
"Uso funcional zero" deixa de ser achado de auditoria e passa a ser
**especificação**. Uma sessão futura que "corrigir" isso estará quebrando a
decisão, não melhorando o produto.

Também ficou **fora de escopo por decisão**: alerta automático, integração com
Agenda, recomendação, expiração/revalidação, histórico navegável, multi-select
das perguntas químicas, edição posterior.

## Reversibilidade
Total — mas só a pedido do Raphael.

## Links
[[Questionario]] · [[Product Scope]] · [[ADR Index]]
