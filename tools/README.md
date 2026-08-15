# tools/

Ferramentas da **camada de inteligência** do Orenzi. Nada aqui é código de
produto — não entra no app, não é servido, não é deployado.

## O comando

```powershell
pwsh -File tools/intel-refresh.ps1
```

Sem `pwsh` (Windows PowerShell 5.1 serve):

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File tools\intel-refresh.ps1
```

Só validar, sem tocar no grafo:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File tools\intel-refresh.ps1 -SkipGraph
```

Sai `0` se tudo passou, `1` se algo falhou.

## Quando rodar

**Rode depois de:**

- mudança estrutural relevante (função nova que outras chamam, arquivo novo,
  fluxo novo);
- fechar uma feature grande;
- **migration nova** — o grafo precisa enxergar a tabela/RPC nova;
- **Edge Function nova** ou alterada;
- mudança importante de arquitetura;
- editar o vault (para pegar link quebrado e nota órfã antes de commitar).

**Não precisa rodar depois de:**

- microajuste de CSS;
- mudança de copy;
- renomear uma variável local;
- qualquer coisa que não muda quem chama quem.

**Não roda sozinho.** Não há git hook, não roda a cada commit — de propósito.
Um refresh a cada commit gastaria tempo para redesenhar um grafo que não mudou,
e criaria ruído de diff em `graph.json` (que é um arquivo de 1 MB).

## O que ele faz

| # | Passo | Custo |
|---|---|---|
| 1 | regera os sidecars do JS inline (`derive_js.py`) | grátis |
| 2 | reextrai o AST, **reaproveita** a semântica (`update_ast.py`) | grátis |
| 3 | injeta as arestas-ponte JS → Supabase (`bridge_edges.py`) | grátis |
| 4 | reconstrói `graph.json` + `GRAPH_REPORT.md` (`rebuild.py`) | grátis |
| 5 | exporta `graph.html` | grátis |
| 6 | valida as cadeias críticas do grafo (`validate_graph.py`) | grátis |
| 7 | valida wikilinks e notas órfãs (`validate_vault.py`) | grátis |
| 8 | secret scan sobre o que iria num commit (`secret_scan.py`) | grátis |
| 9 | reporta inconsistências conhecidas (`check_consistency.py`) | grátis |
| 10 | imprime resumo + `git status` + `git diff --stat` | grátis |

**Custo total: zero.** Nenhuma chamada de LLM.

## O que ele NÃO faz, de propósito

- **não commita, não empurra, não deploya**;
- **não chama LLM.** Nomear comunidade é a única etapa que custaria — e ela é
  manual;
- não instala git hook;
- não roda em todo commit.

## Nomes de comunidade

Nomear as ~38 comunidades do grafo custa LLM, então o refresh **nunca renomeia**.
Duas proteções mantêm os nomes vivos de graça:

1. **Não reclusteriza se o conjunto de nós não mudou.** `cluster()` não é
   determinístico: reclusterizar um grafo idêntico produz partição diferente,
   os ids mudam e os nomes se perdem. Se nenhum nó entrou nem saiu, a partição
   anterior continua valendo.
2. **Quando reclusteriza, migra os nomes por sobreposição de nós** — cada
   comunidade nova herda o nome daquela com que mais compartilha nós, exigindo
   ≥ 50% de sobreposição. Casar por id não funcionaria: id de comunidade não é
   estável, e casar errado é pior que placeholder.

Se o resumo disser `PLACEHOLDER` ou que algumas ficaram sem nome, renomear é
manual e **custa LLM**:

```bash
graphify label . --backend gemini
```

## Abrir o grafo visualmente

O refresh regera `graphify-out/graph.html` — 739 nós num canvas interativo, com
painel de inspeção de nó e filtro por comunidade.

**Jeito mais simples:** duplo clique no arquivo, ou

```bash
start "" "graphify-out\graph.html"
```

⚠ **Precisa de internet.** O export oficial do graphify carrega o
`vis-network@9.1.6` do unpkg por CDN, não embute. Offline a página abre mas o
grafo não desenha.

**Servido por HTTP** — necessário quando o navegador embutido do Claude Code não
abre `file://`. Existe uma entrada `orenzi-graph` em `.claude/launch.json`:

| campo | valor |
|---|---|
| nome | `orenzi-graph` |
| comando | `npx serve graphify-out -l 3210` |
| porta | 3210 |
| URL | `http://localhost:3210/graph.html` |

No Claude Code: `preview_start` com `{name: "orenzi-graph"}`, depois navegar
para `/graph.html`. Fora dele, o mesmo efeito no terminal:

```bash
npx serve graphify-out -l 3210
```

A entrada serve a pasta inteira do `graphify-out/`, então `GRAPH_REPORT.md` e
`graph.json` também ficam alcançáveis pela mesma porta. É config de
desenvolvimento — não tem relação com o app (`orenzi-app`, porta 3000).

## Os arquivos

| Arquivo | O que é |
|---|---|
| `intel-refresh.ps1` | o comando |
| `validate_graph.py` | cadeias críticas + invariantes de arquitetura |
| `validate_vault.py` | wikilinks quebrados + notas órfãs |
| `secret_scan.py` | segredos no que o git levaria |
| `check_consistency.py` | checagens offline (espelho painel/demo, expediente, etc.) |
| `graphify/` | os scripts do grafo — ver `graphify/README.md` |

## Pré-requisito

```bash
uv tool install --upgrade "graphifyy[sql,gemini]"
```

O `[sql]` é o que faz as 11 migrations entrarem no grafo; sem ele toda a camada
de banco some. O `[gemini]` só é usado na etapa manual de nomear.

## Uma coisa que este comando já pegou

Na primeira execução ele falhou em dois pontos — um `TypeError` no rebuild e uma
asserção errada no validador (tentava provar "o browser não chama X" por
alcance num grafo não-dirigido, onde quase tudo alcança quase tudo). Os dois
foram corrigidos. É o tipo de coisa que ele existe para achar.
