# Graph Report - PROJECT ORENZI  (2026-08-15)

## Corpus Check
- 32 files · ~187,533 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 747 nodes · 1936 edges · 39 communities (32 shown, 7 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 50 edges (avg confidence: 0.52)
- Token cost: 70,960 input · 3,496 output

## Community Hubs (Navigation)
- Booking Acquisition Flow
- Booking Management
- Community 2
- Stripe and Email Integration
- Client and Hair Profiles
- Client Quiz and Matching
- Community 6
- Revenue and Analytics Dashboard
- Community 8
- Client Statistics and Filtering
- Stock and UI Interactions
- Daily Appointment Summary
- Agenda and Timeline Navigation
- Landing Page Navigation
- Booking Wizard UI
- UI Components and Dialogs
- Project Documentation and Assets
- Agenda Form Management
- Community 18
- Community 19
- Community 20
- Community 21
- Schedule and Slot Calculation
- Community 23
- Community 24
- Appointment Details and Photos
- PWA Web Manifest
- Service Selection Wizard
- Availability and Capacity Integration
- Schedule Block Management
- Appointment Email Notifications
- Counter Animations
- Design System Showcase
- Small App Icon
- Large App Icon
- Appointment Event Logging

## God Nodes (most connected - your core abstractions)
1. `renderStepBody()` - 29 edges
2. `esc()` - 29 edges
3. `renderCTA()` - 26 edges
4. `renderStepBody()` - 25 edges
5. `render()` - 25 edges
6. `renderHome()` - 20 edges
7. `prefersReducedMotion()` - 19 edges
8. `insContentHtml()` - 19 edges
9. `paintWizStep()` - 19 edges
10. `esc()` - 18 edges

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

## Communities (39 total, 7 thin omitted)

### Community 0 - "Booking Acquisition Flow"
Cohesion: 0.05
Nodes (110): accentForCategory(), ACQUISITION_SOURCES, addDaysIso(), anySelectedPriceVaries(), availabilityKey(), bindCalendar(), bindProcessing(), bindStepData() (+102 more)

### Community 1 - "Booking Management"
Cohesion: 0.09
Nodes (64): addDaysIso(), availabilityKey(), bindCalendar(), bindManage(), bindReschedulePicker(), bindRescheduleReview(), buildAvailability(), closeCalendar() (+56 more)

### Community 2 - "Community 2"
Cohesion: 0.07
Nodes (44): loadPolicy(), loadServices(), loadStaffCatalog(), loadStaffForService(), loadServices(), loadStaff(), PUBLIC, public.appointment_events (+36 more)

### Community 3 - "Stripe and Email Integration"
Cohesion: 0.06
Nodes (38): public.booking_operation_requests, public.clients, admin, CORS_HEADERS, RESEND_API_KEY, sha256Hex(), STRIPE_SECRET_KEY, admin (+30 more)

### Community 4 - "Client and Hair Profiles"
Cohesion: 0.04
Nodes (42): app, CATEGORY_COLOR_FALLBACK, CATEGORY_COLORS, CLIENT_FILTERS, CLIENT_SORTS, DIAS_SEMANA, HAIR_DENSITY_OPTIONS, HAIR_ELASTICITY_OPTIONS (+34 more)

### Community 5 - "Client Quiz and Matching"
Cohesion: 0.13
Nodes (34): esc(), qt(), qtr(), quizAnswerLabel(), quizBack(), quizBindClientRows(), quizBindShell(), quizClientListHtml() (+26 more)

### Community 6 - "Community 6"
Cohesion: 0.12
Nodes (28): bindBlockDynamicFields(), blockCtaLabel(), blockDynamicFieldsHtml(), closeFullSheet(), fullSheetEl(), fullSheetIsOpen(), fullSheetNavigate(), insAnimateChart() (+20 more)

### Community 7 - "Revenue and Analytics Dashboard"
Cohesion: 0.15
Nodes (26): appointmentRevenue(), formatCurrency(), insApptMinutes(), insBuildAtencao(), insBuildSugestoes(), insCanais(), insCardHtml(), insClientesAtrasadas() (+18 more)

### Community 8 - "Community 8"
Cohesion: 0.13
Nodes (22): insApptsBetween(), insCapacityMinutes(), insComputePeriod(), insDayFaixaMatrix(), insFaixas(), insFractalMeses(), insFractalSemanas(), insMapStep() (+14 more)

### Community 9 - "Client Statistics and Filtering"
Cohesion: 0.14
Nodes (21): bindClientsToolbar(), clearClientSearch(), clientStats(), clientStatus(), clientsWithStats(), colorForId(), daysAgoLabel(), daysSince() (+13 more)

### Community 10 - "Stock and UI Interactions"
Cohesion: 0.21
Nodes (20): ajustarQuantidade(), alternarFavorito(), aplicarFiltroEstoque(), bindQtyHold(), bindStockCards(), bindStockToolbar(), clearStockSearch(), compressImage() (+12 more)

### Community 11 - "Daily Appointment Summary"
Cohesion: 0.16
Nodes (20): animateFills(), appointmentsOnDate(), apptCard(), bestDayForEncaixe(), dayAggregate(), dayPanoramaCardHtml(), distributionBarsHtml(), fmtTime() (+12 more)

### Community 12 - "Agenda and Timeline Navigation"
Cohesion: 0.16
Nodes (19): agendaHeaderHtml(), agendaMonthLabel(), bindAgendaHeader(), bindWeekDayButtons(), goToToday(), highlightCurrentTimeLine(), openMonthCalendar(), closeCal() (+11 more)

### Community 13 - "Landing Page Navigation"
Cohesion: 0.14
Nodes (10): header, navLinks, navToggle, observer, paint(), realIndex(), restart(), settle() (+2 more)

### Community 14 - "Booking Wizard UI"
Cohesion: 0.15
Nodes (18): loadClients(), paintWizardShell(), paintWizStep(), updateWizChrome(), wizBindQuickAddClient(), wizBindStepClient(), wizBindStepConfirm(), wizCanGoBack() (+10 more)

### Community 15 - "UI Components and Dialogs"
Cohesion: 0.19
Nodes (12): closeConfirmDialog(), onEnd(), remove(), confirmDialog(), escapeHtml(), focusableChildren(), prefersReducedMotion(), resetButton() (+4 more)

### Community 16 - "Project Documentation and Assets"
Cohesion: 0.15
Nodes (16): Booking Page, Orenzi Logo Icon, App Technical Documentation, Favicon 32px, Management Page, Landing Page, Admin Panel, Appointments Table (+8 more)

### Community 17 - "Agenda Form Management"
Cohesion: 0.16
Nodes (15): dateInputValue(), newBlockFormState(), newWizState(), openNewApptModal(), openNewApptModalAt(), profissionaisAtivos(), renderWizard(), wizBindStepDate() (+7 more)

### Community 18 - "Community 18"
Cohesion: 0.22
Nodes (14): abrirCliente(), attachTimelineScrollbarFade(), bindTimelineApptClicks(), confirmDeleteScheduleBlock(), deleteApptPhoto(), deleteClientPhoto(), loadApptPhotos(), loadClientPhotos() (+6 more)

### Community 19 - "Community 19"
Cohesion: 0.20
Nodes (14): checkSession(), loadAll(), loadBookingVisits(), loadMovements(), loadProducts(), loadScheduleBlocks(), markReady(), renderLogin() (+6 more)

### Community 20 - "Community 20"
Cohesion: 0.22
Nodes (14): consumoDiario(), diasRestantes(), estoqueAtualizadoEm(), filteredSortedProducts(), movimentosDoProduto(), renderStock(), renderStockInsights(), statsHtml() (+6 more)

### Community 21 - "Community 21"
Cohesion: 0.27
Nodes (12): addDaysTo(), agendaPageEl(), bindAgendaPager(), bindTimelineBlockClicks(), pagerCancelar(), pagerCommit(), pagerGoTo(), pagerSettle() (+4 more)

### Community 22 - "Schedule and Slot Calculation"
Cohesion: 0.19
Nodes (13): busyBlocksForStaffOnDate(), computeAvailableSlots(), dayAvailabilityLevel(), scheduleBlockOverlapsDay(), scheduleBlocksForDay(), segmentsOf(), wizBindStepTime(), wizDayPreviewHtml() (+5 more)

### Community 23 - "Community 23"
Cohesion: 0.22
Nodes (11): closeModal(), insBindHelp(), insShowHelp(), fechar(), onKey(), normalizeIePhone(), openClientSortSheet(), openLightbox() (+3 more)

### Community 24 - "Community 24"
Cohesion: 0.29
Nodes (10): agendaOffsetMinutes(), apptTimeRange(), buildAgendaGrid(), computeRelevantScrollTop(), currentTimeInfo(), durationLabel(), layoutAppts(), minutesToPx() (+2 more)

### Community 25 - "Appointment Details and Photos"
Cohesion: 0.49
Nodes (10): apptPhotoSectionHtml(), loadAppointments(), renderApptDetail(), wizSaveAppointment(), lookupByToken(), public.appointments, public.appointments, public.appointments (+2 more)

### Community 26 - "PWA Web Manifest"
Cohesion: 0.25
Nodes (7): background_color, display, icons, name, short_name, start_url, theme_color

### Community 27 - "Service Selection Wizard"
Cohesion: 0.25
Nodes (8): colorForService(), emptyStateHtml(), iconForService(), wizBindStepService(), wizFilteredServices(), wizRenderServiceList(), wizServiceRowHtml(), wizServicesUsageOrder()

### Community 28 - "Availability and Capacity Integration"
Cohesion: 0.57
Nodes (6): public.get_busy_slots(), public.get_chair_load(), public.staff_work_blocks(), appointments, schedule_blocks, services

## Knowledge Gaps
- **100 isolated node(s):** `name`, `short_name`, `start_url`, `display`, `background_color` (+95 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `renderApptDetail()` connect `Appointment Details and Photos` to `Community 2`, `Client and Hair Profiles`, `Client Statistics and Filtering`, `Stock and UI Interactions`, `Daily Appointment Summary`, `Community 18`, `Community 23`?**
  _High betweenness centrality (0.110) - this node is a cross-community bridge._
- **Why does `wizSaveAppointment()` connect `Appointment Details and Photos` to `Community 2`, `Client and Hair Profiles`, `Stock and UI Interactions`, `Agenda and Timeline Navigation`, `Booking Wizard UI`, `Agenda Form Management`, `Community 19`, `Community 23`?**
  _High betweenness centrality (0.108) - this node is a cross-community bridge._
- **Why does `loadBooking()` connect `Booking Management` to `Community 2`?**
  _High betweenness centrality (0.097) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `renderCTA()` (e.g. with `confirmPayment()` and `closePolicy()`) actually correct?**
  _`renderCTA()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `name`, `short_name`, `start_url` to the rest of the system?**
  _100 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Booking Acquisition Flow` be split into smaller, more focused modules?**
  _Cohesion score 0.053563111318118306 - nodes in this community are weakly interconnected._
- **Should `Booking Management` be split into smaller, more focused modules?**
  _Cohesion score 0.0875 - nodes in this community are weakly interconnected._