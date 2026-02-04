# Boekhoudsysteem voor diëtisten

Een web-gebaseerd boekhoudsysteem voor diëtisten: klanten, afspraken, uitgaven en dashboard. Geschikt voor **meerdere gebruikers**: elke gebruiker (tenant) heeft een eigen, afgeschermde dataset.

## Functionaliteiten

- **Klantenbeheer**: Toevoegen, bewerken en beheren van klantgegevens
- **Afsprakenplanning**: Inplannen en beheren van consultaties met PDF-upload
- **Uitgavenregistratie**: Bijhouden van bedrijfskosten per categorie
- **Dashboard**: Overzicht van inkomsten, uitgaven en statistieken
- **Verzekeringsmonitoring**: Tracking van sessies per verzekering
- **Instellingen**: Beheer van consulttypes, verzekeringen en categorieën
- **PDF-documenten**: Upload en download van PDF’s bij afspraken (Supabase Storage)
- **Authenticatie**: Inloggen en registreren via e-mail/wachtwoord (Supabase Auth)

## Twee manieren om te draaien

### 1. Cloud (aanbevolen): Vercel + Supabase

- **Multi-tenant**: Elke nieuwe gebruiker krijgt een eigen account en eigen data.
- **Geen server beheren**: Deploy op Vercel; database en bestanden in Supabase.
- Zie **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** voor stappen: Supabase-project, migratie, Storage-bucket en Vercel environment variables.

### 2. Lokaal (ontwikkeling)

**Vereisten:** Node.js 16+, een Supabase-project (gratis tier kan).

1. Clone of download het project.
2. Maak een Supabase-project op [supabase.com](https://supabase.com), voer de SQL uit uit `supabase/migrations/20240204000001_initial_schema.sql`, en maak een Storage-bucket `afspraak-pdfs`.
3. Maak in de projectmap een `.env`-bestand (niet committen):
   ```
   SUPABASE_URL=https://jouw-project.supabase.co
   SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   ```
4. Installeer en start:
   ```bash
   npm install
   npm start
   ```
5. Open `http://localhost:3000` → loginpagina. Klik op **Registreren** om een account aan te maken; je krijgt dan automatisch een eigen tenant met standaard instellingen.

## Demo-versie (zonder backend)

Voor presentaties of alleen de UI: gebruik de **demo** die op GitHub Pages draait (zie DEPLOYMENT_GUIDE). Geen login, vaste demo-data.

## Projectstructuur

```
├── server.js              # Express API, Supabase, auth-middleware
├── login.html             # Inloggen/registreren (Supabase Auth)
├── index-production.html   # Hoofdpagina app
├── app.js                 # Frontend (token in Authorization-header)
├── styles.css
├── supabase/
│   └── migrations/        # Database-schema (tenants + tenant_id)
├── vercel.json            # Vercel-routes
├── package.json
├── DEPLOYMENT_GUIDE.md    # Uitgebreide deploy-instructies
└── README.md
```

## Multi-tenant model

- **Tenant** = één ingelogde gebruiker (bijv. één diëtist of praktijk).
- **Client (klant)** = een cliënt van die tenant; hoort bij die tenant.
- Klanten, afspraken, uitgaven en instellingen zijn per tenant geïsoleerd.

## Beveiliging

- Authenticatie via Supabase Auth (e-mail/wachtwoord).
- API vereist Bearer-token; tenant wordt uit het token bepaald.
- PDF’s in Supabase Storage; download alleen via signed URL na autorisatie.

## Licentie

MIT. Ontwikkeld voor diëtistenpraktijken.
