-- Fix missing translations for mortgage_step4
-- This script updates content items that have the same content_key as their translation value

-- Fix mortgage_step4.filter
UPDATE content_translations 
SET content_value = 'Фильтр'
WHERE content_item_id = (
  SELECT id FROM content_items WHERE content_key = 'mortgage_step4.filter'
) AND language_code = 'ru';

UPDATE content_translations 
SET content_value = 'מסנן'
WHERE content_item_id = (
  SELECT id FROM content_items WHERE content_key = 'mortgage_step4.filter'
) AND language_code = 'he';

UPDATE content_translations 
SET content_value = 'Filter'
WHERE content_item_id = (
  SELECT id FROM content_items WHERE content_key = 'mortgage_step4.filter'
) AND language_code = 'en';

-- Fix mortgage_step4_filter
UPDATE content_translations 
SET content_value = 'Фильтр ипотек'
WHERE content_item_id = (
  SELECT id FROM content_items WHERE content_key = 'mortgage_step4_filter'
) AND language_code = 'ru';

UPDATE content_translations 
SET content_value = 'מסנן משכנתאות'
WHERE content_item_id = (
  SELECT id FROM content_items WHERE content_key = 'mortgage_step4_filter'
) AND language_code = 'he';

UPDATE content_translations 
SET content_value = 'Mortgage Filter'
WHERE content_item_id = (
  SELECT id FROM content_items WHERE content_key = 'mortgage_step4_filter'
) AND language_code = 'en';

-- Fix prime_description with more specific content
UPDATE content_translations 
SET content_value = 'Ипотека, привязанная к прайм-ставке Банка Израиля'
WHERE content_item_id = (
  SELECT id FROM content_items WHERE content_key = 'prime_description'
) AND language_code = 'ru';

UPDATE content_translations 
SET content_value = 'משכנתא הצמודה לריבית הפריים של בנק ישראל'
WHERE content_item_id = (
  SELECT id FROM content_items WHERE content_key = 'prime_description'
) AND language_code = 'he';

UPDATE content_translations 
SET content_value = 'Mortgage linked to the prime rate of the Bank of Israel'
WHERE content_item_id = (
  SELECT id FROM content_items WHERE content_key = 'prime_description'
) AND language_code = 'en';

-- Add missing translations for any other items that might be missing
-- Check for any content items that have the same content_key as their translation value
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT 
  ci.id,
  'ru',
  CASE 
    WHEN ci.content_key LIKE '%filter%' THEN 'Фильтр'
    WHEN ci.content_key LIKE '%title%' THEN 'Заголовок'
    WHEN ci.content_key LIKE '%description%' THEN 'Описание'
    WHEN ci.content_key LIKE '%button%' THEN 'Кнопка'
    WHEN ci.content_key LIKE '%label%' THEN 'Метка'
    ELSE ci.content_key
  END,
  'approved'
FROM content_items ci
WHERE ci.screen_location = 'mortgage_step4'
  AND ci.is_active = true
  AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'ru'
  );

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT 
  ci.id,
  'he',
  CASE 
    WHEN ci.content_key LIKE '%filter%' THEN 'מסנן'
    WHEN ci.content_key LIKE '%title%' THEN 'כותרת'
    WHEN ci.content_key LIKE '%description%' THEN 'תיאור'
    WHEN ci.content_key LIKE '%button%' THEN 'כפתור'
    WHEN ci.content_key LIKE '%label%' THEN 'תווית'
    ELSE ci.content_key
  END,
  'approved'
FROM content_items ci
WHERE ci.screen_location = 'mortgage_step4'
  AND ci.is_active = true
  AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'he'
  );

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT 
  ci.id,
  'en',
  CASE 
    WHEN ci.content_key LIKE '%filter%' THEN 'Filter'
    WHEN ci.content_key LIKE '%title%' THEN 'Title'
    WHEN ci.content_key LIKE '%description%' THEN 'Description'
    WHEN ci.content_key LIKE '%button%' THEN 'Button'
    WHEN ci.content_key LIKE '%label%' THEN 'Label'
    ELSE ci.content_key
  END,
  'approved'
FROM content_items ci
WHERE ci.screen_location = 'mortgage_step4'
  AND ci.is_active = true
  AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'en'
  );

-- Verify the fixes
SELECT 
  ci.content_key,
  ct_ru.content_value as ru_translation,
  ct_he.content_value as he_translation,
  ct_en.content_value as en_translation
FROM content_items ci
LEFT JOIN content_translations ct_ru ON ci.id = ct_ru.content_item_id AND ct_ru.language_code = 'ru'
LEFT JOIN content_translations ct_he ON ci.id = ct_he.content_item_id AND ct_he.language_code = 'he'
LEFT JOIN content_translations ct_en ON ci.id = ct_en.content_item_id AND ct_en.language_code = 'en'
WHERE ci.screen_location = 'mortgage_step4'
  AND ci.is_active = true
ORDER BY ci.content_key;
