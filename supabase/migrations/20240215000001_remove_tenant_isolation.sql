-- Remove multi-tenant isolation - convert to single-user system
-- Run this in Supabase SQL Editor
-- NOTE: Use 20240215000002_complete_single_user_setup.sql instead - it includes RLS cleanup

-- Step 1: Drop foreign key constraints that reference tenants
ALTER TABLE IF EXISTS consulttypes DROP CONSTRAINT IF EXISTS consulttypes_tenant_id_fkey;
ALTER TABLE IF EXISTS mutualiteiten DROP CONSTRAINT IF EXISTS mutualiteiten_tenant_id_fkey;
ALTER TABLE IF EXISTS categorieen DROP CONSTRAINT IF EXISTS categorieen_tenant_id_fkey;
ALTER TABLE IF EXISTS klanten DROP CONSTRAINT IF EXISTS klanten_tenant_id_fkey;
ALTER TABLE IF EXISTS afspraken DROP CONSTRAINT IF EXISTS afspraken_tenant_id_fkey;
ALTER TABLE IF EXISTS uitgaven DROP CONSTRAINT IF EXISTS uitgaven_tenant_id_fkey;

-- Step 2: Drop unique constraints that include tenant_id
ALTER TABLE IF EXISTS consulttypes DROP CONSTRAINT IF EXISTS consulttypes_tenant_id_type_key;
ALTER TABLE IF EXISTS mutualiteiten DROP CONSTRAINT IF EXISTS mutualiteiten_tenant_id_naam_key;
ALTER TABLE IF EXISTS categorieen DROP CONSTRAINT IF EXISTS categorieen_tenant_id_categorie_key;

-- Step 3: Drop indexes on tenant_id
DROP INDEX IF EXISTS idx_consulttypes_tenant_id;
DROP INDEX IF EXISTS idx_mutualiteiten_tenant_id;
DROP INDEX IF EXISTS idx_categorieen_tenant_id;
DROP INDEX IF EXISTS idx_klanten_tenant_id;
DROP INDEX IF EXISTS idx_afspraken_tenant_id;
DROP INDEX IF EXISTS idx_uitgaven_tenant_id;

-- Step 4: Drop tenant_id columns (PostgreSQL requires dropping constraints first)
ALTER TABLE IF EXISTS consulttypes DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE IF EXISTS mutualiteiten DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE IF EXISTS categorieen DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE IF EXISTS klanten DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE IF EXISTS afspraken DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE IF EXISTS uitgaven DROP COLUMN IF EXISTS tenant_id;

-- Step 5: Add unique constraints without tenant_id (for single-user)
ALTER TABLE IF EXISTS consulttypes ADD CONSTRAINT consulttypes_type_key UNIQUE (type);
ALTER TABLE IF EXISTS mutualiteiten ADD CONSTRAINT mutualiteiten_naam_key UNIQUE (naam);
ALTER TABLE IF EXISTS categorieen ADD CONSTRAINT categorieen_categorie_key UNIQUE (categorie);

-- Step 6: Drop tenants table (no longer needed)
DROP TABLE IF EXISTS tenants CASCADE;

-- Step 7: Drop tenant-related indexes
DROP INDEX IF EXISTS idx_tenants_auth_user_id;
