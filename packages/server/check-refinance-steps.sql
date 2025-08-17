-- Check what refinance mortgage steps exist in the database
SELECT 
    screen_location,
    COUNT(*) as item_count,
    STRING_AGG(DISTINCT component_type, ', ') as component_types,
    STRING_AGG(DISTINCT category, ', ') as categories
FROM content_items 
WHERE screen_location LIKE 'refinance%'
   OR content_key LIKE 'refinance%'
GROUP BY screen_location
ORDER BY screen_location;

-- Check if there are step items with wrong naming
SELECT 
    id,
    content_key,
    screen_location,
    category,
    component_type,
    is_active
FROM content_items
WHERE 
    (screen_location LIKE '%refinance%' OR 
     content_key LIKE '%refinance%' OR
     category LIKE '%refinance%')
ORDER BY screen_location, content_key
LIMIT 50;

-- Check for specific expected steps
SELECT 
    'refinance_mortgage_2' as expected_step,
    EXISTS(SELECT 1 FROM content_items WHERE screen_location = 'refinance_mortgage_2') as exists_in_db
UNION ALL
SELECT 
    'refinance_mortgage_3' as expected_step,
    EXISTS(SELECT 1 FROM content_items WHERE screen_location = 'refinance_mortgage_3') as exists_in_db
UNION ALL
SELECT 
    'refinance_mortgage_4' as expected_step,
    EXISTS(SELECT 1 FROM content_items WHERE screen_location = 'refinance_mortgage_4') as exists_in_db;

-- If steps 2-4 don't exist but should, here's how to create them
-- UNCOMMENT AND RUN ONLY IF NEEDED:
/*
-- Create refinance_mortgage_2 (Personal Information)
INSERT INTO content_items (content_key, component_type, category, screen_location, is_active, created_at, updated_at)
VALUES ('refinance_mortgage_2', 'step', 'mortgage_refi_steps', 'refinance_mortgage_2', true, NOW(), NOW());

-- Create refinance_mortgage_3 (Income and Employment)
INSERT INTO content_items (content_key, component_type, category, screen_location, is_active, created_at, updated_at)
VALUES ('refinance_mortgage_3', 'step', 'mortgage_refi_steps', 'refinance_mortgage_3', true, NOW(), NOW());

-- Create refinance_mortgage_4 (Results and Selection)
INSERT INTO content_items (content_key, component_type, category, screen_location, is_active, created_at, updated_at)
VALUES ('refinance_mortgage_4', 'step', 'mortgage_refi_steps', 'refinance_mortgage_4', true, NOW(), NOW());

-- Add translations for the new steps
-- For step 2
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'ru', 'Личная информация', 'approved' FROM content_items WHERE content_key = 'refinance_mortgage_2'
UNION ALL
SELECT id, 'he', 'מידע אישי', 'approved' FROM content_items WHERE content_key = 'refinance_mortgage_2'
UNION ALL
SELECT id, 'en', 'Personal information', 'approved' FROM content_items WHERE content_key = 'refinance_mortgage_2';

-- For step 3
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'ru', 'Доходы и занятость', 'approved' FROM content_items WHERE content_key = 'refinance_mortgage_3'
UNION ALL
SELECT id, 'he', 'הכנסה ותעסוקה', 'approved' FROM content_items WHERE content_key = 'refinance_mortgage_3'
UNION ALL
SELECT id, 'en', 'Income & employment', 'approved' FROM content_items WHERE content_key = 'refinance_mortgage_3';

-- For step 4
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'ru', 'Результаты и выбор', 'approved' FROM content_items WHERE content_key = 'refinance_mortgage_4'
UNION ALL
SELECT id, 'he', 'תוצאות ובחירה', 'approved' FROM content_items WHERE content_key = 'refinance_mortgage_4'
UNION ALL
SELECT id, 'en', 'Results & selection', 'approved' FROM content_items WHERE content_key = 'refinance_mortgage_4';
*/