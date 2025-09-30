// Laura Boekhoudsysteem - Frontend JavaScript
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
        // Check authentication first
        if (!this.authToken) {
            window.location.href = '/login';
            return;
        }

        // Verify token is still valid
        const isValid = await this.verifyToken();
        if (!isValid) {
            localStorage.removeItem('authToken');
            window.location.href = '/login';
            return;
        }

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

        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target.id);
            }
        });
    }

    async loadAllData() {
        try {
            const [
                klanten,
                afspraken,
                uitgaven,
                consulttypes,
                mutualiteiten,
                categorieen,
                dashboard,
                maandoverzicht,
                terugbetalingSignalen
            ] = await Promise.all([
                this.fetchData('/api/klanten').catch(err => { console.error('Error loading klanten:', err); return []; }),
                this.fetchData('/api/afspraken').catch(err => { console.error('Error loading afspraken:', err); return []; }),
                this.fetchData('/api/uitgaven').catch(err => { console.error('Error loading uitgaven:', err); return []; }),
                this.fetchData('/api/consulttypes').catch(err => { console.error('Error loading consulttypes:', err); return []; }),
                this.fetchData('/api/mutualiteiten').catch(err => { console.error('Error loading mutualiteiten:', err); return []; }),
                this.fetchData('/api/categorieen').catch(err => { console.error('Error loading categorieen:', err); return []; }),
                this.fetchData('/api/dashboard').catch(err => { console.error('Error loading dashboard:', err); return { inkomsten: 0, uitgaven: 0, netto: 0 }; }),
                this.fetchData('/api/maandoverzicht').catch(err => { console.error('Error loading maandoverzicht:', err); return []; }),
                this.fetchData('/api/terugbetaling-signalen').catch(err => { console.error('Error loading terugbetaling-signalen:', err); return []; })
            ]);

            this.data = {
                klanten,
                afspraken,
                uitgaven,
                consulttypes,
                mutualiteiten,
                categorieen,
                dashboard,
                maandoverzicht,
                terugbetalingSignalen
            };

            this.updateAllTables();
            this.updateDashboard();
            
            // Only show success message if we're not on initial load
            if (this.data.klanten.length > 0 || this.data.consulttypes.length > 0) {
                console.log('Data loaded successfully');
            }
        } catch (error) {
            console.error('Error loading data:', error);
            this.showMessage('Er is een fout opgetreden bij het laden van de gegevens: ' + error.message, 'error');
        }
    }

    async verifyToken() {
        try {
            const response = await fetch('/api/verify-token', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.authToken}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.ok;
        } catch (error) {
            console.error('Token verification failed:', error);
            return false;
        }
    }

    async fetchData(url) {
        try {
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${this.authToken}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    // Token expired or invalid
                    localStorage.removeItem('authToken');
                    window.location.href = '/login';
                    return;
                }
                throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Fetch error for ${url}:`, error);
            throw error;
        }
    }

    async postData(url, data) {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.authToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem('authToken');
                window.location.href = '/login';
                return;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    }

    showPage(page) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-page="${page}"]`).classList.add('active');

        // Update page content
        document.querySelectorAll('.page').forEach(p => {
            p.classList.remove('active');
        });
        document.getElementById(`${page}-page`).classList.add('active');

        // Update page title
        const titles = {
            dashboard: 'Dashboard',
            klanten: 'Klantenbeheer',
            afspraken: 'Afsprakenbeheer',
            uitgaven: 'Uitgavenbeheer',
            terugbetaling: 'Terugbetaling Signalen',
            instellingen: 'Instellingen'
        };
        document.getElementById('pageTitle').textContent = titles[page];

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

    updateAllTables() {
        this.updateKlantenTable();
        this.updateAfsprakenTable();
        this.updateUitgavenTable();
        this.updateTerugbetalingTable();
    }

    updateKlantenTable() {
        const tbody = document.getElementById('klantenTableBody');
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
        tbody.innerHTML = '';

        if (this.data.afspraken.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="empty-state">
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
            row.innerHTML = `
                <td>${new Date(afspraak.datum).toLocaleDateString('nl-NL')}</td>
                <td>${afspraak.voornaam} ${afspraak.achternaam}</td>
                <td>${afspraak.type}</td>
                <td>${afspraak.aantal}</td>
                <td>€${afspraak.prijs ? afspraak.prijs.toFixed(2) : '0.00'}</td>
                <td>€${afspraak.totaal ? afspraak.totaal.toFixed(2) : '0.00'}</td>
                <td>${afspraak.terugbetaalbaar ? 'Ja' : 'Nee'}</td>
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

    updateSettingsTables() {
        // Consulttypes table
        const consulttypesTbody = document.getElementById('consulttypesTableBody');
        consulttypesTbody.innerHTML = '';
        this.data.consulttypes.forEach(type => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${type.type}</td>
                <td>${type.prijs ? '€' + type.prijs.toFixed(2) : '-'}</td>
                <td>
                    <button class="btn btn-sm btn-secondary" onclick="app.editConsulttype(${type.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                </td>
            `;
            consulttypesTbody.appendChild(row);
        });

        // Mutualiteiten table
        const mutualiteitenTbody = document.getElementById('mutualiteitenTableBody');
        mutualiteitenTbody.innerHTML = '';
        this.data.mutualiteiten.forEach(mut => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${mut.naam}</td>
                <td>${mut.maxSessiesPerJaar || '-'}</td>
                <td>${mut.opmerking || '-'}</td>
                <td>
                    <button class="btn btn-sm btn-secondary" onclick="app.editMutualiteit(${mut.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                </td>
            `;
            mutualiteitenTbody.appendChild(row);
        });

        // Categorieën table
        const categorieenTbody = document.getElementById('categorieenTableBody');
        categorieenTbody.innerHTML = '';
        this.data.categorieen.forEach(cat => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${cat.categorie}</td>
                <td>
                    <button class="btn btn-sm btn-secondary" onclick="app.editCategorie(${cat.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                </td>
            `;
            categorieenTbody.appendChild(row);
        });
    }

    updateDashboard() {
        if (this.data.dashboard) {
            document.getElementById('inkomsten-value').textContent = `€${this.data.dashboard.inkomsten.toFixed(2)}`;
            document.getElementById('uitgaven-value').textContent = `€${this.data.dashboard.uitgaven.toFixed(2)}`;
            document.getElementById('netto-value').textContent = `€${this.data.dashboard.netto.toFixed(2)}`;
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

    // Modal functions
    openKlantModal(klant = null) {
        const modal = document.getElementById('klantModal');
        const form = document.getElementById('klantForm');
        const title = document.getElementById('klantModalTitle');
        
        if (klant) {
            title.textContent = 'Klant Bewerken';
            form.dataset.id = klant.id;
            document.getElementById('voornaam').value = klant.voornaam;
            document.getElementById('achternaam').value = klant.achternaam;
            document.getElementById('email').value = klant.email || '';
            document.getElementById('telefoon').value = klant.telefoon || '';
            document.getElementById('startdatum').value = klant.startdatum || '';
            document.getElementById('mutualiteit').value = klant.mutualiteit_id || '';
        } else {
            title.textContent = 'Nieuwe Klant';
            form.reset();
            delete form.dataset.id;
            document.getElementById('startdatum').value = new Date().toISOString().split('T')[0];
        }

        this.populateMutualiteitDropdown();
        modal.style.display = 'block';
    }

    openAfspraakModal(afspraak = null) {
        const modal = document.getElementById('afspraakModal');
        const form = document.getElementById('afspraakForm');
        const title = document.getElementById('afspraakModalTitle');
        
        if (afspraak) {
            title.textContent = 'Afspraak Bewerken';
            form.dataset.id = afspraak.id;
            document.getElementById('afspraakDatum').value = afspraak.datum;
            document.getElementById('afspraakKlant').value = afspraak.klant_id;
            document.getElementById('afspraakType').value = afspraak.type_id;
            document.getElementById('aantal').value = afspraak.aantal;
            document.getElementById('terugbetaalbaar').value = afspraak.terugbetaalbaar ? '1' : '0';
            document.getElementById('opmerking').value = afspraak.opmerking || '';
        } else {
            title.textContent = 'Nieuwe Afspraak';
            form.reset();
            delete form.dataset.id;
            document.getElementById('afspraakDatum').value = new Date().toISOString().split('T')[0];
            document.getElementById('aantal').value = '1';
        }

        this.populateKlantDropdown();
        this.populateTypeDropdown();
        modal.style.display = 'block';
    }

    openUitgaveModal(uitgave = null) {
        const modal = document.getElementById('uitgaveModal');
        const form = document.getElementById('uitgaveForm');
        const title = document.getElementById('uitgaveModalTitle');
        
        if (uitgave) {
            title.textContent = 'Uitgave Bewerken';
            form.dataset.id = uitgave.id;
            document.getElementById('uitgaveDatum').value = uitgave.datum;
            document.getElementById('beschrijving').value = uitgave.beschrijving;
            document.getElementById('uitgaveCategorie').value = uitgave.categorie_id || '';
            document.getElementById('bedrag').value = uitgave.bedrag;
            document.getElementById('betaalmethode').value = uitgave.betaalmethode || '';
        } else {
            title.textContent = 'Nieuwe Uitgave';
            form.reset();
            delete form.dataset.id;
            document.getElementById('uitgaveDatum').value = new Date().toISOString().split('T')[0];
        }

        this.populateCategorieDropdown();
        modal.style.display = 'block';
    }

    closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
    }

    // Settings modals
    openConsulttypeModal(consulttype = null) {
        const modal = document.getElementById('consulttypeModal');
        const form = document.getElementById('consulttypeForm');
        const title = document.getElementById('consulttypeModalTitle');
        
        if (consulttype) {
            title.textContent = 'Consulttype Bewerken';
            form.dataset.id = consulttype.id;
            document.getElementById('consulttypeType').value = consulttype.type;
            document.getElementById('consulttypePrijs').value = consulttype.prijs || '';
        } else {
            title.textContent = 'Nieuw Consulttype';
            form.reset();
            delete form.dataset.id;
        }

        modal.style.display = 'block';
    }

    openMutualiteitModal(mutualiteit = null) {
        const modal = document.getElementById('mutualiteitModal');
        const form = document.getElementById('mutualiteitForm');
        const title = document.getElementById('mutualiteitModalTitle');
        
        if (mutualiteit) {
            title.textContent = 'Mutualiteit Bewerken';
            form.dataset.id = mutualiteit.id;
            document.getElementById('mutualiteitNaam').value = mutualiteit.naam;
            document.getElementById('mutualiteitMaxSessies').value = mutualiteit.maxSessiesPerJaar || '';
            document.getElementById('mutualiteitOpmerking').value = mutualiteit.opmerking || '';
        } else {
            title.textContent = 'Nieuwe Mutualiteit';
            form.reset();
            delete form.dataset.id;
        }

        modal.style.display = 'block';
    }

    openCategorieModal(categorie = null) {
        const modal = document.getElementById('categorieModal');
        const form = document.getElementById('categorieForm');
        const title = document.getElementById('categorieModalTitle');
        
        if (categorie) {
            title.textContent = 'Categorie Bewerken';
            form.dataset.id = categorie.id;
            document.getElementById('categorieNaam').value = categorie.categorie;
        } else {
            title.textContent = 'Nieuwe Categorie';
            form.reset();
            delete form.dataset.id;
        }

        modal.style.display = 'block';
    }

    // Dropdown population
    populateMutualiteitDropdown() {
        const select = document.getElementById('mutualiteit');
        select.innerHTML = '<option value="">Selecteer mutualiteit</option>';
        this.data.mutualiteiten.forEach(mut => {
            const option = document.createElement('option');
            option.value = mut.id;
            option.textContent = mut.naam;
            select.appendChild(option);
        });
    }

    populateKlantDropdown() {
        const select = document.getElementById('afspraakKlant');
        select.innerHTML = '<option value="">Selecteer klant</option>';
        this.data.klanten.forEach(klant => {
            const option = document.createElement('option');
            option.value = klant.id;
            option.textContent = `${klant.voornaam} ${klant.achternaam}`;
            select.appendChild(option);
        });
    }

    populateTypeDropdown() {
        const select = document.getElementById('afspraakType');
        select.innerHTML = '<option value="">Selecteer type</option>';
        this.data.consulttypes.forEach(type => {
            const option = document.createElement('option');
            option.value = type.id;
            option.textContent = type.type;
            select.appendChild(option);
        });
    }

    populateCategorieDropdown() {
        const select = document.getElementById('uitgaveCategorie');
        select.innerHTML = '<option value="">Selecteer categorie</option>';
        this.data.categorieen.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.id;
            option.textContent = cat.categorie;
            select.appendChild(option);
        });
    }

    // Form handlers
    async handleKlantSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        
        // Convert mutualiteit_id to number
        if (data.mutualiteit) {
            data.mutualiteit_id = parseInt(data.mutualiteit);
        }
        delete data.mutualiteit;

        try {
            if (e.target.dataset.id) {
                // Update existing klant
                await this.updateKlant(e.target.dataset.id, data);
            } else {
                // Create new klant
                await this.createKlant(data);
            }
            this.closeModal('klantModal');
            await this.loadAllData();
            this.showMessage('Klant succesvol opgeslagen!', 'success');
        } catch (error) {
            console.error('Error saving klant:', error);
            this.showMessage('Er is een fout opgetreden bij het opslaan van de klant', 'error');
        }
    }

    async handleConsulttypeSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        
        // Convert prijs to number
        if (data.prijs) {
            data.prijs = parseFloat(data.prijs);
        }

        try {
            if (e.target.dataset.id) {
                // Update existing consulttype
                await this.updateConsulttype(e.target.dataset.id, data);
            } else {
                // Create new consulttype
                await this.createConsulttype(data);
            }
            this.closeModal('consulttypeModal');
            await this.loadAllData();
            this.showMessage('Consulttype succesvol opgeslagen!', 'success');
        } catch (error) {
            console.error('Error saving consulttype:', error);
            this.showMessage('Er is een fout opgetreden bij het opslaan van het consulttype', 'error');
        }
    }

    async handleMutualiteitSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        
        // Convert maxSessiesPerJaar to number
        if (data.maxSessiesPerJaar) {
            data.maxSessiesPerJaar = parseInt(data.maxSessiesPerJaar);
        }

        try {
            if (e.target.dataset.id) {
                // Update existing mutualiteit
                await this.updateMutualiteit(e.target.dataset.id, data);
            } else {
                // Create new mutualiteit
                await this.createMutualiteit(data);
            }
            this.closeModal('mutualiteitModal');
            await this.loadAllData();
            this.showMessage('Mutualiteit succesvol opgeslagen!', 'success');
        } catch (error) {
            console.error('Error saving mutualiteit:', error);
            this.showMessage('Er is een fout opgetreden bij het opslaan van de mutualiteit', 'error');
        }
    }

    async handleCategorieSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        try {
            if (e.target.dataset.id) {
                // Update existing categorie
                await this.updateCategorie(e.target.dataset.id, data);
            } else {
                // Create new categorie
                await this.createCategorie(data);
            }
            this.closeModal('categorieModal');
            await this.loadAllData();
            this.showMessage('Categorie succesvol opgeslagen!', 'success');
        } catch (error) {
            console.error('Error saving categorie:', error);
            this.showMessage('Er is een fout opgetreden bij het opslaan van de categorie', 'error');
        }
    }

    async handleAfspraakSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        
        // Convert to appropriate types
        data.klant_id = parseInt(data.klant_id);
        data.type_id = parseInt(data.type_id);
        data.aantal = parseInt(data.aantal);
        data.terugbetaalbaar = data.terugbetaalbaar === '1';

        try {
            if (e.target.dataset.id) {
                // Update existing afspraak
                await this.updateAfspraak(e.target.dataset.id, data);
            } else {
                // Create new afspraak
                await this.createAfspraak(data);
            }
            this.closeModal('afspraakModal');
            await this.loadAllData();
            this.showMessage('Afspraak succesvol opgeslagen!', 'success');
        } catch (error) {
            console.error('Error saving afspraak:', error);
            this.showMessage('Er is een fout opgetreden bij het opslaan van de afspraak', 'error');
        }
    }

    async handleUitgaveSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        
        // Convert to appropriate types
        data.bedrag = parseFloat(data.bedrag);
        if (data.categorie_id) {
            data.categorie_id = parseInt(data.categorie_id);
        }

        try {
            if (e.target.dataset.id) {
                // Update existing uitgave
                await this.updateUitgave(e.target.dataset.id, data);
            } else {
                // Create new uitgave
                await this.createUitgave(data);
            }
            this.closeModal('uitgaveModal');
            await this.loadAllData();
            this.showMessage('Uitgave succesvol opgeslagen!', 'success');
        } catch (error) {
            console.error('Error saving uitgave:', error);
            this.showMessage('Er is een fout opgetreden bij het opslaan van de uitgave', 'error');
        }
    }

    // API calls
    async createKlant(data) {
        return await this.postData('/api/klanten', data);
    }

    async updateKlant(id, data) {
        const response = await fetch(`/api/klanten/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    }

    async createAfspraak(data) {
        return await this.postData('/api/afspraken', data);
    }

    async updateAfspraak(id, data) {
        const response = await fetch(`/api/afspraken/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    }

    async createUitgave(data) {
        return await this.postData('/api/uitgaven', data);
    }

    async updateUitgave(id, data) {
        const response = await fetch(`/api/uitgaven/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    }

    // Settings API calls
    async createConsulttype(data) {
        return await this.postData('/api/consulttypes', data);
    }

    async updateConsulttype(id, data) {
        const response = await fetch(`/api/consulttypes/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    }

    async createMutualiteit(data) {
        return await this.postData('/api/mutualiteiten', data);
    }

    async updateMutualiteit(id, data) {
        const response = await fetch(`/api/mutualiteiten/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    }

    async createCategorie(data) {
        return await this.postData('/api/categorieen', data);
    }

    async updateCategorie(id, data) {
        const response = await fetch(`/api/categorieen/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    }

    // Edit functions
    editKlant(id) {
        const klant = this.data.klanten.find(k => k.id === id);
        if (klant) {
            this.openKlantModal(klant);
        }
    }

    editAfspraak(id) {
        const afspraak = this.data.afspraken.find(a => a.id === id);
        if (afspraak) {
            this.openAfspraakModal(afspraak);
        }
    }

    editUitgave(id) {
        const uitgave = this.data.uitgaven.find(u => u.id === id);
        if (uitgave) {
            this.openUitgaveModal(uitgave);
        }
    }

    editConsulttype(id) {
        const consulttype = this.data.consulttypes.find(c => c.id === id);
        if (consulttype) {
            this.openConsulttypeModal(consulttype);
        }
    }

    editMutualiteit(id) {
        const mutualiteit = this.data.mutualiteiten.find(m => m.id === id);
        if (mutualiteit) {
            this.openMutualiteitModal(mutualiteit);
        }
    }

    editCategorie(id) {
        const categorie = this.data.categorieen.find(c => c.id === id);
        if (categorie) {
            this.openCategorieModal(categorie);
        }
    }

    // Utility functions
    logout() {
        localStorage.removeItem('authToken');
        window.location.href = '/login';
    }

    showMessage(message, type = 'success') {
        // Remove existing messages
        document.querySelectorAll('.message').forEach(msg => msg.remove());
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;
        
        const pageContent = document.querySelector('.page-content');
        pageContent.insertBefore(messageDiv, pageContent.firstChild);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new LauraBoekhouding();
});
