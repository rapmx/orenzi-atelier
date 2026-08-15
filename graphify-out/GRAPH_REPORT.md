# Graph Report - PROJECT ORENZI  (2026-08-15)

## Corpus Check
- 32 files · ~193,981 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 754 nodes · 1957 edges · 29 communities (24 shown, 5 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 52 edges (avg confidence: 0.52)
- Token cost: 70,960 input · 3,496 output

## Community Hubs (Navigation)
- Booking Acquisition Flow
- Community 1
- Community 2
- Booking Management
- Client and Hair Profiles
- Community 5
- Stripe and Email Integration
- Client Quiz and Matching
- Community 8
- Community 9
- Booking Wizard UI
- Landing Page Navigation
- Daily Appointment Summary
- UI Components and Dialogs
- Community 14
- Community 15
- Project Documentation and Assets
- Community 17
- PWA Web Manifest
- Community 19
- Availability and Capacity Integration
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

## Communities (29 total, 5 thin omitted)

### Community 0 - "Booking Acquisition Flow"
Cohesion: 0.05
Nodes (110): accentForCategory(), ACQUISITION_SOURCES, addDaysIso(), anySelectedPriceVaries(), availabilityKey(), bindCalendar(), bindProcessing(), bindStepData() (+102 more)

### Community 1 - "Community 1"
Cohesion: 0.05
Nodes (75): abrirCliente(), ajustarQuantidade(), alternarFavorito(), aplicarFiltroEstoque(), attachTimelineScrollbarFade(), bindClientsToolbar(), bindQtyHold(), bindStockCards() (+67 more)

### Community 2 - "Community 2"
Cohesion: 0.06
Nodes (59): loadPolicy(), loadServices(), loadStaffCatalog(), loadStaffForService(), apptPhotoSectionHtml(), loadAll(), loadAppointments(), loadBookingVisits() (+51 more)

### Community 3 - "Booking Management"
Cohesion: 0.09
Nodes (64): addDaysIso(), availabilityKey(), bindCalendar(), bindManage(), bindReschedulePicker(), bindRescheduleReview(), buildAvailability(), closeCalendar() (+56 more)

### Community 4 - "Client and Hair Profiles"
Cohesion: 0.04
Nodes (54): animateCounters(), app, CATEGORY_COLOR_FALLBACK, CATEGORY_COLORS, CLIENT_FILTERS, CLIENT_SORTS, consumoDiario(), DIAS_SEMANA (+46 more)

### Community 5 - "Community 5"
Cohesion: 0.06
Nodes (60): animateFills(), appointmentRevenue(), formatCurrency(), insAnimateChart(), insApptMinutes(), insApptsBetween(), insBindHelp(), insBindPeriod() (+52 more)

### Community 6 - "Stripe and Email Integration"
Cohesion: 0.06
Nodes (37): public.booking_operation_requests, admin, CORS_HEADERS, RESEND_API_KEY, sha256Hex(), STRIPE_SECRET_KEY, admin, buildCreatedEmail() (+29 more)

### Community 7 - "Client Quiz and Matching"
Cohesion: 0.14
Nodes (34): emptyStateHtml(), esc(), qt(), qtr(), quizAnswerLabel(), quizBack(), quizBindClientRows(), quizBindShell() (+26 more)

### Community 8 - "Community 8"
Cohesion: 0.11
Nodes (30): addDaysTo(), agendaHeaderHtml(), agendaMonthLabel(), agendaPageEl(), bindAgendaHeader(), bindAgendaPager(), bindWeekDayButtons(), goToToday() (+22 more)

### Community 9 - "Community 9"
Cohesion: 0.17
Nodes (20): bindBlockDynamicFields(), blockCtaLabel(), blockDynamicFieldsHtml(), closeFullSheet(), dateInputValue(), fullSheetEl(), fullSheetIsOpen(), fullSheetNavigate() (+12 more)

### Community 10 - "Booking Wizard UI"
Cohesion: 0.14
Nodes (20): paintWizardShell(), paintWizStep(), updateWizChrome(), wizBindQuickAddClient(), wizBindStepClient(), wizBindStepConfirm(), wizCanGoBack(), wizContextBannerHtml() (+12 more)

### Community 11 - "Landing Page Navigation"
Cohesion: 0.14
Nodes (10): header, navLinks, navToggle, observer, paint(), realIndex(), restart(), settle() (+2 more)

### Community 12 - "Daily Appointment Summary"
Cohesion: 0.18
Nodes (18): appointmentsOnDate(), bestDayForEncaixe(), dayAggregate(), dayPanoramaCardHtml(), distributionBarsHtml(), formatDurationShort(), isSalonOpenDay(), nextAvailableSlot() (+10 more)

### Community 13 - "UI Components and Dialogs"
Cohesion: 0.19
Nodes (12): closeConfirmDialog(), onEnd(), remove(), confirmDialog(), escapeHtml(), focusableChildren(), prefersReducedMotion(), resetButton() (+4 more)

### Community 14 - "Community 14"
Cohesion: 0.15
Nodes (17): busyBlocksForStaffOnDate(), computeAvailableSlots(), dayAvailabilityLevel(), scheduleBlockOverlapsDay(), scheduleBlocksForDay(), segmentsOf(), wizBindStepDate(), wizBindStepTime() (+9 more)

### Community 15 - "Community 15"
Cohesion: 0.18
Nodes (17): checkSession(), confirmarSessaoExpirada(), encerrarSessaoUI(), loginErro(), loginLimparErro(), markReady(), renderLogin(), setAuthedChrome() (+9 more)

### Community 16 - "Project Documentation and Assets"
Cohesion: 0.15
Nodes (16): Booking Page, Orenzi Logo Icon, App Technical Documentation, Favicon 32px, Management Page, Landing Page, Admin Panel, Appointments Table (+8 more)

### Community 17 - "Community 17"
Cohesion: 0.18
Nodes (15): agendaOffsetMinutes(), apptCard(), apptTimeRange(), buildAgendaGrid(), colorForId(), computeRelevantScrollTop(), currentTimeInfo(), durationLabel() (+7 more)

### Community 18 - "PWA Web Manifest"
Cohesion: 0.25
Nodes (7): background_color, display, icons, name, short_name, start_url, theme_color

### Community 19 - "Community 19"
Cohesion: 0.29
Nodes (7): colorForService(), iconForService(), wizBindStepService(), wizFilteredServices(), wizRenderServiceList(), wizServiceRowHtml(), wizServicesUsageOrder()

### Community 20 - "Availability and Capacity Integration"
Cohesion: 0.57
Nodes (6): public.get_busy_slots(), public.get_chair_load(), public.staff_work_blocks(), appointments, schedule_blocks, services

## Knowledge Gaps
- **100 isolated node(s):** `name`, `short_name`, `start_url`, `display`, `background_color` (+95 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `renderApptDetail()` connect `Community 2` to `Community 1`, `Client and Hair Profiles`, `Community 17`?**
  _High betweenness centrality (0.110) - this node is a cross-community bridge._
- **Why does `wizSaveAppointment()` connect `Community 2` to `Community 1`, `Client and Hair Profiles`, `Community 8`, `Booking Wizard UI`, `Community 14`?**
  _High betweenness centrality (0.108) - this node is a cross-community bridge._
- **Why does `loadBooking()` connect `Booking Management` to `Community 2`?**
  _High betweenness centrality (0.097) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `renderCTA()` (e.g. with `confirmPayment()` and `closePolicy()`) actually correct?**
  _`renderCTA()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `name`, `short_name`, `start_url` to the rest of the system?**
  _100 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Booking Acquisition Flow` be split into smaller, more focused modules?**
  _Cohesion score 0.053563111318118306 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.05160662122687439 - nodes in this community are weakly interconnected._