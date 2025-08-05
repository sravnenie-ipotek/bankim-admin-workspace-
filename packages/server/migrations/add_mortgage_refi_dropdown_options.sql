-- Add missing dropdown options for mortgage-refi screen
-- This script adds dropdown options for mortgage refinancing fields that are missing options

-- 1. Add Current Bank dropdown options
INSERT INTO content_items (content_key, content_type, category, screen_location, component_type, description, is_active) VALUES
('mortgage_refinance_bank_option_1', 'text', 'dropdowns', 'refinance_mortgage_1', 'option', 'Bank Leumi option'),
('mortgage_refinance_bank_option_2', 'text', 'dropdowns', 'refinance_mortgage_1', 'option', 'Bank Hapoalim option'),
('mortgage_refinance_bank_option_3', 'text', 'dropdowns', 'refinance_mortgage_1', 'option', 'Bank Discount option'),
('mortgage_refinance_bank_option_4', 'text', 'dropdowns', 'refinance_mortgage_1', 'option', 'Bank Mizrahi option'),
('mortgage_refinance_bank_option_5', 'text', 'dropdowns', 'refinance_mortgage_1', 'option', 'Bank Beinleumi option'),
('mortgage_refinance_bank_option_6', 'text', 'dropdowns', 'refinance_mortgage_1', 'option', 'Bank Mercantile option'),
('mortgage_refinance_bank_option_7', 'text', 'dropdowns', 'refinance_mortgage_1', 'option', 'Bank Union option'),
('mortgage_refinance_bank_option_8', 'text', 'dropdowns', 'refinance_mortgage_1', 'option', 'Other bank option');

-- Add translations for Current Bank options
INSERT INTO content_translations (content_item_id, language_code, content_value, status) VALUES
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_bank_option_1'), 'ru', 'Банк Леуми', 'approved'),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_bank_option_1'), 'he', 'בנק לאומי', 'approved'),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_bank_option_1'), 'en', 'Bank Leumi', 'approved'),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_bank_option_2'), 'ru', 'Банк Хапоалим', 'approved'),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_bank_option_2'), 'he', 'בנק הפועלים', 'approved'),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_bank_option_2'), 'en', 'Bank Hapoalim', 'approved'),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_bank_option_3'), 'ru', 'Банк Дисконт', 'approved'),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_bank_option_3'), 'he', 'בנק דיסקונט', 'approved'),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_bank_option_3'), 'en', 'Bank Discount', 'approved'),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_bank_option_4'), 'ru', 'Банк Мизрахи', 'approved'),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_bank_option_4'), 'he', 'בנק מזרחי', 'approved'),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_bank_option_4'), 'en', 'Bank Mizrahi', 'approved'),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_bank_option_5'), 'ru', 'Банк Бейнлеуми', 'approved'),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_bank_option_5'), 'he', 'בנק בינלאומי', 'approved'),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_bank_option_5'), 'en', 'Bank Beinleumi', 'approved'),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_bank_option_6'), 'ru', 'Банк Меркантиль', 'approved'),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_bank_option_6'), 'he', 'בנק מרכנתיל', 'approved'),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_bank_option_6'), 'en', 'Bank Mercantile', 'approved'),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_bank_option_7'), 'ru', 'Банк Юнион', 'approved'),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_bank_option_7'), 'he', 'בנק יוניון', 'approved'),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_bank_option_7'), 'en', 'Bank Union', 'approved'),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_bank_option_8'), 'ru', 'Другой банк', 'approved'),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_bank_option_8'), 'he', 'בנק אחר', 'approved'),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_bank_option_8'), 'en', 'Other Bank', 'approved');

-- 2. Add Property Type dropdown options
INSERT INTO content_items (content_key, content_type, category, screen_location, component_type, description, is_active) VALUES
('mortgage_refinance_type_option_1', 'text', 'dropdowns', 'refinance_mortgage_1', 'option', 'Apartment property type'),
('mortgage_refinance_type_option_2', 'text', 'dropdowns', 'refinance_mortgage_1', 'option', 'House property type'),
('mortgage_refinance_type_option_3', 'text', 'dropdowns', 'refinance_mortgage_1', 'option', 'Land property type'),
('mortgage_refinance_type_option_4', 'text', 'dropdowns', 'refinance_mortgage_1', 'option', 'Commercial property type'),
('mortgage_refinance_type_option_5', 'text', 'dropdowns', 'refinance_mortgage_1', 'option', 'Mixed property type');

-- Add translations for Property Type options
INSERT INTO content_translations (content_item_id, language_code, content_value, status) VALUES
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_type_option_1'), 'ru', 'Квартира', 'approved'),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_type_option_1'), 'he', 'דירה', 'approved'),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_type_option_1'), 'en', 'Apartment', 'approved'),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_type_option_2'), 'ru', 'Дом', 'approved'),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_type_option_2'), 'he', 'בית', 'approved'),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_type_option_2'), 'en', 'House', 'approved'),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_type_option_3'), 'ru', 'Земельный участок', 'approved'),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_type_option_3'), 'he', 'קרקע', 'approved'),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_type_option_3'), 'en', 'Land', 'approved'),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_type_option_4'), 'ru', 'Коммерческая недвижимость', 'approved'),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_type_option_4'), 'he', 'נכס מסחרי', 'approved'),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_type_option_4'), 'en', 'Commercial Property', 'approved'),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_type_option_5'), 'ru', 'Смешанная недвижимость', 'approved'),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_type_option_5'), 'he', 'נכס מעורב', 'approved'),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_type_option_5'), 'en', 'Mixed Property', 'approved');

-- 3. Add Registration Status dropdown options (these already exist but need to be linked properly)
-- The options already exist: mortgage_refinance_reg_option_1 and mortgage_refinance_reg_option_2
-- We just need to ensure they are properly linked to the dropdown field

-- Update the existing registration options to be properly linked
UPDATE content_items 
SET screen_location = 'refinance_mortgage_1'
WHERE content_key IN ('mortgage_refinance_reg_option_1', 'mortgage_refinance_reg_option_2');

-- 4. Update the main dropdown fields to be dropdown type instead of text
UPDATE content_items 
SET component_type = 'dropdown'
WHERE screen_location = 'refinance_mortgage_1'
  AND content_key IN (
    'mortgage_refinance_bank',
    'mortgage_refinance_type',
    'mortgage_refinance_registered'
  );

-- 5. Add the missing main dropdown field for bank (it only has placeholder)
INSERT INTO content_items (content_key, content_type, category, screen_location, component_type, description, is_active) VALUES
('mortgage_refinance_bank', 'text', 'forms', 'refinance_mortgage_1', 'dropdown', 'Current mortgage bank dropdown', true);

-- Add translations for the bank dropdown field
INSERT INTO content_translations (content_item_id, language_code, content_value, status) VALUES
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_bank'), 'ru', 'Банк текущей ипотеки', 'approved'),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_bank'), 'he', 'בנק המשכנתא הנוכחית', 'approved'),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_bank'), 'en', 'Current Mortgage Bank', 'approved');

-- 6. Add the missing main dropdown field for registration status
INSERT INTO content_items (content_key, content_type, category, screen_location, component_type, description, is_active) VALUES
('mortgage_refinance_registered', 'text', 'forms', 'refinance_mortgage_1', 'dropdown', 'Mortgage registration status dropdown', true);

-- Add translations for the registration status dropdown field
INSERT INTO content_translations (content_item_id, language_code, content_value, status) VALUES
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_registered'), 'ru', 'Зарегистрирована ли ипотека в земельном реестре?', 'approved'),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_registered'), 'he', 'האם המשכנתא רשומה בטאבו?', 'approved'),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_registered'), 'en', 'Is the Mortgage Registered?', 'approved'); 