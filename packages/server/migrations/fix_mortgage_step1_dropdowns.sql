-- Fix Mortgage Step 1 Dropdown Component Types
-- This script fixes the mortgage step1 dropdown fields that are incorrectly marked as "text"
-- instead of "dropdown" and their options marked as "text" instead of "option"

-- 1. Fix main dropdown fields (change from "text" to "dropdown")
UPDATE content_items 
SET component_type = 'dropdown' 
WHERE content_key IN (
    'calculate_mortgage_debt_types',
    'calculate_mortgage_family_status', 
    'calculate_mortgage_main_source',
    'calculate_mortgage_when',
    'calculate_mortgage_first',
    'calculate_mortgage_has_additional'
);

-- 2. Fix dropdown options (change from "text" to "option")
UPDATE content_items 
SET component_type = 'option' 
WHERE content_key IN (
    -- First property options
    'calculate_mortgage_first_options_1',
    'calculate_mortgage_first_options_2',
    'calculate_mortgage_first_options_3',
    
    -- When options
    'calculate_mortgage_when_options_1',
    'calculate_mortgage_when_options_2', 
    'calculate_mortgage_when_options_3',
    'calculate_mortgage_when_options_4',
    'calculate_mortgage_when_options_Time'
);

-- 3. Verify the changes
SELECT 
    content_key,
    component_type,
    CASE 
        WHEN component_type = 'dropdown' THEN '✅ Main dropdown field'
        WHEN component_type = 'option' THEN '✅ Dropdown option'
        WHEN component_type = 'text' THEN '❌ Should be dropdown/option'
        ELSE '❓ Unknown type'
    END as status
FROM content_items 
WHERE content_key IN (
    -- Main dropdown fields
    'calculate_mortgage_debt_types',
    'calculate_mortgage_family_status', 
    'calculate_mortgage_main_source',
    'calculate_mortgage_when',
    'calculate_mortgage_first',
    'calculate_mortgage_has_additional',
    
    -- Dropdown options
    'calculate_mortgage_first_options_1',
    'calculate_mortgage_first_options_2',
    'calculate_mortgage_first_options_3',
    'calculate_mortgage_when_options_1',
    'calculate_mortgage_when_options_2', 
    'calculate_mortgage_when_options_3',
    'calculate_mortgage_when_options_4',
    'calculate_mortgage_when_options_Time'
)
ORDER BY content_key; 