# GitHub Pages Setup

Dit project is geconfigureerd om te werken met GitHub Pages. Hier is hoe je het instelt:

## Stappen voor GitHub Pages

1. **Ga naar je repository settings**
   - Ga naar https://github.com/BeCreativeRuben/laura-boekhoudsysteem/settings/pages

2. **Configureer GitHub Pages**
   - Onder "Source", selecteer "GitHub Actions"
   - Dit activeert de automatische deployment workflow

3. **Wacht op deployment**
   - Na elke push naar de `main` branch wordt automatisch een nieuwe versie gedeployed
   - Je kunt de status bekijken onder de "Actions" tab

## Wat wordt gedeployed

De GitHub Pages versie bevat:
- ✅ `index.html` - Hoofdpagina (statische demo)
- ✅ `login.html` - Login pagina
- ✅ `styles.css` - Stijlen
- ✅ `app.js` - Frontend JavaScript (demo versie)
- ❌ Server-side functionaliteit (database, API endpoints)
- ❌ File uploads
- ❌ Authenticatie

## Lokale ontwikkeling

Voor volledige functionaliteit, run lokaal:

```bash
npm install
npm start
```

Dit start de volledige Node.js server met database ondersteuning.

## Demo vs Volledige versie

- **GitHub Pages**: Statische demo met UI/UX preview
- **Lokaal/Server**: Volledige functionaliteit met database en API

## Bestanden structuur

```
├── index.html          # Hoofdpagina (GitHub Pages)
├── login.html          # Login pagina
├── styles.css          # CSS stijlen
├── app.js             # Frontend JavaScript
├── server.js          # Node.js server (lokaal)
├── package.json       # Dependencies
└── .github/workflows/ # GitHub Actions configuratie
```
