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

Piloto feito: Estoque (`.list-row.stock-row`, alerta de mínimo com fundo
tingido + borda grossa + tag "Repor"). Agenda, Clientes e Questionário ainda
não entraram.

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
