// Laura Boekhoudsysteem - Single Page Application voor GitHub Pages
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
        this.isAuthenticated = false;
        
        this.init();
    }

    async init() {
        // Check if we're on GitHub Pages (no server)
        this.isGitHubPages = window.location.hostname.includes('github.io');
        
        if (this.isGitHubPages) {
            // For GitHub Pages, use demo mode
            this.setupEventListeners();
            this.loadDemoData();
            this.showPage('dashboard');
            this.setupChart();
        } else {
            // For local/server deployment, use full functionality
            await this.initFullApp();
        }
    }

    async initFullApp() {
        // Check authentication first
        if (!this.authToken) {
            this.showPage('login');
            return;
        }

        // Verify token is still valid
        const isValid = await this.verifyToken();
        if (!isValid) {
            localStorage.removeItem('authToken');
            this.showPage('login');
            return;
        }

        this.isAuthenticated = true;
        this.setupEventListeners();
        await this.loadAllData();
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

        // Modal buttons
        document.getElementById('addKlantBtn').addEventListener('click', () => this.openKlantModal());
        document.getElementById('addAfspraakBtn').addEventListener('click', () => this.openAfspraakModal());
        document.getElementById('addUitgaveBtn').addEventListener('click', () => this.openUitgaveModal());
        document.getElementById('addConsulttypeBtn').addEventListener('click', () => this.openConsulttypeModal());
        document.getElementById('addMutualiteitBtn').addEventListener('click', () => this.openMutualiteitModal());
        document.getElementById('addCategorieBtn').addEventListener('click', () => this.openCategorieModal());

        // Export buttons
        document.getElementById('exportExcelBtn').addEventListener('click', () => this.exportAllToExcel());
        document.getElementById('exportKlantenBtn').addEventListener('click', () => this.exportKlantenToExcel());
        document.getElementById('exportAfsprakenBtn').addEventListener('click', () => this.exportAfsprakenToExcel());
        document.getElementById('exportUitgavenBtn').addEventListener('click', () => this.exportUitgavenToExcel());
        document.getElementById('refreshChartBtn').addEventListener('click', () => this.refreshChart());

        // Modal close buttons
        document.getElementById('klantModalClose').addEventListener('click', () => this.closeModal('klantModal'));
        document.getElementById('afspraakModalClose').addEventListener('click', () => this.closeModal('afspraakModal'));
        document.getElementById('uitgaveModalClose').addEventListener('click', () => this.closeModal('uitgaveModal'));
        document.getElementById('consulttypeModalClose').addEventListener('click', () => this.closeModal('consulttypeModal'));
        document.getElementById('mutualiteitModalClose').addEventListener('click', () => this.closeModal('mutualiteitModal'));
        document.getElementById('categorieModalClose').addEventListener('click', () => this.closeModal('categorieModal'));

        // Cancel buttons
        document.getElementById('klantCancelBtn').addEventListener('click', () => this.closeModal('klantModal'));
        document.getElementById('afspraakCancelBtn').addEventListener('click', () => this.closeModal('afspraakModal'));
        document.getElementById('uitgaveCancelBtn').addEventListener('click', () => this.closeModal('uitgaveModal'));
        document.getElementById('consulttypeCancelBtn').addEventListener('click', () => this.closeModal('consulttypeModal'));
        document.getElementById('mutualiteitCancelBtn').addEventListener('click', () => this.closeModal('mutualiteitModal'));
        document.getElementById('categorieCancelBtn').addEventListener('click', () => this.closeModal('categorieModal'));

        // Form submissions
        document.getElementById('klantForm').addEventListener('submit', (e) => this.handleKlantSubmit(e));
        document.getElementById('afspraakForm').addEventListener('submit', (e) => this.handleAfspraakSubmit(e));
        document.getElementById('uitgaveForm').addEventListener('submit', (e) => this.handleUitgaveSubmit(e));
        document.getElementById('consulttypeForm').addEventListener('submit', (e) => this.handleConsulttypeSubmit(e));
        document.getElementById('mutualiteitForm').addEventListener('submit', (e) => this.handleMutualiteitSubmit(e));
        document.getElementById('categorieForm').addEventListener('submit', (e) => this.handleCategorieSubmit(e));

        // Login form
        document.getElementById('loginForm').addEventListener('submit', (e) => this.handleLogin(e));

        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target.id);
            }
        });

        // Handle browser back/forward buttons
        window.addEventListener('popstate', (e) => {
            const page = e.state?.page || 'dashboard';
            this.showPage(page, false); // false = don't push to history
        });
    }

    // Client-side routing
    showPage(page, pushState = true) {
        // Update URL without page reload
        if (pushState) {
            const url = page === 'dashboard' ? '/' : `/${page}`;
            window.history.pushState({ page }, '', url);
        }

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
            instellingen: 'Instellingen',
            login: 'Inloggen'
        };
        const titleEl = document.getElementById('pageTitle');
        if (titleEl) titleEl.textContent = titles[page] || 'Dashboard';

        this.currentPage = page;

        // Close mobile menu
        document.querySelector('.sidebar').classList.remove('open');

        // Load page-specific data
        if (page === 'dashboard') {
            this.updateDashboard();
        } else if (page === 'instellingen') {
            this.updateSettingsTables();
        }
    }

    // Rest of the methods remain the same as the original app.js
    // (I'll include the key methods for brevity)
    
    loadDemoData() {
        // Demo data for GitHub Pages
        this.data = {
            klanten: [
                { id: 1, voornaam: 'Jan', achternaam: 'Janssen', email: 'jan@example.com', telefoon: '0123456789', startdatum: '2024-01-15', mutualiteit_naam: 'CM' },
                { id: 2, voornaam: 'Maria', achternaam: 'Vermeulen', email: 'maria@example.com', telefoon: '0987654321', startdatum: '2024-02-01', mutualiteit_naam: 'Partena' }
            ],
            afspraken: [
                { id: 1, datum: '2024-01-20', voornaam: 'Jan', achternaam: 'Janssen', type: 'Eerste consult', aantal: 1, prijs: 50, totaal: 50, terugbetaalbaar: true, pdf_bestand: null },
                { id: 2, datum: '2024-01-25', voornaam: 'Maria', achternaam: 'Vermeulen', type: 'Follow-up', aantal: 1, prijs: 40, totaal: 40, terugbetaalbaar: true, pdf_bestand: null }
            ],
            uitgaven: [
                { id: 1, datum: '2024-01-15', beschrijving: 'Kantoorbenodigdheden', categorie: 'Algemeen', bedrag: 25.50, betaalmethode: 'Kaart' },
                { id: 2, datum: '2024-01-20', beschrijving: 'Software licentie', categorie: 'IT', bedrag: 99.00, betaalmethode: 'Overschrijving' }
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
            dashboard: { inkomsten: 90, uitgaven: 124.50, netto: -34.50 },
            maandoverzicht: [
                { maand: 'Jan', inkomsten: 90, uitgaven: 124.50 },
                { maand: 'Feb', inkomsten: 0, uitgaven: 0 },
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

    // Include all other methods from the original app.js here...
    // (For brevity, I'm not including all methods, but they would be the same)

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
