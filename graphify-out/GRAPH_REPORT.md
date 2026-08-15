# Graph Report - PROJECT ORENZI  (2026-08-15)

## Corpus Check
- 32 files · ~183,512 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 739 nodes · 1914 edges · 38 communities (31 shown, 7 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 49 edges (avg confidence: 0.52)
- Token cost: 70,960 input · 3,496 output

## Community Hubs (Navigation)
- Booking Acquisition Flow
- Booking Management
- Client and Hair Profiles
- Agenda and Timeline Navigation
- Client Quiz and Matching
- Stripe and Email Integration
- Revenue and Analytics Dashboard
- Booking Wizard UI
- Agenda Form Management
- Stock and UI Interactions
- Landing Page Navigation
- Daily Appointment Summary
- UI Components and Dialogs
- Staff and Catalog Loading
- Project Documentation and Assets
- Schedule and Slot Calculation
- Client Statistics and Filtering
- Core Booking Database Schema
- Booking Orchestration Logic
- Service Catalog Loading
- Stripe Webhook Processing
- Booking Policy and Consent
- Appointment Details and Photos
- PWA Web Manifest
- Service Selection Wizard
- Availability and Capacity Integration
- Staff Work Blocks
- Schedule Block Management
- Appointment Email Notifications
- Counter Animations
- User Authentication
- Design System Showcase
- Small App Icon
- Large App Icon
- Appointment Event Logging

## God Nodes (most connected - your core abstractions)
1. `renderStepBody()` - 29 edges
2. `esc()` - 29 edges
3. `renderCTA()` - 26 edges
4. `renderStepBody()` - 25 edges
5. `render()` - 24 edges
6. `renderHome()` - 20 edges
7. `insContentHtml()` - 19 edges
8. `paintWizStep()` - 19 edges
9. `esc()` - 18 edges
10. `prefersReducedMotion()` - 18 edges

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

## Communities (38 total, 7 thin omitted)

### Community 0 - "Booking Acquisition Flow"
Cohesion: 0.05
Nodes (110): accentForCategory(), ACQUISITION_SOURCES, addDaysIso(), anySelectedPriceVaries(), availabilityKey(), bindCalendar(), bindProcessing(), bindStepData() (+102 more)

### Community 1 - "Booking Management"
Cohesion: 0.09
Nodes (64): addDaysIso(), availabilityKey(), bindCalendar(), bindManage(), bindReschedulePicker(), bindRescheduleReview(), buildAvailability(), closeCalendar() (+56 more)

### Community 2 - "Client and Hair Profiles"
Cohesion: 0.04
Nodes (41): app, CATEGORY_COLOR_FALLBACK, CATEGORY_COLORS, CLIENT_FILTERS, CLIENT_SORTS, DIAS_SEMANA, HAIR_DENSITY_OPTIONS, HAIR_ELASTICITY_OPTIONS (+33 more)

### Community 3 - "Agenda and Timeline Navigation"
Cohesion: 0.10
Nodes (35): addDaysTo(), agendaHeaderHtml(), agendaMonthLabel(), agendaPageEl(), attachTimelineScrollbarFade(), bindAgendaHeader(), bindAgendaPager(), bindTimelineBlockClicks() (+27 more)

### Community 4 - "Client Quiz and Matching"
Cohesion: 0.13
Nodes (34): esc(), qt(), qtr(), quizAnswerLabel(), quizBack(), quizBindClientRows(), quizBindShell(), quizClientListHtml() (+26 more)

### Community 5 - "Stripe and Email Integration"
Cohesion: 0.10
Nodes (19): public.booking_operation_requests, admin, CORS_HEADERS, RESEND_API_KEY, sha256Hex(), STRIPE_SECRET_KEY, public._create_booking_core(), public.create_booking_hold_orchestrated() (+11 more)

### Community 6 - "Revenue and Analytics Dashboard"
Cohesion: 0.06
Nodes (59): animateFills(), appointmentRevenue(), formatCurrency(), insAnimateChart(), insApptMinutes(), insApptsBetween(), insBindHelp(), insBindPeriod() (+51 more)

### Community 7 - "Booking Wizard UI"
Cohesion: 0.11
Nodes (29): paintWizardShell(), paintWizStep(), updateWizChrome(), wizBindQuickAddClient(), wizBindStepClient(), wizBindStepConfirm(), wizBindStepDate(), wizBindStepTime() (+21 more)

### Community 8 - "Agenda Form Management"
Cohesion: 0.16
Nodes (21): bindBlockDynamicFields(), blockCtaLabel(), blockDynamicFieldsHtml(), dateInputValue(), fullSheetEl(), fullSheetIsOpen(), fullSheetNavigate(), newBlockFormState() (+13 more)

### Community 9 - "Stock and UI Interactions"
Cohesion: 0.06
Nodes (67): abrirCliente(), ajustarQuantidade(), alternarFavorito(), aplicarFiltroEstoque(), bindQtyHold(), bindStockCards(), bindStockToolbar(), bindTimelineApptClicks() (+59 more)

### Community 10 - "Landing Page Navigation"
Cohesion: 0.14
Nodes (10): header, navLinks, navToggle, observer, paint(), realIndex(), restart(), settle() (+2 more)

### Community 11 - "Daily Appointment Summary"
Cohesion: 0.18
Nodes (17): appointmentsOnDate(), bestDayForEncaixe(), dayAggregate(), dayPanoramaCardHtml(), distributionBarsHtml(), formatDurationShort(), isSalonOpenDay(), nextAvailableSlot() (+9 more)

### Community 12 - "UI Components and Dialogs"
Cohesion: 0.19
Nodes (12): closeConfirmDialog(), onEnd(), remove(), confirmDialog(), escapeHtml(), focusableChildren(), prefersReducedMotion(), resetButton() (+4 more)

### Community 13 - "Staff and Catalog Loading"
Cohesion: 0.18
Nodes (15): loadStaffCatalog(), loadStaffForService(), loadStaff(), public.staff_services, public.create_public_booking(), public.appointment_services, public.staff, public.staff_services (+7 more)

### Community 14 - "Project Documentation and Assets"
Cohesion: 0.15
Nodes (16): Booking Page, Orenzi Logo Icon, App Technical Documentation, Favicon 32px, Management Page, Landing Page, Admin Panel, Appointments Table (+8 more)

### Community 16 - "Schedule and Slot Calculation"
Cohesion: 0.14
Nodes (18): agendaOffsetMinutes(), apptTimeRange(), buildAgendaGrid(), busyBlocksForStaffOnDate(), computeAvailableSlots(), computeRelevantScrollTop(), currentTimeInfo(), dayAvailabilityLevel() (+10 more)

### Community 19 - "Client Statistics and Filtering"
Cohesion: 0.16
Nodes (17): apptCard(), bindClientsToolbar(), clearClientSearch(), clientStats(), clientStatus(), clientsWithStats(), colorForId(), daysSince() (+9 more)

### Community 21 - "Core Booking Database Schema"
Cohesion: 0.36
Nodes (9): PUBLIC, public.appointment_events, public.appointment_services, public.create_public_booking(), public.get_booking_by_token(), public.lock_staff_for_booking(), public.appointments, public.services (+1 more)

### Community 22 - "Booking Orchestration Logic"
Cohesion: 0.27
Nodes (9): public.booking_operation_requests, public.cancel_booking_by_token_orchestrated(), public._create_booking_core(), public.create_public_booking_orchestrated(), public.get_booking_by_token(), public.reschedule_booking_by_token_orchestrated(), public.appointment_events, public.appointment_services (+1 more)

### Community 23 - "Service Catalog Loading"
Cohesion: 0.53
Nodes (6): loadServices(), loadServices(), public.services, public.services, public.services, public.services

### Community 24 - "Stripe Webhook Processing"
Cohesion: 0.20
Nodes (8): admin, buildCreatedEmail(), cryptoProvider, HANDLED, money(), RESEND_API_KEY, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET

### Community 25 - "Booking Policy and Consent"
Cohesion: 0.20
Nodes (8): loadPolicy(), public.cancellation_policies, public.cancellation_policies, public.get_booking_by_token(), public.appointment_events, public.appointment_services, public.cancellation_policies, public.staff

### Community 26 - "Appointment Details and Photos"
Cohesion: 0.49
Nodes (10): apptPhotoSectionHtml(), loadAppointments(), renderApptDetail(), wizSaveAppointment(), lookupByToken(), public.appointments, public.appointments, public.appointments (+2 more)

### Community 28 - "PWA Web Manifest"
Cohesion: 0.25
Nodes (7): background_color, display, icons, name, short_name, start_url, theme_color

### Community 29 - "Service Selection Wizard"
Cohesion: 0.25
Nodes (8): colorForService(), emptyStateHtml(), iconForService(), wizBindStepService(), wizFilteredServices(), wizRenderServiceList(), wizServiceRowHtml(), wizServicesUsageOrder()

### Community 31 - "Availability and Capacity Integration"
Cohesion: 0.57
Nodes (6): public.get_busy_slots(), public.get_chair_load(), public.staff_work_blocks(), appointments, schedule_blocks, services

### Community 32 - "Staff Work Blocks"
Cohesion: 0.60
Nodes (6): public.get_busy_slots(), public.get_chair_load(), public.staff_work_blocks(), appointments, schedule_blocks, services

### Community 34 - "Schedule Block Management"
Cohesion: 0.17
Nodes (9): loadAll(), loadBookingVisits(), loadMovements(), loadProducts(), loadScheduleBlocks(), public.schedule_blocks_set_updated_at, public.schedule_blocks, public.staff (+1 more)

## Knowledge Gaps
- **99 isolated node(s):** `name`, `short_name`, `start_url`, `display`, `background_color` (+94 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `renderApptDetail()` connect `Appointment Details and Photos` to `Stock and UI Interactions`, `Client and Hair Profiles`, `Client Statistics and Filtering`, `Core Booking Database Schema`?**
  _High betweenness centrality (0.110) - this node is a cross-community bridge._
- **Why does `wizSaveAppointment()` connect `Appointment Details and Photos` to `Client and Hair Profiles`, `Agenda and Timeline Navigation`, `Schedule Block Management`, `Booking Wizard UI`, `Stock and UI Interactions`, `Core Booking Database Schema`?**
  _High betweenness centrality (0.108) - this node is a cross-community bridge._
- **Why does `loadBooking()` connect `Booking Management` to `Booking Policy and Consent`, `Core Booking Database Schema`, `Booking Orchestration Logic`?**
  _High betweenness centrality (0.098) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `renderCTA()` (e.g. with `confirmPayment()` and `closePolicy()`) actually correct?**
  _`renderCTA()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `name`, `short_name`, `start_url` to the rest of the system?**
  _99 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Booking Acquisition Flow` be split into smaller, more focused modules?**
  _Cohesion score 0.053563111318118306 - nodes in this community are weakly interconnected._
- **Should `Booking Management` be split into smaller, more focused modules?**
  _Cohesion score 0.0875 - nodes in this community are weakly interconnected._