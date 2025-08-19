-- Fix navigation mapping to match Confluence EXACTLY
-- Clear existing mappings
DELETE FROM navigation_mapping WHERE parent_section = '3.1';

-- Insert with EXACT Confluence structure (numbers must be strings to preserve order)
INSERT INTO navigation_mapping 
  (confluence_num, confluence_title_ru, confluence_title_he, confluence_title_en, screen_location, parent_section, sort_order)
VALUES
  ('2', 'Калькулятор ипотеки', 'מחשבון משכנתא', 'Mortgage Calculator', 'mortgage_step1', '3.1', 2),
  ('3', 'Ввод номера телефона', 'הזנת מספר טלפון', 'Phone Number Input', 'mortgage_phone', '3.1', 3),
  ('3.1', 'Ввод кода', 'הזנת קוד', 'Code Input', 'mortgage_code_input', '3.1', 31),
  ('4', 'Анкета личных данных', 'טופס נתונים אישיים', 'Personal Data Form', 'mortgage_step2', '3.1', 4),
  ('5', 'Анкета партнера. Личные данные', 'נתוני בן/בת זוג', 'Partner Personal Data', 'mortgage_step3', '3.1', 5),
  ('6', 'Анкета партнера. Доходы', 'הכנסות בן/בת זוג', 'Partner Income', 'mortgage_step4', '3.1', 6),
  ('7', 'Анкета доходов. Наемный работник', 'טופס הכנסות - שכיר', 'Income Form - Employee', 'mortgage_income_employee', '3.1', 7),
  ('8', 'Личные данные созаемщика', 'נתונים אישיים של לווה משותף', 'Co-borrower Personal Data', 'mortgage_coborrower_personal', '3.1', 8),
  ('9', 'Доходы созаемщика', 'הכנסות לווה משותף', 'Co-borrower Income', 'mortgage_coborrower_income', '3.1', 9),
  ('10', 'Экран загрузки', 'מסך טעינה', 'Loading Screen', 'mortgage_loading', '3.1', 10),
  ('11', 'Выбор программ ипотеки', 'בחירת תוכניות משכנתא', 'Mortgage Program Selection', 'mortgage_program_selection', '3.1', 11),
  ('12', 'Регистрация', 'הרשמה', 'Registration', 'mortgage_registration', '3.1', 12),
  ('13', 'Форма входа страница', 'טופס כניסה', 'Login Form', 'mortgage_login', '3.1', 13),
  ('14', 'Восстановить пароль', 'שחזור סיסמה', 'Password Recovery', 'mortgage_password_recovery', '3.1', 14);

-- Verify the update
SELECT 
    confluence_num,
    confluence_title_ru,
    screen_location
FROM navigation_mapping
WHERE parent_section = '3.1'
ORDER BY sort_order;