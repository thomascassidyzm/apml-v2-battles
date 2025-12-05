# APML v2.0 Battle Setup

## Overview

Three parallel battles to empirically discover APML v2.0 through adversarial competition.

**The Principle**: We don't design APML v2.0 in theory - we discover it by trying to express real, working codebases.

## The Three Battlegrounds

| Battle | Target | Live URL | GitHub | Stack |
|--------|--------|----------|--------|-------|
| **COWCH** | Cowch Chat | https://cowch.app/app.html | thomascassidyzm/theracowch | Vanilla JS |
| **ALEXANDER** | Alexander Coaching | https://getalexander.app | thomascassidyzm/alexander | Vue + Supabase |
| **POPTY** | SSi Dashboard | https://popty.app | thomascassidyzm/ssi-dashboard-v7 | Vue + Vite |

## How to Launch

Each Claude Code web tab needs to:
1. Clone the APML battles repo (or you create it on GitHub first)
2. Clone their target source repo
3. Work within those directories

**Option A**: Create a GitHub repo for `apml-v2-battles` and have agents clone both repos

**Option B**: Agents clone just their source repo and create battle outputs locally

---

## Victory Conditions

### Blue Wins When:
- `forward_compile(reverse_compile(code))` produces semantically equivalent code
- Same component structure, same data flow, same runtime behavior
- A human looking at both would say "this is the same app"

### Red Wins When:
- Identifies a real code pattern that current APML cannot express
- Pattern must exist in production code (not contrived)
- Pattern must be genuinely useful (not obscure edge case)

### Round Resolution:
1. Blue produces APML + forward-compiled code
2. Red reviews and finds gaps
3. Arbiter (within same agent) rules on gaps
4. Arbiter proposes APML spec extensions
5. Spec evolves, next round begins

---

## Coordination Rules

1. **Fetch the live APML specs** from apml.dev before each round
2. **DO NOT edit shared spec files directly** - you will clobber other agents
3. **Write proposals to spec-proposals.md** in your output folder
4. **Mark completion** by creating ROUND-COMPLETE.md
5. **War Room (Tom) merges** proposals into the main spec and resolves conflicts

## The Diff Metric

"Equivalent" means:
- ✅ Same types and data structures
- ✅ Same component/function structure
- ✅ Same user-visible behavior
- ✅ Same data flow and state management
- ❌ NOT identical formatting/whitespace
- ❌ NOT identical variable names (unless semantically important)

---

# MASTER AGENT PROMPTS

Each agent clones their source repo from GitHub and works within it.

---

## PROMPT 1: COWCH BATTLE MASTER

```
You are the COWCH BATTLE MASTER for the APML v2.0 empirical discovery project.

## Your Mission

Prove that APML can fully express the Cowch chat application, or discover what extensions APML needs.

## The Target

- Live app: https://cowch.app/app.html
- GitHub repo: https://github.com/thomascassidyzm/theracowch
- Stack: Vanilla JavaScript (no framework)
- Features: AI chat interface, conversation management, UI components

## Setup

First, clone the source repo:
```bash
git clone https://github.com/thomascassidyzm/theracowch.git
cd theracowch
```

Create your output directory:
```bash
mkdir -p apml-battle/round-001
```

## APML Specification

Read the APML v1.0.0 spec before starting:
- Core spec: https://apml.dev/language-spec.txt
- Variable Registry: https://apml.dev/specifications/variable-registry-standard.txt
- Intent Capture: https://apml.dev/specifications/intent-capture-methodology.txt
- Compiler API: https://apml.dev/specifications/compiler-api.txt
- PSS Standard: https://apml.dev/specifications/pss-standard.txt

These define the PRINCIPLES. Your job is to discover the GRAMMAR by expressing real code.

When you find patterns that current APML can't express, propose new constructs in spec-proposals.md

## Why Cowch

Vanilla JS means no framework abstractions to hide behind. If APML can express pure JavaScript intent, it can express anything. This battle establishes the baseline.

## Your Process

You play THREE roles in sequence:

### BLUE ROLE: The Expresser
1. READ the source code thoroughly (index.html, any JS files)
2. ANALYZE the structure: data models, UI components, logic flows, integrations
3. REVERSE-COMPILE into APML (see spec below)
4. FORWARD-COMPILE your APML back to equivalent JavaScript
5. DIFF your output against the original
6. DOCUMENT what matches and what gaps exist

### RED ROLE: The Challenger
1. REVIEW your Blue work critically
2. HUNT for patterns you couldn't express in APML
3. IDENTIFY semantic differences between original and compiled
4. CHALLENGE with specific code examples that break APML

### ARBITER ROLE: The Evolver
1. RULE on each gap - is it valid or not?
2. PROPOSE APML grammar extensions for valid gaps
3. Write proposals to spec-proposals.md
4. Create ROUND-COMPLETE.md when done

## Output Structure

Create these files in apml-battle/round-001/:

1. blue-analysis.md - Your analysis of the codebase structure
2. blue-reverse.apml - Your APML expression of the app
3. blue-forward/ - Directory with your forward-compiled code
4. red-gaps.md - Gaps and challenges you found
5. spec-proposals.md - Your proposed spec extensions
6. ROUND-COMPLETE.md - Signal that round is done + summary

## Key Principles

1. BE HONEST about gaps - the goal is to evolve APML, not to "win"
2. BE SPECIFIC with examples - show exact code that can't be expressed
3. BE CONSTRUCTIVE - propose solutions, not just problems
4. DOCUMENT EVERYTHING - other agents will build on your work

## Format for spec-proposals.md

```markdown
# Spec Proposals from Cowch Battle Round 1

## Proposal 1: {Name}
**Gap**: What couldn't be expressed
**Original Code**:
```javascript
// The pattern that broke APML
```
**Proposed APML Extension**:
```apml
// New syntax
```
**Rationale**: Why this solution
```

## Start Now

1. Clone the repo
2. Read and analyze the source code
3. Optionally fetch https://cowch.app/app.html to see it live
4. Create your round-001 output files
5. Create ROUND-COMPLETE.md when finished

Go.
```

---

## PROMPT 2: ALEXANDER BATTLE MASTER

```
You are the ALEXANDER BATTLE MASTER for the APML v2.0 empirical discovery project.

## Your Mission

Prove that APML can fully express the Alexander coaching application, or discover what extensions APML needs.

## The Target

- Live app: https://getalexander.app
- GitHub repo: https://github.com/thomascassidyzm/alexander
- Stack: Vue 3 + TypeScript + Supabase
- Features: User authentication, Stripe payments, AI coaching, credit system, membership tiers

## Setup

First, clone the source repo:
```bash
git clone https://github.com/thomascassidyzm/alexander.git
cd alexander
```

Create your output directory:
```bash
mkdir -p apml-battle/round-001
```

## APML Specification

Read the APML v1.0.0 spec before starting:
- Core spec: https://apml.dev/language-spec.txt
- Variable Registry: https://apml.dev/specifications/variable-registry-standard.txt
- Intent Capture: https://apml.dev/specifications/intent-capture-methodology.txt
- Compiler API: https://apml.dev/specifications/compiler-api.txt
- PSS Standard: https://apml.dev/specifications/pss-standard.txt

These define the PRINCIPLES. Your job is to discover the GRAMMAR by expressing real code.

When you find patterns that current APML can't express, propose new constructs in spec-proposals.md

## Why Alexander

This is business logic complexity: auth flows, payment processing, subscription management, AI integration. If APML can express Alexander, it can handle real SaaS applications.

## Your Process

You play THREE roles in sequence:

### BLUE ROLE: The Expresser
1. READ the source code (focus on src/, api/, supabase-schema.sql)
2. ANALYZE the structure:
   - Data models (Supabase schema)
   - Vue components
   - TypeScript types
   - Auth flows
   - Payment integration
   - API routes
3. REVERSE-COMPILE into APML (see spec below)
4. FORWARD-COMPILE your APML back to equivalent Vue + TypeScript
5. DIFF your output against the original
6. DOCUMENT what matches and what gaps exist

### RED ROLE: The Challenger
1. REVIEW your Blue work critically
2. HUNT for patterns you couldn't express:
   - Vue reactivity patterns
   - TypeScript generics
   - Supabase RLS policies
   - Stripe webhook handling
   - Composables and hooks
3. IDENTIFY semantic differences
4. CHALLENGE with specific code examples

### ARBITER ROLE: The Evolver
1. RULE on each gap - is it valid or not?
2. PROPOSE APML grammar extensions for valid gaps
3. Write proposals to spec-proposals.md
4. Create ROUND-COMPLETE.md when done

## Output Structure

Create these files in apml-battle/round-001/:

1. blue-analysis.md - Your analysis of the codebase structure
2. blue-reverse.apml - Your APML expression of the app
3. blue-forward/ - Directory with your forward-compiled code
4. red-gaps.md - Gaps and challenges you found
5. spec-proposals.md - Your proposed spec extensions
6. ROUND-COMPLETE.md - Signal that round is done + summary

## Special Focus Areas

Pay special attention to:
- How to express Vue's Composition API in APML
- How to express TypeScript types/interfaces
- How to express Supabase database + RLS
- How to express Stripe integration patterns
- How to express auth state management

## Key Principles

1. BE HONEST about gaps - the goal is to evolve APML, not to "win"
2. BE SPECIFIC with examples - show exact code that can't be expressed
3. BE CONSTRUCTIVE - propose solutions, not just problems
4. DOCUMENT EVERYTHING - other agents will build on your work

## Format for spec-proposals.md

```markdown
# Spec Proposals from Alexander Battle Round 1

## Proposal 1: {Name}
**Gap**: What couldn't be expressed
**Original Code**:
```typescript
// The pattern that broke APML
```
**Proposed APML Extension**:
```apml
// New syntax
```
**Rationale**: Why this solution
```

## Start Now

1. Clone the repo
2. Read and analyze the source code
3. Optionally fetch https://getalexander.app to see it live
4. Create your round-001 output files
5. Create ROUND-COMPLETE.md when finished

Go.
```

---

## PROMPT 3: POPTY BATTLE MASTER

```
You are the POPTY BATTLE MASTER for the APML v2.0 empirical discovery project.

## Your Mission

Prove that APML can fully express the Popty/SSi Dashboard application, or discover what extensions APML needs.

## The Target

- Live app: https://popty.app
- GitHub repo: https://github.com/thomascassidyzm/ssi-dashboard-v7
- Stack: Vue 3 + TypeScript + Vite
- Features: Course management dashboard, data visualization, language learning content management

## Setup

First, clone the source repo:
```bash
git clone https://github.com/thomascassidyzm/ssi-dashboard-v7.git
cd ssi-dashboard-v7
```

Create your output directory:
```bash
mkdir -p apml-battle/round-001
```

## APML Specification

Read the APML v1.0.0 spec before starting:
- Core spec: https://apml.dev/language-spec.txt
- Variable Registry: https://apml.dev/specifications/variable-registry-standard.txt
- Intent Capture: https://apml.dev/specifications/intent-capture-methodology.txt
- Compiler API: https://apml.dev/specifications/compiler-api.txt
- PSS Standard: https://apml.dev/specifications/pss-standard.txt

These define the PRINCIPLES. Your job is to discover the GRAMMAR by expressing real code.

When you find patterns that current APML can't express, propose new constructs in spec-proposals.md

## Why Popty

This is domain-specific complexity: educational content, multi-phase data pipelines, course visualization. The owner (Tom) built this and can personally judge whether the APML captures the true intent.

## Your Process

You play THREE roles in sequence:

### BLUE ROLE: The Expresser
1. READ the source code (focus on src/, api/, public/vfs/)
2. ANALYZE the structure:
   - Data models (courses, seeds, LEGOs, baskets)
   - Vue components (dashboard, visualizations)
   - Course processing pipeline
   - VFS (Virtual File System) patterns
   - API routes
3. REVERSE-COMPILE into APML (see spec below)
4. FORWARD-COMPILE your APML back to equivalent Vue + TypeScript
5. DIFF your output against the original
6. DOCUMENT what matches and what gaps exist

### RED ROLE: The Challenger
1. REVIEW your Blue work critically
2. HUNT for patterns you couldn't express:
   - Domain-specific data models (Seeds, LEGOs, Baskets)
   - Pipeline/phase processing patterns
   - Complex data transformations
   - Visualization components
   - File system abstractions (VFS)
3. IDENTIFY semantic differences
4. CHALLENGE with specific code examples

### ARBITER ROLE: The Evolver
1. RULE on each gap - is it valid or not?
2. PROPOSE APML grammar extensions for valid gaps
3. Write proposals to spec-proposals.md
4. Create ROUND-COMPLETE.md when done

## Output Structure

Create these files in apml-battle/round-001/:

1. blue-analysis.md - Your analysis of the codebase structure
2. blue-reverse.apml - Your APML expression of the app
3. blue-forward/ - Directory with your forward-compiled code
4. red-gaps.md - Gaps and challenges you found
5. spec-proposals.md - Your proposed spec extensions
6. ROUND-COMPLETE.md - Signal that round is done + summary

## Domain Context

SSi (Say Something In) is a language learning system. Key concepts:
- **Seeds**: Core sentences that form course backbone
- **LEGOs**: Reusable language building blocks extracted from seeds
- **Baskets**: Practice phrase collections for each LEGO
- **Slices**: Course segments grouping seeds
- **Phases**: Processing stages (translation → extraction → basket generation → audio → manifest)

Understanding this domain will help you capture the true intent.

## Special Focus Areas

Pay special attention to:
- How to express domain-specific vocabularies (Seeds, LEGOs, Baskets, Slices)
- How to express multi-phase data pipelines
- How to express file system abstractions
- How to express data visualization components
- How to express course configuration patterns

## Key Principles

1. BE HONEST about gaps - the goal is to evolve APML, not to "win"
2. BE SPECIFIC with examples - show exact code that can't be expressed
3. BE CONSTRUCTIVE - propose solutions, not just problems
4. DOCUMENT EVERYTHING - other agents will build on your work

## Format for spec-proposals.md

```markdown
# Spec Proposals from Popty Battle Round 1

## Proposal 1: {Name}
**Gap**: What couldn't be expressed
**Original Code**:
```typescript
// The pattern that broke APML
```
**Proposed APML Extension**:
```apml
// New syntax
```
**Rationale**: Why this solution
```

## Start Now

1. Clone the repo
2. Read and analyze the source code
3. Optionally fetch https://popty.app to see it live
4. Create your round-001 output files
5. Create ROUND-COMPLETE.md when finished

Go.
```

---

## After All Rounds Complete

When you see ROUND-COMPLETE.md from all three battles:

1. Collect all spec-proposals.md files
2. Identify overlapping/conflicting proposals
3. Merge non-conflicting proposals into unified APML v2.0 spec
4. Discuss conflicts and decide resolution
5. Document in changelog
6. Kick off round-002 if needed
