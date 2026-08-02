# Graph Report - C:\Users\schul\Desktop\PROJECT ORENZI\app  (2026-08-02)

## Corpus Check
- 11 files · ~210,421 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 258 nodes · 460 edges · 19 communities (16 shown, 3 thin omitted)
- Extraction: 82% EXTRACTED · 17% INFERRED · 1% AMBIGUOUS · INFERRED: 76 edges (avg confidence: 0.89)
- Token cost: 315,897 input · 0 output

## Community Hubs (Navigation)
- Wizard de agendamento publico
- Painel: clientes, fotos e convencoes
- Indicadores e ocupacao das cadeiras
- Sessao, login e carga de dados
- Grafico de tendencia e animacoes
- Regras do salao (CLAUDE.md)
- Landing, conversao e demo
- Modulo: novo agendamento
- shared/salon.js - fuso e expediente
- Modulo: agenda
- Manifesto PWA
- Modulo: estoque
- Modulo: questionario
- Galeria editorial e reveal
- Idiomas e vitrine de servicos
- Upload e compressao de fotos
- Hero: crossfade e parallax
- Marquee de marcas
- Container do app

## God Nodes (most connected - your core abstractions)
1. `renderInsights` - 23 edges
2. `renderHome` - 21 edges
3. `render (roteador de telas)` - 21 edges
4. `renderClientDetail` - 17 edges
5. `renderApptDetail` - 14 edges
6. `computeIndicatorsData` - 13 edges
7. `render (roteador de telas do wizard)` - 12 edges
8. `loadAll` - 11 edges
9. `Âncoras de seção em painel.html` - 11 edges
10. `render (roteador de abas do painel)` - 11 edges

## Surprising Connections (you probably didn't know these)
- `renderHome (dashboard executivo)` --semantically_similar_to--> `renderHome`  [INFERRED] [semantically similar]
  painel_demo.html → painel.html
- `renderApptDetail` --semantically_similar_to--> `renderApptDetail`  [INFERRED] [semantically similar]
  painel_demo.html → painel.html
- `loadAppointments` --semantically_similar_to--> `loadAppointments`  [INFERRED] [semantically similar]
  painel_demo.html → painel.html
- `loadAll (carrega tudo em paralelo)` --semantically_similar_to--> `loadAll`  [INFERRED] [semantically similar]
  painel_demo.html → painel.html
- `shared/salon.js — a regra do salão` --semantically_similar_to--> `CLOSED_WEEKDAYS (cópia local do painel)`  [INFERRED] [semantically similar]
  CLAUDE.md → painel.html

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Gráfico de evolução persistente 6 ⇄ 12 meses** — painel_rendertrendchartsection, painel_buildtrendchartmarkup, painel_settletrendpath, painel_animatetrendtransition, painel_trendposfor, painel_trendxat, painel_trendyat, painel_easeinoutcubic [EXTRACTED 1.00]
- **Fluxo de autenticação e boot do painel** — painel_checksession, painel_renderlogin, painel_loadall, painel_render, painel_sb [EXTRACTED 1.00]
- **Pipeline de fotos (compressão, upload, storage, lightbox)** — painel_compressimage, painel_uploadclientphoto, painel_uploadapptphoto, painel_loadclientphotos, painel_loadapptphotos, painel_deleteclientphoto, painel_deleteapptphoto, painel_openlightbox [EXTRACTED 1.00]
- **Fluxo de agendamento em 4 passos (serviço → profissional → data/hora → dados)** — agendar_state, agendar_setstep, agendar_render, agendar_renderstep3, agendar_refreshslots, agendar_confirmbooking [EXTRACTED 1.00]
- **Funil de conversão: visita à tela de agendar → agendamento online → métrica no painel** — agendar_logbookingvisit, agendar_confirmbooking, painel_demo_loadbookingvisits, painel_demo_bookingconversionthismonth [INFERRED 0.95]
- **Camada de dados falsa do demo (substitui o Supabase real sem tocar no código do painel)** — painel_demo_mockdata, painel_demo_supabase_stub, painel_demo_loadall, painel_demo_checksession, painel_demo_realtime_appointments [EXTRACTED 1.00]

## Communities (19 total, 3 thin omitted)

### Community 0 - "Wizard de agendamento publico"
Cohesion: 0.07
Nodes (39): advanceFromStep1, buildCalendarGrid, confirmBooking (cria cliente + agendamento), RPC find_or_create_client (tabela clients não é legível publicamente), formatMoney (€), formatPrice (preço com asterisco quando varia), groupByCategory (agrupa serviços), initials (iniciais do nome) (+31 more)

### Community 1 - "Painel: clientes, fotos e convencoes"
Cohesion: 0.12
Nodes (38): Âncoras de seção em painel.html, Dívida conhecida (duplicações e CSS inline), Escrita autenticada precisa de .select(), Painel em relógio de 12h, Só a Juliane atende, apptPhotoSectionHtml, clientStats, colorForId (+30 more)

### Community 2 - "Indicadores e ocupacao das cadeiras"
Cohesion: 0.09
Nodes (35): RPC get_busy_slots (SECURITY DEFINER), RPC get_chair_load (ocupação das cadeiras), AGENDA_END_HOUR, animateFills, appointmentRevenue, appointmentsOnDate, bestDayForEncaixe, computeIndicatorsData (+27 more)

### Community 3 - "Sessao, login e carga de dados"
Cohesion: 0.13
Nodes (22): Banco Supabase (projeto gsagtsxkhqlpxuvrijgw), Trigger trg_notify_new_appointment, checkSession, closeModal, checkSession (sessão sempre válida no demo), renderLogin, INDICATOR_HELP, loadAll (+14 more)

### Community 4 - "Grafico de tendencia e animacoes"
Cohesion: 0.17
Nodes (20): animateCounters (sem uso hoje), animateIndicatorValue, animateTrendTransition, buildTrendChartMarkup, deltaInfo, distributionBarsHtml, easeInOutCubic, formatCurrency (+12 more)

### Community 5 - "Regras do salao (CLAUDE.md)"
Cohesion: 0.15
Nodes (17): Bloco da agenda é <button>, Fuso Europe/Dublin e expediente 9h–18h, Grafo do projeto (graphify-out), Modelo de segmentos (trabalho → pausa → finalização), Orenzi Atelier — salão da Juliane (Dublin), Regra de conflito (só bloco de trabalho conflita), Módulos como scripts clássicos (não ES modules), shared/salon.js — a regra do salão (+9 more)

### Community 6 - "Landing, conversao e demo"
Cohesion: 0.15
Nodes (15): Wizard de agendamento em 4 passos, logBookingVisit (contador de visitas, falha em silêncio), CTAs de agendamento do site (links para agendar.html), Tokens visuais Orenzi (paleta papel/tinta + Poppins/Jost), bookingConversionThisMonth, bookingConversionThisMonth (visitas → agendamentos online), loadBookingVisits, mockData (dados de exemplo por tabela) (+7 more)

### Community 7 - "Modulo: novo agendamento"
Cohesion: 0.38
Nodes (12): carregarSlots(), closeModal(), duracaoTotal(), fmtDuracao(), mostrarErro(), novoRascunho(), openNewApptModal(), profissionaisAtivos() (+4 more)

### Community 8 - "shared/salon.js - fuso e expediente"
Cohesion: 0.21
Nodes (6): fetchOccupancy(), salonOffsetMinutes(), salonTimeToInstant(), semCadeiraLivre(), slotStatus(), workBlocks()

### Community 9 - "Modulo: agenda"
Cohesion: 0.33
Nodes (9): irParaDia(), layoutAppts(), openMonthCalendar(), prefersReducedMotion(), renderAgenda(), sameDay(), segmentsOf(), startOfWeek() (+1 more)

### Community 10 - "Manifesto PWA"
Cohesion: 0.25
Nodes (7): background_color, display, icons, name, short_name, start_url, theme_color

### Community 11 - "Modulo: estoque"
Cohesion: 0.46
Nodes (7): ajustarQuantidade(), fmtQtd(), loadProducts(), openProductModal(), precisaRepor(), renderStock(), UNIDADES

### Community 12 - "Modulo: questionario"
Cohesion: 0.73
Nodes (5): quizTransitionTo(), renderQuestionario(), renderQuizMessage(), renderQuizQuestion(), setKioskMode()

### Community 13 - "Galeria editorial e reveal"
Cohesion: 0.67
Nodes (3): Galeria editorial (vídeos + parallax de letras), openVideoLightbox, Reveal on scroll via IntersectionObserver

### Community 14 - "Idiomas e vitrine de servicos"
Cohesion: 0.67
Nodes (3): Vitrine de serviços (acordeão + imagem sincronizada), setLang (troca PT/EN), translations (dicionário i18n PT/EN)

### Community 15 - "Upload e compressao de fotos"
Cohesion: 1.00
Nodes (3): compressImage (max 1600px, JPEG 82%), uploadApptPhoto, uploadClientPhoto

## Ambiguous Edges - Review These
- `fmtTime` → `Painel em relógio de 12h`  [AMBIGUOUS]
  CLAUDE.md · relation: rationale_for
- `colorForId` → `Âncoras de seção em painel.html`  [AMBIGUOUS]
  CLAUDE.md · relation: references
- `AGENDA_START_HOUR` → `Fuso Europe/Dublin e expediente 9h–18h`  [AMBIGUOUS]
  CLAUDE.md · relation: conceptually_related_to
- `sameDay` → `Fuso Europe/Dublin e expediente 9h–18h`  [AMBIGUOUS]
  CLAUDE.md · relation: conceptually_related_to
- `renderAgenda` → `Bloco da agenda é <button>`  [AMBIGUOUS]
  CLAUDE.md · relation: rationale_for

## Knowledge Gaps
- **50 isolated node(s):** `name`, `short_name`, `start_url`, `display`, `background_color` (+45 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `fmtTime` and `Painel em relógio de 12h`?**
  _Edge tagged AMBIGUOUS (relation: rationale_for) - confidence is low._
- **What is the exact relationship between `colorForId` and `Âncoras de seção em painel.html`?**
  _Edge tagged AMBIGUOUS (relation: references) - confidence is low._
- **What is the exact relationship between `AGENDA_START_HOUR` and `Fuso Europe/Dublin e expediente 9h–18h`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `sameDay` and `Fuso Europe/Dublin e expediente 9h–18h`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `renderAgenda` and `Bloco da agenda é <button>`?**
  _Edge tagged AMBIGUOUS (relation: rationale_for) - confidence is low._
- **Why does `render (roteador de telas)` connect `Painel: clientes, fotos e convencoes` to `Indicadores e ocupacao das cadeiras`, `Sessao, login e carga de dados`, `Grafico de tendencia e animacoes`, `Regras do salao (CLAUDE.md)`, `Landing, conversao e demo`?**
  _High betweenness centrality (0.192) - this node is a cross-community bridge._
- **Why does `renderInsights` connect `Grafico de tendencia e animacoes` to `Painel: clientes, fotos e convencoes`, `Indicadores e ocupacao das cadeiras`, `Sessao, login e carga de dados`, `Regras do salao (CLAUDE.md)`, `Landing, conversao e demo`?**
  _High betweenness centrality (0.155) - this node is a cross-community bridge._