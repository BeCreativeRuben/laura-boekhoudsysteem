const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'laura_boekhouding_secret_key_2024_secure';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

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

// JSON Database helper functions
const readDatabase = () => {
    try {
        const data = fs.readFileSync('./data/database.json', 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading database:', error);
        return {
            users: [],
            consulttypes: [],
            mutualiteiten: [],
            categorieen: [],
            klanten: [],
            afspraken: [],
            uitgaven: []
        };
    }
};

const writeDatabase = (data) => {
    try {
        fs.writeFileSync('./data/database.json', JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing database:', error);
        return false;
    }
};

// Initialize database with default data
const initializeDatabase = () => {
    const db = readDatabase();
    
    // Add default data if not exists
    if (db.consulttypes.length === 0) {
        db.consulttypes = [
            { id: 1, type: "Eerste consultatie", prijs: 75.00 },
            { id: 2, type: "Follow-up consultatie", prijs: 50.00 },
            { id: 3, type: "Telefonisch consult", prijs: 25.00 }
        ];
    }
    
    if (db.mutualiteiten.length === 0) {
        db.mutualiteiten = [
            { id: 1, naam: "CM", maxSessiesPerJaar: 8, opmerking: "CM zorgverzekering" },
            { id: 2, naam: "Partena", maxSessiesPerJaar: 6, opmerking: "Partena mutualiteit" },
            { id: 3, naam: "Helan", maxSessiesPerJaar: 10, opmerking: "Helan zorgverzekering" }
        ];
    }
    
    if (db.categorieen.length === 0) {
        db.categorieen = [
            { id: 1, categorie: "Kantoorbenodigdheden" },
            { id: 2, categorie: "Marketing" },
            { id: 3, categorie: "Opleiding" },
            { id: 4, categorie: "Vervoer" }
        ];
    }
    
    if (db.users.length === 0) {
        const defaultPassword = 'v7$Kq9#TzP!4rWx2bLmN8sQ';
        const hashedPassword = bcrypt.hashSync(defaultPassword, 10);
        db.users = [
            { id: 1, username: "Laura", password_hash: hashedPassword }
        ];
    }
    
    writeDatabase(db);
};

// Initialize database
initializeDatabase();

// API Routes

// Login endpoint
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
    }
    
    const db = readDatabase();
    const user = db.users.find(u => u.username === username);
    
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
    
    res.json({ token, user: { id: user.id, username: user.username } });
});

// Verify token endpoint
app.get('/api/verify-token', authenticateToken, (req, res) => {
    res.json({ valid: true, user: req.user });
});

// Consulttypes endpoints
app.get('/api/consulttypes', authenticateToken, (req, res) => {
    const db = readDatabase();
    res.json(db.consulttypes);
});

app.post('/api/consulttypes', authenticateToken, (req, res) => {
    const { type, prijs } = req.body;
    const db = readDatabase();
    
    const newId = Math.max(...db.consulttypes.map(c => c.id), 0) + 1;
    const newConsulttype = { id: newId, type, prijs: parseFloat(prijs) };
    
    db.consulttypes.push(newConsulttype);
    writeDatabase(db);
    
    res.json(newConsulttype);
});

app.put('/api/consulttypes/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const { type, prijs } = req.body;
    const db = readDatabase();
    
    const index = db.consulttypes.findIndex(c => c.id === parseInt(id));
    if (index === -1) {
        return res.status(404).json({ error: 'Consulttype not found' });
    }
    
    db.consulttypes[index] = { id: parseInt(id), type, prijs: parseFloat(prijs) };
    writeDatabase(db);
    
    res.json(db.consulttypes[index]);
});

app.delete('/api/consulttypes/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const db = readDatabase();
    
    const index = db.consulttypes.findIndex(c => c.id === parseInt(id));
    if (index === -1) {
        return res.status(404).json({ error: 'Consulttype not found' });
    }
    
    db.consulttypes.splice(index, 1);
    writeDatabase(db);
    
    res.json({ success: true });
});

// Mutualiteiten endpoints
app.get('/api/mutualiteiten', authenticateToken, (req, res) => {
    const db = readDatabase();
    res.json(db.mutualiteiten);
});

app.post('/api/mutualiteiten', authenticateToken, (req, res) => {
    const { naam, maxSessiesPerJaar, opmerking } = req.body;
    const db = readDatabase();
    
    const newId = Math.max(...db.mutualiteiten.map(m => m.id), 0) + 1;
    const newMutualiteit = { id: newId, naam, maxSessiesPerJaar: parseInt(maxSessiesPerJaar), opmerking };
    
    db.mutualiteiten.push(newMutualiteit);
    writeDatabase(db);
    
    res.json(newMutualiteit);
});

app.put('/api/mutualiteiten/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const { naam, maxSessiesPerJaar, opmerking } = req.body;
    const db = readDatabase();
    
    const index = db.mutualiteiten.findIndex(m => m.id === parseInt(id));
    if (index === -1) {
        return res.status(404).json({ error: 'Mutualiteit not found' });
    }
    
    db.mutualiteiten[index] = { id: parseInt(id), naam, maxSessiesPerJaar: parseInt(maxSessiesPerJaar), opmerking };
    writeDatabase(db);
    
    res.json(db.mutualiteiten[index]);
});

app.delete('/api/mutualiteiten/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const db = readDatabase();
    
    const index = db.mutualiteiten.findIndex(m => m.id === parseInt(id));
    if (index === -1) {
        return res.status(404).json({ error: 'Mutualiteit not found' });
    }
    
    db.mutualiteiten.splice(index, 1);
    writeDatabase(db);
    
    res.json({ success: true });
});

// Categorieën endpoints
app.get('/api/categorieen', authenticateToken, (req, res) => {
    const db = readDatabase();
    res.json(db.categorieen);
});

app.post('/api/categorieen', authenticateToken, (req, res) => {
    const { categorie } = req.body;
    const db = readDatabase();
    
    const newId = Math.max(...db.categorieen.map(c => c.id), 0) + 1;
    const newCategorie = { id: newId, categorie };
    
    db.categorieen.push(newCategorie);
    writeDatabase(db);
    
    res.json(newCategorie);
});

app.put('/api/categorieen/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const { categorie } = req.body;
    const db = readDatabase();
    
    const index = db.categorieen.findIndex(c => c.id === parseInt(id));
    if (index === -1) {
        return res.status(404).json({ error: 'Categorie not found' });
    }
    
    db.categorieen[index] = { id: parseInt(id), categorie };
    writeDatabase(db);
    
    res.json(db.categorieen[index]);
});

app.delete('/api/categorieen/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const db = readDatabase();
    
    const index = db.categorieen.findIndex(c => c.id === parseInt(id));
    if (index === -1) {
        return res.status(404).json({ error: 'Categorie not found' });
    }
    
    db.categorieen.splice(index, 1);
    writeDatabase(db);
    
    res.json({ success: true });
});

// Klanten endpoints
app.get('/api/klanten', authenticateToken, (req, res) => {
    const db = readDatabase();
    res.json(db.klanten);
});

app.post('/api/klanten', authenticateToken, (req, res) => {
    const { voornaam, achternaam, email, telefoon, startdatum, mutualiteit_id } = req.body;
    const db = readDatabase();
    
    const newId = Math.max(...db.klanten.map(k => k.id), 0) + 1;
    const newKlant = { 
        id: newId, 
        voornaam, 
        achternaam, 
        email, 
        telefoon, 
        startdatum, 
        mutualiteit_id: parseInt(mutualiteit_id) 
    };
    
    db.klanten.push(newKlant);
    writeDatabase(db);
    
    res.json(newKlant);
});

// Afspraken endpoints
app.get('/api/afspraken', authenticateToken, (req, res) => {
    const db = readDatabase();
    res.json(db.afspraken);
});

app.post('/api/afspraken', authenticateToken, (req, res) => {
    const { klant_id, datum, tijd, consulttype_id, prijs, totaal, opmerking } = req.body;
    const db = readDatabase();
    
    const newId = Math.max(...db.afspraken.map(a => a.id), 0) + 1;
    const newAfspraak = { 
        id: newId, 
        klant_id: parseInt(klant_id), 
        datum, 
        tijd, 
        consulttype_id: parseInt(consulttype_id), 
        prijs: parseFloat(prijs), 
        totaal: parseFloat(totaal), 
        opmerking 
    };
    
    db.afspraken.push(newAfspraak);
    writeDatabase(db);
    
    res.json(newAfspraak);
});

// Uitgaven endpoints
app.get('/api/uitgaven', authenticateToken, (req, res) => {
    const db = readDatabase();
    res.json(db.uitgaven);
});

app.post('/api/uitgaven', authenticateToken, (req, res) => {
    const { datum, bedrag, categorie_id, omschrijving, btw_percentage } = req.body;
    const db = readDatabase();
    
    const newId = Math.max(...db.uitgaven.map(u => u.id), 0) + 1;
    const newUitgave = { 
        id: newId, 
        datum, 
        bedrag: parseFloat(bedrag), 
        categorie_id: parseInt(categorie_id), 
        omschrijving, 
        btw_percentage: parseFloat(btw_percentage) 
    };
    
    db.uitgaven.push(newUitgave);
    writeDatabase(db);
    
    res.json(newUitgave);
});

// Dashboard endpoint
app.get('/api/dashboard', authenticateToken, (req, res) => {
    const db = readDatabase();
    
    const totalKlanten = db.klanten.length;
    const totalAfspraken = db.afspraken.length;
    const totalUitgaven = db.uitgaven.reduce((sum, u) => sum + u.bedrag, 0);
    const totalOmzet = db.afspraken.reduce((sum, a) => sum + a.totaal, 0);
    
    res.json({
        totalKlanten,
        totalAfspraken,
        totalUitgaven,
        totalOmzet
    });
});

// Serve main app
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
        console.log(`Laura Boekhoudsysteem server running on port ${PORT}`);
    });
}
