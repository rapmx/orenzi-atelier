# Handoff — Encerramento e Booking Polish V3 (18/08/2026)

**HEAD:** `f98f18e` · working tree com **dois arquivos modificados**, os dois de
rodadas antigas e deliberadamente fora dos commits:

```
 M .claude/launch.json      entrada `orenzi-preview` (porta 3100)
 M tools/README.md          documentação dessa entrada
```

Decidir se entram ou voltam atrás continua pendente desde 17/08. **Não é
bloqueio para nada.**

## Commits desta sessão

| Commit | O que é |
|---|---|
| `8957d60` | **Financeiro V1** — aba real + navegação final |
| `f5d5877` | docs do Financeiro, ADR 0016, exceção do eixo |
| `b1b3afb` | **Insights pós-Financeiro** — diagnóstico operacional |
| `f98f18e` | docs da Insights, changelog 1.6.0, grafo |

Anteriores relevantes: `2ac6265` `6545268` `f1831c9` (RBAC V1) · `8aa8e53`
(`final_price`) · `b68281b` (Questionário vira capability de Clientes).

## Fechado — não reabrir sem o Raphael pedir

**Financeiro V1** — implementado e fechado. Responde *"quanto vale a agenda, e
como esse valor está mudando?"*. Distribuição na variante **Analytical**
(aprovada); as variações horizontal e vertical do protótipo **não** existem em
produção e não há switch A/B. Detalhe em [[Financeiro]].

**Insights** — reposicionada para **diagnóstico operacional**, sem nenhuma
sobreposição financeira. Hero é ocupação, não receita. Detalhe em [[Insights]].

```
Insights   = diagnóstico operacional
Financeiro = valor monetário da agenda
```

Separação definitiva. A trava contra o retorno da sobreposição é
`insValidar()`, que falha se qualquer `€` que não seja **taxa por hora**
aparecer na Insights.

**Navegação final por papel:**

```
owner  →  Início · Agenda · Clientes · Insights · Financeiro · Estoque
staff  →  Início · Agenda · Clientes · Estoque
```

Questionário continua **contextual em Clientes**, fora do rodapé.

**RBAC V1** — `owner` = operacional + gerencial; `staff` = operacional
**completo**. A assistente cria, edita, remarca, cancela, bloqueia horário e
define valor final. **`staff` NÃO é limitada aos próprios appointments** — não
existe filtro por `staff_id` em lugar nenhum, e é de propósito. Ver [[RBAC]].

**`final_price`** — implementado. Regra canônica, ponto único
(`appointmentRevenue()`):

```
final_price ?? total_price ?? service.price ?? 0
```

`0` é valor legítimo: a comparação é contra `null`, nunca truthiness.

**Signup público fechado.** O painel só tem `signInWithPassword` — não existe
`signUp` em lugar nenhum do app. Conta se cria pelo Supabase.

**Booking V2** — funcionalmente fechado. **Stripe sandbox** — fechado como
implementação. Ver [[Booking Experience]] e [[Payments - Stripe]].

## Próxima iniciativa — Booking Polish V3

**Objetivo: elevar a sensação premium sem alterar nenhuma regra funcional.**

Foco principal: **`app/agendar.html`**.
`app/gerenciar.html` **só** quando for necessário para a coerência da jornada.

⚠ **A primeira etapa é AUDITORIA VISUAL, não alteração de código.**

### Congelado durante o polish

Não reabrir, não "aproveitar que estou aqui":

- regras de **multi-serviço**;
- **self-service** (remarcar/cancelar);
- **pagamento** e as regras do sinal;
- **manage token**;
- **arquitetura de booking** (Edge Functions, RPCs, RLS).

O escopo é **visual, UX e motion**. Qualquer coisa que mude comportamento sai da
rodada e vira decisão à parte.

### Validação

**Mobile-first, e especialmente iPhone.** O produto é usado no celular; o
desktop é consequência, não alvo. Larguras de referência: 320 / 375 / 390 / 430.

### ⚠ Armadilha que a próxima sessão precisa saber antes de tocar em nada

**`agendar.html` testa contra PRODUÇÃO.** Concluir o fluxo **cria agendamento
real e dispara e-mail** (`trg_notify_new_appointment` → Resend). Para auditar a
tela inteira sem sujar a agenda da Juliane, interceptar por `window.fetch` —
`sb.functions` não dá para interceptar.

## Débitos relevantes só a este polish

Os três tocam a **jornada da cliente**, que é justamente o que vai ser
auditado — nenhum deles é de código nem se resolve nesta frente:

1. **E-mail não chega à cliente** — `orenziatelier.com` não verificado na
   Resend. Quem agenda **não recebe confirmação**. Isso muda o que a tela de
   sucesso pode prometer.
2. **`MANAGE_BASE_URL` aponta para o Wix**, não para o app. O link de gerenciar
   no e-mail leva a uma URL que não serve o `gerenciar.html`.
3. **Pagamento live bloqueado** (Cancellation Policy V2). O passo de sinal só
   roda em sandbox — a copy da política é a v1, e ela é incoerente com o sinal
   de 20%.

Os três dependem da Juliane. Detalhe em [[Production Blockers]].

## Links

[[Booking Experience]] · [[Payments - Stripe]] · [[Production Blockers]] ·
[[Financeiro]] · [[Insights]] · [[RBAC]] · [[Estado Atual do Produto]] ·
[[Handoff 2026-08-18 Insights pos-Financeiro]] ·
[[Handoff 2026-08-18 Financeiro V1]]
