# Graph Report - PROJECT ORENZI  (2026-08-17)

## Corpus Check
- 33 files · ~200,979 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 767 nodes · 2000 edges · 37 communities (32 shown, 5 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 50 edges (avg confidence: 0.52)
- Token cost: 70,960 input · 3,496 output

## Community Hubs (Navigation)
- Booking Acquisition Flow
- Community 1
- Booking Management
- Client and Hair Profiles
- Community 4
- Community 5
- Client Quiz and Matching
- Community 7
- Community 8
- Community 9
- Community 10
- Community 11
- Landing Page Navigation
- UI Components and Dialogs
- Daily Appointment Summary
- Stripe and Email Integration
- Community 16
- Project Documentation and Assets
- Community 18
- Community 19
- Community 20
- Community 21
- Community 22
- Community 23
- Community 24
- PWA Web Manifest
- Community 26
- Availability and Capacity Integration
- Community 28
- Appointment Email Notifications
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
6. `renderApptDetail()` - 22 edges
7. `renderClientDetail()` - 21 edges
8. `renderHome()` - 20 edges
9. `prefersReducedMotion()` - 19 edges
10. `insContentHtml()` - 19 edges

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

## Communities (37 total, 5 thin omitted)

### Community 0 - "Booking Acquisition Flow"
Cohesion: 0.05
Nodes (111): accentForCategory(), ACQUISITION_SOURCES, addDaysIso(), anySelectedPriceVaries(), availabilityKey(), bindCalendar(), bindProcessing(), bindStepData() (+103 more)

### Community 1 - "Community 1"
Cohesion: 0.05
Nodes (66): bindBlockDynamicFields(), blockCtaLabel(), blockDynamicFieldsHtml(), busyBlocksForStaffOnDate(), closeFullSheet(), computeAvailableSlots(), dateInputValue(), dayAvailabilityLevel() (+58 more)

### Community 2 - "Booking Management"
Cohesion: 0.09
Nodes (64): addDaysIso(), availabilityKey(), bindCalendar(), bindManage(), bindReschedulePicker(), bindRescheduleReview(), buildAvailability(), closeCalendar() (+56 more)

### Community 3 - "Client and Hair Profiles"
Cohesion: 0.04
Nodes (46): ADR-0010, animateCounters(), app, CATEGORY_COLOR_FALLBACK, CATEGORY_COLORS, CLIENT_FILTERS, CLIENT_SORTS, DIAS_SEMANA (+38 more)

### Community 4 - "Community 4"
Cohesion: 0.08
Nodes (44): addDaysTo(), agendaHeaderHtml(), agendaMonthLabel(), agendaOffsetMinutes(), agendaPageEl(), apptTimeRange(), attachTimelineScrollbarFade(), bindAgendaHeader() (+36 more)

### Community 5 - "Community 5"
Cohesion: 0.08
Nodes (45): formatCurrency(), insApptMinutes(), insApptsBetween(), insBuildAtencao(), insBuildSugestoes(), insCanais(), insCapacityMinutes(), insCardHtml() (+37 more)

### Community 6 - "Client Quiz and Matching"
Cohesion: 0.14
Nodes (34): esc(), qt(), qtr(), quizAnswerLabel(), quizBack(), quizBindClientRows(), quizBindShell(), quizClientListHtml() (+26 more)

### Community 7 - "Community 7"
Cohesion: 0.13
Nodes (26): abrirCliente(), apptPhotoSectionHtml(), clientQuizSectionHtml(), clientStats(), compressImage(), confirmDeleteScheduleBlock(), deleteApptPhoto(), deleteClientPhoto() (+18 more)

### Community 8 - "Community 8"
Cohesion: 0.17
Nodes (24): ajustarQuantidade(), alternarFavorito(), bindQtyHold(), bindStockCards(), closeModal(), confirmarSessaoExpirada(), encerrarSessaoUI(), fmtQtd() (+16 more)

### Community 9 - "Community 9"
Cohesion: 0.13
Nodes (21): animateFills(), insAnimateChart(), insBindHelp(), insBindPeriod(), insBindRail(), atualizarDots(), atualizarHint(), indiceAtual() (+13 more)

### Community 10 - "Community 10"
Cohesion: 0.15
Nodes (17): loadStaffCatalog(), loadStaffForService(), loadServices(), public.staff_services, public.create_public_booking(), public.appointment_services, public.services, public.staff (+9 more)

### Community 11 - "Community 11"
Cohesion: 0.15
Nodes (19): aplicarFiltroEstoque(), bindStockToolbar(), clearStockSearch(), consumoDiario(), diasRestantes(), estoqueAtualizadoEm(), filteredSortedProducts(), iconeDaCategoria() (+11 more)

### Community 12 - "Landing Page Navigation"
Cohesion: 0.14
Nodes (10): header, navLinks, navToggle, observer, paint(), realIndex(), restart(), settle() (+2 more)

### Community 13 - "UI Components and Dialogs"
Cohesion: 0.19
Nodes (12): closeConfirmDialog(), onEnd(), remove(), confirmDialog(), escapeHtml(), focusableChildren(), prefersReducedMotion(), resetButton() (+4 more)

### Community 14 - "Daily Appointment Summary"
Cohesion: 0.18
Nodes (17): appointmentsOnDate(), bestDayForEncaixe(), dayAggregate(), dayPanoramaCardHtml(), distributionBarsHtml(), formatDurationShort(), isSalonOpenDay(), nextAvailableSlot() (+9 more)

### Community 15 - "Stripe and Email Integration"
Cohesion: 0.15
Nodes (8): admin, CORS_HEADERS, RESEND_API_KEY, STRIPE_SECRET_KEY, public.booking_operation_requests, public.cancel_booking_by_token_orchestrated(), public.create_public_booking_orchestrated(), public.reschedule_booking_by_token_orchestrated()

### Community 16 - "Community 16"
Cohesion: 0.18
Nodes (15): public.booking_operation_requests, public._create_booking_core(), public.create_booking_hold_orchestrated(), public.deposit_for_services(), public.extend_booking_hold(), public.get_booking_state_by_request_key(), public.handle_stripe_event(), public.payments (+7 more)

### Community 17 - "Project Documentation and Assets"
Cohesion: 0.15
Nodes (16): Booking Page, Orenzi Logo Icon, App Technical Documentation, Favicon 32px, Management Page, Landing Page, Admin Panel, Appointments Table (+8 more)

### Community 18 - "Community 18"
Cohesion: 0.18
Nodes (14): apptCard(), bindClientsToolbar(), clearClientSearch(), clientStatus(), clientsWithStats(), colorForId(), daysAgoLabel(), daysSince() (+6 more)

### Community 19 - "Community 19"
Cohesion: 0.23
Nodes (14): checkSession(), loginErro(), loginLimparErro(), markReady(), renderLogin(), setAuthedChrome(), splashAgendarSaida(), splashBoot() (+6 more)

### Community 20 - "Community 20"
Cohesion: 0.15
Nodes (11): loadAll(), loadBookingVisits(), loadMovements(), loadProducts(), loadScheduleBlocks(), loadStaff(), public.schedule_blocks_set_updated_at, public.staff (+3 more)

### Community 21 - "Community 21"
Cohesion: 0.19
Nodes (12): loadPolicy(), public.cancellation_policies, public.cancellation_policies, public._create_booking_core(), public.get_booking_by_token(), public.appointment_events, public.appointment_services, public.appointments (+4 more)

### Community 22 - "Community 22"
Cohesion: 0.36
Nodes (9): PUBLIC, public.appointment_events, public.appointment_services, public.create_public_booking(), public.get_booking_by_token(), public.lock_staff_for_booking(), public.appointments, public.services (+1 more)

### Community 23 - "Community 23"
Cohesion: 0.24
Nodes (10): loadAppointments(), lookupByToken(), sha256Hex(), public.appointments, public.appointments, public.get_booking_by_token(), public.appointment_events, public.appointment_services (+2 more)

### Community 24 - "Community 24"
Cohesion: 0.20
Nodes (8): admin, buildCreatedEmail(), cryptoProvider, HANDLED, money(), RESEND_API_KEY, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET

### Community 25 - "PWA Web Manifest"
Cohesion: 0.25
Nodes (7): background_color, display, icons, name, short_name, start_url, theme_color

### Community 26 - "Community 26"
Cohesion: 0.36
Nodes (8): appointmentBookedValue(), appointmentRevenue(), apptValorSectionHtml(), insClientesAtrasadas(), insSumRevenue(), openApptValorSheet(), erro(), valorSeDefinido()

### Community 27 - "Availability and Capacity Integration"
Cohesion: 0.57
Nodes (6): public.get_busy_slots(), public.get_chair_load(), public.staff_work_blocks(), appointments, schedule_blocks, services

### Community 28 - "Community 28"
Cohesion: 0.60
Nodes (6): public.get_busy_slots(), public.get_chair_load(), public.staff_work_blocks(), appointments, schedule_blocks, services

## Knowledge Gaps
- **101 isolated node(s):** `name`, `short_name`, `start_url`, `display`, `background_color` (+96 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `renderApptDetail()` connect `Community 7` to `Client and Hair Profiles`, `Community 8`, `Community 16`, `Community 21`, `Community 22`, `Community 23`, `Community 26`?**
  _High betweenness centrality (0.116) - this node is a cross-community bridge._
- **Why does `wizSaveAppointment()` connect `Community 1` to `Client and Hair Profiles`, `Community 4`, `Community 8`, `Community 16`, `Community 20`, `Community 21`, `Community 22`, `Community 23`?**
  _High betweenness centrality (0.106) - this node is a cross-community bridge._
- **Why does `loadBooking()` connect `Booking Management` to `Community 21`, `Community 22`, `Community 23`?**
  _High betweenness centrality (0.096) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `renderCTA()` (e.g. with `confirmPayment()` and `closePolicy()`) actually correct?**
  _`renderCTA()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `name`, `short_name`, `start_url` to the rest of the system?**
  _101 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Booking Acquisition Flow` be split into smaller, more focused modules?**
  _Cohesion score 0.05339435545385202 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.05268065268065268 - nodes in this community are weakly interconnected._