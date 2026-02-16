# Laura Boekhoudsysteem — Project Overview

**What it is:** A web-based accounting and practice-management system for dietitians (diëtisten). It supports **multiple users (multi-tenant)**: each logged-in user gets their own isolated data (clients, appointments, expenses, settings).

**Tech stack:** Node.js (Express), Supabase (PostgreSQL + Auth + Storage), vanilla JS frontend. Deployable on Vercel or run locally.

---

## 1. Project structure

```
laura-boekhoudsysteem/
├── server.js                 # Express app: API, auth, static files, PDF handling
├── app.js                    # Frontend SPA logic (LauraBoekhouding class)
├── index.html                # Main app UI (local/dev)
├── index-production.html     # Main app UI served in production (root /)
├── index-github.html         # Demo variant (e.g. GitHub Pages, no backend)
├── login.html                # Login/register page (Supabase Auth)
├── styles.css                # Global styles
├── package.json              # Dependencies (express, @supabase/supabase-js, multer, etc.)
├── vercel.json               # Vercel config: routes, serverless function
├── .env                      # Local env (SUPABASE_URL, keys) — not committed
├── README.md                 # Quick start, features, deployment
├── DEPLOYMENT_GUIDE.md       # Detailed deploy steps (Supabase + Vercel)
├── PROJECT_OVERVIEW.md       # This document
└── supabase/
    └── migrations/
        └── 20240204000001_initial_schema.sql   # DB schema (tenants, tables)
```

**Important:** The app is served as a **single server**: `server.js` acts as both the API and the static file server. On Vercel, the same `server.js` is deployed as a serverless function; `vercel.json` routes all requests to it.

---

## 2. How it works — high-level flow

1. **User opens the app** → Root `/` serves `index-production.html` (or `index.html` locally).
2. **No token** → Frontend redirects to `/login` (login page).
3. **Login/register** → Handled in the browser via **Supabase Auth** (email/password). On success, the frontend stores the session’s access token in `localStorage` as `authToken` and redirects to `/`.
4. **App load** → Frontend calls `POST /api/verify-token` with `Authorization: Bearer <token>`. The server validates the JWT with Supabase and resolves or creates a **tenant** for that user. All further API calls use the same header.
5. **Data** → Frontend fetches klanten, afspraken, uitgaven, consulttypes, mutualiteiten, categorieën, dashboard, maandoverzicht, terugbetaling-signalen in parallel from the API. All API routes (except `/api/config` and deprecated `/api/login`) are protected by `authenticateToken` and scoped to `req.tenantId`.
6. **CRUD** → Add/edit/delete goes through the same Express API; tenant is always taken from the token, so users never see each other’s data.

---

## 3. Ins and outs — detailed

### 3.1 Entry points (in)

| Entry | File / route | Purpose |
|-------|----------------|--------|
| `/` | `server.js` → `index-production.html` | Main app (production). |
| `/index.html` | Redirect to `/` | Same as above. |
| `/login` | `server.js` → `login.html` | Login/register page. |
| `/api/config` | `GET /api/config` | Public: returns `supabaseUrl` and `supabaseAnonKey` for the frontend Supabase client. |
| All other `/api/*` | `server.js` | Require `Authorization: Bearer <access_token>`. |

### 3.2 Exit points (out)

| Out | How | Purpose |
|-----|-----|--------|
| **Supabase Auth** | From `login.html` (Supabase JS client) | Sign in, sign up, session. |
| **API calls** | From `app.js` via `fetch()` with `Authorization: Bearer <authToken>` | All data and actions. |
| **Redirect to /login** | When no token or 401/403 from API | Re-authenticate. |
| **Redirect to /** | After successful login/register | Enter app. |
| **PDF download** | `GET /api/afspraken/:id/pdf` returns a **signed URL**; frontend opens it | Download PDF for an appointment (tenant-scoped). |

### 3.3 Authentication flow

1. **Login page** (`login.html`):
   - Loads Supabase client with config from `/api/config`.
   - User enters email/password → `supabase.auth.signInWithPassword()` or `signUp()`.
   - On success: read `session.access_token`, save to `localStorage.authToken`, redirect to `/`.

2. **App** (`app.js`):
   - On init: if no `authToken` → redirect to `/login`.
   - Call `POST /api/verify-token` with `Authorization: Bearer <authToken>`.
   - If 401/403 or invalid: clear `authToken`, redirect to `/login`.
   - If 200: continue and load all data (all subsequent requests send the same header).

3. **Server** (`server.js`):
   - **authenticateToken** middleware: reads `Authorization` header, calls `supabase.auth.getUser(token)`. If valid, resolves **tenant** by `auth_user_id` (creates tenant + seeds defaults if first time), sets `req.authUser` and `req.tenantId`, then `next()`.
   - All protected routes use `authenticateToken` and filter by `req.tenantId`.

### 3.4 Multi-tenant model

- **Tenant** = one row in `tenants` per Supabase Auth user (`auth_user_id`). Created on first successful token verification.
- **Seed on first login:** For the new tenant, the server inserts default rows into `consulttypes`, `mutualiteiten`, and `categorieen`.
- **All business data** (klanten, afspraken, uitgaven, consulttypes, mutualiteiten, categorieen) have `tenant_id`; every query filters by `req.tenantId`. So each user only sees and edits their own data.

---

## 4. API reference (ins and outs per route)

All routes below (except where noted) require:  
`Authorization: Bearer <access_token>`

| Method | Route | In | Out | Notes |
|--------|--------|-----|-----|--------|
| GET | `/api/config` | — | `{ supabaseUrl, supabaseAnonKey }` | No auth. |
| POST | `/api/login` | — | 400 deprecated message | Supabase Auth used instead. |
| POST | `/api/verify-token` | — | `{ valid, user }` or 401/403 | Validates JWT, resolves tenant. |
| GET | `/api/consulttypes` | — | `[{ id, type, prijs }, ...]` | Tenant-scoped. |
| POST | `/api/consulttypes` | `{ type, prijs }` | New row | Tenant from token. |
| PUT | `/api/consulttypes/:id` | `{ type, prijs }` | — | Tenant-scoped. |
| GET | `/api/mutualiteiten` | — | `[{ id, naam, maxSessiesPerJaar, opmerking }, ...]` | Tenant-scoped; camelCase in response. |
| POST | `/api/mutualiteiten` | `{ naam, maxSessiesPerJaar, opmerking }` | New row | Tenant from token. |
| PUT | `/api/mutualiteiten/:id` | `{ naam, maxSessiesPerJaar, opmerking }` | — | Tenant-scoped. |
| GET | `/api/categorieen` | — | `[{ id, categorie }, ...]` | Tenant-scoped. |
| POST | `/api/categorieen` | `{ categorie }` | New row | Tenant from token. |
| PUT | `/api/categorieen/:id` | `{ categorie }` | — | Tenant-scoped. |
| GET | `/api/klanten` | — | `[{ id, voornaam, achternaam, email, telefoon, startdatum, mutualiteit_id, mutualiteit_naam }, ...]` | Tenant-scoped; mutualiteit names joined. |
| POST | `/api/klanten` | `{ voornaam, achternaam, email?, telefoon?, startdatum?, mutualiteit_id? }` | New row | Tenant from token. |
| PUT | `/api/klanten/:id` | Same fields | — | Tenant-scoped. |
| GET | `/api/afspraken` | — | List with klant + consulttype denormalized | Tenant-scoped. |
| POST | `/api/afspraken` | Form: datum, klant_id, type_id, aantal?, terugbetaalbaar?, opmerking? + optional `pdf` file | New row | PDF uploaded to Supabase Storage bucket `afspraak-pdfs`, key `{tenantId}/{timestamp}-{random}.pdf`; path stored in `pdf_bestand`. |
| PUT | `/api/afspraken/:id` | datum, klant_id, type_id, aantal, terugbetaalbaar, opmerking (no PDF update in this route) | — | Tenant-scoped; prijs/totaal/maand derived. |
| GET | `/api/afspraken/:id/pdf` | — | `{ url: signedUrl }` | Tenant-scoped; 404 if no PDF. |
| GET | `/api/uitgaven` | — | List with categorie name | Tenant-scoped. |
| POST | `/api/uitgaven` | `{ datum, beschrijving, categorie_id?, bedrag, betaalmethode? }` | New row | Tenant from token; maand derived. |
| PUT | `/api/uitgaven/:id` | Same fields | — | Tenant-scoped. |
| GET | `/api/dashboard` | — | `{ inkomsten, uitgaven, netto }` | Current month, tenant-scoped. |
| GET | `/api/maandoverzicht` | — | `[{ maand, inkomsten, uitgaven, netto }, ...]` | Current year, 12 months, tenant-scoped. |
| GET | `/api/terugbetaling-signalen` | — | `[{ klant_id, voornaam, achternaam, mutualiteit_naam, maxSessiesPerJaar, sessies_terugbetaalbaar }, ...]` | Clients at or over mutualiteit’s max reimbursed sessions this year. |

---

## 5. Database schema (Supabase/PostgreSQL)

Defined in `supabase/migrations/20240204000001_initial_schema.sql`:

| Table | Purpose |
|-------|--------|
| **tenants** | One per auth user: `id`, `auth_user_id` (unique), `display_name`, `created_at`. |
| **consulttypes** | Per tenant: type name, prijs (nullable). |
| **mutualiteiten** | Per tenant: naam, max_sessies_per_jaar, opmerking. |
| **categorieen** | Per tenant: categorie name (expense categories). |
| **klanten** | Per tenant: voornaam, achternaam, email, telefoon, startdatum, mutualiteit_id (FK). |
| **afspraken** | Per tenant: datum, klant_id, type_id, aantal, prijs, totaal, terugbetaalbaar, opmerking, maand (first day of month), pdf_bestand (storage key). |
| **uitgaven** | Per tenant: datum, beschrijving, categorie_id, bedrag, betaalmethode, maand. |

All tables except `tenants` have `tenant_id` and indexes for tenant + common filters (e.g. maand, datum). PDFs are stored in Supabase Storage bucket `afspraak-pdfs`; keys are stored in `afspraken.pdf_bestand`.

---

## 6. Frontend structure (app.js)

- **Class:** `LauraBoekhouding` (single instance on load).
- **State:** `this.data` holds klanten, afspraken, uitgaven, consulttypes, mutualiteiten, categorieen, dashboard, maandoverzicht, terugbetalingSignalen. `this.authToken` from localStorage.
- **Init:** Check token → verify with API → setup event listeners → `loadAllData()` (parallel fetch of all endpoints) → show dashboard, refresh chart.
- **Navigation:** Sidebar `data-page` → `showPage(page)` toggles which `.page` is active and updates header title.
- **Forms:** Modals for add/edit; submit handlers call `postData()` or `fetch()` with PUT, then reload data and update tables.
- **Auth:** Every `fetchData`/`postData` sends `Authorization: Bearer ${this.authToken}`; on 401/403 they clear token and redirect to `/login`.
- **PDF:** Afspraak PDF: frontend calls `GET /api/afspraken/:id/pdf`, gets signed URL, opens in new tab or downloads.

---

## 7. Deployment and HTML variants

- **Local:** `npm start` → Express serves from project root; root `/` can be configured to serve `index.html` or `index-production.html` (currently production uses `index-production.html`).
- **Vercel:** `vercel.json` sends all requests to `server.js`. Static assets (e.g. `styles.css`, `app.js`, `index-production.html`, `login.html`) are included in the function. Root `/` serves `index-production.html`; `/login` serves `login.html`.
- **Demo (e.g. GitHub Pages):** `index-github.html` is a variant that can run without the Node API (demo data only); see README/DEPLOYMENT_GUIDE.

---

## 8. Environment variables

Used by `server.js` (and optionally by Vercel):

| Variable | Purpose |
|----------|--------|
| `SUPABASE_URL` | Supabase project URL. |
| `SUPABASE_ANON_KEY` | Public anon key (exposed via `/api/config` for login page). |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side key for DB and Storage (never exposed to frontend). |
| `PORT` | Local server port (default 3000). |
| `VERCEL` / `NODE_ENV` | Used to avoid starting the HTTP server on Vercel (Vercel runs the function). |

---

## 9. Summary diagram

```
[Browser]
    │
    ├─ GET /         → index-production.html + app.js
    ├─ GET /login    → login.html (Supabase Auth → localStorage authToken)
    ├─ GET /api/config → { supabaseUrl, supabaseAnonKey } (no auth)
    │
    └─ All other API calls with Authorization: Bearer <token>
            │
            ▼
    [server.js]
            │
            ├─ authenticateToken → Supabase Auth (getUser) → resolveTenant → req.tenantId
            ├─ CRUD routes → Supabase DB (tenant_id filter)
            ├─ POST /api/afspraken (multipart) → Multer → Supabase Storage (afspraak-pdfs)
            └─ GET /api/afspraken/:id/pdf → Supabase Storage signed URL
                    │
                    ▼
            [Supabase]
                    ├─ Auth (users, sessions)
                    ├─ PostgreSQL (tenants, klanten, afspraken, uitgaven, …)
                    └─ Storage (bucket: afspraak-pdfs)
```

This document describes what the project is, how it is structured, and all main ins and outs of data and control flow.
