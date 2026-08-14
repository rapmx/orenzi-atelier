# Orenzi Atelier — salão da Juliane (Dublin)

Páginas HTML estáticas, sem build, sem framework, sem npm. Cada arquivo carrega
o Supabase por CDN e tem todo o CSS e JS inline. Abrir com um servidor estático
qualquer (`npx serve .`) — não existe passo de compilação.

## Mapa dos arquivos

| Arquivo | Linhas | O que é |
|---|---|---|
| `index.html` | ~1290 | Landing pública: hero em vídeo, galeria, antes/depois, PT/EN |
| `agendar.html` | ~760 | Agendamento pela cliente, 3 passos (serviço → data/hora → dados) |
| `painel.html` | ~2990 | Painel da Juliane. **Tudo inline** — config, dados, todas as telas |
| `painel_demo.html` | ~3160 | Cópia do painel com stub do Supabase, pra demonstrar sem login |
| `manifest.json` | — | PWA (nome, ícones, cor) |
| `assets/` | — | Fotos e vídeos da landing |

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
| Insights, gráfico de tendência | `renderInsights()`, `computeIndicatorsData()` |
| Agenda, sobreposição, pausa | `renderAgenda()`, `layoutAppts()`, `segmentsOf()` |
| Bloqueio manual de agenda | `openAgendaAddMenu()`, `openBlockModal()`, `saveScheduleBlock()`, `openBlockDetailSheet()`, `confirmDeleteScheduleBlock()`, `busyBlocksForStaffOnDate()` |
| Folha de tela cheia (os 3 sheets da Agenda) | `.o-fullsheet` / `.o-wizard-sheet` no `<style>`, `.modal-overlay.is-fullsheet` |
| Movimento da folha (entrar/navegar/fechar) | `openFullSheet()`, `fullSheetNavigate()`, `closeFullSheet()`, `paintWizardShell()`, `updateWizChrome()`, `setBlockAllDay()` |
| Estoque | `// ── ESTOQUE`, `renderStock()`, `renderStockList()`, `renderStockInsights()`, `openProductModal()` |
| Clientes, fotos, detalhe | `renderClients()`, `renderClientDetail()`, `renderApptDetail()` |
| Login | `checkSession()`, `renderLogin()` |
| Qual tela aparece | `render()` |

Abas da nav: **Início · Insights · Agenda · Clientes · Estoque · Questionário**.
Estoque ocupou o lugar de Equipe em 02/08/2026 — com uma profissional só,
"Profissionais" era uma tela de uma linha.

## Banco (Supabase, projeto `gsagtsxkhqlpxuvrijgw`)

Tabelas: `appointments`, `schedule_blocks`, `clients`, `staff`, `staff_services`,
`services`, `salon_settings`, `products`, `product_movements`, `client_photos`,
`client_questionnaires`, `booking_visits`, `lookup_attempts`, `payments`,
`stripe_webhook_events`.

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
branco sobre a própria cor do card, com fade de 8px nas duas pontas), e o
encaixe entra por cima recuado à esquerda (`layoutAppts()` empilha por nível,
estilo calendário do iPhone). Dividir em colunas espremia os dois e escondia a
pausa. A listra diagonal saiu em 10/08/2026: rachurado lê como "área
bloqueada", e pausa é o contrário disso — é o tempo em que cabe encaixar
alguém.

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
  continua sem saber que hold existe. Só dois pontos precisam saber, e os dois
  são sobre **disponibilidade**: `busyBlocksForStaffOnDate()` (o modal de novo
  agendamento não pode oferecer horário reservado) e o "Xh livres" de
  `buildAgendaGrid()`. Hold vencido não entra nem em `state.paymentHolds` — a
  tela tem que concordar com o banco.
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
  **`quizSave()` funciona antes dela**: se o Postgres disser que a coluna
  não existe (`quizMissingColumn()`), regrava só os seis campos antigos em
  vez de mostrar erro pra cliente por uma dívida de banco.
- **Demo**: o stub tinha um bug real — `.eq().order().limit().maybeSingle()`
  estourava `TypeError` e "Infos do questionário" não fazia nada, nem
  toast. O `order` devolvido pelo `.eq()` agora respeita o filtro e carrega
  `.limit()`/`.maybeSingle()`. Camila tem questionário de exemplo (em
  inglês, com duas referências); Marina não tem, de propósito — é o estado
  vazio, que deixou de ser toast e virou tela.

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
