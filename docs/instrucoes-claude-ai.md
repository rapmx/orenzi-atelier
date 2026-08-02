# Instruções para o Project "Orenzi" no claude.ai

Cole o bloco abaixo em **claude.ai → Projects → Orenzi → Set project
instructions** (o botão fica no painel direito, "Instructions").

Isso é carregado em *todo* chat novo daquele projeto, sem você precisar
explicar nada. Diferente do Claude Code, o claude.ai não enxerga o seu disco —
então aqui o contexto tem que estar escrito, não referenciado por caminho.

**Mantenha em dia:** quando uma decisão grande mudar, atualize este arquivo e
recole. Ele é o espelho do `CLAUDE.md` da raiz, para o outro ambiente.

---

## Cole a partir daqui

Trabalho no **Orenzi Atelier**, salão da Juliane em Dublin, Irlanda. Cliente
real, sistema em uso. Fale comigo em português, direto ao ponto.

O projeto é um sistema de agendamento em **HTML estático puro**: sem build, sem
framework, sem npm. Todo o CSS e JS é inline dentro de cada arquivo. O backend é
Supabase (projeto `gsagtsxkhqlpxuvrijgw`), carregado por CDN.

**Arquivos:**
- `index.html` — landing pública, PT/EN, hero em vídeo (~1.290 linhas)
- `agendar.html` — agendamento da cliente, wizard de 4 passos (~780 linhas)
- `painel.html` — painel da Juliane (~3.000 linhas): Início, Insights, Agenda,
  Clientes, Estoque, Questionário
- `painel_demo.html` — espelho do painel com dados falsos, para demonstração

**Regra crítica:** `painel_demo.html` é espelho do `painel.html`. Toda mudança
de tela precisa entrar nos dois. A única diferença é o stub de `window.supabase`
no topo do demo.

**Como me entregar código:** os arquivos são grandes. Prefiro receber o trecho
alterado com contexto suficiente para eu localizar (a função inteira, ou o bloco
com algumas linhas antes e depois), não o arquivo inteiro reescrito. Se a
mudança for grande, me diga em que função mexer antes de escrever.

**Decisões já tomadas — não reabra sem eu pedir:**
- Tema claro. O tema escuro foi recusado pela cliente.
- Expediente 9h–18h, fecha domingo e segunda.
- Sem framework, sem build, sem npm. É proposital.

**Armadilhas do projeto:**
- **Fuso horário.** O expediente é `Europe/Dublin`, não o do aparelho de quem
  agenda. Nunca monte horário com `new Date('YYYY-MM-DDT00:00:00')` — isso é
  meia-noite no fuso do celular da cliente. Existe `salonTimeToInstant(data,
  minutos)` no `agendar.html` para isso. Um celular no horário do Brasil gravava
  "9h" como 13h em Dublin, e a falha é silenciosa.
- **Escrita autenticada precisa de `.select()` no fim.** Com a sessão expirada a
  RLS deixa o `update` passar sem tocar em nenhuma linha, e a tela mentiria.
- **Expediente duplicado.** `OPEN_HOUR`/`CLOSE_HOUR`/`CLOSED_WEEKDAYS` existem em
  `agendar.html` e em `painel.html`. Mudou num, muda no outro — senão a cliente e
  o painel oferecem horários diferentes e vira overbooking.
- **Não confunda as faixas de hora do painel:** `AGENDA_START_HOUR`/
  `AGENDA_END_HOUR` (8h–19h) servem só para desenhar a timeline;
  ocupação e capacidade se medem contra `WORK_MINUTES_PER_DAY` (9h–18h).
- **Trigger de e-mail.** `trg_notify_new_appointment` dispara Resend a cada
  INSERT em `appointments`. Cuidado ao sugerir dados de teste.

**Nunca me peça, nem inclua em código, a chave da Resend ou qualquer segredo.**
A `sb_publishable_*` do Supabase é pública e pode aparecer no código.

O projeto é versionado em git (repo privado `rapmx/orenzi-atelier`). Se você me
entregar uma mudança, me lembre de commitar — já perdi trabalho por sobrescrever
arquivo entre sessões.
