-- Migration: 0001_initial_schema.sql
-- Description: Core schema for StyleMirror: fabrics, garments, colors, sizes, size_charts, sessions, and body_profiles

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enums
DO $$ BEGIN
    CREATE TYPE garment_category AS ENUM ('top', 'bottom', 'outerwear', 'cap', 'dress');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE garment_fit_type AS ENUM ('slim', 'regular', 'relaxed', 'oversized');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1. Fabrics Table
CREATE TABLE IF NOT EXISTS fabrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    benefits TEXT[] NOT NULL DEFAULT '{}',
    care_instructions TEXT[] NOT NULL DEFAULT '{}',
    best_seasons TEXT[] NOT NULL DEFAULT '{}',
    breathability SMALLINT NOT NULL CHECK (breathability BETWEEN 1 AND 5),
    stretch SMALLINT NOT NULL CHECK (stretch BETWEEN 1 AND 5),
    durability SMALLINT NOT NULL CHECK (durability BETWEEN 1 AND 5),
    skin_sensitivity_note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Garments Table
CREATE TABLE IF NOT EXISTS garments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(150) NOT NULL UNIQUE,
    category garment_category NOT NULL,
    fit_type garment_fit_type NOT NULL DEFAULT 'regular',
    neckline VARCHAR(50),
    length VARCHAR(50),
    pattern VARCHAR(50),
    occasion TEXT[] NOT NULL DEFAULT '{}',
    fabric_id UUID NOT NULL REFERENCES fabrics(id) ON DELETE RESTRICT,
    base_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (base_price >= 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    thumbnail_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Garment Colors Table
CREATE TABLE IF NOT EXISTS garment_colors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    garment_id UUID NOT NULL REFERENCES garments(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    hex VARCHAR(7) NOT NULL CHECK (hex ~* '^#[0-9A-F]{6}$'),
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Garment Sizes Table
CREATE TABLE IF NOT EXISTS garment_sizes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    garment_id UUID NOT NULL REFERENCES garments(id) ON DELETE CASCADE,
    size_label VARCHAR(10) NOT NULL CHECK (size_label IN ('XS', 'S', 'M', 'L', 'XL', 'XXL')),
    glb_url TEXT NOT NULL,
    chest_cm NUMERIC(6, 2) CHECK (chest_cm IS NULL OR chest_cm > 0),
    waist_cm NUMERIC(6, 2) CHECK (waist_cm IS NULL OR waist_cm > 0),
    hip_cm NUMERIC(6, 2) CHECK (hip_cm IS NULL OR hip_cm > 0),
    shoulder_cm NUMERIC(6, 2) CHECK (shoulder_cm IS NULL OR shoulder_cm > 0),
    length_cm NUMERIC(6, 2) CHECK (length_cm IS NULL OR length_cm > 0),
    inseam_cm NUMERIC(6, 2) CHECK (inseam_cm IS NULL OR inseam_cm > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_garment_size UNIQUE (garment_id, size_label)
);

-- 5. Size Charts Table
CREATE TABLE IF NOT EXISTS size_charts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category garment_category NOT NULL,
    size_label VARCHAR(10) NOT NULL CHECK (size_label IN ('XS', 'S', 'M', 'L', 'XL', 'XXL')),
    chest_min NUMERIC(6, 2) CHECK (chest_min IS NULL OR chest_min >= 0),
    chest_max NUMERIC(6, 2) CHECK (chest_max IS NULL OR chest_max >= 0),
    waist_min NUMERIC(6, 2) CHECK (waist_min IS NULL OR waist_min >= 0),
    waist_max NUMERIC(6, 2) CHECK (waist_max IS NULL OR waist_max >= 0),
    hip_min NUMERIC(6, 2) CHECK (hip_min IS NULL OR hip_min >= 0),
    hip_max NUMERIC(6, 2) CHECK (hip_max IS NULL OR hip_max >= 0),
    height_min NUMERIC(6, 2) CHECK (height_min IS NULL OR height_min >= 0),
    height_max NUMERIC(6, 2) CHECK (height_max IS NULL OR height_max >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_size_chart_category_size UNIQUE (category, size_label)
);

-- 6. Sessions Table (Privacy-first, 24-hr default lifecycle)
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now() + interval '24 hours'),
    consent_given BOOLEAN NOT NULL DEFAULT false
);

-- 7. Body Profiles Table (Derived estimates linked to session)
CREATE TABLE IF NOT EXISTS body_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL UNIQUE REFERENCES sessions(id) ON DELETE CASCADE,
    height_cm NUMERIC(6, 2) NOT NULL CHECK (height_cm BETWEEN 50 AND 300),
    shoulder_cm NUMERIC(6, 2) NOT NULL CHECK (shoulder_cm BETWEEN 20 AND 100),
    chest_cm NUMERIC(6, 2) NOT NULL CHECK (chest_cm BETWEEN 30 AND 250),
    waist_cm NUMERIC(6, 2) NOT NULL CHECK (waist_cm BETWEEN 30 AND 250),
    hip_cm NUMERIC(6, 2) NOT NULL CHECK (hip_cm BETWEEN 30 AND 250),
    inseam_cm NUMERIC(6, 2) NOT NULL CHECK (inseam_cm BETWEEN 30 AND 150),
    torso_cm NUMERIC(6, 2) NOT NULL CHECK (torso_cm BETWEEN 20 AND 120),
    body_type VARCHAR(50),
    skin_tone_hex VARCHAR(7) CHECK (skin_tone_hex IS NULL OR skin_tone_hex ~* '^#[0-9A-F]{6}$'),
    undertone VARCHAR(30),
    confidence NUMERIC(4, 3) NOT NULL CHECK (confidence BETWEEN 0.000 AND 1.000),
    manual_overrides JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Trigger Function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply Triggers
DO $$
DECLARE
    tbl text;
BEGIN
    FOR tbl IN SELECT unnest(ARRAY['fabrics', 'garments', 'garment_colors', 'garment_sizes', 'size_charts', 'body_profiles'])
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS trg_%s_updated_at ON %I;', tbl, tbl);
        EXECUTE format('CREATE TRIGGER trg_%s_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();', tbl, tbl);
    END LOOP;
END $$;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_garments_fabric_id ON garments(fabric_id);
CREATE INDEX IF NOT EXISTS idx_garments_category_is_active ON garments(category, is_active);
CREATE INDEX IF NOT EXISTS idx_garment_colors_garment_id ON garment_colors(garment_id);
CREATE INDEX IF NOT EXISTS idx_garment_sizes_garment_id ON garment_sizes(garment_id);
CREATE INDEX IF NOT EXISTS idx_size_charts_category ON size_charts(category);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_body_profiles_session_id ON body_profiles(session_id);
