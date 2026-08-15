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

**Todas as seis corrigidas em 15/08/2026**, na rodada de fechamento.

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

**Acessibilidade.** A auditoria de 03/08 achou **zero** ocorrência de
`:focus-visible`, `<label for>`, `role=` e `aria-live` no projeto inteiro. Parte
foi corrigida via `app/ds/*`, mas não há medição nova. `docs/07` tem veto.

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
