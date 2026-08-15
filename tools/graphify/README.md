# tools/graphify

Scripts que regeram o grafo do Orenzi. **Existem porque o graphify sozinho não
dá conta deste repo** — e sem eles a rodada de 15/08/2026 não é reproduzível.

Justificativa de cada um:

| Script | Por que existe |
|---|---|
| `derive_js.py` | O graphify trata `.html` como **documento** e nunca passa AST nele. Como todo o JS do Orenzi é inline, as ~500 funções eram invisíveis: sem este passo o grafo saiu com **56 nós**. Extrai o `<script>` de cada HTML para `graphify-out/derived/*.js`. |
| `run_graphify.py` | Driver da pipeline com a **lista de arquivos filtrada** (escopo enxuto: sem `painel_demo.html`, sem `docs/`) e semântica no Gemini em vez de subagente. |
| `bridge_edges.py` | `sb.rpc('nome')` é **string** para o parser de JS. Sem este passo o grafo tem duas ilhas — front de um lado, RPCs e migrations do outro. Injeta 100 arestas casando a string com o nó existente. |
| `rebuild.py` | Reconstrói graph.json + report a partir do extract já enriquecido, sem repetir a extração (que custa dinheiro). |
| `update_ast.py` | Atualização **barata**: refaz só o AST e reaproveita a semântica já extraída. Custo zero. É o caminho normal depois de mudar código. |

## Como rodar

Pré-requisito: `graphifyy[sql,gemini]` instalado e `GEMINI_API_KEY` no ambiente.

```bash
uv tool install --upgrade "graphifyy[sql,gemini]" --force
```

Rodada completa (custa ~71k tokens de Gemini):

```bash
python tools/graphify/derive_js.py && python tools/graphify/run_graphify.py && python tools/graphify/bridge_edges.py && python tools/graphify/rebuild.py
```

Depois, para nomear as comunidades e gerar o HTML:

```bash
graphify label . --backend gemini && graphify export html
```

## Atualização barata (sem LLM, custo zero) — o caminho normal

Depois de mudar código, **regere os sidecars primeiro** — senão o AST lê JS
velho:

```bash
python tools/graphify/derive_js.py && python tools/graphify/update_ast.py && python tools/graphify/bridge_edges.py && python tools/graphify/rebuild.py
```

Depois, para nomear as comunidades e gerar o HTML:

```bash
graphify label . --backend gemini && graphify export html
```

## Escopo

Ficam **fora** do corpus: `painel_demo.html` (espelho), `docs/`, `vault/`,
`tools/`, `preview/`, `archive/`, `media-raw/`, `design/`, `app/assets/`.
O `vault/` é excluído de propósito — indexar a documentação de contexto dentro
do mapa estrutural do código seria circular.

## Avisos

- `graphify-out/derived/` é **artefato**. Nunca editar — a fonte de verdade é o
  `.html`. Está no `.gitignore`.
- Os nós de front apontam para `derived/painel.js`, não para `app/painel.html`;
  o número da linha é o do sidecar.
- A atribuição do **chamador** nas arestas-ponte é heurística (casamento de
  chaves). Para chamada dentro de callback anônimo a aresta é creditada ao
  arquivo, não a uma função.

Limites completos: `vault/02 - Architecture/Graphify - estado e limites.md`.
