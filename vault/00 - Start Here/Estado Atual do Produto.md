# Estado Atual do Produto

Snapshot em **18/08/2026**. Confirmado contra o repo e contra o Supabase de
produção — não reconstruído por memória. O snapshot anterior era de 15/08
(HEAD `f36d908`); o que mudou desde então: `final_price`, Questionário dentro
de Clientes, **RBAC V1** e **Financeiro V1**.

## Fechado / maduro

| Frente | Estado | Onde |
|---|---|---|
| **Booking V2** | em produção, sinal obrigatório | [[Booking Experience]] |
| **Self-service** (remarcar/cancelar por token) | em produção | [[Booking Experience]] |
| **Agenda Visual V2** | redesenho de 15/08 concluído | [[Agenda]] |
| **Schedule blocking** | em produção desde 13/08 | [[Schedule Availability]] |
| **Stripe — depósito 20%** | **SANDBOX apenas** | [[Payments - Stripe]] |
| **Questionário V2** | concluído 15/08, migration aplicada | [[Questionario]] |
| **Insights** | V2 pós-Financeiro em produção desde 18/08 | [[Insights]] |
| **RBAC V1** | owner e staff, em produção desde 18/08 | [[RBAC]] |
| **Financeiro V1** | valor da agenda, owner-only, 18/08 | [[Financeiro]] |
| **Home / Início** | padrão visual de referência do app | [[Insights]] |
| **Clientes** | Fase 3 concluída, VIP manual | [[Clientes]] |
| **Estoque** | Fase 1 concluída; DS só planejado | [[Estoque]] |
| **Splash** | redesenhada 15/08; já existia antes, sem registro | [[Splash]] |
| **Login** | V2 em 15/08 — cartão de recepção, sessão expirada resolvida | [[Login]] |

⚠ **"Fechado" não é "em produção livre".** O Stripe está fechado como
*implementação* e bloqueado como *operação* — ver [[Production Blockers]].

## Não iniciado

| Frente | Estado |
|---|---|
| **Password Recovery** | aberta pelo Login V2; só entra end-to-end — [[Product Backlog]] |
| ~~**Financeiro**~~ | **V1 entregue em 18/08/2026** — ver "Fechado / maduro" |
| **Appointment Detail** | auditoria aberta, sem especificação — ver [[Product Backlog]] |
| **Client History** | regra escrita, nada implementado — [[Product Backlog]] |
| **Product Map / SaaS** | **só depois do Orenzi finalizado** |

## Esperando a Juliane

Fotos reais do Questionário · Cancellation Policy V2 · onboarding Stripe
(KYC/IBAN) · WhatsApp Business · domínio + Resend.
Detalhe em [[Waiting on Juliane]].

## Navegação

| Papel | Rodapé |
|---|---|
| owner | Início · Agenda · Clientes · Insights · Financeiro · Estoque |
| staff | Início · Agenda · Clientes · Estoque |

Navegação **final aprovada**, aplicada em 18/08 junto com a tela do Financeiro.
Questionário é capability contextual de Clientes, fora do rodapé.

## Ordem acordada das próximas frentes

1. ~~Splash screen~~ — **fechada em 15/08/2026** ([[Splash]]). Não era frente
   nova: já existia em produção, sem especificação, e foi **redesenhada**.
2. ~~Login~~ — **fechado em 15/08/2026** ([[Login]]), sem recuperação de senha
3. demais pendências do app, com *Password Recovery end-to-end* na fila
4. Product Map / SaaS — **somente** quando o Orenzi estiver finalizado

## O que mudou desde o último snapshot de documento

`docs/README.md` ainda descreve "documentação concluída, implementação não
iniciada" (03/08). Isso está **desatualizado**: PR1 e PR2 do Design System
foram entregues, `app/ds/*.css` existe e é carregado. Ver [[Source of Truth]].

## Último handoff

**18/08/2026** — três blocos no mesmo dia: **RBAC V1**, **Financeiro V1** e a
**Insights pós-Financeiro**. Com o terceiro, a separação
`Insights = diagnóstico operacional` / `Financeiro = valor monetário` está
fechada nas duas pontas: nenhum valor absoluto sobrou na Insights, e nenhum
diagnóstico operacional foi para o Financeiro.

Os dois previews aprovados foram portados; **não há preview pendente**.
Ver [[Handoff 2026-08-18 Insights pos-Financeiro]] e
[[Handoff 2026-08-18 Financeiro V1]].

## Próxima iniciativa

**Booking Polish V3** — visual, UX e motion de `app/agendar.html`, com
`gerenciar.html` só onde a jornada exigir. Objetivo: elevar a sensação premium
**sem alterar regra funcional**. Multi-serviço, self-service, pagamento, manage
token e arquitetura de booking ficam congelados.

⚠ A primeira etapa é **auditoria visual, não alteração de código**. Validação
mobile-first, especialmente iPhone.
Ver [[Handoff 2026-08-18 Encerramento e Booking Polish V3]].

## Links

[[Orenzi Overview]] · [[Production Blockers]] · [[Technical Debt]] ·
[[Product Backlog]] · [[Financeiro]] · [[Insights]] · [[RBAC]] ·
[[Handoff 2026-08-18 Encerramento e Booking Polish V3]] ·
[[Handoff 2026-08-18 Insights pos-Financeiro]] ·
[[Handoff 2026-08-18 Financeiro V1]] · [[Booking Experience]]
