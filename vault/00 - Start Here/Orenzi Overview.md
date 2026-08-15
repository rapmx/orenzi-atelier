# Orenzi Overview

**O que é.** Sistema de agendamento do Orenzi Atelier, salão da Juliane em
Dublin, Irlanda. Cliente real, em uso. Dono do projeto: Raphael.

**Três superfícies, quatro páginas:**

| Página | Para quem | O que faz |
|---|---|---|
| `app/index.html` | público | landing PT/EN — hero em vídeo, galeria, antes/depois |
| `app/agendar.html` | cliente do salão | booking em 3 passos + sinal de 20% |
| `app/gerenciar.html` | cliente do salão | self-service: remarcar / cancelar por token |
| `app/painel.html` | Juliane | painel de gestão, 6 abas |

`app/painel_demo.html` é **espelho** do painel com stub do Supabase, para
demonstrar sem login. Toda mudança de tela entra nos dois.

**Stack.** HTML estático, sem build, sem framework, sem npm. CSS e JS inline em
cada arquivo. Supabase por CDN. Deploy por push na `main` →
`orenzi-atelier.vercel.app`. O domínio `orenziatelier.com` é Wix e não hospeda
o app.

**Decisão, não pendência:** a ausência de build é deliberada. Ver
[[ADR 0002 - Sem build, sem framework]].

## Por onde entrar

- **como este vault nasceu e o que ele achou** → [[Handoff 2026-08-15 Intelligence Refresh]]
- estado de cada frente → [[Estado Atual do Produto]]
- que fonte vence qual → [[Source of Truth]]
- como uma sessão deve buscar contexto → [[Protocolo de Contexto]]
- o que trava produção → [[Production Blockers]]
- o que depende da Juliane → [[Waiting on Juliane]]

## Arquitetura em uma frase

Browser é UX, Edge Function é orquestração e notificação, RPC no Postgres é
**autoridade de negócio**. Preço, duração, disponibilidade e elegibilidade
nunca são aceitos do browser. Ver [[Booking Architecture]].

## Links

[[Product Scope]] · [[Juliane - Client 01]] · [[Frontend Architecture]] ·
[[Supabase e Database]]
