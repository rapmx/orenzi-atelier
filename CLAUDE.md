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
| `vault/` | **contexto de produto** (Obsidian): decisões, ADRs, backlog, handoffs |
| `docs/` | Design System (série 01–10), roadmap, proposta em PDF |
| `supabase/` | migrations e Edge Functions — espelho **parcial**, ver abaixo |
| `design/` | referências de UI, screenshots, template de referência |
| `media-raw/` | 63 MB de mp4/png originais · fora do git |
| `archive/` | versão de julho e cópias antigas · fora do git |
| `graphify-out/` | grafo do código, regenerado em 15/08/2026 — ver abaixo |

**`app/CLAUDE.md` é o índice do código**: tem a tabela de âncoras dizendo em que
função está cada assunto (agenda, estoque, insights, login, fuso). Leia ele e
use grep direcionado — nunca varra os HTMLs inteiros: `painel.html` tem 555 KB
(~140k tokens) e `painel_demo.html` 602 KB (~150k).

## Protocolo de contexto — onde procurar antes de implementar

Três camadas, com papéis diferentes. **Não consulte as três em toda tarefa.**

| A pergunta é… | Vá primeiro em |
|---|---|
| "por que é assim?", "já foi decidido?", "o que falta?", "de quem depende?" | **`vault/`** — `03 - Decisions`, `04 - Backlog` |
| "onde está X?", "o que quebra se eu mexer em Y?" | **`graphify-out/`** — `graphify query` / `path` / `affected` |
| "qual a regra de negócio disso?" | **`app/CLAUDE.md`** (tabela de âncoras) |
| "que valor visual eu uso?" | **`docs/03`, `docs/04`** |
| já sei o nome do símbolo | **grep** — mais barato que tudo |
| mudança de uma linha num ponto já lido | **nada** — só edite |

Vault responde **"devo?"**; grafo responde **"onde?"**. Se você já sabe que
deve, não abra o vault. Se você já sabe onde é, não abra o grafo.

**Ponto de entrada do vault:** `vault/00 - Start Here/Orenzi Overview.md`.

**Manter a camada em dia** — um comando, sem LLM, sem commit:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File tools\intel-refresh.ps1
```

Rode depois de mudança estrutural, feature grande fechada, migration nova, Edge
Function nova ou mudança de arquitetura. **Não** depois de microajuste de CSS ou
copy. Detalhe em `tools/README.md`.

## Hierarquia de fonte de verdade

Quando duas fontes divergirem, vence a de cima:

1. **estado real do Supabase** (migrations aplicadas, RPCs, RLS) + **código deployado**
2. `app/CLAUDE.md` — regras do domínio e armadilhas
3. `docs/01`–`docs/10` — regras de produto, UI, DS, acessibilidade
4. `vault/` — rationale, decisão, contexto, pendência
5. `graphify-out/` — navegação estrutural
6. `docs/roadmap.md`, handoffs, changelog — registro histórico

**Repo atual + migration aplicada + código deployado vencem documentação
histórica.** Sempre. O vault fica em 4º porque é o único que ninguém executa —
código e migration quebram quando mentem; documento só envelhece em silêncio.

Duas exceções: **acessibilidade tem veto** (`docs/10 §2`) e **backend, banco,
RPCs, rotas e regras de negócio são intocáveis** em rodada visual.

⚠ **Ao encontrar uma divergência nova: registre-a em
`vault/04 - Backlog/Technical Debt.md`, não escolha em silêncio.** As já
conhecidas (em 15/08/2026) estão em `vault/00 - Start Here/Source of Truth.md`.

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
- **Graphify e Obsidian: reabertos em 15/08/2026.** A recusa de 02/08 (~300 mil
  tokens por extração) valia enquanto a semântica rodava em subagente Claude.
  Com `GEMINI_API_KEY` no ambiente e escopo enxuto (sem `painel_demo.html`, sem
  `docs/`) a rodada custou **70.960 tokens de Gemini** e o grafo saiu com 734
  nós contra 258. Regenerado sobre `f36d9086`. Detalhe e limites em
  `vault/02 - Architecture/Graphify - estado e limites.md` e no ADR 0014.
  ⚠ O grafo **não** é fonte de verdade sobre nada — é atalho de navegação, e é
  derivado (`.gitignore`, só `GRAPH_REPORT.md` e `cost.json` ficam versionados).
- **Expediente 9h–18h, fecha domingo e segunda.** Está em **três** lugares, não
  dois: `app/shared/salon.js` (o que a UI desenha), `is_public_booking_window()`
  no SQL (o que a RLS **aceita**) e o painel. Mudar só o JS faz a UI oferecer
  horário que o banco recusa; mudar só o SQL faz o banco aceitar horário que a
  UI nunca oferece. Duplicação **aceita conscientemente** enquanto o produto for
  single-establishment — ADR 0007.
- **Pagamento: sinal de 20% do valor BASE, Stripe em SANDBOX.** Serviço com
  `price_varies` cobra 20% do `services.price` (o piso) — copy tem que dizer
  "valor base", nunca "valor final". **`LIVE PAYMENTS BLOCKED UNTIL
  CANCELLATION POLICY V2 IS APPROVED`**: a policy v1 promete taxa fixa de €16 e
  desconto do sinal, o que com 20% viraria devolver dinheiro. Detalhes em
  `app/CLAUDE.md`.
- **`painel_demo.html` é espelho do `painel.html`.** Toda mudança de tela entra
  nos dois. O que difere é só o stub de `window.supabase` no topo do demo.

## Armadilhas conhecidas

- **Fuso, ida.** O expediente é `Europe/Dublin`, não o do aparelho de quem
  agenda. Nunca montar horário com `new Date('YYYY-MM-DDT00:00:00')` — use
  `salonTimeToInstant()`. Um celular no horário do Brasil gravava "9h" como 13h
  em Dublin, e a falha é silenciosa.
- **Fuso, volta.** O caminho inverso também morde: `toISOString().split('T')[0]`
  sobre meia-noite **local** devolve o dia −1 em Dublin no horário de verão. Bug
  real em produção (13/08/2026): a Juliane tocava `22/08` e gravava `21/08`.
  Data civil sai de `dateInputValue(d)`, nunca de `toISOString()`.
- **Escrita autenticada precisa de `.select()` no fim.** Com a sessão expirada a
  RLS deixa o `update` passar sem tocar em linha nenhuma, e a tela mentiria.
- **Trigger de e-mail.** `trg_notify_new_appointment` dispara Resend a cada
  INSERT em `appointments`. Cuidado ao inserir dados de teste.
- **`supabase/migrations/` é espelho PARCIAL.** 11 arquivos locais contra 38
  migrations aplicadas — só de `booking_v2` (09/08) em diante existe arquivo.
  Não achar um objeto no repo **não** significa que ele não exista: confirme no
  Supabase. Os timestamps dos nomes locais também não batem com as versões
  aplicadas.
- **E-mail do trigger formata no fuso do salão, não no do servidor.** O Deno da
  Supabase roda em UTC: sem `timeZone` explícito, o e-mail mostrava uma hora a
  menos que a tela no horário de verão irlandês. Ver
  `supabase/functions/send-appointment-email/index.ts`.

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
