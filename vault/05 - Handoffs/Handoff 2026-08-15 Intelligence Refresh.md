# Handoff — Intelligence Refresh (15/08/2026)

Rodada **exclusiva de contexto**. Nenhuma feature, UI, banco, migration, deploy,
commit ou push. HEAD permaneceu `f36d908`.

## O que foi criado

- **Este vault** — 49 notas em 6 pastas, dentro do repo (`vault/`)
- **`tools/graphify/`** — os 4 scripts que tornam o grafo reproduzível
- **Grafo regenerado** — 734 nós / 1.910 arestas / 39 comunidades, sobre `f36d9086`
- **Protocolo de contexto** e **hierarquia de fonte de verdade** documentados e
  ligados nos dois `CLAUDE.md`

## Achados que mudam o que se sabia

Seis divergências entre documentação e realidade, todas registradas em
[[Technical Debt]] §A e [[Source of Truth]]:

1. a migration do Questionário V2 **está aplicada** (o roadmap diz pendente)
2. produção tem **19 tabelas**, o `app/CLAUDE.md` lista 15
3. existe uma **terceira Edge Function ativa sem fonte no repo**
   (`send-appointment-email`)
4. `docs/README.md` ainda diz "implementação não iniciada" — PR1 e PR2 do DS
   foram entregues
5. o changelog para em `1.2.1` (13/08)
6. `/docs/adr/` nunca foi criada, embora `docs/10 §17` a exija

E duas do repo:

7. `supabase/migrations/` é espelho **parcial**: 11 arquivos locais contra 38
   migrations aplicadas
8. `preview/` não está versionado nem ignorado

## Decisão reaberta

[[ADR 0014 - Graphify reaberto com escopo enxuto]] substitui a recusa de 02/08.
A premissa mudou: `GEMINI_API_KEY` existe, e o custo caiu de 315.897 tokens de
contexto Claude para 70.960 tokens de Gemini.

## O que ficou de fora, de propósito

Corrigir as divergências. Elas exigem editar `docs/`, `app/CLAUDE.md` §Banco e o
changelog — e esta rodada não altera documentação viva sem o Raphael decidir o
quê. Estão listadas, não resolvidas.

## Links

[[Estado Atual do Produto]] · [[Source of Truth]] · [[Protocolo de Contexto]] ·
[[Graphify - estado e limites]] · [[Technical Debt]]
