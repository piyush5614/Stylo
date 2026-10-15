-- Migration: 20261011000002_rls_policies.sql
-- Description: Enable Row Level Security (RLS) on all tables and configure public read-only and service-role rules

-- Enable RLS on all tables
ALTER TABLE fabrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE garments ENABLE ROW LEVEL SECURITY;
ALTER TABLE garment_colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE garment_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE size_charts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_profiles ENABLE ROW LEVEL SECURITY;

-- 1. Fabrics: Public (anon and authenticated) read-only access
DROP POLICY IF EXISTS "Public can view fabrics" ON fabrics;
CREATE POLICY "Public can view fabrics"
    ON fabrics FOR SELECT
    TO anon, authenticated
    USING (true);

-- 2. Garments: Public can only view active garments
DROP POLICY IF EXISTS "Public can view active garments" ON garments;
CREATE POLICY "Public can view active garments"
    ON garments FOR SELECT
    TO anon, authenticated
    USING (is_active = true);

-- 3. Garment Colors: Public can only view colors of active garments
DROP POLICY IF EXISTS "Public can view colors of active garments" ON garment_colors;
CREATE POLICY "Public can view colors of active garments"
    ON garment_colors FOR SELECT
    TO anon, authenticated
    USING (
        EXISTS (
            SELECT 1 FROM garments g
            WHERE g.id = garment_colors.garment_id
              AND g.is_active = true
        )
    );

-- 4. Garment Sizes: Public can only view sizes of active garments
DROP POLICY IF EXISTS "Public can view sizes of active garments" ON garment_sizes;
CREATE POLICY "Public can view sizes of active garments"
    ON garment_sizes FOR SELECT
    TO anon, authenticated
    USING (
        EXISTS (
            SELECT 1 FROM garments g
            WHERE g.id = garment_sizes.garment_id
              AND g.is_active = true
        )
    );

-- 5. Size Charts: Public read-only access
DROP POLICY IF EXISTS "Public can view size charts" ON size_charts;
CREATE POLICY "Public can view size charts"
    ON size_charts FOR SELECT
    TO anon, authenticated
    USING (true);

-- 6. Sessions & Body Profiles:
-- Zero access for anon and authenticated users by default.
-- With RLS enabled and no policies granting SELECT/INSERT/UPDATE/DELETE to anon/authenticated,
-- only the service_role key (which bypasses RLS in Supabase) can read/write sessions and body_profiles.
