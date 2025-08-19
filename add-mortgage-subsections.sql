-- Add mortgage subsections 7.1, 7.2, 7.3
-- Date: 18.08.2025 | 10:26

-- Section 7.1: Добавление источника дохода (Add Income Source)
INSERT INTO content_items (
    content_key, 
    component_type, 
    category, 
    screen_location, 
    page_number, 
    is_active, 
    description, 
    app_context_id
) VALUES
-- Page title
('mortgage_step7_1.title', 'title', 'page_header', 'mortgage_income_add', 7.1, true, 'Add income source page title', 1),

-- Form labels
('mortgage_step7_1.label.income_type', 'label', 'form', 'mortgage_income_add', 7.1, true, 'Income type selection label', 1),
('mortgage_step7_1.label.monthly_amount', 'label', 'form', 'mortgage_income_add', 7.1, true, 'Monthly income amount label', 1),
('mortgage_step7_1.label.company_name', 'label', 'form', 'mortgage_income_add', 7.1, true, 'Company name label', 1),
('mortgage_step7_1.label.start_date', 'label', 'form', 'mortgage_income_add', 7.1, true, 'Employment start date label', 1),
('mortgage_step7_1.label.field_of_activity', 'label', 'form', 'mortgage_income_add', 7.1, true, 'Field of activity label', 1),

-- Placeholders
('mortgage_step7_1.placeholder.income_type', 'placeholder', 'form', 'mortgage_income_add', 7.1, true, 'Select income type placeholder', 1),
('mortgage_step7_1.placeholder.monthly_amount', 'placeholder', 'form', 'mortgage_income_add', 7.1, true, 'Enter monthly amount placeholder', 1),
('mortgage_step7_1.placeholder.company_name', 'placeholder', 'form', 'mortgage_income_add', 7.1, true, 'Enter company name placeholder', 1),

-- Buttons
('mortgage_step7_1.button.save', 'button', 'form', 'mortgage_income_add', 7.1, true, 'Save income source button', 1),
('mortgage_step7_1.button.cancel', 'button', 'form', 'mortgage_income_add', 7.1, true, 'Cancel button', 1),

-- Section 7.2: Добавление доп. источника дохода (Add Additional Income Source)
('mortgage_step7_2.title', 'title', 'page_header', 'mortgage_additional_income_add', 7.2, true, 'Add additional income source page title', 1),

-- Form labels
('mortgage_step7_2.label.additional_income_type', 'label', 'form', 'mortgage_additional_income_add', 7.2, true, 'Additional income type label', 1),
('mortgage_step7_2.label.monthly_amount', 'label', 'form', 'mortgage_additional_income_add', 7.2, true, 'Monthly additional income amount label', 1),
('mortgage_step7_2.label.description', 'label', 'form', 'mortgage_additional_income_add', 7.2, true, 'Income description label', 1),

-- Dropdown options for additional income
('mortgage_step7_2.option.additional_salary', 'dropdown_option', 'form', 'mortgage_additional_income_add', 7.2, true, 'Additional salary option', 1),
('mortgage_step7_2.option.freelance_work', 'dropdown_option', 'form', 'mortgage_additional_income_add', 7.2, true, 'Freelance work option', 1),
('mortgage_step7_2.option.property_rental', 'dropdown_option', 'form', 'mortgage_additional_income_add', 7.2, true, 'Property rental income option', 1),
('mortgage_step7_2.option.investment_income', 'dropdown_option', 'form', 'mortgage_additional_income_add', 7.2, true, 'Investment income option', 1),
('mortgage_step7_2.option.pension', 'dropdown_option', 'form', 'mortgage_additional_income_add', 7.2, true, 'Pension income option', 1),
('mortgage_step7_2.option.other', 'dropdown_option', 'form', 'mortgage_additional_income_add', 7.2, true, 'Other income option', 1),

-- Placeholders
('mortgage_step7_2.placeholder.additional_income_type', 'placeholder', 'form', 'mortgage_additional_income_add', 7.2, true, 'Select additional income type placeholder', 1),
('mortgage_step7_2.placeholder.monthly_amount', 'placeholder', 'form', 'mortgage_additional_income_add', 7.2, true, 'Enter monthly amount placeholder', 1),
('mortgage_step7_2.placeholder.description', 'placeholder', 'form', 'mortgage_additional_income_add', 7.2, true, 'Enter description placeholder', 1),

-- Buttons
('mortgage_step7_2.button.save', 'button', 'form', 'mortgage_additional_income_add', 7.2, true, 'Save additional income button', 1),
('mortgage_step7_2.button.cancel', 'button', 'form', 'mortgage_additional_income_add', 7.2, true, 'Cancel button', 1),

-- Section 7.3: Добавление долгового обязательства (Add Debt Obligation)
('mortgage_step7_3.title', 'title', 'page_header', 'mortgage_obligation_add', 7.3, true, 'Add debt obligation page title', 1),

-- Form labels
('mortgage_step7_3.label.obligation_type', 'label', 'form', 'mortgage_obligation_add', 7.3, true, 'Obligation type label', 1),
('mortgage_step7_3.label.bank_name', 'label', 'form', 'mortgage_obligation_add', 7.3, true, 'Bank name label', 1),
('mortgage_step7_3.label.monthly_payment', 'label', 'form', 'mortgage_obligation_add', 7.3, true, 'Monthly payment amount label', 1),
('mortgage_step7_3.label.remaining_balance', 'label', 'form', 'mortgage_obligation_add', 7.3, true, 'Remaining balance label', 1),
('mortgage_step7_3.label.end_date', 'label', 'form', 'mortgage_obligation_add', 7.3, true, 'Obligation end date label', 1),

-- Dropdown options for obligation types
('mortgage_step7_3.option.bank_loan', 'dropdown_option', 'form', 'mortgage_obligation_add', 7.3, true, 'Bank loan option', 1),
('mortgage_step7_3.option.credit_card', 'dropdown_option', 'form', 'mortgage_obligation_add', 7.3, true, 'Credit card debt option', 1),
('mortgage_step7_3.option.consumer_credit', 'dropdown_option', 'form', 'mortgage_obligation_add', 7.3, true, 'Consumer credit option', 1),
('mortgage_step7_3.option.car_loan', 'dropdown_option', 'form', 'mortgage_obligation_add', 7.3, true, 'Car loan option', 1),
('mortgage_step7_3.option.student_loan', 'dropdown_option', 'form', 'mortgage_obligation_add', 7.3, true, 'Student loan option', 1),
('mortgage_step7_3.option.other_debt', 'dropdown_option', 'form', 'mortgage_obligation_add', 7.3, true, 'Other debt obligation option', 1),

-- Bank options
('mortgage_step7_3.option.bank_hapoalim', 'dropdown_option', 'form', 'mortgage_obligation_add', 7.3, true, 'Bank Hapoalim option', 1),
('mortgage_step7_3.option.bank_leumi', 'dropdown_option', 'form', 'mortgage_obligation_add', 7.3, true, 'Bank Leumi option', 1),
('mortgage_step7_3.option.bank_discount', 'dropdown_option', 'form', 'mortgage_obligation_add', 7.3, true, 'Discount Bank option', 1),
('mortgage_step7_3.option.bank_mizrahi', 'dropdown_option', 'form', 'mortgage_obligation_add', 7.3, true, 'Mizrahi Bank option', 1),
('mortgage_step7_3.option.bank_other', 'dropdown_option', 'form', 'mortgage_obligation_add', 7.3, true, 'Other bank option', 1),

-- Placeholders
('mortgage_step7_3.placeholder.obligation_type', 'placeholder', 'form', 'mortgage_obligation_add', 7.3, true, 'Select obligation type placeholder', 1),
('mortgage_step7_3.placeholder.bank_name', 'placeholder', 'form', 'mortgage_obligation_add', 7.3, true, 'Select bank placeholder', 1),
('mortgage_step7_3.placeholder.monthly_payment', 'placeholder', 'form', 'mortgage_obligation_add', 7.3, true, 'Enter monthly payment placeholder', 1),
('mortgage_step7_3.placeholder.remaining_balance', 'placeholder', 'form', 'mortgage_obligation_add', 7.3, true, 'Enter remaining balance placeholder', 1),

-- Buttons
('mortgage_step7_3.button.save', 'button', 'form', 'mortgage_obligation_add', 7.3, true, 'Save obligation button', 1),
('mortgage_step7_3.button.cancel', 'button', 'form', 'mortgage_obligation_add', 7.3, true, 'Cancel button', 1),
('mortgage_step7_3.button.calculate_remaining', 'button', 'form', 'mortgage_obligation_add', 7.3, true, 'Calculate remaining balance button', 1);

-- Add translations for the new content items
INSERT INTO content_translations (content_item_id, language_code, content_value)
SELECT 
    ci.id,
    'ru' as language_code,
    CASE ci.content_key
        -- Section 7.1 translations
        WHEN 'mortgage_step7_1.title' THEN 'Добавление источника дохода'
        WHEN 'mortgage_step7_1.label.income_type' THEN 'Тип дохода'
        WHEN 'mortgage_step7_1.label.monthly_amount' THEN 'Месячная сумма'
        WHEN 'mortgage_step7_1.label.company_name' THEN 'Название компании'
        WHEN 'mortgage_step7_1.label.start_date' THEN 'Дата начала работы'
        WHEN 'mortgage_step7_1.label.field_of_activity' THEN 'Сфера деятельности'
        WHEN 'mortgage_step7_1.placeholder.income_type' THEN 'Выберите тип дохода'
        WHEN 'mortgage_step7_1.placeholder.monthly_amount' THEN 'Введите месячную сумму'
        WHEN 'mortgage_step7_1.placeholder.company_name' THEN 'Введите название компании'
        WHEN 'mortgage_step7_1.button.save' THEN 'Сохранить'
        WHEN 'mortgage_step7_1.button.cancel' THEN 'Отмена'
        
        -- Section 7.2 translations
        WHEN 'mortgage_step7_2.title' THEN 'Добавление дополнительного источника дохода'
        WHEN 'mortgage_step7_2.label.additional_income_type' THEN 'Тип дополнительного дохода'
        WHEN 'mortgage_step7_2.label.monthly_amount' THEN 'Месячная сумма'
        WHEN 'mortgage_step7_2.label.description' THEN 'Описание'
        WHEN 'mortgage_step7_2.option.additional_salary' THEN 'Дополнительная зарплата'
        WHEN 'mortgage_step7_2.option.freelance_work' THEN 'Фриланс'
        WHEN 'mortgage_step7_2.option.property_rental' THEN 'Аренда недвижимости'
        WHEN 'mortgage_step7_2.option.investment_income' THEN 'Доход от инвестиций'
        WHEN 'mortgage_step7_2.option.pension' THEN 'Пенсия'
        WHEN 'mortgage_step7_2.option.other' THEN 'Другое'
        WHEN 'mortgage_step7_2.placeholder.additional_income_type' THEN 'Выберите тип дополнительного дохода'
        WHEN 'mortgage_step7_2.placeholder.monthly_amount' THEN 'Введите месячную сумму'
        WHEN 'mortgage_step7_2.placeholder.description' THEN 'Введите описание'
        WHEN 'mortgage_step7_2.button.save' THEN 'Сохранить'
        WHEN 'mortgage_step7_2.button.cancel' THEN 'Отмена'
        
        -- Section 7.3 translations
        WHEN 'mortgage_step7_3.title' THEN 'Добавление долгового обязательства'
        WHEN 'mortgage_step7_3.label.obligation_type' THEN 'Тип обязательства'
        WHEN 'mortgage_step7_3.label.bank_name' THEN 'Банк'
        WHEN 'mortgage_step7_3.label.monthly_payment' THEN 'Ежемесячный платеж'
        WHEN 'mortgage_step7_3.label.remaining_balance' THEN 'Остаток задолженности'
        WHEN 'mortgage_step7_3.label.end_date' THEN 'Дата окончания'
        WHEN 'mortgage_step7_3.option.bank_loan' THEN 'Банковский кредит'
        WHEN 'mortgage_step7_3.option.credit_card' THEN 'Кредитная карта'
        WHEN 'mortgage_step7_3.option.consumer_credit' THEN 'Потребительский кредит'
        WHEN 'mortgage_step7_3.option.car_loan' THEN 'Автокредит'
        WHEN 'mortgage_step7_3.option.student_loan' THEN 'Образовательный кредит'
        WHEN 'mortgage_step7_3.option.other_debt' THEN 'Другая задолженность'
        WHEN 'mortgage_step7_3.option.bank_hapoalim' THEN 'Банк Апоалим'
        WHEN 'mortgage_step7_3.option.bank_leumi' THEN 'Банк Леуми'
        WHEN 'mortgage_step7_3.option.bank_discount' THEN 'Дисконт Банк'
        WHEN 'mortgage_step7_3.option.bank_mizrahi' THEN 'Мизрахи Банк'
        WHEN 'mortgage_step7_3.option.bank_other' THEN 'Другой банк'
        WHEN 'mortgage_step7_3.placeholder.obligation_type' THEN 'Выберите тип обязательства'
        WHEN 'mortgage_step7_3.placeholder.bank_name' THEN 'Выберите банк'
        WHEN 'mortgage_step7_3.placeholder.monthly_payment' THEN 'Введите ежемесячный платеж'
        WHEN 'mortgage_step7_3.placeholder.remaining_balance' THEN 'Введите остаток задолженности'
        WHEN 'mortgage_step7_3.button.save' THEN 'Сохранить'
        WHEN 'mortgage_step7_3.button.cancel' THEN 'Отмена'
        WHEN 'mortgage_step7_3.button.calculate_remaining' THEN 'Рассчитать остаток'
        ELSE ci.content_key
    END
FROM content_items ci
WHERE ci.content_key LIKE 'mortgage_step7_%'
  AND ci.page_number IN (7.1, 7.2, 7.3);

-- Add Hebrew translations
INSERT INTO content_translations (content_item_id, language_code, content_value)
SELECT 
    ci.id,
    'he' as language_code,
    CASE ci.content_key
        -- Section 7.1 Hebrew translations
        WHEN 'mortgage_step7_1.title' THEN 'הוספת מקור הכנסה'
        WHEN 'mortgage_step7_1.label.income_type' THEN 'סוג הכנסה'
        WHEN 'mortgage_step7_1.label.monthly_amount' THEN 'סכום חודשי'
        WHEN 'mortgage_step7_1.label.company_name' THEN 'שם החברה'
        WHEN 'mortgage_step7_1.label.start_date' THEN 'תאריך תחילת עבודה'
        WHEN 'mortgage_step7_1.label.field_of_activity' THEN 'תחום פעילות'
        WHEN 'mortgage_step7_1.placeholder.income_type' THEN 'בחר סוג הכנסה'
        WHEN 'mortgage_step7_1.placeholder.monthly_amount' THEN 'הכנס סכום חודשי'
        WHEN 'mortgage_step7_1.placeholder.company_name' THEN 'הכנס שם החברה'
        WHEN 'mortgage_step7_1.button.save' THEN 'שמור'
        WHEN 'mortgage_step7_1.button.cancel' THEN 'ביטול'
        
        -- Section 7.2 Hebrew translations
        WHEN 'mortgage_step7_2.title' THEN 'הוספת מקור הכנסה נוסף'
        WHEN 'mortgage_step7_2.label.additional_income_type' THEN 'סוג הכנסה נוספת'
        WHEN 'mortgage_step7_2.label.monthly_amount' THEN 'סכום חודשי'
        WHEN 'mortgage_step7_2.label.description' THEN 'תיאור'
        WHEN 'mortgage_step7_2.option.additional_salary' THEN 'משכורת נוספת'
        WHEN 'mortgage_step7_2.option.freelance_work' THEN 'עבודה עצמאית'
        WHEN 'mortgage_step7_2.option.property_rental' THEN 'השכרת נכסים'
        WHEN 'mortgage_step7_2.option.investment_income' THEN 'הכנסה מהשקעות'
        WHEN 'mortgage_step7_2.option.pension' THEN 'פנסיה'
        WHEN 'mortgage_step7_2.option.other' THEN 'אחר'
        WHEN 'mortgage_step7_2.placeholder.additional_income_type' THEN 'בחר סוג הכנסה נוספת'
        WHEN 'mortgage_step7_2.placeholder.monthly_amount' THEN 'הכנס סכום חודשי'
        WHEN 'mortgage_step7_2.placeholder.description' THEN 'הכנס תיאור'
        WHEN 'mortgage_step7_2.button.save' THEN 'שמור'
        WHEN 'mortgage_step7_2.button.cancel' THEN 'ביטול'
        
        -- Section 7.3 Hebrew translations
        WHEN 'mortgage_step7_3.title' THEN 'הוספת התחייבות חוב'
        WHEN 'mortgage_step7_3.label.obligation_type' THEN 'סוג התחייבות'
        WHEN 'mortgage_step7_3.label.bank_name' THEN 'בנק'
        WHEN 'mortgage_step7_3.label.monthly_payment' THEN 'תשלום חודשי'
        WHEN 'mortgage_step7_3.label.remaining_balance' THEN 'יתרת חוב'
        WHEN 'mortgage_step7_3.label.end_date' THEN 'תאריך סיום'
        WHEN 'mortgage_step7_3.option.bank_loan' THEN 'הלוואה בנקאית'
        WHEN 'mortgage_step7_3.option.credit_card' THEN 'כרטיס אשראי'
        WHEN 'mortgage_step7_3.option.consumer_credit' THEN 'אשראי צרכני'
        WHEN 'mortgage_step7_3.option.car_loan' THEN 'הלוואת רכב'
        WHEN 'mortgage_step7_3.option.student_loan' THEN 'הלוואת סטודנט'
        WHEN 'mortgage_step7_3.option.other_debt' THEN 'חוב אחר'
        WHEN 'mortgage_step7_3.option.bank_hapoalim' THEN 'בנק הפועלים'
        WHEN 'mortgage_step7_3.option.bank_leumi' THEN 'בנק לאומי'
        WHEN 'mortgage_step7_3.option.bank_discount' THEN 'בנק דיסקונט'
        WHEN 'mortgage_step7_3.option.bank_mizrahi' THEN 'בנק מזרחי'
        WHEN 'mortgage_step7_3.option.bank_other' THEN 'בנק אחר'
        WHEN 'mortgage_step7_3.placeholder.obligation_type' THEN 'בחר סוג התחייבות'
        WHEN 'mortgage_step7_3.placeholder.bank_name' THEN 'בחר בנק'
        WHEN 'mortgage_step7_3.placeholder.monthly_payment' THEN 'הכנס תשלום חודשי'
        WHEN 'mortgage_step7_3.placeholder.remaining_balance' THEN 'הכנס יתרת חוב'
        WHEN 'mortgage_step7_3.button.save' THEN 'שמור'
        WHEN 'mortgage_step7_3.button.cancel' THEN 'ביטול'
        WHEN 'mortgage_step7_3.button.calculate_remaining' THEN 'חשב יתרה'
        ELSE ci.content_key
    END
FROM content_items ci
WHERE ci.content_key LIKE 'mortgage_step7_%'
  AND ci.page_number IN (7.1, 7.2, 7.3);

-- Add English translations
INSERT INTO content_translations (content_item_id, language_code, content_value)
SELECT 
    ci.id,
    'en' as language_code,
    CASE ci.content_key
        -- Section 7.1 English translations
        WHEN 'mortgage_step7_1.title' THEN 'Add Income Source'
        WHEN 'mortgage_step7_1.label.income_type' THEN 'Income Type'
        WHEN 'mortgage_step7_1.label.monthly_amount' THEN 'Monthly Amount'
        WHEN 'mortgage_step7_1.label.company_name' THEN 'Company Name'
        WHEN 'mortgage_step7_1.label.start_date' THEN 'Start Date'
        WHEN 'mortgage_step7_1.label.field_of_activity' THEN 'Field of Activity'
        WHEN 'mortgage_step7_1.placeholder.income_type' THEN 'Select income type'
        WHEN 'mortgage_step7_1.placeholder.monthly_amount' THEN 'Enter monthly amount'
        WHEN 'mortgage_step7_1.placeholder.company_name' THEN 'Enter company name'
        WHEN 'mortgage_step7_1.button.save' THEN 'Save'
        WHEN 'mortgage_step7_1.button.cancel' THEN 'Cancel'
        
        -- Section 7.2 English translations
        WHEN 'mortgage_step7_2.title' THEN 'Add Additional Income Source'
        WHEN 'mortgage_step7_2.label.additional_income_type' THEN 'Additional Income Type'
        WHEN 'mortgage_step7_2.label.monthly_amount' THEN 'Monthly Amount'
        WHEN 'mortgage_step7_2.label.description' THEN 'Description'
        WHEN 'mortgage_step7_2.option.additional_salary' THEN 'Additional Salary'
        WHEN 'mortgage_step7_2.option.freelance_work' THEN 'Freelance Work'
        WHEN 'mortgage_step7_2.option.property_rental' THEN 'Property Rental'
        WHEN 'mortgage_step7_2.option.investment_income' THEN 'Investment Income'
        WHEN 'mortgage_step7_2.option.pension' THEN 'Pension'
        WHEN 'mortgage_step7_2.option.other' THEN 'Other'
        WHEN 'mortgage_step7_2.placeholder.additional_income_type' THEN 'Select additional income type'
        WHEN 'mortgage_step7_2.placeholder.monthly_amount' THEN 'Enter monthly amount'
        WHEN 'mortgage_step7_2.placeholder.description' THEN 'Enter description'
        WHEN 'mortgage_step7_2.button.save' THEN 'Save'
        WHEN 'mortgage_step7_2.button.cancel' THEN 'Cancel'
        
        -- Section 7.3 English translations
        WHEN 'mortgage_step7_3.title' THEN 'Add Debt Obligation'
        WHEN 'mortgage_step7_3.label.obligation_type' THEN 'Obligation Type'
        WHEN 'mortgage_step7_3.label.bank_name' THEN 'Bank'
        WHEN 'mortgage_step7_3.label.monthly_payment' THEN 'Monthly Payment'
        WHEN 'mortgage_step7_3.label.remaining_balance' THEN 'Remaining Balance'
        WHEN 'mortgage_step7_3.label.end_date' THEN 'End Date'
        WHEN 'mortgage_step7_3.option.bank_loan' THEN 'Bank Loan'
        WHEN 'mortgage_step7_3.option.credit_card' THEN 'Credit Card'
        WHEN 'mortgage_step7_3.option.consumer_credit' THEN 'Consumer Credit'
        WHEN 'mortgage_step7_3.option.car_loan' THEN 'Car Loan'
        WHEN 'mortgage_step7_3.option.student_loan' THEN 'Student Loan'
        WHEN 'mortgage_step7_3.option.other_debt' THEN 'Other Debt'
        WHEN 'mortgage_step7_3.option.bank_hapoalim' THEN 'Bank Hapoalim'
        WHEN 'mortgage_step7_3.option.bank_leumi' THEN 'Bank Leumi'
        WHEN 'mortgage_step7_3.option.bank_discount' THEN 'Discount Bank'
        WHEN 'mortgage_step7_3.option.bank_mizrahi' THEN 'Mizrahi Bank'
        WHEN 'mortgage_step7_3.option.bank_other' THEN 'Other Bank'
        WHEN 'mortgage_step7_3.placeholder.obligation_type' THEN 'Select obligation type'
        WHEN 'mortgage_step7_3.placeholder.bank_name' THEN 'Select bank'
        WHEN 'mortgage_step7_3.placeholder.monthly_payment' THEN 'Enter monthly payment'
        WHEN 'mortgage_step7_3.placeholder.remaining_balance' THEN 'Enter remaining balance'
        WHEN 'mortgage_step7_3.button.save' THEN 'Save'
        WHEN 'mortgage_step7_3.button.cancel' THEN 'Cancel'
        WHEN 'mortgage_step7_3.button.calculate_remaining' THEN 'Calculate Remaining'
        ELSE ci.content_key
    END
FROM content_items ci
WHERE ci.content_key LIKE 'mortgage_step7_%'
  AND ci.page_number IN (7.1, 7.2, 7.3);

-- Update the navigation mapping for proper ordering
UPDATE content_items 
SET page_number = 
    CASE screen_location
        WHEN 'mortgage_phone' THEN 3.0
        WHEN 'mortgage_code_input' THEN 3.1
        WHEN 'mortgage_step2' THEN 4.0  
        WHEN 'mortgage_step3' THEN 5.0  -- Partner personal data
        WHEN 'mortgage_step3' THEN 6.0  -- Partner income (if different screen)
        WHEN 'mortgage_step3' THEN 7.0  -- Employee income form
        ELSE page_number
    END
WHERE screen_location IN ('mortgage_phone', 'mortgage_code_input', 'mortgage_step2', 'mortgage_step3');

-- Verify the additions
SELECT 
    page_number,
    screen_location,
    COUNT(*) as content_count,
    MIN(content_key) as sample_key
FROM content_items 
WHERE page_number IN (7.0, 7.1, 7.2, 7.3)
GROUP BY page_number, screen_location
ORDER BY page_number;