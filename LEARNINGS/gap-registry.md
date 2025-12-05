# APML Gap Registry

**Purpose:** Single source of truth for all identified gaps and proposed solutions.

---

## Gap Status Legend
- 🔴 **Open** - No solution merged into spec
- 🟡 **Proposed** - Solution proposed, under review
- 🟢 **Merged** - Solution in APML-V2-SPEC.md
- ⚫ **Deferred** - Out of scope for v2.0

---

## Critical Gaps (Blocking X.com PWA)

### GAP-001: Real-time/WebSocket
**Status:** 🟢 Merged
**Appeared in:** Popty, Signal, X.com, Zenjin (4/6 battles)
**Severity:** CRITICAL
**Merged in:** APML v2.0.0-alpha.3

**Problem:**
APML's `call api` is request-response only. Modern apps need persistent connections for live updates (new posts, notifications, typing indicators).

**Proposals from battles:**

**From Popty:**
```apml
websocket dashboard_updates:
  url: "wss://api.example.com/ws"

  on message "pipeline_update":
    update pipeline_status

  on disconnect:
    reconnect with exponential_backoff
```

**From X.com:**
```apml
realtime feed_updates:
  connect: websocket "wss://stream.x.com"

  subscribe "home_timeline":
    on message(new_post):
      prepend new_post to posts
      show new_posts_indicator

  subscribe "notifications":
    on message(notification):
      increment notification_badge
```

**From Signal:**
```apml
realtime:
  connection chat_socket:
    url: "wss://chat.signal.org/v1/websocket"

    on_connected:
      sync pending_messages

    on_message(envelope):
      route to message_processor

    heartbeat: 30 seconds
    reconnect_policy: exponential_backoff(max: 5 minutes)
```

**Solution (Merged):**
Unified `realtime` construct with connection lifecycle handlers, channel subscriptions, message filtering, and configurable reconnection policies. See APML-V2-SPEC.md "Real-time Connections" section.

---

### GAP-002: State Machines
**Status:** 🟢 Merged
**Appeared in:** Alexander, Zenjin, Cowch, X.com (4/6 battles)
**Severity:** CRITICAL
**Merged in:** APML v2.0.0-alpha.5

**Problem:**
Many features have discrete states with transitions (auth flows, payment flows, content loading). APML has no formal state machine construct.

**Proposals from battles:**

**From Zenjin:**
```apml
state_machine waterfall_progression:
  states: [new, learning, familiar, practiced, mastered]

  initial: new

  transitions:
    from new to learning:
      when: correct_count >= 3
      action: celebrate("Starting to learn!")

    from learning to familiar:
      when: accuracy >= 0.7 and attempts >= 10
      cooldown: 24 hours
```

**From Alexander:**
```apml
state_machine auth_flow:
  states: [anonymous, authenticating, authenticated, error]

  transitions:
    from anonymous to authenticating:
      when: user_clicks_login

    from authenticating to authenticated:
      when: auth_success
      action: redirect_to_dashboard

    from authenticating to error:
      when: auth_failed
      action: show_error_message
```

**From X.com (implied):**
- Post states: draft → posting → posted → failed
- Notification states: unread → read
- Space states: scheduled → live → ended

**Solution (Merged):**
Added `state_machine` construct with explicit state declarations, transition guards, actions, and optional cooldowns. Supports authentication flows, multi-step processes, and time-gated progression systems. See APML-V2-SPEC.md "State Machines" section.

---

### GAP-003: Optimistic UI
**Status:** 🟢 Merged
**Appeared in:** Cowch, Alexander, X.com (3/6 battles)
**Severity:** CRITICAL

**Problem:**
Modern UX expects instant feedback. When user likes a post, the heart fills immediately - don't wait for server. If server fails, rollback.

**Merged Solution (v2.0.0-alpha.2):**
```apml
process action_name:
  when trigger:
    optimistic:
      # Immediate UI updates
      state_update_1
      state_update_2

    call api endpoint_name with params

    on_error:
      rollback  # Automatic revert
      show notification "Error message"

    on_success:
      show notification "Success message"
```

**Key Decisions:**
- Used `optimistic` block (cleaner than `optimistic_update`)
- Automatic rollback via `rollback` keyword
- Works within `process` or `action` blocks
- Compiler must track all mutations for atomic rollback
- Optional `on_success` and `on_error` callbacks

**See:** APML-V2-SPEC.md v2.0.0-alpha.2 Extensions Log

---

### GAP-004: Computed/Reactive Values
**Status:** 🟢 Merged
**Appeared in:** All 6 battles
**Severity:** CRITICAL
**Merged in:** APML-V2-SPEC.md v2.0.0-alpha.4

**Problem:**
Values that derive from other values (filtered lists, aggregates, formatted strings). APML has no `computed` construct.

**Solution:**
Added `computed` construct with two syntaxes:
- Simple: `computed name: expression`
- Full: `computed name: { value: expr, format: type, cache: bool }`

Supports automatic dependency tracking, lazy evaluation, caching, and multiple format types (percentage, currency, number, date, timestamp, duration).

**See:** APML-V2-SPEC.md v2.0.0-alpha.4 Extensions Log

---

### GAP-005: Infinite Scroll/Virtualization
**Status:** 🟢 Merged
**Appeared in:** X.com (1/6 battles, but critical for feeds)
**Severity:** CRITICAL for social/feed apps
**Merged in:** APML v2.0.0-alpha.7

**Problem:**
`for each` assumes all items render. Infinite feeds need virtualization (only render visible items) and pagination.

**Solution (Merged):**
Unified `virtualized_list` construct with:
- `show virtualized_list` (primary syntax)
- `show list: type: virtualized` (alternative modifier-based syntax)
- `items: data_source` for data binding
- `item_height: estimated Npx` for scroll calculations
- `overscan: N` for extra rendering buffer
- `pagination:` block with `strategy: cursor|offset` and `load_more: trigger`
- `on scroll_near_end(threshold: %)` for load triggers
- `on scroll_top` for reverse loading (chat history)
- `template item_name:` for item rendering
- Support for `reverse_scroll` for chat-style lists
- Automatic scroll position maintenance
- Prepend support without scroll jump

**See:** APML-V2-SPEC.md v2.0.0-alpha.7 Extensions Log

---

### GAP-006: External Integrations
**Status:** 🟢 Merged
**Appeared in:** Alexander, Zenjin, Popty, X.com (4/6 battles)
**Severity:** HIGH
**Merged in:** APML v2.0.0-alpha.6

**Problem:**
Real apps integrate with Stripe, Clerk, analytics, etc. APML has `integrations.api` but no patterns for OAuth, webhooks, SDKs.

**Proposals from battles:**

**From Alexander:**
```apml
external_integration clerk:
  type: auth_provider
  sdk: "@clerk/vue"

  provides:
    - current_user
    - sign_in_flow
    - sign_out

  on auth_change:
    sync user_profile to supabase
```

**From Zenjin:**
```apml
external_integration stripe:
  type: payments

  webhook checkout_complete:
    verify: stripe_signature
    on event "checkout.session.completed":
      activate subscription for user
```

**Solution (Merged):**
Unified `external` construct with type categorization (auth_provider, payments, analytics, email, monitoring, storage, other), SDK package references, explicit `provides` list, event handlers with `on event_name`, and webhook handlers with signature verification. See APML-V2-SPEC.md "External Integrations" section.

---

### GAP-007: Navigation Guards
**Status:** 🟢 Merged
**Appeared in:** Popty, Zenjin (2/6 battles)
**Severity:** HIGH
**Merged in:** APML v2.0.0-alpha.8

**Problem:**
Routes need protection (auth required, role required, feature flags). APML has `navigation` but no guards.

**Proposals from battles:**

**From Zenjin:**
```apml
navigation:
  route /dashboard:
    guard: authenticated
    fallback: /login

  route /admin:
    guard: role in [admin, superadmin]
    fallback: /unauthorized

  route /beta-feature:
    guard: feature_flag("beta_enabled")
    fallback: /waitlist
```

**From Popty:**
```apml
routes:
  /pipeline/{id}:
    component: PipelineView
    guards:
      - require_auth
      - require_permission("view_pipeline")
    on_guard_fail: redirect("/login")
```

**Solution (Merged):**
Unified `navigation` construct with inline guard support. Supports both single `guard:` and multiple `guards: [list]` syntax. Built-in guard types include `authenticated`, `role in [list]`, `permission("name")`, and `feature_flag("name")`. Provides both `fallback: /path` for automatic redirects and `on_guard_fail:` for custom handlers. See APML-V2-SPEC.md "Navigation" section.

---

## Warning-Level Gaps

### GAP-008: Gestures
**Status:** 🟡 Lower priority
**Appeared in:** Cowch, X.com (2/6 battles)

**Problem:**
Pull-to-refresh, swipe actions, long-press menus. Touch interactions beyond tap.

**Proposal from Cowch:**
```apml
gesture pull_to_refresh:
  direction: down
  threshold: 80px
  action: refresh_feed
  feedback: show_spinner

gesture swipe_left on post_card:
  action: quick_reply

gesture long_press on post_card:
  action: show_context_menu
```

---

### GAP-009: Animations/Transitions
**Status:** 🟡 Lower priority
**Appeared in:** Cowch, Zenjin (2/6 battles)

**Problem:**
Celebration overlays, loading skeletons, transition effects.

**Proposal from Zenjin:**
```apml
animation celebrate:
  type: confetti
  duration: 2s
  trigger: on_level_up

transition page_enter:
  type: fade_slide
  duration: 300ms
```

**Decision needed:** Is this in scope, or defer to CSS/framework?

---

### GAP-010: PWA Constructs
**Status:** 🔴 Open
**Appeared in:** X.com (1/6 but critical for web-first strategy)

**Problem:**
Service workers, caching, offline, push notifications, install prompts.

**Proposal from X.com:**
```apml
pwa:
  manifest:
    name: "X"
    display: standalone
    theme_color: "#000000"

  service_worker:
    cache_strategy:
      static_assets: cache_first
      api_calls: network_first

  push_notifications:
    topics: [mentions, likes, dms]

  offline:
    fallback: "/offline.html"
    queue_actions: [post, like, bookmark]
```

---

## Deferred (Out of Scope for v2.0)

### GAP-D01: Native Mobile
**Status:** ⚫ Deferred
**Appeared in:** Signal

Lifecycle, permissions, biometrics, push (native), background processing. These require platform-specific constructs. Web-first strategy means PWA covers mobile use cases.

### GAP-D02: E2E Encryption
**Status:** ⚫ Deferred
**Appeared in:** Signal

Cryptographic operations are implementation details, not declarative specs. Apps needing E2E should use external libraries.

---

## Merge Log

| Date | Gap | Solution | Spec Version |
|------|-----|----------|--------------|
| 2025-12-05 | GAP-007 | Navigation guards with `route` declarations, single/multiple guards, `fallback` and `on_guard_fail` handlers, built-in guard types | v2.0.0-alpha.8 |
| 2025-12-05 | GAP-005 | Virtualized lists with `virtualized_list` construct, pagination strategies, scroll event handlers, item templates | v2.0.0-alpha.7 |
| 2025-12-05 | GAP-006 | External integrations with `external` construct, SDK references, event handlers, webhook support with signature verification | v2.0.0-alpha.6 |
| 2025-12-05 | GAP-002 | State machines with explicit states, transitions, guards, actions, and cooldowns | v2.0.0-alpha.5 |
| 2025-12-05 | GAP-004 | Computed/reactive values with `computed` construct, auto-tracking, formatting, caching | v2.0.0-alpha.4 |
| 2025-12-05 | GAP-001 | Real-time connections with `realtime` block, WebSocket support, subscriptions, reconnection policies | v2.0.0-alpha.3 |
| 2025-12-05 | GAP-003 | Optimistic UI with `optimistic` block, automatic rollback, success/error callbacks | v2.0.0-alpha.2 |
