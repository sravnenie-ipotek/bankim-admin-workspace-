-- Update Hebrew translations for mortgage-refi titles
-- Based on the required Hebrew names from the UI

-- Step 1: Update mortgage_step4 to "מחשבון" (Calculator)
UPDATE content_translations 
SET content_value = 'מחשבון'
WHERE content_item_id IN (
  SELECT id FROM content_items 
  WHERE screen_location = 'mortgage_step4' 
  AND content_key LIKE '%title%'
) 
AND language_code = 'he';

-- Step 2: Update refinance_credit_1 to "פרטים אישיים" (Personal Details)
UPDATE content_translations 
SET content_value = 'פרטים אישיים'
WHERE content_item_id IN (
  SELECT id FROM content_items 
  WHERE screen_location = 'refinance_credit_1' 
  AND content_key LIKE '%title%'
) 
AND language_code = 'he';

-- Step 3: Update refinance_credit_2 to "הכנסות" (Income)
UPDATE content_translations 
SET content_value = 'הכנסות'
WHERE content_item_id IN (
  SELECT id FROM content_items 
  WHERE screen_location = 'refinance_credit_2' 
  AND content_key LIKE '%title%'
) 
AND language_code = 'he';

-- Step 4: Update refinance_credit_3 to "תוכניות" (Programs)
UPDATE content_translations 
SET content_value = 'תוכניות'
WHERE content_item_id IN (
  SELECT id FROM content_items 
  WHERE screen_location = 'refinance_credit_3' 
  AND content_key LIKE '%title%'
) 
AND language_code = 'he';

-- Verify the updates
SELECT 
  ci.screen_location,
  ci.content_key,
  ct.language_code,
  ct.content_value
FROM content_items ci
JOIN content_translations ct ON ci.id = ct.content_item_id
WHERE ci.screen_location IN (
  'mortgage_step4', 'refinance_credit_1', 'refinance_credit_2', 'refinance_credit_3'
)
AND ct.language_code = 'he'
AND ci.content_key LIKE '%title%'
ORDER BY ci.screen_location; 