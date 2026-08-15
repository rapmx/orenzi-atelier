# Splash

**Estado: NÃO IMPLEMENTADA. Só backlog.**

## O que é

Tela de carregamento ao abrir o app/site.

## Estado da decisão

**Aprovada para trabalho depois do refresh de inteligência de 15/08/2026** —
é a **próxima frente** da fila, junto com [[Login]].

Nada foi especificado ainda: nem duração, nem conteúdo, nem se cobre o
`index.html` público ou só o painel, nem como interage com o PWA
(`manifest.json` já existe, com ícones 192/512 e `apple-touch-icon`).

## O que já está decidido e restringe o desenho

- **tema claro** — [[ADR 0001 - Tema escuro recusado]]
- mobile 320–430px é a fonte de verdade
- `prefers-reduced-motion` obrigatório
- nada de valor visual novo sem passar pelo DS (`docs/03`, `docs/04`) — se o DS
  não cobrir, **propor extensão**, não criar exceção local
- entra em `painel.html` **e** `painel_demo.html` se for tela do painel

## Perguntas em aberto (decidir antes de implementar)

1. cobre o app inteiro ou só a abertura do painel?
2. tem tempo mínimo de exibição, ou some assim que os dados carregam?
3. o que ela mostra enquanto `loadAll()` roda — logo, skeleton, ou os dois?
4. entra também no `agendar.html` (que é a superfície da cliente do salão)?

## Links

[[Login]] · [[Product Backlog]] · [[Estado Atual do Produto]] ·
[[Frontend Architecture]]
