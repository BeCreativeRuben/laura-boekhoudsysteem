-- Complete Single-User Setup Migration
-- Run this entire script in Supabase SQL Editor
-- This removes all multi-tenant functionality and sets up for single-user mode

-- ============================================================================
-- STEP 1: Drop foreign key constraints that reference tenants
-- ============================================================================
ALTER TABLE IF EXISTS consulttypes DROP CONSTRAINT IF EXISTS consulttypes_tenant_id_fkey;
ALTER TABLE IF EXISTS mutualiteiten DROP CONSTRAINT IF EXISTS mutualiteiten_tenant_id_fkey;
ALTER TABLE IF EXISTS categorieen DROP CONSTRAINT IF EXISTS categorieen_tenant_id_fkey;
ALTER TABLE IF EXISTS klanten DROP CONSTRAINT IF EXISTS klanten_tenant_id_fkey;
ALTER TABLE IF EXISTS afspraken DROP CONSTRAINT IF EXISTS afspraken_tenant_id_fkey;
ALTER TABLE IF EXISTS uitgaven DROP CONSTRAINT IF EXISTS uitgaven_tenant_id_fkey;

-- ============================================================================
-- STEP 2: Drop unique constraints that include tenant_id
-- ============================================================================
ALTER TABLE IF EXISTS consulttypes DROP CONSTRAINT IF EXISTS consulttypes_tenant_id_type_key;
ALTER TABLE IF EXISTS mutualiteiten DROP CONSTRAINT IF EXISTS mutualiteiten_tenant_id_naam_key;
ALTER TABLE IF EXISTS categorieen DROP CONSTRAINT IF EXISTS categorieen_tenant_id_categorie_key;

-- ============================================================================
-- STEP 3: Drop indexes on tenant_id
-- ============================================================================
DROP INDEX IF EXISTS idx_consulttypes_tenant_id;
DROP INDEX IF EXISTS idx_mutualiteiten_tenant_id;
DROP INDEX IF EXISTS idx_categorieen_tenant_id;
DROP INDEX IF EXISTS idx_klanten_tenant_id;
DROP INDEX IF EXISTS idx_afspraken_tenant_id;
DROP INDEX IF EXISTS idx_uitgaven_tenant_id;
DROP INDEX IF EXISTS idx_tenants_auth_user_id;

-- ============================================================================
-- STEP 4: Drop tenant_id columns from all tables
-- ============================================================================
ALTER TABLE IF EXISTS consulttypes DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE IF EXISTS mutualiteiten DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE IF EXISTS categorieen DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE IF EXISTS klanten DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE IF EXISTS afspraken DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE IF EXISTS uitgaven DROP COLUMN IF EXISTS tenant_id;

-- ============================================================================
-- STEP 5: Add new unique constraints without tenant_id (for single-user)
-- ============================================================================
-- Note: Only add if they don't already exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'consulttypes_type_key'
    ) THEN
        ALTER TABLE consulttypes ADD CONSTRAINT consulttypes_type_key UNIQUE (type);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'mutualiteiten_naam_key'
    ) THEN
        ALTER TABLE mutualiteiten ADD CONSTRAINT mutualiteiten_naam_key UNIQUE (naam);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'categorieen_categorie_key'
    ) THEN
        ALTER TABLE categorieen ADD CONSTRAINT categorieen_categorie_key UNIQUE (categorie);
    END IF;
END $$;

-- ============================================================================
-- STEP 6: Drop tenants table (no longer needed for single-user)
-- ============================================================================
DROP TABLE IF EXISTS tenants CASCADE;

-- ============================================================================
-- STEP 7: Disable Row Level Security (RLS) on all tables
-- ============================================================================
-- Since we're using service_role key, RLS is not needed
ALTER TABLE IF EXISTS consulttypes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS mutualiteiten DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS categorieen DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS klanten DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS afspraken DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS uitgaven DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 8: Drop any existing RLS policies (cleanup)
-- ============================================================================
DROP POLICY IF EXISTS "Users can view own data" ON consulttypes;
DROP POLICY IF EXISTS "Users can insert own data" ON consulttypes;
DROP POLICY IF EXISTS "Users can update own data" ON consulttypes;
DROP POLICY IF EXISTS "Users can delete own data" ON consulttypes;

DROP POLICY IF EXISTS "Users can view own data" ON mutualiteiten;
DROP POLICY IF EXISTS "Users can insert own data" ON mutualiteiten;
DROP POLICY IF EXISTS "Users can update own data" ON mutualiteiten;
DROP POLICY IF EXISTS "Users can delete own data" ON mutualiteiten;

DROP POLICY IF EXISTS "Users can view own data" ON categorieen;
DROP POLICY IF EXISTS "Users can insert own data" ON categorieen;
DROP POLICY IF EXISTS "Users can update own data" ON categorieen;
DROP POLICY IF EXISTS "Users can delete own data" ON categorieen;

DROP POLICY IF EXISTS "Users can view own data" ON klanten;
DROP POLICY IF EXISTS "Users can insert own data" ON klanten;
DROP POLICY IF EXISTS "Users can update own data" ON klanten;
DROP POLICY IF EXISTS "Users can delete own data" ON klanten;

DROP POLICY IF EXISTS "Users can view own data" ON afspraken;
DROP POLICY IF EXISTS "Users can insert own data" ON afspraken;
DROP POLICY IF EXISTS "Users can update own data" ON afspraken;
DROP POLICY IF EXISTS "Users can delete own data" ON afspraken;

DROP POLICY IF EXISTS "Users can view own data" ON uitgaven;
DROP POLICY IF EXISTS "Users can insert own data" ON uitgaven;
DROP POLICY IF EXISTS "Users can update own data" ON uitgaven;
DROP POLICY IF EXISTS "Users can delete own data" ON uitgaven;

-- ============================================================================
-- STEP 9: Verify Storage bucket exists (manual check needed)
-- ============================================================================
-- Note: Storage buckets must be created manually in Supabase Dashboard
-- Go to: Storage → Buckets → Create bucket
-- Name: afspraak-pdfs
-- Public: Yes (or configure policies as needed)

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- Your database is now configured for single-user mode!
-- All tenant_id columns have been removed
-- RLS has been disabled
-- You can now use the app with secret token authentication
