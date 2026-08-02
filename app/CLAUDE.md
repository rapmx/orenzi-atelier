# Orenzi Atelier — salão da Juliane (Dublin)

Páginas HTML estáticas, sem build, sem framework, sem npm. Cada arquivo carrega
o Supabase por CDN e tem todo o CSS e JS inline. Abrir com um servidor estático
qualquer (`npx serve .`) — não existe passo de compilação.

## Mapa dos arquivos

| Arquivo | Linhas | O que é |
|---|---|---|
| `index.html` | ~1290 | Landing pública: hero em vídeo, galeria, antes/depois, PT/EN |
| `agendar.html` | ~740 | Agendamento pela cliente, 4 passos (serviço → profissional → data/hora → dados) |
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

A regra de conflito com pausa (`slotStatus`, que permitia encaixar dentro da
pausa de outro atendimento) existia no `shared/salon.js` e não foi resgatada —
hoje `loadAvailableSlots` trata o atendimento como um bloco cheio. Consequência
prática: um encaixe que caberia na pausa de uma coloração não é oferecido.

Duplicados entre painel e demo por natureza do arquivo, e entre as duas páginas:
`initials`, `render`, `refreshSlots` (mesmo nome, implementações legitimamente
diferentes por tela).

Todo o CSS é inline em cada HTML. Mexer no visual do estoque é editar o
`<style>` do `painel.html` **e** do `painel_demo.html`.

## Grafo do projeto

Grafo navegável em `../graphify-out/` (`graph.html` interativo, `graph.json` para
consulta), construído sobre esta pasta `app/`. Para responder "o que chama o
quê", rodar `graphify query "<pergunta>"` da raiz do projeto em vez de varrer os
arquivos. Depois de mudança grande, `/graphify app --update`.
