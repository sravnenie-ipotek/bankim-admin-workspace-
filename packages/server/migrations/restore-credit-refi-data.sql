-- Restore Credit Refinancing Data Migration
-- This script restores credit refinancing data from backup
-- Date: 2025-01-27

-- Check if backup exists
SELECT COUNT(*) as backup_available FROM credit_data_backup_20250127 
WHERE screen_location IN ('refinance_credit_1', 'refinance_credit_2', 'refinance_credit_3', 'refinance_credit_4');

-- Step 1: Restore content items for credit refinancing
INSERT INTO content_items (
    id, content_key, component_type, category, screen_location, 
    description, is_active, created_at, updated_at
)
SELECT 
    id, content_key, component_type, category, screen_location,
    description, is_active, created_at, updated_at
FROM credit_data_backup_20250127 
WHERE screen_location IN ('refinance_credit_1', 'refinance_credit_2', 'refinance_credit_3', 'refinance_credit_4')
ON CONFLICT (id) DO NOTHING;

-- Step 2: Restore content translations for credit refinancing
INSERT INTO content_translations (content_item_id, language_code, content_value, created_at, updated_at)
SELECT 
    id as content_item_id, 
    'ru' as language_code, 
    content_ru as content_value,
    COALESCE(created_at, NOW()) as created_at,
    COALESCE(updated_at, NOW()) as updated_at
FROM credit_data_backup_20250127 
WHERE screen_location IN ('refinance_credit_1', 'refinance_credit_2', 'refinance_credit_3', 'refinance_credit_4')
AND content_ru IS NOT NULL
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, content_value, created_at, updated_at)
SELECT 
    id as content_item_id, 
    'he' as language_code, 
    content_he as content_value,
    COALESCE(created_at, NOW()) as created_at,
    COALESCE(updated_at, NOW()) as updated_at
FROM credit_data_backup_20250127 
WHERE screen_location IN ('refinance_credit_1', 'refinance_credit_2', 'refinance_credit_3', 'refinance_credit_4')
AND content_he IS NOT NULL
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, content_value, created_at, updated_at)
SELECT 
    id as content_item_id, 
    'en' as language_code, 
    content_en as content_value,
    COALESCE(created_at, NOW()) as created_at,
    COALESCE(updated_at, NOW()) as updated_at
FROM credit_data_backup_20250127 
WHERE screen_location IN ('refinance_credit_1', 'refinance_credit_2', 'refinance_credit_3', 'refinance_credit_4')
AND content_en IS NOT NULL
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- Verification queries
SELECT COUNT(*) as restored_credit_refi_items FROM content_items 
WHERE screen_location IN ('refinance_credit_1', 'refinance_credit_2', 'refinance_credit_3', 'refinance_credit_4');

SELECT COUNT(*) as restored_credit_refi_translations FROM content_translations ct
JOIN content_items ci ON ct.content_item_id = ci.id
WHERE ci.screen_location IN ('refinance_credit_1', 'refinance_credit_2', 'refinance_credit_3', 'refinance_credit_4');

-- Show summary
SELECT 
    'Credit Refinancing data successfully restored' as status,
    (SELECT COUNT(*) FROM content_items WHERE screen_location IN ('refinance_credit_1', 'refinance_credit_2', 'refinance_credit_3', 'refinance_credit_4')) as items_restored,
    (SELECT COUNT(*) FROM content_translations ct JOIN content_items ci ON ct.content_item_id = ci.id WHERE ci.screen_location IN ('refinance_credit_1', 'refinance_credit_2', 'refinance_credit_3', 'refinance_credit_4')) as translations_restored;

COMMIT;