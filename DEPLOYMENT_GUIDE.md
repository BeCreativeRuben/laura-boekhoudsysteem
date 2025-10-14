# 🚀 Deployment Guide - Laura Boekhoudsysteem

## 📋 Overzicht

Dit project heeft **2 versies** voor verschillende doeleinden:

### 🎯 **DEMO VERSIE** (GitHub Pages)
- **Doel**: Klant presentaties, portfolio showcase
- **URL**: `https://becreativeruben.github.io/laura-boekhoudsysteem/`
- **Functionaliteit**: Interactieve UI demo met realistische data
- **Geen login vereist**

### 🏢 **PRODUCTIE VERSIE** (Vercel)
- **Doel**: Echte klant (Laura) dagelijks gebruik
- **URL**: `https://laura-boekhoudsysteem.vercel.app`
- **Functionaliteit**: Volledige database, authenticatie, file uploads
- **Login vereist**

---

## 🎯 DEMO VERSIE (GitHub Pages)

### **Wat het toont:**
- ✅ Interactieve dashboard met financiële overzichten
- ✅ Klantenbeheer met realistische data
- ✅ Afspraken overzicht met PDF voorbeelden
- ✅ Uitgaven tracking
- ✅ Grafieken en rapporten
- ✅ Responsive design op alle apparaten

### **Hoe te deployen:**
1. **Automatisch**: Push naar `main` branch = automatische deployment
2. **Handmatig**: Ga naar Settings → Pages → Source: GitHub Actions

### **Bestanden:**
- `index.html` - Hoofdpagina
- `app-demo.js` - Demo JavaScript
- `styles.css` - Stijlen
- `login.html` - Login pagina (niet gebruikt in demo)

---

## 🏢 PRODUCTIE VERSIE (Vercel)

### **Wat het biedt:**
- ✅ Volledige database functionaliteit
- ✅ Beveiligde login/authenticatie
- ✅ File uploads (PDF documenten)
- ✅ Excel export functionaliteit
- ✅ Real-time data updates
- ✅ Backup en data persistentie

### **Hoe te deployen:**

#### **Stap 1: Vercel Account**
1. Ga naar [vercel.com](https://vercel.com)
2. Login met GitHub account
3. Import repository: `BeCreativeRuben/laura-boekhoudsysteem`

#### **Stap 2: Environment Variables**
In Vercel dashboard, voeg toe:
```
JWT_SECRET=laura_boekhouding_secret_key_2024_secure
NODE_ENV=production
```

#### **Stap 3: Deploy**
- Vercel detecteert automatisch Node.js
- Deploy gebeurt automatisch bij elke push
- Krijg URL: `https://laura-boekhoudsysteem.vercel.app`

### **Bestanden:**
- `server.js` - Node.js server
- `index-production.html` - Productie hoofdpagina
- `app.js` - Volledige functionaliteit
- `package.json` - Dependencies
- `vercel.json` - Vercel configuratie

---

## 🔧 Lokale Ontwikkeling

### **Demo versie lokaal:**
```bash
# Simpele HTTP server
python -m http.server 8000
# Of
npx serve .
```

### **Productie versie lokaal:**
```bash
npm install
npm start
# Gaat naar http://localhost:3000
```

---

## 📁 Bestand Structuur

```
├── index.html              # Demo versie (GitHub Pages)
├── index-production.html   # Productie versie (Vercel)
├── app-demo.js            # Demo JavaScript
├── app.js                 # Productie JavaScript
├── server.js              # Node.js server
├── styles.css             # CSS stijlen
├── login.html             # Login pagina
├── vercel.json            # Vercel configuratie
├── .github/workflows/     # GitHub Actions
└── uploads/               # PDF bestanden
```

---

## 🎨 Customization

### **Demo Data Aanpassen:**
Bewerk `app-demo.js` → `loadDemoData()` functie

### **Styling Aanpassen:**
Bewerk `styles.css` voor beide versies

### **Functionaliteit Toevoegen:**
- Demo: Bewerk `app-demo.js`
- Productie: Bewerk `app.js` + `server.js`

---

## 🔐 Beveiliging

### **Demo Versie:**
- Geen beveiliging nodig (statische data)
- Perfect voor presentaties

### **Productie Versie:**
- JWT token authenticatie
- Beveiligde API endpoints
- File upload validatie
- HTTPS automatisch via Vercel

---

## 📞 Support

Voor vragen of problemen:
- **GitHub Issues**: Repository issues tab
- **Email**: [jouw email]
- **Documentatie**: README.md

---

## 🚀 Quick Start

### **Demo tonen aan klant:**
1. Ga naar GitHub Pages URL
2. Toon alle functionaliteiten
3. Leg uit dat dit de interface is

### **Productie voor klant:**
1. Deploy naar Vercel
2. Geef login gegevens aan Laura
3. Train Laura op het systeem
4. Monitor gebruik via Vercel dashboard
