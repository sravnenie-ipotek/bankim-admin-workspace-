-- ============================================================================
-- Navigation Mapping Fix for Screen #6 - Mortgage Section
-- ============================================================================
-- 
-- Issue: Screen #6 "Анкета партнера. Доходы" was incorrectly mapped to 
--        mortgage_step4 (results page) instead of borrowers personal data page
-- 
-- Solution: Update mapping to point to borrowers_personal_data_step1
--           This represents the page where users enter personal details like 
--           name, birthday, education, citizenship after mortgage calculator 
--           and phone verification
-- 
-- Date: 2025-01-18
-- ============================================================================

-- Step 1: Check current state before fix
SELECT 
    'BEFORE FIX - Current mapping for screen 6:' as status,
    confluence_num,
    confluence_title_ru,
    screen_location,
    parent_section,
    sort_order,
    is_active,
    updated_at
FROM navigation_mapping 
WHERE confluence_num = '6';

-- Step 2: Apply the fix - Update screen 6 mapping
UPDATE navigation_mapping 
SET 
    screen_location = 'borrowers_personal_data_step1',
    updated_at = CURRENT_TIMESTAMP
WHERE confluence_num = '6';

-- Step 3: Verify the fix was applied
SELECT 
    'AFTER FIX - Updated mapping for screen 6:' as status,
    confluence_num,
    confluence_title_ru,
    screen_location,
    parent_section,
    sort_order,
    is_active,
    updated_at
FROM navigation_mapping 
WHERE confluence_num = '6';

-- Step 4: Show the corrected navigation sequence
SELECT 
    'CORRECTED NAVIGATION SEQUENCE:' as status,
    confluence_num,
    confluence_title_ru,
    screen_location,
    sort_order
FROM navigation_mapping 
WHERE parent_section = '3.1'
AND confluence_num::int BETWEEN 2 AND 8
ORDER BY sort_order;

-- Step 5: Check if content exists for the new screen location
SELECT 
    'CONTENT CHECK - borrowers_personal_data_step1:' as status,
    COUNT(*) as content_items_count,
    CASE 
        WHEN COUNT(*) = 0 THEN 'NEEDS CONTENT CREATION'
        ELSE 'CONTENT EXISTS'
    END as content_status
FROM content_items 
WHERE screen_location = 'borrowers_personal_data_step1'
AND is_active = true;

-- Step 6: Show sample content structure needed (if no content exists)
-- This query shows the type of personal data content that should be created
-- for borrowers_personal_data_step1 based on mortgage_step2 structure
SELECT 
    'RECOMMENDED CONTENT STRUCTURE (based on mortgage_step2):' as status,
    content_key,
    component_type,
    category
FROM content_items 
WHERE screen_location = 'mortgage_step2'
AND (
    content_key ILIKE '%name%' OR
    content_key ILIKE '%birth%' OR
    content_key ILIKE '%citizenship%' OR
    content_key ILIKE '%education%' OR
    content_key ILIKE '%gender%' OR
    content_key ILIKE '%personal%'
)
AND is_active = true
ORDER BY content_key
LIMIT 10;

-- ============================================================================
-- ROLLBACK SCRIPT (if needed)
-- ============================================================================
-- Uncomment the following lines to rollback this change:
-- 
-- UPDATE navigation_mapping 
-- SET 
--     screen_location = 'mortgage_step4',
--     updated_at = CURRENT_TIMESTAMP
-- WHERE confluence_num = '6';
-- 
-- ============================================================================

-- Step 7: Final verification query
SELECT 
    'VERIFICATION - Final state:' as status,
    confluence_num || '. ' || confluence_title_ru || ' -> ' || screen_location as mapping
FROM navigation_mapping 
WHERE confluence_num = '6';