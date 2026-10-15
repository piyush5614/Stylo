-- Migration: 20261011000003_storage_and_cleanup.sql
-- Description: Create public garment-models storage bucket and session cleanup function / pg_cron job

-- 1. Storage bucket: garment-models (Public read for 3D GLB assets & thumbnails)
-- Note: User photos are strictly ephemeral (in-memory) and NEVER stored.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'garment-models',
    'garment-models',
    true,
    52428800, -- 50 MB
    ARRAY['model/gltf-binary', 'model/gltf+json', 'image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 52428800,
    allowed_mime_types = ARRAY['model/gltf-binary', 'model/gltf+json', 'image/png', 'image/jpeg', 'image/webp'];

-- Storage RLS: Public read access for garment-models
DROP POLICY IF EXISTS "Public read access for garment-models" ON storage.objects;
CREATE POLICY "Public read access for garment-models"
    ON storage.objects FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'garment-models');

-- Only service_role can upload or modify assets in garment-models
DROP POLICY IF EXISTS "Service role upload for garment-models" ON storage.objects;
CREATE POLICY "Service role upload for garment-models"
    ON storage.objects FOR INSERT
    TO service_role
    WITH CHECK (bucket_id = 'garment-models');

-- 2. Cleanup Function: Deletes expired sessions (cascades automatically to body_profiles)
CREATE OR REPLACE FUNCTION delete_expired_sessions()
RETURNS integer AS $$
DECLARE
    deleted_count integer;
BEGIN
    DELETE FROM sessions
    WHERE expires_at < timezone('utc'::text, now());
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Scheduled cleanup via pg_cron (if available on Supabase instance)
-- Will run hourly at minute 0
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_extension WHERE extname = 'pg_cron'
    ) THEN
        PERFORM cron.schedule(
            'delete-expired-sessions-hourly',
            '0 * * * *',
            'SELECT delete_expired_sessions();'
        );
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        -- If pg_cron is not enabled or user lacks permission, fallback is handled via API/service cron
        RAISE NOTICE 'pg_cron extension not active or insufficient privileges. Cleanup function delete_expired_sessions() can be scheduled via HTTP trigger or edge function.';
END $$;
