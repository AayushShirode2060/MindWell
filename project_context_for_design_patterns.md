# MindWell — Digital Mental Health & Psychological Support System
## Complete Project Context for Software Design Pattern Assignments

---

## 1. Project Overview

**MindWell** is a full-stack web application designed to provide accessible, stigma-free mental health support to students in higher education. It combines AI-driven psychological first-aid, real-time peer support, professional counselling workflows, gamified therapeutic activities, and admin analytics into a single platform.

**Problem Statement:** Students in higher education face rising mental health challenges (anxiety, depression, academic stress) but lack accessible, confidential, and immediate support systems. Traditional counselling services suffer from long wait times, social stigma, and limited availability.

**Solution:** MindWell bridges this gap through:
- An AI chatbot for 24/7 psychological first-aid
- Confidential appointment booking with professional counsellors
- Peer support via trained volunteers
- Gamified therapeutic mini-games
- Psychoeducational resource library
- Anonymous community forums
- Admin analytics dashboard for institutional oversight

---

## 2. Technology Stack

### Frontend (Client)
| Technology | Purpose |
|---|---|
| **React 18** (Vite) | UI library / build tool |
| **React Router v6** | Client-side routing with nested layouts |
| **Axios** | HTTP client with interceptors for JWT |
| **Socket.IO Client** | Real-time bidirectional chat |
| **Recharts** | Data visualization (admin graphs) |
| **CSS3 (Vanilla)** | Custom styling, glassmorphism, animations |
| **React Context API** | Global state management (AuthContext) |

### Backend (Server)
| Technology | Purpose |
|---|---|
| **Node.js + Express 5** | REST API server |
| **MongoDB + Mongoose 9** | NoSQL database & ODM |
| **Socket.IO 4** | WebSocket server for real-time chat |
| **JWT (jsonwebtoken)** | Stateless authentication tokens |
| **bcryptjs** | Password hashing (12 salt rounds) |
| **Nodemailer** | Email notifications (SMTP) |
| **Twilio** | WhatsApp notifications for crisis alerts |
| **Cloudinary + Multer** | File uploads (admin proof documents) |
| **Google Generative AI (Gemini 2.5 Flash)** | AI chatbot response generation |

### ML Service (Python)
| Technology | Purpose |
|---|---|
| **Flask** | REST microservice |
| **scikit-learn (joblib)** | ML model inference |
| **TF-IDF Vectorizer** | Text feature extraction |
| **Custom Mood Classifier** | Detects: anxiety, sadness, anger, stress, insomnia, crisis, neutral |
| **Severity Scorer** | Rates distress 1-5 scale |

### Architecture Pattern
```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  React SPA   │────▶│  Express API │────▶│   MongoDB    │
│  (Port 5173) │     │  (Port 5000) │     │  (Atlas)     │
└──────┬───────┘     └──────┬───────┘     └──────────────┘
       │                    │
       │ Socket.IO          │ HTTP
       │                    ▼
       │              ┌──────────────┐
       └─────────────▶│  Flask ML    │
                      │  (Port 5001) │
                      └──────────────┘
```
- **3-Tier Architecture**: Client → Server → Database
- **Microservice**: Separate Python ML service for mood classification
- **Event-Driven**: Socket.IO for real-time messaging

---

## 3. User Roles & Their Features

The system has **5 distinct user roles**, each with role-based access control (RBAC) enforced on both frontend (ProtectedRoute component) and backend (roleCheck middleware).

---

### 3.1 STUDENT (Default Role)

> Primary user of the system. Any registered student gets this role by default.

#### Features & Tasks:

| # | Feature | Description | Key Functions |
|---|---------|-------------|---------------|
| 1 | **Student Dashboard** | Overview page with quick access to all features | View mood summary, recent activity, quick links |
| 2 | **AI Chatbot** | 24/7 mental health support chatbot powered by Gemini AI + ML mood classification | `sendMessage()` — sends message to AI, gets mood-aware response; `getChatHistory()` — retrieves past conversations; `clearChat()` — resets conversation |
| 3 | **Mood Tracker** | Daily mood logging with activities and sleep tracking | `createMoodEntry()` — log mood (great/good/okay/low/terrible), activities (exercise, study, social, etc.), sleep hours, optional notes; `getMoodHistory()` — view historical mood data with charts |
| 4 | **Mental Health Screening** | Standardized clinical screening questionnaires | `submitScreening()` — take PHQ-9 (depression) or GAD-7 (anxiety) assessment; `getMyScreenings()` — view past screening results with severity ratings (Minimal → Severe) |
| 5 | **Book Appointments** | Schedule sessions with counsellors | `getCounsellors()` — browse available counsellors; `getAvailableSlots()` — check counsellor availability; `createAppointment()` — book session (chat/audio/video); `emergencyBooking()` — priority booking for crisis; Pre-session form (feeling, issue type, urgency); Anonymous booking option; `submitFeedback()` — rate session 1-5 stars |
| 6 | **Session Chat** | Real-time chat during counselling sessions | Socket.IO-based live messaging with counsellor during appointments; Typing indicators; Read receipts |
| 7 | **Community Forum** | Anonymous peer support space | `createPost()` — post anonymously with tags; `upvotePost()` — support others' posts; `replyToPost()` — respond to posts; `flagPost()` — report inappropriate content |
| 8 | **Resource Library** | Psychoeducational content hub | `getAllResources()` — browse articles, guides, videos, toolkits, helplines; `toggleBookmark()` — save for later; `getRecommendations()` — mood-based suggestions; Search and filter by category/tag |
| 9 | **Therapeutic Games** | 15 gamified mental wellness activities | Play games: Breathing Bubble, Bubble Pop, Memory Tiles, Zen Drawing, Gratitude Growth, Color Match Calm, Wave Touch, Thought Catcher, Rhythm Tap, Sliding Puzzle, Grow Tree, Focus Dot, Thought Release, Pattern Tracing, Loop Relaxer; `saveSession()` — track game play duration + feedback; `getRecommendation()` — AI suggests game based on mood; Streak tracking |
| 10 | **Peer Support (Help Request)** | Request help from trained volunteers | `createHelpRequest()` — submit request with issue type + urgency; Real-time chat with assigned volunteer; Receive notification when volunteer accepts |
| 11 | **Audio Therapy** | Binaural beats and solfeggio frequencies | Mood-detected frequency recommendations (432Hz, 528Hz, Delta, Alpha waves); Custom hook `useAudioTherapy` |
| 12 | **Notifications** | Receive system announcements | View announcements, alerts, tips from admin; Mark as read |
| 13 | **Profile Management** | Update personal info | `updateProfile()` — edit name, phone, department, enrollment number |

---

### 3.2 COUNSELLOR

> Licensed mental health professional. Requires admin approval after registration.

#### Features & Tasks:

| # | Feature | Description | Key Functions |
|---|---------|-------------|---------------|
| 1 | **Counsellor Dashboard** | Comprehensive overview with stats and activity | View today's appointments, pending referrals, active sessions count; Student history lookup; Performance statistics (total sessions, completion rate) |
| 2 | **Appointment Management** | Manage incoming appointment requests | `getCounsellorAppointments()` — view all appointments; Confirm/cancel/complete appointments; `updateAppointment()` — change status, add notes; Session modes: chat, audio (Jitsi), video; View pre-session forms filled by students; Add task notes (Kanban-style: todo → doing → done) for student action items |
| 3 | **Calendar View** | Schedule and event management | `getEvents()` — view personal calendar; `createEvent()` — add custom events with color-coding; Appointments auto-populate on calendar; Manage available time slots |
| 4 | **Referral Management** | Handle AI-generated and manual referrals | `getCounsellorReferrals()` — view referrals from AI chatbot, screenings, or manual; `updateReferral()` — acknowledge or resolve referrals; Severity-based prioritization |
| 5 | **Escalated Chats** | Handle cases escalated by volunteers | `getEscalatedRequests()` — view chats escalated by volunteers; `acceptEscalated()` — take over the conversation; Join existing chat room with full message history |
| 6 | **Session Chat** | Real-time chat during appointments | Socket.IO live messaging with students during confirmed appointments; Typing indicators |
| 7 | **Task Management** | Personal Kanban board | `getTasks()` — view tasks (todo/ongoing/completed); `createTask()` — add new tasks; `updateTask()` — change status, priority; `reorderTasks()` — drag-and-drop reorder |
| 8 | **Available Slots** | Set availability schedule | Define available day/time slots for students to book |

---

### 3.3 VOLUNTEER

> Trained peer supporter. Requires admin approval after registration.

#### Features & Tasks:

| # | Feature | Description | Key Functions |
|---|---------|-------------|---------------|
| 1 | **Volunteer Dashboard** | Overview with stats and activity tabs | View active sessions count, completed sessions, students helped; Quick access tabs: Overview, Chat, Moderation, Training |
| 2 | **Help Request Queue** | View and accept pending student requests | `getPendingRequests()` — see queue of students needing help (sorted by urgency); `acceptHelpRequest()` — claim a request and start session |
| 3 | **Chat Workspace** | Real-time chat with students | Socket.IO-based live messaging with the student; **Safety feature**: AI-based risky word detection (suicide, kill, hurt, etc.) — shows warning to volunteer; Typing indicators |
| 4 | **Escalate to Counsellor** | Escalate serious cases | `escalateHelpRequest()` — forward the case to a professional counsellor; Select target counsellor; Earns 5 gamification points for proper escalation |
| 5 | **Complete Session** | Close and summarize a session | `completeHelpRequest()` — mark session done with summary (issue discussed, actions taken); Earns 10 gamification points per completed session |
| 6 | **Moderation** | Monitor community forum | `getFlaggedPosts()` — view posts flagged by users; `moderatePost()` — hide/unhide inappropriate content |
| 7 | **Training Module** | Self-paced training content | Access training resources and guidelines for peer support |
| 8 | **Gamification** | Reward system | Earn points for sessions completed and escalations; Level progression; Badges |
| 9 | **Availability Status** | Toggle availability | Set status: available / busy / offline |

---

### 3.4 ADMIN (College Admin)

> Manages a specific college's data. Must be verified by Super Admin before access.

#### Features & Tasks:

| # | Feature | Description | Key Functions |
|---|---------|-------------|---------------|
| 1 | **Admin Dashboard** | Comprehensive analytics scoped to their college | View: total students, counsellors, volunteers; Mood distribution charts; Screening counts; Referral stats (total, unresolved); Appointment stats (total, pending); Forum stats (total posts, flagged); Resource stats by category |
| 2 | **User Management** | Manage users within their college | `getAllUsers()` — view all registered users; `approveUser()` — approve counsellor/volunteer registrations; `deactivateUser()` — disable accounts; `activateUser()` — re-enable accounts |
| 3 | **Data Analytics & Graphs** | Visual insights | User growth chart (last 30 days); Issue distribution bar chart; Weekly usage trends (last 8 weeks); Mood distribution pie chart |
| 4 | **Notification Management** | Broadcast announcements | `createNotification()` — send announcements, alerts, tips to specific audiences (all, students, counsellors, volunteers); `deleteNotification()` — remove notifications; Target by college or global |
| 5 | **Resource Management** | Curate psychoeducational content | `createResource()` — add articles, guides, videos, toolkits, helpline info; Mark resources as featured |
| 6 | **College Management** | Manage college entity | College-scoped data filtering; All analytics are filtered to admin's college |

---

### 3.5 SUPER ADMIN

> Platform-level administrator with global access across all colleges.

#### Features & Tasks:

| # | Feature | Description | Key Functions |
|---|---------|-------------|---------------|
| 1 | **Global Dashboard** | Platform-wide analytics (no college filter) | All analytics across all colleges; Additional metrics: total admins, pending admins, total colleges |
| 2 | **Admin Verification** | Approve/reject college admin registrations | `getPendingAdmins()` — view unverified admin applications with proof documents; `verifyAdmin()` — approve admin and link to college; `rejectAdmin()` — reject and deactivate admin account |
| 3 | **College Management** | Manage all colleges | `createCollege()` — add new colleges; `updateCollege()` — edit college info; `deleteCollege()` — remove colleges |
| 4 | **All Admin Features** | Inherits all admin capabilities | User management across all colleges; Global notifications; Global resource management |

---

## 4. Data Models (MongoDB Schemas)

The system has **17 Mongoose models**:

### Core Models

| Model | Key Fields | Purpose |
|-------|-----------|---------|
| **User** | name, email, password (hashed), role (student/counsellor/volunteer/admin/superadmin), phone, department, enrollmentNo, specialization, college (ref), collegeName, proofUrl, adminVerified, isApproved, isVerified, isActive, otp, otpExpires, availableSlots[], availabilityStatus, gamification{points, level, badges[]} | Central user entity for all roles |
| **College** | name | Organizational unit for multi-tenancy |

### Student Feature Models

| Model | Key Fields | Purpose |
|-------|-----------|---------|
| **MoodEntry** | user (ref), mood (great/good/okay/low/terrible), moodScore (1-5), note, activities[], sleepHours | Daily mood tracking |
| **Screening** | user (ref), type (PHQ-9/GAD-7), answers[{questionIndex, score}], totalScore, severity (Minimal→Severe), recommendation | Clinical screening results |
| **ChatMessage** | user (ref), role (user/assistant), content, detectedMood, frequency, severity | AI chatbot conversation history |
| **GameSession** | user (ref), game (15 enum values), duration, feedback (better/same/worse), completedAt | Therapeutic game play records |
| **ForumPost** | author (ref), content, isAnonymous, tags[], upvotes[], replies[{author, content}], isFlagged, flagReason, flaggedBy, isHidden | Community forum posts |
| **Resource** | title, description, category (article/guide/video/toolkit/helpline), tags[], content, readTime, steps[], videoUrl, duration, items[], helplineNumber, helplineHours, thumbnailEmoji, featured, createdBy | Psychoeducational resources |
| **UserResourceInteraction** | user (ref), resource (ref), bookmarked, viewedAt | Tracking user engagement with resources |

### Appointment & Counselling Models

| Model | Key Fields | Purpose |
|-------|-----------|---------|
| **Appointment** | student (ref), counsellor (ref), date, timeSlot, status (pending/confirmed/completed/cancelled/emergency), sessionType (chat/audio/video), jitsiRoomId, preSession{feeling, issue, urgency, details}, isAnonymous, anonymousName, reason, notes, taskNotes[{text, status}], feedback{rating, comment}, isEmergency | Counselling appointment booking |
| **SessionChatMessage** | appointment (ref), sender (ref), senderRole, content, readBy[] | Real-time chat during sessions |
| **Referral** | student (ref), counsellor (ref), reason, severity, status (unresolved/acknowledged/resolved), source (ai_chatbot/screening/manual), aiNotes | Crisis referral records |

### Volunteer Support Models

| Model | Key Fields | Purpose |
|-------|-----------|---------|
| **HelpRequest** | student (ref), assignedVolunteer (ref), issueType, urgency, status (pending/active/completed/escalated/rejected), escalatedTo (ref), summary{issueDiscussed, actionsTaken}, studentFeedback{rating, comment} | Peer support request lifecycle |
| **VolunteerChatMessage** | helpRequest (ref), sender (ref), senderRole (student/volunteer/counsellor), content, readBy[] | Volunteer-student chat messages |

### Administrative Models

| Model | Key Fields | Purpose |
|-------|-----------|---------|
| **Notification** | title, message, type (announcement/alert/tip/update), priority, audience (all/students/counsellors/volunteers), college (ref), createdBy, isActive, readBy[] | System-wide notifications |
| **CounsellorTask** | counsellor (ref), text, status (todo/ongoing/completed), priority, order | Counsellor personal Kanban |
| **CounsellorEvent** | counsellor (ref), title, date, time, color, notes | Counsellor calendar events |

---

## 5. API Routes (19 Route Modules)

| Route Prefix | Module | Key Endpoints | Auth |
|---|---|---|---|
| `/api/auth` | auth.js | POST `/register`, `/login`, `/verify-otp`, `/resend-otp`; GET/PUT `/profile` | Public / Protected |
| `/api/mood` | mood.js | POST `/` (create); GET `/` (history) | Student |
| `/api/screenings` | screenings.js | POST `/` (submit); GET `/my` | Student |
| `/api/chat` | chat.js | POST `/send` (AI chat); GET `/history`; DELETE `/clear` | Student |
| `/api/appointments` | appointments.js | POST `/` (book), `/emergency`; GET `/my`, `/counsellors`, `/slots`, `/counsellor`, `/counsellor/stats`; PUT `/:id`, `/:id/feedback`, `/:id/task` | Student + Counsellor |
| `/api/referrals` | referrals.js | GET `/counsellor`; PUT `/:id` | Counsellor |
| `/api/forum` | forum.js | POST `/`; GET `/`, `/flagged`; PUT `/:id/upvote`, `/:id/reply`, `/:id/flag`, `/:id/moderate` | All authenticated |
| `/api/resources` | resources.js | GET `/`, `/bookmarks`, `/recent`, `/recommend`, `/stats`, `/interactions`; POST `/`, `/:id/bookmark`, `/:id/view` | All authenticated |
| `/api/games` | games.js | POST `/session`; GET `/stats`, `/recommend` | Student |
| `/api/session-chat` | sessionChat.js | GET `/:appointmentId` | Student + Counsellor |
| `/api/help-requests` | helpRequests.js | POST `/`, `/:id/accept`, `/:id/escalate`, `/:id/complete`; GET `/pending`, `/active` | Student + Volunteer |
| `/api/volunteer-chat` | volunteerChat.js | GET `/:helpRequestId` | Volunteer + Student |
| `/api/counsellor-escalated` | counsellorEscalated.js | GET `/`; POST `/:id/accept` | Counsellor |
| `/api/counsellor-tasks` | counsellorTasks.js | GET `/`; POST `/`, `/reorder`; PUT `/:id`; DELETE `/:id` | Counsellor |
| `/api/counsellor-events` | counsellorEvents.js | GET `/`; POST `/`; PUT `/:id`; DELETE `/:id` | Counsellor |
| `/api/admin` | admin.js | GET `/analytics`, `/pending-admins`; PUT `/verify-admin/:id`, `/reject-admin/:id` | Admin + SuperAdmin |
| `/api/users` | user.js | GET `/`; PUT `/:id/approve`, `/:id/deactivate`, `/:id/activate`; POST `/upload-proof` | Admin |
| `/api/colleges` | colleges.js | GET `/`; POST `/`; PUT `/:id`; DELETE `/:id` | Admin + SuperAdmin |
| `/api/notifications` | notifications.js | GET `/`, `/admin`; POST `/`; DELETE `/:id`; PUT `/:id/read` | Admin (manage) / All (read) |

---

## 6. Real-Time Communication (Socket.IO)

### Socket Events:

| Event | Direction | Purpose |
|---|---|---|
| `join-room` | Client → Server | Join an appointment/help-request chat room |
| `leave-room` | Client → Server | Leave a chat room |
| `send-message` | Client → Server | Send message in counselling session chat |
| `new-message` | Server → Room | Broadcast new session chat message |
| `send-volunteer-message` | Client → Server | Send message in volunteer-student chat |
| `new-volunteer-message` | Server → Room | Broadcast new volunteer chat message (includes `isRisky` flag) |
| `typing` | Client → Server | Notify typing started |
| `user-typing` | Server → Room | Broadcast typing indicator |
| `stop-typing` | Client → Server | Notify typing stopped |
| `user-stop-typing` | Server → Room | Broadcast typing stopped |
| `chat-escalated` | Client → Server → Room | Notify room that chat was escalated to counsellor |

### Socket Authentication:
- JWT token passed via `socket.handshake.auth.token`
- Server verifies token and attaches user object to socket

### Safety Feature in Volunteer Chat:
- Server-side keyword scanning for risky words (suicide, kill, hurt, die, etc.)
- `isRisky` flag sent with messages to trigger frontend warnings

---

## 7. AI & ML Pipeline

### Flow:
```
Student Message → ML Service (Flask) → Mood + Severity → Gemini AI → Contextual Response
```

### Step-by-Step:
1. **Student sends message** via chatbot
2. **ML Classification** (Flask microservice):
   - TF-IDF vectorizes the text
   - Mood Classifier predicts: anxiety / sadness / anger / stress / insomnia / crisis / neutral
   - Severity Scorer rates: 1-5 scale
   - Returns mood-specific audio frequency recommendation
3. **Gemini AI generates response**:
   - System prompt includes mood detection results
   - Crisis prompt injected if crisis detected
   - Uses last 10 messages as context window
4. **Auto-Referral on Crisis**:
   - If `isCrisis === true`, system automatically creates a Referral record
   - Email alert sent to counsellor via Nodemailer
   - WhatsApp alert sent via Twilio
5. **Audio Therapy Mapping**:
   - anxiety → 432Hz Calming Solfeggio
   - sadness → 528Hz Healing Frequency
   - anger → 2Hz Delta Deep Relaxation
   - stress → 10Hz Alpha Relaxed Focus
   - insomnia → 3Hz Delta Sleep Induction

---

## 8. Authentication & Authorization Architecture

### Registration Flow:
1. User fills registration form (role-specific fields)
2. Password hashed with bcryptjs (12 salt rounds)
3. OTP generated (6-digit) and emailed
4. User verifies OTP → account activated
5. JWT token (7-day expiry) issued on verification
6. Counsellors/Volunteers need admin approval (`isApproved`)
7. Admins need super admin verification (`adminVerified`)

### Middleware Chain:
```
Request → protect (JWT verification) → roleCheck (RBAC) → Controller
```

- **`protect`** middleware: Extracts Bearer token, verifies JWT, attaches user to `req.user`, checks `isActive`
- **`roleCheck(...allowedRoles)`** middleware: Factory function — checks if `req.user.role` is in the allowed list

### Session Management:
- Token stored in `sessionStorage` (client-side)
- Axios interceptor auto-attaches `Authorization: Bearer <token>` header
- AuthContext provides: `user`, `token`, `loading`, `register`, `verifyOTP`, `resendOTP`, `login`, `logout`

---

## 9. Notification System

### Multi-Channel Notifications:
| Channel | Technology | Use Case |
|---------|-----------|----------|
| **In-App** | REST API + Frontend widget | Announcements, tips, alerts, updates |
| **Email** | Nodemailer (SMTP) | OTP verification, crisis referral alerts, welcome emails |
| **WhatsApp** | Twilio API | Crisis alerts to counsellors |
| **Real-Time** | Socket.IO | Chat messages, typing indicators, escalation alerts |

### Admin-Created Notifications:
- Types: announcement, alert, tip, update
- Priority: low, medium, high
- Audience targeting: all, students, counsellors, volunteers
- College-scoped or global
- Read tracking via `readBy[]` array

---

## 10. Gamification System

### For Volunteers:
| Action | Points |
|--------|--------|
| Complete a help session | +10 |
| Escalate a crisis case | +5 |

### Gamification Schema (User model):
```javascript
gamification: {
    points: Number (default: 0),
    level: Number (default: 1),
    badges: [String]
}
```

### For Students (Therapeutic Games):
- 15 mini-games covering: breathing, creativity, focus, gratitude, relaxation
- Session tracking: game type, duration, feedback (better/same/worse)
- Streak calculation (consecutive days played)
- AI-based game recommendation based on current mood

---

## 11. Key Frontend Components

### Shared Components:
| Component | Purpose |
|-----------|---------|
| `DashboardLayout.jsx` | Common layout wrapper with sidebar navigation (role-adaptive) |
| `NotificationWidget.jsx` | Bell icon widget showing unread notifications |
| `ProfileModal.jsx` | Modal for viewing/editing user profile |
| `ChatRoom.jsx` | Reusable Socket.IO chat component |

### Student Pages (8):
`StudentDashboard`, `MoodTracker`, `Screening`, `ChatBot`, `BookAppointment`, `ForumPage`, `ResourcesPage`, `GamesPage` + `StudentHelpPanel` (peer support)

### Counsellor Pages (4):
`CounsellorDashboard`, `CounsellorAppointments`, `CounsellorCalendar`, `CounsellorReferrals`

### Volunteer Pages (4):
`VolunteerDashboard` + `OverviewTab`, `VolunteerChatWorkspace`, `ModerationTab`, `TrainingTab`

### Admin Pages (1):
`AdminDashboard` (comprehensive — 36KB single file with all analytics, user management, notifications, etc.)

### Game Components (16):
`BreathingBubble`, `BubblePop`, `ColorMatchCalm`, `FocusDot`, `GameWrapper`, `GratitudeGrowth`, `GrowTree`, `LoopRelaxer`, `MemoryTiles`, `PatternTracing`, `RhythmTap`, `SlidingPuzzle`, `ThoughtCatcher`, `ThoughtRelease`, `WaveTouch`, `ZenDrawing`

---

## 12. Design Patterns Already Present in the Codebase

> Use this section to map existing code patterns for your assignments.

| Design Pattern | Where It Exists | Code Example |
|---|---|---|
| **MVC (Model-View-Controller)** | Entire backend architecture | Models (`/models/`), Controllers (`/controllers/`), Routes (`/routes/`) separate concerns cleanly |
| **Factory Method** | `roleCheck` middleware | `roleCheck(...allowedRoles)` is a factory that returns middleware functions |
| **Singleton** | Database connection, Gemini AI client | `connectDB()` called once; `genAI` instance created once |
| **Observer / Pub-Sub** | Socket.IO event system | `socket.on('send-message')` / `io.emit('new-message')` — publishers and subscribers |
| **Strategy** | ML frequency mapping, game recommendations | `FREQUENCY_MAP` object selects different audio strategies based on detected mood; `recommendations` object in gameController |
| **Middleware / Chain of Responsibility** | Express middleware pipeline | `protect → roleCheck → controller` — each middleware can stop or forward the request |
| **Proxy** | Axios interceptor | `API.interceptors.request` acts as a proxy that attaches auth tokens to every request |
| **Template Method** | Email templates | `emailService.js` uses generic `sendEmail()` with specific template functions (`sendOTPEmail`, `sendReferralAlert`, `sendWelcomeEmail`) |
| **Facade** | `AuthContext` | Provides a simplified interface (`login`, `logout`, `register`) hiding API calls, token management, and state updates |
| **Builder** | Appointment schema, User registration | Complex objects (Appointment with preSession, taskNotes, feedback) built incrementally |
| **Repository** | Controllers wrapping Mongoose | Each controller encapsulates database operations for its domain model |
| **Decorator** | Socket authentication middleware | `io.use()` decorates socket connections with authentication before allowing events |
| **State** | HelpRequest status machine | Status transitions: pending → active → completed/escalated; Appointment: pending → confirmed → completed/cancelled |

---

## 13. External Service Integrations

| Service | Purpose | Config |
|---------|---------|--------|
| **MongoDB Atlas** | Cloud database | `MONGO_URI` env var |
| **Google Gemini 2.5 Flash** | AI chatbot responses | `GEMINI_API_KEY` env var |
| **SMTP (Nodemailer)** | Email sending | `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` |
| **Twilio** | WhatsApp crisis alerts | `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_PHONE` |
| **Cloudinary** | File storage (admin proofs) | Cloudinary SDK config |
| **Jitsi Meet** | Video/audio calls | `jitsiRoomId` generated for appointments |

---

## 14. File Structure Summary

```
MH/
├── client/                          # React Frontend
│   └── src/
│       ├── App.jsx                  # Route definitions + ProtectedRoute
│       ├── index.css                # Global styles
│       ├── main.jsx                 # Entry point
│       ├── api/
│       │   ├── axios.js             # Axios instance + interceptors
│       │   └── endpoints.js         # All API endpoint constants
│       ├── context/
│       │   └── AuthContext.jsx      # Auth state management
│       ├── hooks/
│       │   └── useAudioTherapy.js   # Audio therapy custom hook
│       ├── components/
│       │   ├── DashboardLayout.jsx  # Shared layout
│       │   ├── NotificationWidget.jsx
│       │   ├── ProfileModal.jsx
│       │   ├── chat/ChatRoom.jsx    # Reusable chat component
│       │   └── games/               # 16 game components
│       ├── pages/
│       │   ├── LandingPage.jsx      # Public landing
│       │   ├── LoginPage.jsx
│       │   ├── RegisterPage.jsx
│       │   ├── student/             # 8 student pages
│       │   ├── counsellor/          # 4 counsellor pages
│       │   ├── volunteer/           # 2 pages + 4 tab components
│       │   └── admin/               # 1 admin dashboard
│       └── data/                    # Static data files
│
├── server/                          # Node.js Backend
│   ├── server.js                    # Entry point + Socket.IO setup
│   ├── config/db.js                 # MongoDB connection
│   ├── middleware/
│   │   ├── auth.js                  # JWT protect middleware
│   │   └── roleCheck.js            # RBAC middleware
│   ├── models/                      # 17 Mongoose models
│   ├── controllers/                 # 16 controller files
│   ├── routes/                      # 19 route files
│   ├── services/
│   │   ├── emailService.js          # Nodemailer wrapper
│   │   ├── emailTemplates.js        # HTML email templates
│   │   └── whatsappService.js       # Twilio WhatsApp
│   ├── socket/chatSocket.js         # Socket.IO event handlers
│   └── seed/                        # Database seed scripts
│
└── ml-service/                      # Python ML Microservice
    ├── app.py                       # Flask API server
    ├── train.py                     # Model training script
    ├── model/                       # Saved ML models (.pkl)
    └── data/                        # Training data
```

---

## 15. Summary for Design Pattern Assignments

This project is a **comprehensive full-stack mental health platform** with:
- **5 user roles** with distinct permissions and workflows
- **17 database models** with complex relationships
- **19 REST API modules** + **1 WebSocket module**
- **AI pipeline** (ML classification + Generative AI)
- **Real-time communication** (Socket.IO)
- **Multi-channel notifications** (in-app, email, WhatsApp)
- **Gamification** for both volunteers and students
- **Microservice architecture** (Flask ML separate from Node.js)
- **Rich client-side** with role-based routing, context API, and 30+ React components

This architecture naturally exhibits multiple software design patterns including MVC, Observer, Strategy, Factory Method, Chain of Responsibility, Facade, Singleton, Proxy, Template Method, State, Decorator, and Builder patterns — making it an excellent basis for design pattern assignments.
