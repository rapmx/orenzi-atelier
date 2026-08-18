# Graph Report - PROJECT ORENZI  (2026-08-18)

## Corpus Check
- Large corpus: 164 files · ~500,412 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder.

## Summary
- 830 nodes · 2159 edges · 44 communities (39 shown, 5 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 54 edges (avg confidence: 0.52)
- Token cost: 70,960 input · 3,496 output

## Community Hubs (Navigation)
- Booking Acquisition Flow
- Community 1
- Booking Management
- Community 3
- Client and Hair Profiles
- Community 5
- Community 6
- Client Quiz and Matching
- Community 8
- Community 9
- Community 10
- Community 11
- Landing Page Navigation
- UI Components and Dialogs
- Community 14
- Community 15
- Project Documentation and Assets
- Daily Appointment Summary
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
- Community 29
- Appointment Email Notifications
- Design System Showcase
- Small App Icon
- Large App Icon
- Appointment Event Logging

## God Nodes (most connected - your core abstractions)
1. `esc()` - 32 edges
2. `render()` - 30 edges
3. `renderStepBody()` - 29 edges
4. `renderCTA()` - 26 edges
5. `prefersReducedMotion()` - 26 edges
6. `renderStepBody()` - 25 edges
7. `renderClientDetail()` - 22 edges
8. `renderApptDetail()` - 22 edges
9. `renderHome()` - 20 edges
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
Nodes (111): accentForCategory(), ACQUISITION_SOURCES, addDaysIso(), anySelectedPriceVaries(), availabilityKey(), bindCalendar(), bindProcessing(), bindStepData() (+103 more)

### Community 1 - "Community 1"
Cohesion: 0.05
Nodes (78): appointmentBookedValue(), appointmentRevenue(), apptValorSectionHtml(), finAnalyticalHtml(), finBindPeriod(), finBuckets(), finComposicaoTexto(), finComputePeriod() (+70 more)

### Community 2 - "Booking Management"
Cohesion: 0.09
Nodes (64): addDaysIso(), availabilityKey(), bindCalendar(), bindManage(), bindReschedulePicker(), bindRescheduleReview(), buildAvailability(), closeCalendar() (+56 more)

### Community 3 - "Community 3"
Cohesion: 0.06
Nodes (63): bindBlockDynamicFields(), blockCtaLabel(), blockDynamicFieldsHtml(), busyBlocksForStaffOnDate(), closeFullSheet(), computeAvailableSlots(), dateInputValue(), dayAvailabilityLevel() (+55 more)

### Community 4 - "Client and Hair Profiles"
Cohesion: 0.04
Nodes (52): ADR-0010, animateCounters(), app, CATEGORY_COLOR_FALLBACK, CATEGORY_COLORS, CLIENT_FILTERS, CLIENT_SORTS, DIAS_SEMANA (+44 more)

### Community 5 - "Community 5"
Cohesion: 0.07
Nodes (45): addDaysTo(), agendaHeaderHtml(), agendaMonthLabel(), agendaOffsetMinutes(), agendaPageEl(), apptTimeRange(), bindAgendaHeader(), bindAgendaPager() (+37 more)

### Community 6 - "Community 6"
Cohesion: 0.12
Nodes (39): ajustarQuantidade(), aplicarFiltroEstoque(), bindQtyHold(), bindStockCards(), bindStockToolbar(), clearStockSearch(), closeModal(), consumoDiario() (+31 more)

### Community 7 - "Client Quiz and Matching"
Cohesion: 0.13
Nodes (31): loadClientQuestionnaires(), qt(), qtr(), quizAnswerLabel(), quizBack(), quizBindClientRows(), quizBindShell(), quizConfirmExit() (+23 more)

### Community 8 - "Community 8"
Cohesion: 0.12
Nodes (29): alternarFavorito(), aplicarNavPorPapel(), apptPhotoSectionHtml(), attachTimelineScrollbarFade(), bindTimelineApptClicks(), bindTimelineBlockClicks(), canAccess(), clientQuizSectionHtml() (+21 more)

### Community 9 - "Community 9"
Cohesion: 0.10
Nodes (29): animateFills(), finAnimarBarras(), finAnimateChart(), finAssinatura(), finBindHelp(), finBindHistorico(), finIndicePadrao(), finLigarAnalytical() (+21 more)

### Community 10 - "Community 10"
Cohesion: 0.11
Nodes (18): public.booking_operation_requests, admin, CORS_HEADERS, RESEND_API_KEY, sha256Hex(), STRIPE_SECRET_KEY, public._create_booking_core(), public.create_booking_hold_orchestrated() (+10 more)

### Community 11 - "Community 11"
Cohesion: 0.15
Nodes (19): apptCard(), bindClientsToolbar(), clearClientSearch(), clientSortsDisponiveis(), clientStats(), clientStatus(), clientsWithStats(), colorForId() (+11 more)

### Community 12 - "Landing Page Navigation"
Cohesion: 0.14
Nodes (10): header, navLinks, navToggle, observer, paint(), realIndex(), restart(), settle() (+2 more)

### Community 13 - "UI Components and Dialogs"
Cohesion: 0.19
Nodes (12): closeConfirmDialog(), onEnd(), remove(), confirmDialog(), escapeHtml(), focusableChildren(), prefersReducedMotion(), resetButton() (+4 more)

### Community 14 - "Community 14"
Cohesion: 0.18
Nodes (15): loadStaffCatalog(), loadStaffForService(), loadStaff(), public.staff_services, public.create_public_booking(), public.appointment_services, public.staff, public.staff_services (+7 more)

### Community 15 - "Community 15"
Cohesion: 0.19
Nodes (17): checkSession(), confirmarSessaoExpirada(), encerrarSessaoUI(), loginErro(), loginLimparErro(), markReady(), renderLogin(), renderSemAcesso() (+9 more)

### Community 16 - "Project Documentation and Assets"
Cohesion: 0.15
Nodes (16): Booking Page, Orenzi Logo Icon, App Technical Documentation, Favicon 32px, Management Page, Landing Page, Admin Panel, Appointments Table (+8 more)

### Community 17 - "Daily Appointment Summary"
Cohesion: 0.20
Nodes (16): appointmentsOnDate(), bestDayForEncaixe(), dayAggregate(), dayPanoramaCardHtml(), distributionBarsHtml(), formatDurationShort(), isSalonOpenDay(), nextAvailableSlot() (+8 more)

### Community 18 - "Community 18"
Cohesion: 0.24
Nodes (13): loadAppointments(), lookupByToken(), public.appointments, public.appointments, public._create_booking_core(), public.get_booking_by_token(), public.appointment_events, public.appointment_services (+5 more)

### Community 19 - "Community 19"
Cohesion: 0.36
Nodes (9): PUBLIC, public.appointment_events, public.appointment_services, public.create_public_booking(), public.get_booking_by_token(), public.lock_staff_for_booking(), public.appointments, public.services (+1 more)

### Community 20 - "Community 20"
Cohesion: 0.18
Nodes (9): loadPolicy(), public.cancellation_policies, public.cancellation_policies, public.cancellation_policies, public.get_booking_by_token(), public.appointment_events, public.appointment_services, public.cancellation_policies (+1 more)

### Community 21 - "Community 21"
Cohesion: 0.20
Nodes (8): admin, buildCreatedEmail(), cryptoProvider, HANDLED, money(), RESEND_API_KEY, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET

### Community 22 - "Community 22"
Cohesion: 0.27
Nodes (8): auth.users, resolverPapel(), public.app_accounts_set_updated_at, public.app_accounts, public.current_app_role(), public.current_staff_id(), public.is_owner(), trg_app_accounts_updated_at

### Community 23 - "Community 23"
Cohesion: 0.22
Nodes (10): abrirCliente(), loadAll(), loadBookingVisits(), loadClients(), loadMovements(), loadProducts(), morphAvatar(), normalizeIePhone() (+2 more)

### Community 24 - "PWA Web Manifest"
Cohesion: 0.25
Nodes (7): background_color, display, icons, name, short_name, start_url, theme_color

### Community 25 - "Community 25"
Cohesion: 0.25
Nodes (5): loadScheduleBlocks(), public.schedule_blocks_set_updated_at, public.schedule_blocks, public.staff, trg_schedule_blocks_set_updated_at

### Community 26 - "Availability and Capacity Integration"
Cohesion: 0.57
Nodes (6): public.get_busy_slots(), public.get_chair_load(), public.staff_work_blocks(), appointments, schedule_blocks, services

### Community 27 - "Community 27"
Cohesion: 0.33
Nodes (6): loadServices(), public.services, public.services, public.services, public.schedule_blocks_guard_conflict(), public.services

### Community 28 - "Community 28"
Cohesion: 0.53
Nodes (4): public.booking_operation_requests, public.cancel_booking_by_token_orchestrated(), public.create_public_booking_orchestrated(), public.reschedule_booking_by_token_orchestrated()

### Community 29 - "Community 29"
Cohesion: 0.60
Nodes (6): public.get_busy_slots(), public.get_chair_load(), public.staff_work_blocks(), appointments, schedule_blocks, services

## Knowledge Gaps
- **107 isolated node(s):** `name`, `short_name`, `start_url`, `display`, `background_color` (+102 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `renderApptDetail()` connect `Community 8` to `Community 1`, `Client and Hair Profiles`, `Community 6`, `Community 11`, `Community 18`, `Community 19`?**
  _High betweenness centrality (0.110) - this node is a cross-community bridge._
- **Why does `wizSaveAppointment()` connect `Community 3` to `Client and Hair Profiles`, `Community 5`, `Community 6`, `Community 8`, `Community 18`, `Community 19`, `Community 23`?**
  _High betweenness centrality (0.100) - this node is a cross-community bridge._
- **Why does `loadBooking()` connect `Booking Management` to `Community 18`, `Community 19`, `Community 20`?**
  _High betweenness centrality (0.092) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `renderCTA()` (e.g. with `confirmPayment()` and `closePolicy()`) actually correct?**
  _`renderCTA()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `name`, `short_name`, `start_url` to the rest of the system?**
  _107 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Booking Acquisition Flow` be split into smaller, more focused modules?**
  _Cohesion score 0.05339435545385202 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.051615051615051616 - nodes in this community are weakly interconnected._