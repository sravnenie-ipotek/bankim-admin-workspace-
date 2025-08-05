-- Fix Mortgage Dropdown Component Types
-- This script fixes all mortgage dropdown fields that are incorrectly marked as "text"
-- instead of "dropdown" and their options marked as "text" instead of "option"

-- 1. Fix main dropdown fields (change from "text" to "dropdown")
UPDATE content_items 
SET component_type = 'dropdown' 
WHERE content_key IN (
    'calculate_mortgage_debt_types',
    'calculate_mortgage_family_status', 
    'calculate_mortgage_main_source',
    'calculate_mortgage_when',
    'calculate_mortgage_first'
);

-- 2. Fix dropdown options (change from "text" to "option")
UPDATE content_items 
SET component_type = 'option' 
WHERE content_key IN (
    'calculate_mortgage_when_options_1',
    'calculate_mortgage_when_options_2', 
    'calculate_mortgage_when_options_3',
    'calculate_mortgage_when_options_4',
    'calculate_mortgage_when_options_Time',
    'calculate_mortgage_first_options_1',
    'calculate_mortgage_first_options_2',
    'calculate_mortgage_first_options_3'
);

-- 3. Verify the changes
SELECT 
    content_key,
    component_type,
    CASE 
        WHEN content_key LIKE '%_option%' THEN 'OPTION'
        WHEN content_key IN (
            'calculate_mortgage_debt_types',
            'calculate_mortgage_family_status', 
            'calculate_mortgage_main_source',
            'calculate_mortgage_when',
            'calculate_mortgage_first'
        ) THEN 'MAIN_DROPDOWN'
        ELSE 'OTHER'
    END as expected_type
FROM content_items 
WHERE content_key IN (
    'calculate_mortgage_debt_types',
    'calculate_mortgage_family_status', 
    'calculate_mortgage_main_source',
    'calculate_mortgage_when',
    'calculate_mortgage_first',
    'calculate_mortgage_when_options_1',
    'calculate_mortgage_when_options_2', 
    'calculate_mortgage_when_options_3',
    'calculate_mortgage_when_options_4',
    'calculate_mortgage_when_options_Time',
    'calculate_mortgage_first_options_1',
    'calculate_mortgage_first_options_2',
    'calculate_mortgage_first_options_3'
)
ORDER BY content_key; 