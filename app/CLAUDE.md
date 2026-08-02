# Orenzi Atelier — salão da Juliane (Dublin)

Três páginas HTML estáticas, sem build, sem framework, sem npm. Cada arquivo carrega
o Supabase por CDN e tem todo o CSS e JS inline. Abrir com um servidor estático
qualquer (`npx serve .`) — não existe passo de compilação.

## Mapa dos arquivos

| Arquivo | Linhas | O que é |
|---|---|---|
| `index.html` | ~1370 | Landing pública: hero em vídeo, galeria, antes/depois, PT/EN |
| `agendar.html` | ~1060 | Agendamento pela cliente, 4 passos (serviço → profissional → data/hora → dados) |
| `painel.html` | ~1415 | Painel da Juliane: config, dados, tela inicial, clientes, login, `render()` |
| `shared/salon.js` | 166 | **A regra do salão.** Usada pelas duas páginas |
| `modules/agenda.js` | 344 | Timeline, tira da semana, calendário do mês, slide entre dias |
| `modules/novo-agendamento.js` | 382 | Modal do botão +, grade de horários, `closeModal()` |
| `modules/estoque.js` | 188 | Aba Estoque e o modal de produto |
| `modules/questionario.js` | 182 | Questionário em modo quiosque |
| `manifest.json` | — | PWA (nome, ícones, cor) |
| `assets/` | — | Fotos e vídeos da landing |

**Vá direto ao arquivo do assunto.** Mexer na agenda é abrir `modules/agenda.js`
(344 linhas), não varrer o painel inteiro.

Todos os módulos são **scripts clássicos**, carregados antes do `<script>` inline
do painel. Não são módulos ES: o painel guarda o resto do JS num bloco inline e
`type="module"` mudaria o escopo dele inteiro. Na prática isso significa:

- funções de módulo enxergam `state`, `sb`, `app`, `render`, `showToast` na hora
  da chamada — o inline já rodou;
- **nada de `getElementById` no topo de um módulo**: eles rodam antes do DOM. Por
  isso `const modalContainer` continua no `painel.html`;
- nome declarado duas vezes derruba a página inteira. Ao mover código, apague a
  versão antiga.

## Âncoras do que sobrou em `painel.html`

Comentários `// ── SEÇÃO ──` marcam os blocos. As linhas saem do lugar a cada
edição — confirme com `grep -n "^// ──" painel.html` antes de confiar.

| Assunto | Onde procurar |
|---|---|
| Supabase URL/key, `state` global | `// ── CONFIGURAÇÃO` |
| Cor por serviço (hash → tom HSL) | `// ── COR POR SERVIÇO`, `montarCoresServico()` |
| Leitura do banco | `// ── CARREGAMENTO DE DADOS`, `loadAll()` |
| Relógio de 12h do painel | `// ── RELÓGIO DO SALÃO`, `fmtTime()`, `fmtHora12()` |
| Tela inicial, KPIs, ocupação | `renderHome()` |
| Clientes, fotos, detalhe | `renderClients()`, `renderClientDetail()`, `renderApptDetail()` |
| Login | `// ── AUTENTICAÇÃO` |
| Qual tela aparece | `render()` |

## Banco (Supabase, projeto `gsagtsxkhqlpxuvrijgw`)

Tabelas: `appointments`, `clients`, `staff`, `services`, `salon_settings`,
`products`, `client_photos`, `appointment_photos`, `client_questionnaires`.

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

**Conflito** só existe quando um *bloco de trabalho* encosta em outro. Pausa
sobreposta a pausa, ou trabalho dentro de pausa alheia, é permitido.

**Fuso.** O expediente é `Europe/Dublin`, não o do aparelho. `salonTimeToInstant()`
converte "data + minutos do dia" no instante absoluto e cobre o horário de verão.
Expediente 9h–18h, o atendimento tem que **terminar** até as 18h; fecha domingo.

**Só a Juliane atende.** Outras profissionais existem com `active = false` e são
mantidas por causa do histórico. Onde há uma só ativa, a escolha de profissional
some da interface.

## Convenções

- Comentários em português, explicando **por que**, não o que.
- Painel em relógio de 12h (`fmtTime`, `fmtHoraCheia`); `agendar.html` ainda em 24h.
- Escrita autenticada precisa de `.select()` no fim: com a sessão expirada a RLS
  deixa o `update` passar sem tocar em linha nenhuma, e a tela mentiria.
- Tema claro. O tema escuro foi recusado pela cliente — não reintroduzir.
- Bloco da agenda é `<button>`: precisa de `display:flex; justify-content:flex-start`,
  senão o navegador centraliza o texto verticalmente e ele some atrás da pausa.

## `shared/salon.js` — a regra mora aqui

Expediente, fuso, segmentos e conflito ficam em `shared/salon.js`, carregado pelas
duas páginas **antes** do `<script>` inline. É script clássico com namespace
(`window.OrenziSalon`), não módulo ES: as páginas guardam todo o JS num bloco
inline e `type="module"` mudaria o escopo do arquivo inteiro.

Exporta: `SALON_TZ`, `OPEN_HOUR`, `CLOSE_HOUR`, `SLOT_MINUTES`, `CLOSED_WEEKDAYS`,
`salonTimeToInstant`, `salonToday`, `salonClock24`/`salonClock12`, `segmentsOf`,
`workBlocks`, `totalMinutes`, `semCadeiraLivre`, `slotStatus`, `fetchOccupancy`,
`fetchChairs`.

**Mudou expediente, pausa, cadeiras ou conflito? Mexe só aqui.** Antes isso estava
escrito duas vezes e já tinha divergido.

As duas telas usam `salonClock12` ("4:00 pm"). `salonClock24` continua exportado,
sem uso hoje.

## Dívida conhecida

Ainda duplicados entre as duas páginas, mas sem risco de overbooking:
`initials`, `prefersReducedMotion`, `render` e `refreshSlots` (mesmo nome,
implementações legitimamente diferentes por tela).

`painel.html` ainda carrega clientes + fotos + detalhe do agendamento (~370
linhas) — é o último bloco grande que daria um módulo próprio.

Todo o CSS continua inline em cada HTML, inclusive o das telas que já viraram
módulo. Mexer no visual do estoque é editar o `<style>` do `painel.html`, não o
`modules/estoque.js`.

## Grafo do projeto

Existe um grafo navegável em `C:\Users\schul\test\graphify-out\` (`graph.html`
interativo, `graph.json` para consulta). Para responder "o que chama o quê", use
`graphify query "<pergunta>"` a partir daquela pasta em vez de varrer os arquivos.
