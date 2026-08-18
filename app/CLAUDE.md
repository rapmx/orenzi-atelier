# Orenzi Atelier — salão da Juliane (Dublin)

Páginas HTML estáticas, sem build, sem framework, sem npm. Cada arquivo carrega
o Supabase por CDN e tem todo o CSS e JS inline. Abrir com um servidor estático
qualquer (`npx serve .`) — não existe passo de compilação.

## Mapa dos arquivos

| Arquivo | Tamanho | O que é |
|---|---|---|
| `index.html` | 70 KB | Landing pública: hero em vídeo, galeria, antes/depois, PT/EN |
| `agendar.html` | 138 KB | Agendamento pela cliente, 3 passos (serviço → data/hora → dados + sinal) |
| `gerenciar.html` | 61 KB | Self-service da cliente: remarcar/cancelar por `manage_token` |
| `painel.html` | **555 KB** | Painel da Juliane. **Tudo inline** — config, dados, todas as telas |
| `painel_demo.html` | **602 KB** | Cópia do painel com stub do Supabase, pra demonstrar sem login |
| `design-system.html` | 31 KB | Vitrine do Design System |
| `shared/salon.js` | — | `window.OrenziSalon`: expediente, fuso, slot |
| `ds/` | — | `orenzi-tokens.css`, `orenzi-base.css`, `orenzi-components.css`, `orenzi-ui.js` |
| `manifest.json` | — | PWA (nome, ícones, cor) |
| `assets/` | — | Fotos e vídeos da landing |

⚠ **Nunca varra `painel.html` nem `painel_demo.html` inteiros** — custam ~140k e
~150k tokens. Use as âncoras abaixo + grep, ou o grafo (`graphify query`).

**Contexto de produto (por que algo é assim, o que está bloqueado, de quem
depende) fica em `vault/`**, não aqui. Este arquivo é o índice do *código*.
Ver `CLAUDE.md` da raiz, §"Protocolo de contexto".

### Tudo é inline — não existem módulos

Não há nenhum `<script src>` local: a única tag externa é o CDN do supabase-js.
Todo o JS e CSS vive dentro de cada HTML.

Existiu uma pasta `modules/` + `shared/` (refatoração de 30/07/2026), mas o
`painel.html` foi sobrescrito depois por uma versão inline vinda de outra sessão
e aqueles arquivos ficaram órfãos — presentes no disco, carregados por ninguém.
Em 02/08/2026 o que valia foi resgatado para o código que roda (sobreposição da
agenda com pausa, aba Estoque, e a conversão de fuso do `agendar.html`) e as
pastas foram removidas. O histórico está no git.

## Âncoras em `painel.html`

Comentários `// ── SEÇÃO ──` marcam os blocos. As linhas saem do lugar a cada
edição — confirme com `grep -n "^// ──" painel.html` antes de confiar.

| Assunto | Onde procurar |
|---|---|
| Supabase URL/key, `state` global | `// ── CONFIGURAÇÃO` |
| Cor por profissional (hash → paleta) | `STAFF_COLORS`, `colorForId()`, `colorForStaff()` |
| Leitura do banco | `loadAll()`, `load*()` |
| Hora no painel | `fmtTime()` |
| Tela inicial, KPIs, ocupação | `renderHome()`, `occupancyPct()` |
| Insights (diagnóstico operacional) | `renderInsights()`, `insComputePeriod()`, `insContentHtml()` |
| Ocupação, capacidade, horas | `insOccupancy()`, `insCapacityMinutes()`, `insOpenDays()`, `insFmtHoras()` |
| Onde há espaço (tiles, YTD, futuro tracejado) | `insSpaceBlock()`, `insMapStep()`, `insSegStatus()` |
| Eficiência por serviço (€/h, piso de amostra) | `insEficiencia()`, `insMinServico()`, `insEfLinhaHtml()` |
| Invariantes da Insights (console) | `insValidar()` |
| Financeiro (valor da agenda) | `// FINANCEIRO · V1`, `renderFinanceiro()`, `finComputePeriod()`, `finContentHtml()` |
| Gráfico de linha (hoje só do Financeiro) | `insTrendSeries()`, `insTrendSvg()`, `finAnimateChart()` |
| Distribuição Analytical (eixo, readout, roll) | `finAnalyticalHtml()`, `finEscalaNice()`, `finTick()`, `finPintarReadout()`, `finRolar()` |
| Invariantes do Financeiro (console) | `finValidar()` |
| Agenda, sobreposição, pausa | `renderAgenda()`, `layoutAppts()`, `segmentsOf()` |
| Bloqueio manual de agenda | `openAgendaAddMenu()`, `openBlockModal()`, `saveScheduleBlock()`, `openBlockDetailSheet()`, `confirmDeleteScheduleBlock()`, `busyBlocksForStaffOnDate()` |
| Folha de tela cheia (os 3 sheets da Agenda) | `.o-fullsheet` / `.o-wizard-sheet` no `<style>`, `.modal-overlay.is-fullsheet` |
| Movimento da folha (entrar/navegar/fechar) | `openFullSheet()`, `fullSheetNavigate()`, `closeFullSheet()`, `paintWizardShell()`, `updateWizChrome()`, `setBlockAllDay()` |
| Estoque | `// ── ESTOQUE`, `renderStock()`, `renderStockList()`, `renderStockInsights()`, `openProductModal()` |
| Clientes, fotos, detalhe | `renderClients()`, `renderClientDetail()`, `renderApptDetail()` |
| Login | `// ── AUTENTICAÇÃO`, `renderLogin()`, `submeterLogin()`, `loginErro()`, `checkSession()` |
| Fim de sessão (expirada ou "Sair") | `encerrarSessaoUI()`, `confirmarSessaoExpirada()`, `setAuthedChrome()` |
| Splash e boot | `// ── SPLASH — CICLO DE VIDA` (fim do script), `markReady()`, `splashBoot()`, `#splash` no `<style>` |
| Qual tela aparece | `render()` |

Abas da nav, **owner**: **Início · Agenda · Clientes · Insights · Financeiro ·
Estoque**. Abas da nav, **staff**: **Início · Agenda · Clientes · Estoque** — o
rodapé é desenhado por capability, não por papel (`aplicarNavPorPapel()`).

Estoque ocupou o lugar de Equipe em 02/08/2026 — com uma profissional só,
"Profissionais" era uma tela de uma linha. A ordem acima é a **navegação final
aprovada**, aplicada em 18/08/2026 junto com a tela do Financeiro: a
reordenação estava aprovada desde 17/08 mas foi segurada de propósito, porque
aba sem tela é promessa falsa.

⚠ **Questionário saiu do rodapé em 17/08/2026.** Deixou de ser destino de
primeiro nível e virou **capability contextual de Clientes**. O fluxo não
mudou em nada — só a porta. Ver "Questionário: onde ele mora" abaixo.

## Banco (Supabase, projeto `gsagtsxkhqlpxuvrijgw`)

**19 tabelas**, conferidas contra produção em 15/08/2026:

| Grupo | Tabelas |
|---|---|
| Agendamento | `appointments`, `appointment_services`, `appointment_events`, `schedule_blocks` |
| Cliente | `clients`, `client_photos`, `client_questionnaires` |
| Catálogo | `services`, `staff`, `staff_services`, `salon_settings` |
| Estoque | `products`, `product_movements` |
| Booking V2 | `booking_operation_requests`, `booking_visits`, `lookup_attempts`, `cancellation_policies` |
| Pagamento | `payments`, `stripe_webhook_events` |

⚠ **`supabase/migrations/` é espelho PARCIAL**: 11 arquivos locais contra 38
migrations aplicadas — só de `booking_v2` (09/08/2026) em diante existe arquivo.
`find_or_create_client`, `normalize_ie_phone`, `products`, `client_photos`,
`product_movements` e `booking_visits` existem **só no banco**. Não achar no
repo não significa que não exista. Os timestamps dos nomes locais também são
aproximações escritas à mão e não batem com as versões aplicadas.

**Edge Functions ativas: três**, todas com fonte em `supabase/functions/` —
`booking-orchestrator` (v7), `stripe-webhook` (v4) e `send-appointment-email`
(v8, recuperada em 15/08/2026; é a que `trg_notify_new_appointment` aciona e
formata o e-mail no fuso do salão, não no do servidor).

`appointments.final_price` / `final_price_updated_at` (17/08/2026) e a RPC
`set_appointment_final_price()` — ver "Valor de um atendimento" acima.

`payments` e `stripe_webhook_events` (14/08/2026) são do depósito de 20% —
ver seção própria em "Regras do domínio". RLS ligada e **sem policy nenhuma**:
só `service_role` (que ignora RLS) alcança. Testado pela superfície PostgREST
real com a chave anônima: `401` nas tabelas, `404` em todas as RPCs novas.

`schedule_blocks` (13/08/2026) é o bloqueio manual de agenda — ver seção
própria em "Regras do domínio" abaixo.

`product_movements` (03/08/2026) é o histórico de estoque: `product_id`,
`kind` (`entrada` | `saida` | `ajuste`), `quantity` **sempre positivo** (o
sinal vem do `kind`), `resulting_quantity` (o saldo congelado naquele
momento), `actor`, `note`, `created_at`. Só `saida` conta como consumo —
entrada é compra e ajuste é correção de contagem; somar os três inflaria a
previsão. `products` ganhou `code`, `supplier`, `favorite`, `expires_at`,
`image_url`. Bucket `product-photos` (público, mesmas políticas de
`client-photos`).

Duas RPCs `SECURITY DEFINER` — a página da cliente usa a chave anônima e a RLS de
`appointments` só permite SELECT autenticado, então leitura direta voltava vazia e
**todo horário parecia livre**:

- `get_busy_slots(p_staff_id, p_from, p_to)` — blocos em que a profissional trabalha
  **ou está com a agenda bloqueada** (`schedule_blocks`, desde 13/08/2026)
- `get_chair_load(p_from, p_to)` — ocupação das cadeiras (limite em `salon_settings.chairs`)

`staff_work_blocks(p_staff_id, p_from, p_to, p_exclude_id)` é a função interna
(sem grant pra `anon`/`authenticated`) que `get_busy_slots` espelha — é ela que
`appointments_guard_conflict()` (trigger) e as RPCs de criação/reagendamento
de appointment (`_create_booking_core`, `create_public_booking`,
`reschedule_booking_by_token` e as variantes `_orchestrated`) chamam de
verdade. **Um bloqueio manual entra no `UNION ALL` dela** — é por isso que
nenhuma dessas funções precisou ser tocada pra passar a respeitar
`schedule_blocks`: todas já delegavam a disponibilidade pra cá.

Trigger `trg_notify_new_appointment` dispara e-mail (Resend) a cada INSERT em
`appointments`. Cuidado ao inserir dados de teste.

## Regras do domínio

**Modelo de segmentos.** Um atendimento tem até três partes:
`work_before_minutes` (trabalho) → `gap_minutes` (pausa, tinta agindo) →
`work_after_minutes` (finalização). Durante a pausa a profissional e a cadeira
ficam **livres** — é isso que permite encaixar outra cliente dentro dela. Sem
configuração, tudo vira trabalho inicial (comportamento antigo).

Os valores podem ser gravados no próprio agendamento e sobrescrevem o padrão do
serviço. Leitura sempre `a.campo ?? s.campo ?? default`.

Na timeline a pausa aparece como faixa **mais clara** dentro do bloco (véu
branco sobre a própria cor do card, com fade de 6px nas duas pontas) e **sem
rótulo nenhum**, e o encaixe entra por cima recuado à esquerda
(`layoutAppts()` empilha por nível, estilo calendário do iPhone). Dividir em
colunas espremia os dois e escondia a pausa. A listra diagonal saiu em
10/08/2026: rachurado lê como "área bloqueada", e pausa é o contrário disso —
é o tempo em que cabe encaixar alguém. O texto "pausa · Nmin" saiu em
15/08/2026 — ver "Agenda v2" abaixo.

**Faixa de título reservada (`APPT_HEAD_SAFE` = 44px, espelhado em
`--appt-head-h` no CSS).** Nada desenhado por cima de um card de tier rico
começa antes dessa marca: a faixa de pausa é aparada pelo topo (o fim fica no
instante real) e um encaixe sobreposto é empurrado para baixo dela. O selo de
status deixou de ser absoluto e virou item do flex do cabeçalho — assim o nome
da cliente trunca com ellipsis em vez de ser coberto quando o status é largo.
Prioridade do card, nessa ordem: **nome da cliente → serviço → duração →
status**. Mudar 44 num lado exige mudar no outro.

**Conflito** só existe quando um *bloco de trabalho* encosta em outro. Pausa
sobreposta a pausa, ou trabalho dentro de pausa alheia, é permitido.

### Bloqueio manual de agenda (`schedule_blocks`, 13/08/2026)

Entidade própria — **não** é appointment fake. Serve pra profissional marcar
um período como indisponível (dia inteiro ou intervalo), com motivo interno
opcional que **nunca** chega ao Booking público (`get_busy_slots` só devolve
`busy_start`/`busy_end`, sem `reason`).

- **Schema**: `id`, `staff_id` (obrigatório — não existe "bloqueio de salão
  inteiro" nesta fase, só por profissional), `starts_at`/`ends_at`
  (`timestamptz`), `all_day`, `reason` (nullable), `created_by`,
  `created_at`/`updated_at`. Sem recorrência — só bloqueios pontuais.
- **"Dia inteiro" é o dia civil local completo** (`Europe/Dublin`): `00:00` do
  dia escolhido → `00:00` do dia seguinte. **Nunca** `09:00`–`18:00` — se o
  expediente mudar no futuro, um bloqueio de dia inteiro continua significando
  dia inteiro. Na Agenda isso vira **faixa no topo do dia**
  (`.day-blocked-banner`, "Salão fechado" ou o motivo), nunca um card de
  `00:00`–`24:00` na timeline — mentiria sobre a proporção do dia.
- **Disponibilidade**: um bloqueio é um terceiro tipo de intervalo opaco, ao
  lado de `work_before`/`work_after` — entra no mesmo `UNION ALL` de
  `staff_work_blocks`/`get_busy_slots`/`get_chair_load` (ver seção "Banco"
  acima). **Gap de appointment continua livre**: um bloqueio pode ocupar
  exatamente o `gap` de um atendimento (a tinta agindo, a profissional livre)
  sem conflitar com ele — só não pode tocar `work_before`/`work_after`.
- **Conflito bloqueio↔appointment é bidirecional e decidido no banco, nunca só
  no frontend**:
  - *Bloqueio sobre appointment existente* — `trg_schedule_blocks_no_appointment_conflict`
    (`schedule_blocks_guard_conflict()`) rejeita na criação/edição do bloqueio
    se ele intersectar o bloco de trabalho de um appointment da mesma
    profissional (erro `23P01`/`BLOCK_CONFLICTS_WITH_APPOINTMENT`, com a data
    do conflito na mensagem). Nunca apaga, cancela nem move o appointment — só
    recusa e devolve o motivo pra UI mostrar.
  - *Appointment sobre bloqueio existente* — `appointments_guard_conflict()`
    (o trigger que já existia) já recusa sozinho, porque lê `staff_work_blocks`
    e o bloqueio já está no `UNION ALL` dela. Nenhuma linha desse trigger foi
    tocada.
  - Mesmo advisory lock por `staff_id` dos dois lados
    (`pg_advisory_xact_lock(hashtextextended(staff_id::text, 0))`,
    `hashtextextended` de um argumento só — a mesma fórmula de
    `lock_staff_for_booking()`) — criar/editar bloqueio e criar/reagendar
    appointment na mesma profissional nunca correm em paralelo sem se ver.
- **Painel**: `loadScheduleBlocks()` carrega junto de `loadAll()`;
  `busyBlocksForStaffOnDate()` soma os bloqueios aos blocos de trabalho —
  é o que faz o modal de novo agendamento (`computeAvailableSlots()`) e o
  indicador de disponibilidade do calendário (`dayAvailabilityLevel()`) já não
  oferecerem horário bloqueado, de graça. `computeFreeGaps()` também os trata
  como ocupados, pra nenhum card "Xh livres" nascer dentro de um bloqueio.
  FAB `+` da Agenda (`agendaAddBtn`) abre `openAgendaAddMenu()` — escolha
  entre "Novo agendamento" (fluxo de sempre) e "Bloquear horário"
  (`openBlockModal()`). Timeline: card próprio hachurado
  (`.timeline-block`, z-index abaixo de `.timeline-appt`) pro bloqueio
  parcial — rachurado é linguagem de "indisponível" aqui, ao contrário da
  pausa (que fica clara, sem listra, de propósito: pausa é o oposto
  semântico, "cabe encaixar alguém"). Toque no bloqueio (card ou faixa) abre
  `openBlockDetailSheet()` — **não** a tela de Appointment Detail, é outra
  entidade. Botão de remoção sempre "Remover bloqueio", nunca "Cancelar".
- **Os três sheets da Agenda são de tela cheia** (13/08/2026): o menu do `+`,
  o wizard de novo agendamento e o formulário de bloqueio sobem do rodapé até
  o topo da viewport (`.o-fullsheet`, e `.o-wizard-sheet` que virou a mesma
  coisa), com a anatomia head → body rolável → footer fixo repetida nos três.
  Antes eram folhas parciais que paravam em 88–92vh e liam como cartão
  encostado no rodapé. **`BottomSheet` parcial não foi aposentado** — segue
  correto (e em uso) para escolha curta: ordenação, filtros, folha do FAB do
  Estoque e o **detalhe do bloqueio**. A regra que separa os dois é a do
  próprio Design System: fluxo de várias etapas ou formulário longo é tela;
  escolher entre duas opções é folha. Componente documentado em
  `docs/04_COMPONENT_LIBRARY.md §FullScreenSheet`. **Altura é `100dvh`, nunca
  `100vh`**: no Safari do iPhone o `100vh` conta a barra de endereço que some
  ao rolar, e o CTA do rodapé cairia atrás do chrome do navegador.
- **Movimento da folha: vertical é entrar/sair, horizontal é andar dentro**
  (13/08/2026). A entrada bottom→top é a classe `.is-entering`, posta **só**
  por `openFullSheet()` — nunca uma regra do container. Isso não é
  preciosismo: enquanto a animação viveu no `.o-fullsheet`, todo re-render a
  reaplicava, e cada etapa do wizard e cada toque no segmented control
  pareciam abrir uma modal nova. Navegação entre telas da folha é
  `fullSheetNavigate('forward'|'back', drawFn)`, que desliza o palco
  (`.o-fullsheet-stage`) enquanto o shell fica parado. **Trocar de etapa no
  wizard não recria o shell**: `paintWizardShell()` é só a entrada,
  `paintWizStep()` + `updateWizChrome()` são a troca. Trocar estado local
  (segmented de tipo de bloqueio) não move tela nenhuma — `setBlockAllDay()`
  mexe só no indicador e na região `#blkDynamic`. Regra completa em
  `docs/05_MOTION_SYSTEM.md §14b`.
- **`painel_demo.html`**: mesmo mock genérico de escrita do resto do arquivo
  (`insert`/`update`/`delete` sempre "sucedem" sem persistir; `saveScheduleBlock()`
  monta o registro local a partir do payload enviado, não do retorno cru do
  `.select()`, pelo mesmo motivo que o resto do app já segue essa convenção).
  `demoSalao()` gera dois bloqueios de exemplo (`blocos`) em dias fora do
  encaixe Camila/Marina — um parcial (card na timeline) e um dia inteiro
  (faixa) — pra mostrar os dois tratamentos visuais sem mexer no cenário
  existente.
- **Segurança**: RLS ligada, sem grant pra `anon` nem `authenticated` por
  padrão — `REVOKE ALL ... FROM PUBLIC, anon, authenticated` explícito (a
  convenção "Segurança de objetos novos" abaixo), depois `GRANT SELECT,
  INSERT, UPDATE, DELETE` só pra `authenticated`. Testado pela superfície
  PostgREST real com a chave anônima: `SELECT`/`INSERT`/`DELETE` direto na
  tabela devolvem `401`; `get_busy_slots` reflete o bloqueio sem expor
  `reason`.

### Depósito de 20% + slot hold (Stripe, sandbox — 14/08/2026)

**⚠ LIVE PAYMENTS BLOCKED UNTIL CANCELLATION POLICY V2 IS APPROVED.** A policy
v1 em produção promete taxa fixa de €16 e diz que "o sinal é descontado de
qualquer taxa de cancelamento". Com depósito de 20%, isso implica **devolver
dinheiro** em cancelamento tardio — regra financeira que ninguém decidiu.
Sandbox pode rodar sob a v1; produção não. As duas Edge Functions recusam
qualquer `STRIPE_SECRET_KEY` que não comece com `sk_test_`.

- **Depósito = 20% de `sum(services.price)`, calculado no banco**
  (`deposit_for_services(uuid[])` → `total_cents`, `deposit_cents`). O browser
  nunca manda preço e o `amount` do Stripe nunca deriva do frontend.
  Serviços com `price_varies=true` usam o mesmo campo numérico, que é o valor
  **base/mínimo** — Highlights cobra 20% de €290 mesmo podendo custar €370.
  Por isso a copy do Review é diferente para eles: **"20% do valor base"**,
  nunca "do valor final". Dizer "final" ali seria falso em 9 dos 15 serviços.
- **Hold = `appointments.status='pending'` + `hold_expires_at`**, não entidade
  nova. Escolhido porque `staff_work_blocks` já contava `pending` como ocupado:
  o guard de conflito, `get_busy_slots`, `get_chair_load` e as RPCs de criação/
  reagendamento passaram a respeitar hold **sem uma linha de lógica nova**,
  mesmo argumento que fez `schedule_blocks` custar barato. TTL 12min, estendido
  para 15 quando o PaymentIntent nasce (3DS demora).
- **Expiração é preguiçosa, na leitura** — `appointment_occupies_agenda(status,
  hold_expires_at)` é a regra única, usada por `staff_work_blocks`,
  `get_busy_slots`, `get_chair_load` e `schedule_blocks_guard_conflict`.
  **Não existe cron**, e não pode passar a existir como mecanismo de correção:
  o cron seria só limpeza cosmética. `schedule_blocks_guard_conflict()` tem
  cópia própria da consulta (não delega a `staff_work_blocks`) — foi preciso
  corrigir lá também, senão um hold vencido impediria a Juliane de bloquear a
  própria agenda.
- **Hold NÃO aparece na agenda** (decisão de produto): `loadAppointments()`
  separa em `state.paymentHolds` e `state.appointments`. Todo o resto do painel
  continua sem saber que hold existe. O ponto que precisa saber é
  `busyBlocksForStaffOnDate()`, e é sobre **disponibilidade**: o modal de novo
  agendamento não pode oferecer horário reservado. (`computeFreeGaps()`
  também trata hold como ocupado, mas desde 15/08/2026 ela não tem mais
  renderizador — os cards de "Xh livres" saíram da timeline.) Hold vencido
  não entra nem em `state.paymentHolds` — a tela tem que concordar com o
  banco.
- **Confirmação é do servidor, nunca do browser.** `stripe.confirmPayment()`
  resolver sem erro não é "confirmado": quem confirma é o webhook, dentro de
  uma transação (`handle_stripe_event`). O browser faz polling de
  `booking_state` (~1s por 15s) e, se o webhook demorar, mostra estado
  intermediário honesto — nunca erro, nunca sucesso falso. O dinheiro entrou e
  o horário já é dela.
- **Idempotência**: a mesma `request_key` atravessa hold → PaymentIntent →
  confirmação. `booking_operation_requests` (uma operação), `pi:{request_key}`
  como Idempotency-Key do Stripe (um PaymentIntent),
  `stripe_webhook_events.event_id` PK (um efeito por evento),
  `created:{request_key}` no Resend (um e-mail).
- **`manage_token` é rotacionado na confirmação.** O token do hold nunca sai do
  banco; `handle_stripe_event` gera um novo e ele existe só em memória →
  corpo do e-mail → fim. Consequência: a tela de sucesso **não** tem o token e
  cai no caminho "use o link enviado por e-mail" que já existia.
- **E-mail `created` saiu da Edge do booking e foi para o webhook** — só depois
  de `payment_intent.succeeded`. Ganhou total / sinal pago / saldo restante.
- **Nenhum refund automático.** `charge.refunded` só registra o que o Stripe já
  fez. "Pagou e o horário sumiu" vira `payments.status='needs_manual_refund'` +
  log, nunca estorno por conta própria.
- **`event_type: 'created'` continua existindo** na Edge e na RPC
  (`create_public_booking_orchestrated`) — é o caminho sem pagamento. O Booking
  público **não usa mais**: sinal é obrigatório, e um caminho paralelo sem
  cobrança seria porta dos fundos para reservar de graça.
- **Payment Element não sobrevive a `innerHTML`.** `renderStepBody()` desenha a
  casca da tela de pagamento **uma vez por abertura** e nunca reescreve; só
  `updatePayStatus()` escreve, e só no `#payStatus`. Mesma família de armadilha
  do foco da busca e do dropdown do diagnóstico — aqui o dano seria perder o
  formulário de cartão no meio da digitação. Medido: 1 mount em 7 renders.
- **Chaves**: `pk_test_` no `agendar.html` (pública por desenho do Stripe);
  `sk_test_` e `whsec_` só como secrets das Edge Functions. `client_secret`
  vai ao browser mas **nunca** é gravado nem logado.

### Valor de um atendimento (16–17/08/2026)

`appointmentRevenue(a)` é o **ponto único** de leitura de dinheiro por
atendimento, e a regra é:

```
appointmentRevenue(a) = a.final_price ?? a.total_price ?? a.service.price ?? 0
```

Três camadas, da mais específica para a mais genérica:

| Camada | O que é | Quem escreve |
|---|---|---|
| **`final_price`** | valor **real**, definido à mão depois da avaliação presencial | `set_appointment_final_price()` |
| **`total_price`** | **snapshot** do que foi combinado no agendamento | RPCs da Booking V2, no INSERT |
| `services.price` | preço de **tabela atual** — fallback legado | ninguém; é leitura |

#### `final_price` (17/08/2026)

A Juliane avalia o cabelo quando a cliente chega e define quanto aquele
atendimento vai custar. É a única camada que conhece o preço real de um
serviço de preço variável: Highlights entra no booking por €290 (o piso) e
pode sair por €370.

- **`total_price` NUNCA é sobrescrito.** Ele é o registro do que foi
  combinado, e é ele que sustenta o depósito já cobrado pelo Stripe —
  perdê-lo quebraria a conciliação de um pagamento que já aconteceu.
- **Reset é `final_price = NULL`**, e o valor canônico volta sozinho ao
  snapshot. Nunca copiar `total_price` para `final_price`.
- **`final_price_updated_at` vai a NULL junto** no reset: manter a data de
  um valor que deixou de existir descreveria algo que não está mais lá.
- **`0` é valor legítimo** (cortesia, retoque sem cobrança). O CHECK do banco
  é `>= 0`, e o JS compara contra `null` — `valorSeDefinido()` existe para
  `0` nunca escorregar por truthiness.
- **Escrita só pela RPC `set_appointment_final_price(uuid, numeric)`**
  (`SECURITY DEFINER`, `GRANT EXECUTE` só para `authenticated`). Não é por
  falta de permissão: `authenticated` **já tem UPDATE** em `appointments`
  (policy `authenticated update appointments`, sem WITH CHECK) e o detalhe
  do atendimento já usa isso. É justamente por isso que a RPC importa —
  pelo caminho direto o browser pode escrever qualquer coluna, inclusive
  `total_price`, `status` e os campos do Stripe. A RPC toca **duas colunas**
  e mais nada.
- **Sem RBAC e sem hardcode de e-mail.** O modelo em vigor é
  "autenticado = a Juliane"; papéis vêm depois.
- **UI**: Clientes → perfil → atendimento (`apptValorSectionHtml()`,
  `openApptValorSheet()`). Não existe na Agenda nem em tela global — definir
  valor é algo que acontece com a cliente na cadeira.
- ⚠ **V1 é TOTAL POR APPOINTMENT.** Num multi-serviço, `final_price`
  substitui a soma inteira; a diferença **não** é redistribuída entre as
  linhas de `appointment_services`. Decomposição por item fica para quando
  houver demanda real.
- ⚠ **O Stripe não lê `final_price`.** Depósito, PaymentIntent, refund e
  saldo continuam saindo de `deposit_for_services()`/`total_price`. Definir
  €370 num atendimento cujo sinal foi calculado sobre €290 **não** recalcula
  nada — é dívida conhecida, para a rodada de arquitetura financeira.
- ⚠ **`formatCurrency()` arredonda centavos.** `final_price = 370.50` é
  gravado certo e aparece como **€371**. O valor guardado é exato; só a
  exibição arredonda. Ver `docs/06 §24`, que pede vírgula decimal quando há
  centavos — divergência entre doc e código, anterior a esta rodada.

#### `total_price`

- É o total **congelado** no instante da reserva (soma dos `price_snapshot`
  de `appointment_services`), gravado por todos os caminhos da Booking V2.
  Carregado por `loadAppointments()` desde 16/08/2026.
- **`services.price`** é o fallback — preço de **tabela atual**. Vale para os
  atendimentos criados manualmente no painel, que **não gravam `total_price`**
  e para os quais não existe de onde reconstruir o preço praticado. Enquanto
  um atendimento depende do fallback, mudar o preço do serviço **reescreve
  retroativamente** o valor dele.
- ⚠ **Comparação contra `null`, nunca `||`:** `total_price = 0` é valor
  legítimo (o CHECK do banco aceita `>= 0`) e não pode cair no fallback.
- ⚠ **`appointments.price` NÃO EXISTE** — a coluna nunca foi criada. Até
  16/08/2026 a função lia `a.price`, um caminho morto duas vezes (coluna
  inexistente **e** ausente do `select`). Se aparecer referência a
  `appointments.price` em documento antigo, é engano.
- ⚠ **9 dos 15 serviços têm `price_varies`**: para eles o preço é o **piso**,
  não o cobrado — inclusive dentro do `total_price`, que congela o valor base.
  Copy que expõe esses valores diz "valor base", nunca "valor final".
**Não existe segunda fórmula de valor.** Todo lugar que representa o valor de
um atendimento chama `appointmentRevenue(a)` — se aparecer
`Number(a.service?.price || 0)` ou `a.final_price || a.total_price` numa conta
de dinheiro, é regressão. A única exceção é `appointmentBookedValue(a)`, que
**ignora `final_price` de propósito** e existe só para a tela que mostra os
dois lado a lado; nenhuma soma passa por ela. Até
16/08/2026 duas contas do perfil da cliente faziam a soma crua e discordavam
da Insights num atendimento multi-serviço (o `service_id` legado guarda **um**
serviço só, então um atendimento de €155 aparecia como €70 no perfil).

Quem consome:

| Tela | Função |
|---|---|
| Insights — peso INVISÍVEL de ordenação das Sugestões | `insSumRevenue()` |
| Insights — o €/h de "Eficiência por serviço" | `insServicos()` → `insEficiencia()` |
| Insights — impacto estimado das Sugestões | `insClientesAtrasadas()` |
| Financeiro — Hero, Indicadores, Evolução, Distribuição | `insSumRevenue()`, `finDistribuicao()` |
| Financeiro — "Valor por serviço" e o histórico | `finServicos()`, `finHistLinha()` |
| Perfil da cliente — "Total investido" | `clientStats()` |
| Perfil da cliente — valor por visita (`.ti-price`) | markup de `renderClientDetail()` |
| Detalhe do atendimento — bloco de valor | `apptValorSectionHtml()` |

### RBAC V1 — owner e staff (18/08/2026)

```
owner  → operacional + gerencial
staff  → operacional

capabilities exclusivas de owner: Insights · Financeiro
```

**`staff` NÃO é uma profissional limitada aos próprios atendimentos.** Não
existe `appointment.staff_id = current_staff_id()` em lugar nenhum, e não
deve passar a existir sem o Raphael pedir. A assistente opera o salão
inteiro: cria, edita, remarca, cancela, bloqueia horário, mexe em Clientes,
no Questionário e no Estoque. A única restrição é gerencial.

**Escrever dado operacional ≠ acessar análise financeira.** `final_price`
continua liberado para `staff` (`set_appointment_final_price`): quem avalia
o cabelo e define o valor pode ser a assistente. Esse dado alimenta o
Financeiro depois, e isso **não** dá a ela acesso ao Financeiro.

#### Onde mora cada peça

| Camada | O quê |
|---|---|
| `app_accounts` | `user_id`, `staff_id` (nullable), `role`, `active`. **Sem grant para o browser** — inalcançável pelo PostgREST |
| `current_app_role()` · `is_owner()` · `current_staff_id()` | `SECURITY DEFINER STABLE`, `EXECUTE` só para `authenticated` |
| `ROLE_CAPABILITIES` | mapa declarativo no painel — a lista de capabilities por papel |
| `canAccess(cap)` · `primeiraTabPermitida()` · `aplicarNavPorPapel()` | guard e rodapé |
| `resolverPapel()` · `renderSemAcesso()` | boot e fail-closed |

- **Papel é dado, nunca string no código.** Nada de `if (email === ...)`.
  A leitura é sempre pela RPC — `app_accounts` não tem grant para o browser,
  e é isso que impede auto-promoção.
- **`questionario` e `financeiro` estão em `ROLE_CAPABILITIES` mas não são
  abas do rodapé.** O primeiro é rota interna (capability de Clientes desde
  17/08); o segundo é autorização nascendo **antes** da tela, para o
  Financeiro não precisar de retrofit. O rodapé só desenha o que tem tela —
  não existe aba Financeiro vazia.
- **Ordem do boot importa.** `checkSession()` resolve o papel **antes** de
  `loadAll()`. Resolver depois deixaria a assistente ver o painel montado
  com o rodapé completo por uma fração de segundo.
- **Fail closed.** `current_app_role()` nulo, papel desconhecido ou erro de
  rede caem em `renderSemAcesso()` — sem nav, sem header, sem dado
  carregado. Nunca tratar falha como `staff`.
- **O papel morre com a sessão** (`encerrarSessaoUI()` zera `state.role`):
  outra conta na mesma aba herdaria o papel anterior.

#### O que é operacional e o que é gerencial

```
individual appointment value       = operational
aggregated customer monetary value = managerial
```

A linha divisória é **agregação**, não "ser dinheiro": o preço de UM
atendimento é o que se cobra da cliente na cadeira e é da assistente; somar
os atendimentos dela ao longo do tempo é leitura de negócio.

| Dado | Classificação | Quem vê |
|---|---|---|
| Home inteira (panorama, ritmo, próxima oportunidade, tendência) | operacional — **zero valor monetário**, tudo é contagem de agendamentos | os dois |
| Preço de um atendimento na timeline do perfil (`.ti-price`) | operacional — é o que se cobra da cliente na cadeira | os dois |
| Bloco de valor do atendimento (`apptValorSectionHtml`) | operacional | os dois |
| "Total investido" no perfil, `€ gasto` no cartão da lista e a ordenação "Maior gasto" | **gerencial** — valor monetário AGREGADO de uma cliente | owner |
| Insights inteira (ocupação, capacidade, €/h, sugestões) | gerencial | owner |
| `booking_visits` (Canais) | gerencial — **único dataset exclusivo da Insights** | owner, e fechado na RLS |
| `services`/`staff`/`staff_services` escrita | administrativo — o painel **não tem tela** para isso | owner |

⚠ **A Insights não tem endpoint próprio**: ela calcula tudo no browser a
partir de `state.appointments` + `state.services`, que a Agenda, a Home e o
perfil da cliente precisam ler. Fechar `total_price`/`final_price` para
`staff` protegeria a tela e quebraria o registro do valor final — que é
operacional e é dela. **Não criar RPC agregada para Insights**: ela não
acrescentaria proteção enquanto as linhas operacionais continuarem
legíveis, e RPC que não protege é só indireção. A proteção da Insights é
capability (UI + guard) mais RLS no que é exclusivo dela. Limite conhecido e
aceito: uma assistente com devtools consegue recomputar receita a partir dos
dados operacionais. Fechar isso exigiria tirar dela o valor final — o
produto escolheu o operacional.

**Qualquer backend novo do Financeiro nasce com `is_owner()` como
requisito.** Não é opcional e não é para depois. O Financeiro V1 (18/08/2026)
não precisou de backend nenhum — ver "Financeiro V1" abaixo —, e é por isso que
não abriu grant: se um dia precisar, nasce fechado.

### Financeiro V1 — valor da agenda, não caixa (18/08/2026)

```
Financeiro V1 = agenda value, not cash accounting

Insights   = operational diagnosis
Financeiro = monetary value evolution
```

A aba responde **uma** pergunta: *quanto vale a agenda, e como esse valor está
mudando ao longo do tempo?* Não é caixa, contabilidade, conciliação bancária,
recebimento, lucro, margem nem comissão — e a distinção **não** é de
vocabulário: nenhum número desta tela sai de `payments` nem do Stripe. Tudo vem
de `state.appointments`, que é a **agenda**.

Por isso a copy fala em "valor", "em atendimentos", "já atendidos", "ainda
agendado", "total do período", "ticket médio" e "valor por serviço", e **nunca**
em recebido, caixa, pago, a receber, faturamento, lucro, margem, comissão,
transação ou extrato. O app não sabe o que entrou na conta; sabe o que foi
marcado e o que foi cobrado. Enquanto
`LIVE PAYMENTS BLOCKED UNTIL CANCELLATION POLICY V2 IS APPROVED` valer, essa
fronteira é obrigatória, não estilística.

**owner-only, e não por retrofit.** `financeiro` já era capability de `owner`
desde a fundação do RBAC; o que entrou em 18/08 foi a tela e a rota. Quem
protege é o guard central de `render()` — o rodapé só esconde. Nada aqui abriu
grant novo: cada número sai de dado que a Agenda, a Home e o perfil da cliente
já precisam ler.

#### Ordem dos blocos (não reordenar sem pedido)

```
Período → Hero → Indicadores → Evolução → Distribuição
        → Valor por serviço → Histórico de atendimentos
```

**Evolução vem antes de Distribuição de propósito**: a pergunta da aba é "quanto
vale e está subindo?", e a trajetória precede a leitura interna do período. Não
existe bloco de comparativos — Hero, Indicadores e Evolução já respondem isso
três vezes.

#### Período

Seletor próprio (`#finPeriod`), estado próprio (`state.financeiroPeriod`,
default `mes`). O da Insights **não** é reaproveitado: as duas abas respondem
perguntas diferentes, e um período compartilhado faria a troca numa mexer
silenciosamente na outra. O que é compartilhado é a **matemática** —
`insWindow()`, `insApptsBetween()`, `insSumRevenue()`, `insDelta()`,
`insPeriodLabels()`, `insTrendSeries()` e `insTrendSvg()` servem as duas. Duas
implementações de "quanto vale este mês" divergiriam em silêncio.

#### Classificação temporal — tempo, nunca status

```
starts_at <  agora  → já atendido
starts_at >= agora  → ainda agendado
```

O produto não tem fluxo para marcar concluído/não compareceu, e derivar isso de
`status = 'confirmed'` seria inventar. Cancelados já saem na leitura
(`loadAppointments()` filtra `cancelled`) e o hold de pagamento nunca entra em
`state.appointments`. O instante do corte é `janela.cut` — o **mesmo** que
`insApptsBetween()` usa —, e é isso que faz a soma da Distribuição fechar
exatamente com o Hero.

#### Distribuição · Analytical

A variação aprovada é a **Analytical**; as variações horizontal e vertical do
protótipo **não** foram portadas e não existe switch A/B em produção.

A diferença é **matemática**, não de gosto. Normalizar pelo maior dado (maior =
100%) faz a maior barra sempre encostar no teto e tira a unidade da altura — só
compara colunas entre si. `finEscalaNice()` arredonda o máximo para cima até um
passo redondo (1, 2, 2,5 ou 5 × 10ⁿ) e desenha contra **esse** topo:

- topo ≥ maior barra, sempre;
- eixo começa em €0 e o último tick **é** o topo;
- entre 3 e 6 ticks;
- a altura passa a ter unidade monetária — dá para ler sem tocar.

Buckets por nível: Semana → 7 dias · Mês → semanas do mês (a primeira e a última
podem ser **parciais**, alinhadas à segunda-feira) · Ano → 12 meses.

⚠ **`€1k` / `€1,5k` no eixo é EXCEÇÃO deliberada e local.** `docs/06 §24` proíbe
abreviar dinheiro, e a proibição continua valendo em **todo** valor que a Juliane
lê como quantia — Hero, Indicadores, readout, valor por serviço, histórico. No
eixo é **régua**, não quantia. Ver `finTick()`, e `docs/06 §24` para o registro
da exceção.

⚠ **A coluna do eixo Y só tem largura por causa do `.an-sizer`**, um irmão
invisível em fluxo normal com o rótulo de tick mais **largo** (não o maior valor:
`€1,5k` é mais largo que `€2k`). Todos os ticks são `position: absolute` — eles
**precisam** ser, para cair na altura do próprio valor — e uma caixa cujos filhos
são todos absolutos mede **zero**. Sem o sizer o tick mais largo sai do `main` e
é cortado pela borda da tela. Não trocar por largura fixa: `ch` erra, porque o
símbolo e o separador não medem o mesmo que um dígito nem em tabular.

#### Readout — nós estáveis, roll com retarget

O readout é montado **uma vez por repintura**; `finPintarReadout()` nunca toca em
`innerHTML`. Destruir e recriar os nós a cada toque reinicia toda transição e
força o repaint do bloco — é exatamente esse o "blink" que o desenho evita. Cada
número tem seu próprio sizer com o pior caso **do período**, então a caixa não
muda de largura quando o valor rola.

`finRolar()` conta do valor **que está na tela** até o novo (easeOutCubic, 260ms,
sem overshoot). O retarget é a parte que importa: tocar rápido de uma barra para
outra cancela o rAF pendente e recomeça a partir do valor exibido, nunca do
destino anterior — sem isso as animações se acumulam e o número "treme".

⚠ **Rede de segurança de `setTimeout` em `finRolar()` e `finAnimarBarras()`.**
`requestAnimationFrame` **não** dispara em aba sem composição de frames (segundo
plano, painel oculto, aparelho economizando bateria). Sem o timer o número
congela no valor **antigo** e as barras ficam em altura zero — um gráfico vazio,
que é pior que um gráfico sem animação. Mesmo padrão de `morphAvatar()`,
`splashBoot()` e `insShowHelp()`. **Verificado nesta rodada**: com a aba oculta o
readout assenta no valor certo e as barras aparecem.

`prefers-reduced-motion`: troca direta, sem roll, sem fade dependente de rAF e
sem estado órfão (nenhum rAF nem timer pendente).

#### Valor por serviço — limitação conhecida, não escondida

Este bloco é do **Financeiro**: € absoluto e participação (%). O **€/h fica na
Insights** — um é "quanto vale", o outro é "quanto rende por hora de cadeira".

⚠ **O ranking por serviço pode não reconciliar com o total do período**, e a
causa é de **dado**, não de tela:

- o valor canônico é do atendimento **inteiro** (`final_price` é total por
  appointment; `total_price` é a soma dos snapshots);
- a decomposição por serviço vive em `appointment_services`, que tem
  `REVOKE ALL ... FROM anon, authenticated` desde
  `booking_v2_harden_grants` — **o browser não alcança essa tabela, nem para o
  owner**;
- então o agrupamento é pelo `service_id` **legado**, que a Booking V2 grava como
  `p_service_ids[1]`: o **primeiro** serviço. Num multi-serviço o valor inteiro
  cai no primeiro serviço.

Duas decisões explícitas, para não serem reabertas por engano:

1. **Não dividir proporcionalmente.** Sem os snapshots não há como fazer isso sem
   inventar precisão, e uma divisão silenciosa é pior que uma atribuição
   declaradamente grosseira.
2. **Não abrir grant em `appointment_services`** só para desenhar um bloco. O
   **total** do período continua correto (soma appointments, não serviços) — é o
   **ranking** que pode não fechar. `finValidar()` reporta a diferença como
   `nota`, nunca como falha silenciosa.

#### Histórico

Prévia de 3 + "Ver mais (N)" que expande **inline** — nunca modal, nunca página
nova, nunca toast. Teto de 30 linhas (`FIN_HIST_MAX`): acima disso a lista
vira carregamento progressivo (`docs/09`), e a V1 mostra os mais recentes e
**diz** que é um recorte em vez de prometer um botão que entregaria centenas de
linhas de uma vez.

Três estados de valor, e a distinção é de **peso e tom**, nunca de cor (nem
"estimado" nem "final" é estado de alerta):

| Situação | Como aparece |
|---|---|
| valor final definido | `€370` + `Valor final` |
| serviço de preço variável, sem valor final | `a partir de` + `€290` |
| serviço de preço fixo | `€70`, sem marcador |

⚠ **`€0` com valor final é legítimo** e não pode virar "a partir de" nem cair no
fallback — a comparação é contra `null` (`valorSeDefinido()`), nunca truthiness.

#### Invariantes

`finValidar()` no console do painel, para os três períodos:

```
total = já atendido + ainda agendado
Σ distribuição.feito    = já atendido
Σ distribuição.agendado = ainda agendado
ticket × atendimentos   = já atendido
topo da escala >= maior barra · eixo em 0 · último tick = topo · 3–6 ticks
evolução usa só períodos fechados
Σ serviços = já atendido        (nota, não falha — ver limitação acima)
```

Existem porque esta aba é feita de somas que **têm** que fechar entre si: se a
distribuição parar de somar o total, o console denuncia em vez de a tela mentir
bonito.

### Insights pós-Financeiro — diagnóstico operacional (18/08/2026)

```
Insights   = operational diagnosis
Financeiro = monetary value evolution
```

A Insights responde **"como o salão está operando, o que está acontecendo e
onde existe oportunidade de melhorar?"**. Ela **não** responde "quanto vale a
agenda" — isso é do [Financeiro](#financeiro-v1--valor-da-agenda-não-caixa).

| Bloco | Onde vive | Por quê |
|---|---|---|
| Ocupação, capacidade, ritmo, espaço livre | **Insights** | não tem quantia nenhuma |
| €/h de cadeira | **Insights** | é produtividade de cadeira |
| € absoluto por serviço, participação % | **Financeiro** | é "quanto vale" |
| Ticket, evolução do valor, histórico monetário | **Financeiro** | idem |

#### O que saiu da Insights nesta rodada

| Saiu | Para onde |
|---|---|
| Hero de receita (`.ins-answer` com `formatCurrency`) | virou Hero de **ocupação** |
| KPI "Gasto médio" | ticket é do Financeiro |
| Bloco "Tendência" | virou **Evolução** no Financeiro |
| "Onde está o dinheiro" (€ absoluto + barra por receita) | virou **Eficiência por serviço**, só €/h |
| Considerações de receita e de gasto médio | substituídas por **horas ocupadas** |
| "Potencial estimado: +€X" nas Sugestões | virou impacto em **horas e atendimentos** |
| Sugestão do Ano citando receita absoluta | passou a citar **tempo de cadeira** |

#### A única quantia permitida

⚠ **Todo `€` da Insights é uma TAXA POR HORA.** Em três formas de escrita, e
nenhuma outra:

```
€107/h                      ranking e sugestões
€107 por hora de cadeira    prosa (hoje não usada — a leitura usa /h)
€/h                         o token solto, na nota de amostra curta
```

`insValidar()` remove essas três do HTML renderizado e **falha se sobrar
qualquer `€`**. Não é contagem por bloco: pega Hero, Indicadores,
Considerações, Sugestões e qualquer bloco futuro de uma vez. Se alguém
reintroduzir um valor absoluto, o console denuncia em vez de as duas telas
voltarem a responder a mesma coisa.

#### Ordem dos blocos (não reordenar sem pedido)

```
Período → Hero → Indicadores → Considerações → Sugestões
        → Onde há espaço → Eficiência por serviço → Como as clientes chegam
```

**Considerações e Sugestões vêm antes dos blocos de evidência**, e não depois:
são a única parte da tela que já fez a leitura pela usuária. Os blocos abaixo
existem para conferir essa leitura — quem já confia nela não precisa rolar.

#### Hero — ocupação, e os números têm de se sustentar

```
ocupação = horas ocupadas ÷ capacidade do período DECORRIDO

horas ocupadas = Σ (ends_at − starts_at) dos atendimentos realizados
capacidade     = dias ABERTOS × 540min × profissionais ATIVAS
```

- **Delta sempre em pontos percentuais.** 22% → 27% é `+5 p.p.`, nunca `+23%`.
  A tela inteira gira em torno de uma taxa; tratar a variação de uma taxa como
  variação percentual é o erro clássico dessa família de indicador.
- **A capacidade do período anterior tem janela própria.** Nunca copiada da
  atual: dois meses não têm o mesmo número de dias abertos até o mesmo dia do
  mês, e derivar um do outro erra as horas *e* o delta.
- ⚠ **As horas NÃO são arredondadas na origem** (`horasUsadas` é
  `minutos / 60`, exato). Arredondar ali quebrava a sustentação do número
  principal: 435min de 540min é **81%**, mas "7h de 9h" lê **78%**. Quem
  arredonda é a exibição, via `insFmtHoras()` — inteiro quando é inteiro, uma
  casa decimal com vírgula quando não é (`docs/06 §25`). Hoje o Hero mostra
  `7,3h ocupadas · 1,8h livres de 9h`, e 7,3/9 = 81%. `insValidar()` exige essa
  igualdade **sem tolerância**.
- ⚠ **A capacidade conta o dia corrente inteiro.** `insOpenDays()` conta dias,
  não horas decorridas: às 10h de uma terça o denominador já inclui as 9h
  daquele dia. Comportamento auditado e preservado — mudá-lo mexeria em toda
  conta de ocupação do app, inclusive na Home.

#### Timeframes e capacidade

| Nível | Hero mede | Compara com |
|---|---|---|
| Semana | a semana até agora | mesmo ponto da semana passada |
| Mês | do dia 1 até agora | mesmo ponto do mês passado |
| **Ano** | **YTD** — 1º de janeiro até agora | mesmo ponto do ano passado |

⚠ **O Ano é year-to-date, e isso é obrigatório.** Setembro–dezembro **não**
entram como "hora livre" de um acumulado em agosto: não se conta capacidade de
um período que ainda não começou. Vem de graça de `insWindow('ano', 0)`
(`start` = 1º de janeiro, `cut` = agora), e `insValidar()` verifica os três
lados — início em janeiro, corte em agora, comparação com o ano anterior.

#### Onde há espaço — janela diferente do Hero, de propósito

```
Hero            = período DECORRIDO       (é uma taxa: precisa de
                                           denominador que já aconteceu)
Onde há espaço  = pode incluir o FUTURO do mesmo período, quando esse
                  futuro ainda é acionável
```

| Nível | Fatia | Janela |
|---|---|---|
| Semana | dias abertos | a semana inteira; o que não aconteceu sai tracejado |
| Mês | semanas | o mês inteiro — espaço daqui a duas semanas ainda é vendável |
| Ano | meses | **só o decorrido**; quatro meses à frente não são acionáveis |

**Passado vazio é ociosidade** (um fato); **futuro vazio é oportunidade**. Os
dois nunca são somados como se fossem a mesma métrica: o futuro sai com
**contorno tracejado**, nunca preenchido, e a leitura em prosa separa as duas
em frases distintas. O tracejado substituiu o `opacity: .5` anterior, que dizia
"menos importante" quando o certo é "ainda dá para vender".

⚠ **Fatia com capacidade ZERO não aparece.** 31/08/2026 cai numa segunda e o
salão fecha segunda: mostrar "0h" tracejado prometeria espaço num dia em que
ninguém atende.

⚠ **A tabela dia×faixa da Semana saiu.** Os três níveis passaram a ter uma
gramática só — tiles. Antes a Semana era uma tabela de 3 faixas × 7 dias e os
outros dois eram tiles, e as três leituras não se pareciam. **Custo aceito**: a
dimensão "manhã / início da tarde / fim da tarde" deixou de aparecer no bloco
de exibição. Ela continua viva onde decide alguma coisa — `insDayFaixaMatrix()`
alimenta a Sugestão de espaço ("ofereça a manhã de quinta").

#### Eficiência por serviço

Ranking por **€/h de cadeira**. Mostra posição, serviço, €/h, quantidade e
duração média por atendimento. **Não** mostra valor absoluto nem participação —
isso é o bloco do Financeiro.

⚠ **Dois pisos de amostra, e a diferença é de propósito:**

| Constante | Para quê | Valor |
|---|---|---|
| `INS_MIN_SERVICO` | o app **afirmar** algo sobre um serviço numa Consideração ou Sugestão | 4 |
| `insMinServico(kind)` | um serviço **entrar** no ranking de €/h | 2 / 3 / 8 |

Uma frase declarada exige mais base que uma linha de ranking. O `3` do Mês é um
afrouxamento deliberado do `4`: com o piso literal este salão deixaria **um**
serviço no ranking e esconderia cinco — um "ranking" de uma linha. Direção
aprovada no preview, que documenta a mesma conta.

- **A escala da barra sai do maior RANQUEADO**, nunca do conjunto: deixar um
  serviço de 2 atendimentos definir o topo faria a régua depender justamente do
  número mais frágil.
- Serviços abaixo do piso **não somem** — vão para um grupo recolhido
  (`+N serviços ainda com pouca amostra`) que expande **inline**. Sem posição
  numérica (usam `·`), porque numerar daria a entender que a ordem entre eles
  significa alguma coisa, e com a explicação escrita **uma vez** no grupo em vez
  de um selo repetido em toda linha.

#### Clientes novas e conversão

- **Clientes novas** = `clients.created_at` dentro da janela (`insNewClients`).
  Quem já era cliente e voltou não conta. Regra pré-existente, auditada e
  reaproveitada.
- **Conversão do booking** = visitas e agendamentos contados na **mesma**
  janela (`insConversao`). Conta o que foi *marcado* na janela, não o que
  *aconteceu* nela — uma visita de hoje que gera atendimento na semana que vem é
  conversão de hoje. Abaixo de **10 visitas** devolve `null` e a taxa não
  aparece: amostra pequena demais para virar percentagem.
- ⚠ `booking_visits` é **owner-only na RLS** desde o RBAC V1, e continua. A
  Insights é a única consumidora.

#### Peso invisível das Sugestões

⚠ **A ordenação das Sugestões (`impacto`) continua usando ticket e
receita/hora.** É invisível — nunca chega à tela — e serve só para decidir qual
das candidatas aparece primeiro. Trocar o peso mudaria **quais** sugestões a
Juliane vê, o que é mudança de comportamento e não estava no escopo. É por isso
que `insComputePeriod()` ainda calcula `receita` e `ticket`.

#### Invariantes

`insValidar()` no console do painel, nos três períodos:

```
ocupação = horas ocupadas ÷ capacidade      (sem tolerância)
capacidade = dias abertos × expediente × profissionais ativas
capacidade anterior tem janela própria
delta de ocupação em p.p.
Ano começa em 1º de janeiro · vai até agora · compara com o ano anterior
Ano não mostra fatia futura · cobre janeiro até o mês corrente
Σ horas por serviço = horas ocupadas
Σ canais = atendimentos do período
atendimentos = os do Financeiro             (as duas telas, o mesmo salão)
todo € da tela é uma taxa por hora
sem vocabulário do Financeiro na tela
```

### Questionário: onde ele mora (17/08/2026)

**O Questionário não é mais navegação de primeiro nível.** É uma capability
de Clientes.

```
entrada principal:  Clientes → Perfil da cliente → Questionário
```

- **`state.tab = 'questionario'` continua existindo como ROTA INTERNA.** A
  aba saiu do rodapé, não do roteador — duplicar o fluxo numa segunda tela
  manteria dois questionários vivos, que é exatamente o que não se quer.
  `render()` ainda despacha para `renderQuestionario()`.
- **`clientQuizSectionHtml(c)`** desenha a seção no perfil. Dois estados:
  sem questionário convida a começar; com questionário, o último vira o
  assunto (data + "Ver questionário") e "Novo questionário" desce a link
  secundário. Substituiu a linha `action-row` "Infos do questionário".
- **`loadClientQuestionnaires(clientId)`** carrega as linhas inteiras da
  cliente ao abrir o perfil, mesmo padrão de `loadClientPhotos()`. Traz
  tudo porque a tabela é append-only e uma cliente tem punhado de
  registros — é isso que permite abrir um questionário antigo sem segunda
  consulta.
- **Histórico preservado.** A tabela continua append-only (um INSERT por
  resposta, sem UPDATE). Quando há mais de um, aparece "Ver anteriores (N)"
  que expande a lista de datas inline; tocar numa abre aquela. Nada foi
  reduzido a "um questionário por cliente".

#### Origem e retorno

`state.quiz.origin` / `state.quiz.originClientId` guardam de onde o fluxo
foi aberto. **`quizSair()` é a saída única** — CTA do Sucesso, "Sair" do
cabeçalho e "Voltar" da tela de idioma passam os três por ela, que é o que
garante que concordem.

| origem | para onde volta |
|---|---|
| `'client-profile'` | perfil da mesma cliente, via `abrirCliente()` |
| `null` (legado) | escolha de cliente, como sempre foi |

- ⚠ **`quizSair()` lê a origem ANTES de `quizResetAll()`** — depois ela não
  existe mais, e o painel voltaria ao lugar errado sem nenhum erro visível.
- ⚠ **Volta por `abrirCliente()`, não por `render()`.** É `abrirCliente()`
  que recarrega os questionários; sem isso, ao voltar de um questionário
  recém-salvo o perfil mostraria o anterior como último — ou nenhum.
- ⚠ **`quizSave()` invalida `state.clientQuestionnaires[clientId]`** no
  sucesso. A lista em memória fica velha no instante do INSERT.
- ⚠ **As saídas NÃO passam por `quizGo()`**, que chama `renderQuestionario()`
  e devolveria a tela do quiz por cima do perfil.

#### O que não mudou

Kiosk, três idiomas, perguntas, química, objetivo, referências, revisão,
persistência e sucesso: **intactos**. A cliente continua recebendo o tablet;
o reposicionamento é administrativo, e o Questionário **não** virou
formulário comum dentro do perfil. Ao abrir pelo perfil o `client_id` vem do
perfil (nunca do nome exibido) e o fluxo começa direto no idioma — a Juliane
não escolhe a cliente de novo.

**Sem atalho na lista de Clientes.** O FAB `+` de Clientes tem hoje um
significado só ("Novo cliente"); acrescentar "Novo questionário" exigiria
menu de FAB, que é UI nova para uma entrada secundária. A entrada é o perfil.

### Questionário V2 (15/08/2026)

**O produto é simples de propósito e deve continuar simples.** A Juliane
entrega o tablet quando a cliente chega, a cliente responde, as respostas
ficam no perfil pra **consulta manual**. Nenhuma resposta deriva duração,
preço, serviço, alerta, recomendação ou qualquer regra de agendamento — e
não deve passar a derivar sem o Raphael pedir. Foi decisão explícita, não
lacuna: a auditoria de 14/08 mostrou uso funcional zero e o pedido foi
**manter assim**.

- **Três idiomas** (`pt-BR`, `en`, `es`) escolhidos numa tela de abertura
  com a saudação alternando (`QUIZ_WELCOME_DWELL_MS`, palavra sobe e a
  próxima entra por baixo). Sem bandeira: idioma não é país.
- **Valor persistido é canônico, em português.** `had_bleaching` grava
  `'Sim'` mesmo com a cliente respondendo em inglês; a tradução é só de
  apresentação (`qtr()`/`quizAnswerLabel()`). Sem isso o relatório da
  Juliane chegaria em espanhol e toda leitura futura teria que conhecer os
  três idiomas. **O relatório do perfil é sempre em pt-BR**, com o idioma
  usado como etiqueta.
- **11 telas viraram fluxo com volta**: cliente → idioma → 7 passos (5
  escolhas + objetivo + referências) → revisão → sucesso. Progresso "N de
  7", `Voltar` em todo passo, `Sair` com confirmação — a V1 escondia a nav
  e não tinha saída nenhuma. **O `✕` que salvava morreu**: o CTA diz
  "Salvar questionário", com busy/erro por `orenziUI`.
- **A ordem é cliente → idioma, e isso é sobre de quem é a tela**
  (15/08/2026). A escolha da cliente é a **primeira** tela e pertence ao
  painel: header e nav à vista, sem `Voltar` (não há pra onde) e sem
  `Sair` (sair é tocar noutra aba). O quiosque começa **no instante da
  escolha** — `setKioskMode(phase !== 'client')` — e a tela de idioma já é
  da cliente, com o nome dela no subtítulo pra Juliane conferir a quem
  está entregando o tablet. Voltar do idioma devolve o painel e **zera
  `language`**: quem escolhe idioma é a cliente, e a próxima pode não ser
  a mesma. O Sucesso continua em quiosque (o tablet ainda está com a
  cliente) mas sem `Sair`: o CTA é a única saída e devolve o painel.
- **Trocar de aba desliga o quiosque explicitamente.** `render()` só chama
  `setKioskMode()` dentro de `renderQuestionario()`, então sair do
  questionário por outra aba deixaria header e nav escondidos na aba nova.
  Hoje a nav está `display:none` nesse estado e o dedo não alcança, mas o
  handler da nav chama `setKioskMode(false)` de qualquer forma — basta um
  caminho novo chamar `render()` com outra aba pro painel ficar sem chrome
  nenhum.
- **Referências visuais são placeholders declarados** até a Juliane mandar
  as fotos. O catálogo é `QUIZ_REFERENCES`; o que vai pro banco é o `id`
  (`ref_01`…), nunca URL — quando a foto chegar, preenche-se `imageUrl` e
  nem a gravação nem o relatório mudam. Até 3, e 0 é resposta válida.
- **Sem auto-advance.** A V1 pulava de tela no `onchange` do `<select>` e
  não havia como revisar. Escolher e confirmar custa um toque a mais e
  evita resposta errada sem volta.
- **A busca de cliente não passa por `renderQuestionario()`** —
  `quizPaintClientList()` mexe só no `#quizClientList`. Mesma armadilha de
  foco já documentada em Clientes e Estoque. Os tiles de referência seguem
  a mesma regra (`quizPaintRefs()`): re-renderizar destruiria o botão sob
  o dedo e jogaria a grade rolada pro topo.
- **O loop da saudação é um `setInterval` e precisa morrer.**
  `quizResetAll()` (troca de aba, Sair, fim) limpa; o próprio loop se
  desliga se o elemento sumiu. Com `prefers-reduced-motion` não há loop:
  as três saudações aparecem paradas, juntas.
- **Histórico continua append-only e invisível**: um INSERT por resposta, a
  tela lê a mais recente. Sem UPDATE, sem upsert, sem tela de histórico —
  fora do escopo desta rodada.
- **Banco**: `language` (`text`, CHECK nos 3 códigos, NULL nas linhas
  antigas — não se inventa o passado) e `reference_images` (`text[]`,
  default `{}`, CHECK ≤ 3), índice em `(client_id, created_at DESC)` e
  `REVOKE ALL ... FROM PUBLIC, anon` (a tabela é anterior à convenção e
  ficava só na RLS). Migration
  `20260815120000_questionnaire_v2_language_and_references.sql`.
  ✅ **APLICADA em produção** (versão real `20260814233019`) — verificado em
  15/08/2026, as duas colunas existem. `docs/roadmap.md` Fase 4 ainda diz
  "pendente de aplicar" e está **desatualizado**.
  **`quizSave()` funciona antes dela**: se o Postgres disser que a coluna
  não existe (`quizMissingColumn()`), regrava só os seis campos antigos em
  vez de mostrar erro pra cliente por uma dívida de banco.
- **Demo**: o stub tinha um bug real — `.eq().order().limit().maybeSingle()`
  estourava `TypeError` e "Infos do questionário" não fazia nada, nem
  toast. O `order` devolvido pelo `.eq()` agora respeita o filtro e carrega
  `.limit()`/`.maybeSingle()`. Camila tem questionário de exemplo (em
  inglês, com duas referências); Marina não tem, de propósito — é o estado
  vazio, que deixou de ser toast e virou tela.

### Agenda v2 — geometria da grade (15/08/2026)

Redesign **só visual** da timeline (referência estrutural: Calendar do
iPhone; identidade, cor e tipografia continuam Orenzi). Nenhuma regra de
negócio mudou: conflito, disponibilidade, gaps, `schedule_blocks`, booking,
Stripe, Questionário, Clientes e Insights não foram tocados.

- **Uma escala só, `PX_PER_MINUTE` (= `HOUR_HEIGHT / 60`).** Todo `top` e
  toda `height` da grade passam por `minutesToPx()` e
  `agendaOffsetMinutes()`. Nada é posicionado por aproximação — verificado
  no navegador: 09:30 cai em 0,5000 entre as linhas de 09:00 e 10:00, 09:40
  em 0,6667, 10:35 em 0,5833, 12:30 em 0,5000.
- **Altura vem só da duração.** Saiu o `Math.max(20, durMins)`, que era piso
  em **minutos** e esticava a duração desenhada de um atendimento curto. O
  piso hoje é `APPT_MIN_HEIGHT` (14px, só alvo de toque) e o fio de
  separação é `GRID_HAIRLINE` (2px, constante — não escala com a duração, o
  topo continua exato).
- **Gutter e eixo esquerdo.** `--tl-gutter: 40px` (só rótulos de hora, no
  formato `9:00`, sem zero à esquerda) e o card começa em
  `--tl-card-left: 4px`. Antes era 52 + 6 = 58px. Encaixe = `+8px` por
  nível (`NIVEL_RECUO`), não mais 18 — a 24px ele lia como card decorativo
  dentro de outro card. A direita também recua 8px por nível
  (`NIVEL_RECUO_DIR`), pra aparecer a fatia do card de baixo.
- **Barra de destaque (`.timeline-appt::before`, `--appt-bar-w: 5px`)**
  trocou o `border-left: 3px`. Cor = `c.border` com 15% de `c.text` (o
  membro mais saturado do trio; puxar mais pro escuro dessaturaria). Corre
  a **altura inteira**, atravessando a pausa — é ela que faz
  `work_before + gap + work_after` lerem como uma reserva só, e por isso
  `.appt-gap` começa em `left: var(--appt-bar-w)`. Contraste medido contra
  o fundo do próprio card: 1,9–2,9:1, abaixo dos 3:1 de componente
  não-textual e **aceito de propósito** — a barra é ênfase, não portadora
  de informação (categoria já está no preenchimento e no texto).
- **Densidade.** Padding do card 12/14px → `8px 10px` (mais
  `--appt-bar-w + 9px` à esquerda). Padding não altera altura (ela é px),
  mas afrouxava o topo e roubava a segunda linha de texto. Consequências
  encadeadas, e as três precisam mudar juntas: `--appt-head-h` e
  `APPT_HEAD_SAFE` 44 → **40**, e `AGENDA_APPT_COMPACT_MAX_MINUTES`
  60 → **45** (com 8px de padding as duas linhas medem 36,8px e cabem num
  card de 45min, que mede 43px — com 12px não cabiam).
- **Camadas.** Lista única no comentário de `.timeline` no CSS:
  0 linhas · 1 `.agenda-free-slot` · 4 `.timeline-block` · 10 appointment
  (+1 por nível, `Z_APPT`) · 30 linha do horário atual · 200 overlays.
- **O card mostra a FAIXA DE HORÁRIO, não a duração** (`apptTimeRange()`):
  "Coloração · 9:00–11:30", nunca "Coloração · 2h30". A duração já é a
  altura do card — o horário de início e fim é o número que só um rótulo
  pode dar. Formato 24h **sem zero à esquerda**, igual aos rótulos da coluna
  de hora logo à esquerda (`9:00`, `12:00`), e travessão de intervalo (–).
  12h com AM/PM seria a referência americana do iPhone e não existe em
  lugar nenhum do painel; `fmtTime()` é 24h no app inteiro. Vale nos três
  tiers (`.hours`, `.micro-hours`, `.compact-hours` — as antigas `.dur`,
  `.micro-dur` e `.compact-dur`). A duração sobrevive **só no
  `aria-label`**, de propósito: quem não vê a altura do card não tem de
  onde tirá-la. `.tb-time` do bloqueio manual continua em `fmtTime()`
  (`14:00–16:00`, com zero) — não foi tocado por escopo.
- **Pager de dias: arrasto horizontal** (`bindAgendaPager()`,
  `pagerSettle()`, `pagerCommit()`, `pagerGoTo()`). Não é "swipe detectado →
  toca animação": o trilho acompanha o dedo 1:1 durante o gesto e só decide
  no soltar. Cinco coisas sustentam isso, e mexer numa quebra as outras:
  1. **`touch-action: pan-y` na `.timeline`.** O navegador continua dono do
     eixo Y (com momentum) e devolve o X pros handlers de pointer. É o que
     dispensa `preventDefault`, que mataria o scroll.
  2. **Três páginas irmãs** (`[data-page="prev|current|next"]`) num trilho.
     Só a atual fica no fluxo (dá a altura); as vizinhas são absolutas em
     ±100% e **já vêm desenhadas** (`paintAgendaSidePages()`), então o gesto
     nunca revela tela vazia e nada é renderizado por pixel. No painel real
     não custa consulta: `loadAppointments()` já traz a agenda inteira.
  3. **A data só muda no commit.** Durante o arrasto o estado lógico
     continua no dia atual — cancelar não deixa resíduo, e o cabeçalho não é
     reconstruído a cada pixel. `updateAgendaChrome()` roda depois: troca o
     rótulo do mês e, se mudou de semana, refaz a faixa de dias e
     **reamarra os botões** (`bindWeekDayButtons()`).
  4. **Direction lock antes de qualquer movimento.** Nada acontece antes de
     `PAGER_INTENT_PX` (8px); depois disso só vira pager se
     `|dx| > |dy| * 1.2`. Se o dedo foi pra vertical, o gesto é abandonado
     até levantar. Um tremor de 5px em cima de um card continua abrindo o
     atendimento; um arrasto confirmado marca `pagerState.arrastou` e o
     click é engolido em **fase de captura** no viewport, antes do `onclick`
     do card.
  5. **Commit por distância OU velocidade**: 22% da largura
     (`PAGER_COMMIT_RATIO`) ou 0,45 px/ms (`PAGER_FLICK_VELOCITY`) medidos
     nos últimos ~120ms **na mesma direção do deslocamento** — sem o teste de
     direção, desacelerar voltando cancelaria um arrasto que já tinha
     passado do limite.

  Detalhes que já morderam ou morderiam: o transform é escrito **direto no
  `pointermove`, sem `requestAnimationFrame`** — rAF não dispara sem
  composição de frames (armadilha já documentada aqui) e deixaria um frame
  pendente segurando os movimentos seguintes; `pagerSettle()` tem
  `transitionend` **mais** rede de segurança por `setTimeout`, pelo mesmo
  motivo; `buildAgendaGrid(day, {consumeEntering:false})` existe porque a
  função zera `state.enteringApptId` e só a página ATUAL pode gastar essa
  marca; `resize` no meio do arrasto chama `pagerCancelar()`, senão o trilho
  ficaria preso num `translateX` de uma largura que não existe mais.
  `prefers-reduced-motion`: o dedo continua sendo acompanhado (feedback
  direto é acessibilidade), só o snap vira instantâneo.

  **`renderAgendaGridTransition()` morreu**: o toque na faixa de dias passa
  pelo mesmo motor do gesto (`pagerGoTo()`), então tocar num dia e arrastar
  até ele têm o mesmo movimento. `slidePane()` continua sendo o motor da
  troca de **semana** (`renderAgendaTransition`), que é outro nível.
- **Cabeçalho.** O botão da esquerda mostra o **mês por extenso**
  (`Agosto`) com chevron e abre o calendário; fora do ano corrente volta
  abreviado com ano (`Set 2027`), que é o único jeito de caber em 320px.
  Nunca escrever "Agenda" nesse botão. `Hoje` e `+` seguem à direita, com o
  fluxo de sempre; as setas ‹ › de semana continuam onde estavam.
- **Bloqueio manual** ganhou o mesmo eixo esquerdo e a mesma escala, e só
  isso: segue rachurado, neutro e **sem barra de destaque**. Pausa clareia
  (cabe encaixar alguém), bloqueio hachura (o oposto) — a distinção de
  10/08/2026 continua valendo.
- **A pausa não tem rótulo nenhum.** Saiu o `.gap-label`
  ("⏱ pausa · 70min"): a região é comunicada **só** pelo fade sobre a
  própria cor do card, com a barra lateral atravessando inteira. Sem
  texto, sem duração, sem horário, sem ícone — e não se substitui por
  outro texto. O motivo é de leitura: o rótulo brigava com o nome da
  cliente e, num card com encaixe por cima, ficava escondido metade das
  vezes; informação que aparece por acaso é pior que informação nenhuma.
  A duração da pausa continua em `segmentsOf()` e no detalhe do
  atendimento. `.appt-gap` é um **nó vazio** — nada de flex ali dentro.
- **A grade não desenha o vazio.** Os cards tracejados de "Xh livres"
  (`.agenda-free-slot`) saíram da timeline: a ausência de card já
  significa disponibilidade, e num calendário de verdade ninguém pinta o
  buraco. Saiu **só o desenho** — `computeFreeGaps()`, `freeSlotLabel()`
  e `AGENDA_FREE_MIN_MINUTES` continuam intactos (com os holds entrando
  como intervalo ocupado), e `openNewApptModalAt()` também, porque é
  caminho do wizard de agendamento. O que morreu foi
  `bindFreeSlotClicks()`, que não tinha mais elemento pra amarrar.
  Nenhuma regra de disponibilidade, conflito, gap, busy slot ou booking
  foi tocada. Depois disso a grade contém **apenas**: linhas de hora,
  appointments, pausa faded, encaixes, `schedule_blocks` e a linha do
  horário atual.
- **Três cenários de encaixe no demo** (`demoSalao()`, só em
  `painel_demo.html`), pra comparar composições diferentes lado a lado:

  | dia | principal | pausa | encaixe |
  |---|---|---|---|
  | 1º aberto | Camila Rocha · Coloração 09:00–11:30 (40/70/40) | 70min | Marina Costa · Corte 09:50–10:35 (45min, tier rico) |
  | 3º aberto | Helena Braga · Coloração 10:00–13:00 (60/60/60) | 60min | Sofia Nunes · Escova 11:10–11:50 (40min, tier compacto) |
  | 5º aberto | Beatriz Lopes · Mechas 12:00–16:00 (60/120/60) | 120min | Teresa Vilar · Hidratação 13:30–14:30 (60min) |

  No 1º dia entra também **Ana Reis · Mechas 12:30–16:00**, card
  separado — é o teste de precisão da grade (12:30 na metade exata entre
  as linhas de 12:00 e 13:00, fim exato na linha das 16:00).

  Três regras que valem pra qualquer cenário novo aqui:
  1. **Os dias são os 1º/3º/5º ABERTOS a partir de amanhã**, contando
     dias abertos — nunca datas de calendário cravadas (`new Date(2026,
     7, 18)` deixaria o demo abrindo num dia vazio em setembro) e nunca
     diferença em milissegundos (na semana de virada do horário de verão
     dois dias civis distam 47h ou 49h).
  2. **O encaixe cabe inteiro na pausa** (`start >= gap.start` e
     `end <= gap.end`), com folga dos dois lados. Encostar em
     `work_before`/`work_after` seria estado que o guard de conflito real
     recusa, e demo que mostra estado inválido não serve pra decidir nada.
  3. **Os bloqueios manuais de exemplo ficam nos dias 2º e 4º abertos**
     (`diasAbertos[1]` e `[3]`), justamente pra não caírem em cima de um
     cenário — antes eram `hoje + 3` / `hoje + 6` e, dependendo do dia da
     semana, pousavam no mesmo dia do encaixe.

### Login V2 — "cartão de recepção" (15/08/2026)

Redesenho da única tela autenticada do produto, nos dois arquivos. Nenhuma
regra de negócio, RPC, RLS ou política de sessão do Supabase foi tocada.

- **A marca não salta entre a Splash e o Login** — desde 16/08/2026 isso é
  feito por **movimento**, não por offset. Ver "Shared motion" logo abaixo. O
  `calc(50dvh - 29px)` que alinhava as duas telas **saiu**: o destino é medido
  em runtime. `.wordmark`/`.wordmark-sub` e `.splash-word`/`.splash-sub`
  continuam **espelhando valores** e precisam mudar juntos — é a mesma marca
  atravessando duas telas.
- **O conjunto (marca + cartão) centraliza com `margin: auto`**, nunca
  `justify-content: center`: com o conteúdo maior que a viewport o center
  esconde o topo atrás da borda e ele fica inalcançável mesmo com rolagem.
- **`body.is-login`** anula o `padding-top: 8px` do `#app` (que existe para
  todas as outras telas) e o `padding-bottom: 100px` do `body`, reservado à nav
  que o Login esconde. A classe entra e sai em `setAuthedChrome()`.
- **Erro não redesenha a tela.** `loginErro()` mexe só no `#loginError`, no
  `aria-invalid` e na classe `.o-field-error`. O e-mail é preservado, a senha é
  limpa e o foco vai para ela. A mensagem do Supabase **nunca** chega à tela:
  ela só escolhe entre a copy de credencial e a de rede.
- **Um submit por vez** (`loginEmCurso`) e botão busy por
  `orenziUI.setButtonBusy()`. No sucesso o botão **fica** busy: quem troca a
  tela é `checkSession()`, e devolver o botão ao normal daria um piscar de
  "clique de novo" antes de tudo ser substituído.
- **`state.painelAtivo` é a guarda de entrada dupla.** `onAuthStateChange`
  emite `SIGNED_IN` durante o boot do supabase-js e chamava `checkSession()`
  outra vez — com `loadAll()` junto, que são 8 consultas.
- **`encerrarSessaoUI()` é o caminho único de fim de sessão**, para "Sair" e
  para expiração; o que muda é só a copy. Ele limpa o que o Login sozinho não
  alcança, porque `renderLogin()` troca **só** o `#app`: `closeModal()` (folha
  ou wizard aberto), os `.o-dialog-overlay` do DS (anexados ao `<body>`) e
  `setKioskMode(false)` (o quiosque do Questionário esconde header e nav por
  conta própria). `state.tab` é preservado; conteúdo não salvo **não é**, e a
  tela não promete que seja.
- **O gancho de sessão expirada mora em `showToast()`** — é o único ponto comum
  aos 14 handlers que avisam "faça login novamente" quando a escrita com
  `.select()` não toca linha nenhuma. A string não decide nada:
  `confirmarSessaoExpirada()` confirma em `getSession()` antes de agir, e se a
  copy mudar o pior caso é voltar ao comportamento antigo, nunca um logout
  falso. Os três formulários que mostram erro **inline** (`#ncError`,
  `#prodError`, `#wizNcError`) ficam fora — dívida registrada, não descuido.
- **Sem recuperação de senha e sem link para ela.** Ver *Password Recovery
  end-to-end* no backlog do vault.
- **Duas exceções locais no campo**, comentadas no CSS: `font-size: 16px` (o
  Safari do iPhone dá zoom abaixo disso) e `border-radius: var(--radius-sm)` —
  o painel tem uma regra global `input[type="email"] { border-radius: 999px }`
  que, por ser seletor de atributo, vence a classe do DS e transformaria
  qualquer `.o-input` em pílula.

### Shared motion — Splash → Login (16/08/2026)

A splash não é removida e substituída pelo Login: ela **vira** o Login. Só o
boot sem sessão; o caminho autenticado (Splash → Painel) é o fade de sempre,
sem uma linha nova. `splashMorphParaLogin()` é a função; `splashSair()` só
escolhe entre ela e o fade.

- **Quem se move é a marca DO LOGIN** (FLIP): mede-se o destino real com
  `getBoundingClientRect()`, aplica-se o deslocamento inverso, solta-se. No
  fim não existe troca de elemento — o que está na tela já é o Login. Não há
  coordenada cravada, e por isso funciona igual de 320px a desktop e em
  paisagem. Medido: subida de 163,6px em todas as alturas onde o conteúdo
  cabe (as duas telas centralizam blocos de altura fixa, então a diferença é
  constante), 126px em paisagem, delta residual **0px** em todas.
- **A marca da splash é apagada no MESMO frame** em que a do Login assume a
  posição dela (`#splash.is-morphing .splash-mark { opacity: 0; transition:
  none }`). Sem crossfade, de propósito: são o mesmo desenho no mesmo ponto,
  e qualquer transição ali produziria o instante com duas marcas.
- **O fundo da splash fica transparente durante a passagem** e isso não
  revela nada: `#splash` e `body` são os dois `--color-bg`. É o que permite
  desligar a cobertura sem um frame de piscada.
- **A splash só sai do DOM quando a passagem termina**, e o gatilho é o
  **CTA**, não o wordmark: a marca chega aos 460ms, o botão é o último a
  entrar (150 + 120 + 280 = 550ms). Fechar no fim do movimento cortaria os
  últimos ~90ms do fade dele. Três redes como sempre: `transitionend`,
  `setTimeout` e o flag.
- **`inert` sai só no fim.** Durante a passagem o Login está atravessando a
  tela e não recebe toque nem teclado; nenhum campo é focado por conta
  própria.
- **Aterramento na limpeza.** Antes de tirar as classes, as transições
  pendentes são finalizadas (`getAnimations().finish()`). Em aba sem
  composição de frames elas ficam congeladas onde estavam, e o CTA poderia
  seguir invisível depois da limpeza — mesma família de armadilha do
  `transitionend` que não dispara.
- **Durações locais** (`--login-morph: 460ms`, `--login-reveal-start: 150ms`),
  pelo mesmo motivo de `--splash-in`: abertura de marca não é transição
  rotineira de estado. Ficam no escopo do componente e **espelhadas** em
  `SPLASH_MORPH_MS` / `LOGIN_REVEAL_START_MS`. O reveal do formulário usa
  `--motion-route` e `--ease-out`; a subida usa `--ease-standard`.
- **Nada do ciclo da splash mudou**: `markReady`, os três motivos de
  readiness, o piso de branding, o teto e a barra de progresso continuam como
  estavam. A passagem roda **depois** de a saída já ter sido autorizada.
- **Movimento reduzido**: a marca não percorre distância nenhuma (o JS não
  aplica transform) e a troca vira **cross-fade** — as duas marcas mudam de
  opacidade ao mesmo tempo, 280ms, porque sem deslocamento um sumiço
  instantâneo deixaria um intervalo com nenhuma das duas. Stagger zerado.
- **Logout e sessão expirada NÃO repetem isso.** `renderLogin()` só prepara a
  passagem se a splash ainda estiver no ar (`!splashState.done`); fora do
  boot a tela nasce pronta. Repetir a abertura de marca ali seria uma splash
  falsa.

### Splash e boot do painel (15/08/2026)

Redesenho visual **e** troca do mecanismo de saída. Só `painel.html` e
`painel_demo.html` — `agendar.html`, `gerenciar.html` e a landing continuam
entrando direto, de propósito. Contexto de produto em `vault/01 - Product/Splash.md`.

- **A splash sai quando o app está pronto, nunca por cronômetro.** Antes era
  `setTimeout(1300)` + fade de 500ms: 1,8s fixos que sobravam em rede boa
  (`DOMContentLoaded` aos 82ms no localhost) e faltavam em rede ruim — quando
  `loadAll()` passava de 1,3s, a splash saía e revelava um `#app` **vazio**,
  porque `render()` só roda depois dela.
- **`markReady(motivo)` é o único portão, e é idempotente.** Três emissores,
  o primeiro vence: `READY_LOGIN` (sem sessão, `renderLogin()` desenhou),
  `READY_PANEL` (`loadAll()` terminou no `finally` e `render()` desenhou),
  `READY_TIMEOUT` (`SPLASH_TETO_MS`, 2,5s desde a navegação). A
  idempotência **não é zelo**: `onAuthStateChange` emite `SIGNED_IN` durante
  o boot do supabase-js e chama `checkSession()` de novo — sem o flag, a
  saída seria reagendada depois de a splash já ter saído.
- **O piso é de BRANDING, não de loading** (ajustado no mesmo dia, depois de
  a primeira versão ficar rápida demais pra marca ser lida).
  `SPLASH_BRANDING_MS` = **2100ms contados de tW**, e o ritmo é: entrada
  ~340ms (`--splash-in`) → permanência plena ~1760ms → saída 280ms
  (`--motion-route`). Total ~2,4–2,6s conforme a fonte demore.
  **Isso não é a volta do timer cego**: sem `markReady()` a splash não sai
  por conta do piso. O piso só atrasa uma saída já autorizada — quem chega
  **depois** manda, e em rede lenta é o app que dita.
- **O piso conta do wordmark, não do início.** Roda a partir do frame em que
  a marca ficou **visível**, e ela espera Jost até `SPLASH_FONTE_MS` (600ms).
  O CSS de fonte usa `display=swap`: pintar antes faria a marca trocar de
  tipografia no meio da splash. Contado do início, uma fonte lenta comeria
  justamente o tempo de leitura que o piso existe pra garantir.
- **`--splash-in: 340ms` é exceção aprovada**, declarada no escopo de
  `#splash` e não no `:root`. Fica acima do teto de 350ms de `docs/05 §3`
  para transição *rotineira* — a splash é abertura de marca, não transição
  de estado, e o ritmo foi pedido pelo dono do produto. O valor está
  **espelhado em `SPLASH_ENTRADA_MS`** no JS: mudar um exige mudar o outro.
- **A barra de progresso é monotônica por contrato.** `splashProgresso()`
  ignora qualquer valor menor que o atual. Bug real pego no teste: em rede
  boa `loadAll()` resolve **antes** da fonte chegar, e a barra ia a 100% e
  voltava a 80% — progresso andando pra trás. O segundo argumento (`durMs`)
  faz a barra encher exatamente no tempo que falta pra saída, em vez de
  saltar pra 100% e ficar cheia parada os dois segundos do branding.
- **`splashState.saidaEm` / `readyAt` existem pra diagnóstico**, não pra
  lógica. Aba em segundo plano agrupa timers em ~1s e falseia qualquer
  cronometragem feita de fora; esses campos dizem o instante que o código
  realmente decidiu.
- **`markReady` no `finally` de `loadAll()`, não no caminho feliz.** Os 8
  loaders engolem erro de query, então `Promise.all` quase nunca rejeita —
  mas se uma exceção escapar, `state.booting` ficaria ligado pra sempre.
- **`state.booting` existe pra Home não mentir.** Se o teto revela o painel
  antes dos dados, `renderHome()` desenha `.home-boot` (estado neutro) e
  retorna cedo. Empty state ali diria "Nenhum atendimento hoje" com o state
  vazio — afirmação **falsa** sobre a agenda, pior que espera. Só a Home
  precisa saber: `state.tab` nasce `'inicio'` e nenhuma outra aba é
  alcançável antes de `loadAll()` voltar. Não é skeleton, e não deve virar.
- **Limpeza idempotente por três gatilhos** (`transitionend` + `setTimeout`
  de 600ms + o flag `done`). Mesma armadilha do `morphAvatar()`: sem
  composição de frames o `transitionend` **não dispara** — confirmado neste
  redesenho, com a aba oculta a remoção veio sempre pela rede de segurança.
- **Ordem dos `<link>` no `<head>` importa.** Os CSS locais vêm **antes** do
  CSS de fonte do Google, que é render-blocking: com o Google primeiro, o
  primeiro pixel era **branco** e a splash só aparecia depois. Agora o
  primeiro paint já sai em `--color-bg` e a sequência do PWA é bege → bege →
  bege. Mais `preconnect` pros dois domínios de fonte. Não mexe na cascata: o
  CSS do Google só declara `@font-face`.
- **Nenhum valor visual novo.** Fundo `--color-bg`, marca
  `--color-accent-700`/`--color-neutral-600`, barra `--color-accent`,
  durações e curvas todas de token. A splash anterior tinha seis cores
  cruas (`#16151a`, `#26242a`, `#3a383e`, roxo, `#b8933c`, off-white) e
  invertia o tema duas vezes. **O anel escuro continua nos ícones do PWA** —
  trocá-los depende da Juliane.
- **`prefers-reduced-motion` via `orenziUI.prefersReducedMotion()`**, não um
  media query reimplementado. Somem deslocamento e crescimento da barra;
  restam as opacidades. Piso e teto continuam valendo.

### Status na timeline (10/08/2026)

A agenda **não carimba o que é normal**. `timelineStatusBadge()` (logo abaixo
de `statusClass()`) é a única fonte da regra:

| status | timeline |
|---|---|
| `confirmed` | nada — estar na agenda já diz que o atendimento existe |
| `completed` | nada — é o estado natural de um atendimento passado |
| `pending` | **nada, por enquanto.** O status existe no schema mas o produto não definiu quando um agendamento deveria ficar pendente; um selo inventaria o significado junto. Dado preservado |
| `no_show` | selo de texto `No-show`, e **só** quando marcado explicitamente |
| `cancelled` | **não renderiza** — filtrado no topo de `buildAgendaGrid()` |

O que saiu: o selo `Confirmado` e a **bolinha** `.status-dot` dos tiers
micro/compact. A bolinha era status (`statusClass(a.status)`), não source nem
categoria — mas como `statusLabel(null)` devolve `'Confirmado'` e
`statusClass()` cai em `st-confirmed` por omissão, ela aparecia em 100% dos
cards quase sempre na mesma cor: legenda que não existia em lugar nenhum,
ocupando o canto de todo card. **Nada de dot sem rótulo** — se voltar a
existir sinal de status na agenda, tem que ser texto.

O filtro de `cancelled` é de **render, não de dado**: nada é apagado, nada
muda de status. No painel real `loadAppointments()` já faz
`.neq('status','cancelled')` na leitura; o filtro na UI é o que segura um
item cancelado que ainda esteja em memória, sem depender de como a lista foi
carregada.

A Home (`.appt-modern-card`) tem regra própria e continua mostrando o selo —
é outra tela, e o pedido foi sobre a timeline.

**Não existe inferência automática de no-show.** "O horário passou" nunca vira
`no_show`; ele só existe se alguém gravar. O fluxo para marcar ainda será
definido — ver "Client History" abaixo.

### Client History — regra futura, NÃO implementada

Anotado em 10/08/2026 para não se perder junto com a limpeza acima:

- `cancelled` permanece no banco e deve aparecer no histórico da cliente,
  com indicação `Cancelado` — só não aparece na agenda operacional;
- `no_show` permanece registrado quando marcado explicitamente;
- no-show **automático** não foi aprovado e não deve ser implementado por
  conta própria;
- o fluxo para marcar no-show (quem marca, de onde, com que confirmação)
  ainda será definido.

Nada disso está implementado. Ver também "Appointment Detail Audit" no fim
deste arquivo — as duas frentes se tocam.

**Fuso.** O expediente é `Europe/Dublin`, não o do aparelho de quem agenda.
`agendar.html` tem `salonTimeToInstant(data, minutos)` — converte "data + minutos
do dia" no instante absoluto em Dublin e cobre a virada do horário de verão com
uma segunda passada. **Nunca** construir horário de slot com
`new Date('YYYY-MM-DDT00:00:00')`: isso é meia-noite no fuso do celular da
cliente, e quem marcasse "9h" com o telefone no horário do Brasil gravava 13h em
Dublin. A falha é silenciosa — tela, e-mail e painel divergem sem erro nenhum.
`salonToday()` e `salonClock()` existem pela mesma razão.

**⚠ O caminho INVERSO também morde: tirar a data civil de um `Date`.**
Bug real, encontrado em produção em 13/08/2026 — a Juliane tocava `22/08` no
calendário do novo agendamento e o atendimento era **gravado em `21/08`**.
Causa: `d.toISOString().split('T')[0]`, onde `d` era meia-noite **local**. Em
Dublin no horário de verão (IST, UTC+1, de fim de março a fim de outubro) esse
instante é `23:00 UTC do dia anterior`, e o fatiamento devolvia o dia −1.

Três coisas fazem desta uma armadilha especialmente cruel:

- **O número na tela vinha de `d.getDate()`** (local, correto), então o
  calendário parecia certo; só o `data-date` mentia. Não era bug de exibição:
  a data errada era persistida.
- **Só existe metade do ano.** No inverno Dublin é `UTC+0`, meia-noite local
  é meia-noite UTC, e o fatiamento acerta. O bug nasce e some com o horário
  de verão — por isso passou por várias revisões sem aparecer.
- **Falha silenciosa e coerente**: horários, review, confirmação e banco
  concordavam entre si, todos no dia errado.

Regra: **data civil sai de `dateInputValue(d)`** (componentes locais), nunca
de `toISOString()`. Converter para instante é só o passo final, quando já há
data **e** hora. `toISOString().slice(0,10)` só é seguro sobre um `Date`
construído com `Date.UTC(...)` — é o que `agendar.html` faz em `addDaysIso()`,
e é por isso que o Booking público nunca teve este bug (ele também tira o
"hoje" de `Intl.DateTimeFormat('en-CA', { timeZone })`, que devolve a data
civil de Dublin direto, sem passar por `Date`).

**Expediente: 9h–18h, fecha domingo e segunda.** O atendimento tem que
**terminar** até as 18h.

Duas faixas de hora convivem no painel e não podem ser confundidas:

| Constante | Valor | Serve pra |
|---|---|---|
| `OPEN_HOUR` / `CLOSE_HOUR` / `WORK_MINUTES_PER_DAY` | 9h–18h (540 min) | **contas** — ocupação, capacidade, próximo horário livre |
| `AGENDA_START_HOUR` / `AGENDA_END_HOUR` | 8h–19h | **desenho** — altura e linhas da timeline, com uma hora de respiro nas pontas |

Medir ocupação contra 8h–19h dava um denominador que o `agendar.html` nunca
consegue preencher, e a ocupação saía estruturalmente baixa. Capacidade só conta
dias em que o salão abriu (`isSalonOpenDay`).

**Só a Juliane atende.** Outras profissionais existem com `active = false` e são
mantidas por causa do histórico. Onde há uma só ativa, a escolha de profissional
some da interface.

No `agendar.html` isso é o passo 2: ele sai do fluxo, a profissional é escolhida
sozinha e a cliente vê **3 passos**, não 4. Quem manda é `state.pulaEscolhaStaff`
— o `init()` chuta pelo total de ativas e o `advanceFromStep1()` confirma pela
lista do serviço escolhido. `etapasVisiveis()` cuida dos pontinhos e do "Passo X
de Y": o número interno do passo continua 1–4, só a contagem exibida muda. Se
uma segunda profissional voltar a ficar ativa, a tela reaparece sozinha.

`loadStaffForService()` **filtra por `active`**. Todas as cinco profissionais
estão ligadas a todos os 15 serviços em `staff_services`, então sem esse filtro
a cliente escolhia entre cinco pessoas — quatro fora do salão, incluindo a
recepcionista — e podia agendar com quem não atende.

No painel a regra é `profissionaisAtivos()`, e **toda conta de capacidade passa
por ela** — `dayAggregate()`, `nextAvailableSlot()`, `monthOccupancyPct()`,
`weekOccupancyPct()` e o `<select>` do modal de novo agendamento. Nunca medir
capacidade com `state.staff.length`: essa lista traz as cinco, e o denominador
saía cinco vezes maior que o salão. Num dia com 525 dos 540 minutos reservados,
o painel mostrava **19% de ocupação e "36h livres"** — num expediente de 9
horas. Com o filtro, 97% e "Agenda praticamente lotada".

## Padrão visual (modelo: Início/Insights)

02/08/2026: começou um roadmap pra levar Agenda, Clientes, Estoque e
Questionário ao mesmo padrão visual de Início/Insights. Ver `docs/roadmap.md`
pra lista completa e fases.

O modelo é `.appt-modern-card` (o card de agendamento da Home): fundo
`--color-surface` + borda `--color-divider` + `border-radius: 16px` + leve
elevação ao toque — não o cinza chapado de `--color-neutral-100` sem borda que
`.card`, `.client-list-card` e o `.stock-row` antigo usavam. `.list-row` é essa
mesma base, reaproveitada nas outras abas; as duas classes compartilham a regra
em CSS, então mudar o modelo muda a família inteira de uma vez.

Cor de alerta (estoque baixo, e qualquer "isso precisa de atenção" que apareça
depois) é sempre o par `--color-accent-2-100`/`--color-accent-2-700` — é o
mesmo vermelho que `.pc-status.is-busy` ("Agenda praticamente lotada") e a seta
de queda dos indicadores já usam. Não introduzir uma cor de alerta nova.

Feito: Estoque (redesenhado por inteiro em 03/08 — ver abaixo), Agenda (`.timeline` no padrão de cartão,
animação de toque em dia da semana/booking/botão +), Clientes (lista e
perfil, os dois com redesign próprio — ver abaixo) e Questionário
(reconstruído em 15/08 — seção própria em "Regras do domínio").

**Redesign da lista de clientes (03/08/2026, prompt de "design review" do
Raphael com print de referência).** A tela ganhou busca, filtros, resumo e
cartões com métricas. Tudo o que aparece é **derivado** de `appointments` e
`clients.created_at` — nenhuma coluna nova:

- **Status** (`clientStatus()`): "Nova" se cadastrada há ≤30 dias,
  "Inativa" se a última visita passou de 60 dias (ou nunca veio), senão
  "Ativa". Constantes no topo (`CLIENT_NEW_DAYS`, `CLIENT_INACTIVE_DAYS`).
  Ponto colorido **com o rótulo em texto ao lado** — cor sozinha não
  comunica pra quem não distingue verde de cinza.
- **Filtros** (`CLIENT_FILTERS`): Todos · VIP · Recentes · Mais frequentes ·
  Inativos. **"Favoritos" não existe** — exigiria uma coluna
  `clients.favorite` separada do VIP, e o Raphael preferiu deixar de fora.
- **Ordenação** (`CLIENT_SORTS`): última visita, nome, maior gasto, mais
  frequentes, VIP primeiro. Abre em folha (`.sheet-option` dentro do
  `.modal-sheet` que já existia).
- **FAB "+" agora é de duas abas.** O mesmo `#fabNewAppt` abre produto no
  Estoque e `openNewClientSheet()` em Clientes — antes cliente só nascia
  dentro do fluxo de agendamento. As opções "Importar contatos" e "Escanear
  cartão" do prompt **não** entraram: não existem no app, e botão que não
  faz nada é pior que botão nenhum (decisão confirmada com o Raphael).
  O FAB some no perfil, que é outra tela dentro da mesma aba.

**A busca não pode passar por `render()`.** `renderClientsList()` reescreve
só o `#clientsListWrap`; se o `render()` cheio rodasse a cada tecla, o
`<input>` seria recriado e perderia o foco (com o cursor voltando pro
começo) a cada letra digitada. Mesma família de armadilha do dropdown do
diagnóstico e do slide da agenda: **o que anima ou tem foco não sobrevive a
um `innerHTML` novo.** Pelo mesmo motivo o botão de limpar usa `mousedown`
e não `click` — o `blur` do input dispararia primeiro e o botão já teria
sumido junto com a classe `.has-text`.

**Transição do avatar (shared element).** `morphAvatar()` clona o avatar,
posiciona sobre o da lista e anima até a posição do avatar do perfil.
A limpeza (`limpar()`) é **idempotente e tem três gatilhos**: `onfinish`,
`oncancel` e um `setTimeout` de rede de segurança. Isso não é zelo
excessivo — foi bug real encontrado no teste: sem composição de frames
(aba em segundo plano) a animação não corre, `onfinish` nunca dispara, e o
resultado eram clones empilhados na tela com o avatar verdadeiro preso em
`opacity: 0`. Toda animação via Web Animations API neste projeto precisa de
um caminho de limpeza que não dependa do `onfinish`.

**Scroll** (`state.clientsScrollTop`): guardado ao abrir um perfil e
devolvido ao voltar. Tocar na aba pelo rodapé zera de propósito — é entrada
nova, não "voltar".

**Fase 3 — Clientes (03/08/2026).** Histórico de visitas mostra só as 3 mais
recentes (`HISTORY_PREVIEW_COUNT`), com botão "ver mais" —
`state.clientHistoryExpanded` controla, reseta ao trocar de cliente. Tag VIP
deixou de ser automática (`visits >= 5`) e virou coluna
`clients.vip boolean` (default `false`, ninguém migrado — decisão do
Raphael foi começar do zero); `clientStats()` lê `client.vip` direto, e o
botão `#vipToggleBtn` no perfil alterna e grava com `.select()` no fim, mesmo
padrão de escrita autenticada do resto do app. Valor do atendimento editável
por booking (coluna `appointments.price`) ficou de fora desta fase — decisão
do Raphael foi não mexer agora, por afetar toda conta de receita
(Insights, gasto da cliente).

**Redesign do perfil da cliente (03/08/2026, a partir de prompt detalhado do
Raphael — referência Apple Health/Linear/Stripe, sem copiar nenhum, paleta e
tipografia intocadas).** `renderClientDetail()` deixou de ser um formulário
de campos soltos e virou um perfil com hierarquia por espaçamento
(`.profile-section`, 32px entre blocos) em vez de caixa dentro de caixa —
"menos caixas, mais hierarquia" foi o pedido explícito.

- **Header**: avatar 72px com badge de estrela sobreposto no canto (só
  quando VIP, `.ph-vip-badge`, cor `--color-accent-700` — nunca `--color-accent-2`,
  que é reservado pra alerta), nome como maior elemento tipográfico da tela,
  `.vip-pill` clicável abaixo do nome (ícone de estrela outline/preenchida,
  `ICONS.star`/`ICONS.starFilled` — o único lugar do app onde os dois
  variantes convivem, e é intencional: outline = não marcada, preenchida =
  marcada), "Cliente desde {ano}" a partir de `c.created_at` (dado real, não
  inventado). Botões Ligar/WhatsApp viraram pill preenchido
  (`--color-accent-100`, sem borda) em vez de outline. **Não** entrou um menu
  de ações no canto superior direito que o prompt pedia — não existe nenhuma
  ação além das que já têm lugar próprio na tela, e um menu vazio seria UI
  decorativa (decisão confirmada com o Raphael).
- **Métricas** (`.stat-row`): ícone acima de cada número (`ICONS.bag`,
  `ICONS.money`, `ICONS.calendar`), label "Total investido" (não "gasto"),
  e "Última visita" mostra data curta (`fmtDateShort()`, "09 Ago") com
  `daysAgoLabel()` embaixo ("há 3 dias") — a data completa (dd/mm/aaaa)
  continua em `clientStats().lastVisit`, usada na lista de clientes.
- **Diagnóstico do cabelo**: os 4 campos (`hair_thickness`, `hair_density`,
  `hair_porosity`, `hair_elasticity`) trocaram de `<select>` por chips soltos
  (`.hair-chip-row`/`.hair-chip`, não o `.seg-toggle` unido de Insights —
  cada opção é seu próprio botão-pílula com espaço entre elas, pra bater com
  a referência visual que o Raphael trouxe). `hairSegmentedHtml()` substituiu
  `hairSelectHtml()`. Clicar no valor já ativo desmarca (mantém a opção de
  limpar o campo que o `<select>` tinha com "Selecione…").

  **O cabeçalho é literalmente um `.action-row`** — a mesma classe do "Infos
  do questionário" logo acima, a pedido do Raphael ("pega o card de infos e
  projeta no diagnóstico"). Só acrescenta `.diag-card-head` pro chevron e o
  espaçamento. **Colapsado por padrão**: `state.clientDiagCollapsed = true`
  ao trocar de cliente (junto com `clientHistoryExpanded`), só a linha do
  cabeçalho aparece até o toque. Chevron aponta pra baixo fechado, pra cima
  aberto (`rotate(-90deg)` num ícone que nasce apontando pra direita).
  Grava com `.select()` no fim, mesmo padrão de escrita autenticada.

  **A animação de dropdown não pode passar por `render()`.** O toggle
  manipula o DOM direto (classe + `max-height` inline no
  `.diag-card-body-wrap`), porque `render()` reescreve o `innerHTML` inteiro
  e um elemento recém-nascido nunca anima o próprio nascimento — mesma
  armadilha já documentada na faixa de dias da Agenda. Sequência de
  fechamento: põe `max-height` no `scrollHeight` atual, força reflow
  (`void el.offsetHeight`), aí vai pra `0px` — o reflow é **síncrono de
  propósito**, `requestAnimationFrame` não dispara em aba oculta/sem
  composição e o menu ficaria travado aberto. Ao terminar de abrir, um
  `transitionend` solta o `max-height` pra `none`: preso em px, o conteúdo
  cortaria se os chips passassem a quebrar em mais linhas (rotação de tela,
  fonte grande do sistema). `prefers-reduced-motion` mata a transição pelo
  CSS e o JS pula direto pro valor final.

  **Armadilha já mordida uma vez:** um SVG dentro de contêiner que não tem
  regra própria de `width`/`height` renderiza no tamanho nativo — enorme.
  Aconteceu aqui quando `.diag-card-head` reaproveitou só as classes
  internas de `.profile-section-title` (`.pst-icon`) sem a regra de tamanho
  correspondente (o "ícone de gota gigante" que o Raphael achou no teste
  visual). Pelo mesmo motivo, título de seção **sem** um segundo item pra
  equilibrar o `justify-content: space-between` do `.profile-section-title`
  empurra o texto sozinho pro canto direito — por isso ícone+texto de toda
  seção (mesmo as sem contador, como Favoritos e Histórico) precisam estar
  agrupados dentro de um `<span class="pst-left">`, nunca soltos como
  irmãos diretos do título.
- **Fotos do cabelo**: com 0 fotos vira um estado vazio convidativo
  (`.photo-empty-state`, ícone de câmera + "Adicionar fotos" + "Arraste ou
  toque para adicionar" + legenda `.photo-hint`); com 1+ fotos vira uma
  galeria horizontal com scroll (`.photo-scroll`) e o botão de adicionar no
  fim (`.photo-add-chip`). Essas classes são exclusivas do perfil da
  cliente — `renderApptDetail()` (fotos do atendimento) continua no grid
  antigo (`.photo-grid`/`.photo-add-tile`), não foi tocado por escopo (o
  pedido era só a tela de perfil).
- **Serviços favoritos**: ícone é `ICONS.star` (mesmo da tag VIP, reforça a
  metáfora "favorito" — antes era `ICONS.heart`, removido do `ICONS` por não
  ter mais uso). O chip "+ Adicionar serviço" que a referência mostrava
  **não** entrou — favoritos são calculados automaticamente pela frequência
  de agendamentos, não é campo editável hoje; adicionar isso seria
  funcionalidade nova, fora do escopo combinado com o Raphael.
- **Histórico de visitas**: virou timeline vertical (`.visit-timeline`,
  `.timeline-item`) com linha conectora entre os pontos (`.ti-line`, some no
  último item) e data empilhada em 3 linhas (`.ti-date` > `.ti-day`/`.ti-mon`/`.ti-year`,
  via `fmtDateShort()`) em vez de uma linha só.
- **Ícones**: `ICONS` ganhou `star`/`starFilled`, `phone`, `chat`,
  `clipboard`, `camera`, `history`, `trash`, `plus`, `bag`, `drop` — todos no
  mesmo traço 1.6px dos ícones existentes. Substituíram os emojis que a tela
  usava (📞💬📋🗑☆★), única exceção sendo o restante do app, que ainda tem
  emoji em outras telas fora do escopo deste pedido.
- **Microinterações**: `scale(0.96–0.98)` no `:active` de tudo que é tocável
  (pill VIP, botões de contato, action-row, chips do diagnóstico, chip de
  adicionar foto), 160–200ms, sem exagero — nada de animação de entrada
  coreografada (fade sequencial dos blocos), que o prompt sugeria mas não é
  crítico e o app não tem esse padrão em nenhuma outra tela hoje.

**Redesign do Estoque (03/08/2026, prompt de "design review" do Raphael —
referência Apple Health/Linear/Stripe, sem copiar nenhum).** A aba deixou de
ser uma lista de linhas e virou painel: resumo em 4 cartões → valor total →
busca → chips → lista agrupada → estatísticas → sugestões → movimentações.
(A ordem das três últimas é do Raphael: número frio primeiro, o que fazer com
ele depois, o registro do que já foi feito por último.)

- **Quatro estados, nenhuma cor nova** (`stockStatus()`): `sem` (qtd 0),
  `critico` (qtd ≤ mínimo), `baixo` (qtd ≤ mínimo × `ESTOQUE_BAIXO_FATOR`),
  `ok`. Cada estado é uma classe `.st-*` que declara **só** `--stk-color` e
  `--stk-bg`; ponto, badge, borda do cartão, ícone de sugestão e ícone de
  movimentação leem daí. Mudar um estado é mudar duas variáveis.
  O prompt pedia amarelo — não existe amarelo na paleta, e a regra de não
  introduzir cor de alerta nova vale. O degrau intermediário é o `accent` da
  marca; `accent-2` continua reservado pro urgente.
  **O verde teve que ser escurecido**: `#4f8a5b` (o ponto de "cliente ativa")
  como *texto* de badge dava 3,2:1 sobre o próprio fundo tingido. Virou
  `#3b6744`, 5,0:1 — medido no navegador, não estimado. Ponto e texto não
  têm o mesmo requisito de contraste.
- **Consumo, previsão e sugestão são derivados de `product_movements`**
  (`consumoDiario`, `diasRestantes`, `sugestaoCompra`). Só entram na tela com
  ao menos `CONSUMO_MIN_SAIDAS` saídas, e a janela tem piso de
  `CONSUMO_MIN_DIAS` — sem esse piso, duas saídas na mesma tarde viravam
  "consome isso por dia" e a previsão dizia que o estoque acaba amanhã.
  Sem histórico a tela **diz que não tem histórico** em vez de mostrar
  número; decisão explícita do Raphael, o banco de produção não foi semeado
  com consumo inventado. O demo tem movimentações mockadas justamente porque
  ele existe pra mostrar a tela cheia.
- **Toda mudança de quantidade grava movimento** (`registrarMovimento`):
  o −/+ do cartão, a edição manual, entrada/saída pela folha do FAB e a
  quantidade alterada no cadastro. Buraco no histórico = previsão saindo de
  um saldo que ninguém sabe de onde veio.
- **Segurar o −/+ acumula na tela e grava uma vez só** (`bindQtyHold`).
  Os passos alteram o `textContent` do `[data-qty-for]` direto, sem
  re-render: re-renderizar a lista no meio do gesto destruiria o próprio
  botão que está sob o dedo. Só no `pointerup` vai o total pro banco — uma
  escrita, uma movimentação, não N.
- **Toque no número abre a edição manual, e é toque simples.** O prompt pedia
  duplo toque; em tela sensível o duplo toque disputa com o zoom do navegador
  e falha metade das vezes, e o número já é um alvo próprio entre o − e o +.
- **A busca e os chips não passam por `render()`** — `renderStockList()` /
  `aplicarFiltroEstoque()` mexem só no `#stockListWrap` e nas classes
  `.active`. Mesma armadilha da lista de clientes (foco do `<input>`), mais
  uma nova: com `render()` cheio a animação de entrada em sequência
  (`.stk-enter`) tocaria de novo a cada chip.
- **Chips de categoria nascem do banco**, não de uma lista fixa. As
  categorias reais (Coloração, Descoloração, Tratamento, Finalização,
  Descartáveis) não são as que o prompt listou; chip fixo viraria filtro que
  nunca acha nada. `STOCK_CATEGORY_ICONS` mapeia as conhecidas e qualquer
  categoria nova cai no ícone genérico.
- **Rótulos de grupo só na ordenação por prioridade.** Em "Nome (A–Z)" a
  lista não está agrupada e o título mentiria.
- **Movimentações abrem com 3 itens** (`MOV_PREVIEW_COUNT`,
  `state.stockMovExpanded`) e um "Ver mais (N)" no fim; expandida mostra tudo
  o que `loadMovements()` carregou e o botão vira "Ver menos". Mesmo
  `.see-more-btn` do histórico de visitas da cliente, com `.is-less` girando
  o chevron pra cima. Ao **recolher**, a tela volta pro título da seção
  (`#stockMovTitle`): o botão some junto com a lista e sem isso o dedo fica
  apontando pro fim do documento.
- **Ficou de fora, de propósito:** "Escanear código de barras"
  (`BarcodeDetector` não existe no Safari do iPhone) e "Importar produtos"
  (não há fluxo de importação) — mesma decisão de "Importar contatos" em
  Clientes, confirmada com o Raphael. A folha do FAB tem três opções:
  cadastrar produto, registrar entrada, registrar saída.
- **`esc()`** (perto de `fmtQtd`) entrou junto: nome de produto é texto
  digitado e agora aparece em cartão, sugestão, timeline e `aria-label`.
- `.list-row` ficou sem nenhum uso no markup depois disso (o `.stock-row`
  era o último) — a regra continua no CSS porque é compartilhada com
  `.appt-modern-card`.

**Cor do booking é por categoria do serviço, não por profissional**
(`colorForService()`, perto de `colorForId`). Com só uma profissional ativa,
colorir por `staff.id` sempre dá a mesma cor pra tudo — o id não muda — e a
agenda vira monocromática sem que pareça um bug óbvio. `CATEGORY_COLORS` tem
as 5 categorias reais fixas (Alisamento, Coloração, Corte, Outros,
Tratamentos); categoria nova cai num hash estável em vez de quebrar. Nunca usar
`--color-accent-2` nessa paleta — é a cor reservada de "isso precisa de
atenção" (estoque baixo, agenda lotada).

Animações de toque (`:active { transform: scale(...) }`) sempre com
`transition` curta (~0.12s) e uma entrada em
`@media (prefers-reduced-motion: reduce)` zerando `transition`/`transform` —
ver o bloco perto do `.fab` em `painel.html`.

**Slide da agenda ao trocar de dia** (`renderAgendaTransition()`, perto de
`renderAgenda()`): clona a `.timeline` antiga, deixa `renderAgenda()` desenhar
a nova, e anima as duas por cima uma da outra — mesma técnica de
`renderTransition()` em `agendar.html`. A diferença importante: aqui `#app` é
compartilhado por todas as abas e é reescrito inteiro a cada `render()`, então
o clone **não pode** ser anexado no viewport antigo (ele morre junto quando o
innerHTML troca) — tem que ser anexado no viewport novo, depois de
`renderAgenda()` já ter rodado. Só a grade (`#timelineEl`) desliza, não a
`week-strip` nem o cabeçalho do mês. Animações feitas em JS (essa e o pop-up
de modal) checam `prefersReducedMotion()` no início e pulam pra
`renderAgenda()`/render direto sem animação — não dá pra confiar só no CSS
`@media` aqui porque a sequência inteira (clone, RAF duplo, cleanup) é
orquestrada em JS.

**Scrollbar da agenda** (`.timeline`, `attachTimelineScrollbarFade()`):
invisível por padrão, aparece com a classe `.is-scrolling` enquanto rola e
some sozinha 1s depois do último evento de scroll. `#timelineEl` é recriado a
cada render, então o listener é reamarrado no fim de `renderAgenda()` — mesmo
padrão dos outros binds da função.

**Modal de novo agendamento** (`renderNewApptModal()`): abre com a mesma
animação de "pop" do balão de ajuda dos indicadores (Insights) — fade + scale
com a curva "com molinha" (`cubic-bezier(.34,1.56,.64,1)`), só que subindo de
baixo em vez de nascer centralizado, porque aqui é uma folha de formulário
comprida, não um balão curto. Os campos entram em `.modal-section` (mesmo
cartão surface+borda do resto do app) com `.modal-field-label` no lugar de
`<label>` solto. Isso é só desse modal — não mudei o `<label>` global nem o
modal de produto do Estoque.

**Refino "estilo Apple Calendar"** (02/08/2026, a pedido do Raphael com print
de referência): grade sem card — `.timeline` perdeu fundo/borda/raio,
`.hour-row` ficou com linha quase invisível (`rgba(43,36,32,0.07)`). Título
`.agenda-date-title` entre a faixa de dias e a grade ("Domingo, 2 de agosto de
2026"). Linha do horário atual (`.current-time-line`, cor de marca — nunca
vermelho) só existe se `state.agendaDate` for hoje e a hora estiver dentro de
`AGENDA_START_HOUR`–`AGENDA_END_HOUR`; `updateCurrentTimeLine()` reposiciona a
cada 30s sem re-renderizar. O antigo link "Ir para hoje" (`.view-toggle`,
dentro do fluxo) virou `.fab-today`, botão fixo canto inferior esquerdo,
espelhando o `+` no lado oposto — sempre visível na aba Agenda, não só quando
fora do dia de hoje. `prevWeek`/`nextWeek`/"Hoje" passaram a usar
`renderAgendaTransition()` (mesmo slide do toque no dia), com a duração
ajustada de .32s pra .22s pra ficar na faixa pedida (180–250ms).

De brinde: `text-transform: capitalize` no `.day-label` (mês no cabeçalho e no
calendário de mês) maiusculizava **todo** "de" — "Agosto **De** 2026". Virou
`monthLabelRaw.charAt(0).toUpperCase() + slice(1)`, mesmo padrão que
`currentMonthLabel()` já usava em Insights. Se algum título com preposição no
meio (dia, mês) aparecer errado de novo, é isso — CSS `capitalize` maiusculiza
palavra por palavra, não é o mesmo que maiusculizar só a primeira letra da
frase.

**Segunda leva de refino (mesmo dia), a partir de um prompt de UX mais
detalhado — dois níveis de slide, não um só.** A Agenda tem DOIS painéis que
deslizam independentes, cada um só quando o que ele mostra realmente muda:

- `#agendaWeekViewport` > `#agendaWeekPane` (faixa de dias + título de data +
  grade, tudo junto) — desliza quando a **semana** muda: `prevWeek`,
  `nextWeek`, "Hoje" indo pra outro dia. `renderAgendaTransition()`.
- `#agendaViewport` > `#timelineEl` (só a grade) — desliza quando só o **dia**
  muda dentro da mesma semana: toque num dia da faixa. `renderAgendaGridTransition()`.
  Nesse caminho a faixa **não é recriada** — só troca a classe `.selected` nos
  mesmos 7 botões (`updateWeekStripSelection()`), que é o que faz a
  transição de `background`/`border-color` já declarada em `.week-day`
  animar de verdade (elemento novo nunca anima o próprio nascimento).

As duas passam pelo mesmo motor genérico, `slidePane(direction, viewportId,
paneId, drawFn)` — clona o painel antigo pelo id, deixa `drawFn()` desenhar o
novo, anima os dois por cima um do outro. `renderAgenda()` (a função "cheia")
sempre recria os dois níveis; por isso as duas transições reduzem a chamadas
de `slidePane` com ids diferentes.

**Armadilha que já mordeu uma vez:** os `onclick` dos botões de dia são
amarrados só quando `renderAgenda()` roda (render cheio). No caminho leve
(troca de dia dentro da mesma semana) eles **não são reamarrados** — então o
handler não pode usar a variável `day` capturada no escopo de quando foi
criado (fica presa no dia do último render cheio); tem que ler
`state.agendaDate` na hora do clique. Sem isso, o segundo toque em sequência
compara contra a data errada e pode virar no-op silencioso.

**Scroll inteligente** (`computeRelevantScrollTop()`): hoje → perto de agora;
outro dia com atendimento → perto do primeiro; sem atendimento → perto da
abertura (`OPEN_HOUR`). Sempre sobra ~1h30 de contexto acima do alvo.
`scrollTimelineTo(el, top, {animate})` — sem `animate` (padrão, todo render)
pula direto pra posição desligando o `scroll-behavior:smooth` do CSS por um
instante, senão a grade pareceria rolar sozinha toda vez que troca de dia;
`animate:true` é só do botão "Hoje", que pede um scroll visível de propósito.

**Botão "Hoje"** nunca é no-op: se o dia visto não é hoje, desliza a semana
(`renderAgendaTransition`) e pulsa a linha; se já é hoje (nada pra deslizar),
só recentraliza com scroll animado + `highlightCurrentTimeLine()` — senão o
toque pareceria não ter feito nada.

`HOUR_HEIGHT` foi de 64 pra 68px — mais respiro vertical nos eventos, sem
mexer em nenhuma fórmula (tudo deriva da constante).

**Horário do modal de novo agendamento virou dropdown** (`refreshApptTimeOptions()`,
perto de `openNewApptModal`) — antes era texto livre, digitado. As opções vêm
de `computeAvailableSlots(staffId, dateStr, durationMin)`, que aplica a mesma
regra do `agendar.html`: expediente (`OPEN_HOUR`–`CLOSE_HOUR`), grade de
`SLOT_MINUTES` (30min), e só os blocos de **trabalho** (`wb`/`wa`) de cada
atendimento da profissional bloqueiam — a pausa (`gp`) fica livre de
propósito, mesmo espírito da RPC `get_busy_slots`. Diferença: aqui lê
`state.appointments` direto em vez de RPC, porque a sessão do painel já é
autenticada e os dados já estão carregados (não tem o problema de RLS que o
`agendar.html` tinha). Recalcula sozinho quando serviço, profissional ou data
mudam no modal (`onchange` nos três campos) — antes de ter os três
preenchidos, o campo fica desabilitado com um aviso.

**Decisão 02/08/2026: o campo "Profissional" fica, mas só aparece se um dia
houver mais de uma ativa.** Não é código morto — é a mesma lógica que já
protege o resto do app (`profissionaisAtivos()`), e ela some sozinha quando
só há uma ativa, sem precisar mexer em nada se a Juliane contratar alguém.
O que estava errado era o **mock do demo**: `painel_demo.html` tinha Rebecca
Silva como segunda profissional "ativa" (sem `active:false`), e por isso o
campo aparecia lá mesmo sem existir em produção. Corrigido: Rebecca agora tem
`active:false` no mock de `staff` (mesmo papel das 4 inativas do banco real —
existe só pro histórico) e todo agendamento gerado no mock sai no nome da
Juliane (`staff: juliane`, não mais `staff[i % 2]`).

**Revisão de pixel (02/08/2026), a pedido do Raphael — "trate como revisão de
design da Apple".** Medido no navegador (`getBoundingClientRect`/
`getComputedStyle`), não só lido no CSS — duas inconsistências reais:

- `.fab` (54px) e `.fab-today` (44px) tinham alturas diferentes. Os dois
  ficam em `bottom:84px` nas pontas opostas da tela, então mesmo com a base
  igual, o par lia como desalinhado. `.fab-today` passou a 54px também.
- Espaço antes do rótulo "Cliente" (13,5px, depois do `.toggle-row`) era
  visivelmente menor que antes de "Serviço" (18,2px, no topo da segunda
  seção do modal) — mesmo papel visual, respiro diferente por causa de
  colapso de margem. `.toggle-row`'s `margin-bottom` foi de 14px pra 18px
  pra igualar. Confirmado depois: 17,5px vs 18,3px.

De brinde: `font-variant-numeric: tabular-nums` em `.hour-label` e
`.current-time-badge` — sem isso, dígitos de largura diferente (ex: "1" vs
"8") fariam o texto parecer que "treme" sutilmente a cada atualização de
minuto, mesmo com a caixa em largura fixa.

**Coisas que pareciam suspeitas mas não eram (medidas e descartadas):** o
espaço entre o fim de cada campo e a borda inferior dos cartões do modal já
era ~12px nos dois — simétrico, só uma medição errada minha (comparando a
`div` errada) sugeriu o contrário no primeiro passe.

**Segunda revisão (mesmo dia), a partir de um print do Apple Calendar como
referência de layout (não de identidade visual):**

- **Mês em pílula** (`.month-pill`): as setas ficaram *dentro* de um
  contêiner com borda, no lugar de duas flutuando soltas ao lado do texto.
- **O `+` mudou de lugar.** Saiu do FAB circular flutuante (que só o Estoque
  ainda usa) e virou um squircle (`.agenda-add-btn`, 42px, `border-radius:
  13px`) dentro do `.day-nav`, ao lado da pílula do mês — `abaComFab`
  (a variável que decidia quem via o FAB) foi removida, o FAB fixo agora só
  aparece pra `state.tab === 'estoque'`.
- **"Hoje" trocou de linguagem visual**: era preenchido em accent-100/700
  (parecia ação de destaque); virou contorno neutro (`--color-surface` +
  borda `--color-divider`, texto `--color-text`) — bate com a referência e
  deixa mais claro que "Hoje" é navegação, não um CTA.
- **Hora com `:00`**: `${h}h` virou `${String(h).padStart(2,'0')}:00`.
- **Janela ampliada, 5h–21h** (`AGENDA_START_HOUR`/`AGENDA_END_HOUR`, eram
  8/19) — só afeta o que a grade *desenha*; `OPEN_HOUR`/`CLOSE_HOUR` (9h–18h,
  o expediente de verdade) continuam intocados, então nada em ocupação ou
  horário oferecido muda. `HOUR_HEIGHT` desceu de 68 pra 56 (meio-termo:
  mais compacto que antes, mais respirado que a referência) porque a janela
  mais que dobrou de tamanho.
- **Linha do horário atual desalinhada da hora — bug real, confirmado
  medindo.** Injetei uma linha simulada exatamente nas 9h e comparei o
  centro do selo contra o topo do `.hour-row` das 9h: **9,6px de
  diferença**. Causa: `.current-time-line` usa `top` como topo da caixa, mas
  a caixa cresce pra baixo a partir dali (a altura vem do badge, o filho
  mais alto) — então o centro visual ficava abaixo do instante real, não em
  cima dele. `.hour-label` não tem esse problema porque foi ajustada à mão
  com `top:-8px`. Corrigido com `transform: translateY(-50%)` no
  `.current-time-line` — centraliza a caixa exatamente no ponto de `top`,
  qualquer que seja a altura do conteúdo. Confirmado depois: 0px de diferença.
- **Ícones na barra inferior** (`nav button`): cada aba ganhou um SVG de
  traço (`stroke="currentColor"`, sem preenchimento) empilhado sobre o rótulo
  — herda a cor do botão sozinho, não precisou de JS novo pro estado
  ativo/inativo. Isso engordou a barra de ~57px pra ~77px de altura; sem
  ajustar mais nada, o "Hoje"/`+` ficariam a 7px dela (era ~24-27px). Achei
  medindo — `bottom` dos dois foi de 84px pra 100px, e `body`'s
  `padding-bottom` (que evita o fim do conteúdo ficar atrás do rodapé fixo)
  também foi de 84 pra 100.

**Não reproduzido (06/08/2026):** a nota abaixo (achado de 02/08, nunca
investigado a fundo) descrevia 2 erros no console do `painel_demo.html` já ao
carregar. Testado de novo agora — carga inicial, as 6 abas, wizard completo de
novo agendamento, em aba nova sem cache — zero erro reproduzido. A nota
original nunca capturou mensagem nem stack, só "existe". Entre 02/08 e hoje o
arquivo passou por várias reescritas (wizard, header da agenda, profissional
inativa) que podem ter corrigido isso como efeito colateral. Fica registrado
como não confirmado, não como baseline aceita — se reaparecer, precisa de
mensagem/stack pra virar achado de verdade.

## Convenções

- Comentários em português, explicando **por que**, não o que.
- Escrita autenticada precisa de `.select()` no fim: com a sessão expirada a RLS
  deixa o `update` passar sem tocar em linha nenhuma, e a tela mentiria.
- Tema claro. O tema escuro foi recusado pela cliente — não reintroduzir.
- Bloco da agenda é `<div class="timeline-appt">` com `position:absolute`; o
  recuo da sobreposição vai em `left`/`width` inline, por isso o `right` do CSS
  é neutralizado com `right:auto`.
- `painel_demo.html` é espelho do `painel.html`: **toda mudança de tela precisa
  entrar nos dois**. O que difere é só o stub de `window.supabase` no topo do
  demo (leitura vem de `mockData(table)`, escrita devolve sucesso sem persistir).

## Segurança de objetos novos no Supabase (09/08/2026)

Convenção **para alterações novas** — não é pedido de refactor do que já existe.
Nasceu da fundação da Booking V2: dois furos passaram pela revisão estática e só
apareceram quando a superfície real foi testada pelo PostgREST com a chave anônima.

- **RLS não substitui privilege.** São camadas diferentes. Tabela com RLS ligada
  e sem policy nega toda linha, mas se o papel tem `SELECT` na tabela ela
  continua exposta na API (responde `200 []` em vez de `401`) — e no dia em que
  alguém criar uma policy permissiva, o dado passa a fluir. `appointments` dá
  `401` porque `anon` não tem grant nenhum; foi esse o alvo a imitar.
- **`REVOKE ... FROM PUBLIC` não remove os grants de `anon`/`authenticated`.**
  O Supabase concede `EXECUTE`/`SELECT` a esses papéis por *default privileges*,
  com grant próprio, que sobrevive à revogação de `PUBLIC`. Medido: mesmo depois
  de `REVOKE ... FROM PUBLIC`, `anon` executou `generate_booking_reference()`
  (HTTP 200) e `lock_staff_for_booking()` (HTTP 204, **adquiriu o lock**).
  Revogar sempre **de `anon` e `authenticated` explicitamente**.
- **Helper interno não é API.** Função criada só para ser chamada de dentro de
  outra função `SECURITY DEFINER` não deve ser executável por `anon`/`authenticated`
  — a definer roda como owner e não precisa desses grants para chamar as irmãs.
- **Tabela interna: exposição mínima.** Se só as RPCs devem tocá-la, revogar
  também de `authenticated`. Quando o painel precisar ler, entra policy + grant
  explícitos na migration correspondente, em vez de herdar privilégio default.
- **`SECURITY DEFINER` pública só quando for deliberadamente uma RPC pública**,
  e com toda validação de confiança feita dentro (preço, duração, elegibilidade,
  disponibilidade — nunca aceitos do browser).
- **Testar a superfície REAL depois da migration**, com `curl` no PostgREST e a
  chave anônima. O SQL Editor roda como owner e passa em tudo — ele não é capaz
  de revelar esta classe de problema. Vale para o caminho feliz e para o negado.

## Dívida conhecida

**Resolvido no front (06/08/2026), mas não é mais fonte única sozinha —
ver aviso abaixo.** `OPEN_HOUR`/`CLOSE_HOUR`/`SLOT_MINUTES`/`CLOSED_WEEKDAYS`
(e `SALON_TZ`, usado só pelo `agendar.html`) vivem em `shared/salon.js`
(`window.OrenziSalon`), carregado por `<script src>` antes do `<script>` inline
das três páginas e desestruturado no topo de cada uma. Antes disso cada arquivo
tinha a própria cópia com os mesmos valores — o projeto já tinha passado por
essa duplicação uma vez (o `shared/salon.js` original, mais completo, foi
removido em 02/08 por estar órfão; este é uma versão enxuta, só a config, sem
a lógica de segmentos/conflito que ele também carregava).

**⚠ Expediente duplicado de novo, agora entre JS e SQL (desde 08/08/2026).**
A migration `harden_public_appointment_insert` acrescentou `is_public_booking_window()`
como proteção server-side do INSERT anônimo em `appointments` — a RLS exige que
essa função retorne `true`. Ela tem sua **própria cópia hardcoded** do
expediente (`Europe/Dublin`, 9h–18h, fecha domingo/segunda). `shared/salon.js`
é a configuração que a **UI** usa para desenhar calendário e grade de horário;
`is_public_booking_window` é quem **decide de verdade** se o banco aceita o
INSERT. **Mudar expediente exige revisar as duas** — mudar só `shared/salon.js`
faz a UI oferecer horário que a RLS recusa (a cliente vê "não foi possível
confirmar" sem entender por quê); mudar só a função SQL faz o banco aceitar
horário que a UI nunca oferece. Isso é dívida técnica **aceita conscientemente**
enquanto o Orenzi opera como produto single-establishment — a centralização
definitiva (config lida do banco por ambos os lados) fica para quando o
produto virar multi-estabelecimento, com expedientes diferentes por salão.

A pausa voltou a valer no `agendar.html` em 02/08/2026: `loadAvailableSlots()`
usa `get_busy_slots`, que devolve só os blocos de trabalho, então o encaixe
dentro da pausa de uma coloração é oferecido de novo. Antes disso a função lia
`appointments` direto com a chave anônima — a RLS devolvia lista vazia **sem
erro** e todo horário aparecia livre. Se algum dia a leitura de horário ocupado
voltar a ser `.from('appointments')`, o bug volta junto e é silencioso.

Duplicados entre painel e demo por natureza do arquivo, e entre as duas páginas:
`initials`, `render`, `refreshSlots` (mesmo nome, implementações legitimamente
diferentes por tela).

Todo o CSS é inline em cada HTML. Mexer no visual do estoque é editar o
`<style>` do `painel.html` **e** do `painel_demo.html`.

## Cabeçalho da Agenda — compacto, sem colapso (05/08/2026)

O cabeçalho da Agenda é **uma linha de controle + a faixa de dias**, e a
grade começa logo abaixo. `agendaHeaderHtml()` monta, `bindAgendaHeader()`
liga os eventos, os dois chamados só por `renderAgenda()`.

A linha tem: pílula do mês (`‹ Ago 2026 ›`, o rótulo abre o calendário do
mês e as setas trocam de semana), `Hoje` (`#agendaTodayBtn`) e `+`
(`#agendaAddBtn`). Mês **abreviado** de propósito — "Agosto de 2026" não
cabe na mesma linha em 320px junto com os dois botões.

**Não existe estado expandido/colapsado.** Houve uma tentativa (03–05/08)
de cabeçalho que encolhia ao rolar; foi removida por inteiro a pedido do
Raphael — o que ele queria era um cabeçalho já compacto o tempo todo, não
um que muda de tamanho. Se aparecer a ideia de "colapsar ao rolar" de
novo, ela **já foi tentada e descartada**, não é terreno novo. Junto com
ela saíram: `state.agendaHeaderCollapsed`, `setAgendaHeaderCollapsed()`,
`attachAgendaHeaderCollapse()`, `agendaScrollBaseline`, `stepAgendaDay()`,
o `body.tab-agenda { overflow:hidden }` e o painel de debug de scroll.

Também saíram nessa limpeza:

- **`.agenda-date-title`** (o "Quarta-feira, 5 de agosto de 2026" entre a
  faixa e a grade) — era o maior gasto de espaço vertical da tela, e a
  faixa de dias já diz que dia está selecionado. `updateAgendaDateTitle()`
  não existe mais.
- **`.fab-today`** (o "Hoje" flutuante no canto inferior esquerdo) — virou
  a pílula inline na linha de controle. O `.fab` circular continua, só pro
  Estoque e Clientes.

Medido no navegador depois da mudança: a grade começa a **~21% da altura
da tela** (era ~39%). Em 430px, 19%.

## Appointment Detail Audit — PENDING

Achado em 10/08/2026 ao testar o cenário de encaixe no `painel_demo.html`: a
tela de detalhe do atendimento (`renderApptDetail()`) é visualmente fraca
perto do resto do app e aparentemente não mostra informação suficiente da
cliente — abre direto num formulário de "Atendimento" (data, serviço, fotos,
técnica, produto, fórmula, observações), sem nome da cliente, sem contato,
sem contexto.

**Isto é uma lista de auditoria, não uma especificação congelada.** O objetivo
agora é só não deixar esse trabalho ser esquecido — o escopo real se decide
quando a frente for aberta.

Auditar futuramente:

- identidade da cliente;
- telefone;
- email;
- notas;
- serviços;
- profissional;
- horário;
- duração;
- preço;
- origem/source;
- status;
- histórico relevante;
- ações disponíveis;
- hierarquia visual;
- UX/UI geral.
