# ADR 0002 — Sem build, sem framework, sem npm

- **Data:** anterior a 08/2026
- **Status:** aceito
- **Decisor:** Raphael

## Contexto
Projeto de um salão, uma profissional, um dono técnico que edita em duas
ferramentas diferentes (Claude Code e Claude Chat).

## Decisão
HTML estático, CSS e JS **inline** em cada arquivo, Supabase por CDN.
Nenhum bundler, nenhum passo de compilação. Abrir com `npx serve app`.

## Alternativas consideradas
- **Vite + framework** — descartado: acrescenta um passo que pode quebrar entre
  sessões e uma pasta `node_modules` que ninguém quer versionar, para um app de
  quatro páginas.
- **Módulos ES locais** — foi **tentado** em 30/07/2026 (`modules/` + `shared/`)
  e o trabalho foi **perdido** por sobrescrita entre sessões; as pastas ficaram
  órfãs e foram removidas em 02/08. É por isso que o git existe aqui.

## Consequências
- **Fica mais fácil:** deploy é `git push`; qualquer sessão abre e edita.
- **Fica mais caro:** `painel.html` tem 555 KB e não pode ser varrido inteiro
  (~140k tokens). Toda navegação depende das âncoras de `app/CLAUDE.md`, do
  grep e do grafo. Ver [[Token e Navegacao]].
- **Efeito colateral estrutural:** o AST de qualquer ferramenta é cego ao JS
  inline. Foi preciso derivar sidecars `.js` para o graphify enxergar as ~500
  funções — ver [[ADR 0014 - Graphify reaberto com escopo enxuto]].

## Reversibilidade
Alta em teoria. Na prática exigiria reverter também a decisão de editar o
projeto em duas ferramentas ao mesmo tempo.

## Links
[[Frontend Architecture]] · [[Token e Navegacao]] · [[ADR Index]]
