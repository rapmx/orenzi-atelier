# Handoff — Valor Final + Questionário em Clientes (17/08/2026)

**HEAD:** `160856b` · working tree limpo, salvo dois arquivos de tooling (ver
fim). Próximo bloco: **RBAC**.

## Commits desta rodada

| Commit | O que é |
|---|---|
| `df349b9` | `appointmentRevenue()` passa a usar `total_price` congelado |
| `8aa8e53` | **`final_price`** — valor final definido à mão pela profissional |
| `b68281b` | **Questionário sai do rodapé** e vira capability de Clientes |
| `81228b3` `160856b` `8d95f0a` | grafo, sem código |

## Features fechadas — não reabrir sem pedido

Booking V2 · Stripe sandbox · Agenda V2 · Questionário V2 · Splash/Login.
Detalhe em `app/CLAUDE.md` e nos handoffs anteriores.

## Valor do atendimento — regra canônica

```
appointmentRevenue(a) = final_price ?? total_price ?? service.price ?? 0
```

- `final_price` = ajuste manual **posterior**, pela RPC
  `set_appointment_final_price(uuid, numeric)`. `NULL` reseta e o valor volta
  sozinho ao snapshot.
- `total_price` = snapshot do booking. **Nunca sobrescrito** — sustenta a
  conciliação do depósito já cobrado.
- `0` é valor legítimo; a comparação é contra `null`, nunca truthiness.
- **V1 é total por appointment**: multi-serviço não redistribui a diferença
  entre `appointment_services`.
- **Stripe não lê `final_price`.** Depósito, refund e saldo seguem em
  `total_price`. Dívida conhecida.

Seis consumidores, todos pelo helper. `appointmentBookedValue()` é a única
função que ignora `final_price`, e existe só para a tela que mostra os dois.

## Questionário mudou de lugar, não de escopo

```
Clientes → Perfil da cliente → Questionário
```

- Kiosk, três idiomas, perguntas, revisão e persistência **intactos**.
- `state.tab = 'questionario'` continua como **rota interna** — não há dois
  questionários.
- `quizSair()` é a saída única e contextual: aberto pelo perfil, volta ao
  perfil; caminho legado, volta à escolha de cliente.

## Navegação

**Rodapé atual (temporário), 5 abas:**

```
Início · Insights · Agenda · Clientes · Estoque
```

**Direção aprovada, a implementar com o Financeiro:**

```
Início · Agenda · Clientes · Insights · Financeiro · Estoque
```

## Previews aprovados, NÃO implementados

`preview/financeiro-v1.html` e `preview/insights-pos-financeiro.html` estão
aprovados **como direção visual**. Nada disso existe no app real.

⚠ `preview/` é **gitignored** — vive só no HD do Raphael. Servidor local:
`preview_start` com `orenzi-preview` (porta 3100).

Spec do Financeiro V1 e da separação Insights × Financeiro: ver
[[Financeiro]] e [[Insights]].

## Próxima iniciativa — RBAC

Dois papéis: **owner/admin** (a Juliane) e **assistant/staff**.

| Papel | Acessa |
|---|---|
| owner/admin | tudo |
| assistant/staff | `Início · Agenda · Clientes · Estoque` |

Regras não negociáveis:

- **Insights e Financeiro protegidos em UI *e* backend.** Esconder a aba não
  é proteger — hoje `state.tab` é alcançável por código e os dados vêm de
  `SELECT` que qualquer `authenticated` faz.
- **Sem hardcode de e-mail.** O papel é dado, não string no código.

### Achados de segurança que a auditoria do RBAC tem de resolver

Os dois vieram das auditorias desta rodada e **não** são hipóteses:

1. **`authenticated` tem UPDATE amplo em `appointments`.** Policy
   `authenticated update appointments` (`auth.role()='authenticated'`), **sem
   WITH CHECK**, mais o grant de UPDATE na tabela. Qualquer sessão pode
   escrever qualquer coluna — inclusive `total_price`, `status` e os campos do
   Stripe. Foi por isso que `final_price` ganhou RPC dedicada em vez de UPDATE
   direto; a policy em si continua aberta.
2. **`client_questionnaires` permite SELECT e INSERT a qualquer
   `authenticated`.** Append-only por desenho, mas sem noção de quem lê o quê.

Nenhum dos dois foi alterado nesta rodada — mexer neles é trabalho de RBAC,
não de feature.

## Estado local que NÃO pertence a estas features

`.claude/launch.json` e `tools/README.md` estão modificados desde rodadas
anteriores (entrada `orenzi-preview` e a documentação dela). Foram
deliberadamente mantidos fora dos commits recentes. Decidir se entram ou
voltam atrás.

## Dependências externas ainda pendentes

Só a que toca o próximo trabalho: **`LIVE PAYMENTS BLOCKED UNTIL CANCELLATION
POLICY V2 IS APPROVED`**. Não bloqueia o RBAC, mas bloqueia qualquer tela
financeira que fale de dinheiro recebido. Ver [[Production Blockers]].

## Links

[[Estado Atual do Produto]] · [[Financeiro]] · [[Insights]] ·
[[Questionario]] · [[Clientes]] · [[Payments - Stripe]] ·
[[Supabase e Database]] · [[Technical Debt]] · [[Production Blockers]] ·
[[ADR 0010 - Questionario e consulta manual]]
