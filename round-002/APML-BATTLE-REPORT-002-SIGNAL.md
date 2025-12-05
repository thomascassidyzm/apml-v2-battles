# APML Battle Report 002: Signal iOS

**Battle Date:** 2025-12-05
**Target Application:** Signal iOS (signalapp/Signal-iOS)
**APML Version Tested:** v2.0.0-alpha.1
**Analyst:** Claude (Opus 4)

---

## Executive Summary

Signal iOS represents one of the most challenging validation targets for APML due to its unique combination of:
- Native mobile platform requirements (iOS-specific APIs)
- End-to-end encryption with the Signal Protocol
- Real-time bidirectional communication (WebSocket)
- Complex multi-device synchronization
- Background processing and app extensions

**Verdict:** APML v1.x/v2.0 can describe approximately **25-35%** of Signal's functionality. The specification fundamentally lacks constructs for native mobile development, real-time communication, cryptographic operations, and offline-first architectures. This represents a significant category of applications that APML cannot currently target.

---

## Coverage Analysis

### What APML CAN Express

| Feature | Coverage | Notes |
|---------|----------|-------|
| Basic Data Models | Partial | Can define Message, Contact, Thread structures |
| User Settings UI | High | Settings screens map well to interface sections |
| Form Validation | High | Phone number validation, profile editing |
| Navigation Flows | Partial | Basic screen-to-screen navigation |
| Simple API Calls | Partial | REST-like API requests |
| CRUD Operations | Partial | Local data operations (with limitations) |

**Example of what works:**

```apml
data Contact:
  id: unique_id auto
  phoneNumber: text required
  displayName: text optional
  profileImageUrl: url optional
  lastSeen: timestamp optional
  isBlocked: boolean default: false

interface contact_profile:
  show avatar:
    image: contact.profileImageUrl
    fallback: initials(contact.displayName)

  show name_field:
    value: contact.displayName

  when contact.isBlocked:
    show unblock_button:
      action: unblock_contact
```

### What APML CANNOT Express

The majority of Signal's functionality falls outside APML's current capabilities. Below is a categorized analysis.

---

## Gap Analysis

### CRITICAL Gaps (Fundamental Blockers)

These gaps prevent APML from describing the core architecture of native mobile apps.

#### Gap 1: App Lifecycle Management
**Severity:** CRITICAL
**Category:** Mobile-Specific
**Location:** `Signal/AppLaunch/AppDelegate.swift`

APML has no concept of application states (foreground, background, suspended, terminated) which are fundamental to mobile development.

**Signal's Implementation:**
```swift
func applicationDidBecomeActive(_ application: UIApplication) {
    // Resume connections, clear notifications, refresh data
}

func applicationWillResignActive(_ application: UIApplication) {
    // Save state, suspend connections
}

func applicationDidEnterBackground(_ application: UIApplication) {
    // Persist critical data, schedule background tasks
}
```

**Proposed APML Syntax:**
```apml
lifecycle:
  on_foreground:
    resume websocket_connection
    refresh unread_count
    clear notifications

  on_background:
    save pending_messages
    suspend websocket_connection
    schedule background_sync after: 15 minutes

  on_terminate:
    persist local_state
    flush logs
```

---

#### Gap 2: App Extensions
**Severity:** CRITICAL
**Category:** Mobile-Specific
**Location:** `SignalNSE/`, `SignalShareExtension/`

Signal uses multiple iOS app extensions that run in separate processes:
- **Notification Service Extension (NSE):** Decrypts and displays incoming messages
- **Share Extension:** Allows sharing content from other apps to Signal

APML cannot express multi-process architectures or extension points.

**Proposed APML Syntax:**
```apml
extensions:
  notification_service "SignalNSE":
    on_notification_received(payload):
      decrypt payload using session_key
      if payload.type == "call":
        trigger incoming_call_ui
      else:
        show notification:
          title: payload.sender_name
          body: payload.preview

  share_extension "SignalShare":
    accepts: [image, video, text, url]
    on_content_shared(items):
      navigate to recipient_picker
      attach items to draft_message
```

---

#### Gap 3: Push Notifications (APNs)
**Severity:** CRITICAL
**Category:** Mobile-Specific
**Location:** `SignalServiceKit/Notifications/`

Push notifications require device registration with platform services (APNs for iOS), background wake mechanisms, and special handling for VoIP calls.

**Signal's Implementation:**
- Registers push token with Signal servers
- Uses VoIP push for calls (must be answered within 30s or CallKit terminates)
- Notification Service Extension decrypts message content
- Silent push triggers background sync

**Proposed APML Syntax:**
```apml
notifications:
  platform: apns

  register:
    on_token_received(token):
      send token to server_endpoint

  channels:
    messages:
      priority: high
      sound: "message.caf"
      badge: increment

    calls:
      type: voip
      priority: critical
      requires: immediate_display

    silent:
      priority: low
      triggers: background_sync
```

---

#### Gap 4: Persistent Connections (WebSocket)
**Severity:** CRITICAL
**Category:** Real-Time Communication
**Location:** `SignalServiceKit/Network/OWSChatConnection.swift`

Signal maintains persistent WebSocket connections for real-time message delivery. APML's `call api` is request-response only.

**Signal's Implementation:**
```swift
public class OWSChatConnection {
    enum State { case closed, connecting, open }

    // Handles reconnection, heartbeats, message routing
    // Manages identified vs unidentified (sealed sender) connections
}
```

**Proposed APML Syntax:**
```apml
realtime:
  connection chat_socket:
    url: "wss://chat.signal.org/v1/websocket"
    auth: identified | unidentified

    on_connected:
      sync pending_messages

    on_message(envelope):
      route to message_processor

    on_disconnected:
      if app.state == foreground:
        reconnect with: exponential_backoff
      else:
        wait_for_push

    heartbeat: 30 seconds
    reconnect_policy: exponential_backoff(max: 5 minutes)
```

---

#### Gap 5: Biometric Authentication
**Severity:** CRITICAL
**Category:** Mobile-Specific
**Location:** `SignalServiceKit/LocalDeviceAuth/LocalDeviceAuthentication.swift`

Signal uses Face ID/Touch ID for screen lock and sensitive operations. APML's `auth` section doesn't cover device-level biometrics.

**Signal's Implementation:**
```swift
func performBiometricAuth() async -> AuthSuccess? {
    let context = LAContext()
    let canEvaluate = context.canEvaluatePolicy(.deviceOwnerAuthentication)
    // Falls back to device passcode if biometrics unavailable
}
```

**Proposed APML Syntax:**
```apml
auth:
  local_device:
    methods: [biometric, passcode]

    protect screen_lock:
      required_after: 5 minutes inactive
      fallback: passcode

    protect payment_send:
      required: always
      biometric_only: true

    on_lockout:
      show lockout_message
      require: passcode_only
```

---

#### Gap 6: Device Permissions
**Severity:** CRITICAL
**Category:** Mobile-Specific
**Location:** Various (Contacts, Camera, Microphone, Photos)

Native apps must request and handle platform permissions. Signal requires:
- Contacts (for discovery)
- Camera/Microphone (for calls)
- Photo Library (for attachments)
- Notifications

**Proposed APML Syntax:**
```apml
permissions:
  contacts:
    purpose: "Signal uses your contacts to find friends who also use Signal"
    required_for: [contact_discovery, contact_sync]
    on_denied:
      show manual_entry_option

  camera:
    purpose: "Take photos and videos to share"
    required_for: [video_call, capture_media]
    on_denied:
      disable video_call_button

  microphone:
    purpose: "Record voice messages and make calls"
    required_for: [voice_call, voice_message]

  notifications:
    purpose: "Get notified when you receive messages"
    categories: [messages, calls]
```

---

#### Gap 7: Offline-First Architecture
**Severity:** CRITICAL
**Category:** Architecture Pattern
**Location:** `SignalServiceKit/Storage/Database/`

Signal operates fully offline with local-first data storage. Messages are stored locally in an encrypted SQLite database and synced when connectivity returns.

**Proposed APML Syntax:**
```apml
storage:
  strategy: offline_first

  local_database:
    provider: sqlite
    encryption: sqlcipher
    key_derivation: from_master_key

    sync_policy:
      on_connectivity_restored:
        push local_changes
        pull remote_changes
      conflict_resolution: last_write_wins | merge

    tables: [Message, Thread, Contact, Attachment]
```

---

#### Gap 8: End-to-End Encryption
**Severity:** CRITICAL
**Category:** Security
**Location:** `SignalServiceKit/Cryptography/`, `SignalServiceKit/Messages/OWSMessageDecrypter.swift`

Signal's core value proposition is E2E encryption using the Signal Protocol. This involves:
- Key exchange (X3DH)
- Session management (Double Ratchet)
- Sealed sender (sender privacy)
- Sender key distribution (for groups)

APML has no constructs for cryptographic operations.

**Proposed APML Syntax:**
```apml
encryption:
  protocol: signal_protocol

  key_management:
    identity_key: generate on_registration
    signed_prekey: rotate every: 30 days
    one_time_prekeys: replenish when: count < 10

  message_encryption:
    for direct_message:
      use: double_ratchet
      sealed_sender: when_profile_shared

    for group_message:
      use: sender_key
      distribute_key: on_membership_change
```

---

#### Gap 9: Background Processing & Job Queues
**Severity:** CRITICAL
**Category:** Mobile-Specific
**Location:** `SignalServiceKit/Jobs/`

Signal uses persistent job queues for reliable message sending, contact sync, and other operations that must survive app termination.

**Signal's Implementation:**
```swift
class MessageSenderJobQueue {
    // Persists jobs to database
    // Retries with exponential backoff
    // Handles partial failures in group sends
}
```

**Proposed APML Syntax:**
```apml
jobs:
  queue message_send:
    persistence: database
    retry_policy: exponential_backoff(max: 24 hours)

    on_failure:
      after attempts: 3:
        mark_as_failed
        notify_user

    on_network_restored:
      resume pending_jobs

  scheduled contact_sync:
    interval: daily
    requires: background_permission
    network: wifi_preferred
```

---

### WARNING Gaps (Complex Features)

#### Gap 10: Voice/Video Calling (WebRTC)
**Severity:** WARNING
**Category:** Real-Time Communication
**Location:** `SignalServiceKit/Calls/`, uses RingRTC (WebRTC wrapper)

**Proposed APML Syntax:**
```apml
calling:
  protocol: webrtc
  signaling: via websocket

  call_types:
    audio: supported
    video: supported
    group: max_participants: 40

  ice_servers:
    - type: turn
      url: "turn.signal.org"
      credentials: dynamic

  on_incoming_call:
    show system_call_ui  # CallKit on iOS
    play ringtone: "ring.caf"
```

---

#### Gap 11: Disappearing Messages
**Severity:** WARNING
**Category:** Data Lifecycle
**Location:** `SignalServiceKit/DisappearingMessagesConfiguration/`

**Proposed APML Syntax:**
```apml
data Message:
  # ... fields ...

  expiration:
    trigger: on_read | on_send
    duration: configurable(5 seconds to 4 weeks)

    on_expire:
      delete local_copy
      delete media_attachments
      notify: none  # silent deletion
```

---

#### Gap 12: Multi-Device Sync
**Severity:** WARNING
**Category:** Architecture Pattern
**Location:** `SignalServiceKit/Messages/DeviceSyncing/`

Signal syncs data across linked devices (phone + desktop). This requires:
- Device linking protocol
- Message sync
- Contact/group sync
- Configuration sync

**Proposed APML Syntax:**
```apml
multi_device:
  primary_device: phone

  sync_types:
    messages:
      direction: bidirectional
      encryption: per_device_key

    contacts:
      source: primary_only
      push_to: linked_devices

    settings:
      conflict: primary_wins

  device_linking:
    method: qr_code
    requires: biometric_auth
    max_linked: 5
```

---

#### Gap 13: Media Handling
**Severity:** WARNING
**Category:** Mobile-Specific
**Location:** `SignalServiceKit/Messages/Attachments/`

Signal handles complex media operations:
- Image/video compression
- Thumbnail generation
- Streaming playback
- Voice note recording
- Attachment encryption

**Proposed APML Syntax:**
```apml
media:
  attachments:
    max_size: 100 MB

    image:
      compression: jpeg(quality: 85)
      max_dimensions: 4096x4096
      generate_thumbnail: 256x256

    video:
      compression: h264
      max_duration: 5 minutes
      streaming: supported

    voice_note:
      format: aac
      max_duration: 30 minutes
      waveform: generate
```

---

#### Gap 14: Reactions & Emoji
**Severity:** SUGGESTION
**Category:** UI Pattern
**Location:** `SignalServiceKit/Messages/Reactions/`

**Proposed APML Syntax:**
```apml
data Reaction:
  target: ref<Message>
  emoji: emoji required  # new type
  author: ref<Contact>
  timestamp: timestamp auto

interface message_bubble:
  show reactions_bar:
    for each reaction in message.reactions:
      show emoji: reaction.emoji
      count: reactions.count(where: emoji == reaction.emoji)

  action long_press:
    show reaction_picker:
      options: recent_emoji + all_emoji
```

---

#### Gap 15: Typing Indicators & Presence
**Severity:** SUGGESTION
**Category:** Real-Time Communication
**Location:** `SignalServiceKit/Messages/TypingIndicatorMessage.swift`

**Proposed APML Syntax:**
```apml
presence:
  typing_indicator:
    send: on_input_change
    debounce: 3 seconds
    expires_after: 15 seconds

  online_status:
    share: with_contacts_only
    show: last_seen | online_now | hidden
```

---

## Native Mobile Patterns Not Addressed

### 1. Platform UI Integration
- **Haptic Feedback:** Long-press, success/failure feedback
- **3D Touch / Context Menus:** Quick actions
- **Drag and Drop:** Multi-image selection
- **System Share Sheet:** Sharing content externally
- **Quick Actions (Home Screen):** 3D touch shortcuts

### 2. Platform Services
- **Siri/Shortcuts Integration:** "Send message to John"
- **Spotlight Search:** Finding conversations
- **iCloud Keychain:** (Signal uses its own key storage)
- **CallKit:** System call UI integration
- **CarPlay:** (Not currently supported by Signal)

### 3. Performance Patterns
- **Memory Management:** Caching strategies, image downsampling
- **Battery Optimization:** Background refresh budgets
- **Network Efficiency:** Request batching, compression
- **Launch Performance:** Lazy loading, cold start optimization

---

## Recommended APML v2.0 Additions

### Tier 1: Essential for Mobile Apps

1. **`lifecycle` block** - App state management
2. **`permissions` block** - Platform permission handling
3. **`notifications` block** - Push notification configuration
4. **`realtime` block** - WebSocket/persistent connections
5. **`storage.offline_first`** - Local-first data strategy
6. **`auth.local_device`** - Biometric authentication

### Tier 2: Important for Signal-like Apps

7. **`encryption` block** - E2E encryption primitives
8. **`jobs` block** - Background job queues
9. **`extensions` block** - App extensions
10. **`calling` block** - WebRTC configuration
11. **`multi_device` block** - Device sync

### Tier 3: Enhanced Functionality

12. **`media` block** - Media processing configuration
13. **`presence` block** - Typing indicators, online status
14. **`expiration` modifier** - Disappearing data
15. **`emoji` type** - Native emoji handling

---

## Conclusion

Signal iOS reveals that APML's current web-first design is fundamentally incompatible with native mobile development. The specification would need substantial additions to describe even the basic architecture of a mobile app, let alone the sophisticated security and real-time features that Signal requires.

**Key Insights:**

1. **Mobile apps are not "web apps on a phone"** - They have fundamentally different lifecycle, permission, and background processing models.

2. **Real-time communication requires first-class support** - Request-response APIs cannot express WebSocket, WebRTC, or push notification patterns.

3. **Security cannot be bolted on** - E2E encryption affects every layer of the application and needs native APML constructs.

4. **Offline-first is a paradigm shift** - APML assumes server-authoritative data; Signal assumes local-authoritative with eventual consistency.

### Recommendation

APML v2.0 should consider whether to:
1. **Expand scope** to include native mobile with new construct categories
2. **Create APML-Mobile** as a separate specification that extends core APML
3. **Acknowledge boundaries** and explicitly exclude native mobile apps from APML's target domain

The third option may be pragmatic in the short term, but limits APML's applicability significantly as mobile continues to dominate application development.

---

## Appendix: Signal-iOS Architecture Overview

```
Signal-iOS/
├── Signal/                    # Main iOS app target
│   ├── AppLaunch/            # AppDelegate, app lifecycle
│   ├── ConversationView/     # Main chat UI (~900KB)
│   ├── Registration/         # Phone verification flow
│   ├── Calls/                # Call UI
│   └── Settings/             # User preferences
├── SignalServiceKit/          # Core business logic (framework)
│   ├── Cryptography/         # Encryption primitives
│   ├── Messages/             # Message handling (~800KB)
│   ├── Network/              # WebSocket, API clients
│   ├── Storage/              # GRDB database
│   ├── Calls/                # Call signaling
│   └── Jobs/                 # Background job queues
├── SignalUI/                  # Shared UI components
├── SignalNSE/                 # Notification Service Extension
└── SignalShareExtension/      # Share extension
```

**Total Swift files analyzed:** ~1,500
**Estimated lines of code:** ~300,000
**External dependencies:** LibSignalClient, RingRTC, GRDB, and more

---

*Report generated as part of APML v2.0 validation battles*
