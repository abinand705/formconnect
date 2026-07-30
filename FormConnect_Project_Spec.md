# FormConnect — Project Specification

**Tagline:** Your own contact-form backend. No Google Forms, no third-party lock-in.

**Positioning:** Personal infrastructure + portfolio project. Built for your own sites (portfolio, ChefCo, ISOSpace, future freelance clients) — architected like a real SaaS so it also works as a standout resume/GitHub piece.

---

## 1. Problem Statement

Portfolio and client sites need a contact form that "just works" without depending on Google Forms, Formspree, or other third parties. Owner wants:
- Full control over data (own DB, own dashboard)
- One system reusable across all future projects (drop in an API key, done)
- Ability to define custom fields per project (contact form ≠ booking form ≠ feedback form)

---

## 2. Core Idea

A multi-tenant "Backend-as-a-Service" for forms:
1. Register → get an account
2. Create a **Project** (e.g. "Portfolio Contact", "ChefCo Bookings")
3. Define fields for that project (name, email, message, phone, custom fields — like a schema builder)
4. Get an **API key + Project ID**
5. Paste a snippet into the website's contact form
6. Submissions land in a dashboard in real time
7. Owner gets notified (email/Telegram) and can view/manage all messages

Same pattern as Firebase: register → get keys → paste into project → data flows in.

---

## 3. Success Criteria (Definition of Done for v1)

- [ ] Can register/login securely
- [ ] Can create a project and define custom fields
- [ ] Can generate & regenerate API keys
- [ ] Public submit endpoint accepts & validates submissions
- [ ] Dashboard lists submissions per project, real-time or near real-time
- [ ] Email notification on new submission
- [ ] Deployed live and integrated into abinandes.vercel.app contact form
- [ ] Spam protection (honeypot + rate limiting) in place

---

## 4. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend (dashboard) | React + Vite (or Next.js) | Matches your existing stack |
| Styling | Tailwind CSS | Fast, clean, matches portfolio aesthetic |
| Backend API | Node.js + Express | Matches your internship/freelance stack |
| ORM | Prisma | Type-safe, free, great DX |
| Database | PostgreSQL via **Supabase** or **Neon** (free tier, no expiry) | Free forever tier for MVP |
| Auth | JWT (dashboard login) + API key (public submissions) | Simple, secure enough for MVP |
| Email | Nodemailer + Gmail app password, or Resend (free tier) | Free, reliable |
| Realtime (optional v2) | Supabase Realtime or Socket.io | Live dashboard updates |
| Hosting — backend | Render / Railway free tier | Easy Node deploy |
| Hosting — frontend | Vercel | You already use it |
| Spam protection | Honeypot field + rate-limiting (express-rate-limit) | Free, no external dep |

---

## 5. Data Model (Prisma schema draft)

```prisma
model User {
  id        String    @id @default(uuid())
  email     String    @unique
  password  String
  createdAt DateTime  @default(now())
  projects  Project[]
}

model Project {
  id          String       @id @default(uuid())
  name        String
  apiKey      String       @unique
  fields      Json         // [{ name: "email", type: "email", required: true }, ...]
  userId      String
  user        User         @relation(fields: [userId], references: [id])
  submissions Submission[]
  createdAt   DateTime     @default(now())
}

model Submission {
  id        String   @id @default(uuid())
  projectId String
  project   Project  @relation(fields: [projectId], references: [id])
  data      Json      // actual submitted key/value pairs
  read      Boolean  @default(false)
  createdAt DateTime @default(now())
}
```

---

## 6. API Endpoints

| Method | Route | Purpose | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Create account | none |
| POST | `/api/auth/login` | Get JWT | none |
| POST | `/api/projects` | Create project + field schema | JWT |
| GET | `/api/projects` | List owner's projects | JWT |
| PATCH | `/api/projects/:id` | Edit field schema | JWT |
| POST | `/api/projects/:id/regenerate-key` | New API key | JWT |
| GET | `/api/projects/:id/submissions` | List submissions | JWT |
| PATCH | `/api/submissions/:id` | Mark read | JWT |
| **POST** | **`/api/submit`** | **Public submission endpoint** | **API key** |

### Public submit payload example
```json
{
  "apiKey": "fc_live_xxxxxxxx",
  "data": {
    "name": "John Doe",
    "email": "john@example.com",
    "message": "Hi, interested in your work."
  }
}
```

Backend validates:
1. API key exists → resolves to Project
2. Submitted keys match Project's field schema (required fields present)
3. Honeypot field empty (spam check)
4. Rate limit per IP (e.g. 5 requests/min)
5. Store submission → trigger email notification

---

## 7. Frontend Embed Snippet (what goes on abinandes.vercel.app)

```js
async function handleContactSubmit(formData) {
  const res = await fetch('https://formconnect-api.onrender.com/api/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      apiKey: 'fc_live_xxxxxxxx',
      data: {
        name: formData.name,
        email: formData.email,
        message: formData.message,
      },
    }),
  });
  const result = await res.json();
  return result.success;
}
```

---

## 8. Dashboard UI — Theme & Screens

**Aesthetic direction:** Dark, minimal, developer-tool feel (think Vercel/Linear/Supabase dashboards) — matches your existing preference for distinctive, clean interfaces (seen in ISOSpace's minimal card auth screens).

- **Palette:** near-black background (#0A0A0A), off-white text, single accent color (electric blue or your ISOSpace brand orange for consistency across your projects)
- **Font:** Inter or Geist, monospace accents for API keys/code snippets
- **Layout:**
  - Sidebar: Projects list
  - Main panel: Selected project → tabs: **Submissions | Fields | Settings/API Key**
  - Submissions view: table/card list, unread = bold/highlighted dot, click to expand full message
  - Fields tab: drag-to-reorder field builder (name, type dropdown: text/email/textarea/phone, required toggle)
  - Settings: API key display (copy button), regenerate button, embed snippet auto-generated with their key pasted in

---

## 9. Build Order / Roadmap

**Phase 1 — Core (MVP, ship this first)**
1. Auth (register/login, JWT)
2. Project CRUD + static field schema (just hardcode name/email/message first)
3. Public `/api/submit` endpoint + validation
4. Basic dashboard: list submissions, mark read
5. Deploy backend (Render) + connect Supabase/Neon Postgres
6. Wire into abinandes.vercel.app — replace Google Form

**Phase 2 — Dynamic & Polish**
7. Dynamic field schema builder (add/remove/reorder custom fields)
8. Email notifications on new submission
9. Honeypot + rate limiting (spam protection)
10. API key regeneration

**Phase 3 — Nice-to-haves**
11. Realtime dashboard updates (Supabase Realtime/Socket.io)
12. Webhook support (push to Slack/Discord/Telegram)
13. Multi-project analytics (submissions over time chart)
14. CSV export of submissions
15. Dark/light theme toggle on dashboard

---

## 10. Security Checklist

- [ ] Passwords hashed with bcrypt
- [ ] JWT expiry + refresh handling
- [ ] API keys are long random strings (`fc_live_` + 32 char random), never guessable
- [ ] Rate limit public submit endpoint per IP and per API key
- [ ] Sanitize/validate all incoming submission data (no script injection stored raw)
- [ ] CORS locked to known origins in production (not `*`)
- [ ] Environment secrets (.env) never committed to git

---

## 11. Folder Structure

```
formconnect/
├── backend/
│   ├── src/
│   │   ├── routes/ (auth.js, projects.js, submit.js)
│   │   ├── middleware/ (auth.js, rateLimit.js)
│   │   ├── prisma/schema.prisma
│   │   └── index.js
│   └── package.json
├── dashboard/
│   ├── src/
│   │   ├── pages/ (Login, Register, Dashboard, ProjectView)
│   │   ├── components/ (SubmissionCard, FieldBuilder, ApiKeyBox)
│   │   └── App.jsx
│   └── package.json
└── README.md
```

---

## 12. Verdict Recap

- **As a business/public SaaS:** Low odds — Formspree/Web3Forms/FormSubmit already own this space with free tiers.
- **As personal infra + portfolio project:** High success — real multi-tenant architecture, reusable across all your projects, strong resume talking point.
- **Recommended framing:** "I built my own form backend infrastructure" — not "I'm launching a form SaaS."

---

## Next Step

Ready to scaffold: Prisma schema + Express backend boilerplate + basic dashboard shell. Say the word and code gets generated.
