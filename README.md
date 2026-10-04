# FormConnect

<div align="center">

![FormConnect Logo](application/assets/logo.png)

### Your Own Contact-Form Backend — No Google Forms, No Third-Party Lock-In

[![Release](https://img.shields.io/github/v/release/abinand705/formconnect?color=22C55E&label=Release&logo=github)](https://github.com/abinand705/formconnect/releases/latest)
[![Flutter](https://img.shields.io/badge/Flutter-3.12+-02569B?logo=flutter&logoColor=white)](https://flutter.dev)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5.0+-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4.19-000000?logo=express&logoColor=white)](https://expressjs.com)
[![Prisma](https://img.shields.io/badge/Prisma-6.0+-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[**Download Android APK (v1.0.0)**](https://github.com/abinand705/formconnect/releases/latest) • [**Live Dashboard**](https://formconnect.vercel.app) • [**Production API**](https://formconnect.onrender.com)

</div>

---

## 📌 Overview

**FormConnect** is a self-hosted, multi-tenant **Backend-as-a-Service (BaaS)** designed for portfolio sites, client projects, and web applications. It allows developers to drop an API key into any static or dynamic website contact form and receive submissions in real time — complete with spam filtering, email alerts, a React web console, and a native Flutter mobile app.

### Why FormConnect?
- **Full Data Ownership:** Keep all your form leads and customer feedback in your own database.
- **Zero Third-Party Vendor Lock-In:** Replace Google Forms, Formspree, Formkeep, or EmailJS.
- **Multi-Tenant & Schema Flexibility:** Create multiple projects (e.g., *Portfolio Contact*, *ChefCo Booking*, *Freelance Quote*), define custom field schemas, and manage everything from one dashboard.
- **Unified Ecosystem:** Web console for desktop workflows + Flutter mobile app for on-the-go notifications and submission management.

---

## 🏛 Ecosystem Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Client Frontends                                  │
│   (Portfolio Websites, Landing Pages, Client Portals, Webflow, Hugo, etc.) │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ POST /api/submit
                                       │ (API Key + Form Data)
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FormConnect API Engine                            │
│                 (Express.js + Prisma ORM + Rate Limiter)                    │
│                                                                             │
│   • API Key Validation          • Honeypot Spam Check                       │
│   • Rate Limiting per IP        • Schema & Required Field Validation        │
│   • Email Alerts (Nodemailer)   • Fast Health Probes (/api/health)          │
└──────────────────────┬───────────────────────────────┬──────────────────────┘
                       │                               │
                       ▼                               ▼
       ┌───────────────────────────────┐ ┌────────────────────────────────────┐
       │     React Web Dashboard       │ │       Flutter Mobile App           │
       │   (Vite, Tailwind, Charts)    │ │ (Android, iOS, Web & Desktop)      │
       │                               │ │                                    │
       │ • Realtime Submissions Inbox  │ │ • Push & Inbox Management          │
       │ • Project Schema Builder      │ │ • Dynamic Server Loading & Pulse   │
       │ • API Key Generator           │ │ • Cross-Device Presets & Testing   │
       │ • Code Snippets (HTML, React) │ │ • Direct APK In-App Downloader     │
       └───────────────────────────────┘ └────────────────────────────────────┘
```

---

## ✨ Key Features

### 🚀 Public Form Submissions
- **Drop-in Snippets:** Plug into any website via raw HTML, `fetch()`, Axios, or React hooks.
- **Spam Protection:** Built-in honeypot trap field and IP rate limiting (`express-rate-limit`).
- **Flexible JSON Payload:** Stores dynamic schema fields per project without migrations.
- **Email Forwarding:** Configurable notification alerts sent straight to your inbox upon form submission.

### 📱 Flutter Mobile Application (`/application`)
- **Native Experience:** Android and iOS apps crafted with clean Material 3 and custom brand aesthetics.
- **Server Loading & Wake-Up Engine:** Displays radar pulse animations and live elapsed timers while free-tier cloud instances (e.g. Render) spin up from cold sleep.
- **Quick Server Presets:** 1-tap switching between USB localhost (`localhost:5000`), Wi-Fi LAN (`192.168.1.x:5000`), Android Studio Emulator (`10.0.2.2:5000`), and Cloud Production.
- **Keyboard-Adaptive UI:** Fully responsive layout with zero overflows on mobile keyboards.
- **Test Submissions Dialog:** Send simulated test submissions directly from your phone.

### 💻 React Web Console (`/dashboard`)
- **Modern Minimal UI:** Clean developer aesthetic with dark mode and responsive data tables.
- **Submissions Inbox:** Mark submissions read/unread, inspect JSON payloads, and search entries.
- **Code Generator Modal:** Automatically outputs copy-pasteable integration code for HTML, JavaScript, React, and cURL.
- **Interactive Analytics:** Visual submission frequency graphs powered by Recharts.

---

## 🛠 Tech Stack

| Layer | Technologies |
|---|---|
| **Mobile App** | Flutter 3.12+, Dart, Provider, Google Fonts, Flutter SVG, FL Chart |
| **Web Dashboard** | React 19, Vite 5, Tailwind CSS, Lucide Icons, Recharts |
| **Backend API** | Node.js, Express 4, Prisma 6, JWT, Bcrypt, Express Rate Limit |
| **Databases** | PostgreSQL (Neon / Supabase) or local SQLite for development |
| **Hosting** | Render (Backend API), Vercel (Web Dashboard), GitHub Releases (Android APK) |

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [Flutter SDK](https://flutter.dev/docs/get-started/install) (v3.12+ for mobile app)
- [Git](https://git-scm.com/)

---

### 1. Backend API Setup

```bash
# Clone the repository
git clone https://github.com/abinand705/formconnect.git
cd formconnect/backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
```

Edit `.env` with your settings:
```env
PORT=5000
DATABASE_URL="file:./dev.db" # or your PostgreSQL connection string
JWT_SECRET="your-super-secret-jwt-key"
ALLOWED_ORIGINS="http://localhost:5173,https://formconnect.vercel.app"
```

Initialize database & start server:
```bash
# Apply Prisma migrations
npx prisma migrate dev --name init

# Start development server
npm run dev
# Server running at http://localhost:5000 (0.0.0.0)
```

---

### 2. Web Dashboard Setup

```bash
cd ../dashboard

# Install dependencies
npm install

# Create environment configuration
echo "VITE_API_URL=http://localhost:5000/api" > .env

# Start development server
npm run dev
# Dashboard running at http://localhost:5173
```

---

### 3. Mobile App Setup (Flutter)

```bash
cd ../application

# Get Flutter packages
flutter pub get

# Run on connected device or emulator
flutter run
```

To build a standalone production release APK:
```bash
flutter build apk --release
# Output: build/app/outputs/flutter-apk/app-release.apk
```

---

## 🔌 Frontend Integration Example

To connect any form to FormConnect, send a `POST` request with your project API key to the `/api/submit` endpoint:

### Vanilla JavaScript / Fetch
```javascript
async function handleFormSubmit(e) {
  e.preventDefault();
  
  const payload = {
    apiKey: "fc_live_your_project_api_key_here",
    data: {
      name: document.getElementById("name").value,
      email: document.getElementById("email").value,
      message: document.getElementById("message").value,
    },
    _gotcha: "" // Honeypot spam trap (must be kept empty)
  };

  try {
    const response = await fetch("https://formconnect.onrender.com/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    if (response.ok) {
      alert("Message received! Thank you.");
    } else {
      alert("Error: " + result.error);
    }
  } catch (error) {
    console.error("Submission failed:", error);
  }
}
```

### React Hook Example
```jsx
import { useState } from 'react';

export function ContactForm() {
  const [status, setStatus] = useState('idle');

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('submitting');
    
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    const res = await fetch('https://formconnect.onrender.com/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey: process.env.NEXT_PUBLIC_FORMCONNECT_KEY,
        data,
      }),
    });

    if (res.ok) setStatus('success');
    else setStatus('error');
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="Your Name" required />
      <input name="email" type="email" placeholder="Your Email" required />
      <textarea name="message" placeholder="Your Message" required />
      <button type="submit" disabled={status === 'submitting'}>
        {status === 'submitting' ? 'Sending...' : 'Send Message'}
      </button>
      {status === 'success' && <p>Message sent successfully!</p>}
    </form>
  );
}
```

### cURL Test
```bash
curl -X POST https://formconnect.onrender.com/api/submit \
  -H "Content-Type: application/json" \
  -d '{
    "apiKey": "fc_live_your_project_api_key",
    "data": {
      "name": "Jane Doe",
      "email": "jane@example.com",
      "message": "Hello from FormConnect API!"
    }
  }'
```

---

## 📡 Core API Reference

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/health` | Fast uptime & health heartbeat | No |
| `POST` | `/api/submit` | Public form submission ingestion | No (Uses API Key) |
| `GET` | `/api/download/app` | Direct download of `FormConnect.apk` | No |
| `POST` | `/api/auth/register` | Create a new user account | No |
| `POST` | `/api/auth/login` | Authenticate and obtain JWT token | No |
| `GET` | `/api/projects` | List all user projects | Yes (Bearer Token) |
| `POST` | `/api/projects` | Create a new project with custom fields | Yes (Bearer Token) |
| `POST` | `/api/projects/:id/regenerate-key` | Rotate project API key | Yes (Bearer Token) |
| `GET` | `/api/submissions` | Retrieve inbox submissions | Yes (Bearer Token) |
| `PATCH`| `/api/submissions/:id/read` | Mark submission as read/unread | Yes (Bearer Token) |
| `DELETE`| `/api/submissions/:id` | Delete a submission entry | Yes (Bearer Token) |
| `GET` | `/api/analytics` | Get aggregate submission statistics | Yes (Bearer Token) |

---

## 📂 Repository Structure

```
formconnect/
├── application/                # Native Flutter Mobile App
│   ├── android/                # Android native configuration & Gradle scripts
│   ├── assets/                 # App logo, graphics, and vector icons
│   ├── lib/
│   │   ├── models/             # User, Project, and Submission data models
│   │   ├── providers/          # ChangeNotifier state management
│   │   ├── screens/            # Splash, Login, Register, Dashboard, Settings
│   │   ├── services/           # ApiService, Health prober, StorageService
│   │   ├── theme/              # AppColors and ThemeData definitions
│   │   └── widgets/            # ServerLoadingAnimation, AppButton, Logo
│   └── pubspec.yaml            # Flutter dependencies
│
├── backend/                    # Express.js Backend Service
│   ├── middleware/             # Auth JWT verification & rate limiting
│   ├── prisma/                 # Database schema & migrations
│   ├── routes/                 # Auth, projects, submissions, analytics, health
│   ├── dev.db                  # Local SQLite database
│   ├── index.js                # Server entry point & CORS configuration
│   └── package.json            # Node.js dependencies
│
├── dashboard/                  # React 19 + Vite Web Console
│   ├── public/                 # Static assets & bundled FormConnect APK
│   ├── src/                    # Components, views (Login, Submissions, API Keys)
│   ├── index.html              # Web entry HTML
│   └── package.json            # Web dependencies
│
├── FormConnect_Project_Spec.md # Initial technical specification
└── README.md                   # Complete documentation
```

---

## 🔒 Security Best Practices

- **Honeypot Protection:** Forms include hidden decoy fields (`_gotcha`) that silently reject bot submissions without disrupting legitimate users.
- **IP Rate Limiting:** Enforces maximum request thresholds to safeguard your backend against denial-of-service and brute force attacks.
- **Credential Hashing:** User passwords are encrypted with salted `bcrypt` hashes.
- **Isolated Multi-Tenancy:** Submissions and API keys are strictly partitioned per user account and project identifier.

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<div align="center">
Built with ❤️ by <a href="https://github.com/abinand705">abinand</a>
</div>
