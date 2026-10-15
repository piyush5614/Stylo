-- Seed: seed_data.sql
-- Description: Realistic initial data: 8 fabrics, comprehensive size charts, and 6 placeholder garments with colors & sizes

-- ============================================================================
-- 1. SEED FABRICS (8 distinct materials with real-world textile attributes)
-- ============================================================================
INSERT INTO fabrics (
    id, name, slug, description, benefits, care_instructions, best_seasons,
    breathability, stretch, durability, skin_sensitivity_note
) VALUES
(
    'a0000001-0000-0000-0000-000000000001',
    'Organic Cotton',
    'cotton',
    'Breathable, soft, natural plant fiber suitable for everyday comfort.',
    ARRAY['Highly breathable', 'Soft hand-feel', 'Hypoallergenic', 'Biodegradable'],
    ARRAY['Machine wash warm (40°C)', 'Tumble dry low or air dry', 'Iron on medium heat', 'Do not bleach'],
    ARRAY['Spring', 'Summer', 'Autumn', 'Winter'],
    5, 2, 4,
    'Excellent for sensitive or eczema-prone skin due to zero synthetic residues.'
),
(
    'a0000001-0000-0000-0000-000000000002',
    'Pure Linen',
    'linen',
    'Flax-derived luxury textile renowned for exceptional cooling and natural texture.',
    ARRAY['Maximum airflow and cooling', 'Moisture-wicking', 'Becomes softer with every wash', 'Naturally antimicrobial'],
    ARRAY['Gentle cycle in cold water', 'Line dry recommended', 'Iron while damp at high heat', 'Avoid excessive wringing'],
    ARRAY['Summer', 'Late Spring'],
    5, 1, 4,
    'Hypoallergenic and breathable; gentle even in high heat and humidity.'
),
(
    'a0000001-0000-0000-0000-000000000003',
    'Performance Polyester',
    'polyester',
    'Quick-drying synthetic engineered for durability, structure, and wrinkle resistance.',
    ARRAY['Wrinkle-free', 'Rapid drying', 'Colorfast', 'Shape retaining'],
    ARRAY['Machine wash cold (30°C)', 'Tumble dry low', 'Iron on low synthetic setting', 'Avoid fabric softener'],
    ARRAY['Spring', 'Autumn', 'Winter'],
    2, 3, 5,
    'Synthetic fiber; individuals prone to synthetic irritation should pair with natural undershirts.'
),
(
    'a0000001-0000-0000-0000-000000000004',
    'Merino Wool',
    'wool',
    'Fine-gauge natural wool that delivers thermoregulation without itchiness.',
    ARRAY['Natural temperature regulator', 'Odor resistant', 'Insulates even when damp', 'Elastic and resilient'],
    ARRAY['Hand wash cold or wool cycle', 'Lay flat to dry', 'Do not tumble dry', 'Store folded with cedar blocks'],
    ARRAY['Autumn', 'Winter', 'Early Spring'],
    4, 4, 4,
    'Ultra-fine merino fibers (<19.5 micron) typically do not trigger prickle, but pure wool allergies apply.'
),
(
    'a0000001-0000-0000-0000-000000000005',
    'Heavyweight Denim',
    'denim',
    'Rugged twill-woven cotton engineered for timeless silhouettes and long-term wear.',
    ARRAY['Exceptional durability', 'Structured drape', 'Custom patina over time', 'Wind resistant'],
    ARRAY['Wash inside out in cold water', 'Air dry only to preserve shape', 'Wash infrequently to preserve dye'],
    ARRAY['All Season', 'Autumn', 'Spring', 'Winter'],
    3, 1, 5,
    'Stiff when raw; pre-washed finishes soften considerably against skin.'
),
(
    'a0000001-0000-0000-0000-000000000006',
    'Silky Viscose',
    'viscose',
    'Regenerated cellulose textile that mimics silk drape with lightweight fluidity.',
    ARRAY['Silky fluid drape', 'Breathable feel', 'Subtle sheen', 'Lightweight movement'],
    ARRAY['Gentle hand wash cold', 'Do not wring or twist', 'Dry flat in shade', 'Cool iron on reverse'],
    ARRAY['Spring', 'Summer'],
    4, 2, 3,
    'Smooth hand-feel, non-irritating for delicate skin types.'
),
(
    'a0000001-0000-0000-0000-000000000007',
    'Technical Nylon',
    'nylon',
    'Ultralight, high-tensile polymer fabric offering water resistance and weather shielding.',
    ARRAY['High tensile strength', 'Abrasion resistant', 'Water repellent', 'Ultralightweight'],
    ARRAY['Machine wash gentle cold', 'Drip dry', 'Do not iron directly', 'Keep away from open heat'],
    ARRAY['Autumn', 'Winter', 'Spring'],
    2, 3, 5,
    'Non-reactive, ideal as an outer barrier layer.'
),
(
    'a0000001-0000-0000-0000-000000000008',
    'Stretch Cotton Blend',
    'cotton-blend',
    'Balanced combination of 95% combed cotton and 5% elastane for daily mobility.',
    ARRAY['4-way stretch comfort', 'Breathable and soft', 'Retains collar and cuff shape', 'Easy care'],
    ARRAY['Machine wash warm (40°C)', 'Tumble dry medium', 'Warm iron if needed'],
    ARRAY['All Season'],
    4, 4, 4,
    'Comfortable for daily all-day wear with high skin tolerance.'
)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    benefits = EXCLUDED.benefits,
    care_instructions = EXCLUDED.care_instructions,
    best_seasons = EXCLUDED.best_seasons,
    breathability = EXCLUDED.breathability,
    stretch = EXCLUDED.stretch,
    durability = EXCLUDED.durability,
    skin_sensitivity_note = EXCLUDED.skin_sensitivity_note;


-- ============================================================================
-- 2. SEED SIZE CHARTS (Tops and Bottoms)
-- ============================================================================
INSERT INTO size_charts (
    category, size_label, chest_min, chest_max, waist_min, waist_max, hip_min, hip_max, height_min, height_max
) VALUES
-- TOPS
('top', 'XS', 80.0, 86.0, 66.0, 72.0, 82.0, 88.0, 155.0, 168.0),
('top', 'S',  86.0, 94.0, 72.0, 80.0, 88.0, 96.0, 162.0, 175.0),
('top', 'M',  94.0, 102.0, 80.0, 88.0, 96.0, 104.0, 168.0, 182.0),
('top', 'L',  102.0, 110.0, 88.0, 96.0, 104.0, 112.0, 172.0, 188.0),
('top', 'XL', 110.0, 118.0, 96.0, 106.0, 112.0, 120.0, 175.0, 192.0),
('top', 'XXL', 118.0, 128.0, 106.0, 118.0, 120.0, 130.0, 175.0, 195.0),

-- BOTTOMS
('bottom', 'XS', NULL, NULL, 64.0, 70.0, 84.0, 90.0, 155.0, 168.0),
('bottom', 'S',  NULL, NULL, 70.0, 78.0, 90.0, 98.0, 162.0, 175.0),
('bottom', 'M',  NULL, NULL, 78.0, 86.0, 98.0, 106.0, 168.0, 182.0),
('bottom', 'L',  NULL, NULL, 86.0, 94.0, 106.0, 114.0, 172.0, 188.0),
('bottom', 'XL', NULL, NULL, 94.0, 104.0, 114.0, 122.0, 175.0, 192.0),
('bottom', 'XXL', NULL, NULL, 104.0, 116.0, 122.0, 132.0, 175.0, 195.0)
ON CONFLICT (category, size_label) DO UPDATE SET
    chest_min = EXCLUDED.chest_min,
    chest_max = EXCLUDED.chest_max,
    waist_min = EXCLUDED.waist_min,
    waist_max = EXCLUDED.waist_max,
    hip_min = EXCLUDED.hip_min,
    hip_max = EXCLUDED.hip_max,
    height_min = EXCLUDED.height_min,
    height_max = EXCLUDED.height_max;


-- ============================================================================
-- 3. SEED 6 PLACEHOLDER GARMENTS (3 Tops, 2 Bottoms, 1 Cap)
-- ============================================================================

-- Garment 1: Classic Crewneck T-Shirt (Top)
INSERT INTO garments (
    id, name, slug, category, fit_type, neckline, length, pattern, occasion,
    fabric_id, base_price, is_active, thumbnail_url
) VALUES (
    'b0000001-0000-0000-0000-000000000001',
    'Essential Minimalist Tee',
    'essential-minimalist-tee',
    'top',
    'regular',
    'Crewneck',
    'Waist Length',
    'Solid',
    ARRAY['Casual', 'Daily Wear', 'Layering'],
    'a0000001-0000-0000-0000-000000000001',
    34.00,
    true,
    'https://storage.placeholder.stylemirror.internal/thumbnails/top-crewneck.webp'
) ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;

-- Garment 2: Relaxed Linen Camp Collar Shirt (Top)
INSERT INTO garments (
    id, name, slug, category, fit_type, neckline, length, pattern, occasion,
    fabric_id, base_price, is_active, thumbnail_url
) VALUES (
    'b0000001-0000-0000-0000-000000000002',
    'Breeze Linen Camp Shirt',
    'breeze-linen-camp-shirt',
    'top',
    'relaxed',
    'Camp Collar',
    'Hip Length',
    'Subtle Slub',
    ARRAY['Summer Casual', 'Resort', 'Weekend'],
    'a0000001-0000-0000-0000-000000000002',
    68.00,
    true,
    'https://storage.placeholder.stylemirror.internal/thumbnails/top-linen-camp.webp'
) ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;

-- Garment 3: Structured Knit Sweater (Top)
INSERT INTO garments (
    id, name, slug, category, fit_type, neckline, length, pattern, occasion,
    fabric_id, base_price, is_active, thumbnail_url
) VALUES (
    'b0000001-0000-0000-0000-000000000003',
    'Merino Thermal Knit Sweater',
    'merino-thermal-knit-sweater',
    'top',
    'regular',
    'Ribbed Crew',
    'Hip Length',
    'Fine Knit',
    ARRAY['Workwear', 'Smart Casual', 'Evening'],
    'a0000001-0000-0000-0000-000000000004',
    110.00,
    true,
    'https://storage.placeholder.stylemirror.internal/thumbnails/top-merino-knit.webp'
) ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;

-- Garment 4: Straight-Leg Selvedge Denim (Bottom)
INSERT INTO garments (
    id, name, slug, category, fit_type, neckline, length, pattern, occasion,
    fabric_id, base_price, is_active, thumbnail_url
) VALUES (
    'b0000001-0000-0000-0000-000000000004',
    'Heritage Straight Denim',
    'heritage-straight-denim',
    'bottom',
    'regular',
    NULL,
    'Full Length',
    'Solid Indigo',
    ARRAY['Casual', 'Weekend', 'Everyday'],
    'a0000001-0000-0000-0000-000000000005',
    89.00,
    true,
    'https://storage.placeholder.stylemirror.internal/thumbnails/bottom-selvedge-denim.webp'
) ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;

-- Garment 5: Relaxed Pleated Trousers (Bottom)
INSERT INTO garments (
    id, name, slug, category, fit_type, neckline, length, pattern, occasion,
    fabric_id, base_price, is_active, thumbnail_url
) VALUES (
    'b0000001-0000-0000-0000-000000000005',
    'Atelier Pleated Trousers',
    'atelier-pleated-trousers',
    'bottom',
    'relaxed',
    NULL,
    'Ankle Length',
    'Solid Matte',
    ARRAY['Smart Casual', 'Formal', 'Workplace'],
    'a0000001-0000-0000-0000-000000000008',
    95.00,
    true,
    'https://storage.placeholder.stylemirror.internal/thumbnails/bottom-pleated-trouser.webp'
) ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;

-- Garment 6: Structured 6-Panel Cap (Cap)
INSERT INTO garments (
    id, name, slug, category, fit_type, neckline, length, pattern, occasion,
    fabric_id, base_price, is_active, thumbnail_url
) VALUES (
    'b0000001-0000-0000-0000-000000000006',
    'Metro Structured 6-Panel Cap',
    'metro-structured-6panel-cap',
    'cap',
    'regular',
    NULL,
    'Adjustable Strap',
    'Solid Monochrome',
    ARRAY['Streetwear', 'Athleisure', 'Outdoor'],
    'a0000001-0000-0000-0000-000000000001',
    28.00,
    true,
    'https://storage.placeholder.stylemirror.internal/thumbnails/cap-6panel.webp'
) ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;


-- ============================================================================
-- 4. SEED GARMENT COLORS
-- ============================================================================
INSERT INTO garment_colors (garment_id, name, hex, is_default) VALUES
-- Essential Minimalist Tee
('b0000001-0000-0000-0000-000000000001', 'Optic White', '#FFFFFF', true),
('b0000001-0000-0000-0000-000000000001', 'Obsidian Black', '#1A1A1A', false),
('b0000001-0000-0000-0000-000000000001', 'Sage Green', '#8F9779', false),

-- Breeze Linen Camp Shirt
('b0000001-0000-0000-0000-000000000002', 'Sand Beige', '#E3DAC9', true),
('b0000001-0000-0000-0000-000000000002', 'Aegean Blue', '#4E6E82', false),

-- Merino Thermal Knit Sweater
('b0000001-0000-0000-0000-000000000003', 'Charcoal Heather', '#333333', true),
('b0000001-0000-0000-0000-000000000003', 'Deep Navy', '#1B263B', false),
('b0000001-0000-0000-0000-000000000003', 'Oatmeal', '#D8CBB5', false),

-- Heritage Straight Denim
('b0000001-0000-0000-0000-000000000004', 'Raw Indigo', '#243447', true),
('b0000001-0000-0000-0000-000000000004', 'Washed Mid-Blue', '#5B7C99', false),

-- Atelier Pleated Trousers
('b0000001-0000-0000-0000-000000000005', 'Espresso Brown', '#2B1E16', true),
('b0000001-0000-0000-0000-000000000005', 'Slate Grey', '#4A5568', false),

-- Metro Structured 6-Panel Cap
('b0000001-0000-0000-0000-000000000006', 'Jet Black', '#0F0F0F', true),
('b0000001-0000-0000-0000-000000000006', 'Forest Olive', '#3D4A3E', false)
ON CONFLICT DO NOTHING;


-- ============================================================================
-- 5. SEED GARMENT SIZES & PLACEHOLDER GLB ASSETS
-- Note: glb_url links to placeholder 3D asset locations marked as [MOCK PLACEHOLDER]
-- ============================================================================
INSERT INTO garment_sizes (
    garment_id, size_label, glb_url, chest_cm, waist_cm, hip_cm, shoulder_cm, length_cm, inseam_cm
) VALUES
-- Essential Minimalist Tee (S, M, L)
('b0000001-0000-0000-0000-000000000001', 'S', 'https://mock-storage.stylemirror.internal/models/tee_s.glb#mock_placeholder', 90.0, 78.0, 92.0, 43.0, 68.0, NULL),
('b0000001-0000-0000-0000-000000000001', 'M', 'https://mock-storage.stylemirror.internal/models/tee_m.glb#mock_placeholder', 98.0, 86.0, 100.0, 45.0, 70.0, NULL),
('b0000001-0000-0000-0000-000000000001', 'L', 'https://mock-storage.stylemirror.internal/models/tee_l.glb#mock_placeholder', 106.0, 94.0, 108.0, 47.0, 72.0, NULL),

-- Breeze Linen Camp Shirt (S, M, L, XL)
('b0000001-0000-0000-0000-000000000002', 'S', 'https://mock-storage.stylemirror.internal/models/linen_shirt_s.glb#mock_placeholder', 94.0, 84.0, 96.0, 44.0, 70.0, NULL),
('b0000001-0000-0000-0000-000000000002', 'M', 'https://mock-storage.stylemirror.internal/models/linen_shirt_m.glb#mock_placeholder', 102.0, 92.0, 104.0, 46.0, 72.0, NULL),
('b0000001-0000-0000-0000-000000000002', 'L', 'https://mock-storage.stylemirror.internal/models/linen_shirt_l.glb#mock_placeholder', 110.0, 100.0, 112.0, 48.0, 74.0, NULL),
('b0000001-0000-0000-0000-000000000002', 'XL', 'https://mock-storage.stylemirror.internal/models/linen_shirt_xl.glb#mock_placeholder', 118.0, 108.0, 120.0, 50.0, 76.0, NULL),

-- Merino Thermal Knit Sweater (M, L)
('b0000001-0000-0000-0000-000000000003', 'M', 'https://mock-storage.stylemirror.internal/models/sweater_m.glb#mock_placeholder', 100.0, 88.0, 102.0, 46.0, 69.0, NULL),
('b0000001-0000-0000-0000-000000000003', 'L', 'https://mock-storage.stylemirror.internal/models/sweater_l.glb#mock_placeholder', 108.0, 96.0, 110.0, 48.0, 71.0, NULL),

-- Heritage Straight Denim (S, M, L)
('b0000001-0000-0000-0000-000000000004', 'S', 'https://mock-storage.stylemirror.internal/models/denim_s.glb#mock_placeholder', NULL, 76.0, 96.0, NULL, 102.0, 76.0),
('b0000001-0000-0000-0000-000000000004', 'M', 'https://mock-storage.stylemirror.internal/models/denim_m.glb#mock_placeholder', NULL, 84.0, 104.0, NULL, 104.0, 78.0),
('b0000001-0000-0000-0000-000000000004', 'L', 'https://mock-storage.stylemirror.internal/models/denim_l.glb#mock_placeholder', NULL, 92.0, 112.0, NULL, 106.0, 80.0),

-- Atelier Pleated Trousers (M, L)
('b0000001-0000-0000-0000-000000000005', 'M', 'https://mock-storage.stylemirror.internal/models/trousers_m.glb#mock_placeholder', NULL, 82.0, 102.0, NULL, 98.0, 72.0),
('b0000001-0000-0000-0000-000000000005', 'L', 'https://mock-storage.stylemirror.internal/models/trousers_l.glb#mock_placeholder', NULL, 90.0, 110.0, NULL, 100.0, 74.0),

-- Metro Structured 6-Panel Cap (M = One Size)
('b0000001-0000-0000-0000-000000000006', 'M', 'https://mock-storage.stylemirror.internal/models/cap_m.glb#mock_placeholder', NULL, NULL, NULL, NULL, 12.0, NULL)
ON CONFLICT (garment_id, size_label) DO UPDATE SET
    glb_url = EXCLUDED.glb_url,
    chest_cm = EXCLUDED.chest_cm,
    waist_cm = EXCLUDED.waist_cm,
    hip_cm = EXCLUDED.hip_cm,
    shoulder_cm = EXCLUDED.shoulder_cm,
    length_cm = EXCLUDED.length_cm,
    inseam_cm = EXCLUDED.inseam_cm;
