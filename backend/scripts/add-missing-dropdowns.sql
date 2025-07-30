-- Add missing dropdown containers for mortgage_step1
-- Based on the frontend application requirements

-- First, let's check what exists
SELECT content_key, component_type, screen_location 
FROM content_items 
WHERE screen_location = 'mortgage_step1' 
  AND component_type = 'dropdown';

-- Add the missing dropdown containers
-- These content keys match what the frontend application expects
INSERT INTO content_items (content_key, component_type, screen_location, category, is_active)
VALUES 
  -- City Selection dropdown container
  ('mortgage_step1.field.city', 'dropdown', 'mortgage_step1', 'form', true),
  
  -- When Do You Need Money dropdown container
  ('mortgage_step1.field.when_needed', 'dropdown', 'mortgage_step1', 'form', true),
  
  -- Property Type dropdown container (might already exist as calculate_mortgage_type)
  ('mortgage_step1.field.type', 'dropdown', 'mortgage_step1', 'form', true),
  
  -- First Home Status dropdown container
  ('mortgage_step1.field.first_home', 'dropdown', 'mortgage_step1', 'form', true),
  
  -- Property Ownership Status dropdown container
  ('mortgage_step1.field.property_ownership', 'dropdown', 'mortgage_step1', 'form', true)
ON CONFLICT (content_key) DO NOTHING;

-- Add translations for each dropdown container
-- You'll need to get the IDs after insertion and add translations

-- Get the IDs of the newly inserted dropdowns
SELECT id, content_key 
FROM content_items 
WHERE content_key IN (
  'mortgage_step1.field.city',
  'mortgage_step1.field.when_needed',
  'mortgage_step1.field.type',
  'mortgage_step1.field.first_home',
  'mortgage_step1.field.property_ownership'
);

-- Example: Add translations (replace {id} with actual IDs from above query)
-- INSERT INTO content_translations (content_item_id, language_code, content_value, status)
-- VALUES 
--   ({city_id}, 'en', 'City', 'approved'),
--   ({city_id}, 'he', 'עיר', 'approved'),
--   ({city_id}, 'ru', 'Город', 'approved'),
--   
--   ({when_needed_id}, 'en', 'When do you need the mortgage?', 'approved'),
--   ({when_needed_id}, 'he', 'מתי תזדקק למשכנתא?', 'approved'),
--   ({when_needed_id}, 'ru', 'Когда вам нужна ипотека?', 'approved'),
--   
--   ({type_id}, 'en', 'Mortgage type', 'approved'),
--   ({type_id}, 'he', 'סוג משכנתא', 'approved'),
--   ({type_id}, 'ru', 'Тип ипотеки', 'approved'),
--   
--   ({first_home_id}, 'en', 'Is this your first home?', 'approved'),
--   ({first_home_id}, 'he', 'האם זו דירתך הראשונה?', 'approved'),
--   ({first_home_id}, 'ru', 'Это ваша первая квартира?', 'approved'),
--   
--   ({property_ownership_id}, 'en', 'Property ownership status', 'approved'),
--   ({property_ownership_id}, 'he', 'סטטוס בעלות על נכס', 'approved'),
--   ({property_ownership_id}, 'ru', 'Статус владения недвижимостью', 'approved');

-- Verify all dropdowns are now present
SELECT 
  ci.content_key,
  ci.component_type,
  ct_en.content_value as title_en,
  ct_he.content_value as title_he,
  ct_ru.content_value as title_ru
FROM content_items ci
LEFT JOIN content_translations ct_en ON ci.id = ct_en.content_item_id AND ct_en.language_code = 'en' AND ct_en.status = 'approved'
LEFT JOIN content_translations ct_he ON ci.id = ct_he.content_item_id AND ct_he.language_code = 'he' AND ct_he.status = 'approved'
LEFT JOIN content_translations ct_ru ON ci.id = ct_ru.content_item_id AND ct_ru.language_code = 'ru' AND ct_ru.status = 'approved'
WHERE ci.screen_location = 'mortgage_step1' 
  AND ci.component_type = 'dropdown'
ORDER BY ci.content_key;