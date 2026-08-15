# Splash

**Estado: IMPLEMENTADA. Redesenhada em 15/08/2026 — não criada do zero.**

## Correção de registro

Até 15/08/2026 este arquivo dizia "NÃO IMPLEMENTADA, só backlog", e
[[Estado Atual do Produto]] e [[Product Backlog]] repetiam. **Era falso.**
Existia uma splash em produção em `painel.html` e `painel_demo.html` desde
antes do refresh de inteligência — ninguém a especificou, e por isso ela
tinha sumido do registro.

Isso muda o enquadramento da frente: não era desenhar uma tela nova, era
substituir uma que a Juliane já via toda vez que abria o painel.

## O que é

Tela de abertura do painel administrativo, cobrindo o carregamento real do
app até o Login ou a Home.

## Escopo — decidido em 15/08/2026

Só a aplicação administrativa: `painel.html` + `painel_demo.html`.

**Não** entra em `agendar.html`, `gerenciar.html` nem na landing pública.
Booking e self-service continuam entrando direto — são superfícies de uso
único, onde uma tela de marca antes da tarefa só atrasaria a cliente.

## Desenho aprovado — "papel e assinatura"

Wordmark tipográfico `ORENZI / ATELIER` sobre `--color-bg`, com a linha
caramelo abaixo servindo de progresso. É a **mesma marca** do Login
(`.wordmark`/`.wordmark-sub`) e do rodapé da landing.

A abertura deixa de ter identidade própria, de propósito: antes havia quatro
representações concorrentes da marca no produto (anel escuro da splash,
wordmark caramelo do Login, `.mark` circular do header, wordmark da landing),
e a splash entregava a mais divergente de todas para depois cortar para a
segunda. O `.mark` circular continua existindo como elemento funcional do
header, mas não compete mais como logomarca de abertura.

## O que existia antes (valor histórico)

Anel escuro de 220px: fundo `#16151a`, anel `#26242a` com borda `#3a383e`,
fita roxa em degradê, filete dourado `#b8933c`, texto off-white. Seis cores,
**nenhuma delas token** — não existe roxo no Design System, e o dourado que
`docs/03` registra é token de *landing*, não do produto.

Três problemas que motivaram a substituição:

1. **Tema escuro na primeira tela** de um app cujo tema escuro foi recusado
   pela cliente — [[ADR 0001 - Tema escuro recusado]].
2. **Duas inversões de tema em menos de dois segundos** no PWA instalado:
   splash nativa bege (`manifest.json`) → splash HTML quase preta → app bege.
3. **Timer cego.** `setTimeout(1300)` + fade de 500ms, sem relação nenhuma
   com o carregamento. Sobrava em rede boa e faltava em rede ruim — quando
   `loadAll()` demorava mais que 1,3s, a splash saía e revelava um `#app`
   **vazio**, porque `render()` só roda depois dela.

O anel **continua vivo nos ícones do PWA** (`icon-192`, `icon-512`,
`apple-touch-icon`). Trocá-los muda o que a Juliane vê na tela inicial do
celular e depende de aprovação dela — ver [[Waiting on Juliane]].

## Ciclo de vida

A splash sai quando o app está pronto, nunca por cronômetro. Três emissores
chamam `markReady()`, e o primeiro vence:

| Emissor | Quando |
|---|---|
| `READY_LOGIN` | sem sessão, `renderLogin()` já desenhou |
| `READY_PANEL` | com sessão, `loadAll()` terminou e `render()` desenhou |
| `READY_TIMEOUT` | rede de segurança, 2,5s desde a navegação |

### O piso é de branding

Ajustado ainda em 15/08/2026, no mesmo dia: a primeira versão usava um piso
de 400ms, só para evitar piscada, e **ficou rápida demais** — `ORENZI /
ATELIER` não dava tempo de ser lido. A intenção da tela mudou: ela cobre o
carregamento **e** é um momento curto de marca.

Ritmo aprovado, contado do frame em que o wordmark aparece:

| Fase | Tempo |
|---|---|
| entrada do wordmark | ~340ms |
| permanência plena, legível | ~1760ms |
| saída | 280ms |
| **total** | **~2,4–2,6s** conforme a fonte demore |

**Isso não é a volta do timer cego.** O readiness continua sendo a condição
de saída: sem `markReady()` a splash não sai por conta do piso. O piso só
atrasa uma saída **já autorizada**. Quem chega depois é quem manda — em rede
lenta o app dita o tempo, não o relógio.

O piso conta do wordmark, e não do início, porque a marca espera a fonte Jost
(até 600ms) para não trocar de tipografia à vista. Contado do início, uma
fonte lenta comeria justamente o tempo de leitura que o piso existe para
garantir.

No teto com sessão, `state.booting` faz a Home mostrar estado neutro de
carregamento em vez de "Nenhum atendimento hoje" — empty state falso afirma
algo errado sobre a agenda, e isso é pior que espera.

Detalhe de implementação (constantes, guardas, armadilhas) fica em
`app/CLAUDE.md`, não aqui.

## Perguntas que ficaram respondidas

As quatro perguntas em aberto da versão anterior deste arquivo foram
decididas em 15/08/2026: cobre só o painel; o tempo sai do estado real do app
com um piso de branding de ~2,1s e teto de segurança de 2,5s; mostra o
wordmark e o progresso, sem skeleton; e não entra no `agendar.html`.

## Pendente

- **Ícones do PWA** ainda com o anel escuro — decisão da Juliane.
- Saída mais cinematográfica (cortina/máscara revelando o painel) foi
  **adiada de propósito**: só se a versão simples parecer sem personalidade
  depois de rodar. Exigiria extensão formal do `docs/05`.

## Links

[[Login]] · [[Product Backlog]] · [[Estado Atual do Produto]] ·
[[Waiting on Juliane]] · [[Technical Debt]] · [[Frontend Architecture]]
