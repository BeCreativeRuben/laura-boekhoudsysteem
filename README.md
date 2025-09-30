# Laura Boekhoudsysteem

Een moderne web-gebaseerde boekhoudingsapplicatie voor sportdiëtist Laura, gebouwd met Node.js, Express, SQLite en vanilla JavaScript.

## 🚀 Live Demo

[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/yourusername/laura-boekhoudsysteem)

## ✨ Features

- **🔐 Beveiligde Login** - JWT token authenticatie met bcrypt password hashing
- **👥 Klantenbeheer** - Voeg klanten toe, bewerk en beheer hun gegevens
- **📅 Afsprakenbeheer** - Plan afspraken met automatische prijsberekening
- **💰 Uitgavenbeheer** - Track uitgaven per categorie
- **📊 Dashboard** - Overzicht van inkomsten, uitgaven en netto resultaat
- **⚠️ Terugbetaling monitoring** - Signalen voor klanten die drempel bereiken
- **⚙️ Instellingen** - Beheer consultatietypes, mutualiteiten en categorieën
- **📱 Responsive design** - Werkt op desktop, tablet en mobiel
- **🎨 Moderne UI** - Gebruiksvriendelijke interface met Chart.js grafieken

## 🛠️ Technologieën

- **Backend:** Node.js, Express.js
- **Database:** SQLite3
- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Charts:** Chart.js
- **Icons:** Font Awesome
- **Authentication:** JWT, bcryptjs

## 📋 Vereisten

- Node.js (versie 14 of hoger)
- npm (Node Package Manager)

## 🔧 Installatie

1. **Clone de repository**
   ```bash
   git clone https://github.com/yourusername/laura-boekhoudsysteem.git
   cd laura-boekhoudsysteem
   ```

2. **Installeer dependencies**
   ```bash
   npm install
   ```

3. **Start de applicatie**
   ```bash
   npm start
   ```

4. **Open je browser**
   Ga naar `http://localhost:3000`

## 🔐 Login Gegevens

- **Gebruikersnaam:** `Laura`
- **Wachtwoord:** `v7$Kq9#TzP!4rWx2bLmN8sQ`

## 📊 Database Schema

De applicatie gebruikt SQLite als database met de volgende tabellen:

- `users` - Gebruikers en authenticatie
- `consulttypes` - Consultatietypes en prijzen
- `mutualiteiten` - Verzekeringsmaatschappijen
- `categorieen` - Uitgavencategorieën
- `klanten` - Klantgegevens
- `afspraken` - Afspraken en facturering
- `uitgaven` - Uitgavenregistratie

## 🚀 Deployment

### Heroku

[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/yourusername/laura-boekhoudsysteem)

1. Klik op de "Deploy to Heroku" knop
2. Vul je app naam in
3. Klik "Deploy app"
4. Wacht tot deployment voltooid is
5. Open je app en log in

### Vercel

1. Fork deze repository
2. Ga naar [Vercel](https://vercel.com)
3. Import je GitHub repository
4. Vercel detecteert automatisch Node.js
5. Deploy!

### Railway

1. Ga naar [Railway](https://railway.app)
2. Klik "Deploy from GitHub repo"
3. Selecteer deze repository
4. Railway start automatisch de deployment

### Docker

```bash
# Build image
docker build -t laura-boekhoudsysteem .

# Run container
docker run -p 3000:3000 laura-boekhoudsysteem
```

## 🔧 Development

Voor development met auto-reload:

```bash
npm run dev
```

## 📱 Screenshots

### Dashboard
![Dashboard](screenshots/dashboard.png)

### Klantenbeheer
![Klantenbeheer](screenshots/klanten.png)

### Afsprakenbeheer
![Afsprakenbeheer](screenshots/afspraken.png)

## 🎯 Gebruik

### Dashboard
- Bekijk maandelijkse inkomsten, uitgaven en netto resultaat
- Maandoverzicht grafiek met Chart.js
- Snelle toegang tot alle functionaliteiten

### Klantenbeheer
- Voeg nieuwe klanten toe via de "Nieuwe Klant" knop
- Vul voornaam, achternaam, e-mail, telefoon en startdatum in
- Selecteer mutualiteit uit dropdown
- Bewerk bestaande klanten via de edit knop

### Afsprakenbeheer
- Plan nieuwe afspraken via "Nieuwe Afspraak" knop
- Selecteer klant en consultatietype
- Prijs wordt automatisch berekend op basis van type
- Markeer afspraken als terugbetaalbaar
- Voeg opmerkingen toe

### Uitgavenbeheer
- Registreer uitgaven via "Nieuwe Uitgave" knop
- Categoriseer uitgaven (Huur, Materiaal, Software, etc.)
- Voeg betaalmethode toe
- Bedragen worden automatisch toegevoegd aan maandoverzicht

### Terugbetaling Signalen
- Overzicht van klanten die drempel bereiken voor terugbetaling
- Gebaseerd op mutualiteitsregels en terugbetaalbare sessies
- Waarschuwingen voor klanten die limiet overschrijden

### Instellingen
- Beheer consultatietypes en prijzen
- Configureer mutualiteiten en hun regels
- Beheer uitgavencategorieën

## 🔒 Beveiliging

- **Password Hashing** - Bcrypt met salt
- **JWT Tokens** - Met expiry voor sessie management
- **API Endpoint Beveiliging** - Alle endpoints vereisen authenticatie
- **Input Validatie** - Zowel client-side als server-side
- **SQL Injection Bescherming** - Parameterized queries

## 📈 API Endpoints

### Authenticatie
- `POST /api/login` - Inloggen
- `POST /api/verify-token` - Token verifiëren

### Klanten
- `GET /api/klanten` - Haal alle klanten op
- `POST /api/klanten` - Voeg nieuwe klant toe
- `PUT /api/klanten/:id` - Update klant

### Afspraken
- `GET /api/afspraken` - Haal alle afspraken op
- `POST /api/afspraken` - Voeg nieuwe afspraak toe
- `PUT /api/afspraken/:id` - Update afspraak

### Uitgaven
- `GET /api/uitgaven` - Haal alle uitgaven op
- `POST /api/uitgaven` - Voeg nieuwe uitgave toe
- `PUT /api/uitgaven/:id` - Update uitgave

### Dashboard
- `GET /api/dashboard` - Haal KPI data op
- `GET /api/maandoverzicht` - Haal maandelijkse data op
- `GET /api/terugbetaling-signalen` - Haal terugbetaling signalen op

## 🤝 Contributing

1. Fork de repository
2. Maak een feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit je wijzigingen (`git commit -m 'Add some AmazingFeature'`)
4. Push naar de branch (`git push origin feature/AmazingFeature`)
5. Open een Pull Request

## 📝 Licentie

Dit project is gelicenseerd onder de MIT License - zie het [LICENSE](LICENSE) bestand voor details.

## 📞 Support

Voor vragen of problemen:
1. Maak een [Issue](https://github.com/yourusername/laura-boekhoudsysteem/issues) aan
2. Check de [Wiki](https://github.com/yourusername/laura-boekhoudsysteem/wiki) voor documentatie
3. Bekijk de [Discussions](https://github.com/yourusername/laura-boekhoudsysteem/discussions) voor vragen

## 🔄 Updates

De applicatie wordt regelmatig bijgewerkt met nieuwe features en bug fixes. Check de [releases](https://github.com/yourusername/laura-boekhoudsysteem/releases) voor details over updates.

---

**Laura Boekhoudsysteem** - Moderne web applicatie voor sportdiëtisten

⭐ **Star dit project als je het nuttig vindt!**