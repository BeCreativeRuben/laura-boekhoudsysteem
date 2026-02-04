-- Multi-tenant schema for Laura Boekhoudsysteem
-- Run this in Supabase SQL Editor or via: supabase db push

-- Tenants: one per authenticated user (Supabase Auth)
CREATE TABLE IF NOT EXISTS tenants (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id uuid NOT NULL UNIQUE,
    display_name text,
    created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tenants_auth_user_id ON tenants(auth_user_id);

-- Consulttypes (per tenant)
CREATE TABLE IF NOT EXISTS consulttypes (
    id bigserial PRIMARY KEY,
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    type text NOT NULL,
    prijs numeric(10,2),
    UNIQUE(tenant_id, type)
);
CREATE INDEX IF NOT EXISTS idx_consulttypes_tenant_id ON consulttypes(tenant_id);

-- Mutualiteiten (per tenant)
CREATE TABLE IF NOT EXISTS mutualiteiten (
    id bigserial PRIMARY KEY,
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    naam text NOT NULL,
    max_sessies_per_jaar integer,
    opmerking text,
    UNIQUE(tenant_id, naam)
);
CREATE INDEX IF NOT EXISTS idx_mutualiteiten_tenant_id ON mutualiteiten(tenant_id);

-- Categorieën (per tenant)
CREATE TABLE IF NOT EXISTS categorieen (
    id bigserial PRIMARY KEY,
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    categorie text NOT NULL,
    UNIQUE(tenant_id, categorie)
);
CREATE INDEX IF NOT EXISTS idx_categorieen_tenant_id ON categorieen(tenant_id);

-- Klanten (clients; per tenant)
CREATE TABLE IF NOT EXISTS klanten (
    id bigserial PRIMARY KEY,
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    voornaam text NOT NULL,
    achternaam text NOT NULL,
    email text,
    telefoon text,
    startdatum date,
    mutualiteit_id bigint REFERENCES mutualiteiten(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_klanten_tenant_id ON klanten(tenant_id);
CREATE INDEX IF NOT EXISTS idx_klanten_mutualiteit_id ON klanten(mutualiteit_id);

-- Afspraken (per tenant; pdf_bestand = storage path/key)
CREATE TABLE IF NOT EXISTS afspraken (
    id bigserial PRIMARY KEY,
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    datum date NOT NULL,
    klant_id bigint NOT NULL REFERENCES klanten(id) ON DELETE CASCADE,
    type_id bigint NOT NULL REFERENCES consulttypes(id) ON DELETE RESTRICT,
    aantal integer DEFAULT 1,
    prijs numeric(10,2),
    totaal numeric(10,2),
    terugbetaalbaar boolean DEFAULT false,
    opmerking text,
    maand date,
    pdf_bestand text
);
CREATE INDEX IF NOT EXISTS idx_afspraken_tenant_id ON afspraken(tenant_id);
CREATE INDEX IF NOT EXISTS idx_afspraken_maand ON afspraken(maand);
CREATE INDEX IF NOT EXISTS idx_afspraken_datum ON afspraken(datum);

-- Uitgaven (per tenant)
CREATE TABLE IF NOT EXISTS uitgaven (
    id bigserial PRIMARY KEY,
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    datum date NOT NULL,
    beschrijving text NOT NULL,
    categorie_id bigint REFERENCES categorieen(id) ON DELETE SET NULL,
    bedrag numeric(10,2) NOT NULL,
    betaalmethode text,
    maand date
);
CREATE INDEX IF NOT EXISTS idx_uitgaven_tenant_id ON uitgaven(tenant_id);
CREATE INDEX IF NOT EXISTS idx_uitgaven_maand ON uitgaven(maand);
