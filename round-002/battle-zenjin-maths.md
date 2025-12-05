# APML Battle Round 002: Zenjin Maths

## Mission
You are an APML validation agent. Your task is to analyze the Zenjin Maths codebase and determine how well APML v1.x can describe this application.

## Repository
- **Source Repo:** thomascassidyzm/zenjin-maths-apml-v1 (clone this to analyze)
- **Battle Reports Repo:** thomascassidyzm/apml-v2-battles (push your report here)
- **Stack:** Vue 3, TypeScript, Vite, Supabase
- **Domain:** Mathematics learning app with spaced repetition and gamification

## Your Tasks

### Phase 1: Exploration
1. Clone and explore the codebase structure
2. Identify all major features and user flows
3. Document the tech stack and patterns used

### Phase 2: APML Coverage Analysis
For each major feature, attempt to describe it in APML v1.x:
- What can be fully described?
- What requires workarounds or extensions?
- What is completely impossible to express?

### Phase 3: Gap Documentation
Create a detailed gap analysis:
- List each gap with severity (critical/warning/suggestion)
- Propose specific APML syntax extensions for each gap
- Prioritize by how common the pattern is

### Phase 4: Battle Report
Create `APML-BATTLE-REPORT-002-ZENJIN.md` with:
1. Executive summary
2. Coverage percentage estimate
3. Full gap list with proposals
4. Unique patterns this codebase surfaced
5. Recommended additions to APML v2.0

## Key Areas to Investigate
- Spaced repetition algorithm (SuperMemo/Anki-style?)
- Progress tracking and persistence
- Gamification (points, streaks, levels)
- Content delivery (questions, explanations)
- Offline support
- Analytics and learning insights

## Constraints
- Work in branch: `claude/apml-zenjin-validation-{session_id}`
- Commit frequently with clear messages
- Push when complete
- Do NOT modify the main branch

## Success Criteria
- Thorough analysis of 80%+ of codebase
- Concrete syntax proposals (not just "needs improvement")
- Battle report committed and pushed
