# Source of Truth

**O que é.** A ordem em que as fontes vencem quando divergem. Existe porque o
projeto tem quatro camadas de documentação e elas *já* divergiram — ver
"Divergências conhecidas" no fim.

## Hierarquia

Da mais forte para a mais fraca:

| # | Fonte | Autoridade sobre |
|---|---|---|
| 1 | **Estado real do Supabase** (migrations aplicadas, RPCs, triggers, RLS) + **código deployado** | o que o sistema *faz* |
| 2 | `app/CLAUDE.md` | regras do domínio e armadilhas do código |
| 3 | `docs/01`–`docs/10` | regras de produto, UI, DS, acessibilidade |
| 4 | **este vault** | rationale, decisão, contexto, pendência |
| 5 | `graphify-out/` | navegação estrutural — onde algo está, o que toca o quê |
| 6 | `docs/roadmap.md`, handoffs, changelog | registro histórico |

## As três regras que resolvem quase tudo

1. **Comportamento observável vence documento.** Se a migration está aplicada e
   o documento diz "pendente", o documento está errado. Verificar o banco antes
   de acreditar em qualquer nota de status.
2. **Regra vence valor, valor vence regra — depende do tipo.** Divergência de
   *valor visual* (um hex, um raio): o código vence e o doc se corrige.
   Divergência de *regra*: o doc vence e o código se corrige. É a regra do
   `docs/README.md §Fonte de verdade`, e continua valendo.
3. **Este vault nunca é autoridade sobre implementação.** Ele diz *por que*.
   Quem diz *como* é o código e o `app/CLAUDE.md`.

## Por que o vault fica em 4º e não em 1º

Porque ele é o único que ninguém executa. Código quebra quando mente;
migration falha quando mente; o vault só envelhece em silêncio. Colocá-lo
acima do código transformaria erro de manutenção em erro de produção.

## Exceções que não seguem a hierarquia

- **Acessibilidade tem veto** sobre qualquer decisão visual (`docs/10 §2`).
- **Backend, banco, RPCs, triggers, rotas e regras de negócio são intocáveis**
  em qualquer rodada de mudança visual.

## Divergências — achadas e corrigidas em 15/08/2026

Seis divergências saíram da auditoria; **cinco foram corrigidas** no mesmo dia:

| Assunto | Estado |
|---|---|
| Migration do Questionário V2 dita "pendente" — está **aplicada** (`20260814233019`) | ✅ corrigido em `docs/roadmap.md` e `app/CLAUDE.md` |
| `app/CLAUDE.md §Banco` listava 15 tabelas; produção tem **19** | ✅ corrigido |
| `send-appointment-email` ativa sem fonte no repo | ✅ fonte da v8 recuperada e versionada |
| `docs/README.md §Situação atual` dizia "Implementação não iniciada" | ✅ corrigido |
| `docs/10 §17` mandava ADR em `/docs/adr/`, pasta que nunca existiu | ✅ aponta para `vault/03 - Decisions/` |
| Changelog do DS parado em `1.2.1` (13/08) | 🔶 **em aberto** — faltam 1.3.0 e 1.4.0 |

## Divergências estruturais que permanecem

Não são erro de redação — são propriedades do repo, e é preciso conviver com
elas:

- **`supabase/migrations/` é espelho parcial**: 11 arquivos locais contra 38
  migrations aplicadas. Não achar um objeto no repo **não** significa que ele
  não exista — confirme no Supabase.
- **Os timestamps dos nomes locais não batem** com as versões aplicadas; foram
  escritos à mão. A versão aplicada é a autoridade.

Detalhe em [[Technical Debt]].

## Links

[[Protocolo de Contexto]] · [[Estado Atual do Produto]] · [[Supabase e Database]]
