# Token e Navegação

**O que é.** Quando cada camada de contexto compensa, e quando não compensa.

**Por que existe.** Nenhuma das três camadas é grátis, e a mais cara delas
(varrer os HTMLs) é justamente a mais fácil de acionar sem pensar.

## Custos medidos (15/08/2026)

Não são estimativas de marketing — são medições deste repo:

| Ação | Custo |
|---|---|
| Ler `app/painel.html` inteiro | 555 KB ≈ **~140k tokens** |
| Ler `app/painel_demo.html` inteiro | 602 KB ≈ **~150k tokens** |
| Ler `app/CLAUDE.md` inteiro | 79 KB ≈ **~20k tokens** |
| Ler a tabela de âncoras do `app/CLAUDE.md` | ~1k tokens |
| `graphify query "..." --budget 2000` | **~2k tokens**, teto configurável |
| `graphify explain "renderAgenda"` | ~300 tokens |
| `grep -n "renderAgenda" app/painel.html` | ~50 tokens |
| Regenerar o grafo inteiro | 71k tokens **no Gemini**, não na sessão |

**A conta que importa:** uma pergunta de "onde está / o que quebra" respondida
por `graphify query` custa ~2k tokens contra ~140k de varredura. Duas
consultas por sessão já pagam a rodada de regeneração inteira.

**O que eu NÃO vou prometer:** um "X% a menos de tokens" agregado. Depende
inteiramente do tipo de tarefa, e a maioria das tarefas do Orenzi é cirúrgica
o bastante para não precisar de nenhum dos dois.

## Regra prática

| Situação | Faça |
|---|---|
| Sei o nome do símbolo | **grep** — mais rápido e mais barato que tudo |
| Não sei onde está, sei o assunto | **âncoras do `app/CLAUDE.md`**, depois grep |
| Preciso do impacto de uma mudança | **`graphify affected "X"`** |
| Preciso da cadeia entre duas pontas | **`graphify path "A" "B"`** |
| Preciso saber *por que* é assim | **vault** — `03 - Decisions` |
| Preciso do valor visual | **`docs/03`, `docs/04`** |
| A mudança é de uma linha num ponto já lido | **nada** — só edite |

## Como não consultar os dois à toa

Vault e grafo respondem perguntas **diferentes**, e quase nunca a mesma tarefa
precisa dos dois:

- vault responde **"devo?"** — foi decidido, está bloqueado, depende de quem
- grafo responde **"onde?"** — que arquivo, que função, o que mais toca isso

Se você já sabe que deve fazer, não abra o vault. Se você já sabe onde é, não
abra o grafo.

## Comandos úteis

```bash
graphify query "como o hold de pagamento entra na disponibilidade" --budget 1500
graphify path "renderAgenda()" "public.schedule_blocks"
graphify explain "renderAgenda()"
graphify affected "graphify_out_derived_agendar_salontimetoinstant" --depth 2
graphify god-nodes --top 15
```

⚠ **Duas pegadinhas de sintaxe que fazem parecer que o grafo está errado:**

1. **Função é `Nome()`, com parênteses.** `explain "salonTimeToInstant"` devolve
   "no unique node match"; `explain "salonTimeToInstant()"` funciona.
2. **O mesmo símbolo existe em mais de um arquivo** (`salonTimeToInstant()` em
   `agendar.js` **e** `gerenciar.js`; `public.get_booking_by_token()` em duas
   migrations). O comando pede desambiguação — passe o **node id completo**, que
   ele mesmo imprime.

## Links

[[Protocolo de Contexto]] · [[Graphify - estado e limites]] · [[Source of Truth]]
