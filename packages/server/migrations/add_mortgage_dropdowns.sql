-- Add mortgage dropdown options
-- This script adds dropdown options for mortgage calculation fields

-- First, update some mortgage fields to be dropdowns instead of text
UPDATE content_items 
SET component_type = 'dropdown'
WHERE screen_location = 'mortgage_calculation'
  AND content_key IN (
    'mortgage.loan_term',
    'mortgage.property_type',
    'mortgage.income_type',
    'mortgage.employment_status'
  );

-- Add loan term dropdown options (years)
INSERT INTO content_items (content_key, content_type, category, screen_location, component_type, description) VALUES
('mortgage.loan_term.option.1.10years', 'text', 'dropdowns', 'mortgage_calculation', 'option', '10 year loan term'),
('mortgage.loan_term.option.2.15years', 'text', 'dropdowns', 'mortgage_calculation', 'option', '15 year loan term'),
('mortgage.loan_term.option.3.20years', 'text', 'dropdowns', 'mortgage_calculation', 'option', '20 year loan term'),
('mortgage.loan_term.option.4.25years', 'text', 'dropdowns', 'mortgage_calculation', 'option', '25 year loan term'),
('mortgage.loan_term.option.5.30years', 'text', 'dropdowns', 'mortgage_calculation', 'option', '30 year loan term');

-- Add translations for loan terms
INSERT INTO content_translations (content_item_id, language_code, content_value, status) VALUES
((SELECT id FROM content_items WHERE content_key = 'mortgage.loan_term.option.1.10years'), 'ru', '10 лет', 'approved'),
((SELECT id FROM content_items WHERE content_key = 'mortgage.loan_term.option.1.10years'), 'he', '10 שנים', 'approved'),
((SELECT id FROM content_items WHERE content_key = 'mortgage.loan_term.option.2.15years'), 'ru', '15 лет', 'approved'),
((SELECT id FROM content_items WHERE content_key = 'mortgage.loan_term.option.2.15years'), 'he', '15 שנים', 'approved'),
((SELECT id FROM content_items WHERE content_key = 'mortgage.loan_term.option.3.20years'), 'ru', '20 лет', 'approved'),
((SELECT id FROM content_items WHERE content_key = 'mortgage.loan_term.option.3.20years'), 'he', '20 שנים', 'approved'),
((SELECT id FROM content_items WHERE content_key = 'mortgage.loan_term.option.4.25years'), 'ru', '25 лет', 'approved'),
((SELECT id FROM content_items WHERE content_key = 'mortgage.loan_term.option.4.25years'), 'he', '25 שנים', 'approved'),
((SELECT id FROM content_items WHERE content_key = 'mortgage.loan_term.option.5.30years'), 'ru', '30 лет', 'approved'),
((SELECT id FROM content_items WHERE content_key = 'mortgage.loan_term.option.5.30years'), 'he', '30 שנים', 'approved');

-- Add property type dropdown options
INSERT INTO content_items (content_key, content_type, category, screen_location, component_type, description) VALUES
('mortgage.property_type.option.1.apartment', 'text', 'dropdowns', 'mortgage_calculation', 'option', 'Apartment property type'),
('mortgage.property_type.option.2.house', 'text', 'dropdowns', 'mortgage_calculation', 'option', 'House property type'),
('mortgage.property_type.option.3.land', 'text', 'dropdowns', 'mortgage_calculation', 'option', 'Land property type'),
('mortgage.property_type.option.4.commercial', 'text', 'dropdowns', 'mortgage_calculation', 'option', 'Commercial property type');

-- Add translations for property types
INSERT INTO content_translations (content_item_id, language_code, content_value, status) VALUES
((SELECT id FROM content_items WHERE content_key = 'mortgage.property_type.option.1.apartment'), 'ru', 'Квартира', 'approved'),
((SELECT id FROM content_items WHERE content_key = 'mortgage.property_type.option.1.apartment'), 'he', 'דירה', 'approved'),
((SELECT id FROM content_items WHERE content_key = 'mortgage.property_type.option.2.house'), 'ru', 'Дом', 'approved'),
((SELECT id FROM content_items WHERE content_key = 'mortgage.property_type.option.2.house'), 'he', 'בית', 'approved'),
((SELECT id FROM content_items WHERE content_key = 'mortgage.property_type.option.3.land'), 'ru', 'Земельный участок', 'approved'),
((SELECT id FROM content_items WHERE content_key = 'mortgage.property_type.option.3.land'), 'he', 'מגרש', 'approved'),
((SELECT id FROM content_items WHERE content_key = 'mortgage.property_type.option.4.commercial'), 'ru', 'Коммерческая недвижимость', 'approved'),
((SELECT id FROM content_items WHERE content_key = 'mortgage.property_type.option.4.commercial'), 'he', 'נכס מסחרי', 'approved');

-- Add income type dropdown options
INSERT INTO content_items (content_key, content_type, category, screen_location, component_type, description) VALUES
('mortgage.income_type.option.1.salary', 'text', 'dropdowns', 'mortgage_calculation', 'option', 'Salary income'),
('mortgage.income_type.option.2.business', 'text', 'dropdowns', 'mortgage_calculation', 'option', 'Business income'),
('mortgage.income_type.option.3.pension', 'text', 'dropdowns', 'mortgage_calculation', 'option', 'Pension income'),
('mortgage.income_type.option.4.investments', 'text', 'dropdowns', 'mortgage_calculation', 'option', 'Investment income');

-- Add translations for income types
INSERT INTO content_translations (content_item_id, language_code, content_value, status) VALUES
((SELECT id FROM content_items WHERE content_key = 'mortgage.income_type.option.1.salary'), 'ru', 'Зарплата', 'approved'),
((SELECT id FROM content_items WHERE content_key = 'mortgage.income_type.option.1.salary'), 'he', 'משכורת', 'approved'),
((SELECT id FROM content_items WHERE content_key = 'mortgage.income_type.option.2.business'), 'ru', 'Собственный бизнес', 'approved'),
((SELECT id FROM content_items WHERE content_key = 'mortgage.income_type.option.2.business'), 'he', 'עסק עצמאי', 'approved'),
((SELECT id FROM content_items WHERE content_key = 'mortgage.income_type.option.3.pension'), 'ru', 'Пенсия', 'approved'),
((SELECT id FROM content_items WHERE content_key = 'mortgage.income_type.option.3.pension'), 'he', 'פנסיה', 'approved'),
((SELECT id FROM content_items WHERE content_key = 'mortgage.income_type.option.4.investments'), 'ru', 'Инвестиции', 'approved'),
((SELECT id FROM content_items WHERE content_key = 'mortgage.income_type.option.4.investments'), 'he', 'השקעות', 'approved');

-- Add employment status dropdown options
INSERT INTO content_items (content_key, content_type, category, screen_location, component_type, description) VALUES
('mortgage.employment_status.option.1.employed', 'text', 'dropdowns', 'mortgage_calculation', 'option', 'Employed status'),
('mortgage.employment_status.option.2.self_employed', 'text', 'dropdowns', 'mortgage_calculation', 'option', 'Self-employed status'),
('mortgage.employment_status.option.3.unemployed', 'text', 'dropdowns', 'mortgage_calculation', 'option', 'Unemployed status'),
('mortgage.employment_status.option.4.retired', 'text', 'dropdowns', 'mortgage_calculation', 'option', 'Retired status');

-- Add translations for employment status
INSERT INTO content_translations (content_item_id, language_code, content_value, status) VALUES
((SELECT id FROM content_items WHERE content_key = 'mortgage.employment_status.option.1.employed'), 'ru', 'Наемный работник', 'approved'),
((SELECT id FROM content_items WHERE content_key = 'mortgage.employment_status.option.1.employed'), 'he', 'שכיר', 'approved'),
((SELECT id FROM content_items WHERE content_key = 'mortgage.employment_status.option.2.self_employed'), 'ru', 'Самозанятый', 'approved'),
((SELECT id FROM content_items WHERE content_key = 'mortgage.employment_status.option.2.self_employed'), 'he', 'עצמאי', 'approved'),
((SELECT id FROM content_items WHERE content_key = 'mortgage.employment_status.option.3.unemployed'), 'ru', 'Безработный', 'approved'),
((SELECT id FROM content_items WHERE content_key = 'mortgage.employment_status.option.3.unemployed'), 'he', 'לא מועסק', 'approved'),
((SELECT id FROM content_items WHERE content_key = 'mortgage.employment_status.option.4.retired'), 'ru', 'Пенсионер', 'approved'),
((SELECT id FROM content_items WHERE content_key = 'mortgage.employment_status.option.4.retired'), 'he', 'גמלאי', 'approved');

-- Update some pages to have mixed content type based on their purpose
UPDATE content_items 
SET component_type = 'mixed'
WHERE screen_location = 'mortgage_calculation'
  AND (
    content_key LIKE '%calculator%' 
    OR content_key LIKE '%form%'
    OR content_key LIKE '%personal_data%'
  );

-- Update link-type pages
UPDATE content_items 
SET component_type = 'link'
WHERE screen_location = 'mortgage_calculation'
  AND (
    content_key LIKE '%submit%' 
    OR content_key LIKE '%show_offers%'
    OR content_key LIKE '%next%'
  );