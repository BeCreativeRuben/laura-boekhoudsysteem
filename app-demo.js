// Laura Boekhoudsysteem - DEMO VERSIE voor klant presentaties
class LauraBoekhouding {
    constructor() {
        this.currentPage = 'dashboard';
        this.data = {
            klanten: [],
            afspraken: [],
            uitgaven: [],
            consulttypes: [],
            mutualiteiten: [],
            categorieen: [],
            dashboard: null,
            maandoverzicht: [],
            terugbetalingSignalen: []
        };
        this.authToken = localStorage.getItem('authToken');
        
        this.init();
    }

    async init() {
        // For GitHub Pages, show demo mode instead of redirecting to login
        this.setupEventListeners();
        this.loadDemoData();
        this.showPage('dashboard');
        this.setupChart();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const page = e.currentTarget.dataset.page;
                this.showPage(page);
            });
        });

        // Menu toggle for mobile
        document.getElementById('menuToggle').addEventListener('click', () => {
            document.querySelector('.sidebar').classList.toggle('open');
        });

        // Logout button
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());

        // Export buttons
        document.getElementById('exportExcelBtn').addEventListener('click', () => this.exportAllToExcel());
        document.getElementById('exportKlantenBtn').addEventListener('click', () => this.exportKlantenToExcel());
        document.getElementById('exportAfsprakenBtn').addEventListener('click', () => this.exportAfsprakenToExcel());
        document.getElementById('exportUitgavenBtn').addEventListener('click', () => this.exportUitgavenToExcel());
        document.getElementById('refreshChartBtn').addEventListener('click', () => this.refreshChart());

        // Close mobile menu when clicking outside
        window.addEventListener('click', (e) => {
            if (!e.target.closest('.sidebar') && !e.target.closest('.menu-toggle')) {
                document.querySelector('.sidebar').classList.remove('open');
            }
        });
    }

    loadDemoData() {
        // Realistische demo data voor klant presentaties
        this.data = {
            klanten: [
                { id: 1, voornaam: 'Sarah', achternaam: 'Vandeputte', email: 'sarah.vandeputte@email.com', telefoon: '0478 12 34 56', startdatum: '2024-01-15', mutualiteit_naam: 'CM' },
                { id: 2, voornaam: 'Tom', achternaam: 'De Smet', email: 'tom.desmet@email.com', telefoon: '0489 87 65 43', startdatum: '2024-02-01', mutualiteit_naam: 'Partena' },
                { id: 3, voornaam: 'Lisa', achternaam: 'Peeters', email: 'lisa.peeters@email.com', telefoon: '0475 55 44 33', startdatum: '2024-02-15', mutualiteit_naam: 'CM' },
                { id: 4, voornaam: 'Mark', achternaam: 'Janssens', email: 'mark.janssens@email.com', telefoon: '0488 99 88 77', startdatum: '2024-03-01', mutualiteit_naam: 'OZ' }
            ],
            afspraken: [
                { id: 1, datum: '2024-01-20', voornaam: 'Sarah', achternaam: 'Vandeputte', type: 'Eerste consult', aantal: 1, prijs: 50, totaal: 50, terugbetaalbaar: true, pdf_bestand: 'consult-sarah-2024-01-20.pdf' },
                { id: 2, datum: '2024-01-25', voornaam: 'Tom', achternaam: 'De Smet', type: 'Follow-up', aantal: 1, prijs: 40, totaal: 40, terugbetaalbaar: true, pdf_bestand: 'consult-tom-2024-01-25.pdf' },
                { id: 3, datum: '2024-02-05', voornaam: 'Lisa', achternaam: 'Peeters', type: 'Eerste consult', aantal: 1, prijs: 50, totaal: 50, terugbetaalbaar: true, pdf_bestand: null },
                { id: 4, datum: '2024-02-10', voornaam: 'Sarah', achternaam: 'Vandeputte', type: 'Follow-up', aantal: 1, prijs: 40, totaal: 40, terugbetaalbaar: true, pdf_bestand: 'consult-sarah-2024-02-10.pdf' },
                { id: 5, datum: '2024-02-15', voornaam: 'Mark', achternaam: 'Janssens', type: 'Eerste consult', aantal: 1, prijs: 50, totaal: 50, terugbetaalbaar: true, pdf_bestand: null },
                { id: 6, datum: '2024-02-20', voornaam: 'Tom', achternaam: 'De Smet', type: 'Teleconsultatie', aantal: 1, prijs: 30, totaal: 30, terugbetaalbaar: false, pdf_bestand: null }
            ],
            uitgaven: [
                { id: 1, datum: '2024-01-15', beschrijving: 'Kantoorbenodigdheden', categorie: 'Algemeen', bedrag: 25.50, betaalmethode: 'Kaart' },
                { id: 2, datum: '2024-01-20', beschrijving: 'Software licentie', categorie: 'IT', bedrag: 99.00, betaalmethode: 'Overschrijving' },
                { id: 3, datum: '2024-02-01', beschrijving: 'Internet abonnement', categorie: 'IT', bedrag: 45.00, betaalmethode: 'Overschrijving' },
                { id: 4, datum: '2024-02-10', beschrijving: 'Koffie en thee', categorie: 'Algemeen', bedrag: 12.75, betaalmethode: 'Kaart' },
                { id: 5, datum: '2024-02-15', beschrijving: 'Printer papier', categorie: 'Kantoor', bedrag: 18.90, betaalmethode: 'Kaart' }
            ],
            consulttypes: [
                { id: 1, type: 'Eerste consult', prijs: 50 },
                { id: 2, type: 'Follow-up', prijs: 40 },
                { id: 3, type: 'Teleconsultatie', prijs: 30 }
            ],
            mutualiteiten: [
                { id: 1, naam: 'CM', maxSessiesPerJaar: 8, opmerking: 'Christelijke Mutualiteit' },
                { id: 2, naam: 'Partena', maxSessiesPerJaar: 6, opmerking: 'Partena Mutualiteit' }
            ],
            categorieen: [
                { id: 1, categorie: 'Algemeen' },
                { id: 2, categorie: 'IT' },
                { id: 3, categorie: 'Kantoor' }
            ],
            dashboard: { inkomsten: 260, uitgaven: 201.15, netto: 58.85 },
            maandoverzicht: [
                { maand: 'Jan', inkomsten: 90, uitgaven: 124.50 },
                { maand: 'Feb', inkomsten: 170, uitgaven: 76.65 },
                { maand: 'Mrt', inkomsten: 0, uitgaven: 0 },
                { maand: 'Apr', inkomsten: 0, uitgaven: 0 },
                { maand: 'Mei', inkomsten: 0, uitgaven: 0 },
                { maand: 'Jun', inkomsten: 0, uitgaven: 0 },
                { maand: 'Jul', inkomsten: 0, uitgaven: 0 },
                { maand: 'Aug', inkomsten: 0, uitgaven: 0 },
                { maand: 'Sep', inkomsten: 0, uitgaven: 0 },
                { maand: 'Okt', inkomsten: 0, uitgaven: 0 },
                { maand: 'Nov', inkomsten: 0, uitgaven: 0 },
                { maand: 'Dec', inkomsten: 0, uitgaven: 0 }
            ],
            terugbetalingSignalen: []
        };

        this.updateAllTables();
        this.updateDashboard();
    }

    updateAllTables() {
        this.updateKlantenTable();
        this.updateAfsprakenTable();
        this.updateUitgavenTable();
        this.updateTerugbetalingTable();
    }

    updateKlantenTable() {
        const tbody = document.getElementById('klantenTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = '';

        if (this.data.klanten.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-state">
                        <i class="fas fa-users"></i>
                        <h3>Geen klanten gevonden</h3>
                        <p>Voeg je eerste klant toe om te beginnen</p>
                    </td>
                </tr>
            `;
            return;
        }

        this.data.klanten.forEach(klant => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${klant.id}</td>
                <td>${klant.voornaam} ${klant.achternaam}</td>
                <td>${klant.email || '-'}</td>
                <td>${klant.telefoon || '-'}</td>
                <td>${klant.startdatum ? new Date(klant.startdatum).toLocaleDateString('nl-NL') : '-'}</td>
                <td>${klant.mutualiteit_naam || '-'}</td>
                <td>
                    <button class="btn btn-sm btn-secondary" onclick="app.editKlant(${klant.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    updateAfsprakenTable() {
        const tbody = document.getElementById('afsprakenTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = '';

        if (this.data.afspraken.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" class="empty-state">
                        <i class="fas fa-calendar-alt"></i>
                        <h3>Geen afspraken gevonden</h3>
                        <p>Voeg je eerste afspraak toe om te beginnen</p>
                    </td>
                </tr>
            `;
            return;
        }

        this.data.afspraken.forEach(afspraak => {
            const row = document.createElement('tr');
            const pdfButton = afspraak.pdf_bestand ? 
                `<button class="btn btn-sm btn-info" onclick="app.downloadPDF('${afspraak.pdf_bestand}')" title="Download PDF">
                    <i class="fas fa-file-pdf"></i>
                </button>` : 
                '<span class="text-muted">-</span>';
            
            row.innerHTML = `
                <td>${new Date(afspraak.datum).toLocaleDateString('nl-NL')}</td>
                <td>${afspraak.voornaam} ${afspraak.achternaam}</td>
                <td>${afspraak.type}</td>
                <td>${afspraak.aantal}</td>
                <td>€${afspraak.prijs ? afspraak.prijs.toFixed(2) : '0.00'}</td>
                <td>€${afspraak.totaal ? afspraak.totaal.toFixed(2) : '0.00'}</td>
                <td>${afspraak.terugbetaalbaar ? 'Ja' : 'Nee'}</td>
                <td>${pdfButton}</td>
                <td>
                    <button class="btn btn-sm btn-secondary" onclick="app.editAfspraak(${afspraak.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    updateUitgavenTable() {
        const tbody = document.getElementById('uitgavenTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = '';

        if (this.data.uitgaven.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-state">
                        <i class="fas fa-receipt"></i>
                        <h3>Geen uitgaven gevonden</h3>
                        <p>Voeg je eerste uitgave toe om te beginnen</p>
                    </td>
                </tr>
            `;
            return;
        }

        this.data.uitgaven.forEach(uitgave => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${new Date(uitgave.datum).toLocaleDateString('nl-NL')}</td>
                <td>${uitgave.beschrijving}</td>
                <td>${uitgave.categorie || '-'}</td>
                <td>€${uitgave.bedrag.toFixed(2)}</td>
                <td>${uitgave.betaalmethode || '-'}</td>
                <td>
                    <button class="btn btn-sm btn-secondary" onclick="app.editUitgave(${uitgave.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    updateTerugbetalingTable() {
        const tbody = document.getElementById('terugbetalingTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = '';

        if (this.data.terugbetalingSignalen.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="empty-state">
                        <i class="fas fa-check-circle"></i>
                        <h3>Geen terugbetaling signalen</h3>
                        <p>Alle klanten zitten binnen hun limieten</p>
                    </td>
                </tr>
            `;
            return;
        }

        this.data.terugbetalingSignalen.forEach(signaal => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${signaal.voornaam} ${signaal.achternaam}</td>
                <td>${signaal.mutualiteit_naam || '-'}</td>
                <td>${signaal.sessies_terugbetaalbaar}</td>
                <td>${signaal.maxSessiesPerJaar || '-'}</td>
                <td>
                    <span class="message error" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;">
                        MELDEN: klant informeren over terugbetaling
                    </span>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    updateDashboard() {
        if (this.data.dashboard) {
            const inkomstenEl = document.getElementById('inkomsten-value');
            const uitgavenEl = document.getElementById('uitgaven-value');
            const nettoEl = document.getElementById('netto-value');
            
            if (inkomstenEl) inkomstenEl.textContent = `€${this.data.dashboard.inkomsten.toFixed(2)}`;
            if (uitgavenEl) uitgavenEl.textContent = `€${this.data.dashboard.uitgaven.toFixed(2)}`;
            if (nettoEl) nettoEl.textContent = `€${this.data.dashboard.netto.toFixed(2)}`;
        }
    }

    setupChart() {
        const ctx = document.getElementById('monthlyChart');
        if (!ctx) return;

        const months = ['Jan', 'Feb', 'Mrt', 'Apr', 'Mei', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'];
        const inkomsten = this.data.maandoverzicht.map(m => m.inkomsten);
        const uitgaven = this.data.maandoverzicht.map(m => m.uitgaven);

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: months,
                datasets: [{
                    label: 'Inkomsten',
                    data: inkomsten,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4
                }, {
                    label: 'Uitgaven',
                    data: uitgaven,
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '€' + value.toFixed(0);
                            }
                        }
                    }
                }
            }
        });
    }

    showPage(page) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        const navItem = document.querySelector(`[data-page="${page}"]`);
        if (navItem) navItem.classList.add('active');

        // Update page content
        document.querySelectorAll('.page').forEach(p => {
            p.classList.remove('active');
        });
        const pageEl = document.getElementById(`${page}-page`);
        if (pageEl) pageEl.classList.add('active');

        // Update page title
        const titles = {
            dashboard: 'Dashboard',
            klanten: 'Klantenbeheer',
            afspraken: 'Afsprakenbeheer',
            uitgaven: 'Uitgavenbeheer',
            terugbetaling: 'Terugbetaling Signalen',
            instellingen: 'Instellingen'
        };
        const titleEl = document.getElementById('pageTitle');
        if (titleEl) titleEl.textContent = titles[page] || 'Dashboard';

        this.currentPage = page;

        // Close mobile menu
        document.querySelector('.sidebar').classList.remove('open');
    }

    // Demo functions
    editKlant(id) {
        this.showMessage('Dit is een demo versie. Voor volledige functionaliteit, gebruik de lokale versie.', 'info');
    }

    editAfspraak(id) {
        this.showMessage('Dit is een demo versie. Voor volledige functionaliteit, gebruik de lokale versie.', 'info');
    }

    editUitgave(id) {
        this.showMessage('Dit is een demo versie. Voor volledige functionaliteit, gebruik de lokale versie.', 'info');
    }

    downloadPDF(filename) {
        this.showMessage('PDF download niet beschikbaar in demo versie.', 'info');
    }

    logout() {
        this.showMessage('Uitloggen niet beschikbaar in demo versie.', 'info');
    }

    exportAllToExcel() {
        this.showMessage('Excel export niet beschikbaar in demo versie.', 'info');
    }

    exportKlantenToExcel() {
        this.showMessage('Excel export niet beschikbaar in demo versie.', 'info');
    }

    exportAfsprakenToExcel() {
        this.showMessage('Excel export niet beschikbaar in demo versie.', 'info');
    }

    exportUitgavenToExcel() {
        this.showMessage('Excel export niet beschikbaar in demo versie.', 'info');
    }

    refreshChart() {
        this.setupChart();
        this.showMessage('Grafiek ververst!', 'success');
    }

    showMessage(message, type = 'success') {
        // Remove existing messages
        document.querySelectorAll('.message').forEach(msg => msg.remove());
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;
        
        const pageContent = document.querySelector('.page-content');
        if (pageContent) {
            pageContent.insertBefore(messageDiv, pageContent.firstChild);
            
            // Auto remove after 5 seconds
            setTimeout(() => {
                messageDiv.remove();
            }, 5000);
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new LauraBoekhouding();
});
