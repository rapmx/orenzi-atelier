# ADR 0014 — Graphify reaberto, com escopo enxuto e backend Gemini

- **Data:** 15/08/2026
- **Status:** aceito — **substitui** a recusa de 02/08/2026
- **Decisor:** Raphael

## Contexto

Em 02/08/2026 o graphify foi **recusado**: a rodada custou 315.897 tokens de
input porque os HTMLs monolíticos vão inteiros para o LLM, o custo se repetia a
cada `--update`, e num projeto de 11 arquivos não se pagava. Ficou registrado
em `docs/10 §17` e no `CLAUDE.md` raiz como decisão congelada.

Em 15/08 o Raphael reabriu explicitamente, dentro de uma rodada de refresh de
inteligência do projeto.

## Decisão

Regenerar o grafo, com **três mudanças** em relação à rodada recusada:

1. **Escopo enxuto** — fora `painel_demo.html` (espelho: dobrava o grafo sem
   informação nova) e `docs/*.md` (já indexados por `docs/README.md`).
2. **Backend Gemini**, não subagentes Claude. `GEMINI_API_KEY` está no ambiente,
   então o custo sai da conta do Gemini em vez do contexto da sessão.
3. **Sidecars derivados** — o JS inline de cada HTML extraído para
   `graphify-out/derived/*.js`, mais a gramática SQL instalada
   (`graphifyy[sql,gemini]`).

## Alternativas consideradas

- **Manter a recusa** — descartada pelo pedido explícito, e porque a premissa
  mudou: a chave Gemini não existia em 02/08.
- **`graphify update` só** (AST, sem LLM, custo zero) — descartado: barato e
  fraco. Não faz extração semântica de `.html`/`.md`, que é onde o Orenzi vive.
- **Escopo completo** — descartado: ~310k tokens e ~30% de nós duplicados
  vindos do espelho.

## Consequências

Medido:

| | 02/08 (recusado) | 15/08 |
|---|---|---|
| nós | 258 | **734** |
| arestas | 460 | **1.910** |
| comunidades | 19 | **39** |
| tokens de extração | 315.897 (Claude) | **70.960 (Gemini)** |

**O que destravou o resultado foi o sidecar derivado.** O graphify trata `.html`
como documento e nunca passa AST nele, então as ~500 funções do app eram
invisíveis. A primeira tentativa desta rodada, sem sidecar, produziu **56 nós** —
pior que o grafo que havia sido recusado.

Limites honestos, registrados em [[Graphify - estado e limites]].

## Reversibilidade

Total: `graphify-out/` é derivado e está no `.gitignore` (exceto o relatório).
Apagar não perde nada de fonte.

## Links

[[Graphify - estado e limites]] · [[Token e Navegacao]] · [[ADR Index]]
