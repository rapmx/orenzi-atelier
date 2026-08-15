# Estado Atual do Produto

Snapshot em **15/08/2026**, HEAD `f36d908`. Confirmado contra o repo e contra o
Supabase de produção — não reconstruído por memória.

## Fechado / maduro

| Frente | Estado | Onde |
|---|---|---|
| **Booking V2** | em produção, sinal obrigatório | [[Booking Experience]] |
| **Self-service** (remarcar/cancelar por token) | em produção | [[Booking Experience]] |
| **Agenda Visual V2** | redesenho de 15/08 concluído | [[Agenda]] |
| **Schedule blocking** | em produção desde 13/08 | [[Schedule Availability]] |
| **Stripe — depósito 20%** | **SANDBOX apenas** | [[Payments - Stripe]] |
| **Questionário V2** | concluído 15/08, migration aplicada | [[Questionario]] |
| **Insights** | encerrado (commit `42e6e43`) | [[Insights]] |
| **Home / Início** | padrão visual de referência do app | [[Insights]] |
| **Clientes** | Fase 3 concluída, VIP manual | [[Clientes]] |
| **Estoque** | Fase 1 concluída; DS só planejado | [[Estoque]] |

⚠ **"Fechado" não é "em produção livre".** O Stripe está fechado como
*implementação* e bloqueado como *operação* — ver [[Production Blockers]].

## Não iniciado

| Frente | Estado |
|---|---|
| **Splash screen** | só backlog, aprovada para depois deste refresh — [[Splash]] |
| **Login** | só backlog, redesign posterior — [[Login]] |
| **Financeiro** | conceito, sem escopo — [[Financeiro - futuro]] |
| **Appointment Detail** | auditoria aberta, sem especificação — ver [[Product Backlog]] |
| **Client History** | regra escrita, nada implementado — [[Product Backlog]] |
| **Product Map / SaaS** | **só depois do Orenzi finalizado** |

## Esperando a Juliane

Fotos reais do Questionário · Cancellation Policy V2 · onboarding Stripe
(KYC/IBAN) · WhatsApp Business · domínio + Resend.
Detalhe em [[Waiting on Juliane]].

## Ordem acordada das próximas frentes

1. Splash screen
2. Login
3. demais pendências do app
4. Product Map / SaaS — **somente** quando o Orenzi estiver finalizado

## O que mudou desde o último snapshot de documento

`docs/README.md` ainda descreve "documentação concluída, implementação não
iniciada" (03/08). Isso está **desatualizado**: PR1 e PR2 do Design System
foram entregues, `app/ds/*.css` existe e é carregado. Ver [[Source of Truth]].

## Links

[[Orenzi Overview]] · [[Production Blockers]] · [[Technical Debt]] ·
[[Product Backlog]]
