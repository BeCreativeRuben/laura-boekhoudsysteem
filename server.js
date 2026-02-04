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
app.use(express.static('.'));
app.use('/uploads', express.static('uploads'));

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

// Resolve tenant from Supabase Auth user id; create tenant + seed if first login
async function resolveTenant(authUserId, displayName = null) {
    const { data: existing } = await supabase
        .from('tenants')
        .select('id')
        .eq('auth_user_id', authUserId)
        .maybeSingle();
    if (existing) return existing.id;

    const { data: inserted, error } = await supabase
        .from('tenants')
        .insert({ auth_user_id: authUserId, display_name: displayName || authUserId })
        .select('id')
        .single();
    if (error) throw error;
    await seedTenantDefaults(inserted.id);
    return inserted.id;
}

// Seed default consulttypes, mutualiteiten, categorieen for a new tenant
async function seedTenantDefaults(tenantId) {
    const consulttypes = [
        { tenant_id: tenantId, type: 'Intake gesprek', prijs: 60 },
        { tenant_id: tenantId, type: 'Lange opvolg (consultatie)', prijs: 35 },
        { tenant_id: tenantId, type: 'Korte opvolg (consultatie)', prijs: 30 },
        { tenant_id: tenantId, type: 'Nabespreking', prijs: 25 },
        { tenant_id: tenantId, type: 'Groepssessie (workshop)', prijs: null }
    ];
    const mutualiteiten = [
        { tenant_id: tenantId, naam: 'CM', max_sessies_per_jaar: null, opmerking: null },
        { tenant_id: tenantId, naam: 'Helan', max_sessies_per_jaar: null, opmerking: null },
        { tenant_id: tenantId, naam: 'Solidaris', max_sessies_per_jaar: null, opmerking: null },
        { tenant_id: tenantId, naam: 'LM', max_sessies_per_jaar: null, opmerking: null },
        { tenant_id: tenantId, naam: 'Partena', max_sessies_per_jaar: null, opmerking: null },
        { tenant_id: tenantId, naam: 'OZ', max_sessies_per_jaar: null, opmerking: null },
        { tenant_id: tenantId, naam: 'De Voorzorg', max_sessies_per_jaar: null, opmerking: null },
        { tenant_id: tenantId, naam: 'IDEWE', max_sessies_per_jaar: null, opmerking: null }
    ];
    const categorieen = [
        { tenant_id: tenantId, categorie: 'Huur' },
        { tenant_id: tenantId, categorie: 'Materiaal' },
        { tenant_id: tenantId, categorie: 'Verplaatsing' },
        { tenant_id: tenantId, categorie: 'Software' },
        { tenant_id: tenantId, categorie: 'Opleiding' },
        { tenant_id: tenantId, categorie: 'Marketing' },
        { tenant_id: tenantId, categorie: 'Overig' }
    ];
    await supabase.from('consulttypes').insert(consulttypes);
    await supabase.from('mutualiteiten').insert(mutualiteiten);
    await supabase.from('categorieen').insert(categorieen);
}

// Map DB row to API shape (snake_case -> camelCase for mutualiteiten)
function mapMutualiteit(row) {
    if (!row) return row;
    return { ...row, maxSessiesPerJaar: row.max_sessies_per_jaar };
}

// Auth middleware: verify Supabase JWT, resolve tenant
async function authenticateToken(req, res, next) {
    if (!supabase) {
        return res.status(503).json({ error: 'Database not configured' });
    }
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.authUser = user;
    try {
        req.tenantId = await resolveTenant(user.id, user.email || user.id);
        next();
    } catch (err) {
        return res.status(500).json({ error: 'Failed to resolve tenant' });
    }
}

// Public config for frontend (Supabase URL and anon key for auth)
app.get('/api/config', (req, res) => {
    res.json({
        supabaseUrl: process.env.SUPABASE_URL || '',
        supabaseAnonKey: process.env.SUPABASE_ANON_KEY || ''
    });
});

// --- API: Auth (Supabase handles login; this endpoint for compatibility / session check)
app.post('/api/login', (req, res) => {
    res.status(400).json({
        error: 'Use Supabase Auth: sign in via the login page (Supabase client). This endpoint is deprecated.'
    });
});

app.post('/api/verify-token', authenticateToken, (req, res) => {
    res.json({
        valid: true,
        user: {
            id: req.authUser.id,
            username: req.authUser.email || req.authUser.id
        }
    });
});

// --- Consulttypes
app.get('/api/consulttypes', authenticateToken, async (req, res) => {
    const { data, error } = await supabase
        .from('consulttypes')
        .select('*')
        .eq('tenant_id', req.tenantId)
        .order('type');
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

app.post('/api/consulttypes', authenticateToken, async (req, res) => {
    const { type, prijs } = req.body;
    const { data, error } = await supabase
        .from('consulttypes')
        .insert({ tenant_id: req.tenantId, type, prijs: prijs != null ? Number(prijs) : null })
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
        .eq('tenant_id', req.tenantId);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: 'Consulttype updated successfully' });
});

// --- Mutualiteiten
app.get('/api/mutualiteiten', authenticateToken, async (req, res) => {
    const { data, error } = await supabase
        .from('mutualiteiten')
        .select('*')
        .eq('tenant_id', req.tenantId)
        .order('naam');
    if (error) return res.status(500).json({ error: error.message });
    res.json((data || []).map(mapMutualiteit));
});

app.post('/api/mutualiteiten', authenticateToken, async (req, res) => {
    const { naam, maxSessiesPerJaar, opmerking } = req.body;
    const { data, error } = await supabase
        .from('mutualiteiten')
        .insert({
            tenant_id: req.tenantId,
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
        .eq('tenant_id', req.tenantId);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: 'Mutualiteit updated successfully' });
});

// --- Categorieën
app.get('/api/categorieen', authenticateToken, async (req, res) => {
    const { data, error } = await supabase
        .from('categorieen')
        .select('*')
        .eq('tenant_id', req.tenantId)
        .order('categorie');
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

app.post('/api/categorieen', authenticateToken, async (req, res) => {
    const { categorie } = req.body;
    const { data, error } = await supabase
        .from('categorieen')
        .insert({ tenant_id: req.tenantId, categorie })
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
        .eq('tenant_id', req.tenantId);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: 'Categorie updated successfully' });
});

// --- Klanten
app.get('/api/klanten', authenticateToken, async (req, res) => {
    const { data: klanten, error } = await supabase
        .from('klanten')
        .select('id, voornaam, achternaam, email, telefoon, startdatum, mutualiteit_id')
        .eq('tenant_id', req.tenantId)
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
        mutualiteit_naam: k.mutualiteit_id ? names[k.mutualiteit_id] : null
    }));
    res.json(result);
});

app.post('/api/klanten', authenticateToken, async (req, res) => {
    const { voornaam, achternaam, email, telefoon, startdatum, mutualiteit_id } = req.body;
    const { data, error } = await supabase
        .from('klanten')
        .insert({
            tenant_id: req.tenantId,
            voornaam,
            achternaam,
            email: email || null,
            telefoon: telefoon || null,
            startdatum: startdatum || null,
            mutualiteit_id: mutualiteit_id ? Number(mutualiteit_id) : null
        })
        .select('id, voornaam, achternaam, email, telefoon, startdatum, mutualiteit_id')
        .single();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

app.put('/api/klanten/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { voornaam, achternaam, email, telefoon, startdatum, mutualiteit_id } = req.body;
    const { error } = await supabase
        .from('klanten')
        .update({
            voornaam,
            achternaam,
            email: email || null,
            telefoon: telefoon || null,
            startdatum: startdatum || null,
            mutualiteit_id: mutualiteit_id ? Number(mutualiteit_id) : null
        })
        .eq('id', id)
        .eq('tenant_id', req.tenantId);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: 'Klant updated successfully' });
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
        .eq('tenant_id', req.tenantId)
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
        const key = `${req.tenantId}/${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
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
        .eq('tenant_id', req.tenantId)
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
            tenant_id: req.tenantId,
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

app.put('/api/afspraken/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { datum, klant_id, type_id, aantal, terugbetaalbaar, opmerking } = req.body;
    const updates = { datum, klant_id: klant_id != null ? Number(klant_id) : undefined, type_id: type_id != null ? Number(type_id) : undefined, aantal: aantal != null ? Number(aantal) : undefined, terugbetaalbaar: terugbetaalbaar != null ? Boolean(terugbetaalbaar) : undefined, opmerking: opmerking !== undefined ? opmerking : undefined };
    if (datum) {
        const d = new Date(datum);
        d.setDate(1);
        updates.maand = d.toISOString().split('T')[0];
    }
    if (type_id != null) {
        const { data: typeRow } = await supabase.from('consulttypes').select('prijs').eq('id', type_id).eq('tenant_id', req.tenantId).single();
        const prijs = typeRow?.prijs ?? 0;
        updates.prijs = prijs;
        updates.totaal = prijs * (Number(aantal) || 1);
    }
    Object.keys(updates).forEach(k => updates[k] === undefined && delete updates[k]);
    const { error } = await supabase.from('afspraken').update(updates).eq('id', id).eq('tenant_id', req.tenantId);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: 'Afspraak updated successfully' });
});

// PDF download: return signed URL for tenant-scoped file
app.get('/api/afspraken/:id/pdf', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { data: afspraak, error } = await supabase
        .from('afspraken')
        .select('pdf_bestand')
        .eq('id', id)
        .eq('tenant_id', req.tenantId)
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
        .eq('tenant_id', req.tenantId)
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
    const { error } = await supabase.from('uitgaven').update(updates).eq('id', id).eq('tenant_id', req.tenantId);
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
            tenant_id: req.tenantId,
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

// --- Dashboard
app.get('/api/dashboard', authenticateToken, async (req, res) => {
    const currentMonth = new Date();
    currentMonth.setDate(1);
    const currentMonthStr = currentMonth.toISOString().split('T')[0];
    const { data: income } = await supabase
        .from('afspraken')
        .select('totaal')
        .eq('tenant_id', req.tenantId)
        .eq('maand', currentMonthStr);
    const { data: expense } = await supabase
        .from('uitgaven')
        .select('bedrag')
        .eq('tenant_id', req.tenantId)
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
        .eq('tenant_id', req.tenantId)
        .gte('maand', yearStart)
        .lte('maand', yearEnd);
    const { data: uitgaven } = await supabase
        .from('uitgaven')
        .select('maand, bedrag')
        .eq('tenant_id', req.tenantId)
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

// --- Terugbetaling signalen
app.get('/api/terugbetaling-signalen', authenticateToken, async (req, res) => {
    const currentYear = new Date().getFullYear();
    const yearStart = `${currentYear}-01-01`;
    const yearEnd = `${currentYear + 1}-01-01`;
    const { data: klanten } = await supabase
        .from('klanten')
        .select('id, voornaam, achternaam, mutualiteit_id')
        .eq('tenant_id', req.tenantId);
    if (!klanten?.length) return res.json([]);
    const mutIds = [...new Set(klanten.map(k => k.mutualiteit_id).filter(Boolean))];
    const { data: mutualiteiten } = await supabase
        .from('mutualiteiten')
        .select('id, naam, max_sessies_per_jaar')
        .in('id', mutIds);
    const maxByMut = {};
    (mutualiteiten || []).forEach(m => {
        if (m.max_sessies_per_jaar != null) maxByMut[m.id] = m.max_sessies_per_jaar;
    });
    const { data: afspraken } = await supabase
        .from('afspraken')
        .select('klant_id')
        .eq('tenant_id', req.tenantId)
        .eq('terugbetaalbaar', true)
        .gte('datum', yearStart)
        .lt('datum', yearEnd);
    const countByKlant = {};
    (afspraken || []).forEach(a => {
        countByKlant[a.klant_id] = (countByKlant[a.klant_id] || 0) + 1;
    });
    const out = [];
    for (const k of klanten) {
        const maxSessies = maxByMut[k.mutualiteit_id];
        if (maxSessies == null) continue;
        const sessies = countByKlant[k.id] || 0;
        if (sessies >= maxSessies) {
            const mut = (mutualiteiten || []).find(m => m.id === k.mutualiteit_id);
            out.push({
                klant_id: k.id,
                voornaam: k.voornaam,
                achternaam: k.achternaam,
                mutualiteit_naam: mut?.naam,
                maxSessiesPerJaar: mut?.max_sessies_per_jaar,
                sessies_terugbetaalbaar: sessies
            });
        }
    }
    res.json(out);
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index-production.html'));
});
app.get('/index.html', (req, res) => {
    res.redirect(302, '/');
});
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

module.exports = app;

if (process.env.NODE_ENV !== 'production' || process.env.VERCEL !== '1') {
    app.listen(PORT, () => {
        console.log(`Diëtist Laura server running on port ${PORT}`);
    });
}
