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
**Status:** 🔴 Open
**Appeared in:** Popty, Signal, X.com, Zenjin (4/6 battles)
**Severity:** CRITICAL

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

**Synthesis needed:** Combine these into unified `realtime` block.

---

### GAP-002: State Machines
**Status:** 🔴 Open
**Appeared in:** Alexander, Zenjin, Cowch, X.com (4/6 battles)
**Severity:** CRITICAL

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

**Synthesis needed:** Formalize `state_machine` block with guards, actions, cooldowns.

---

### GAP-003: Optimistic UI
**Status:** 🔴 Open
**Appeared in:** Cowch, Alexander, X.com (3/6 battles)
**Severity:** CRITICAL

**Problem:**
Modern UX expects instant feedback. When user likes a post, the heart fills immediately - don't wait for server. If server fails, rollback.

**Proposals from battles:**

**From X.com:**
```apml
process like_post:
  when user clicks like_button on post:
    # Optimistic update
    optimistic:
      increment post.likes_count by 1
      set post.is_liked to true

    # Server sync
    call api like_post with { post_id: post.id }

    # Rollback on error
    on_error:
      rollback
      show notification "Failed to like"
```

**Alternative syntax:**
```apml
action like_post:
  optimistic_update:
    post.likes_count += 1
    post.is_liked = true

  server_call:
    api.like_post(post.id)

  on_failure:
    revert optimistic_update
    toast "Couldn't like post"
```

**Synthesis needed:** Decide on `optimistic` block vs `optimistic_update` modifier.

---

### GAP-004: Computed/Reactive Values
**Status:** 🔴 Open
**Appeared in:** All 6 battles
**Severity:** CRITICAL

**Problem:**
Values that derive from other values (filtered lists, aggregates, formatted strings). APML has no `computed` construct.

**Proposals from battles:**

**From Alexander:**
```apml
computed filtered_posts:
  value: posts.filter(p => p.category == selected_category)

computed total_likes:
  value: posts.sum(p => p.likes_count)
```

**From Zenjin:**
```apml
computed_metric ftc_percentage:
  formula: (correct_first_time / total_attempts) * 100
  format: percentage

computed_metric mastery_level:
  formula: weighted_average(recent_scores, decay: 0.9)
```

**From Popty:**
```apml
computed cost_estimate:
  formula: tokens * rate_per_token
  @cost_aware  # flag for explicit approval
```

**Synthesis needed:** Unified `computed` with optional formatting/flags.

---

### GAP-005: Infinite Scroll/Virtualization
**Status:** 🔴 Open
**Appeared in:** X.com (1/6 battles, but critical for feeds)
**Severity:** CRITICAL for social/feed apps

**Problem:**
`for each` assumes all items render. Infinite feeds need virtualization (only render visible items) and pagination.

**Proposals from battles:**

**From X.com:**
```apml
show virtualized_list:
  items: posts
  item_height: estimated 120px
  overscan: 5

  on scroll_near_end(threshold: 80%):
    load_more_posts()

  for each visible_post in viewport:
    show post_card with visible_post
```

**Alternative:**
```apml
show feed:
  type: virtualized
  items: posts

  pagination:
    strategy: cursor
    load_more: on_scroll_end

  template post_card:
    # ... card content
```

**Synthesis needed:** Decide on explicit `virtualized_list` vs `type: virtualized` modifier.

---

### GAP-006: External Integrations
**Status:** 🔴 Open
**Appeared in:** Alexander, Zenjin, Popty, X.com (4/6 battles)
**Severity:** HIGH

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

**Synthesis needed:** Unified `external` or `integration` block with type-specific handling.

---

### GAP-007: Navigation Guards
**Status:** 🔴 Open
**Appeared in:** Popty, Zenjin (2/6 battles)
**Severity:** HIGH

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

**Synthesis needed:** Decide on inline guards vs separate guard definitions.

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
| - | - | (none yet) | - |
