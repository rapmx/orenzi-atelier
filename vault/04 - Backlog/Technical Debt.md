# Technical Debt

Dois grupos: **divergências de documentação** (achadas em 15/08/2026, ainda não
corrigidas) e **dívida de código** (conhecida e, em parte, aceita).

---

## A. Divergências de documentação — achadas em 15/08/2026

Nenhuma foi corrigida nesta rodada; ficam registradas para decisão.

| # | O quê | Situação |
|---|---|---|
| A1 | Migration do Questionário V2 dita "pendente" | ✅ **corrigido** em `docs/roadmap.md` e `app/CLAUDE.md` |
| A2 | `app/CLAUDE.md` §Banco listava 15 tabelas, produção tem 19 | ✅ **corrigido** |
| A3 | `send-appointment-email` ativa sem fonte no repo | ✅ **recuperada** em `supabase/functions/send-appointment-email/` |
| A4 | `docs/README.md` dizia "implementação não iniciada" | ✅ **corrigido** |
| A5 | Changelog para em `1.2.1` (13/08) | ✅ **corrigido** — `1.3.0` e `1.4.0` escritas |
| A6 | `docs/10 §17` mandava ADR em `/docs/adr/`, que nunca existiu | ✅ **corrigido** — aponta para `vault/03 - Decisions/` |
| A7 | Vault dizia "Splash NÃO IMPLEMENTADA"; existia em produção | ✅ **corrigido** em 15/08/2026 — ver abaixo |
| A8 | `docs/07` dizia "zero `:focus-visible` nos quatro arquivos" | ✅ **corrigido** — `ds/orenzi-base.css` cobre desde o PR1 do DS |
| A9 | [[Login]] dizia que o grafo agrupa a autenticação numa comunidade "Authentication" | ✅ **corrigido** — no grafo de 15/08 `checkSession()`/`renderLogin()` caem na Community 19, sem nome, junto dos loaders de boot. O grafo é derivado: navegação, não fonte de verdade |

**As seis primeiras corrigidas em 15/08/2026**, na rodada de fechamento.

**A7 — achada na rodada da Splash (15/08/2026).** [[Splash]],
[[Estado Atual do Produto]] e [[Product Backlog]] diziam, os três, que a
splash era "só backlog, não implementada". Havia uma splash rodando em
produção em `painel.html` e `painel_demo.html` desde antes do refresh.

A causa não é descuido de escrita: a tela **nunca passou por especificação**,
então nunca gerou registro — e o vault só sabe o que alguém escreve nele.
Vale como lembrete do porquê de o vault ser 4º na hierarquia de fonte de
verdade: código e migration quebram quando mentem, documento só envelhece em
silêncio. Os três arquivos foram corrigidos.

**A5 — como ficou.** `1.3.0` (Questionário V2) e `1.4.0` (Agenda Visual V2)
escritas em `docs/10`. Fica registrada uma pendência **nova e menor**, dentro da
própria entrada 1.4.0:

> ⚠ **`docs/04 §TimelineItem` está desatualizado.** Ainda diz "Converge:
> `.timeline-appt` — implementação já correta" e lista `--radius-sm` /
> `--text-caption`, sem a nova geometria, a barra de destaque nem a regra de
> faixa de horário. Precisa ser reescrito.

**Nota de versionamento.** Pelo `§13` do próprio `docs/10`, alterar valor de
token e remover componente seria **major**. A 1.4.0 foi registrada como
**minor** porque os valores mexidos são **locais da Agenda** — não estão em
`app/ds/orenzi-tokens.css` nem em `docs/03`, e as classes removidas não constam
da lista de componentes autorizados de `docs/04`. O raciocínio está escrito
dentro da própria entrada, para ninguém ler depois como violação de regra.

**A3 — como foi recuperada.** Fonte exata da v8 ativa, puxada do Supabase e
gravada sem alteração de comportamento. Equivalência provada pelas invariantes
de escape (115 linhas, 4.527 caracteres, só `\n` e `\"`, sem CRLF, acentos
literais). **Nenhum segredo no source** — só `Deno.env.get()`. Não foi
redeployada.

---

## B. Migrations locais são espelho parcial

`supabase/migrations/` tem **11 arquivos**; o Supabase registra **38** aplicadas.
Só de `booking_v2` (09/08) em diante existe arquivo local.

Consequências medidas:
- buscar `find_or_create_client`, `products`, `client_photos`,
  `product_movements` ou `booking_visits` no repo **não acha nada** — e isso não
  significa que não existam;
- o graphify não resolve esses 5 alvos pelo mesmo motivo;
- os **timestamps dos nomes locais não batem** com as versões aplicadas. Foram
  escritos à mão.

---

## C. Dívida de código conhecida

**Expediente triplicado.** `shared/salon.js` (UI) · `is_public_booking_window()`
no SQL (o que a RLS aceita) · painel. Aceito conscientemente —
[[ADR 0007 - Expediente duplicado entre JS e SQL, aceito]].
**Gatilho para centralizar:** o produto virar multi-estabelecimento.

**`schedule_blocks_guard_conflict()` não delega a `staff_work_blocks`.** Tem
cópia própria da consulta e já teve que ser corrigida à parte quando o hold
entrou. **É o lugar que vai ser esquecido** no próximo tipo de ocupação.

**`event_type: 'created'` ainda existe** na Edge e na RPC — é o caminho sem
pagamento. O Booking público não usa mais, mas é porta dos fundos se alguém
reativar.

**Os 8 loaders do painel engolem erro de query.** `loadAppointments`,
`loadScheduleBlocks`, `loadClients`, `loadStaff`, `loadServices`,
`loadProducts`, `loadMovements` e `loadBookingVisits` fazem todos
`if (error) { console.error(error); return; }`. Consequência: `Promise.all`
em `loadAll()` praticamente **nunca rejeita**, e falha de query fica
**indistinguível de "não há dados"** — a tela mostra empty state legítimo
para uma consulta que não foi respondida.

Achado na rodada da [[Splash]] (15/08/2026), ao definir o que "app pronto"
significa. **Não foi corrigido de propósito**: mexer no tratamento de erro
dos loaders é mudança de comportamento de carregamento, fora de uma rodada
visual. A splash lida com isso sem depender de rejeição (`markReady` no
`finally` de `loadAll`), então o defeito está contido, não resolvido.
**Gatilho para atacar:** a primeira vez que alguém reportar "sumiu tudo do
painel" sem erro visível.

**Valor por serviço não decompõe multi-serviço** (18/08/2026, com o
[[Financeiro]]). `final_price` é total por appointment e
`appointment_services` tem `REVOKE ALL` para o browser desde a blindagem da
Booking V2 — então o ranking por serviço agrupa pelo `service_id` legado, que a
Booking V2 grava como o **primeiro** serviço. Num multi-serviço o valor inteiro
cai nele.

O **total** do período continua correto (soma appointments, não serviços); é o
**ranking** que pode não fechar. `finValidar()` reporta a diferença como nota,
nunca como falha silenciosa. **Não foi "corrigido" de propósito**: dividir
proporcionalmente inventaria precisão que o dado não tem, e abrir grant em
`appointment_services` para desenhar um bloco seria abrir superfície de dado
por conveniência de tela. **Gatilho para atacar:** a mesma rodada que resolver o
Stripe não ler `final_price` — as duas são a decomposição do valor por item.
Ver [[ADR 0016 - Financeiro V1 e o valor da agenda]].

**`animateFills()` depende só de `requestAnimationFrame`.** Numa aba sem
composição de frames (segundo plano, painel oculto) o rAF não corre e as barras
de "Onde está o dinheiro" e do Estoque ficam em largura **zero** — gráfico
vazio, não gráfico sem animação. `finAnimarBarras()` e `finRolar()` já nascem
com a rede de `setTimeout` (o mesmo padrão de `morphAvatar()`,
`splashBoot()` e `insShowHelp()`); `animateFills()` não foi tocada em 18/08
porque é caminho compartilhado por três telas e não era escopo da rodada.
Contido, não resolvido: quando a aba volta a ficar visível o rAF corre e as
barras aparecem.

**Acessibilidade.** A auditoria de 03/08 achou **zero** ocorrência de
`:focus-visible`, `<label for>`, `role=` e `aria-live` no projeto inteiro.
`app/ds/orenzi-base.css` passou a dar o anel de foco a todo controle nativo, e
o [[Login]] V2 trouxe os primeiros `<label for>`, `role="alert"` e
`aria-invalid`/`aria-describedby` do painel. O resto das telas continua sem
medição nova. `docs/07` tem veto.

**`--focus-ring` é fraco demais sobre o bege.** O token é
`0 0 0 3px var(--color-accent-100)` (#ecdcc9), que mede **1,15:1** contra
`--color-bg` — abaixo dos 3:1 que a WCAG 1.4.11 pede para indicador de foco.
O anel existe e aplica corretamente; ele é que quase não se vê. Achado na
rodada do Login (15/08/2026) e **deixado de fora de propósito**: é token do
DS, e corrigir localmente com um valor mágico numa tela só espalharia a
inconsistência. **Gatilho:** a próxima rodada que toque `docs/03 §Elevação e
foco`.

**Duas exceções locais no campo do Login**, ambas comentadas no código:
- `font-size: 16px` — abaixo disso o Safari do iPhone dá zoom ao focar. O corpo
  do produto é 15px (`--text-body-size`) e `docs/04 §Input` registra a decisão
  como pendente. Enquanto for pendente, todo campo novo herda o problema.
- `border-radius: var(--radius-sm)` — o painel tem uma regra global
  `input[type="email"] { border-radius: 999px }` que, por ser seletor de
  atributo, **vence a classe do DS** e transforma qualquer `.o-input` em
  pílula. Vale para os próximos campos migrados.

**Erro de escrita inline fica fora do caminho de sessão expirada.** O gancho
central mora em `showToast()` e cobre os 14 handlers que avisam por toast. Os
três que escrevem o erro na própria tela (`#ncError`, `#prodError`,
`#wizNcError`) mostram "faça login novamente" sem levar ao Login. Contido de
propósito — o pedido foi não transformar isso em refactor geral de error
handling.

**Todo o CSS é inline em cada HTML.** Mexer no visual do Estoque é editar o
`<style>` do `painel.html` **e** do `painel_demo.html`.

**Duplicados legítimos** entre painel e demo, e entre as duas páginas:
`initials`, `render`, `refreshSlots` — mesmo nome, implementações
legitimamente diferentes por tela.

---

## D. Ruído no repositório — resolvido

**`preview/`** — 3 HTMLs (`booking-v2.html` 121 KB, `insights-v2.html`,
`insights-v2-r2.html`), protótipos de 07–09/08 já superados pelo código em
produção. ✅ **Adicionados ao `.gitignore` em 15/08/2026.** A pasta **não** foi
apagada: fica no HD como referência visual.

---

## Não é dívida

O achado de 02/08 sobre "2 erros no console do `painel_demo.html`" foi
**retestado em 06/08 e não reproduzido**. A nota original nunca capturou
mensagem nem stack. Fica registrado como **não confirmado**, não como baseline
aceita — se reaparecer, precisa de mensagem/stack para virar achado de verdade.

## Links

[[Source of Truth]] · [[Supabase e Database]] · [[Edge Functions]] ·
[[Schedule Availability]] · [[Product Backlog]]
