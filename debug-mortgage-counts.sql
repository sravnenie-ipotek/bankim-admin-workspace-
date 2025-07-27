-- Check mortgage step2 counts
-- This query shows what the list view counts
SELECT 
  'List View Count' as query_type,
  COUNT(*) as count
FROM content_items 
WHERE screen_location = 'mortgage_step2' 
  AND is_active = TRUE;

-- This query shows what the drill view returns
SELECT 
  'Drill View Count' as query_type,
  COUNT(*) as count
FROM content_items ci
LEFT JOIN content_translations ct_ru ON ci.id = ct_ru.content_item_id 
  AND ct_ru.language_code = 'ru' 
  AND (ct_ru.status = 'approved' OR ct_ru.status IS NULL)
LEFT JOIN content_translations ct_he ON ci.id = ct_he.content_item_id 
  AND ct_he.language_code = 'he' 
  AND (ct_he.status = 'approved' OR ct_he.status IS NULL)
LEFT JOIN content_translations ct_en ON ci.id = ct_en.content_item_id 
  AND ct_en.language_code = 'en' 
  AND (ct_en.status = 'approved' OR ct_en.status IS NULL)
WHERE ci.screen_location = 'mortgage_step2'
  AND ci.is_active = true;

-- Check if there are any differences in the data
SELECT 
  ci.id,
  ci.content_key,
  ci.component_type,
  ci.is_active,
  ct_ru.status as ru_status,
  ct_he.status as he_status,
  ct_en.status as en_status
FROM content_items ci
LEFT JOIN content_translations ct_ru ON ci.id = ct_ru.content_item_id 
  AND ct_ru.language_code = 'ru'
LEFT JOIN content_translations ct_he ON ci.id = ct_he.content_item_id 
  AND ct_he.language_code = 'he'
LEFT JOIN content_translations ct_en ON ci.id = ct_en.content_item_id 
  AND ct_en.language_code = 'en'
WHERE ci.screen_location = 'mortgage_step2'
  AND ci.is_active = true
ORDER BY ci.content_key;