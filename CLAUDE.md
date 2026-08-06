# PROJECT ORENZI

Sistema de agendamento do **Orenzi Atelier**, salão da Juliane em Dublin,
Irlanda. Cliente real, em uso. Dono do projeto: Raphael (fala português).

Site público em PT/EN + página de agendamento para a cliente + painel de gestão
para a Juliane. HTML estático, sem build, sem framework, sem npm — cada arquivo
carrega o Supabase por CDN e tem todo o CSS e JS inline. Abrir com
`npx serve app` ou qualquer servidor estático.

## Onde fica cada coisa

| Pasta | O que é |
|---|---|
| `app/` | **o código.** É aqui que se trabalha — leia `app/CLAUDE.md` antes de editar |
| `docs/` | proposta em PDF, SKILL.md |
| `design/` | referências de UI, screenshots, template de referência |
| `media-raw/` | 63 MB de mp4/png originais · fora do git |
| `archive/` | versão de julho e cópias antigas · fora do git |
| `graphify-out/` | grafo do código, **congelado em 02/08/2026** — ver abaixo |

**`app/CLAUDE.md` é o índice do código**: tem a tabela de âncoras dizendo em que
função está cada assunto (agenda, estoque, insights, login, fuso). Leia ele e
use grep direcionado — nunca varra os HTMLs inteiros, `painel.html` tem ~3.000
linhas e custa caro.

## Orenzi UI contract

Before creating, modifying or reviewing any interface:

1. Read `/docs/README.md` and the numbered series it indexes (`01_PRODUCT_LANGUAGE.md`
   through `10_GOVERNANCE_AND_CHANGELOG.md`). `ORENZI_DESIGN_SYSTEM_v1.0.md` is
   superseded by `03_DESIGN_SYSTEM.md` — kept only as historical record, not a
   reading source.
2. Reuse the shared tokens, components and patterns defined by the Orenzi Design System.
3. Do not introduce raw colors, arbitrary spacing, local radius values, new shadow styles or one-off animation durations unless explicitly approved.
4. Mobile is the source of truth, supporting widths from 320px to 430px.
5. When displayed in a desktop browser, the mobile application must remain centered and must not stretch across the entire viewport unless a separate desktop specification is provided.
6. Preserve backend behavior, business logic, routes, APIs, database structure and data contracts during visual changes.
7. Every interface must include appropriate loading, empty, error, disabled, focus-visible and reduced-motion behavior.
8. If the Design System does not cover a requirement, stop and propose an extension before creating a local exception.

## Git

Repo privado: `https://github.com/rapmx/orenzi-atelier` (conta `rapmx`).
gh CLI em `C:\Program Files\GitHub CLI\gh.exe`, HTTPS, já autenticado.

O git existe por um motivo específico: o Raphael edita o projeto tanto no Claude
Code quanto no Claude Chat, e em 01/08/2026 uma sessão salvou por cima do
`painel.html` que outra tinha refatorado — o trabalho sumiu sem ninguém ver.
**Commitar e dar push ao fim de qualquer mudança relevante**, senão a proteção
não serve para nada.

## Decisões já tomadas — não reabrir sem o Raphael pedir

- **Tema claro.** O tema escuro foi recusado pela cliente. Não reintroduzir.
- **Nada de graphify / Obsidian.** Já foi medido: ~300 mil tokens por extração,
  porque os HTMLs monolíticos vão inteiros para o LLM, e o custo é recorrente.
  Num projeto de 11 arquivos não se paga. O `graphify-out/graph.html` que existe
  está congelado em 02/08 e não deve ser atualizado.
- **Expediente 9h–18h, fecha domingo e segunda.** Está duplicado em
  `agendar.html` e `painel.html` — mudou num, muda no outro, senão vira
  overbooking.
- **`painel_demo.html` é espelho do `painel.html`.** Toda mudança de tela entra
  nos dois. O que difere é só o stub de `window.supabase` no topo do demo.

## Armadilhas conhecidas

- **Fuso.** O expediente é `Europe/Dublin`, não o do aparelho de quem agenda.
  Nunca montar horário com `new Date('YYYY-MM-DDT00:00:00')` — use
  `salonTimeToInstant()`. Um celular no horário do Brasil gravava "9h" como 13h
  em Dublin, e a falha é silenciosa.
- **Escrita autenticada precisa de `.select()` no fim.** Com a sessão expirada a
  RLS deixa o `update` passar sem tocar em linha nenhuma, e a tela mentiria.
- **Trigger de e-mail.** `trg_notify_new_appointment` dispara Resend a cada
  INSERT em `appointments`. Cuidado ao inserir dados de teste.

## Credenciais

A chave da Resend está **fora do projeto**, em
`C:\Users\schul\.secrets\orenzi-resend-api-key.txt`. A `sb_publishable_*` do
Supabase é a chave pública do cliente e pode ficar no código.

Projeto Supabase: `gsagtsxkhqlpxuvrijgw`.

## Como o Raphael gosta de trabalhar

Responder em português, direto ao ponto. Priorizar resultado funcional sobre
arquitetura perfeita, com mudanças cirúrgicas. Perguntar antes de decisões
grandes (estrutura de banco, biblioteca nova, mudança de escopo) em vez de
assumir e implementar. Se o resultado não ficou bom, dizer — não fingir.
