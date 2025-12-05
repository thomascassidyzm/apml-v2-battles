# APML Battle Round 002: X.com PWA

## Mission
You are an APML validation agent. Your task is to describe the X.com (Twitter) PWA using ONLY observation and publicly available information - no codebase access. This tests APML as a pure specification language.

## Target
- **URL:** https://x.com (mobile PWA experience)
- **Battle Reports Repo:** thomascassidyzm/apml-v2-battles (push your report here)
- **Stack:** Unknown (React-based, likely)
- **Domain:** Social media with real-time updates
- **NOTE:** No codebase access - this is intentional. Analyze from usage only.

## Your Tasks

### Phase 1: Feature Discovery
Use the X.com PWA extensively and document:
1. All major screens and navigation patterns
2. All user interactions and gestures
3. Real-time update behaviors
4. Offline capabilities
5. PWA-specific features (install prompt, notifications)

### Phase 2: APML Specification Attempt
For each major feature, write APML that SHOULD describe it:
- Write the ideal APML specification
- Note where current APML v1.x syntax falls short
- Propose extensions where needed

### Phase 3: Gap Documentation
Create a detailed gap analysis:
- List each gap with severity (critical/warning/suggestion)
- Propose specific APML syntax extensions
- Focus on patterns unique to social/real-time apps

### Phase 4: Battle Report
Create `APML-BATTLE-REPORT-002-X-PWA.md` with:
1. Executive summary
2. Coverage percentage estimate (for the specification attempt)
3. Full gap list with proposals
4. Patterns unique to social media / real-time apps
5. PWA-specific patterns APML should support
6. Recommended additions to APML v2.0

## Key Areas to Investigate

### Core Feed
- Infinite scroll with virtualization
- Pull-to-refresh
- "New posts" indicator while scrolling
- For You vs Following algorithm toggle
- Tweet rendering (text, media, polls, quotes, threads)

### Interactions
- Like/retweet/bookmark with optimistic UI
- Quote tweet and reply flows
- Share sheet (copy link, DM, external)
- Long-press context menus

### Compose
- Tweet composer with character count
- Media upload (images, video, GIF picker)
- Poll creation
- Thread creation
- Draft saving
- Scheduled tweets

### Real-time
- Live notification count updates
- New tweet indicators
- Typing indicators in DMs
- Spaces (live audio rooms)

### Media
- Image galleries with zoom/swipe
- Video player with quality selection
- Audio spaces with speaker queue

### Profile & Settings
- Profile editing
- Privacy controls
- Notification preferences
- Theme/display settings

### PWA Features
- Install prompt
- Push notifications
- Offline behavior
- Add to home screen

## Constraints
- NO codebase access - observation only
- Work in branch: `claude/apml-x-pwa-validation-{session_id}`
- You may use web search to understand X.com features
- Commit battle report when complete

## Success Criteria
- Comprehensive feature documentation from observation
- APML specifications that capture user-facing behavior
- Clear identification of real-time/social patterns
- Proposals for PWA-specific APML extensions
- Battle report with actionable recommendations

## Note
This battle intentionally has no codebase. The goal is to test whether APML can work as a specification language for apps you don't have source access to. If APML can describe X.com from behavior alone, it's a strong validation of the language design.
