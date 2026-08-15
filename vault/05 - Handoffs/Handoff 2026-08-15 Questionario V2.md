# Handoff — Questionário V2 (15/08/2026)

**Migration aplicada:** `20260814233019_questionnaire_v2_language_and_references`
(⚠ o arquivo local se chama `20260815120000_…` — os nomes locais são
aproximações escritas à mão).

## O que entrou

- **Três idiomas** (`pt-BR`, `en`, `es`) com tela de abertura e saudação
  alternando; sem bandeira
- **11 telas** viraram fluxo com volta: cliente → idioma → 7 passos → revisão →
  sucesso
- Etapa nova de **referências visuais** (até 3, placeholders declarados)
- Relatório do perfil com data, idioma e referências
- Colunas `language` (CHECK nos 3 códigos) e `reference_images` (`text[]`,
  CHECK ≤ 3), índice em `(client_id, created_at DESC)`, `REVOKE ALL FROM
  PUBLIC, anon`

## Decisões tomadas

- [[ADR 0010 - Questionario e consulta manual]] — o produto é simples de
  propósito e deve continuar simples
- **Valor persistido é canônico em português**; tradução é só apresentação
- **A ordem é cliente → idioma**, e isso é sobre de quem é a tela
- Sem auto-advance; o `✕` que salvava morreu

## Armadilhas resolvidas

- **A busca de cliente não passa por `renderQuestionario()`** —
  `quizPaintClientList()` mexe só na lista. Mesma regra para os tiles de
  referência (`quizPaintRefs()`).
- **O loop da saudação é `setInterval` e precisa morrer** — `quizResetAll()`
  limpa; com `prefers-reduced-motion` não há loop.
- **Trocar de aba desliga o quiosque explicitamente** — senão header e nav
  ficariam escondidos na aba nova.
- **Bug real no stub do demo:** `.eq().order().limit().maybeSingle()` estourava
  `TypeError` e "Infos do questionário" não fazia nada, nem toast.

## Degradação graciosa

`quizSave()` funciona **sem** a migration: se a coluna não existir, regrava só
os seis campos antigos em vez de mostrar erro para a cliente por uma dívida de
banco.

## Pendente

Fotos reais das referências — ver [[Waiting on Juliane]].

## Links

[[Questionario]] · [[Clientes]]
