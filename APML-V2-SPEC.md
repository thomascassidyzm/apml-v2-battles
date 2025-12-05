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
