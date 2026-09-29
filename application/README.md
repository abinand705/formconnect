# FormConnect Mobile App (Flutter)

A cross-platform mobile companion application for **FormConnect** — built with Flutter and designed around the Donezo Forest Green design system.

---

## ✨ Features

- **🔐 Authentication & Security**
  - Secure account registration and login via JWT.
  - Persistent login session with encrypted token storage.
  - Password management (change password) and permanent account deletion.
  - Platform-aware backend selector (switch between Android Emulator `10.0.2.2:5000`, Localhost `localhost:5000`, LAN IP, or production Render cloud).

- **📊 Modern Dashboard**
  - Live summary stats: Total Projects, Total Submissions, Unread Messages, and Relative Activity Time.
  - Interactive 14-day submissions volume bar chart.
  - Quick action shortcuts for instant project creation, form testing, and navigation.
  - Recent submissions stream with tap-to-inspect detail sheets.
  - Pull-to-refresh on all screens.

- **📁 Project Management**
  - Multi-step project creation wizard (project name + email notification preferences).
  - Schema builder: add, edit, toggle required/optional, or remove custom fields (`text`, `email`, `textarea`, `number`, `tel`).
  - Email notification fields setup (include all fields or customize comma-separated fields).
  - Real-time API key regeneration with confirmation dialog.
  - Integration code generator: instant exportable code snippets for HTML `<form>`, JavaScript `fetch()`, React Hook Form, and `cURL`.
  - Project deletion with safety confirmation.

- **📬 Submissions Inbox**
  - Real-time unread badges on the navigation bar.
  - Filter by status: **All**, **Unread**, or **Read**.
  - Filter by project: view all submissions or isolate a single form endpoint.
  - Full-text search across sender name, email, message body, or custom field values.
  - One-tap "Mark all as read" button.
  - Swipe-to-delete with confirmation.
  - Detailed submission bottom sheet with full key-value breakdown and 1-tap copy buttons.

- **📈 Analytics & Usage**
  - Key metrics: Total Submissions, 30-Day Volume, Active Projects, and Average Daily Rate.
  - Interactive 30-day submissions trend chart powered by `fl_chart` with touch tooltips.
  - Project volume distribution donut/pie chart with percentage breakdowns and color-coded legends.

- **🔑 API Keys & Form Testing**
  - Masked key preview with 1-tap copy to clipboard and visibility toggle.
  - **Live Form Tester**: Dynamically renders form inputs according to your project's custom schema and submits live test data straight to `/api/submit`.

---

## 🛠 Tech Stack

- **Framework:** Flutter 3.44.8+ / Dart 3.12.2+
- **Design System:** Donezo Theme (Forest Green `#154234`, Mint `#22C55E`, Canvas `#F8FAF9`)
- **Typography:** `google_fonts` (Plus Jakarta Sans)
- **State Management:** `provider` (MultiProvider with dedicated domain stores)
- **Charts:** `fl_chart` (Bar & Donut charts with interactive touch tooltips)
- **Networking:** `http` REST API client with timeout and ping verification
- **Storage:** `shared_preferences`

---

## 🚀 Running the App

### 1. Ensure the FormConnect Backend is Running
From the repository root:
```bash
cd backend
npm run dev
# Server running on http://localhost:5000
```

### 2. Run the Flutter Mobile App
In another terminal:
```bash
cd application

# Check connected devices (Android emulator, physical phone, Chrome, Windows)
flutter devices

# Run on your target device
flutter run
```

> **Tip for Android Emulators:** The app automatically sets the default API URL to `http://10.0.2.2:5000`, which correctly routes to your host computer's `localhost:5000`. You can change or ping the server URL anytime by tapping the server chip in the top AppBar or via Settings.

---

## 📂 Project Architecture

```
application/lib/
├── main.dart                          # App entry point, MultiProvider & Theme setup
├── models/
│   ├── user_model.dart                # User auth credentials & profile
│   ├── project_model.dart             # Project & ProjectFormField schema models
│   ├── submission_model.dart          # Form submissions with preview getters
│   └── analytics_model.dart           # Daily counts, project stats, analytics
├── services/
│   ├── api_service.dart               # Complete REST API client & ping tester
│   └── storage_service.dart           # SharedPreferences persistence
├── providers/
│   ├── auth_provider.dart             # Auth session & server URL state
│   ├── projects_provider.dart         # Project CRUD & schema management
│   ├── submissions_provider.dart      # Inbox, filters, read status & test submit
│   └── analytics_provider.dart        # Stats and chart data provider
├── theme/
│   └── app_theme.dart                 # Donezo Forest Green & Mint theme tokens
├── utils/
│   ├── constants.dart                 # Storage keys & server presets
│   ├── date_formatter.dart            # Relative time & date formatters
│   └── code_generator.dart            # HTML, Fetch, React & cURL snippet generator
├── widgets/
│   ├── app_button.dart                # Primary, secondary, danger & outline buttons
│   ├── app_text_field.dart            # Custom styled input fields
│   ├── status_badge.dart              # Badges for Unread, Read, and counts
│   ├── empty_state.dart               # Empty inbox & no-project placeholders
│   └── custom_toast.dart              # Floating snackbars & clipboard feedback
└── screens/
    ├── splash_screen.dart             # Animated splash & auth routing
    ├── main_layout_screen.dart        # Bottom navigation bar & top AppBar
    ├── auth/
    │   ├── login_screen.dart          # Sign in with server picker
    │   └── register_screen.dart       # Account registration
    ├── dashboard/
    │   └── dashboard_screen.dart      # Summary stats, charts & recent inbox
    ├── projects/
    │   ├── projects_screen.dart       # Projects cards, key copy & menu actions
    │   ├── create_project_dialog.dart # 2-step project creation modal
    │   ├── edit_fields_sheet.dart     # Dynamic field schema builder
    │   ├── email_fields_dialog.dart   # Email notification field preferences
    │   └── code_snippet_dialog.dart   # Embed snippets (HTML/Fetch/React/cURL)
    ├── submissions/
    │   ├── submissions_screen.dart    # Inbox with search, filter chips & swipe delete
    │   └── submission_detail_sheet.dart # Inspection sheet with copy & read toggle
    ├── analytics/
    │   └── analytics_screen.dart      # 30-day bar chart & project distribution donut
    ├── apikeys/
    │   ├── apikeys_screen.dart        # API keys manager with reveal & copy
    │   └── test_submit_dialog.dart    # Live form tester for any schema
    └── settings/
        ├── settings_screen.dart       # Account info, password change, logout
        └── server_config_dialog.dart  # Server endpoint switcher & ping test
```
