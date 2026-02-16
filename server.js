require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseServiceKey) {
    console.warn('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set for production. Using SQLite fallback is no longer supported.');
}
const supabase = supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey)
    : null;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Define static root first
const staticRoot = process.env.VERCEL ? process.cwd() : path.join(__dirname);

// Define routes BEFORE static middleware to ensure they take precedence
app.get('/', (req, res) => {
    res.sendFile(path.join(staticRoot, 'index-production.html'));
});
app.get('/index.html', (req, res) => {
    res.redirect(302, '/');
});
app.get('/login', (req, res) => {
    res.sendFile(path.join(staticRoot, 'login.html'));
});

// Static files: on Vercel the function can run from a subfolder so use project root
// Serve static files but exclude index.html (we'll serve index-production.html via route)
app.use(express.static(staticRoot, { index: false }));
app.use('/uploads', express.static(path.join(staticRoot, 'uploads')));

// Create uploads directory if it doesn't exist (local dev only)
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer: memory storage for serverless (file will be uploaded to Supabase Storage by route)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') cb(null, true);
        else cb(new Error('Alleen PDF bestanden zijn toegestaan'), false);
    }
});

// Map DB row to API shape (snake_case -> camelCase for mutualiteiten)
function mapMutualiteit(row) {
    if (!row) return row;
    return { ...row, maxSessiesPerJaar: row.max_sessies_per_jaar };
}

// Simple secret token authentication (no multi-tenant)
const SECRET_TOKEN = process.env.SECRET_TOKEN || 'your-secret-token-here-change-this';

// Auth middleware: verify secret token
function authenticateToken(req, res, next) {
    if (!supabase) {
        return res.status(503).json({ error: 'Database not configured' });
    }
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token || token !== SECRET_TOKEN) {
        return res.status(401).json({ error: 'Invalid or missing token' });
    }
    next();
}

// --- API: Auth (simple secret token check)
app.post('/api/login', (req, res) => {
    const { token } = req.body;
    if (token === SECRET_TOKEN) {
        res.json({
            valid: true,
            token: SECRET_TOKEN,
            user: { displayName: 'Gebruiker' }
        });
    } else {
        res.status(401).json({ error: 'Invalid token' });
    }
});

app.post('/api/verify-token', authenticateToken, (req, res) => {
    res.json({
        valid: true,
        user: {
            displayName: 'Gebruiker'
        }
    });
});

// --- Consulttypes
app.get('/api/consulttypes', authenticateToken, async (req, res) => {
    const { data, error } = await supabase
        .from('consulttypes')
        .select('*')
        .order('type');
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

app.post('/api/consulttypes', authenticateToken, async (req, res) => {
    const { type, prijs } = req.body;
    const { data, error } = await supabase
        .from('consulttypes')
        .insert({ type, prijs: prijs != null ? Number(prijs) : null })
        .select('id, type, prijs')
        .single();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

app.put('/api/consulttypes/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { type, prijs } = req.body;
    const { error } = await supabase
        .from('consulttypes')
        .update({ type, prijs: prijs != null ? Number(prijs) : null })
        .eq('id', id)
;
    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: 'Consulttype updated successfully' });
});

app.delete('/api/consulttypes/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { error } = await supabase
        .from('consulttypes')
        .delete()
        .eq('id', id)
;
    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: 'Consulttype deleted successfully' });
});

// --- Mutualiteiten
app.get('/api/mutualiteiten', authenticateToken, async (req, res) => {
    const { data, error } = await supabase
        .from('mutualiteiten')
        .select('*')
        .order('naam');
    if (error) return res.status(500).json({ error: error.message });
    res.json((data || []).map(mapMutualiteit));
});

app.post('/api/mutualiteiten', authenticateToken, async (req, res) => {
    const { naam, maxSessiesPerJaar, opmerking } = req.body;
    const { data, error } = await supabase
        .from('mutualiteiten')
        .insert({
            naam,
            max_sessies_per_jaar: maxSessiesPerJaar != null ? Number(maxSessiesPerJaar) : null,
            opmerking: opmerking || null
        })
        .select('id, naam, max_sessies_per_jaar, opmerking')
        .single();
    if (error) return res.status(500).json({ error: error.message });
    res.json({ id: data.id, naam: data.naam, maxSessiesPerJaar: data.max_sessies_per_jaar, opmerking: data.opmerking });
});

app.put('/api/mutualiteiten/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { naam, maxSessiesPerJaar, opmerking } = req.body;
    const { error } = await supabase
        .from('mutualiteiten')
        .update({
            naam,
            max_sessies_per_jaar: maxSessiesPerJaar != null ? Number(maxSessiesPerJaar) : null,
            opmerking: opmerking || null
        })
        .eq('id', id)
;
    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: 'Mutualiteit updated successfully' });
});

app.delete('/api/mutualiteiten/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { error } = await supabase
        .from('mutualiteiten')
        .delete()
        .eq('id', id)
;
    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: 'Mutualiteit deleted successfully' });
});

// --- Categorieën
app.get('/api/categorieen', authenticateToken, async (req, res) => {
    const { data, error } = await supabase
        .from('categorieen')
        .select('*')
        .order('categorie');
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

app.post('/api/categorieen', authenticateToken, async (req, res) => {
    const { categorie } = req.body;
    const { data, error } = await supabase
        .from('categorieen')
        .insert({ categorie })
        .select('id, categorie')
        .single();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

app.put('/api/categorieen/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { categorie } = req.body;
    const { error } = await supabase
        .from('categorieen')
        .update({ categorie })
        .eq('id', id)
;
    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: 'Categorie updated successfully' });
});

app.delete('/api/categorieen/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { error } = await supabase
        .from('categorieen')
        .delete()
        .eq('id', id)
;
    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: 'Categorie deleted successfully' });
});

// --- Klanten
app.get('/api/klanten', authenticateToken, async (req, res) => {
    const { data: klanten, error } = await supabase
        .from('klanten')
        .select('id, voornaam, achternaam, email, telefoon, startdatum, mutualiteit_id, solidaris_uitzondering')
        .order('achternaam')
        .order('voornaam');
    if (error) return res.status(500).json({ error: error.message });
    const ids = (klanten || []).map(k => k.mutualiteit_id).filter(Boolean);
    const mutualiteitIds = [...new Set(ids)];
    let names = {};
    if (mutualiteitIds.length) {
        const { data: mut } = await supabase.from('mutualiteiten').select('id, naam').in('id', mutualiteitIds);
        (mut || []).forEach(m => { names[m.id] = m.naam; });
    }
    const result = (klanten || []).map(k => ({
        ...k,
        mutualiteit_naam: k.mutualiteit_id ? names[k.mutualiteit_id] : null,
        solidaris_uitzondering: k.solidaris_uitzondering || false
    }));
    res.json(result);
});

app.post('/api/klanten', authenticateToken, async (req, res) => {
    const { voornaam, achternaam, email, telefoon, startdatum, mutualiteit_id, solidaris_uitzondering } = req.body;
    const { data, error } = await supabase
        .from('klanten')
        .insert({
            voornaam,
            achternaam,
            email: email || null,
            telefoon: telefoon || null,
            startdatum: startdatum || null,
            mutualiteit_id: mutualiteit_id ? Number(mutualiteit_id) : null,
            solidaris_uitzondering: solidaris_uitzondering === true || solidaris_uitzondering === 'true'
        })
        .select('id, voornaam, achternaam, email, telefoon, startdatum, mutualiteit_id, solidaris_uitzondering')
        .single();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

app.put('/api/klanten/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { voornaam, achternaam, email, telefoon, startdatum, mutualiteit_id, solidaris_uitzondering } = req.body;
    const updates = {
        voornaam,
        achternaam,
        email: email || null,
        telefoon: telefoon || null,
        startdatum: startdatum || null,
        mutualiteit_id: mutualiteit_id ? Number(mutualiteit_id) : null
    };
    if (solidaris_uitzondering !== undefined) {
        updates.solidaris_uitzondering = solidaris_uitzondering === true || solidaris_uitzondering === 'true';
    }
    const { error } = await supabase
        .from('klanten')
        .update(updates)
        .eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: 'Klant updated successfully' });
});

app.delete('/api/klanten/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { error } = await supabase
        .from('klanten')
        .delete()
        .eq('id', id)
;
    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: 'Klant deleted successfully' });
});

// --- Afspraken (PDF: stored in Supabase Storage in step 4; for now store key or null)
app.get('/api/afspraken', authenticateToken, async (req, res) => {
    const { data: afspraken, error } = await supabase
        .from('afspraken')
        .select(`
            *,
            klanten (voornaam, achternaam),
            consulttypes (type, prijs)
        `)
        .order('datum', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    const rows = (afspraken || []).map(a => ({
        ...a,
        voornaam: a.klanten?.voornaam,
        achternaam: a.klanten?.achternaam,
        type: a.consulttypes?.type,
        type_prijs: a.consulttypes?.prijs
    }));
    res.json(rows.map(({ klanten, consulttypes, ...a }) => a));
});

app.post('/api/afspraken', authenticateToken, upload.single('pdf'), async (req, res) => {
    const { datum, klant_id, type_id, aantal, terugbetaalbaar, opmerking } = req.body;
    let pdfKey = null;
    if (req.file && supabase) {
        const bucket = 'afspraak-pdfs';
        const ext = path.extname(req.file.originalname) || '.pdf';
        const key = `pdfs/${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
        const { error: upErr } = await supabase.storage.from(bucket).upload(key, req.file.buffer, {
            contentType: 'application/pdf',
            upsert: false
        });
        if (!upErr) pdfKey = key;
    }
    const { data: typeRow, error: typeErr } = await supabase
        .from('consulttypes')
        .select('prijs')
        .eq('id', type_id)
        .single();
    if (typeErr) return res.status(500).json({ error: typeErr.message });
    const prijs = typeRow?.prijs ?? 0;
    const totaal = prijs * (Number(aantal) || 1);
    const d = new Date(datum);
    d.setDate(1);
    const maand = d.toISOString().split('T')[0];
    const { data, error } = await supabase
        .from('afspraken')
        .insert({
            datum,
            klant_id: Number(klant_id),
            type_id: Number(type_id),
            aantal: Number(aantal) || 1,
            prijs,
            totaal,
            terugbetaalbaar: Boolean(terugbetaalbaar),
            opmerking: opmerking || null,
            maand,
            pdf_bestand: pdfKey
        })
        .select('id, datum, klant_id, type_id, aantal, prijs, totaal, terugbetaalbaar, opmerking')
        .single();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

app.put('/api/afspraken/:id', authenticateToken, upload.single('pdf'), async (req, res) => {
    const { id } = req.params;
    const { datum, klant_id, type_id, aantal, terugbetaalbaar, opmerking } = req.body;
    const updates = { datum, klant_id: klant_id != null ? Number(klant_id) : undefined, type_id: type_id != null ? Number(type_id) : undefined, aantal: aantal != null ? Number(aantal) : undefined, terugbetaalbaar: terugbetaalbaar != null ? Boolean(terugbetaalbaar) : undefined, opmerking: opmerking !== undefined ? opmerking : undefined };
    if (datum) {
        const d = new Date(datum);
        d.setDate(1);
        updates.maand = d.toISOString().split('T')[0];
    }
    if (type_id != null) {
        const { data: typeRow } = await supabase.from('consulttypes').select('prijs').eq('id', type_id).single();
        const prijs = typeRow?.prijs ?? 0;
        updates.prijs = prijs;
        updates.totaal = prijs * (Number(aantal) || 1);
    }
    // Handle PDF upload if provided
    if (req.file && supabase) {
        const bucket = 'afspraak-pdfs';
        const ext = path.extname(req.file.originalname) || '.pdf';
        const key = `pdfs/${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
        const { error: upErr } = await supabase.storage.from(bucket).upload(key, req.file.buffer, {
            contentType: 'application/pdf',
            upsert: false
        });
        if (!upErr) {
            // Delete old PDF if exists
            const { data: oldAfspraak } = await supabase.from('afspraken').select('pdf_bestand').eq('id', id).single();
            if (oldAfspraak?.pdf_bestand) {
                await supabase.storage.from(bucket).remove([oldAfspraak.pdf_bestand]);
            }
            updates.pdf_bestand = key;
        }
    }
    Object.keys(updates).forEach(k => updates[k] === undefined && delete updates[k]);
    const { error } = await supabase.from('afspraken').update(updates).eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: 'Afspraak updated successfully' });
});

app.delete('/api/afspraken/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    // Get PDF path before deleting
    const { data: afspraak } = await supabase.from('afspraken').select('pdf_bestand').eq('id', id).single();
    const { error } = await supabase.from('afspraken').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    // Delete PDF from storage if exists
    if (afspraak?.pdf_bestand && supabase) {
        await supabase.storage.from('afspraak-pdfs').remove([afspraak.pdf_bestand]);
    }
    res.json({ message: 'Afspraak deleted successfully' });
});

// PDF download: return signed URL for tenant-scoped file
app.get('/api/afspraken/:id/pdf', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { data: afspraak, error } = await supabase
        .from('afspraken')
        .select('pdf_bestand')
        .eq('id', id)
        .single();
    if (error || !afspraak) return res.status(404).json({ error: 'Afspraak not found' });
    if (!afspraak.pdf_bestand) return res.status(404).json({ error: 'No PDF for this afspraak' });
    const { data: signed, error: signErr } = await supabase.storage
        .from('afspraak-pdfs')
        .createSignedUrl(afspraak.pdf_bestand, 60);
    if (signErr) return res.status(500).json({ error: signErr.message });
    res.json({ url: signed.signedUrl });
});

// --- Uitgaven
app.get('/api/uitgaven', authenticateToken, async (req, res) => {
    const { data: uitgaven, error } = await supabase
        .from('uitgaven')
        .select('*, categorieen (categorie)')
        .order('datum', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    const rows = (uitgaven || []).map(u => ({
        ...u,
        categorie: u.categorieen?.categorie ?? null
    }));
    res.json(rows.map(({ categorieen, ...u }) => u));
});

app.put('/api/uitgaven/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { datum, beschrijving, categorie_id, bedrag, betaalmethode } = req.body;
    const updates = { beschrijving, categorie_id: categorie_id != null ? Number(categorie_id) : null, bedrag: bedrag != null ? Number(bedrag) : undefined, betaalmethode: betaalmethode !== undefined ? betaalmethode : null };
    if (datum) {
        updates.datum = datum;
        const d = new Date(datum);
        d.setDate(1);
        updates.maand = d.toISOString().split('T')[0];
    }
    Object.keys(updates).forEach(k => updates[k] === undefined && delete updates[k]);
    const { error } = await supabase.from('uitgaven').update(updates).eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: 'Uitgave updated successfully' });
});

app.post('/api/uitgaven', authenticateToken, async (req, res) => {
    const { datum, beschrijving, categorie_id, bedrag, betaalmethode } = req.body;
    const d = new Date(datum);
    d.setDate(1);
    const maand = d.toISOString().split('T')[0];
    const { data, error } = await supabase
        .from('uitgaven')
        .insert({
            datum,
            beschrijving,
            categorie_id: categorie_id ? Number(categorie_id) : null,
            bedrag: Number(bedrag),
            betaalmethode: betaalmethode || null,
            maand
        })
        .select('id, datum, beschrijving, categorie_id, bedrag, betaalmethode')
        .single();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

app.delete('/api/uitgaven/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { error } = await supabase
        .from('uitgaven')
        .delete()
        .eq('id', id)
;
    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: 'Uitgave deleted successfully' });
});

// --- Dashboard
app.get('/api/dashboard', authenticateToken, async (req, res) => {
    const currentMonth = new Date();
    currentMonth.setDate(1);
    const currentMonthStr = currentMonth.toISOString().split('T')[0];
    const { data: income } = await supabase
        .from('afspraken')
        .select('totaal')
        .eq('maand', currentMonthStr);
    const { data: expense } = await supabase
        .from('uitgaven')
        .select('bedrag')
        .eq('maand', currentMonthStr);
    const inkomsten = (income || []).reduce((s, r) => s + Number(r.totaal || 0), 0);
    const uitgaven = (expense || []).reduce((s, r) => s + Number(r.bedrag || 0), 0);
    res.json({ inkomsten, uitgaven, netto: inkomsten - uitgaven });
});

// --- Maandoverzicht (Postgres: EXTRACT / to_char for month)
app.get('/api/maandoverzicht', authenticateToken, async (req, res) => {
    const year = new Date().getFullYear();
    const yearStart = `${year}-01-01`;
    const yearEnd = `${year}-12-31`;
    const { data: afspraken } = await supabase
        .from('afspraken')
        .select('maand, totaal')
        .gte('maand', yearStart)
        .lte('maand', yearEnd);
    const { data: uitgaven } = await supabase
        .from('uitgaven')
        .select('maand, bedrag')
        .gte('maand', yearStart)
        .lte('maand', yearEnd);
    const byMonth = {};
    for (let i = 1; i <= 12; i++) {
        const m = i.toString().padStart(2, '0');
        byMonth[m] = { inkomsten: 0, uitgaven: 0 };
    }
    (afspraken || []).forEach(a => {
        const m = a.maand ? String(a.maand).slice(5, 7) : null;
        if (m && byMonth[m]) byMonth[m].inkomsten += Number(a.totaal || 0);
    });
    (uitgaven || []).forEach(u => {
        const m = u.maand ? String(u.maand).slice(5, 7) : null;
        if (m && byMonth[m]) byMonth[m].uitgaven += Number(u.bedrag || 0);
    });
    const monthlyData = Object.entries(byMonth).map(([maand, v]) => ({
        maand,
        inkomsten: v.inkomsten,
        uitgaven: v.uitgaven,
        netto: v.inkomsten - v.uitgaven
    }));
    res.json(monthlyData);
});

// --- Terugbetaling signalen (met specifieke regels per mutualiteit)
app.get('/api/terugbetaling-signalen', authenticateToken, async (req, res) => {
    const currentYear = new Date().getFullYear();
    const yearStart = `${currentYear}-01-01`;
    const yearEnd = `${currentYear + 1}-01-01`;
    const { data: klanten } = await supabase
        .from('klanten')
        .select('id, voornaam, achternaam, mutualiteit_id, solidaris_uitzondering');
    if (!klanten?.length) return res.json([]);
    const mutIds = [...new Set(klanten.map(k => k.mutualiteit_id).filter(Boolean))];
    const { data: mutualiteiten } = await supabase
        .from('mutualiteiten')
        .select('id, naam, max_sessies_per_jaar, opmerking')
        .in('id', mutIds);
    const mutById = {};
    (mutualiteiten || []).forEach(m => { mutById[m.id] = m; });
    const { data: afspraken } = await supabase
        .from('afspraken')
        .select('klant_id')
        .eq('terugbetaalbaar', true)
        .gte('datum', yearStart)
        .lt('datum', yearEnd);
    const countByKlant = {};
    (afspraken || []).forEach(a => {
        countByKlant[a.klant_id] = (countByKlant[a.klant_id] || 0) + 1;
    });
    const out = [];
    for (const k of klanten) {
        if (!k.mutualiteit_id) continue;
        const mut = mutById[k.mutualiteit_id];
        if (!mut) continue;
        const sessies = countByKlant[k.id] || 0;
        const mutNaam = mut.naam.toLowerCase();
        let melding = null;
        let resterend = null;
        // CM: vanaf 4e sessie melding
        if (mutNaam.includes('christelijk') || mutNaam === 'cm') {
            if (sessies >= 4) {
                melding = 'Tegemoetkoming van 40 EUR';
            }
        }
        // Liberale Mutualiteit: eerste 6x met resterende aantal
        else if (mutNaam.includes('liberaal') || mutNaam === 'lm') {
            const max = 6;
            if (sessies > 0 && sessies <= max) {
                resterend = max - sessies;
                melding = `Tegemoetkoming van 5 EUR per consultatie. Nog ${resterend} keer recht op terugbetaling dit jaar.`;
            }
        }
        // Solidaris: 4 normaal, 8 met uitzondering
        else if (mutNaam.includes('solidaris')) {
            const max = k.solidaris_uitzondering ? 8 : 4;
            if (sessies > 0 && sessies <= max) {
                resterend = max - sessies;
                const uitzonderingText = k.solidaris_uitzondering ? ' (met doktersattest)' : '';
                melding = `Tegemoetkoming van 10 EUR per consultatie${uitzonderingText}. Nog ${resterend} keer recht op terugbetaling dit jaar.`;
            }
        }
        // Helan: bij eerste sessie al melding
        else if (mutNaam.includes('helan')) {
            if (sessies === 1) {
                melding = 'Jaarlijkse terugbetaling van 25 EUR per kalenderjaar';
            }
        }
        // Vlaams en neutraal ziekenfonds: eerste 5x met resterende aantal
        else if (mutNaam.includes('vlaams') || mutNaam.includes('neutraal') || mutNaam === 'vnz') {
            const max = 5;
            if (sessies > 0 && sessies <= max) {
                resterend = max - sessies;
                melding = `Tegemoetkoming van 10 EUR per consultatie. Nog ${resterend} keer recht op terugbetaling dit jaar.`;
            }
        }
        if (melding) {
            out.push({
                klant_id: k.id,
                voornaam: k.voornaam,
                achternaam: k.achternaam,
                mutualiteit_naam: mut.naam,
                sessies_terugbetaalbaar: sessies,
                melding: melding,
                resterend: resterend
            });
        }
    }
    res.json(out);
});

module.exports = app;

if (process.env.NODE_ENV !== 'production' || process.env.VERCEL !== '1') {
    app.listen(PORT, () => {
        console.log(`Diëtist Laura server running on port ${PORT}`);
    }).on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.error(`\n❌ Port ${PORT} is already in use.`);
            console.error(`   Please either:`);
            console.error(`   1. Stop the process using port ${PORT}`);
            console.error(`   2. Set PORT environment variable: $env:PORT=3001`);
            console.error(`   3. Or change the default port in server.js\n`);
            process.exit(1);
        } else {
            throw err;
        }
    });
}
