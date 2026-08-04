# ORENZI DESIGN SYSTEM
**Version 1.0 — Product language, components, interaction rules and implementation guide**

> Working specification. Exact color and typography values must be confirmed from the repository before hard-coding.

## 0. Usage
- This file is the implementation source of truth.
- Mobile is the source of truth: 320–430 px, reference width 390 px.
- In desktop browsers, center the mobile application canvas unless a separate desktop layout is specified.
- Build tokens → primitives → patterns → migrate one screen at a time.
- Do not introduce local visual rules when a shared pattern exists.

## 1. Product philosophy
Orenzi is a calm operating system for appointment-based businesses, not a traditional ERP.

### It should feel
Sophisticated, warm, organized, trustworthy, calm and fast to scan.

### It must not feel
Dense, bureaucratic, noisy, generic, over-carded, over-animated or desktop-first.

## 2. Principles
1. **Content before chrome**
2. **Less, but clearer**
3. **One primary action**
4. **Progressive disclosure**
5. **White space is structure**
6. **Status at a glance**
7. **Motion confirms intent**
8. **Reuse before invention**

## 3. Foundations

### Semantic color tokens — provisional
| Token | Value | Use |
|---|---:|---|
| `color.bg.canvas` | `#F5EFE6` | Main background |
| `color.bg.surface` | `#FBF7F1` | Cards and sheets |
| `color.text.primary` | `#241C18` | Essential text |
| `color.text.secondary` | `#766A60` | Metadata |
| `color.border.subtle` | `#DED3C5` | Quiet outlines |
| `color.action.primary` | `#A85F2A` | Primary actions |
| `color.action.secondary` | `#C17A42` | Supporting accent |
| `color.status.success` | `#4B9B62` | Healthy/active |
| `color.status.warning` | `#D99318` | Attention/low |
| `color.status.critical` | `#BD3B3B` | Urgent/destructive |
| `color.status.neutral` | `#9B9B96` | Inactive/unknown |

Status never relies on color alone.

### Typography
Use the existing project font:
- `display`: 32/38, 700
- `title-1`: 28/34, 700
- `title-2`: 22/28, 650
- `title-3`: 18/24, 600
- `body`: 16/24, 400
- `body-medium`: 16/24, 500
- `caption`: 13/18, 400
- `micro`: 11/14, 500

### Spacing
`4, 8, 12, 16, 20, 24, 32, 40, 48`

Default mobile gutter: 24 px. Avoid arbitrary values.

### Radius and elevation
- `radius-sm`: 10
- `radius-md`: 16
- `radius-lg`: 20
- `radius-xl`: 28
- `radius-full`: 999
- Default border: 1 px subtle
- Shadows only for genuinely floating surfaces

### Mobile layout
- Validate at 320, 390 and 430 px.
- Touch targets: at least 44×44 px.
- Respect safe areas.
- Current webapp: centered mobile canvas on desktop.

## 4. Core components
- Button: primary, secondary, ghost
- IconButton
- FAB
- Input
- SearchField
- Chip
- Badge
- Card: summary and list item
- BottomSheet
- Toast and Banner
- Skeleton
- EmptyState and ErrorState

All applicable components include default, pressed, focus-visible, disabled, loading and error states.

## 5. Screen patterns
Standard anatomy:
1. Header
2. Operational summary, when useful
3. Search and filters
4. Main content
5. One primary action
6. Bottom navigation on top-level destinations

Rules:
- More than 20 expected items: search.
- More than 30: filters.
- More than 50: sorting.
- Preserve query, filters, sorting and scroll on return.
- Prefer direct controls for three or fewer choices.
- Use spacing and headings before adding cards.

## 6. Motion
| Token | Duration | Use |
|---|---:|---|
| `instant` | 80 ms | Press feedback |
| `fast` | 160 ms | Buttons and chips |
| `standard` | 200 ms | Most transitions |
| `emphasized` | 240 ms | Sheets and search |
| `route` | 280 ms | Screen navigation |

Recipes:
- Press: `scale(1 → .98 → 1)`.
- Filter change: subtle fade + 4 px translation.
- Bottom sheet: backdrop fade + upward translation.
- FAB: rotate up to 45° while actions open.
- Respect `prefers-reduced-motion`.
- No long bounce, glow, continuous decorative motion or routine transitions above 350 ms.

## 7. States and feedback
- Loading list: geometry-matched skeleton.
- Empty: explanation + one action.
- No results: show query and reset.
- Offline: persistent banner.
- Recoverable error: retry.
- Destructive: explicit confirmation.
- Success: toast or inline confirmation without losing context.

## 8. Accessibility
- WCAG AA contrast.
- Semantic HTML and native controls.
- Visible focus.
- Associated labels.
- Text/icon as well as color.
- Text zoom support.
- Bottom-sheet focus trapping and restoration.
- Reduced motion.

## 9. Domain patterns

### Agenda
Borderless timeline, brand current-time indicator, “Hoje” scrolls to current time.

### Clients
List preview includes avatar, name, last visit, visits, lifetime spend and status. Search by name, phone and email. Preserve list state.

### Inventory
Summary includes total, healthy, low and urgent. Critical products first. Quantity changes create an audit record. Search by product, brand, category, code and supplier.

### Insights
One chart answers one question. Transitions preserve continuity.

## 10. Governance
Definition of done:
- semantic tokens;
- shared components;
- loading/empty/error/disabled states;
- keyboard, touch and reduced motion;
- 320/390/430 px;
- navigation state preservation;
- no local radius, shadow, icon or motion style.

## 11. Suggested structure
```text
src/design-system/
  tokens/
  components/
  patterns/
  foundations/
docs/ORENZI_DESIGN_SYSTEM_v1.0.md
```

## 12. Claude workflow
1. Save this file at `/docs/ORENZI_DESIGN_SYSTEM_v1.0.md`.
2. Add the rule below to `CLAUDE.md`.
3. Run the audit prompt.
4. Approve exact token mapping.
5. Implement tokens and primitives.
6. Migrate one pilot screen.
7. Review at 320/390/430 px and desktop centered canvas.
8. Migrate remaining screens.
9. Reject future one-off values.

## CLAUDE.md rule
```md
## Orenzi UI contract

Before creating, modifying or reviewing any interface:
1. Read `/docs/ORENZI_DESIGN_SYSTEM_v1.0.md`.
2. Reuse shared tokens, components and patterns.
3. Do not introduce raw colors, arbitrary spacing, local radius values, new shadow styles or one-off animation durations unless explicitly approved.
4. Mobile is the source of truth (320–430 px). Browser desktop presentation must center the mobile application canvas unless a separate desktop specification is provided.
5. Preserve backend, business logic, routes and data contracts during visual changes.
6. Include loading, empty, error, disabled, focus and reduced-motion behavior.
7. If the design system does not cover a need, stop and propose an extension before implementing a local exception.
```

## Audit prompt
```text
You are acting as a senior design-systems engineer and product designer.

Before changing any code, read:
1. CLAUDE.md
2. /docs/ORENZI_DESIGN_SYSTEM_v1.0.md
3. the existing project structure and styling files.

This phase is AUDIT ONLY. Do not edit files.

Deliver:
- the frontend framework, styling strategy and component architecture;
- every existing source of color, typography, spacing, radius, shadow and animation values;
- duplicated or conflicting UI components;
- exact current brand colors and font extracted from code;
- screens that already approximate the Orenzi standard and should be preserved;
- accessibility and responsiveness risks;
- a proposed mapping from current values to semantic tokens;
- a phased migration plan with the smallest safe first pull request;
- files expected to be created, modified or retired.

Constraints:
- preserve backend, business logic, database, routes and data contracts;
- do not recommend a full rewrite;
- mobile is the source of truth;
- desktop browser should center the mobile application canvas unless an intentional desktop layout exists;
- identify uncertainty explicitly instead of guessing.

Stop after the audit and wait for approval.
```

## Foundation prompt
```text
Implement Phase 1 of the approved Orenzi Design System.

Read and follow:
- CLAUDE.md
- /docs/ORENZI_DESIGN_SYSTEM_v1.0.md
- the approved audit and token mapping.

Scope:
1. Centralize semantic tokens for color, typography, spacing, radius, border, elevation and motion.
2. Build or refactor only:
   - Button
   - IconButton
   - Card
   - Input
   - SearchField
   - Chip
   - Badge
3. Add all applicable states: default, pressed, focus-visible, disabled, loading and error.
4. Support 320–430 px and browser keyboard navigation.
5. Respect prefers-reduced-motion.
6. Add Storybook stories, a component showcase or equivalent isolated examples.
7. Add tests supported by the current stack.

Do not migrate full feature screens in this phase.
Do not change business logic, routes, APIs, database code or data models.
Do not introduce a second styling framework.
Reuse the exact brand values resolved during the audit.

At the end:
- list files changed;
- explain deviations;
- provide check/test commands;
- report remaining risks.
```

## Screen migration prompt
```text
Migrate the [SCREEN NAME] screen to the Orenzi Design System.

Mandatory sources:
- CLAUDE.md
- /docs/ORENZI_DESIGN_SYSTEM_v1.0.md
- existing shared design-system components.

Goals:
- preserve all data, backend logic, routes and functionality;
- compose shared components rather than adding local visual primitives;
- maintain the Orenzi mobile-first identity;
- support 320, 390 and 430 px;
- center the mobile experience in a desktop browser rather than stretching it;
- implement loading, empty, no-results, error and disabled states;
- preserve search, filters, sorting and scroll state on return;
- use motion tokens and respect reduced motion;
- ensure 44 × 44 px touch targets and visible keyboard focus.

Interaction requirements:
- press feedback begins within 80 ms;
- standard transitions use 160–220 ms;
- no exaggerated bounce, glow, gradient or heavy shadow;
- list filtering uses a subtle fade and 4 px translation;
- bottom sheets use the shared pattern;
- destructive actions require explicit confirmation.

Before editing, summarize:
1. current structure;
2. shared components to reuse;
3. any genuinely missing component;
4. files expected to change.

After implementation, report:
- files changed;
- states tested;
- responsiveness checked;
- accessibility considerations;
- any remaining design-system exception.
```
