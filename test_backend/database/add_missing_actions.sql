-- Add missing actions 9-12 to match the original mock data
-- This script adds the missing content items to the bankim_content database

-- Add content items for actions 9-12
INSERT INTO content_items (content_key, content_type, category, screen_location, component_type, description) VALUES
('app.main.action.9.dropdown.income_stability', 'text', 'dropdowns', 'main_page', 'dropdown', 'Income stability dropdown action 9'),
('app.main.action.10.dropdown.bank_account', 'text', 'dropdowns', 'main_page', 'dropdown', 'Bank account dropdown action 10'),
('app.main.action.11.dropdown.loan_term', 'text', 'dropdowns', 'main_page', 'dropdown', 'Loan term dropdown action 11'),
('app.main.action.12.dropdown.payment_method', 'text', 'dropdowns', 'main_page', 'dropdown', 'Payment method dropdown action 12')
ON CONFLICT (content_key) DO NOTHING;

-- Add translations for action 9
WITH item AS (SELECT id FROM content_items WHERE content_key = 'app.main.action.9.dropdown.income_stability')
INSERT INTO content_translations (content_item_id, language_code, content_value, is_default, status) VALUES
((SELECT id FROM item), 'ru', 'Стабильность дохода', FALSE, 'approved'),
((SELECT id FROM item), 'he', 'יציבות הכנסה', FALSE, 'approved'),
((SELECT id FROM item), 'en', 'Income Stability', FALSE, 'approved')
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- Add translations for action 10
WITH item AS (SELECT id FROM content_items WHERE content_key = 'app.main.action.10.dropdown.bank_account')
INSERT INTO content_translations (content_item_id, language_code, content_value, is_default, status) VALUES
((SELECT id FROM item), 'ru', 'Банковский счет', FALSE, 'approved'),
((SELECT id FROM item), 'he', 'חשבון בנק', FALSE, 'approved'),
((SELECT id FROM item), 'en', 'Bank Account', FALSE, 'approved')
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- Add translations for action 11
WITH item AS (SELECT id FROM content_items WHERE content_key = 'app.main.action.11.dropdown.loan_term')
INSERT INTO content_translations (content_item_id, language_code, content_value, is_default, status) VALUES
((SELECT id FROM item), 'ru', 'Срок кредита', FALSE, 'approved'),
((SELECT id FROM item), 'he', 'תקופת הלוואה', FALSE, 'approved'),
((SELECT id FROM item), 'en', 'Loan Term', FALSE, 'approved')
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- Add translations for action 12
WITH item AS (SELECT id FROM content_items WHERE content_key = 'app.main.action.12.dropdown.payment_method')
INSERT INTO content_translations (content_item_id, language_code, content_value, is_default, status) VALUES
((SELECT id FROM item), 'ru', 'Способ оплаты', FALSE, 'approved'),
((SELECT id FROM item), 'he', 'אמצעי תשלום', FALSE, 'approved'),
((SELECT id FROM item), 'en', 'Payment Method', FALSE, 'approved')
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- Verify the new items were added
SELECT 
    ci.content_key,
    ct.language_code,
    ct.content_value
FROM content_items ci
JOIN content_translations ct ON ci.id = ct.content_item_id
WHERE ci.screen_location = 'main_page' 
  AND ci.component_type = 'dropdown'
  AND ct.language_code = 'ru'
ORDER BY ci.content_key;