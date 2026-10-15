-- ==============================================================================
-- StyleMirror RLS Verification Script
-- Run this in the Supabase SQL Editor to test permissions under both roles.
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- TEST 1: Anonymous Role (Simulating Frontend public access)
-- ------------------------------------------------------------------------------
SET LOCAL ROLE anon;

-- Test 1a: Reading active garments SHOULD succeed
DO $$
DECLARE
    garment_count integer;
BEGIN
    SELECT COUNT(*) INTO garment_count FROM garments;
    RAISE NOTICE 'TEST 1a PASSED: Anon successfully queried garments (count: %)', garment_count;
END $$;

-- Test 1b: Reading fabrics SHOULD succeed
DO $$
DECLARE
    fabric_count integer;
BEGIN
    SELECT COUNT(*) INTO fabric_count FROM fabrics;
    RAISE NOTICE 'TEST 1b PASSED: Anon successfully queried fabrics (count: %)', fabric_count;
END $$;

-- Test 1c: Reading sessions MUST return 0 rows (blocked by RLS)
DO $$
DECLARE
    session_count integer;
BEGIN
    SELECT COUNT(*) INTO session_count FROM sessions;
    IF session_count = 0 THEN
        RAISE NOTICE 'TEST 1c PASSED: Anon returned 0 rows from sessions table (blocked by RLS).';
    ELSE
        RAISE EXCEPTION 'TEST 1c FAILED: Anon was able to read % sessions!', session_count;
    END IF;
END $$;

-- Test 1d: Reading body_profiles MUST return 0 rows (blocked by RLS)
DO $$
DECLARE
    profile_count integer;
BEGIN
    SELECT COUNT(*) INTO profile_count FROM body_profiles;
    IF profile_count = 0 THEN
        RAISE NOTICE 'TEST 1d PASSED: Anon returned 0 rows from body_profiles table (blocked by RLS).';
    ELSE
        RAISE EXCEPTION 'TEST 1d FAILED: Anon was able to read % body profiles!', profile_count;
    END IF;
END $$;

-- Test 1e: Attempting to insert a session as anon MUST FAIL
DO $$
BEGIN
    INSERT INTO sessions (consent_given) VALUES (true);
    RAISE EXCEPTION 'TEST 1e FAILED: Anon should not be allowed to insert into sessions!';
EXCEPTION
    WHEN insufficient_privilege THEN
        RAISE NOTICE 'TEST 1e PASSED: Anon insert into sessions was correctly rejected with insufficient_privilege.';
END $$;


-- ------------------------------------------------------------------------------
-- TEST 2: Service Role (Simulating FastAPI Backend access)
-- ------------------------------------------------------------------------------
SET LOCAL ROLE service_role;

-- Test 2a: Backend can read and write sessions
DO $$
DECLARE
    new_session_id uuid;
BEGIN
    INSERT INTO sessions (consent_given) VALUES (true) RETURNING id INTO new_session_id;
    RAISE NOTICE 'TEST 2a PASSED: service_role successfully inserted session (id: %)', new_session_id;
    
    INSERT INTO body_profiles (
        session_id, height_cm, shoulder_cm, chest_cm, waist_cm, hip_cm, inseam_cm, torso_cm, confidence
    ) VALUES (
        new_session_id, 178.5, 46.0, 98.0, 82.0, 99.0, 80.0, 52.0, 0.92
    );
    RAISE NOTICE 'TEST 2b PASSED: service_role successfully inserted body_profile linked to session.';
END $$;

ROLLBACK; -- Clean rollback so tests leave no permanent test rows
