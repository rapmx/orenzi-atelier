# Graph Report - PROJECT ORENZI  (2026-08-18)

## Corpus Check
- Large corpus: 165 files · ~512,265 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder.

## Summary
- 836 nodes · 2180 edges · 43 communities (38 shown, 5 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 54 edges (avg confidence: 0.52)
- Token cost: 70,960 input · 3,496 output

## Community Hubs (Navigation)
- Booking Acquisition Flow
- Booking Management
- Community 2
- Client and Hair Profiles
- Community 4
- Community 5
- Community 6
- Client Quiz and Matching
- Community 8
- Community 9
- Community 10
- Community 11
- Community 12
- Community 13
- Daily Appointment Summary
- Community 15
- Landing Page Navigation
- Community 17
- UI Components and Dialogs
- Project Documentation and Assets
- Community 20
- Community 21
- Community 22
- PWA Web Manifest
- Community 24
- Community 25
- Community 26
- Availability and Capacity Integration
- Community 28
- Appointment Email Notifications
- Design System Showcase
- Small App Icon
- Large App Icon
- Appointment Event Logging

## God Nodes (most connected - your core abstractions)
1. `esc()` - 33 edges
2. `render()` - 30 edges
3. `renderStepBody()` - 29 edges
4. `renderCTA()` - 26 edges
5. `renderStepBody()` - 25 edges
6. `prefersReducedMotion()` - 25 edges
7. `renderClientDetail()` - 22 edges
8. `renderApptDetail()` - 22 edges
9. `renderHome()` - 20 edges
10. `insContentHtml()` - 20 edges

## Surprising Connections (you probably didn't know these)
- `Orenzi Logo Icon` --conceptually_related_to--> `Admin Panel`  [INFERRED]
  app/apple-touch-icon.png → app/painel.html
- `loadBooking()` --calls_rpc--> `public.get_booking_by_token()`  [EXTRACTED]
  graphify-out/derived/gerenciar.js → supabase/migrations/20260809210514_booking_v2_core_and_selfservice_foundation.sql
- `loadPolicy()` --queries_table--> `public.cancellation_policies`  [EXTRACTED]
  graphify-out/derived/agendar.js → supabase/migrations/20260810152442_booking_v2_policy_consent_foundation.sql
- `loadBooking()` --calls_rpc--> `public.get_booking_by_token()`  [EXTRACTED]
  graphify-out/derived/gerenciar.js → supabase/migrations/20260810181447_booking_v2_edge_orchestration_foundation.sql
- `loadBooking()` --calls_rpc--> `public.get_booking_by_token()`  [EXTRACTED]
  graphify-out/derived/gerenciar.js → supabase/migrations/20260810182713_booking_v2_get_booking_by_token_staff_id.sql

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Orenzi Web Surfaces** — app_index, app_agendar, app_gerenciar, app_painel [EXTRACTED 1.00]
- **Scheduling and Management Flow** — app_agendar, app_gerenciar, app_painel [INFERRED 0.80]

## Communities (43 total, 5 thin omitted)

### Community 0 - "Booking Acquisition Flow"
Cohesion: 0.05
Nodes (110): accentForCategory(), ACQUISITION_SOURCES, addDaysIso(), anySelectedPriceVaries(), availabilityKey(), bindCalendar(), bindProcessing(), bindStepData() (+102 more)

### Community 1 - "Booking Management"
Cohesion: 0.09
Nodes (64): addDaysIso(), availabilityKey(), bindCalendar(), bindManage(), bindReschedulePicker(), bindRescheduleReview(), buildAvailability(), closeCalendar() (+56 more)

### Community 2 - "Community 2"
Cohesion: 0.07
Nodes (62): appointmentBookedValue(), appointmentRevenue(), apptValorSectionHtml(), finBuckets(), finComputePeriod(), finDistribuicao(), finHistLinha(), finServicos() (+54 more)

### Community 3 - "Client and Hair Profiles"
Cohesion: 0.04
Nodes (53): ADR-0010, animateCounters(), app, CATEGORY_COLOR_FALLBACK, CATEGORY_COLORS, CLIENT_FILTERS, CLIENT_SORTS, colorForId() (+45 more)

### Community 4 - "Community 4"
Cohesion: 0.07
Nodes (45): loadPolicy(), loadServices(), loadStaffCatalog(), loadStaffForService(), loadServices(), loadStaff(), PUBLIC, public.appointment_events (+37 more)

### Community 5 - "Community 5"
Cohesion: 0.06
Nodes (37): public.booking_operation_requests, admin, CORS_HEADERS, RESEND_API_KEY, sha256Hex(), STRIPE_SECRET_KEY, admin, buildCreatedEmail() (+29 more)

### Community 6 - "Community 6"
Cohesion: 0.08
Nodes (44): addDaysTo(), agendaHeaderHtml(), agendaMonthLabel(), agendaOffsetMinutes(), agendaPageEl(), apptTimeRange(), attachTimelineScrollbarFade(), bindAgendaHeader() (+36 more)

### Community 7 - "Client Quiz and Matching"
Cohesion: 0.12
Nodes (36): esc(), loadClientQuestionnaires(), qt(), qtr(), quizAnswerLabel(), quizBack(), quizBindClientRows(), quizBindShell() (+28 more)

### Community 8 - "Community 8"
Cohesion: 0.12
Nodes (28): abrirCliente(), aplicarNavPorPapel(), bindClientsToolbar(), canAccess(), clearClientSearch(), clientSortsDisponiveis(), clientStatus(), clientsWithStats() (+20 more)

### Community 9 - "Community 9"
Cohesion: 0.11
Nodes (25): auth.users, checkSession(), confirmarSessaoExpirada(), encerrarSessaoUI(), loginErro(), loginLimparErro(), markReady(), renderLogin() (+17 more)

### Community 10 - "Community 10"
Cohesion: 0.12
Nodes (24): animateFills(), finAnimarBarras(), finAnimateChart(), finAssinatura(), finBindHelp(), finBindHistorico(), finBindPeriod(), finIndicePadrao() (+16 more)

### Community 11 - "Community 11"
Cohesion: 0.19
Nodes (20): ajustarQuantidade(), alternarFavorito(), bindQtyHold(), bindStockCards(), closeModal(), fmtQtd(), movementsHtml(), gravar() (+12 more)

### Community 12 - "Community 12"
Cohesion: 0.13
Nodes (21): paintWizardShell(), paintWizStep(), updateWizChrome(), wizBindQuickAddClient(), wizBindStepClient(), wizBindStepConfirm(), wizBindStepTime(), wizCanGoBack() (+13 more)

### Community 13 - "Community 13"
Cohesion: 0.16
Nodes (20): aplicarFiltroEstoque(), bindStockToolbar(), clearStockSearch(), consumoDiario(), daysAgoLabel(), diasRestantes(), estoqueAtualizadoEm(), filteredSortedProducts() (+12 more)

### Community 14 - "Daily Appointment Summary"
Cohesion: 0.16
Nodes (20): appointmentsOnDate(), apptCard(), bestDayForEncaixe(), dayAggregate(), dayPanoramaCardHtml(), distributionBarsHtml(), fmtTime(), formatDurationShort() (+12 more)

### Community 15 - "Community 15"
Cohesion: 0.17
Nodes (20): bindBlockDynamicFields(), blockCtaLabel(), blockDynamicFieldsHtml(), closeFullSheet(), dateInputValue(), fullSheetEl(), fullSheetIsOpen(), fullSheetNavigate() (+12 more)

### Community 16 - "Landing Page Navigation"
Cohesion: 0.14
Nodes (10): header, navLinks, navToggle, observer, paint(), realIndex(), restart(), settle() (+2 more)

### Community 17 - "Community 17"
Cohesion: 0.16
Nodes (18): finAnalyticalHtml(), finComposicaoTexto(), finContentHtml(), finDistTitulo(), finEscalaNice(), finEvoSub(), finHistorico(), finPararRoll() (+10 more)

### Community 18 - "UI Components and Dialogs"
Cohesion: 0.19
Nodes (12): closeConfirmDialog(), onEnd(), remove(), confirmDialog(), escapeHtml(), focusableChildren(), prefersReducedMotion(), resetButton() (+4 more)

### Community 19 - "Project Documentation and Assets"
Cohesion: 0.15
Nodes (16): Booking Page, Orenzi Logo Icon, App Technical Documentation, Favicon 32px, Management Page, Landing Page, Admin Panel, Appointments Table (+8 more)

### Community 20 - "Community 20"
Cohesion: 0.17
Nodes (16): busyBlocksForStaffOnDate(), computeAvailableSlots(), dayAvailabilityLevel(), scheduleBlockOverlapsDay(), scheduleBlocksForDay(), segmentsOf(), wizBindStepDate(), wizClient() (+8 more)

### Community 21 - "Community 21"
Cohesion: 0.17
Nodes (9): loadAll(), loadBookingVisits(), loadMovements(), loadProducts(), loadScheduleBlocks(), saveScheduleBlock(), public.schedule_blocks_set_updated_at, public.schedule_blocks (+1 more)

### Community 22 - "Community 22"
Cohesion: 0.47
Nodes (11): apptPhotoSectionHtml(), loadAppointments(), renderApptDetail(), wizSaveAppointment(), lookupByToken(), public.appointments, public.appointments, public.appointments (+3 more)

### Community 23 - "PWA Web Manifest"
Cohesion: 0.25
Nodes (7): background_color, display, icons, name, short_name, start_url, theme_color

### Community 24 - "Community 24"
Cohesion: 0.25
Nodes (8): colorForService(), emptyStateHtml(), iconForService(), wizBindStepService(), wizFilteredServices(), wizRenderServiceList(), wizServiceRowHtml(), wizServicesUsageOrder()

### Community 25 - "Community 25"
Cohesion: 0.43
Nodes (6): insBindRail(), atualizarDots(), atualizarHint(), indiceAtual(), passo(), insDrill()

### Community 26 - "Community 26"
Cohesion: 0.38
Nodes (7): insShowHelp(), fechar(), onKey(), loadClients(), normalizeIePhone(), openNewClientSheet(), public.clients

### Community 27 - "Availability and Capacity Integration"
Cohesion: 0.57
Nodes (6): public.get_busy_slots(), public.get_chair_load(), public.staff_work_blocks(), appointments, schedule_blocks, services

### Community 28 - "Community 28"
Cohesion: 0.33
Nodes (6): clientQuizSectionHtml(), clientStats(), confirmDeleteScheduleBlock(), fmtDate(), openBlockDetailSheet(), wizRecentClients()

## Knowledge Gaps
- **107 isolated node(s):** `name`, `short_name`, `start_url`, `display`, `background_color` (+102 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `renderApptDetail()` connect `Community 22` to `Community 2`, `Client and Hair Profiles`, `Community 4`, `Community 8`, `Community 11`, `Daily Appointment Summary`, `Community 28`?**
  _High betweenness centrality (0.110) - this node is a cross-community bridge._
- **Why does `wizSaveAppointment()` connect `Community 22` to `Client and Hair Profiles`, `Community 4`, `Community 6`, `Community 11`, `Community 12`, `Community 20`, `Community 21`?**
  _High betweenness centrality (0.100) - this node is a cross-community bridge._
- **Why does `loadBooking()` connect `Booking Management` to `Community 4`?**
  _High betweenness centrality (0.092) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `renderCTA()` (e.g. with `confirmPayment()` and `closePolicy()`) actually correct?**
  _`renderCTA()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `name`, `short_name`, `start_url` to the rest of the system?**
  _107 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Booking Acquisition Flow` be split into smaller, more focused modules?**
  _Cohesion score 0.053563111318118306 - nodes in this community are weakly interconnected._
- **Should `Booking Management` be split into smaller, more focused modules?**
  _Cohesion score 0.0875 - nodes in this community are weakly interconnected._