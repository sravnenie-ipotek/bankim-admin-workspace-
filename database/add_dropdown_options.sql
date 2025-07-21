-- Add dropdown options for main page actions
-- This follows the pattern where component_type = 'option' for dropdown choices

-- ============================================
-- Action 1: Income Source Options
-- ============================================
INSERT INTO content_items (content_key, content_type, category, screen_location, component_type, description) VALUES
('app.main.action.1.option.1.salary', 'text', 'dropdowns', 'main_page', 'option', 'Salary income option'),
('app.main.action.1.option.2.business', 'text', 'dropdowns', 'main_page', 'option', 'Business income option'),
('app.main.action.1.option.3.investments', 'text', 'dropdowns', 'main_page', 'option', 'Investment income option'),
('app.main.action.1.option.4.pension', 'text', 'dropdowns', 'main_page', 'option', 'Pension income option')
ON CONFLICT (content_key) DO NOTHING;

-- Add translations for income source options
WITH item1 AS (SELECT id FROM content_items WHERE content_key = 'app.main.action.1.option.1.salary')
INSERT INTO content_translations (content_item_id, language_code, content_value, status) VALUES
((SELECT id FROM item1), 'ru', 'Зарплата', 'approved'),
((SELECT id FROM item1), 'he', 'משכורת', 'approved'),
((SELECT id FROM item1), 'en', 'Salary', 'approved')
ON CONFLICT (content_item_id, language_code) DO NOTHING;

WITH item2 AS (SELECT id FROM content_items WHERE content_key = 'app.main.action.1.option.2.business')
INSERT INTO content_translations (content_item_id, language_code, content_value, status) VALUES
((SELECT id FROM item2), 'ru', 'Собственный бизнес', 'approved'),
((SELECT id FROM item2), 'he', 'עסק עצמאי', 'approved'),
((SELECT id FROM item2), 'en', 'Own Business', 'approved')
ON CONFLICT (content_item_id, language_code) DO NOTHING;

WITH item3 AS (SELECT id FROM content_items WHERE content_key = 'app.main.action.1.option.3.investments')
INSERT INTO content_translations (content_item_id, language_code, content_value, status) VALUES
((SELECT id FROM item3), 'ru', 'Инвестиции', 'approved'),
((SELECT id FROM item3), 'he', 'השקעות', 'approved'),
((SELECT id FROM item3), 'en', 'Investments', 'approved')
ON CONFLICT (content_item_id, language_code) DO NOTHING;

WITH item4 AS (SELECT id FROM content_items WHERE content_key = 'app.main.action.1.option.4.pension')
INSERT INTO content_translations (content_item_id, language_code, content_value, status) VALUES
((SELECT id FROM item4), 'ru', 'Пенсия', 'approved'),
((SELECT id FROM item4), 'he', 'פנסיה', 'approved'),
((SELECT id FROM item4), 'en', 'Pension', 'approved')
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- ============================================
-- Action 2: Employment Type Options
-- ============================================
INSERT INTO content_items (content_key, content_type, category, screen_location, component_type, description) VALUES
('app.main.action.2.option.1.fulltime', 'text', 'dropdowns', 'main_page', 'option', 'Full-time employment option'),
('app.main.action.2.option.2.parttime', 'text', 'dropdowns', 'main_page', 'option', 'Part-time employment option'),
('app.main.action.2.option.3.freelance', 'text', 'dropdowns', 'main_page', 'option', 'Freelance option'),
('app.main.action.2.option.4.unemployed', 'text', 'dropdowns', 'main_page', 'option', 'Unemployed option')
ON CONFLICT (content_key) DO NOTHING;

-- Add translations for employment type options
WITH item1 AS (SELECT id FROM content_items WHERE content_key = 'app.main.action.2.option.1.fulltime')
INSERT INTO content_translations (content_item_id, language_code, content_value, status) VALUES
((SELECT id FROM item1), 'ru', 'Полная занятость', 'approved'),
((SELECT id FROM item1), 'he', 'משרה מלאה', 'approved'),
((SELECT id FROM item1), 'en', 'Full-time', 'approved')
ON CONFLICT (content_item_id, language_code) DO NOTHING;

WITH item2 AS (SELECT id FROM content_items WHERE content_key = 'app.main.action.2.option.2.parttime')
INSERT INTO content_translations (content_item_id, language_code, content_value, status) VALUES
((SELECT id FROM item2), 'ru', 'Частичная занятость', 'approved'),
((SELECT id FROM item2), 'he', 'משרה חלקית', 'approved'),
((SELECT id FROM item2), 'en', 'Part-time', 'approved')
ON CONFLICT (content_item_id, language_code) DO NOTHING;

WITH item3 AS (SELECT id FROM content_items WHERE content_key = 'app.main.action.2.option.3.freelance')
INSERT INTO content_translations (content_item_id, language_code, content_value, status) VALUES
((SELECT id FROM item3), 'ru', 'Фриланс', 'approved'),
((SELECT id FROM item3), 'he', 'פרילנס', 'approved'),
((SELECT id FROM item3), 'en', 'Freelance', 'approved')
ON CONFLICT (content_item_id, language_code) DO NOTHING;

WITH item4 AS (SELECT id FROM content_items WHERE content_key = 'app.main.action.2.option.4.unemployed')
INSERT INTO content_translations (content_item_id, language_code, content_value, status) VALUES
((SELECT id FROM item4), 'ru', 'Безработный', 'approved'),
((SELECT id FROM item4), 'he', 'לא מועסק', 'approved'),
((SELECT id FROM item4), 'en', 'Unemployed', 'approved')
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- ============================================
-- Action 3: Property Type Options
-- ============================================
INSERT INTO content_items (content_key, content_type, category, screen_location, component_type, description) VALUES
('app.main.action.3.option.1.apartment', 'text', 'dropdowns', 'main_page', 'option', 'Apartment option'),
('app.main.action.3.option.2.house', 'text', 'dropdowns', 'main_page', 'option', 'House option'),
('app.main.action.3.option.3.land', 'text', 'dropdowns', 'main_page', 'option', 'Land option')
ON CONFLICT (content_key) DO NOTHING;

-- Add translations for property type options
WITH item1 AS (SELECT id FROM content_items WHERE content_key = 'app.main.action.3.option.1.apartment')
INSERT INTO content_translations (content_item_id, language_code, content_value, status) VALUES
((SELECT id FROM item1), 'ru', 'Квартира', 'approved'),
((SELECT id FROM item1), 'he', 'דירה', 'approved'),
((SELECT id FROM item1), 'en', 'Apartment', 'approved')
ON CONFLICT (content_item_id, language_code) DO NOTHING;

WITH item2 AS (SELECT id FROM content_items WHERE content_key = 'app.main.action.3.option.2.house')
INSERT INTO content_translations (content_item_id, language_code, content_value, status) VALUES
((SELECT id FROM item2), 'ru', 'Дом', 'approved'),
((SELECT id FROM item2), 'he', 'בית', 'approved'),
((SELECT id FROM item2), 'en', 'House', 'approved')
ON CONFLICT (content_item_id, language_code) DO NOTHING;

WITH item3 AS (SELECT id FROM content_items WHERE content_key = 'app.main.action.3.option.3.land')
INSERT INTO content_translations (content_item_id, language_code, content_value, status) VALUES
((SELECT id FROM item3), 'ru', 'Земельный участок', 'approved'),
((SELECT id FROM item3), 'he', 'קרקע', 'approved'),
((SELECT id FROM item3), 'en', 'Land', 'approved')
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- Verify the data was inserted
SELECT 
  ci.content_key,
  ci.component_type,
  ct.language_code,
  ct.content_value
FROM content_items ci
JOIN content_translations ct ON ci.id = ct.content_item_id
WHERE ci.screen_location = 'main_page'
  AND ci.component_type = 'option'
ORDER BY ci.content_key, ct.language_code
LIMIT 20;