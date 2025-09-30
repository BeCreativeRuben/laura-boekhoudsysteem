# Laura Boekhoudsysteem - Web Applicatie

Een moderne web-gebaseerde boekhoudingssysteem voor diëtistenpraktijk Laura, ontwikkeld als vervanging voor het Excel-systeem.

## 🚀 Functionaliteiten

- **Klantenbeheer**: Toevoegen, bewerken en beheren van klantgegevens
- **Afsprakenplanning**: Inplannen en beheren van consultaties
- **Uitgavenregistratie**: Bijhouden van bedrijfskosten per categorie
- **Dashboard**: Overzicht van inkomsten, uitgaven en statistieken
- **Verzekeringsmonitoring**: Tracking van sessies per verzekering
- **Instellingen**: Beheer van consulttypes, verzekeringen en categorieën
- **Beveiliging**: JWT-gebaseerde authenticatie

## 🛠️ Technologieën

- **Backend**: Node.js, Express.js, SQLite
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Authenticatie**: JWT (JSON Web Tokens), bcrypt
- **UI/UX**: Modern responsive design met Font Awesome icons

## 📦 Installatie

1. **Repository clonen**:
   ```bash
   git clone https://github.com/BeCreativeRuben/laura-boekhoudsysteem.git
   cd laura-boekhoudsysteem
   ```

2. **Dependencies installeren**:
   ```bash
   npm install
   ```

3. **Server starten**:
   ```bash
   npm start
   ```

4. **Applicatie openen**:
   - Ga naar http://localhost:3000
   - Login met: `Laura` / `v7$Kq9#TzP!4rWx2bLmN8sQ`

## 🔧 Development

Voor development met auto-reload:
```bash
npm run dev
```

## 📁 Project Structuur

```
laura-boekhoudsysteem/
├── public/                 # Frontend bestanden
│   ├── index.html         # Hoofdpagina
│   ├── login.html         # Login pagina
│   ├── styles.css         # Styling
│   └── app.js            # Frontend JavaScript
├── data/                  # Database bestanden
│   └── database.json      # JSON database (backup)
├── server.js              # Express server
├── package.json           # Dependencies
└── README.md             # Deze file
```

## 🔐 Beveiliging

- JWT-gebaseerde sessiebeheer
- Wachtwoorden gehashed met bcrypt
- Beveiligde API endpoints
- Geen open registratie (alleen admin toegang)

## 📊 Database

De applicatie gebruikt SQLite voor lokale ontwikkeling. De database wordt automatisch aangemaakt bij eerste start met:
- Standaard consulttypes
- Verzekeringsmaatschappijen
- Uitgavencategorieën
- Admin gebruiker

## 🚀 Deployment

De applicatie kan gedeployed worden op:
- **Heroku**: Gebruik de Procfile
- **Railway**: Directe Git integratie
- **VPS**: Node.js hosting
- **Docker**: Container deployment

## 📝 Licentie

Dit project is ontwikkeld voor diëtistenpraktijk Laura en is bedoeld voor intern gebruik.

## 👨‍💻 Ontwikkelaar

Ontwikkeld door BeCreativeRuben voor Laura's diëtistenpraktijk.