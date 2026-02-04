# Deployment Guide - Laura Boekhoudsysteem

## Overzicht

Dit project heeft **2 versies**:

### DEMO VERSIE (GitHub Pages)
- **Doel**: Presentaties, portfolio
- **Functionaliteit**: Interactieve UI met demo-data, geen login

### PRODUCTIE VERSIE (Vercel + Supabase)
- **Doel**: Multi-tenant gebruik door meerdere diëtisten; elke gebruiker heeft eigen data
- **Functionaliteit**: Supabase (Postgres, Auth, Storage), PDF-opslag in de cloud, authenticatie via e-mail/wachtwoord

---

## DEMO VERSIE (GitHub Pages)

- Bestanden: `index.html`, `app-demo.js`, `styles.css`
- Deploy: push naar `main` of GitHub Actions
- Geen configuratie nodig

---

## PRODUCTIE VERSIE (Vercel + Supabase)

### Wat je nodig hebt

1. **Supabase-project** ([supabase.com](https://supabase.com))
   - Maak een nieuw project
   - Noteer: **Project URL** en **API Keys** (anon key + service_role key)

2. **Vercel-account** ([vercel.com](https://vercel.com))
   - Importeer de repository

### Stap 1: Supabase instellen

1. Ga naar [Supabase Dashboard](https://app.supabase.com) en maak een project.

2. **Database-migratie uitvoeren**
   - Ga naar **SQL Editor**
   - Open het bestand `supabase/migrations/20240204000001_initial_schema.sql` uit dit project
   - Kopieer de inhoud en voer het uit in de SQL Editor

3. **Storage-bucket aanmaken**
   - Ga naar **Storage** in het Supabase-dashboard
   - Klik **New bucket**
   - Naam: `afspraak-pdfs`
   - Zet **Public bucket** uit (niet aanvinken)
   - Maak de bucket aan

4. **API-keys**
   - Ga naar **Project Settings** → **API**
   - Noteer:
     - **Project URL** (bijv. `https://xxxxx.supabase.co`)
     - **anon public** (voor de frontend)
     - **service_role** (alleen voor de backend; nooit in de frontend gebruiken)

### Stap 2: Vercel Environment Variables

In het Vercel-dashboard van je project: **Settings** → **Environment Variables**. Voeg toe:

| Naam | Waarde | Opmerking |
|------|--------|-----------|
| `SUPABASE_URL` | `https://xxxxx.supabase.co` | Je Supabase Project URL |
| `SUPABASE_ANON_KEY` | `eyJ...` | Supabase anon public key (voor login in de browser) |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` | Supabase service_role key (alleen server-side) |
| `NODE_ENV` | `production` | Optioneel |

**Belangrijk:** Zet geen secrets in `vercel.json`; gebruik alleen de Vercel-dashboard env vars.

### Stap 3: Deploy op Vercel

1. Importeer de GitHub-repository in Vercel
2. Build: wordt automatisch gedetecteerd (`npm install` via `vercel-build`)
3. Na deploy: open de Vercel-URL (bijv. `https://laura-boekhoudsysteem.vercel.app`)

### Eerste gebruik

- Ga naar **/login**
- Klik **Registreren** en maak een account aan (e-mail + wachtwoord)
- Na inloggen wordt automatisch een **tenant** aangemaakt met standaard consulttypes, mutualiteiten en categorieën
- Elke nieuwe gebruiker krijgt zo een eigen, lege dataset

---

## Multi-tenant model

- **Tenant** = één ingelogde gebruiker (één diëtist/praktijk)
- **Client (klant)** = een cliënt van die tenant; gekoppeld aan die tenant
- Alle data (klanten, afspraken, uitgaven, instellingen) is per tenant geïsoleerd

---

## Lokale ontwikkeling (productieversie)

1. Maak een Supabase-project en voer de migratie uit (zie hierboven)
2. Maak een `.env`-bestand in de projectmap (niet committen):

   ```
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   ```

3. Start de server:

   ```bash
   npm install
   npm start
   ```

4. Open `http://localhost:3000` en log in of registreer

---

## Beveiliging (productie)

- Authenticatie via **Supabase Auth** (e-mail/wachtwoord)
- API gebruikt Bearer-token; tenant wordt uit het token afgeleid
- PDF’s staan in Supabase Storage; download alleen via tijdelijke signed URL na autorisatie
- Gebruik altijd HTTPS (Vercel regelt dit)

---

## Bestanden (productie)

- `server.js` – Express API, Supabase-client, auth-middleware
- `login.html` – Inloggen/registreren (Supabase Auth)
- `app.js` – Frontend, token in `Authorization`-header
- `index-production.html` – Hoofdpagina app
- `supabase/migrations/` – Database-schema (tenants + tenant_id overal)
- `vercel.json` – Vercel-routes (geen secrets)
