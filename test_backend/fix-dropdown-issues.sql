-- BankIM Content Validation Report: Fix Dropdown Issues
-- Date: 2025-07-30
-- Scope: Convert text labels to proper JSON dropdown options

-- The issue: All dropdown components have simple text labels instead of JSON arrays
-- Expected format: [{"value": "option1", "label": "Display Text"}]
-- Current format: "Simple text label"

-- Fix calculate_mortgage_type dropdown
UPDATE content_translations 
SET content_value = '[
  {"value": "standard", "label": "Стандартная ипотека"},
  {"value": "refinance", "label": "Рефинансирование"},
  {"value": "commercial", "label": "Коммерческая ипотека"}
]'
WHERE content_item_id = (
  SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_type'
) AND language_code = 'ru';

UPDATE content_translations 
SET content_value = '[
  {"value": "standard", "label": "משכנתא רגילה"},
  {"value": "refinance", "label": "מיחזור משכנתא"},
  {"value": "commercial", "label": "משכנתא מסחרית"}
]'
WHERE content_item_id = (
  SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_type'
) AND language_code = 'he';

UPDATE content_translations 
SET content_value = '[
  {"value": "standard", "label": "Standard Mortgage"},
  {"value": "refinance", "label": "Mortgage Refinance"},
  {"value": "commercial", "label": "Commercial Mortgage"}
]'
WHERE content_item_id = (
  SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_type'
) AND language_code = 'en';

-- Fix mortgage_refinance_bank dropdown
UPDATE content_translations 
SET content_value = '[
  {"value": "bank_hapoalim", "label": "Банк Апоалим"},
  {"value": "bank_leumi", "label": "Банк Леуми"},
  {"value": "bank_discount", "label": "Банк Дисконт"},
  {"value": "mizrahi_tefahot", "label": "Мизрахи Тфахот"},
  {"value": "first_international", "label": "Первый международный банк"},
  {"value": "other", "label": "Другой банк"}
]'
WHERE content_item_id = (
  SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_bank'
) AND language_code = 'ru';

UPDATE content_translations 
SET content_value = '[
  {"value": "bank_hapoalim", "label": "בנק הפועלים"},
  {"value": "bank_leumi", "label": "בנק לאומי"},
  {"value": "bank_discount", "label": "בנק דיסקונט"},
  {"value": "mizrahi_tefahot", "label": "מזרחי טפחות"},
  {"value": "first_international", "label": "הבנק הבינלאומי הראשון"},
  {"value": "other", "label": "בנק אחר"}
]'
WHERE content_item_id = (
  SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_bank'
) AND language_code = 'he';

UPDATE content_translations 
SET content_value = '[
  {"value": "bank_hapoalim", "label": "Bank Hapoalim"},
  {"value": "bank_leumi", "label": "Bank Leumi"},
  {"value": "bank_discount", "label": "Bank Discount"},
  {"value": "mizrahi_tefahot", "label": "Mizrahi Tefahot Bank"},
  {"value": "first_international", "label": "First International Bank"},
  {"value": "other", "label": "Other Bank"}
]'
WHERE content_item_id = (
  SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_bank'
) AND language_code = 'en';

-- Fix mortgage_refinance_registered dropdown
UPDATE content_translations 
SET content_value = '[
  {"value": "yes", "label": "Да, зарегистрирована"},
  {"value": "no", "label": "Нет, не зарегистрирована"},
  {"value": "unknown", "label": "Не знаю"}
]'
WHERE content_item_id = (
  SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_registered'
) AND language_code = 'ru';

UPDATE content_translations 
SET content_value = '[
  {"value": "yes", "label": "כן, רשומה בטאבו"},
  {"value": "no", "label": "לא, לא רשומה בטאבו"},
  {"value": "unknown", "label": "לא יודע"}
]'
WHERE content_item_id = (
  SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_registered'
) AND language_code = 'he';

UPDATE content_translations 
SET content_value = '[
  {"value": "yes", "label": "Yes, registered in land registry"},
  {"value": "no", "label": "No, not registered"},
  {"value": "unknown", "label": "I dont know"}
]'
WHERE content_item_id = (
  SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_registered'
) AND language_code = 'en';

-- Fix mortgage_refinance_type dropdown
UPDATE content_translations 
SET content_value = '[
  {"value": "fixed", "label": "Фиксированная ставка"},
  {"value": "variable", "label": "Переменная ставка"},
  {"value": "mixed", "label": "Смешанная ставка"},
  {"value": "prime", "label": "Прайм ставка"}
]'
WHERE content_item_id = (
  SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_type'
) AND language_code = 'ru';

UPDATE content_translations 
SET content_value = '[
  {"value": "fixed", "label": "ריבית קבועה"},
  {"value": "variable", "label": "ריבית משתנה"},
  {"value": "mixed", "label": "ריבית מעורבת"},
  {"value": "prime", "label": "ריבית פריים"}
]'
WHERE content_item_id = (
  SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_type'
) AND language_code = 'he';

UPDATE content_translations 
SET content_value = '[
  {"value": "fixed", "label": "Fixed Interest Rate"},
  {"value": "variable", "label": "Variable Interest Rate"},
  {"value": "mixed", "label": "Mixed Interest Rate"},
  {"value": "prime", "label": "Prime Interest Rate"}
]'
WHERE content_item_id = (
  SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_type'
) AND language_code = 'en';

-- Verification queries to check the updates
-- SELECT ci.content_key, ct.language_code, ct.content_value 
-- FROM content_items ci 
-- JOIN content_translations ct ON ci.id = ct.content_item_id 
-- WHERE ci.component_type = 'dropdown' 
-- ORDER BY ci.content_key, ct.language_code;