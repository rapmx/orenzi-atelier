# Production Blockers

O que impede o Orenzi de operar plenamente **hoje**. Não é backlog de melhoria
— é o que quebra a operação real.

## 1. 🔴 Pagamento live bloqueado — Cancellation Policy V2

**Estado:** bloqueado por decisão de negócio, não por código.

A policy v1 em produção promete **taxa fixa de €16** e diz que "o sinal é
descontado de qualquer taxa de cancelamento". Com depósito de 20%, um serviço
de €290 gera sinal de €58 — descontar €58 de €16 implica **devolver dinheiro**
em cancelamento tardio.

**Guard técnico ativo:** as duas Edge Functions recusam qualquer
`STRIPE_SECRET_KEY` que não comece com `sk_test_`. Não adianta trocar a chave.

**Quem destrava:** a Juliane, aprovando a v2. Ver [[Waiting on Juliane]].

## 2. 🔴 E-mail não chega à cliente — domínio não verificado na Resend

`orenziatelier.com` **não está verificado** na Resend. Enquanto isso, os e-mails
de agendamento só chegam ao dono da conta. A cliente real que agenda **não
recebe confirmação**.

Isso afeta o caminho principal do produto: agendar → confirmar → receber o link
de gerenciamento.

**Quem destrava:** a Juliane (acesso ao DNS do domínio).

## 3. 🟠 `MANAGE_BASE_URL` aponta para o lugar errado

O default é `https://orenziatelier.com/gerenciar.html`, mas o app está hospedado
em `orenzi-atelier.vercel.app`. `orenziatelier.com` é **Wix**.

Consequência: o link de gerenciar no e-mail leva a uma URL que não serve o app.

**Como destravar:** definir o secret `MANAGE_BASE_URL` nas duas Edge Functions.
É configuração, não código — mas depende de decidir qual é a URL definitiva.

## 4. 🟠 Stripe live sem onboarding

KYC e IBAN não foram concluídos. Mesmo com a policy v2 aprovada, não há conta
capaz de receber.

**Quem destrava:** a Juliane.

## Não é bloqueador (mas parece)

- **Migration do Questionário V2** — `docs/roadmap.md` diz pendente; está
  **aplicada**. Ver [[Source of Truth]].
- **Fotos do Questionário** — os placeholders são declarados e o produto
  funciona sem elas; só a etapa de referências fica genérica.

## Links

[[Payments - Stripe]] · [[Notifications]] · [[Waiting on Juliane]] ·
[[Edge Functions]] · [[Estado Atual do Produto]]
