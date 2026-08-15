# Graphify — estado e limites

**Gerado em 15/08/2026, sobre o commit `f36d9086`** (+ a fonte recuperada de
`send-appointment-email`, que entrou na atualização barata do mesmo dia).

| | 02/08 (recusado) | 15/08 (atual) |
|---|---|---|
| nós | 258 | **739** |
| arestas | 460 | **1.914** |
| comunidades | 19 | **39** |
| extração | 92% EXTRACTED · 8% INFERRED | — |
| tokens | 315.897 (Claude) | **70.960 (Gemini)** |

Decisão de reabrir: [[ADR 0014 - Graphify reaberto com escopo enxuto]].

## O que está dentro

`app/*.html` (menos `painel_demo.html`) · `app/ds/orenzi-ui.js` ·
`app/shared/salon.js` · `app/manifest.json` · os dois `CLAUDE.md` ·
`supabase/migrations/*.sql` (11) · `supabase/functions/**/*.ts` (**3**).

**Fora:** `painel_demo.html`, `docs/*.md`, **`vault/`**, **`tools/`**,
`preview/`, `archive/`, `media-raw/`, `design/`, `app/assets/`.

⚠ O `vault/` fica fora **de propósito**: indexar a documentação de contexto
dentro do mapa estrutural do código seria circular e só somaria ruído. As duas
camadas respondem perguntas diferentes — ver [[Protocolo de Contexto]].

## Como ele enxerga o front — leia isto antes de confiar num caminho

O graphify trata `.html` como **documento** e nunca passa AST nele. Como todo o
JS do Orenzi vive inline, as ~500 funções do app eram invisíveis: a primeira
tentativa desta rodada produziu **56 nós**.

A solução foi derivar sidecars: `graphify-out/derived/*.js` com o `<script>`
inline de cada HTML.

⚠ **Consequência:** os nós de front apontam para
`graphify-out/derived/painel.js`, **não** para `app/painel.html`. O número da
linha é o do sidecar. A **fonte de verdade continua sendo o HTML** — os
derivados são artefato regenerável e nunca devem ser editados.

## Como ele enxerga a ponte JS→Supabase

`sb.rpc('get_busy_slots')` é uma **string** para o parser de JS. Sem tratamento,
o grafo ficava com duas ilhas: todo o front de um lado, todas as RPCs do outro.

Um passo próprio injeta **100 arestas-ponte** casando a string com o nó que já
existe: 18 `calls_rpc` · 5 `invokes_edge_function` · 77 `queries_table`.

São **EXTRACTED** (o nome está literalmente no fonte), mas:

⚠ **a atribuição do CHAMADOR é heurística.** Usa casamento de chaves para achar
a função mais interna que contém a chamada. Funciona para função nomeada;
para chamada dentro de callback anônimo (ex.: o `rpc` dentro do
`Deno.serve(...)` do `stripe-webhook`) a aresta é creditada ao **arquivo**, não
a uma função. Isso é correto, só é menos específico.

## Limites conhecidos — não são bugs, são o que ele não faz

1. **5 alvos não resolvem**: `find_or_create_client`, `products`,
   `product_movements`, `client_photos`, `booking_visits`. As migrations que os
   criam **não existem localmente** — ver [[Technical Debt]] §B.
2. **Chamada SQL→SQL dentro de corpo PL/pgSQL não é extraída.** Ex.:
   `create_public_booking_orchestrated` → `_create_booking_core` não aparece.
   `_create_booking_core` **sim** liga corretamente a `appointments`,
   `appointment_services`, `services`, `staff`, `cancellation_policies`.
3. **`.css` não é indexado** — os tokens do DS não estão no grafo. Para valor
   visual, use `docs/03` e `docs/04`.
4. **Um mesmo `public.foo()` aparece uma vez por migration** que o define. É
   honesto (a função foi redefinida), mas `explain` pede desambiguação.

## Validação feita (15/08)

| Cadeia | Resultado |
|---|---|
| `renderAgenda()` → grid, pager, blocos | ✅ 15 conexões |
| `renderAgenda()` → `schedule_blocks` | ✅ 4 hops |
| booking → Edge → `create_public_booking_orchestrated` | ✅ 2 hops |
| `stripe-webhook` → `handle_stripe_event` → tabelas | ✅ |
| `renderQuestionario()` → `client_questionnaires` | ✅ 3 hops |
| self-service: token → `reschedule_booking_by_token` | ✅ |
| browser → `handle_stripe_event` | ❌ **e está certo** — a confirmação é do webhook, não há caminho do browser. Ver [[ADR 0008 - Confirmacao pelo webhook, nunca pelo browser]] |

## Como manter

**Atualização barata — custo zero, nenhuma chamada de LLM:**

```bash
python tools/graphify/derive_js.py && python tools/graphify/update_ast.py && python tools/graphify/bridge_edges.py && python tools/graphify/rebuild.py
```

`update_ast.py` reaproveita a semântica já extraída e só refaz o AST. É o
caminho para toda mudança de código. **Regerar os sidecars primeiro é
obrigatório** — senão o AST lê JS velho.

Rodada completa (`run_graphify.py`, ~71k tokens de Gemini) só quando um HTML
mudar de estrutura a ponto da extração semântica ficar errada — e aí vale
reavaliar o custo antes.

Depois de qualquer uma das duas, para nomear as comunidades e gerar o HTML:

```bash
graphify label . --backend gemini && graphify export html
```

⚠ O grafo é **derivado** e está no `.gitignore` (só `GRAPH_REPORT.md` e
`cost.json` ficam versionados). Não é fonte de verdade sobre nada — é atalho de
navegação. Ver [[Source of Truth]].

## Links

[[Token e Navegacao]] · [[Protocolo de Contexto]] ·
[[ADR 0014 - Graphify reaberto com escopo enxuto]] · [[Technical Debt]]
