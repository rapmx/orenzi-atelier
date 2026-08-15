# Waiting on Juliane

O que só ela pode destravar. Nada aqui é resolvível por código.

| # | Item | O que trava | Urgência |
|---|---|---|---|
| 1 | **Cancellation Policy V2** | pagamento live inteiro | 🔴 |
| 2 | **Verificação do domínio na Resend** | e-mail não chega à cliente | 🔴 |
| 3 | **Onboarding Stripe (KYC + IBAN)** | receber dinheiro de verdade | 🟠 |
| 4 | **Domínio definitivo do app** | `MANAGE_BASE_URL` no e-mail | 🟠 |
| 5 | **Fotos reais das referências do Questionário** | etapa de referências fica genérica | 🟡 |
| 6 | **WhatsApp Business** | canal de notificação alternativo | 🟡 |

## Detalhe do que precisa ser decidido, não só entregue

**Cancellation Policy V2** não é "mandar o texto". Precisa responder:

1. a taxa de cancelamento continua fixa (€16) ou vira percentual?
2. o sinal é descontado da taxa, perdido, ou devolvido?
3. qual o prazo que separa cancelamento "cedo" de "tarde"?
4. no-show tem tratamento diferente de cancelamento tardio?

Sem essas quatro respostas, qualquer implementação inventa regra financeira.
Ver [[Payments - Stripe]].

**Fotos do Questionário:** o catálogo é `QUIZ_REFERENCES` e o que vai para o
banco é o **`id`** (`ref_01`…), nunca URL. Quando as fotos chegarem, preenche-se
`imageUrl` — **nem a gravação nem o relatório mudam**. É a integração mais
barata da lista.

## Informações ainda necessárias para telas pendentes

- **[[Splash]]** — o que exibir, e se cobre `agendar.html` também
- **[[Login]]** — comportamento de sessão expirada em tablet compartilhado
- **[[Financeiro - futuro]]** — o que "receita" significa para ela

## Links

[[Production Blockers]] · [[Juliane - Client 01]] · [[Payments - Stripe]] ·
[[Notifications]]
