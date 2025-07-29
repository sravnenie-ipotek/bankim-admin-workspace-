-- Fix ALL Mortgage Dropdown Component Types
-- This script fixes all mortgage dropdown fields that are incorrectly marked as "text"
-- instead of "dropdown" and their options marked as "text" instead of "option"

-- 1. Fix main dropdown fields (change from "text" to "dropdown")
UPDATE content_items 
SET component_type = 'dropdown' 
WHERE content_key IN (
    -- Step 1 dropdowns
    'calculate_mortgage_debt_types',
    'calculate_mortgage_family_status', 
    'calculate_mortgage_main_source',
    'calculate_mortgage_when',
    'calculate_mortgage_first',
    
    -- Step 2 dropdowns
    'calculate_mortgage_citizenship',
    
    -- Step 3 dropdowns
    'calculate_mortgage_sphere'
);

-- 2. Fix dropdown options (change from "text" to "option")
UPDATE content_items 
SET component_type = 'option' 
WHERE content_key IN (
    -- Step 1 options
    'calculate_mortgage_when_options_1',
    'calculate_mortgage_when_options_2', 
    'calculate_mortgage_when_options_3',
    'calculate_mortgage_when_options_4',
    'calculate_mortgage_when_options_Time',
    'calculate_mortgage_first_options_1',
    'calculate_mortgage_first_options_2',
    'calculate_mortgage_first_options_3',
    
    -- Step 2 options
    'calculate_mortgage_citizenship_option_5',
    'calculate_mortgage_citizenship_option_6',
    'calculate_mortgage_citizenship_option_7',
    'calculate_mortgage_citizenship_option_8',
    'calculate_mortgage_citizenship_option_9',
    
    -- Step 3 options
    'calculate_mortgage_sphere_option_5',
    'calculate_mortgage_sphere_option_6',
    'calculate_mortgage_sphere_option_7',
    'calculate_mortgage_sphere_option_8',
    'calculate_mortgage_sphere_option_9',
    'calculate_mortgage_sphere_option_10'
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
            'calculate_mortgage_first',
            'calculate_mortgage_citizenship',
            'calculate_mortgage_sphere'
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
    'calculate_mortgage_citizenship',
    'calculate_mortgage_sphere',
    'calculate_mortgage_when_options_1',
    'calculate_mortgage_when_options_2', 
    'calculate_mortgage_when_options_3',
    'calculate_mortgage_when_options_4',
    'calculate_mortgage_when_options_Time',
    'calculate_mortgage_first_options_1',
    'calculate_mortgage_first_options_2',
    'calculate_mortgage_first_options_3',
    'calculate_mortgage_citizenship_option_5',
    'calculate_mortgage_citizenship_option_6',
    'calculate_mortgage_citizenship_option_7',
    'calculate_mortgage_citizenship_option_8',
    'calculate_mortgage_citizenship_option_9',
    'calculate_mortgage_sphere_option_5',
    'calculate_mortgage_sphere_option_6',
    'calculate_mortgage_sphere_option_7',
    'calculate_mortgage_sphere_option_8',
    'calculate_mortgage_sphere_option_9',
    'calculate_mortgage_sphere_option_10'
)
ORDER BY content_key; 