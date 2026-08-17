# Graph Report - PROJECT ORENZI  (2026-08-17)

## Corpus Check
- 33 files · ~198,460 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 763 nodes · 1988 edges · 38 communities (32 shown, 6 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 52 edges (avg confidence: 0.52)
- Token cost: 70,960 input · 3,496 output

## Community Hubs (Navigation)
- Booking Acquisition Flow
- Booking Management
- Community 2
- Client Quiz and Matching
- Community 4
- Client and Hair Profiles
- Community 6
- Booking Wizard UI
- Stripe and Email Integration
- Community 9
- Community 10
- Landing Page Navigation
- UI Components and Dialogs
- Community 13
- Daily Appointment Summary
- Project Documentation and Assets
- Community 16
- Community 17
- Community 18
- Community 19
- Community 20
- Community 21
- Community 22
- Community 23
- PWA Web Manifest
- Community 25
- Availability and Capacity Integration
- Community 27
- Community 28
- Appointment Email Notifications
- Community 30
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
7. `renderHome()` - 20 edges
8. `prefersReducedMotion()` - 19 edges
9. `insContentHtml()` - 19 edges
10. `renderClientDetail()` - 19 edges

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

## Communities (38 total, 6 thin omitted)

### Community 0 - "Booking Acquisition Flow"
Cohesion: 0.05
Nodes (110): accentForCategory(), ACQUISITION_SOURCES, addDaysIso(), anySelectedPriceVaries(), availabilityKey(), bindCalendar(), bindProcessing(), bindStepData() (+102 more)

### Community 1 - "Booking Management"
Cohesion: 0.09
Nodes (64): addDaysIso(), availabilityKey(), bindCalendar(), bindManage(), bindReschedulePicker(), bindRescheduleReview(), buildAvailability(), closeCalendar() (+56 more)

### Community 2 - "Community 2"
Cohesion: 0.06
Nodes (59): abrirCliente(), addDaysTo(), agendaHeaderHtml(), agendaMonthLabel(), agendaOffsetMinutes(), agendaPageEl(), apptTimeRange(), attachTimelineScrollbarFade() (+51 more)

### Community 3 - "Client Quiz and Matching"
Cohesion: 0.08
Nodes (54): apptCard(), bindClientsToolbar(), clearClientSearch(), clientStatus(), clientsWithStats(), colorForId(), daysAgoLabel(), daysSince() (+46 more)

### Community 4 - "Community 4"
Cohesion: 0.08
Nodes (50): ajustarQuantidade(), alternarFavorito(), aplicarFiltroEstoque(), bindQtyHold(), bindStockCards(), bindStockToolbar(), clearStockSearch(), closeModal() (+42 more)

### Community 5 - "Client and Hair Profiles"
Cohesion: 0.04
Nodes (42): app, CATEGORY_COLOR_FALLBACK, CATEGORY_COLORS, CLIENT_FILTERS, CLIENT_SORTS, DIAS_SEMANA, HAIR_DENSITY_OPTIONS, HAIR_ELASTICITY_OPTIONS (+34 more)

### Community 6 - "Community 6"
Cohesion: 0.12
Nodes (32): appointmentBookedValue(), appointmentRevenue(), apptValorSectionHtml(), clientStats(), formatCurrency(), insApptMinutes(), insBuildAtencao(), insBuildSugestoes() (+24 more)

### Community 7 - "Booking Wizard UI"
Cohesion: 0.10
Nodes (32): computeAvailableSlots(), dayAvailabilityLevel(), loadClients(), paintWizardShell(), paintWizStep(), updateWizChrome(), wizBindQuickAddClient(), wizBindStepClient() (+24 more)

### Community 8 - "Stripe and Email Integration"
Cohesion: 0.10
Nodes (20): public.booking_operation_requests, public.clients, admin, CORS_HEADERS, RESEND_API_KEY, sha256Hex(), STRIPE_SECRET_KEY, public._create_booking_core() (+12 more)

### Community 9 - "Community 9"
Cohesion: 0.12
Nodes (25): insApptsBetween(), insCapacityMinutes(), insComputePeriod(), insDayFaixaMatrix(), insFaixas(), insFractalMeses(), insFractalSemanas(), insMapStep() (+17 more)

### Community 10 - "Community 10"
Cohesion: 0.17
Nodes (20): bindBlockDynamicFields(), blockCtaLabel(), blockDynamicFieldsHtml(), closeFullSheet(), dateInputValue(), fullSheetEl(), fullSheetIsOpen(), fullSheetNavigate() (+12 more)

### Community 11 - "Landing Page Navigation"
Cohesion: 0.14
Nodes (10): header, navLinks, navToggle, observer, paint(), realIndex(), restart(), settle() (+2 more)

### Community 12 - "UI Components and Dialogs"
Cohesion: 0.19
Nodes (12): closeConfirmDialog(), onEnd(), remove(), confirmDialog(), escapeHtml(), focusableChildren(), prefersReducedMotion(), resetButton() (+4 more)

### Community 13 - "Community 13"
Cohesion: 0.18
Nodes (15): loadStaffCatalog(), loadStaffForService(), loadStaff(), public.staff_services, public.create_public_booking(), public.appointment_services, public.staff, public.staff_services (+7 more)

### Community 14 - "Daily Appointment Summary"
Cohesion: 0.18
Nodes (17): appointmentsOnDate(), bestDayForEncaixe(), dayAggregate(), dayPanoramaCardHtml(), distributionBarsHtml(), formatDurationShort(), isSalonOpenDay(), nextAvailableSlot() (+9 more)

### Community 15 - "Project Documentation and Assets"
Cohesion: 0.15
Nodes (16): Booking Page, Orenzi Logo Icon, App Technical Documentation, Favicon 32px, Management Page, Landing Page, Admin Panel, Appointments Table (+8 more)

### Community 16 - "Community 16"
Cohesion: 0.21
Nodes (14): animateFills(), insAnimateChart(), insBindPeriod(), insBindRail(), atualizarDots(), atualizarHint(), indiceAtual(), passo() (+6 more)

### Community 17 - "Community 17"
Cohesion: 0.23
Nodes (14): checkSession(), loginErro(), loginLimparErro(), markReady(), renderLogin(), setAuthedChrome(), splashAgendarSaida(), splashBoot() (+6 more)

### Community 18 - "Community 18"
Cohesion: 0.36
Nodes (9): PUBLIC, public.appointment_events, public.appointment_services, public.create_public_booking(), public.get_booking_by_token(), public.lock_staff_for_booking(), public.appointments, public.services (+1 more)

### Community 19 - "Community 19"
Cohesion: 0.18
Nodes (9): loadPolicy(), public.cancellation_policies, public.cancellation_policies, public.cancellation_policies, public.get_booking_by_token(), public.appointment_events, public.appointment_services, public.cancellation_policies (+1 more)

### Community 20 - "Community 20"
Cohesion: 0.24
Nodes (11): loadServices(), loadAll(), loadBookingVisits(), loadMovements(), loadProducts(), loadScheduleBlocks(), loadServices(), public.services (+3 more)

### Community 21 - "Community 21"
Cohesion: 0.47
Nodes (11): apptPhotoSectionHtml(), loadAppointments(), renderApptDetail(), wizSaveAppointment(), lookupByToken(), public.appointments, public.appointments, public.appointments (+3 more)

### Community 22 - "Community 22"
Cohesion: 0.20
Nodes (8): admin, buildCreatedEmail(), cryptoProvider, HANDLED, money(), RESEND_API_KEY, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET

### Community 23 - "Community 23"
Cohesion: 0.27
Nodes (9): public.booking_operation_requests, public.cancel_booking_by_token_orchestrated(), public._create_booking_core(), public.create_public_booking_orchestrated(), public.get_booking_by_token(), public.reschedule_booking_by_token_orchestrated(), public.appointment_events, public.appointment_services (+1 more)

### Community 24 - "PWA Web Manifest"
Cohesion: 0.25
Nodes (7): background_color, display, icons, name, short_name, start_url, theme_color

### Community 25 - "Community 25"
Cohesion: 0.29
Nodes (7): colorForService(), iconForService(), wizBindStepService(), wizFilteredServices(), wizRenderServiceList(), wizServiceRowHtml(), wizServicesUsageOrder()

### Community 26 - "Availability and Capacity Integration"
Cohesion: 0.57
Nodes (6): public.get_busy_slots(), public.get_chair_load(), public.staff_work_blocks(), appointments, schedule_blocks, services

### Community 27 - "Community 27"
Cohesion: 0.33
Nodes (6): busyBlocksForStaffOnDate(), scheduleBlockOverlapsDay(), scheduleBlocksForDay(), segmentsOf(), wizDayPreviewHtml(), wizSlotMessages()

### Community 28 - "Community 28"
Cohesion: 0.60
Nodes (6): public.get_busy_slots(), public.get_chair_load(), public.staff_work_blocks(), appointments, schedule_blocks, services

## Knowledge Gaps
- **100 isolated node(s):** `name`, `short_name`, `start_url`, `display`, `background_color` (+95 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `renderApptDetail()` connect `Community 21` to `Community 2`, `Client Quiz and Matching`, `Community 4`, `Client and Hair Profiles`, `Community 6`, `Community 18`?**
  _High betweenness centrality (0.116) - this node is a cross-community bridge._
- **Why does `wizSaveAppointment()` connect `Community 21` to `Community 2`, `Community 4`, `Client and Hair Profiles`, `Booking Wizard UI`, `Community 18`, `Community 20`?**
  _High betweenness centrality (0.106) - this node is a cross-community bridge._
- **Why does `loadBooking()` connect `Booking Management` to `Community 18`, `Community 19`, `Community 23`?**
  _High betweenness centrality (0.096) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `renderCTA()` (e.g. with `confirmPayment()` and `closePolicy()`) actually correct?**
  _`renderCTA()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `name`, `short_name`, `start_url` to the rest of the system?**
  _100 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Booking Acquisition Flow` be split into smaller, more focused modules?**
  _Cohesion score 0.053563111318118306 - nodes in this community are weakly interconnected._
- **Should `Booking Management` be split into smaller, more focused modules?**
  _Cohesion score 0.0875 - nodes in this community are weakly interconnected._