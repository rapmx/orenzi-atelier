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
| Estoque | `// ── ESTOQUE`, `renderStock()`, `openProductModal()` |
| Clientes, fotos, detalhe | `renderClients()`, `renderClientDetail()`, `renderApptDetail()` |
| Login | `checkSession()`, `renderLogin()` |
| Qual tela aparece | `render()` |

Abas da nav: **Início · Insights · Agenda · Clientes · Estoque · Questionário**.
Estoque ocupou o lugar de Equipe em 02/08/2026 — com uma profissional só,
"Profissionais" era uma tela de uma linha.

## Banco (Supabase, projeto `gsagtsxkhqlpxuvrijgw`)

Tabelas: `appointments`, `clients`, `staff`, `staff_services`, `services`,
`salon_settings`, `products`, `client_photos`, `client_questionnaires`,
`booking_visits`, `lookup_attempts`.

Duas RPCs `SECURITY DEFINER` — a página da cliente usa a chave anônima e a RLS de
`appointments` só permite SELECT autenticado, então leitura direta voltava vazia e
**todo horário parecia livre**:

- `get_busy_slots(p_staff_id, p_from, p_to)` — blocos em que a profissional trabalha
- `get_chair_load(p_from, p_to)` — ocupação das cadeiras (limite em `salon_settings.chairs`)

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

Na timeline a pausa aparece como faixa listrada dentro do bloco, e o encaixe
entra por cima recuado à esquerda (`layoutAppts()` empilha por nível, estilo
calendário do iPhone). Dividir em colunas espremia os dois e escondia a pausa.

**Conflito** só existe quando um *bloco de trabalho* encosta em outro. Pausa
sobreposta a pausa, ou trabalho dentro de pausa alheia, é permitido.

**Fuso.** O expediente é `Europe/Dublin`, não o do aparelho de quem agenda.
`agendar.html` tem `salonTimeToInstant(data, minutos)` — converte "data + minutos
do dia" no instante absoluto em Dublin e cobre a virada do horário de verão com
uma segunda passada. **Nunca** construir horário de slot com
`new Date('YYYY-MM-DDT00:00:00')`: isso é meia-noite no fuso do celular da
cliente, e quem marcasse "9h" com o telefone no horário do Brasil gravava 13h em
Dublin. A falha é silenciosa — tela, e-mail e painel divergem sem erro nenhum.
`salonToday()` e `salonClock()` existem pela mesma razão.

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

Feito: Estoque (`.list-row.stock-row`, alerta de mínimo com fundo tingido +
borda grossa + tag "Repor"), Agenda (`.timeline` no padrão de cartão,
animação de toque em dia da semana/booking/botão +) e Clientes
(`.list-row.client-list-card` na lista, `.list-row.history-row` no
histórico de visitas do perfil). Questionário ainda não entrou.

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

**Achado, não investigado:** `painel_demo.html` solta 2 erros no console já
ao carregar, antes de qualquer clique. Confirmado com `git stash` que é
anterior a 02/08 — não é regressão de nenhuma mudança recente, e a tela
funciona normal apesar disso.

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

## Dívida conhecida

`agendar.html` tem a própria cópia de `OPEN_HOUR`/`CLOSE_HOUR`/`CLOSED_WEEKDAYS`.
Hoje bate com o painel, mas é a duplicação de maior risco do projeto: se um lado
mudar o expediente e o outro não, a cliente e o painel passam a oferecer horários
diferentes para o mesmo dia, e isso aparece como overbooking. **Mudou expediente?
Mudou nos dois.**

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
