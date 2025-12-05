# APML Battle Round 002: Signal

## Mission
You are an APML validation agent. Your task is to analyze the Signal messaging app (open source) and determine how well APML v1.x can describe a native mobile application.

## Repository
- **iOS:** https://github.com/nicedream2/Signal-iOS
- **Android:** https://github.com/nicedream2/Signal-Android
- **Note:** Use the iOS repo as primary (Swift is more readable for analysis)
- **Stack:** Swift/UIKit (iOS), Kotlin (Android)
- **Domain:** Secure messaging with E2E encryption

## Your Tasks

### Phase 1: Exploration
1. Clone the Signal-iOS repository
2. Understand the app architecture
3. Identify all major features and user flows
4. Note patterns specific to native mobile development

### Phase 2: APML Coverage Analysis
For each major feature, attempt to describe it in APML v1.x:
- What can be fully described?
- What requires workarounds or extensions?
- What is completely impossible to express?
- What patterns are native-mobile-specific?

### Phase 3: Gap Documentation
Create a detailed gap analysis:
- List each gap with severity (critical/warning/suggestion)
- Propose specific APML syntax extensions for each gap
- Note which gaps are mobile-specific vs. universal

### Phase 4: Battle Report
Create `APML-BATTLE-REPORT-002-SIGNAL.md` with:
1. Executive summary
2. Coverage percentage estimate
3. Full gap list with proposals
4. Native mobile patterns that APML doesn't address
5. Recommended additions to APML v2.0

## Key Areas to Investigate
- E2E encryption (Signal Protocol)
- Real-time messaging (WebSocket/push)
- Contact sync and permissions
- Media handling (photos, voice notes, video)
- Group chats and admin controls
- Disappearing messages
- Notification handling
- Background sync
- Local database (SQLite/Core Data)
- Biometric authentication

## Constraints
- Work in branch: `claude/apml-signal-validation-{session_id}`
- Create a local working directory for analysis
- Commit battle report when complete
- Focus on architectural patterns, not implementation details

## Success Criteria
- Clear understanding of native mobile patterns
- Identify what APML would need to support mobile apps
- Concrete syntax proposals for mobile-specific features
- Battle report with actionable recommendations
