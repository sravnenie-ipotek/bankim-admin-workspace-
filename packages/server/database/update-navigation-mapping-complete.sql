-- Complete navigation mapping update to match Confluence structure
-- Section 3.1: Рассчитать ипотеку. До регистрации + Регистрация

-- First, clear existing mappings for section 3.1
DELETE FROM navigation_mapping WHERE parent_section = '3.1';

-- Insert all 14 screens from Confluence structure
INSERT INTO navigation_mapping 
  (confluence_num, confluence_title_ru, confluence_title_he, confluence_title_en, screen_location, parent_section, sort_order)
VALUES
  -- Main mortgage calculator screens
  ('2', 'Калькулятор ипотеки. Услуга 1. До регистрации', 'מחשבון משכנתא. שירות 1. לפני הרשמה', 'Mortgage Calculator. Service 1. Before Registration', 'mortgage_step1', '3.1', 2),
  ('3', 'Ввод номера телефона. Общая 1. До регистрации', 'הזנת מספר טלפון. כללי 1. לפני הרשמה', 'Phone Number Input. General 1. Before Registration', 'mortgage_phone', '3.1', 3),
  ('4', 'Анкета личных данных. Услуга 1. До регистрации', 'טופס נתונים אישיים. שירות 1. לפני הרשמה', 'Personal Data Form. Service 1. Before Registration', 'mortgage_step2', '3.1', 4),
  ('5', 'Анкета партнера. Личные данные. Общая 1. До регистрации', 'נתוני בן/בת זוג. כללי 1. לפני הרשמה', 'Partner Personal Data. General 1. Before Registration', 'mortgage_step3', '3.1', 5),
  ('6', 'Анкета партнера. Доходы. Общая 1. До регистрации', 'הכנסות בן/בת זוג. כללי 1. לפני הרשמה', 'Partner Income. General 1. Before Registration', 'mortgage_step4', '3.1', 6),
  ('7', 'Анкета доходов. Наемный работник. Услуга 1. До регистрации', 'טופס הכנסות. שכיר. שירות 1. לפני הרשמה', 'Income Form - Employee. Service 1. Before Registration', 'mortgage_income_employee', '3.1', 7),
  ('8', 'Личные данные созаемщика. Общая 1. До регистрации', 'נתונים אישיים של לווה משותף. כללי 1. לפני הרשמה', 'Co-borrower Personal Data. General 1. Before Registration', 'mortgage_coborrower_personal', '3.1', 8),
  ('9', 'Доходы созаемщика. Общая 1. До регистрации', 'הכנסות לווה משותף. כללי 1. לפני הרשמה', 'Co-borrower Income. General 1. Before Registration', 'mortgage_coborrower_income', '3.1', 9),
  ('10', 'Экран загрузки. Общая 1. До регистрации', 'מסך טעינה. כללי 1. לפני הרשמה', 'Loading Screen. General 1. Before Registration', 'mortgage_loading', '3.1', 10),
  ('11', 'Выбор программ ипотеки. Услуга 1. До регистрации', 'בחירת תוכניות משכנתא. שירות 1. לפני הרשמה', 'Mortgage Program Selection. Service 1. Before Registration', 'mortgage_program_selection', '3.1', 11),
  ('12', 'Регистрация. Общая 1. До регистрации', 'הרשמה. כללי 1. לפני הרשמה', 'Registration. General 1. Before Registration', 'mortgage_registration', '3.1', 12),
  ('13', 'Форма входа страница. Общая 1. До регистрации', 'טופס כניסה. כללי 1. לפני הרשמה', 'Login Form. General 1. Before Registration', 'mortgage_login', '3.1', 13),
  ('14', 'Восстановить пароль. Общая 1. До регистрации', 'שחזור סיסמה. כללי 1. לפני הרשמה', 'Password Recovery. General 1. Before Registration', 'mortgage_password_recovery', '3.1', 14);

-- Verify the data
SELECT 
    confluence_num,
    confluence_title_ru,
    screen_location,
    parent_section
FROM navigation_mapping
WHERE parent_section = '3.1'
ORDER BY sort_order;