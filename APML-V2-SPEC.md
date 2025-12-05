# APML v2.0 Specification

**Version**: 2.0.0-alpha.8
**Status**: Evolving through empirical discovery
**Last Updated**: 2025-12-05

---

## Overview

APML (AI Project Markup Language) is a specification language for expressing application intent in a way that:
1. Humans can read and validate
2. AI agents can parse and implement
3. Compilers can deterministically transform to code

This spec evolves through the Red/Blue battle process - real codebases challenge the language, and gaps are filled.

---

## Core Constructs

### Application Declaration

```apml
app ApplicationName:
  title: "Human-readable title"
  description: "What this application does"
  version: "1.0.0"
  apml_version: "2.0.0"
```

### Data Models

```apml
data ModelName:
  field_name: type modifiers
  another_field: type modifiers

  relationships:
    belongs_to: OtherModel
    has_many: OtherModel
```

**Primitive Types**:
- `text` - String values
- `number` - Numeric values (integer or decimal)
- `boolean` - true/false
- `date` - Date without time
- `timestamp` - Date with time
- `email` - Email address (validated)
- `url` - URL (validated)
- `unique_id` - UUID or auto-generated ID
- `money` - Currency value
- `percentage` - Percentage value

**Modifiers**:
- `required` - Field must have a value
- `optional` - Field may be null
- `default: value` - Default value if not provided
- `unique` - Value must be unique across records
- `auto` - Auto-generated (timestamps, IDs)
- `list` - Array of the type

**Collections**:
```apml
tags: list of text
items: list of ItemModel
```

### Interface Sections

```apml
interface section_name:
  show element_name:
    property: value

    when condition:
      show conditional_element

    for each item in collection:
      show repeated_element:
        data: item
```

**Display Elements**:
- `show` - Display a UI element
- `display` - Alias for show
- `hide` - Conditionally hide element

**Conditionals**:
```apml
if condition:
  show element_a
else:
  show element_b

when state equals "active":
  show active_indicator
```

**Iteration**:
```apml
for each item in items:
  show item_card:
    title: item.name
    description: item.description
```

### Computed Values

Computed values are reactive expressions that automatically update when their dependencies change. They are ideal for derived state, filtered lists, aggregates, and formatted values.

**Simple Syntax**:
```apml
computed property_name: expression
```

**Full Syntax**:
```apml
computed property_name:
  value: expression
  format: format_type
  cache: boolean
```

**Examples**:
```apml
# Simple computed - filtered lists
computed filtered_posts: posts.filter(p => p.category == selected_category)

# Simple computed - aggregates
computed total_likes: posts.sum(p => p.likes_count)

# With formatting - percentage
computed ftc_percentage:
  value: (correct_first_time / total_attempts) * 100
  format: percentage

# With formatting - currency
computed cost_estimate:
  value: tokens * rate_per_token
  format: currency

# With caching (for expensive calculations)
computed mastery_level:
  value: weighted_average(recent_scores, decay: 0.9)
  cache: true

# Multiple dependencies
computed user_display_name:
  value: user.first_name + " " + user.last_name
```

**Format Types**:
- `percentage` - Formats as percentage (e.g., 75.5%)
- `currency` - Formats as money (e.g., $10.50)
- `number` - Formatted number with locale-specific separators
- `date` - Formatted date
- `timestamp` - Formatted date and time
- `duration` - Formatted time duration (e.g., "2h 30m")

**Behavior**:
- **Auto-tracked dependencies**: Framework automatically detects which values the computed depends on
- **Lazy evaluation**: Only recomputed when accessed and dependencies changed
- **Cached by default**: Result is cached until dependencies change
- **Can be used anywhere**: In templates, other computed values, or logic blocks
- **Explicit caching**: Use `cache: true` to persist across multiple dependency changes (useful for expensive operations)

**Use Cases**:
- Filtering and sorting collections
- Calculating totals, averages, and statistics
- Formatting display values
- Combining multiple data sources
- Complex business logic that derives from state

### Logic Sections

```apml
logic section_name:

  process process_name:
    when trigger_condition:
      action_1
      action_2
      if condition:
        action_3

  calculate calculation_name:
    input: field_a, field_b
    return: field_a + field_b

  validate validation_name:
    check condition_1:
      error: "Error message if fails"
    check condition_2:
      error: "Another error message"
```

**Triggers**:
- `when user clicks element`
- `when user submits form`
- `when user types in field`
- `when data changes`
- `when page loads`
- `when timer expires`

**Actions**:
- `create ModelName with { field: value }`
- `update record with { field: value }`
- `delete record`
- `navigate to page`
- `show notification`
- `send email`
- `call api`

**Optimistic Updates**:
```apml
process action_name:
  when trigger:
    optimistic:
      # Immediate UI updates (applied before server call)
      state_update_1
      state_update_2

    # Server sync (happens after optimistic updates)
    call api endpoint_name with params

    # Automatic rollback on error
    on_error:
      rollback  # Reverts all optimistic updates
      show notification "Error message"

    # Optional: custom success handling
    on_success:
      show notification "Success message"
```

The `optimistic` block applies state changes immediately for instant UI feedback. If the subsequent API call fails, all optimistic changes are automatically reverted. This enables responsive UIs without manual rollback code.

### Integrations

```apml
integrations:

  api api_name:
    endpoint: "https://api.example.com"

    method get_data:
      path: "/data"
      method: GET
      returns: DataModel

    method post_data:
      path: "/data"
      method: POST
      body: DataModel
      returns: ResponseModel

  database:
    provider: supabase | postgres | mysql
    tables: [ModelName, OtherModel]

  auth:
    provider: supabase | auth0 | custom
    methods: [email, google, github]
```

### External Integrations

For third-party services and SDKs (authentication providers, payment processors, analytics, etc.):

```apml
external integration_name:
  type: auth_provider | payments | analytics | email | monitoring | storage | other
  sdk: "package_name"  # Optional: npm package for SDK-based integrations

  provides:
    - exposed_value_1
    - exposed_value_2
    - exposed_method

  on event_name:
    action_to_perform

  on event_name(data):
    action_with_data
```

**Integration Types**:
- `auth_provider` - Authentication/authorization services (Clerk, Auth0, Firebase Auth)
- `payments` - Payment processing (Stripe, PayPal, Square)
- `analytics` - Analytics and tracking (Mixpanel, Segment, Google Analytics)
- `email` - Email services (SendGrid, Mailgun, Postmark)
- `monitoring` - Error tracking and monitoring (Sentry, LogRocket)
- `storage` - File storage (S3, Cloudinary, Uploadcare)
- `other` - Custom or uncategorized integrations

**Properties**:
- `type` - Category of integration (required)
- `sdk` - NPM package name for SDK-based integrations (optional)
- `provides` - List of values, methods, or components exposed to the app (optional)
- `on event_name` - Event handlers for integration lifecycle events (optional)

**Example: Authentication Provider (SDK-based)**
```apml
external clerk:
  type: auth_provider
  sdk: "@clerk/vue"

  provides:
    - current_user
    - sign_in_flow
    - sign_out
    - user_button

  on auth_change(user):
    if user:
      sync user_profile to database
      navigate to "/dashboard"
    else:
      navigate to "/login"

  on session_created:
    track analytics_event "user_signed_in"
```

**Example: Payment Processing with Webhooks**
```apml
external stripe:
  type: payments
  sdk: "@stripe/stripe-js"

  provides:
    - checkout_session
    - payment_element

  webhook checkout_complete:
    verify: stripe_signature
    on event "checkout.session.completed":
      activate subscription for user
      send email "Welcome to Premium"
      track analytics_event "subscription_started"

  webhook payment_failed:
    verify: stripe_signature
    on event "payment_intent.payment_failed":
      notify user "Payment failed"
      downgrade subscription
```

**Example: Analytics Integration**
```apml
external mixpanel:
  type: analytics
  sdk: "mixpanel-browser"

  provides:
    - track_event
    - identify_user

  on app_loaded:
    identify_user with current_user.id

  on page_view:
    track_event "page_viewed" with { path: current_route }
```

**Webhook Handlers**:

Webhook handlers allow external services to push events to your application:

```apml
webhook webhook_name:
  verify: signature_type
  on event "event.name":
    action_to_perform
```

**Verification Types**:
- `stripe_signature` - Stripe webhook signature verification
- `github_signature` - GitHub webhook HMAC verification
- `hmac_sha256` - Generic HMAC SHA-256 verification
- `bearer_token` - Bearer token authentication
- `custom` - Custom verification logic

**Example: GitHub Webhooks**
```apml
external github:
  type: other

  webhook pull_request_events:
    verify: github_signature
    on event "pull_request.opened":
      notify team "New PR: " + event.pull_request.title
      assign reviewers from team.members

  webhook push_events:
    verify: github_signature
    on event "push":
      if event.ref == "refs/heads/main":
        trigger deployment
```

**Example: Custom Monitoring**
```apml
external sentry:
  type: monitoring
  sdk: "@sentry/vue"

  on error_captured(error):
    log error to console
    track user_context

  on app_crash:
    show error_boundary
    send notification to slack
```

### State Machines

For modeling discrete states with explicit transitions and guards:

```apml
state_machine machine_name:
  states: [state1, state2, state3]

  initial: state1

  transitions:
    from state1 to state2:
      when: condition
      action: what_to_do

    from state2 to state3:
      when: another_condition
      cooldown: duration
      action: what_to_do

    from state3 to state1:
      when: reset_condition
```

**State Declaration**:
- `states: [list]` - All possible states (required)
- `initial: state` - Starting state (required)

**Transitions**:
- `from X to Y:` - Explicit state transition
- `when: condition` - Guard condition (transition only fires if true)
- `action: what_to_do` - Side effects when transition occurs
- `cooldown: duration` - Minimum time before this transition can fire again

**Behavior**:
- Only one state is active at a time
- Transitions only occur when `when` condition is met
- If multiple transitions from current state have true conditions, first declared wins
- Invalid transitions (from states not in current state) are ignored
- Actions execute during the transition (after leaving old state, before entering new state)

**Example: Authentication Flow**
```apml
state_machine auth_flow:
  states: [anonymous, authenticating, authenticated, error]

  initial: anonymous

  transitions:
    from anonymous to authenticating:
      when: user clicks login_button
      action: show loading_spinner

    from authenticating to authenticated:
      when: auth_success
      action:
        hide loading_spinner
        redirect to dashboard
        show notification "Welcome back!"

    from authenticating to error:
      when: auth_failed
      action:
        hide loading_spinner
        show error_message
        log auth_error

    from error to anonymous:
      when: user clicks retry_button
      action: clear error_message

    from authenticated to anonymous:
      when: user clicks logout_button
      action:
        clear user_session
        redirect to home
```

**Example: Learning Progress (with Cooldown)**
```apml
state_machine question_mastery:
  states: [new, learning, familiar, practiced, mastered]

  initial: new

  transitions:
    from new to learning:
      when: correct_count >= 3
      action:
        celebrate "Starting to learn!"
        update progress_bar

    from learning to familiar:
      when: accuracy >= 0.7 and attempts >= 10
      cooldown: 24 hours
      action:
        celebrate "Getting familiar!"
        unlock next_question

    from familiar to practiced:
      when: consecutive_correct >= 5
      cooldown: 48 hours
      action: award badge "Practiced"

    from practiced to mastered:
      when: accuracy >= 0.9 and total_attempts >= 50
      cooldown: 7 days
      action:
        celebrate "Mastered!"
        add to mastered_count
        update leaderboard

    from mastered to practiced:
      when: accuracy < 0.8
      action: show notification "Needs review"
```

**Example: Post Publishing Workflow**
```apml
state_machine post_status:
  states: [draft, validating, publishing, published, failed]

  initial: draft

  transitions:
    from draft to validating:
      when: user clicks publish_button
      action:
        validate post_content
        check character_limit

    from validating to publishing:
      when: validation_passed
      action:
        show progress_indicator
        call api publish_post

    from validating to draft:
      when: validation_failed
      action: show validation_errors

    from publishing to published:
      when: api_success
      action:
        show notification "Post published!"
        redirect to post_page

    from publishing to failed:
      when: api_error
      action:
        show error_message
        log publish_error

    from failed to draft:
      when: user clicks edit_button
      action: clear error_message

    from published to draft:
      when: user clicks unpublish_button
      action:
        call api unpublish_post
        show notification "Post unpublished"
```

**Use Cases**:
- Authentication and authorization flows
- Multi-step forms and wizards
- Content publishing workflows (draft → review → published)
- Learning/mastery progression systems
- Payment processing (pending → processing → completed/failed)
- Game states (lobby → playing → ended)
- Connection states (disconnected → connecting → connected)

**Compiler Requirements**:
- Must validate that all referenced states are declared in `states` list
- Must ensure `initial` state exists in `states` list
- Must enforce single active state at runtime
- Should warn about unreachable states (no transitions leading to them)
- Must implement cooldown tracking with proper time comparison
- Should provide state change events for debugging/logging

### Real-time Connections

For persistent connections that push updates to the client (WebSocket, SSE, etc.):

```apml
realtime connection_name:
  url: "wss://api.example.com/ws"

  on_connected:
    action_to_perform

  on_disconnected:
    action_to_perform

  subscribe channel_name:
    on_message(event_data):
      action_with_event_data

  subscribe another_channel:
    filter: condition
    on_message(event):
      action_with_event

  heartbeat: duration
  reconnect_policy: strategy
```

**Connection Lifecycle**:
- `url` - WebSocket URL (wss:// or ws://)
- `on_connected` - Actions when connection established
- `on_disconnected` - Actions when connection lost

**Channel Subscriptions**:
- `subscribe channel_name` - Subscribe to a channel/topic
- `filter` - Optional condition to filter messages
- `on_message(data)` - Handler for incoming messages

**Connection Management**:
- `heartbeat: N seconds` - Keepalive interval
- `reconnect_policy` - How to handle reconnection
  - `exponential_backoff` - Exponential backoff strategy
  - `exponential_backoff(max: duration)` - With maximum delay
  - `fixed_interval(N seconds)` - Fixed retry interval
  - `none` - No automatic reconnection

**Example: Live Feed Updates**
```apml
realtime feed_stream:
  url: "wss://stream.x.com/timeline"

  on_connected:
    show connection_indicator
    sync pending_updates

  subscribe "home_timeline":
    on_message(new_post):
      prepend new_post to posts
      show new_posts_indicator
      play notification_sound

  subscribe "notifications":
    filter: notification.type in [mention, reply, like]
    on_message(notification):
      increment notification_badge
      show notification_toast

  heartbeat: 30 seconds
  reconnect_policy: exponential_backoff(max: 5 minutes)
```

**Example: Live Dashboard**
```apml
realtime dashboard_updates:
  url: "wss://api.example.com/ws"

  on_connected:
    set connection_status to "live"

  on_disconnected:
    set connection_status to "offline"
    show reconnecting_indicator

  subscribe "pipeline_updates":
    on_message(update):
      update pipeline_status with update
      refresh metrics

  reconnect_policy: exponential_backoff
```

**Example: Chat Application**
```apml
realtime chat_socket:
  url: "wss://chat.example.org/v1/websocket"

  on_connected:
    sync pending_messages
    mark user_status as "online"

  on_message(envelope):
    route envelope to message_processor
    decrypt envelope.content if envelope.encrypted
    append to conversation_thread

  on_disconnected:
    mark user_status as "offline"
    queue outgoing_messages for retry

  heartbeat: 30 seconds
  reconnect_policy: exponential_backoff(max: 5 minutes)
```

### Virtualized Lists

For rendering large or infinite lists efficiently by only rendering visible items:

```apml
show virtualized_list list_name:
  items: data_source
  item_height: estimated Npx
  overscan: N

  pagination:
    strategy: cursor | offset
    load_more: trigger_condition

  on scroll_near_end(threshold: percentage):
    action_to_load_more

  template item_template_name:
    # Template for rendering each item
    show element with item
```

**Core Properties**:
- `items` - Data source (array or computed collection)
- `item_height` - Estimated height of each item in pixels (for scroll calculations)
- `overscan` - Number of extra items to render above/below viewport (default: 3)

**Pagination**:
- `strategy` - How to paginate:
  - `cursor` - Cursor-based pagination (recommended for real-time feeds)
  - `offset` - Offset-based pagination (page number/limit)
- `load_more` - When to trigger loading:
  - `on_scroll_end` - Automatically when scrolled near end
  - `on_button_click` - Manual "Load More" button
  - `automatic` - Load immediately when threshold reached

**Scroll Events**:
- `on scroll_near_end(threshold: N%)` - Triggered when scrolled to N% of list
- `on scroll_top` - Triggered when scrolled to top (for pull-to-refresh)

**Alternative Syntax** (modifier-based):
```apml
show list:
  type: virtualized
  items: posts
  # ... rest of properties
```

**Example: Infinite Feed**
```apml
interface feed_view:

  show virtualized_list post_feed:
    items: posts
    item_height: estimated 120px
    overscan: 5

    pagination:
      strategy: cursor
      load_more: on_scroll_end

    on scroll_near_end(threshold: 80%):
      load_more_posts()

    template post_card:
      show card:
        avatar: post.author.avatar
        username: post.author.username
        content: post.text
        timestamp: post.created_at
        likes: post.likes_count

logic feed_logic:

  state:
    posts: list of Post
    cursor: text | null
    is_loading: boolean

  process load_more_posts:
    when triggered:
      if not is_loading:
        set is_loading to true

        call api fetch_posts with {
          cursor: cursor,
          limit: 20
        }

        on_success:
          append response.posts to posts
          set cursor to response.next_cursor
          set is_loading to false

        on_error:
          set is_loading to false
          show notification "Failed to load posts"
```

**Example: Chat Message List**
```apml
interface chat_view:

  show virtualized_list message_list:
    items: messages
    item_height: estimated 60px
    overscan: 10
    reverse_scroll: true  # Newest at bottom

    pagination:
      strategy: cursor
      load_more: on_scroll_top  # Load older when scrolling up

    on scroll_top:
      load_older_messages()

    template message_bubble:
      show bubble:
        position: message.is_mine ? "right" : "left"
        text: message.content
        timestamp: message.sent_at
```

**Example: Product Catalog**
```apml
interface catalog_view:

  computed filtered_products: products.filter(p => p.category == selected_category)

  show virtualized_list product_grid:
    items: filtered_products
    item_height: estimated 300px
    overscan: 3

    pagination:
      strategy: offset
      load_more: on_button_click  # Manual "Load More" button

    template product_card:
      show card:
        image: product.image_url
        title: product.name
        price: product.price
        rating: product.avg_rating

  show button load_more_button:
    text: "Load More Products"
    when: has_more_products
    on click:
      load_next_page()
```

**Behavior**:
- **Virtualization**: Only DOM elements for visible items (+ overscan) are rendered
- **Performance**: Handles lists of 1000s+ items without lag
- **Scroll position**: Maintained automatically during updates
- **Dynamic height**: If `item_height` is "estimated", actual heights measured after render
- **Reactive updates**: When `items` changes, list updates automatically
- **Prepend support**: New items can be prepended (e.g., new posts) without scroll jump

**Use Cases**:
- Social media feeds (infinite scroll)
- Chat message history
- Product catalogs with pagination
- Log viewers
- Search results
- News feeds
- Activity timelines

**Compiler Requirements**:
- Must implement virtual scrolling (render only visible items)
- Must track scroll position and calculate visible range
- Must handle dynamic item heights if not fixed
- Should implement efficient scroll event throttling
- Must support bidirectional loading (top/bottom)
- Should provide loading states and placeholders
- Must handle edge cases (empty lists, single item, rapid scrolling)

### Navigation

```apml
navigation:

  route /path:
    component: ComponentName
    guard: condition
    fallback: /redirect_path

  route /other-path:
    component: OtherComponent
    guards:
      - guard_condition_1
      - guard_condition_2
    on_guard_fail:
      custom_handler_action
```

**Route Declaration**:
- `route /path` - Define a route with a path pattern
- `component` - Component to render when route matches
- Path parameters supported: `/user/{id}`, `/post/{slug}`

**Single Guard**:
```apml
route /dashboard:
  guard: authenticated
  fallback: /login
```

**Multiple Guards**:
```apml
route /admin:
  guards:
    - authenticated
    - role in [admin, superadmin]
  fallback: /unauthorized
```

**Guard Conditions**:
- `authenticated` - User must be logged in
- `role in [list]` - User must have one of the specified roles
- `permission("name")` - User must have a specific permission
- `feature_flag("name")` - Feature flag must be enabled
- Custom expressions: `user.subscription == "premium"`

**Fallback Handling**:
- `fallback: /path` - Redirect to path if guard fails
- `on_guard_fail:` - Custom action when guard fails (alternative to fallback)

**Example: Authentication Required**
```apml
navigation:

  route /dashboard:
    component: Dashboard
    guard: authenticated
    fallback: /login

  route /profile:
    component: UserProfile
    guard: authenticated
    fallback: /login
```

**Example: Role-Based Access**
```apml
navigation:

  route /admin:
    component: AdminPanel
    guards:
      - authenticated
      - role in [admin, superadmin]
    fallback: /unauthorized

  route /moderator:
    component: ModeratorPanel
    guards:
      - authenticated
      - role in [moderator, admin]
    fallback: /home
```

**Example: Feature Flags**
```apml
navigation:

  route /beta-feature:
    component: BetaFeature
    guards:
      - authenticated
      - feature_flag("beta_enabled")
    fallback: /waitlist

  route /experimental:
    component: ExperimentalUI
    guard: feature_flag("new_ui") and user.opt_in == true
    fallback: /home
```

**Example: Custom Guard Handlers**
```apml
navigation:

  route /pipeline/{id}:
    component: PipelineView
    guards:
      - authenticated
      - permission("view_pipeline")
    on_guard_fail:
      log access_attempt with { user: current_user, route: current_route }
      show notification "You don't have permission to view this pipeline"
      redirect to "/pipelines"
```

**Example: Subscription-Based Access**
```apml
navigation:

  route /premium-content:
    component: PremiumContent
    guards:
      - authenticated
      - user.subscription in [premium, enterprise]
    on_guard_fail:
      show upgrade_modal
      track event "paywall_hit"
```

**Behavior**:
- **Evaluation order**: Guards evaluated in declaration order, stops at first failure
- **Async guards**: Guards can perform async checks (API calls, DB queries)
- **Navigation blocking**: Route navigation blocked until all guards pass
- **Automatic redirect**: If `fallback` specified, automatic redirect on guard failure
- **Custom handling**: `on_guard_fail` allows custom logic before/instead of redirect
- **Query preservation**: Failed navigation can preserve query params for return journey

**Use Cases**:
- Protecting authenticated routes
- Role-based access control (RBAC)
- Permission-based access control
- Feature flag gating
- Subscription-based content access
- Beta/experimental feature access
- Custom authorization logic

**Compiler Requirements**:
- Must evaluate guards before route navigation completes
- Must support async guard evaluation
- Should provide loading states during guard evaluation
- Must handle guard failures gracefully
- Should support route metadata for guards
- Must implement proper redirect with preserved context
- Should warn about unreachable routes (impossible guard combinations)

### Deployment

```apml
deploy:
  platform: vercel | netlify | railway
  environment:
    production:
      url: "https://app.example.com"
    staging:
      url: "https://staging.app.example.com"
```

---

## Trinity Principle

Every APML specification must cover all three message flows:

### 1. System-to-User
Everything the system shows to users:
- UI elements
- Feedback messages
- Progress indicators
- Error notifications
- Data displays

### 2. User-to-System
Everything users can do:
- Button clicks
- Form submissions
- Navigation
- Gestures
- Input

### 3. System-to-System
Internal operations:
- Business logic
- Data transformations
- API calls
- Database operations
- Background processes

**Validation**:
```apml
validate trinity_compliance:
  system_to_user: complete
  user_to_system: complete
  system_to_system: complete
```

---

## Variable Registry

All identifiers must be declared in a registry section:

```apml
registry:

  components:
    DashboardComponent:
      state:
        - selectedItem: ref<ItemModel | null>
        - isLoading: ref<boolean>
      computed:
        - itemCount: computed<number>
      methods:
        - selectItem(item: ItemModel): void
        - refreshData(): Promise<void>

  api_endpoints:
    - GET /api/items -> list of ItemModel
    - POST /api/items -> ItemModel
    - DELETE /api/items/:id -> void

  database_tables:
    - items: ItemModel
    - users: UserModel
```

---

## Extensions Log

As battles discover gaps, new constructs are added here:

### v2.0.0-alpha.8 (2025-12-05)
**Added: Navigation Guards (GAP-007)**

The `navigation` construct with guard support enables route protection based on authentication, roles, permissions, and feature flags. This pattern appeared in 2 out of 6 battles and is critical for access control in multi-user applications.

**Key Features**:
- `route /path` - Route declaration with path patterns
- `guard: condition` - Single guard condition
- `guards: [list]` - Multiple guard conditions (evaluated in order)
- `fallback: /path` - Automatic redirect on guard failure
- `on_guard_fail:` - Custom handler for guard failures
- Built-in guard types: `authenticated`, `role in [list]`, `permission("name")`, `feature_flag("name")`
- Custom guard expressions using state/computed values
- Path parameter support: `/user/{id}`, `/post/{slug}`

**Synthesis from Battles**:
- Zenjin: Authentication guards, role-based access (admin/superadmin), feature flag gating
- Popty: Permission-based pipeline access, custom guard failure handling

**Use Cases**:
- Protecting authenticated routes (dashboards, profiles)
- Role-based access control (admin panels, moderator tools)
- Permission-based access control (view/edit permissions)
- Feature flag gating (beta features, experimental UI)
- Subscription-based content access (premium/enterprise)
- Custom authorization logic with complex conditions

**Example - Authentication & Roles**:
```apml
navigation:

  route /dashboard:
    component: Dashboard
    guard: authenticated
    fallback: /login

  route /admin:
    component: AdminPanel
    guards:
      - authenticated
      - role in [admin, superadmin]
    fallback: /unauthorized
```

**Example - Feature Flags & Custom Handlers**:
```apml
navigation:

  route /beta-feature:
    component: BetaFeature
    guards:
      - authenticated
      - feature_flag("beta_enabled")
    fallback: /waitlist

  route /pipeline/{id}:
    component: PipelineView
    guards:
      - authenticated
      - permission("view_pipeline")
    on_guard_fail:
      log access_attempt
      show notification "Permission denied"
      redirect to "/pipelines"
```

**Behavior**:
- Guards evaluated in declaration order, stops at first failure
- Supports async guard evaluation (API calls, DB queries)
- Navigation blocked until all guards pass
- Automatic redirect with `fallback` or custom handling with `on_guard_fail`
- Query params can be preserved for return journey after authentication

**Compiler Requirements**:
- Must evaluate guards before route navigation completes
- Must support async guard evaluation
- Should provide loading states during guard evaluation
- Must handle guard failures gracefully with fallback or custom handlers
- Should support route metadata for guards
- Must implement proper redirect with preserved context
- Should warn about unreachable routes (impossible guard combinations)

### v2.0.0-alpha.7 (2025-12-05)
**Added: Virtualized Lists (GAP-005)**

The `virtualized_list` construct enables efficient rendering of large or infinite lists by only rendering visible items. This pattern is critical for social media feeds, chat applications, and any interface with potentially unbounded collections.

**Key Features**:
- `items` - Data source (array or computed collection)
- `item_height: estimated Npx` - For scroll position calculations
- `overscan: N` - Extra items to render above/below viewport (default: 3)
- Pagination strategies (`cursor` or `offset` based)
- Load triggers (`on_scroll_end`, `on_button_click`, `automatic`)
- Scroll event handlers (`on scroll_near_end`, `on scroll_top`)
- Item templates for rendering each item

**Synthesis from Battles**:
- X.com: Infinite scrolling feed with cursor-based pagination, prepending new posts, real-time updates

**Use Cases**:
- Social media feeds (infinite scroll)
- Chat message history (reverse scroll, load older on scroll top)
- Product catalogs with pagination
- Log viewers
- Search results
- News feeds
- Activity timelines

**Example - Infinite Social Feed**:
```apml
show virtualized_list post_feed:
  items: posts
  item_height: estimated 120px
  overscan: 5

  pagination:
    strategy: cursor
    load_more: on_scroll_end

  on scroll_near_end(threshold: 80%):
    load_more_posts()

  template post_card:
    show card:
      avatar: post.author.avatar
      username: post.author.username
      content: post.text
      likes: post.likes_count
```

**Example - Chat Messages (Reverse Scroll)**:
```apml
show virtualized_list message_list:
  items: messages
  item_height: estimated 60px
  overscan: 10
  reverse_scroll: true

  pagination:
    strategy: cursor
    load_more: on_scroll_top

  on scroll_top:
    load_older_messages()

  template message_bubble:
    show bubble:
      position: message.is_mine ? "right" : "left"
      text: message.content
```

**Compiler Requirements**:
- Must implement virtual scrolling (render only visible items + overscan)
- Must track scroll position and calculate visible range efficiently
- Must handle dynamic item heights if `item_height` is "estimated"
- Should implement scroll event throttling/debouncing
- Must support bidirectional loading (top/bottom)
- Should provide loading states and placeholders
- Must handle prepending new items without scroll jump
- Must handle edge cases (empty lists, single item, rapid scrolling)

### v2.0.0-alpha.6 (2025-12-05)
**Added: External Integrations (GAP-006)**

The `external` construct enables declarative integration with third-party services and SDKs. This pattern appeared in 4 out of 6 battles and is critical for modern applications that rely on external services for authentication, payments, analytics, and more.

**Key Features**:
- Type-based categorization (auth_provider, payments, analytics, etc.)
- SDK package reference with `sdk: "package_name"`
- Explicit `provides` list for exposed functionality
- Event handlers with `on event_name` for integration lifecycle
- Webhook handlers with `webhook name:` blocks
- Webhook signature verification with `verify: signature_type`
- Event-specific handlers with `on event "event.name"`

**Synthesis from Battles**:
- Alexander: Clerk authentication with auth change handlers, Supabase sync
- Zenjin: Stripe payments with webhook handlers for checkout completion
- Popty: Analytics tracking, error monitoring
- X.com: Analytics events, monitoring integrations

**Use Cases**:
- Authentication providers (Clerk, Auth0, Firebase Auth)
- Payment processing (Stripe, PayPal, Square)
- Analytics and tracking (Mixpanel, Segment, Google Analytics)
- Email services (SendGrid, Mailgun)
- Error monitoring (Sentry, LogRocket)
- File storage (S3, Cloudinary)
- Webhook receivers for external events

**Example - Auth Provider with Event Handling**:
```apml
external clerk:
  type: auth_provider
  sdk: "@clerk/vue"

  provides:
    - current_user
    - sign_in_flow
    - sign_out

  on auth_change(user):
    if user:
      sync user_profile to database
      navigate to "/dashboard"
    else:
      navigate to "/login"
```

**Example - Payment Processing with Webhooks**:
```apml
external stripe:
  type: payments
  sdk: "@stripe/stripe-js"

  provides:
    - checkout_session
    - payment_element

  webhook checkout_complete:
    verify: stripe_signature
    on event "checkout.session.completed":
      activate subscription for user
      send email "Welcome to Premium"
```

**Webhook Verification Types**:
- `stripe_signature` - Stripe webhook signature verification
- `github_signature` - GitHub webhook HMAC verification
- `hmac_sha256` - Generic HMAC SHA-256 verification
- `bearer_token` - Bearer token authentication
- `custom` - Custom verification logic

**Compiler Requirements**:
- Must resolve SDK packages and generate appropriate imports
- Must map `provides` values to framework-specific composables/hooks
- Must implement webhook endpoint generation with signature verification
- Should validate integration types and warn on unknown types
- Must handle event routing to appropriate handlers
- Should support both client-side SDK initialization and server-side webhook handling

### v2.0.0-alpha.5 (2025-12-05)
**Added: State Machines (GAP-002)**

The `state_machine` construct enables formal modeling of discrete states with explicit transitions, guards, and actions. This pattern appeared in 4 out of 6 battles and is fundamental for modeling workflows, authentication flows, and multi-step processes.

**Key Features**:
- Explicit state enumeration with `states: [list]`
- Required `initial: state` declaration
- Transition guards with `when: condition`
- Side effects with `action: what_to_do`
- Optional `cooldown: duration` to rate-limit transitions
- Single active state guarantee

**Synthesis from Battles**:
- Zenjin: Waterfall progression system (new → learning → mastered) with time-based cooldowns
- Alexander: Authentication flow (anonymous → authenticating → authenticated/error)
- Cowch: Gesture state tracking
- X.com: Post states (draft → posting → posted → failed)

**Use Cases**:
- Authentication and authorization flows
- Multi-step forms and wizards
- Content publishing workflows (draft → review → published)
- Learning/mastery progression systems
- Payment processing (pending → processing → completed/failed)
- Game states (lobby → playing → ended)
- Connection states (disconnected → connecting → connected)

**Example - Auth Flow**:
```apml
state_machine auth_flow:
  states: [anonymous, authenticating, authenticated, error]
  initial: anonymous

  transitions:
    from anonymous to authenticating:
      when: user clicks login_button
      action: show loading_spinner

    from authenticating to authenticated:
      when: auth_success
      action:
        redirect to dashboard
        show notification "Welcome back!"

    from authenticating to error:
      when: auth_failed
      action: show error_message
```

**Example - Learning Progression with Cooldowns**:
```apml
state_machine question_mastery:
  states: [new, learning, familiar, practiced, mastered]
  initial: new

  transitions:
    from learning to familiar:
      when: accuracy >= 0.7 and attempts >= 10
      cooldown: 24 hours
      action: celebrate "Getting familiar!"

    from practiced to mastered:
      when: accuracy >= 0.9 and total_attempts >= 50
      cooldown: 7 days
      action: update leaderboard
```

**Compiler Requirements**:
- Must validate all referenced states exist in `states` list
- Must ensure `initial` state is valid
- Must enforce single active state at runtime
- Should warn about unreachable states
- Must implement cooldown tracking with proper time comparison
- Should provide state change events for debugging

### v2.0.0-alpha.4 (2025-12-05)
**Added: Computed Values (GAP-004)**

The `computed` construct enables reactive, auto-updating derived values. This pattern appeared in all 6 battles and is fundamental for modern reactive applications.

**Key Features**:
- Simple syntax for basic expressions: `computed name: expression`
- Full syntax with formatting options
- Automatic dependency tracking (reactive)
- Lazy evaluation and caching
- Support for multiple format types (percentage, currency, date, etc.)
- Can be used in templates, logic blocks, and other computed values

**Synthesis from Battles**:
- Alexander: Filtered posts by category, aggregated totals
- Zenjin: FTC percentage, mastery level calculations with decay
- Popty: Cost estimates with rate awareness
- All battles: Need for derived state without manual updates

**Use Cases**:
- Filtering and sorting collections
- Calculating totals, averages, and statistics
- Formatting display values
- Combining multiple data sources
- Complex business logic that derives from state

**Example - Filtered Lists**:
```apml
# Automatically updates when posts or selected_category changes
computed filtered_posts: posts.filter(p => p.category == selected_category)

# Use in template
for each post in filtered_posts:
  show post_card with post
```

**Example - Formatted Metrics**:
```apml
computed ftc_percentage:
  value: (correct_first_time / total_attempts) * 100
  format: percentage
  # Displays as "87.5%" automatically

computed monthly_cost:
  value: tokens_used * rate_per_token
  format: currency
  # Displays as "$10.50" with proper locale formatting
```

**Example - Complex Calculations**:
```apml
computed mastery_level:
  value: weighted_average(recent_scores, decay: 0.9)
  cache: true  # Expensive calculation, cache aggressively
```

**Compiler Requirements**:
- Must implement automatic dependency tracking
- Must only recompute when dependencies change
- Should support all specified format types
- Must handle circular dependencies gracefully (error or warn)
- Should optimize for minimal recomputation

### v2.0.0-alpha.3 (2025-12-05)
**Added: Real-time Connections (GAP-001)**

The `realtime` construct enables persistent connections for live updates via WebSocket or similar protocols. This pattern is critical for modern web applications requiring real-time data synchronization.

**Key Features**:
- WebSocket URL configuration
- Connection lifecycle handlers (on_connected, on_disconnected)
- Channel/topic subscriptions with message handlers
- Message filtering within subscriptions
- Configurable heartbeat intervals
- Flexible reconnection policies (exponential backoff, fixed interval)

**Synthesis from Battles**:
- Popty: Dashboard pipeline updates via WebSocket
- X.com: Live feed updates, notifications streaming
- Signal: Chat message envelope routing, presence sync
- Zenjin: Real-time leaderboard updates

**Use Cases**:
- Social media feeds and notifications
- Chat and messaging applications
- Live dashboards and analytics
- Collaborative editing
- Gaming leaderboards and matchmaking
- IoT device monitoring

**Example - Social Media Feed**:
```apml
realtime feed_stream:
  url: "wss://stream.x.com/timeline"

  on_connected:
    show connection_indicator
    sync pending_updates

  subscribe "home_timeline":
    on_message(new_post):
      prepend new_post to posts
      show new_posts_indicator

  subscribe "notifications":
    filter: notification.type in [mention, reply]
    on_message(notification):
      increment notification_badge

  heartbeat: 30 seconds
  reconnect_policy: exponential_backoff(max: 5 minutes)
```

**Compiler Requirements**:
- Must establish and manage WebSocket connections
- Must handle automatic reconnection with specified policy
- Must track subscription state and route messages to handlers
- Should provide connection status indicators to UI layer
- Must implement heartbeat/keepalive mechanism
- Should handle graceful disconnection and cleanup

### v2.0.0-alpha.2 (2025-12-05)
**Added: Optimistic UI Pattern (GAP-003)**

The `optimistic` block enables instant user feedback for actions that require server synchronization. This pattern is critical for modern web applications where users expect immediate visual feedback.

**Key Features**:
- State changes in `optimistic` block apply immediately
- Subsequent API calls happen in background
- Automatic rollback on failure
- Optional success/error callbacks
- Works within `process` or `action` blocks

**Example - Social Media Like**:
```apml
logic post_interactions:

  process like_post:
    when user clicks like_button on post:
      optimistic:
        increment post.likes_count by 1
        set post.is_liked to true
        animate like_button with heart_pop

      call api like_post with { post_id: post.id }

      on_error:
        rollback
        show notification "Failed to like post"

      on_success:
        # Optional: sync with server response
        update post.likes_count with response.likes_count
```

**Example - E-commerce Add to Cart**:
```apml
logic shopping:

  process add_to_cart:
    when user clicks add_button on product:
      optimistic:
        append product to cart.items
        increment cart.item_count by 1
        update cart_badge with cart.item_count
        show notification "Added to cart"

      call api add_to_cart with {
        product_id: product.id,
        quantity: 1
      }

      on_error:
        rollback
        show notification "Failed to add item. Try again."
```

**Rollback Behavior**:
- `rollback` keyword reverts ALL state changes within the `optimistic` block
- Rollback is automatic - compiler tracks all optimistic mutations
- Custom rollback logic can be added after `rollback` keyword

**Compiler Requirements**:
- Must capture initial state before applying optimistic updates
- Must track all mutations within optimistic block
- Must provide atomic rollback mechanism
- Should debounce rapid successive optimistic actions

### v2.0.0-alpha.1 (2025-12-05)
- Initial spec based on APML v1.0
- Starting point for Red/Blue battles

---

## Gaps Discovered (To Be Filled)

This section tracks patterns that current APML cannot express. As battles progress, solutions will be added.

| Gap | Discovered By | Status | Proposed Solution |
|-----|---------------|--------|-------------------|
| (none yet) | - | - | - |

---

## Compilation Targets

APML should compile to:

- **TypeScript** - Types, interfaces, logic
- **Vue 3** - Components, composition API
- **React** - Components, hooks
- **SQL** - Database schemas, migrations
- **Vanilla JS** - For framework-free targets

The battle process will reveal which constructs are framework-agnostic (can compile to any target) vs framework-specific (need target-specific extensions).
