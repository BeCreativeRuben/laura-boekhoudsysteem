# Diëtist Laura - Boekhoudsysteem

Een moderne web-gebaseerde boekhoudingssysteem voor diëtistenpraktijk Laura, speciaal ontwikkeld voor lokale installatie op de computer van de klant.

## 🚀 Functionaliteiten

- **Klantenbeheer**: Toevoegen, bewerken en beheren van klantgegevens
- **Afsprakenplanning**: Inplannen en beheren van consultaties met PDF upload
- **Uitgavenregistratie**: Bijhouden van bedrijfskosten per categorie
- **Dashboard**: Overzicht van inkomsten, uitgaven en statistieken
- **Verzekeringsmonitoring**: Tracking van sessies per verzekering
- **Instellingen**: Beheer van consulttypes, verzekeringen en categorieën
- **PDF Documenten**: Upload en download van PDF bestanden bij afspraken
- **Beveiliging**: JWT-gebaseerde authenticatie

## 📋 Systeemvereisten

- **Windows 10/11** (64-bit)
- **Node.js** versie 16 of hoger
- **Internetverbinding** (alleen voor eerste installatie)
- **Minimaal 2GB RAM**
- **500MB vrije schijfruimte**

## 🛠️ Stap-voor-Stap Installatie

### Stap 1: Node.js Installeren

1. **Download Node.js**:
   - Ga naar [nodejs.org](https://nodejs.org)
   - Download de **LTS versie** (aanbevolen)
   - Kies de **Windows Installer (.msi)** voor 64-bit

2. **Node.js Installeren**:
   - Dubbelklik op het gedownloade bestand
   - Volg de installatiewizard
   - **Belangrijk**: Vink "Add to PATH" aan
   - Klik "Install" en wacht tot installatie voltooid is

3. **Installatie Verifiëren**:
   - Open **Command Prompt** (cmd)
   - Type: `node --version`
   - Je zou iets moeten zien zoals: `v18.17.0`
   - Type: `npm --version`
   - Je zou iets moeten zien zoals: `9.6.7`

### Stap 2: Project Downloaden

1. **Download het project**:
   - Ga naar [GitHub Repository](https://github.com/BeCreativeRuben/laura-boekhoudsysteem)
   - Klik op de groene **"Code"** knop
   - Kies **"Download ZIP"**
   - Pak het ZIP bestand uit naar een map (bijv. `C:\Laura_Boekhouding`)

### Stap 3: Dependencies Installeren

1. **Open Command Prompt**:
   - Ga naar de project map (bijv. `C:\Laura_Boekhouding`)
   - Houd **Shift** ingedrukt en klik rechts
   - Kies **"Open PowerShell window here"**

2. **Installeer dependencies**:
   ```bash
   npm install
   ```
   - Wacht tot alle pakketten geïnstalleerd zijn
   - Dit kan 1-2 minuten duren

### Stap 4: Applicatie Starten

1. **Start de server**:
   ```bash
   npm start
   ```
   - Je ziet: `Laura Boekhoudsysteem server running on port 3000`

2. **Open de applicatie**:
   - Open je webbrowser
   - Ga naar: `http://localhost:3000`
   - Je ziet de login pagina

### Stap 5: Inloggen

**Standaard Login Gegevens**:
- **Gebruikersnaam**: `Laura`
- **Wachtwoord**: `v7$Kq9#TzP!4rWx2bLmN8sQ`

## 🎯 Dagelijks Gebruik

### Applicatie Starten
1. Ga naar de project map
2. Open Command Prompt in die map
3. Type: `npm start`
4. Open browser naar `http://localhost:3000`

### Applicatie Stoppen
- In Command Prompt: druk **Ctrl + C**
- Of sluit het Command Prompt venster

### Desktop Shortcut Maken (Optioneel)
1. Maak een nieuw tekstbestand
2. Kopieer dit erin:
   ```batch
   @echo off
   cd /d "C:\Laura_Boekhouding"
   start cmd /k "npm start"
   ```
3. Sla op als `Laura_Boekhouding.bat`
4. Rechtsklik → "Send to" → "Desktop"

## 📁 Project Structuur

```
Laura_Boekhouding/
├── public/                 # Frontend bestanden
│   ├── index.html         # Hoofdpagina
│   ├── login.html         # Login pagina
│   ├── styles.css         # Styling
│   └── app.js            # Frontend JavaScript
├── uploads/               # PDF bestanden (wordt automatisch aangemaakt)
├── data/                  # Database backup bestanden
├── server.js              # Express server
├── package.json           # Dependencies
└── README.md             # Deze handleiding
```

## 🔧 Probleemoplossing

### "node is not recognized"
- **Oplossing**: Herstart je computer na Node.js installatie
- Of voeg Node.js handmatig toe aan PATH

### "Port 3000 is already in use"
- **Oplossing**: Sluit andere applicaties die poort 3000 gebruiken
- Of wijzig de poort in `server.js` (regel 11)

### "Cannot find module"
- **Oplossing**: Ga naar project map en voer uit: `npm install`

### Applicatie laadt niet
- **Oplossing**: Controleer of server draait (zie Command Prompt)
- Controleer of je naar `http://localhost:3000` gaat

### PDF upload werkt niet
- **Oplossing**: Controleer of `uploads` map bestaat
- Controleer bestandsgrootte (max 10MB)

## 🔐 Beveiliging

- **Lokale installatie**: Alleen toegankelijk vanaf deze computer
- **Geen internet vereist**: Werkt volledig offline na installatie
- **Wachtwoord wijzigen**: Kan in `server.js` (regel 7-8)

## 📊 Database

- **SQLite database**: `laura_boekhouding.db` (wordt automatisch aangemaakt)
- **Backup**: Maak regelmatig een backup van de hele project map
- **Data veiligheid**: Alle data blijft lokaal op deze computer

## 🆘 Hulp Nodig?

### Logs Bekijken
- In Command Prompt zie je alle activiteit
- Foutmeldingen worden daar getoond

### Data Backup
- Kopieer de hele `Laura_Boekhouding` map
- Bewaar op een veilige locatie

### Reset Applicatie
- Verwijder `laura_boekhouding.db`
- Herstart de applicatie
- Database wordt opnieuw aangemaakt

## 📝 Licentie

Dit project is ontwikkeld voor diëtistenpraktijk Laura en is bedoeld voor intern gebruik.

## 👨‍💻 Ontwikkelaar

Ontwikkeld door BeCreativeRuben voor Laura's diëtistenpraktijk.

---

**Veel succes met het gebruik van Diëtist Laura!** 🎉