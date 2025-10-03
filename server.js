const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'laura_boekhouding_secret_key_2024_secure';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        // Generate unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'afspraak-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        // Only allow PDF files
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Alleen PDF bestanden zijn toegestaan'), false);
        }
    }
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// Database setup - use persistent file for local installation
const db = new sqlite3.Database('laura_boekhouding.db');

// Initialize database tables
db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Consulttypes table
    db.run(`CREATE TABLE IF NOT EXISTS consulttypes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL UNIQUE,
        prijs DECIMAL(10,2)
    )`);

    // Mutualiteiten table
    db.run(`CREATE TABLE IF NOT EXISTS mutualiteiten (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        naam TEXT NOT NULL UNIQUE,
        maxSessiesPerJaar INTEGER,
        opmerking TEXT
    )`);

    // Categorieën table
    db.run(`CREATE TABLE IF NOT EXISTS categorieen (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        categorie TEXT NOT NULL UNIQUE
    )`);

    // Klanten table
    db.run(`CREATE TABLE IF NOT EXISTS klanten (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        voornaam TEXT NOT NULL,
        achternaam TEXT NOT NULL,
        email TEXT,
        telefoon TEXT,
        startdatum DATE,
        mutualiteit_id INTEGER,
        FOREIGN KEY (mutualiteit_id) REFERENCES mutualiteiten (id)
    )`);

    // Afspraken table
    db.run(`CREATE TABLE IF NOT EXISTS afspraken (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        datum DATE NOT NULL,
        klant_id INTEGER NOT NULL,
        type_id INTEGER NOT NULL,
        aantal INTEGER DEFAULT 1,
        prijs DECIMAL(10,2),
        totaal DECIMAL(10,2),
        terugbetaalbaar BOOLEAN DEFAULT 0,
        opmerking TEXT,
        maand DATE,
        pdf_bestand TEXT,
        FOREIGN KEY (klant_id) REFERENCES klanten (id),
        FOREIGN KEY (type_id) REFERENCES consulttypes (id)
    )`);

    // Uitgaven table
    db.run(`CREATE TABLE IF NOT EXISTS uitgaven (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        datum DATE NOT NULL,
        beschrijving TEXT NOT NULL,
        categorie_id INTEGER,
        bedrag DECIMAL(10,2) NOT NULL,
        betaalmethode TEXT,
        maand DATE,
        FOREIGN KEY (categorie_id) REFERENCES categorieen (id)
    )`);

    // Insert initial data
    // Create default user
    const defaultPassword = 'v7$Kq9#TzP!4rWx2bLmN8sQ';
    const hashedPassword = bcrypt.hashSync(defaultPassword, 10);
    
    const userStmt = db.prepare("INSERT OR IGNORE INTO users (username, password_hash) VALUES (?, ?)");
    userStmt.run('Laura', hashedPassword);
    userStmt.finalize();

    const consulttypes = [
        ['Intake gesprek', 60],
        ['Lange opvolg (consultatie)', 35],
        ['Korte opvolg (consultatie)', 30],
        ['Nabespreking', 25],
        ['Groepssessie (workshop)', null]
    ];

    const mutualiteiten = [
        ['CM', null, null],
        ['Helan', null, null],
        ['Solidaris', null, null],
        ['LM', null, null],
        ['Partena', null, null],
        ['OZ', null, null],
        ['De Voorzorg', null, null],
        ['IDEWE', null, null]
    ];

    const categorieen = [
        ['Huur'],
        ['Materiaal'],
        ['Verplaatsing'],
        ['Software'],
        ['Opleiding'],
        ['Marketing'],
        ['Overig']
    ];

    // Insert consulttypes
    const stmt1 = db.prepare("INSERT OR IGNORE INTO consulttypes (type, prijs) VALUES (?, ?)");
    consulttypes.forEach(([type, prijs]) => {
        stmt1.run(type, prijs);
    });
    stmt1.finalize();

    // Insert mutualiteiten
    const stmt2 = db.prepare("INSERT OR IGNORE INTO mutualiteiten (naam, maxSessiesPerJaar, opmerking) VALUES (?, ?, ?)");
    mutualiteiten.forEach(([naam, maxSessies, opmerking]) => {
        stmt2.run(naam, maxSessies, opmerking);
    });
    stmt2.finalize();

    // Insert categorieen
    const stmt3 = db.prepare("INSERT OR IGNORE INTO categorieen (categorie) VALUES (?)");
    categorieen.forEach(([categorie]) => {
        stmt3.run(categorie);
    });
    stmt3.finalize();
});

// API Routes

// Authentication
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isValidPassword = bcrypt.compareSync(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username
            }
        });
    });
});

app.post('/api/verify-token', authenticateToken, (req, res) => {
    res.json({
        valid: true,
        user: {
            id: req.user.id,
            username: req.user.username
        }
    });
});

// Consulttypes
app.get('/api/consulttypes', authenticateToken, (req, res) => {
    db.all("SELECT * FROM consulttypes ORDER BY type", (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.post('/api/consulttypes', authenticateToken, (req, res) => {
    const { type, prijs } = req.body;
    db.run("INSERT INTO consulttypes (type, prijs) VALUES (?, ?)", [type, prijs], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ id: this.lastID, type, prijs });
    });
});

app.put('/api/consulttypes/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const { type, prijs } = req.body;
    db.run("UPDATE consulttypes SET type = ?, prijs = ? WHERE id = ?", 
           [type, prijs, id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Consulttype updated successfully' });
    });
});

// Mutualiteiten
app.get('/api/mutualiteiten', authenticateToken, (req, res) => {
    db.all("SELECT * FROM mutualiteiten ORDER BY naam", (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.post('/api/mutualiteiten', authenticateToken, (req, res) => {
    const { naam, maxSessiesPerJaar, opmerking } = req.body;
    db.run("INSERT INTO mutualiteiten (naam, maxSessiesPerJaar, opmerking) VALUES (?, ?, ?)", 
           [naam, maxSessiesPerJaar, opmerking], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ id: this.lastID, naam, maxSessiesPerJaar, opmerking });
    });
});

app.put('/api/mutualiteiten/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const { naam, maxSessiesPerJaar, opmerking } = req.body;
    db.run("UPDATE mutualiteiten SET naam = ?, maxSessiesPerJaar = ?, opmerking = ? WHERE id = ?", 
           [naam, maxSessiesPerJaar, opmerking, id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Mutualiteit updated successfully' });
    });
});

// Categorieën
app.get('/api/categorieen', authenticateToken, (req, res) => {
    db.all("SELECT * FROM categorieen ORDER BY categorie", (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.post('/api/categorieen', authenticateToken, (req, res) => {
    const { categorie } = req.body;
    db.run("INSERT INTO categorieen (categorie) VALUES (?)", [categorie], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ id: this.lastID, categorie });
    });
});

app.put('/api/categorieen/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const { categorie } = req.body;
    db.run("UPDATE categorieen SET categorie = ? WHERE id = ?", 
           [categorie, id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Categorie updated successfully' });
    });
});

// Klanten
app.get('/api/klanten', authenticateToken, (req, res) => {
    db.all(`SELECT k.*, m.naam as mutualiteit_naam 
            FROM klanten k 
            LEFT JOIN mutualiteiten m ON k.mutualiteit_id = m.id 
            ORDER BY k.achternaam, k.voornaam`, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.post('/api/klanten', authenticateToken, (req, res) => {
    const { voornaam, achternaam, email, telefoon, startdatum, mutualiteit_id } = req.body;
    db.run("INSERT INTO klanten (voornaam, achternaam, email, telefoon, startdatum, mutualiteit_id) VALUES (?, ?, ?, ?, ?, ?)", 
           [voornaam, achternaam, email, telefoon, startdatum, mutualiteit_id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ id: this.lastID, voornaam, achternaam, email, telefoon, startdatum, mutualiteit_id });
    });
});

app.put('/api/klanten/:id', (req, res) => {
    const { id } = req.params;
    const { voornaam, achternaam, email, telefoon, startdatum, mutualiteit_id } = req.body;
    db.run("UPDATE klanten SET voornaam = ?, achternaam = ?, email = ?, telefoon = ?, startdatum = ?, mutualiteit_id = ? WHERE id = ?", 
           [voornaam, achternaam, email, telefoon, startdatum, mutualiteit_id, id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Klant updated successfully' });
    });
});

// Afspraken
app.get('/api/afspraken', (req, res) => {
    db.all(`SELECT a.*, k.voornaam, k.achternaam, c.type, c.prijs as type_prijs
            FROM afspraken a
            JOIN klanten k ON a.klant_id = k.id
            JOIN consulttypes c ON a.type_id = c.id
            ORDER BY a.datum DESC`, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.post('/api/afspraken', upload.single('pdf'), (req, res) => {
    const { datum, klant_id, type_id, aantal, terugbetaalbaar, opmerking } = req.body;
    const pdf_bestand = req.file ? req.file.filename : null;
    
    // Get the price for this consultation type
    db.get("SELECT prijs FROM consulttypes WHERE id = ?", [type_id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        const prijs = row ? row.prijs : 0;
        const totaal = prijs * (aantal || 1);
        const maand = new Date(datum);
        maand.setDate(1);
        
        db.run("INSERT INTO afspraken (datum, klant_id, type_id, aantal, prijs, totaal, terugbetaalbaar, opmerking, maand, pdf_bestand) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", 
               [datum, klant_id, type_id, aantal, prijs, totaal, terugbetaalbaar, opmerking, maand.toISOString().split('T')[0], pdf_bestand], function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ id: this.lastID, datum, klant_id, type_id, aantal, prijs, totaal, terugbetaalbaar, opmerking });
        });
    });
});

// Uitgaven
app.get('/api/uitgaven', (req, res) => {
    db.all(`SELECT u.*, c.categorie
            FROM uitgaven u
            LEFT JOIN categorieen c ON u.categorie_id = c.id
            ORDER BY u.datum DESC`, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.post('/api/uitgaven', (req, res) => {
    const { datum, beschrijving, categorie_id, bedrag, betaalmethode } = req.body;
    const maand = new Date(datum);
    maand.setDate(1);
    
    db.run("INSERT INTO uitgaven (datum, beschrijving, categorie_id, bedrag, betaalmethode, maand) VALUES (?, ?, ?, ?, ?, ?)", 
           [datum, beschrijving, categorie_id, bedrag, betaalmethode, maand.toISOString().split('T')[0]], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ id: this.lastID, datum, beschrijving, categorie_id, bedrag, betaalmethode });
    });
});

// Dashboard data
app.get('/api/dashboard', (req, res) => {
    const currentMonth = new Date();
    currentMonth.setDate(1);
    const currentMonthStr = currentMonth.toISOString().split('T')[0];
    
    // Get current month income
    db.get("SELECT COALESCE(SUM(totaal), 0) as inkomsten FROM afspraken WHERE maand = ?", [currentMonthStr], (err, incomeRow) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        // Get current month expenses
        db.get("SELECT COALESCE(SUM(bedrag), 0) as uitgaven FROM uitgaven WHERE maand = ?", [currentMonthStr], (err, expenseRow) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            
            const inkomsten = incomeRow.inkomsten;
            const uitgaven = expenseRow.uitgaven;
            const netto = inkomsten - uitgaven;
            
            res.json({
                inkomsten,
                uitgaven,
                netto
            });
        });
    });
});

// Monthly overview
app.get('/api/maandoverzicht', (req, res) => {
    const year = new Date().getFullYear();
    
    db.all(`SELECT 
                strftime('%m', months.maand) as maand_nummer,
                COALESCE(SUM(a.totaal), 0) as inkomsten,
                COALESCE(SUM(u.bedrag), 0) as uitgaven
            FROM (
                SELECT DISTINCT maand FROM afspraken 
                WHERE strftime('%Y', maand) = ?
                UNION
                SELECT DISTINCT maand FROM uitgaven 
                WHERE strftime('%Y', maand) = ?
            ) months
            LEFT JOIN afspraken a ON months.maand = a.maand
            LEFT JOIN uitgaven u ON months.maand = u.maand
            GROUP BY months.maand
            ORDER BY months.maand`, [year.toString(), year.toString()], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        // Fill in missing months with zeros
        const monthlyData = [];
        for (let i = 1; i <= 12; i++) {
            const monthStr = i.toString().padStart(2, '0');
            const existingMonth = rows.find(row => row.maand_nummer === monthStr);
            monthlyData.push({
                maand: monthStr,
                inkomsten: existingMonth ? existingMonth.inkomsten : 0,
                uitgaven: existingMonth ? existingMonth.uitgaven : 0,
                netto: existingMonth ? (existingMonth.inkomsten - existingMonth.uitgaven) : 0
            });
        }
        
        res.json(monthlyData);
    });
});

// Terugbetaling signals
app.get('/api/terugbetaling-signalen', (req, res) => {
    const currentYear = new Date().getFullYear();
    const yearStart = `${currentYear}-01-01`;
    const yearEnd = `${currentYear + 1}-01-01`;
    
    db.all(`SELECT 
                k.id as klant_id,
                k.voornaam,
                k.achternaam,
                m.naam as mutualiteit_naam,
                m.maxSessiesPerJaar,
                COUNT(a.id) as sessies_terugbetaalbaar
            FROM klanten k
            LEFT JOIN mutualiteiten m ON k.mutualiteit_id = m.id
            LEFT JOIN afspraken a ON k.id = a.klant_id 
                AND a.datum >= ? 
                AND a.datum < ? 
                AND a.terugbetaalbaar = 1
            GROUP BY k.id, k.voornaam, k.achternaam, m.naam, m.maxSessiesPerJaar
            HAVING m.maxSessiesPerJaar IS NOT NULL 
                AND sessies_terugbetaalbaar >= m.maxSessiesPerJaar`, 
           [yearStart, yearEnd], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve login page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Export for Vercel
module.exports = app;

// Start server only if not in Vercel environment
if (process.env.NODE_ENV !== 'production' || process.env.VERCEL !== '1') {
    app.listen(PORT, () => {
        console.log(`Diëtist Laura server running on port ${PORT}`);
    });

    // Graceful shutdown
    process.on('SIGINT', () => {
        console.log('\nShutting down server...');
        db.close((err) => {
            if (err) {
                console.error(err.message);
            }
            console.log('Database connection closed.');
            process.exit(0);
        });
    });
}
