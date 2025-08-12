-- Deploy Hebrew translations for mortgage obligations to production
-- Database: bankim_content (local PostgreSQL on production server)
-- Run with: psql -U postgres -d bankim_content -f deploy-hebrew-obligations.sql

\echo 'Starting Hebrew obligations deployment to production...'

-- 1. Create missing content items for Hebrew obligations
\echo '1. Creating content items...'
INSERT INTO content_items 
(content_key, component_type, category, screen_location, is_active, description, page_number)
VALUES
  ('app.mortgage.step3.obligations.option_1', 'dropdown_option', 'form', 'mortgage_step3', true, 'No obligations option', 1),
  ('app.mortgage.step3.obligations.option_2', 'dropdown_option', 'form', 'mortgage_step3', true, 'Bank loan option', 2),
  ('app.mortgage.step3.obligations.option_3', 'dropdown_option', 'form', 'mortgage_step3', true, 'Credit card option', 3),
  ('app.mortgage.step3.obligations.option_4', 'dropdown_option', 'form', 'mortgage_step3', true, 'Private loan option', 4)
ON CONFLICT (content_key) DO NOTHING;

-- 2. Insert Hebrew translations
\echo '2. Inserting Hebrew translations...'
INSERT INTO content_translations (content_item_id, language_code, content_value, status) VALUES
  ((SELECT id FROM content_items WHERE content_key = 'app.mortgage.step3.obligations.option_1'), 'he', 'אין התחייבויות', 'approved'),
  ((SELECT id FROM content_items WHERE content_key = 'app.mortgage.step3.obligations.option_2'), 'he', 'הלוואת בנק', 'approved'),
  ((SELECT id FROM content_items WHERE content_key = 'app.mortgage.step3.obligations.option_3'), 'he', 'כרטיס אשראי', 'approved'),
  ((SELECT id FROM content_items WHERE content_key = 'app.mortgage.step3.obligations.option_4'), 'he', 'הלוואה פרטית', 'approved')
ON CONFLICT (content_item_id, language_code) 
DO UPDATE SET 
  content_value = EXCLUDED.content_value,
  status = EXCLUDED.status,
  updated_at = CURRENT_TIMESTAMP;

-- 3. Verify deployment
\echo '3. Verifying Hebrew translations...'
SELECT 
  ci.content_key as "Content Key",
  ct.content_value as "Hebrew Translation",
  ct.status as "Status"
FROM content_items ci
JOIN content_translations ct ON ci.id = ct.content_item_id
WHERE ci.content_key IN (
  'app.mortgage.step3.obligations.option_1',
  'app.mortgage.step3.obligations.option_2', 
  'app.mortgage.step3.obligations.option_3',
  'app.mortgage.step3.obligations.option_4'
) AND ct.language_code = 'he'
ORDER BY ci.content_key;

\echo 'Hebrew obligations deployment completed!'
\echo 'Translations should now appear on bankimonline.com'