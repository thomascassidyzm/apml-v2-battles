# APML v2.0 Specification

**Version**: 2.0.0-alpha.1
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
