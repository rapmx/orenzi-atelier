# Graph Report - PROJECT ORENZI  (2026-08-18)

## Corpus Check
- 40 files · ~205,203 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 791 nodes · 2039 edges · 44 communities (39 shown, 5 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 50 edges (avg confidence: 0.52)
- Token cost: 70,960 input · 3,496 output

## Community Hubs (Navigation)
- Booking Acquisition Flow
- Community 1
- Booking Management
- Client and Hair Profiles
- Community 4
- Client Quiz and Matching
- Community 6
- Community 7
- Community 8
- Community 9
- Community 10
- Community 11
- Community 12
- Daily Appointment Summary
- Community 14
- Landing Page Navigation
- UI Components and Dialogs
- Project Documentation and Assets
- Community 18
- Community 19
- Community 20
- Community 21
- Community 22
- Community 23
- PWA Web Manifest
- Community 25
- Community 26
- Availability and Capacity Integration
- Community 28
- Community 29
- Appointment Email Notifications
- Design System Showcase
- Small App Icon
- Large App Icon
- Appointment Event Logging

## God Nodes (most connected - your core abstractions)
1. `renderStepBody()` - 29 edges
2. `esc()` - 29 edges
3. `render()` - 29 edges
4. `renderCTA()` - 26 edges
5. `renderStepBody()` - 25 edges
6. `renderClientDetail()` - 22 edges
7. `renderApptDetail()` - 22 edges
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

## Communities (44 total, 5 thin omitted)

### Community 0 - "Booking Acquisition Flow"
Cohesion: 0.05
Nodes (109): accentForCategory(), ACQUISITION_SOURCES, addDaysIso(), anySelectedPriceVaries(), availabilityKey(), bindCalendar(), bindProcessing(), bindStepData() (+101 more)

### Community 1 - "Community 1"
Cohesion: 0.05
Nodes (69): abrirCliente(), alternarFavorito(), aplicarNavPorPapel(), apptPhotoSectionHtml(), attachTimelineScrollbarFade(), bindAgendaHeader(), bindClientsToolbar(), bindStockCards() (+61 more)

### Community 2 - "Booking Management"
Cohesion: 0.09
Nodes (64): addDaysIso(), availabilityKey(), bindCalendar(), bindManage(), bindReschedulePicker(), bindRescheduleReview(), buildAvailability(), closeCalendar() (+56 more)

### Community 3 - "Client and Hair Profiles"
Cohesion: 0.04
Nodes (51): ADR-0010, animateCounters(), app, CATEGORY_COLOR_FALLBACK, CATEGORY_COLORS, CLIENT_FILTERS, CLIENT_SORTS, colorForService() (+43 more)

### Community 4 - "Community 4"
Cohesion: 0.07
Nodes (49): ajustarQuantidade(), animateFills(), aplicarFiltroEstoque(), bindQtyHold(), bindStockToolbar(), clearStockSearch(), consumoDiario(), daysAgoLabel() (+41 more)

### Community 5 - "Client Quiz and Matching"
Cohesion: 0.12
Nodes (36): esc(), loadClientQuestionnaires(), qt(), qtr(), quizAnswerLabel(), quizBack(), quizBindClientRows(), quizBindShell() (+28 more)

### Community 6 - "Community 6"
Cohesion: 0.10
Nodes (34): addDaysTo(), agendaHeaderHtml(), agendaMonthLabel(), agendaOffsetMinutes(), agendaPageEl(), apptTimeRange(), bindAgendaPager(), bindWeekDayButtons() (+26 more)

### Community 7 - "Community 7"
Cohesion: 0.11
Nodes (25): auth.users, checkSession(), confirmarSessaoExpirada(), encerrarSessaoUI(), loginErro(), loginLimparErro(), markReady(), renderLogin() (+17 more)

### Community 8 - "Community 8"
Cohesion: 0.11
Nodes (17): public.booking_operation_requests, public.clients, admin, CORS_HEADERS, RESEND_API_KEY, STRIPE_SECRET_KEY, public._create_booking_core(), public.create_booking_hold_orchestrated() (+9 more)

### Community 9 - "Community 9"
Cohesion: 0.15
Nodes (25): formatCurrency(), insApptMinutes(), insBuildAtencao(), insBuildSugestoes(), insCanais(), insCardHtml(), insClientesAtrasadas(), insClientesForaCadenciaNaJanela() (+17 more)

### Community 10 - "Community 10"
Cohesion: 0.15
Nodes (23): bindBlockDynamicFields(), blockCtaLabel(), blockDynamicFieldsHtml(), closeFullSheet(), fullSheetEl(), fullSheetIsOpen(), fullSheetNavigate(), newWizState() (+15 more)

### Community 11 - "Community 11"
Cohesion: 0.13
Nodes (20): dateInputValue(), emptyStateHtml(), loadClients(), newBlockFormState(), paintWizStep(), wizBindQuickAddClient(), wizBindStepClient(), wizBindStepConfirm() (+12 more)

### Community 12 - "Community 12"
Cohesion: 0.16
Nodes (17): loadStaffCatalog(), loadStaffForService(), loadStaff(), public.staff_services, public.create_public_booking(), public.appointment_services, public.staff, public.staff_services (+9 more)

### Community 13 - "Daily Appointment Summary"
Cohesion: 0.17
Nodes (19): appointmentsOnDate(), apptCard(), bestDayForEncaixe(), dayAggregate(), dayPanoramaCardHtml(), distributionBarsHtml(), fmtTime(), formatDurationShort() (+11 more)

### Community 14 - "Community 14"
Cohesion: 0.16
Nodes (18): loadAppointments(), wizClient(), wizSaveAppointment(), wizService(), wizStaff(), wizStaffId(), wizStepConfirm(), lookupByToken() (+10 more)

### Community 15 - "Landing Page Navigation"
Cohesion: 0.14
Nodes (10): header, navLinks, navToggle, observer, paint(), realIndex(), restart(), settle() (+2 more)

### Community 16 - "UI Components and Dialogs"
Cohesion: 0.19
Nodes (12): closeConfirmDialog(), onEnd(), remove(), confirmDialog(), escapeHtml(), focusableChildren(), prefersReducedMotion(), resetButton() (+4 more)

### Community 17 - "Project Documentation and Assets"
Cohesion: 0.15
Nodes (16): Booking Page, Orenzi Logo Icon, App Technical Documentation, Favicon 32px, Management Page, Landing Page, Admin Panel, Appointments Table (+8 more)

### Community 18 - "Community 18"
Cohesion: 0.19
Nodes (13): insCapacityMinutes(), insDayFaixaMatrix(), insFaixas(), insFractalMeses(), insFractalSemanas(), insMapStep(), insOccupancy(), insOpenDays() (+5 more)

### Community 19 - "Community 19"
Cohesion: 0.36
Nodes (9): PUBLIC, public.appointment_events, public.appointment_services, public.create_public_booking(), public.get_booking_by_token(), public.lock_staff_for_booking(), public.appointments, public.services (+1 more)

### Community 20 - "Community 20"
Cohesion: 0.26
Nodes (11): public.booking_operation_requests, public.cancel_booking_by_token_orchestrated(), public._create_booking_core(), public.create_public_booking_orchestrated(), public.get_booking_by_token(), public.reschedule_booking_by_token_orchestrated(), public.appointment_events, public.appointment_services (+3 more)

### Community 21 - "Community 21"
Cohesion: 0.24
Nodes (11): busyBlocksForStaffOnDate(), computeAvailableSlots(), dayAvailabilityLevel(), segmentsOf(), wizBindStepTime(), wizDayPreviewHtml(), wizFilterSlotsToInterval(), wizIsContextual() (+3 more)

### Community 22 - "Community 22"
Cohesion: 0.27
Nodes (11): insApptsBetween(), insComputePeriod(), insNewClients(), insPeriodEnd(), insPeriodLabels(), insPeriodStart(), insProximaSemana(), insShiftBack() (+3 more)

### Community 23 - "Community 23"
Cohesion: 0.20
Nodes (8): admin, buildCreatedEmail(), cryptoProvider, HANDLED, money(), RESEND_API_KEY, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET

### Community 24 - "PWA Web Manifest"
Cohesion: 0.25
Nodes (7): background_color, display, icons, name, short_name, start_url, theme_color

### Community 25 - "Community 25"
Cohesion: 0.36
Nodes (8): loadServices(), serviceById(), loadServices(), public.services, public.services, public.services, public.schedule_blocks_guard_conflict(), public.services

### Community 26 - "Community 26"
Cohesion: 0.36
Nodes (8): appointmentBookedValue(), appointmentRevenue(), apptValorSectionHtml(), clientStats(), openApptValorSheet(), erro(), valorSeDefinido(), wizRecentClients()

### Community 27 - "Availability and Capacity Integration"
Cohesion: 0.57
Nodes (6): public.get_busy_slots(), public.get_chair_load(), public.staff_work_blocks(), appointments, schedule_blocks, services

### Community 28 - "Community 28"
Cohesion: 0.60
Nodes (6): public.get_busy_slots(), public.get_chair_load(), public.staff_work_blocks(), appointments, schedule_blocks, services

### Community 29 - "Community 29"
Cohesion: 0.40
Nodes (4): loadPolicy(), public.cancellation_policies, public.cancellation_policies, public.cancellation_policies

## Knowledge Gaps
- **103 isolated node(s):** `name`, `short_name`, `start_url`, `display`, `background_color` (+98 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `renderApptDetail()` connect `Community 1` to `Client and Hair Profiles`, `Daily Appointment Summary`, `Community 14`, `Community 19`, `Community 20`, `Community 26`?**
  _High betweenness centrality (0.111) - this node is a cross-community bridge._
- **Why does `wizSaveAppointment()` connect `Community 14` to `Community 1`, `Client and Hair Profiles`, `Community 6`, `Community 11`, `Community 19`, `Community 20`?**
  _High betweenness centrality (0.101) - this node is a cross-community bridge._
- **Why does `loadBooking()` connect `Booking Management` to `Community 19`, `Community 20`, `Community 14`?**
  _High betweenness centrality (0.094) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `renderCTA()` (e.g. with `confirmPayment()` and `closePolicy()`) actually correct?**
  _`renderCTA()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `name`, `short_name`, `start_url` to the rest of the system?**
  _103 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Booking Acquisition Flow` be split into smaller, more focused modules?**
  _Cohesion score 0.05404551201011378 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.05098934550989345 - nodes in this community are weakly interconnected._