# Questionário

**Estado: V2 concluída em 15/08/2026. Migration APLICADA em produção.**

⚠ `docs/roadmap.md` Fase 4 ainda diz "migration pendente de aplicar". Está
**desatualizado** — verificado: `language` e `reference_images` existem em
`client_questionnaires`, migration `20260814233019`. Ver [[Source of Truth]].

## A decisão que define o produto

**É simples de propósito e deve continuar simples.** A Juliane entrega o tablet
quando a cliente chega, a cliente responde, as respostas ficam no perfil para
**consulta manual**.

**Nenhuma resposta deriva duração, preço, serviço, alerta, recomendação ou
qualquer regra de agendamento** — e não deve passar a derivar sem o Raphael
pedir. Foi decisão explícita: a auditoria de 14/08 mostrou uso funcional zero e
o pedido foi **manter assim**.

Ver [[ADR 0010 - Questionario e consulta manual]].

## Três idiomas, valor canônico em português

`pt-BR`, `en`, `es`. **O valor persistido é sempre em português**:
`had_bleaching` grava `'Sim'` mesmo com a cliente respondendo em inglês. A
tradução é só de apresentação.

Sem isso, o relatório da Juliane chegaria em espanhol e toda leitura futura
teria que conhecer os três idiomas. **O relatório do perfil é sempre pt-BR**,
com o idioma usado como etiqueta.

Sem bandeira na escolha: **idioma não é país**.

## A ordem é cliente → idioma, e isso é sobre de quem é a tela

A escolha da cliente é a **primeira** tela e pertence ao painel: header e nav à
vista, sem "Voltar", sem "Sair".

O quiosque começa **no instante da escolha** (`setKioskMode(phase !== 'client')`).
A tela de idioma já é da cliente, com o nome dela no subtítulo para a Juliane
conferir a quem está entregando o tablet.

Voltar do idioma devolve o painel e **zera `language`** — quem escolhe idioma é
a cliente, e a próxima pode não ser a mesma.

## O que a V2 corrigiu

| V1 | V2 |
|---|---|
| `✕` que salvava | CTA "Salvar questionário", com busy/erro |
| auto-advance no `onchange` do `<select>` | escolher e confirmar, com revisão |
| nav escondida, sem saída | progresso "N de 7", Voltar em todo passo, Sair com confirmação |
| `<select>` | opções em cartão sobre o DS |
| estado vazio como toast | estado vazio como **tela** |

## Referências visuais são placeholders declarados

Até a Juliane mandar as fotos. O catálogo é `QUIZ_REFERENCES`; o que vai para o
banco é o **`id`** (`ref_01`…), **nunca URL**. Quando a foto chegar, preenche-se
`imageUrl` e nem a gravação nem o relatório mudam. Até 3, e **0 é resposta
válida**.

Ver [[Waiting on Juliane]].

## Histórico append-only e invisível

Um INSERT por resposta; a tela lê a mais recente. Sem UPDATE, sem upsert, sem
tela de histórico. Fora do escopo desta rodada.

## Degradação graciosa do banco

`quizSave()` funciona **sem** a migration: se o Postgres disser que a coluna não
existe (`quizMissingColumn()`), regrava só os seis campos antigos em vez de
mostrar erro para a cliente por uma dívida de banco. (Hoje a migration está
aplicada, mas o caminho continua lá.)

## Fora do escopo por decisão de 15/08

Alerta automático · integração com Agenda · recomendação ·
expiração/revalidação · histórico navegável · multi-select das perguntas
químicas · edição posterior.

## Source of truth

`app/CLAUDE.md` §"Questionário V2 (15/08/2026)" ·
`supabase/migrations/20260815120000_questionnaire_v2_language_and_references.sql`
Âncoras: `renderQuestionario()`, `quizSave()`, `quizPaintClientList()`,
`quizPaintRefs()`, `renderQuestionnaireReport()`.

## Links

[[Clientes]] · [[Juliane - Client 01]] · [[Waiting on Juliane]] ·
[[Handoff 2026-08-15 Questionario V2]]
