# APML Battle Report: Round 002 - Zenjin Maths

**Date:** 2025-12-05
**Analyst:** Claude (APML Validation Agent)
**Target Repository:** zenjin-maths-apml-v1
**APML Version Under Test:** v1.x (0.9.1)

---

## Executive Summary

Zenjin Maths is a sophisticated mathematics learning platform with 178 source files implementing adaptive learning, gamification, multi-tenant school management, and a "triple-helix" spaced repetition algorithm. The codebase already uses APML v0.9.1 extensively with 36 `.apml` specification files.

**Overall APML v1.x Coverage: ~72%**

The existing APML specs successfully describe:
- Data models (user profiles, atoms, sessions, schools)
- Permission hierarchies and role-based access
- Learning algorithm architecture
- Trinity messaging patterns

However, significant gaps exist in:
- Animation and transition specifications
- Real-time state machine behavior
- Complex algorithmic logic (waterfall progression)
- Component composition patterns
- Offline/sync strategies
- Payment flow state management

---

## Tech Stack Analysis

| Layer | Technology | APML Coverage |
|-------|-----------|---------------|
| Frontend | Vue 3 + TypeScript | Partial (components not fully spec'd) |
| State | Pinia stores | High (data models well-defined) |
| Backend | Supabase (PostgreSQL) | High (database schema in APML) |
| Auth | Supabase Auth + Magic Links | Medium (flows not behavioral) |
| Payments | Stripe | Low (state machines missing) |
| Build | Vite + Tailwind | N/A (tooling) |
| i18n | vue-i18n (12 languages) | Not addressable in APML |

---

## Feature Coverage Analysis

### 1. Core Learning Engine

**Files:** `src/stores/learning.ts` (1400+ lines), `src/utils/mathQuestionEngine.ts`

| Sub-feature | APML Coverage | Gap Severity |
|-------------|---------------|--------------|
| Question generation | High | - |
| Answer validation | High | - |
| Distinction levels (1-8) | High | - |
| Triple-helix rotation | Medium | Warning |
| Waterfall lake progression | Low | Critical |
| Blink speed adaptation | Low | Critical |
| Sandwich progression (FTC/EC) | Low | Warning |

**Gap Details:**

The waterfall algorithm (`selectNextAtomForThread()`) involves complex state machine logic:
```
Lake 1 → Lake 2 → Lake 3 → Lake 4 (Perfect atoms move between lakes)
```

Current APML can define the data structures but cannot express:
- State transition guards (e.g., "if consecutivePerfect >= 3 AND pointsEarned >= 300")
- Probabilistic selection logic
- Time-based cooldowns (`MINIMUM_REST_PERIOD_MS`)

**Proposed Extension:**

```apml
state_machine WaterfallProgression:
  states: [lake_1, lake_2, lake_3, lake_4, retired]

  transition promote_atom:
    from: lake_n where n < 4
    to: lake_n+1
    guard: consecutive_perfect >= 3 AND points_earned >= 300
    action: reset_consecutive_count

  transition demote_atom:
    from: lake_n where n > 1
    to: lake_1
    guard: wrong_answers >= 2
    cooldown: 30_minutes
```

---

### 2. Gamification System

**Files:** `src/stores/learning.ts` (Evolution levels), `src/stores/user.ts`

| Sub-feature | APML Coverage | Gap Severity |
|-------------|---------------|--------------|
| Points system | High | - |
| Evolution levels (30 tiers) | Medium | Warning |
| Streaks | Low | Warning |
| Daily rankings | Low | Suggestion |
| Celebration overlays | None | Critical |

**Gap Details:**

Evolution levels define 30 progression tiers:
```typescript
{ level: 1, threshold: 0, name: "Mathling", emoji: "🥚" }
{ level: 30, threshold: 999999, name: "Mathematic Omnipotent", emoji: "🌌" }
```

APML can model the data but cannot express:
- Achievement trigger conditions
- Visual celebration sequences
- Random celebration probability logic

**Proposed Extension:**

```apml
progression evolution_journey:
  levels: 30

  level Mathling:
    threshold: 0
    visual_identity:
      emoji: "🥚"
      color_scheme: soft_blue

  advancement_trigger:
    condition: lifetime_points >= next_level.threshold
    celebration: random_animation from [confetti, particle_burst, level_up_glow]
    probability: 0.3 for bonus_celebration
```

---

### 3. School Management System

**Files:** `src/stores/school.ts`, `specs/SchoolSystemPermissions.apml`

| Sub-feature | APML Coverage | Gap Severity |
|-------------|---------------|--------------|
| School entities | High | - |
| Class entities | High | - |
| Teacher verification | High | - |
| Join code system | High | - |
| Permission hierarchy | High | - |
| Tag-based relationships | High | - |
| School branding | Medium | Warning |
| Seat limits/constraints | Low | Warning |

**Gap Details:**

The school branding system includes color extraction from logos and dynamic theming, which APML cannot express:

```typescript
color_palette?: any
theme_style?: 'professional' | 'vibrant' | 'minimal'
```

Seat limit enforcement uses database triggers - APML defines data but not the enforcement logic.

**Proposed Extension:**

```apml
constraint school_teacher_limit:
  table: user_tags
  on: insert
  when: tag_type = 'school' AND educational_role = 'teacher'
  check: count(teachers_in_school) < school.teacher_seats
  violation_action: raise_exception "Teacher seat limit exceeded"
```

---

### 4. Authentication & User Flows

**Files:** `src/stores/user.ts`, `src/router/index.ts` (63 routes)

| Sub-feature | APML Coverage | Gap Severity |
|-------------|---------------|--------------|
| Anonymous sessions | Medium | Warning |
| Magic link OTP | Medium | Warning |
| Password setup nudge | Low | Critical |
| Session persistence | Low | Warning |
| Role-based routing | Low | Critical |

**Gap Details:**

The router defines complex route guards:
```typescript
meta: { requiresAuth: true, role: 'admin', userType: 'teacher' }
```

APML cannot express navigation guards, route hierarchies, or conditional redirects.

**Proposed Extension:**

```apml
navigation app_routes:
  route /admin:
    component: AdminDashboard
    guards:
      - requires_auth: true
      - requires_role: [admin, super_admin]
    redirect_on_failure: /dashboard

  route /teacher/class/:classId:
    component: TeacherClassView
    guards:
      - requires_auth: true
      - requires_ownership: class.teacher_id = current_user.id
    params:
      classId: uuid required
```

---

### 5. Question Display System (Universal Learning Engine)

**Files:** `src/universal/`, `ZenjinUniversalInteractionSpecification.apml`

| Sub-feature | APML Coverage | Gap Severity |
|-------------|---------------|--------------|
| Display formats | High | - |
| Input methods | High | - |
| Cognitive stages | High | - |
| Auto-advance validation | Medium | Warning |
| Triangle visualization | Low | Critical |
| Mathematical typography | None | Critical |

**Gap Details:**

The auto-advance input system requires per-keystroke validation:
```typescript
validation_moment: keystroke | field_complete | answer_complete
```

Mathematical rendering (LaTeX, special symbols) is entirely outside APML scope.

**Proposed Extension:**

```apml
interaction auto_advance_input:
  fields: [coefficient, variable, result]

  field coefficient:
    type: number
    validation: on_keystroke
    feedback:
      correct: green_glow AND advance_to_next_field
      incorrect: red_glow AND stay_in_field

  keyboard_behavior:
    numeric_only: true
    auto_submit_on_complete: true
```

---

### 6. Payment & Subscription System

**Files:** `src/views/Payment*.vue` (7 files), Supabase functions

| Sub-feature | APML Coverage | Gap Severity |
|-------------|---------------|--------------|
| Stripe integration | Low | Critical |
| 3D Secure flow | None | Critical |
| Subscription states | Low | Warning |
| Premium cascade (school→teacher→student) | Low | Warning |
| Promo codes | Medium | - |

**Gap Details:**

Payment involves complex external integrations and multi-step flows:
```
Checkout → Processing → 3DSecure? → Success/Failure → Webhook confirmation
```

APML has no mechanism for:
- External service integration patterns
- Webhook handling
- Async confirmation flows
- Retry/timeout logic

**Proposed Extension:**

```apml
external_integration stripe:
  api: stripe_checkout

  flow purchase_subscription:
    steps:
      1. create_session -> redirect_to_stripe
      2. await_return -> check_status
      3. if pending_3ds -> redirect_to_3ds_page
      4. await_webhook: checkout.session.completed
      5. activate_subscription

    timeout: 30_minutes
    on_timeout: cancel_pending_session

    webhook checkout.session.completed:
      verify: stripe_signature
      action: upgrade_user_account
```

---

### 7. Analytics & Insights

**Files:** `src/views/admin/UserAnalyticsView.vue`, `src/views/analytics/EntityAnalyticsView.vue`

| Sub-feature | APML Coverage | Gap Severity |
|-------------|---------------|--------------|
| Session metrics | High | - |
| Lifetime metrics | High | - |
| Class aggregates | Medium | - |
| School aggregates | Medium | - |
| Real-time dashboards | None | Critical |
| Chart visualizations | None | N/A (outside scope) |

**Gap Details:**

Analytics dashboards require:
- Computed/derived data (FTC percentages, averages)
- Time-series aggregations
- Real-time updates

**Proposed Extension:**

```apml
computed_metric class_ftc_percentage:
  source: learning_sessions
  filter: user in class.students
  formula: sum(ftc_count) / sum(questions_answered) * 100
  refresh: on_session_complete

dashboard teacher_view:
  widgets:
    - metric: class_ftc_percentage
      visualization: gauge
      threshold_colors:
        red: < 50
        yellow: 50-75
        green: > 75
```

---

### 8. i18n / Localization

**Files:** `src/locales/` (12 language files)

| Sub-feature | APML Coverage | Gap Severity |
|-------------|---------------|--------------|
| Translation keys | None | Suggestion |
| RTL support | None | Suggestion |
| Language-specific routes | None | Suggestion |

**Gap Analysis:**

Internationalization is not in APML's current scope. The codebase supports:
- English, Welsh, Spanish, French, Italian, Finnish
- Irish, Sinhala, Tamil, Chinese, Japanese
- Localized welcome routes (`/croeso`, `/bienvenue`, etc.)

**Recommendation:** Consider whether APML v2.0 should include i18n specifications or declare it out of scope.

---

## Unique Patterns Discovered

### 1. Triple-Helix Learning Architecture

A novel spaced repetition variant using three parallel "threads" (A, B, C) that rotate, preventing learner fatigue while ensuring comprehensive coverage.

**Current APML:** Partially described in `specs/triple_helix_architecture.apml`
**Gap:** Rotation logic, thread interleaving rules

### 2. Waterfall Lake Progression

Atoms progress through "lakes" (1-4) based on mastery:
- Lake 1: Active learning
- Lake 2: Review phase
- Lake 3: Consolidation
- Lake 4: Mastered (retired)

**Current APML:** Data structures only
**Gap:** Transition rules, demotion triggers, time-based cooldowns

### 3. Distinction-Based Cognition

Questions vary by "distinction level" (1-8), affecting answer similarity:
- Level 1: Gross distinctions (42 vs 84)
- Level 8: Fine distinctions (42 vs 43)

**Current APML:** Well-described in `ZenjinUniversalInteractionSpecification.apml`
**Gap:** Visual feedback transitions, distractor generation algorithms

### 4. Respect-Based Permissions

A unique permission model where visibility follows "invitation lineage":
- Teachers see individual data for students they invited
- School admins see aggregate data unless they invited the teacher

**Current APML:** Well-described in `specs/SchoolSystemPermissions.apml`
**Gap:** Query-time permission enforcement logic

### 5. Portable Student Accounts

Students own their accounts and keep progress when changing schools. Tags are soft-deleted to preserve history.

**Current APML:** Data model described
**Gap:** Migration/transfer workflow

---

## Full Gap List with Proposals

### Critical Gaps

| # | Gap | Pattern Commonality | Proposed Syntax |
|---|-----|---------------------|-----------------|
| 1 | State machine transitions | Very Common | `state_machine` block with guards/actions |
| 2 | Animation/transition timing | Very Common | `animation` block with keyframes |
| 3 | External service integration | Common | `external_integration` with flows |
| 4 | Navigation guards | Very Common | `navigation` block with route guards |
| 5 | Real-time subscriptions | Common | `subscription` block with filters |
| 6 | Computed/derived metrics | Very Common | `computed_metric` with formulas |

### Warning Gaps

| # | Gap | Pattern Commonality | Proposed Syntax |
|---|-----|---------------------|-----------------|
| 7 | Database constraints/triggers | Common | `constraint` block on tables |
| 8 | Timeout/retry logic | Common | `timeout` and `retry` directives |
| 9 | Probability-based selection | Uncommon | `probability` operator |
| 10 | Keyboard/input behavior | Common | `keyboard_behavior` block |
| 11 | Time-based cooldowns | Uncommon | `cooldown` directive |

### Suggestion Gaps

| # | Gap | Pattern Commonality | Proposed Syntax |
|---|-----|---------------------|-----------------|
| 12 | i18n translation keys | Common | Out of scope recommendation |
| 13 | Chart/visualization types | Common | Out of scope (rendering) |
| 14 | Theme/branding inheritance | Uncommon | `theme` block with inheritance |

---

## Recommended Additions to APML v2.0

### Priority 1: State Machines (Critical)

```apml
state_machine <name>:
  initial_state: <state>
  states: [state_1, state_2, ...]

  transition <name>:
    from: <state> | [states] | * (any)
    to: <state>
    guard: <condition>
    action: <action_name>
    cooldown: <duration>
```

**Rationale:** Nearly every non-trivial app has state machines. The waterfall, payment flows, and auth flows in Zenjin all require this.

### Priority 2: Navigation Specification

```apml
navigation <app_name>:
  route <path>:
    component: <ComponentName>
    guards: [<guard_conditions>]
    params: { <name>: <type> }
    redirect_on_failure: <path>
    children: [<nested_routes>]
```

**Rationale:** Route guards and navigation logic are fundamental to SPAs. Currently impossible to specify.

### Priority 3: Computed Metrics

```apml
computed_metric <name>:
  source: <table> | <data_block>
  filter: <condition>
  formula: <mathematical_expression>
  refresh: on_change | interval(<duration>) | on_demand
```

**Rationale:** Analytics dashboards and derived fields are everywhere. Zenjin has FTC percentages, averages, aggregates.

### Priority 4: External Integrations

```apml
external_integration <name>:
  api: <api_identifier>

  flow <flow_name>:
    steps: [<ordered_steps>]
    timeout: <duration>
    retry: <count>
    on_failure: <action>

  webhook <event_name>:
    verify: <method>
    action: <action_name>
```

**Rationale:** Modern apps integrate with payments, auth providers, analytics services. Zenjin uses Stripe extensively.

### Priority 5: Animation/Transitions (Consideration)

```apml
animation <name>:
  trigger: <event>
  duration: <time>
  easing: <function>
  keyframes:
    0%: { <properties> }
    100%: { <properties> }
```

**Rationale:** UI polish matters. Celebration overlays, feedback glows, and transitions are throughout Zenjin. However, this may be better left to CSS/design systems.

---

## Conclusion

Zenjin Maths demonstrates both the strengths and limitations of APML v1.x. The language excels at:
- Data model specification
- Permission hierarchies
- High-level architecture description
- Trinity messaging patterns

But struggles with:
- Behavioral logic (state machines, algorithms)
- Navigation and routing
- External service integration
- Real-time and computed data

The 72% coverage estimate reflects that APML can describe *what* the system stores and *who* can access it, but not *how* it behaves dynamically. For APML v2.0 to be a true "single source of truth," it needs state machines, navigation specs, and integration patterns.

---

## Appendix: Files Analyzed

**Source Files:** 178 total
- `src/stores/`: 14 Pinia stores
- `src/views/`: 41 Vue components
- `src/components/`: 30+ reusable components
- `src/utils/`: 33 utility modules
- `src/universal/`: Learning engine components

**APML Files:** 36 total
- `specs/ZenjinMaths.apml`: Main spec (56KB)
- `specs/triple_helix_architecture.apml`: Algorithm spec
- `specs/SchoolSystemPermissions.apml`: Permission model
- `ZenjinUniversalInteractionSpecification.apml`: Interaction protocol
- Plus 32 supporting specs

**Key Insight:** This codebase is already APML-native, making it an ideal test case. The gaps identified are genuine limitations of APML v1.x, not artifacts of a poorly-specified system.
