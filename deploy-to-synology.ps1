# Laura Boekhoudsysteem - Synology Deployment Script
# Dit script helpt je om de applicatie naar je Synology NAS te deployen

param(
    [Parameter(Mandatory=$true)]
    [string]$NasIP,
    
    [Parameter(Mandatory=$true)]
    [string]$Username = "admin",
    
    [string]$ProjectPath = "/volume1/web/laura-boekhouding",
    [int]$Port = 3000
)

Write-Host "🚀 Laura Boekhoudsysteem - Synology Deployment" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green

# Stap 1: Controleer verbinding met NAS
Write-Host "`n📡 Stap 1: Verbinding testen met NAS ($NasIP)..." -ForegroundColor Yellow
try {
    $ping = Test-Connection -ComputerName $NasIP -Count 1 -Quiet
    if ($ping) {
        Write-Host "✅ NAS is bereikbaar" -ForegroundColor Green
    } else {
        Write-Host "❌ NAS is niet bereikbaar. Controleer IP adres." -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Fout bij verbinding testen: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Stap 2: Maak deployment package
Write-Host "`n📦 Stap 2: Deployment package maken..." -ForegroundColor Yellow

$deploymentFiles = @(
    "server.js",
    "package.json",
    "README.md",
    "public"
)

$tempDir = ".\deployment-temp"
if (Test-Path $tempDir) {
    Remove-Item $tempDir -Recurse -Force
}
New-Item -ItemType Directory -Path $tempDir | Out-Null

foreach ($file in $deploymentFiles) {
    if (Test-Path $file) {
        if ((Get-Item $file) -is [System.IO.DirectoryInfo]) {
            Copy-Item $file -Destination $tempDir -Recurse
        } else {
            Copy-Item $file -Destination $tempDir
        }
        Write-Host "✅ $file gekopieerd" -ForegroundColor Green
    } else {
        Write-Host "⚠️  $file niet gevonden" -ForegroundColor Yellow
    }
}

# Stap 3: Maak installatie script voor NAS
$installScript = @"
#!/bin/bash
# Laura Boekhoudsysteem - NAS Installatie Script

echo "🚀 Laura Boekhoudsysteem installeren..."

# Navigeer naar project directory
cd $ProjectPath

# Installeer dependencies
echo "📦 Dependencies installeren..."
npm install --production

# Maak database directory writable
chmod 755 .
chmod 666 laura_boekhouding.db 2>/dev/null || echo "Database wordt aangemaakt bij eerste start"

# Start service
echo "🚀 Service starten..."
node server.js &

echo "✅ Installatie voltooid!"
echo "🌐 Applicatie beschikbaar op: http://${NasIP}:${Port}"
echo "🔐 Login pagina: http://${NasIP}:${Port}/login"
"@

$installScript | Out-File -FilePath "$tempDir\install.sh" -Encoding UTF8

Write-Host "✅ Deployment package gemaakt in: $tempDir" -ForegroundColor Green

# Stap 4: Instructies voor handmatige upload
Write-Host "`n📋 Stap 3: Upload instructies" -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Open File Station op je Synology NAS" -ForegroundColor Cyan
Write-Host "2. Navigeer naar: $ProjectPath" -ForegroundColor Cyan
Write-Host "3. Upload alle bestanden uit de '$tempDir' folder" -ForegroundColor Cyan
Write-Host "4. Open SSH terminal op je NAS" -ForegroundColor Cyan
Write-Host "5. Voer uit: chmod +x $ProjectPath/install.sh" -ForegroundColor Cyan
Write-Host "6. Voer uit: $ProjectPath/install.sh" -ForegroundColor Cyan
Write-Host ""

# Stap 5: Web Station configuratie
Write-Host "`n⚙️ Stap 4: Web Station Configuratie" -ForegroundColor Yellow
Write-Host "====================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Open Web Station in DSM" -ForegroundColor Cyan
Write-Host "2. Ga naar Virtual Host tab" -ForegroundColor Cyan
Write-Host "3. Klik Create > Port-based" -ForegroundColor Cyan
Write-Host "4. Vul in:" -ForegroundColor Cyan
Write-Host "   - Port: $Port" -ForegroundColor White
Write-Host "   - Hostname: $NasIP" -ForegroundColor White
Write-Host "   - Document Root: $ProjectPath/public" -ForegroundColor White
Write-Host "   - HTTP Backend: Node.js" -ForegroundColor White
Write-Host "   - Node.js App Root: $ProjectPath" -ForegroundColor White
Write-Host ""

# Stap 6: Firewall configuratie
Write-Host "`n🔒 Stap 5: Firewall Configuratie" -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Open Control Panel > Security > Firewall" -ForegroundColor Cyan
Write-Host "2. Klik Edit Rules > Create" -ForegroundColor Cyan
Write-Host "3. Vul in:" -ForegroundColor Cyan
Write-Host "   - Port: $Port" -ForegroundColor White
Write-Host "   - Protocol: TCP" -ForegroundColor White
Write-Host "   - Source IP: All (of je netwerk)" -ForegroundColor White
Write-Host "   - Action: Allow" -ForegroundColor White
Write-Host ""

# Stap 7: Test instructies
Write-Host "`n🧪 Stap 6: Testen" -ForegroundColor Yellow
Write-Host "================" -ForegroundColor Yellow
Write-Host ""
Write-Host "Na installatie, test de applicatie:" -ForegroundColor Cyan
Write-Host "1. Open browser en ga naar: http://${NasIP}:${Port}" -ForegroundColor White
Write-Host "2. Je wordt doorgestuurd naar: http://${NasIP}:${Port}/login" -ForegroundColor White
Write-Host "3. Login met:" -ForegroundColor White
Write-Host "   - Gebruikersnaam: Laura" -ForegroundColor White
Write-Host "   - Wachtwoord: v7`$Kq9#TzP!4rWx2bLmN8sQ" -ForegroundColor White
Write-Host ""

# Stap 8: Monitoring instructies
Write-Host "`n📊 Monitoring" -ForegroundColor Yellow
Write-Host "=============" -ForegroundColor Yellow
Write-Host ""
Write-Host "Om de service te monitoren:" -ForegroundColor Cyan
Write-Host "1. SSH naar je NAS" -ForegroundColor White
Write-Host "2. Check status: ps aux | grep 'node server.js'" -ForegroundColor White
Write-Host "3. Check poort: netstat -tlnp | grep :$Port" -ForegroundColor White
Write-Host "4. Check logs: tail -f /var/log/messages | grep node" -ForegroundColor White
Write-Host ""

Write-Host "🎉 Deployment instructies voltooid!" -ForegroundColor Green
Write-Host "📁 Bestanden klaar in: $tempDir" -ForegroundColor Green
Write-Host "🌐 Na upload: http://${NasIP}:${Port}" -ForegroundColor Green

# Cleanup optie
$cleanup = Read-Host "`nWil je de temp folder verwijderen? (y/n)"
if ($cleanup -eq "y" -or $cleanup -eq "Y") {
    Remove-Item $tempDir -Recurse -Force
    Write-Host "✅ Temp folder verwijderd" -ForegroundColor Green
} else {
    Write-Host "📁 Temp folder behouden: $tempDir" -ForegroundColor Yellow
}
