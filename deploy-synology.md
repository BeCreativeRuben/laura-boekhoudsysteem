# Laura Boekhoudsysteem - Synology NAS Deployment

## 📋 Vereisten
- Synology NAS met DSM 7.0 of hoger
- Node.js Package geïnstalleerd via Package Center
- Docker Package (optioneel, voor betere isolatie)

## 🔧 Stap 1: Node.js Installeren op Synology

1. **Open DSM** (DiskStation Manager) op je NAS
2. Ga naar **Package Center**
3. Zoek naar **"Node.js"** 
4. Installeer **Node.js v18** (of nieuwste versie)
5. Wacht tot installatie voltooid is

## 📁 Stap 2: Bestanden Uploaden

### Optie A: Via File Station
1. Open **File Station** op je NAS
2. Maak een nieuwe map: `/volume1/web/laura-boekhouding/`
3. Upload alle bestanden naar deze map:
   - `server.js`
   - `package.json`
   - `public/` folder (met alle bestanden)
   - `README.md`

### Optie B: Via SSH (Geavanceerd)
```bash
# SSH naar je NAS
ssh admin@[NAS-IP]

# Navigeer naar web directory
cd /volume1/web/

# Maak project directory
mkdir laura-boekhouding
cd laura-boekhouding

# Upload bestanden (via SCP of andere methode)
```

## ⚙️ Stap 3: Dependencies Installeren

### Via SSH Terminal:
```bash
# Navigeer naar project directory
cd /volume1/web/laura-boekhouding

# Installeer Node.js dependencies
npm install --production

# Controleer of alles geïnstalleerd is
ls -la node_modules/
```

## 🚀 Stap 4: Service Starten

### Optie A: Via Task Scheduler (Aanbevolen)
1. Open **Control Panel** > **Task Scheduler**
2. Klik **Create** > **Triggered Task** > **User-defined script**
3. Vul in:
   - **Task Name:** `Laura Boekhoudsysteem`
   - **User:** `root`
   - **Event:** `Boot-up`
   - **Enabled:** ✅
4. In **Task Settings** tab:
   - **Run command:** 
   ```bash
   cd /volume1/web/laura-boekhouding && node server.js
   ```
5. Klik **OK** en **Run** om te testen

### Optie B: Via SSH (Handmatig)
```bash
# Start de service
cd /volume1/web/laura-boekhouding
node server.js &

# Controleer of het draait
ps aux | grep node
netstat -tlnp | grep :3000
```

## 🌐 Stap 5: Web Station Configureren

1. Open **Web Station** in DSM
2. Ga naar **Virtual Host** tab
3. Klik **Create** > **Port-based**
4. Vul in:
   - **Port:** `3000`
   - **Hostname:** `localhost` of je NAS IP
   - **Document Root:** `/volume1/web/laura-boekhouding/public`
   - **HTTP Backend:** `Node.js`
   - **Node.js App Root:** `/volume1/web/laura-boekhouding`

## 🔒 Stap 6: Firewall Configureren

1. Open **Control Panel** > **Security** > **Firewall**
2. Klik **Edit Rules** > **Create**
3. Vul in:
   - **Port:** `3000`
   - **Protocol:** `TCP`
   - **Source IP:** `All` (of specifiek netwerk)
   - **Action:** `Allow`

## 📱 Stap 7: Toegang Testen

### Lokaal Netwerk:
- **URL:** `http://[NAS-IP]:3000`
- **Login:** `http://[NAS-IP]:3000/login`

### Vanaf Internet (optioneel):
1. Configureer **Port Forwarding** op je router
2. Stel **DDNS** in via Synology
3. Gebruik **Let's Encrypt** voor HTTPS

## 🔧 Troubleshooting

### Service start niet:
```bash
# Check logs
tail -f /var/log/messages | grep node

# Check Node.js versie
node --version
npm --version

# Check poort gebruik
netstat -tlnp | grep :3000
```

### Database problemen:
```bash
# Check database permissies
ls -la /volume1/web/laura-boekhouding/
chmod 666 laura_boekhouding.db
```

### Performance optimalisatie:
```bash
# PM2 installeren voor process management
npm install -g pm2

# Start met PM2
pm2 start server.js --name "laura-boekhouding"
pm2 save
pm2 startup
```

## 📊 Monitoring

### Service Status Check:
```bash
# Check of service draait
ps aux | grep "node server.js"

# Check poort
netstat -tlnp | grep :3000

# Check logs
pm2 logs laura-boekhouding
```

## 🔄 Updates

### Code Update:
1. Upload nieuwe bestanden via File Station
2. Herstart service via Task Scheduler
3. Of via SSH: `pm2 restart laura-boekhouding`

## 🛡️ Beveiliging Tips

1. **Firewall:** Alleen noodzakelijke poorten openen
2. **HTTPS:** Gebruik Let's Encrypt certificaat
3. **Backup:** Regelmatig database backuppen
4. **Updates:** Houd Node.js en packages up-to-date
5. **Monitoring:** Controleer logs regelmatig

## 📞 Support

Bij problemen:
1. Check Synology logs in **Log Center**
2. Controleer Node.js logs
3. Test lokaal eerst: `curl http://localhost:3000`
4. Check firewall en poort instellingen
