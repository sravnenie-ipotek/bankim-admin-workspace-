-- Remove Credit Data Migration
-- This script removes all credit-related content from the database
-- Date: 2025-01-27

-- First, let's create a backup of credit data before deletion
CREATE TABLE IF NOT EXISTS credit_data_backup_20250127 AS
SELECT 
    ci.*,
    ct_ru.content_value AS content_ru,
    ct_he.content_value AS content_he,
    ct_en.content_value AS content_en
FROM content_items ci
LEFT JOIN content_translations ct_ru ON ci.id = ct_ru.content_item_id AND ct_ru.language_code = 'ru'
LEFT JOIN content_translations ct_he ON ci.id = ct_he.content_item_id AND ct_he.language_code = 'he'  
LEFT JOIN content_translations ct_en ON ci.id = ct_en.content_item_id AND ct_en.language_code = 'en'
WHERE ci.screen_location IN (
    -- Credit calculation screens
    'calculate_credit_1',
    'calculate_credit_2', 
    'calculate_credit_3_header',
    'calculate_credit_3_personal_info',
    'calculate_credit_4_header',
    'calculate_credit_4_employment',
    'calculate_credit_4_income',
    -- Credit refinancing screens
    'refinance_credit_1',
    'refinance_credit_2',
    'refinance_credit_3', 
    'refinance_credit_4'
);

-- Show backup count
SELECT COUNT(*) as backup_count FROM credit_data_backup_20250127;

-- Step 1: Delete content translations for credit-related items
DELETE FROM content_translations 
WHERE content_item_id IN (
    SELECT id FROM content_items 
    WHERE screen_location IN (
        -- Credit calculation screens
        'calculate_credit_1',
        'calculate_credit_2',
        'calculate_credit_3_header', 
        'calculate_credit_3_personal_info',
        'calculate_credit_4_header',
        'calculate_credit_4_employment',
        'calculate_credit_4_income',
        -- Credit refinancing screens
        'refinance_credit_1',
        'refinance_credit_2',
        'refinance_credit_3',
        'refinance_credit_4'
    )
);

-- Step 2: Delete content items for credit-related screens
DELETE FROM content_items 
WHERE screen_location IN (
    -- Credit calculation screens
    'calculate_credit_1',
    'calculate_credit_2',
    'calculate_credit_3_header',
    'calculate_credit_3_personal_info', 
    'calculate_credit_4_header',
    'calculate_credit_4_employment',
    'calculate_credit_4_income',
    -- Credit refinancing screens
    'refinance_credit_1',
    'refinance_credit_2',
    'refinance_credit_3',
    'refinance_credit_4'
);

-- Step 3: Also remove any credit-related content keys that might exist
DELETE FROM content_translations 
WHERE content_item_id IN (
    SELECT id FROM content_items 
    WHERE content_key LIKE '%credit%' 
    OR content_key LIKE '%кредит%'
    OR content_key LIKE '%אשראי%'
);

DELETE FROM content_items 
WHERE content_key LIKE '%credit%' 
OR content_key LIKE '%кредит%'
OR content_key LIKE '%אשראי%';

-- Verification queries - these should return 0 
SELECT COUNT(*) as remaining_credit_items FROM content_items 
WHERE screen_location IN (
    'calculate_credit_1', 'calculate_credit_2', 'calculate_credit_3_header',
    'calculate_credit_3_personal_info', 'calculate_credit_4_header', 
    'calculate_credit_4_employment', 'calculate_credit_4_income',
    'refinance_credit_1', 'refinance_credit_2', 'refinance_credit_3', 'refinance_credit_4'
);

SELECT COUNT(*) as remaining_credit_translations FROM content_translations ct
JOIN content_items ci ON ct.content_item_id = ci.id
WHERE ci.screen_location IN (
    'calculate_credit_1', 'calculate_credit_2', 'calculate_credit_3_header',
    'calculate_credit_3_personal_info', 'calculate_credit_4_header',
    'calculate_credit_4_employment', 'calculate_credit_4_income', 
    'refinance_credit_1', 'refinance_credit_2', 'refinance_credit_3', 'refinance_credit_4'
);

-- Show total items deleted
SELECT 
    (SELECT COUNT(*) FROM credit_data_backup_20250127) as items_backed_up,
    'Credit data successfully removed from database' as status;

COMMIT;