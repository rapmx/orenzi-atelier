# Protocolo de Contexto

**O que é.** Onde uma sessão deve procurar contexto antes de implementar, para
não redescobrir o projeto toda vez nem gastar token varrendo HTML de 555 KB.

**Por que existe.** `painel.html` tem ~555 KB e `painel_demo.html` ~602 KB.
Uma varredura desses dois arquivos custa mais que a tarefa inteira na maioria
dos casos. As três camadas (vault, `graphify-out/`, `CLAUDE.md`) existem para
tornar a varredura desnecessária — não para serem consultadas todas, sempre.

## A decisão em quatro linhas

| A pergunta é… | Vá primeiro em |
|---|---|
| "por que isso é assim?", "já foi decidido?", "o que falta?" | **vault** (`03 - Decisions`, `04 - Backlog`) |
| "onde está X?", "o que quebra se eu mexer em Y?" | **graphify** (`graphify query`, `affected`) |
| "qual a regra de negócio disso?" | **`app/CLAUDE.md`** (tabela de âncoras) |
| "que valor visual eu uso?" | **`docs/03`, `docs/04`** |

## Quando NÃO consultar nada

Mudança localizada num ponto que já está no contexto da sessão. Se você já leu
a função, já sabe onde ela está e a mudança é de uma linha, **não abra grafo
nem vault**. O protocolo é para reduzir busca, não para criar ritual.

## Quando o grep direto ganha

Grep vence quando você já sabe **o nome** do que procura. `grep -n
"renderAgenda" app/painel.html` responde na hora e de graça. O grafo ganha
quando você **não sabe o nome** e precisa do vizinho: "o que mais toca
`schedule_blocks`", "o que depende de `salonTimeToInstant`".

Ver [[Token e Navegacao]] para o custo comparado de cada caminho.

## Manter a camada em dia

Um comando só, sem LLM, sem commit:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File tools\intel-refresh.ps1
```

Ele regera o grafo pelo caminho barato, valida as cadeias críticas, valida os
wikilinks do vault, procura notas órfãs, roda o secret scan e reporta
inconsistências conhecidas.

**Rode depois de:** mudança estrutural relevante · fechar feature grande ·
migration nova · Edge Function nova · mudança de arquitetura · editar o vault.

**Não precisa depois de:** microajuste de CSS, mudança de copy, renomear
variável local — nada que não mude quem chama quem.

Detalhe em `tools/README.md`.

## Em caso de conflito

**Repo atual + migration aplicada + código deployado vencem documentação
histórica.** Sempre. Ver [[Source of Truth]] para a hierarquia completa e a
lista de divergências já conhecidas.

Se você encontrar uma divergência nova: **registre-a**, não escolha em
silêncio. Uma linha em [[Technical Debt]] basta.

## Antes de mexer em interface

Contrato obrigatório do projeto (`CLAUDE.md` raiz, "Orenzi UI contract"):
ler `docs/README.md` e a série numerada, reusar tokens e componentes do DS,
mobile 320–430px como fonte de verdade, e propor extensão em vez de exceção
local. Isso continua valendo e não é substituído por este protocolo.

## Links

[[Source of Truth]] · [[Token e Navegacao]] · [[Estado Atual do Produto]]
