# Frontend Architecture

**O que é.** Quatro HTMLs estáticos + um espelho de demo. Sem build, sem
framework, sem npm, sem bundler.

## Decisão atual

Tudo inline. Não existe nenhum `<script src>` local exceto
`app/shared/salon.js` e `app/ds/*` — a única tag externa real é o CDN do
supabase-js (e o Stripe.js no `agendar.html`).

**Por quê.** Decisão deliberada, não pendência — ver
[[ADR 0002 - Sem build, sem framework]]. Abrir com `npx serve app`.

## Os arquivos

| Arquivo | Tamanho | Papel |
|---|---|---|
| `app/index.html` | 70 KB | landing pública PT/EN |
| `app/agendar.html` | 138 KB | booking da cliente |
| `app/gerenciar.html` | 61 KB | self-service por token |
| `app/painel.html` | **555 KB** | painel da Juliane, 6 abas |
| `app/painel_demo.html` | **602 KB** | espelho com stub do Supabase |
| `app/design-system.html` | 31 KB | vitrine do DS |

⚠ **Nunca varrer `painel.html` ou `painel_demo.html` inteiros.** Custa ~140k e
~150k tokens. Use as âncoras de `app/CLAUDE.md` + grep, ou o grafo.
Ver [[Token e Navegacao]].

## Camada compartilhada

| Caminho | O que é |
|---|---|
| `app/shared/salon.js` | `window.OrenziSalon` — `OPEN_HOUR`, `CLOSE_HOUR`, `SLOT_MINUTES`, `CLOSED_WEEKDAYS`, `SALON_TZ` |
| `app/ds/orenzi-tokens.css` | tokens do Design System |
| `app/ds/orenzi-base.css` | reset e base |
| `app/ds/orenzi-components.css` | componentes `.o-*` |
| `app/ds/orenzi-ui.js` | `orenziUI` — toast, busy, confirmDialog |

**Estado do DS:** os arquivos existem e **já carregam** (PR1 e PR2 entregues).
Os tokens valem; os componentes `.o-*` ainda não foram aplicados em toda tela.

## Espelho painel / painel_demo

`painel_demo.html` é cópia do `painel.html` com um stub de `window.supabase` no
topo: leitura vem de `mockData(table)`, escrita "sucede" sem persistir.

**Toda mudança de tela entra nos dois.** É a regra mais quebrada do projeto e a
mais barata de respeitar. Ver [[ADR 0011 - Painel e demo sao espelhos]].

## Armadilhas de re-render já documentadas

Um padrão se repete: **re-renderizar destrói o elemento sob o dedo**.

- foco da busca de clientes → `quizPaintClientList()` mexe só na lista
- tiles de referência do questionário → `quizPaintRefs()`
- dropdown do diagnóstico
- **Payment Element do Stripe não sobrevive a `innerHTML`** — `renderStepBody()`
  desenha a casca uma vez por abertura; só `updatePayStatus()` escreve depois.
  Medido: 1 mount em 7 renders.

## Movimento

`prefers-reduced-motion` respeitado em todo o app. O gesto (o dedo sendo
acompanhado) é considerado **acessibilidade**, não decoração: com
reduced-motion o arrasto continua, só o snap vira instantâneo.
Regra completa em `docs/05_MOTION_SYSTEM.md`.

## Hospedagem

`orenzi-atelier.vercel.app`, deploy por push na `main`.
`orenziatelier.com` é Wix e **não** hospeda o app.

## Links

[[Orenzi Overview]] · [[Booking Architecture]] · [[Token e Navegacao]] ·
[[Technical Debt]]
