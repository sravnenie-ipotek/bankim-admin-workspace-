-- Add content items for Borrowers Personal Data Step 1
-- Screen location: borrowers_personal_data_step1
-- This is screen #6 in the mortgage flow - "Анкета партнера. Доходы"

-- First, ensure we're using the correct screen_location from navigation_mapping
-- Screen #6: Анкета партнера. Доходы -> borrowers_personal_data_step1

-- Insert content items for borrowers personal data form
INSERT INTO content_items (content_key, component_type, category, screen_location, description, is_active, page_number, created_at, updated_at)
VALUES 
  -- Page title
  ('borrowers_personal_data_step1.title.main', 'text', 'header', 'borrowers_personal_data_step1', 'Main page title', true, 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  
  -- Privacy notice info alert
  ('borrowers_personal_data_step1.info.privacy_notice', 'text', 'info', 'borrowers_personal_data_step1', 'Privacy policy notice text', true, 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  
  -- Name and Surname field
  ('borrowers_personal_data_step1.label.name_surname', 'label', 'form', 'borrowers_personal_data_step1', 'Full name label', true, 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('borrowers_personal_data_step1.input.name_surname.placeholder', 'placeholder', 'form', 'borrowers_personal_data_step1', 'Full name placeholder', true, 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('borrowers_personal_data_step1.input.name_surname.error', 'text', 'validation', 'borrowers_personal_data_step1', 'Full name validation error', true, 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  
  -- Birthday field
  ('borrowers_personal_data_step1.label.birthday', 'label', 'form', 'borrowers_personal_data_step1', 'Date of birth label', true, 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('borrowers_personal_data_step1.input.birthday.placeholder', 'placeholder', 'form', 'borrowers_personal_data_step1', 'Birthday placeholder', true, 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  
  -- Education dropdown
  ('borrowers_personal_data_step1.label.education', 'label', 'form', 'borrowers_personal_data_step1', 'Education label', true, 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('borrowers_personal_data_step1.dropdown.education.placeholder', 'placeholder', 'form', 'borrowers_personal_data_step1', 'Education placeholder', true, 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('borrowers_personal_data_step1.dropdown.education.option_1', 'dropdown_option', 'form', 'borrowers_personal_data_step1', 'Elementary education', true, 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('borrowers_personal_data_step1.dropdown.education.option_2', 'dropdown_option', 'form', 'borrowers_personal_data_step1', 'High school', true, 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('borrowers_personal_data_step1.dropdown.education.option_3', 'dropdown_option', 'form', 'borrowers_personal_data_step1', 'Bachelor degree', true, 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('borrowers_personal_data_step1.dropdown.education.option_4', 'dropdown_option', 'form', 'borrowers_personal_data_step1', 'Master degree', true, 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('borrowers_personal_data_step1.dropdown.education.option_5', 'dropdown_option', 'form', 'borrowers_personal_data_step1', 'Doctorate', true, 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  
  -- Additional citizenship question
  ('borrowers_personal_data_step1.label.additional_citizenships', 'label', 'form', 'borrowers_personal_data_step1', 'Additional citizenship label', true, 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('borrowers_personal_data_step1.radio.additional_citizenships.yes', 'radio_option', 'form', 'borrowers_personal_data_step1', 'Yes option', true, 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('borrowers_personal_data_step1.radio.additional_citizenships.no', 'radio_option', 'form', 'borrowers_personal_data_step1', 'No option', true, 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  
  -- Tax payment question
  ('borrowers_personal_data_step1.label.taxes', 'label', 'form', 'borrowers_personal_data_step1', 'Foreign tax liability label', true, 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('borrowers_personal_data_step1.radio.taxes.yes', 'radio_option', 'form', 'borrowers_personal_data_step1', 'Yes option for taxes', true, 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('borrowers_personal_data_step1.radio.taxes.no', 'radio_option', 'form', 'borrowers_personal_data_step1', 'No option for taxes', true, 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  
  -- Children question
  ('borrowers_personal_data_step1.label.childrens', 'label', 'form', 'borrowers_personal_data_step1', 'Children under 18 label', true, 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('borrowers_personal_data_step1.input.childrens.placeholder', 'placeholder', 'form', 'borrowers_personal_data_step1', 'Number of children placeholder', true, 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  
  -- Medical insurance question
  ('borrowers_personal_data_step1.label.medical_insurance', 'label', 'form', 'borrowers_personal_data_step1', 'Medical insurance label', true, 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('borrowers_personal_data_step1.radio.medical_insurance.yes', 'radio_option', 'form', 'borrowers_personal_data_step1', 'Yes for medical insurance', true, 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('borrowers_personal_data_step1.radio.medical_insurance.no', 'radio_option', 'form', 'borrowers_personal_data_step1', 'No for medical insurance', true, 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  
  -- Foreign resident question
  ('borrowers_personal_data_step1.label.is_foreigner', 'label', 'form', 'borrowers_personal_data_step1', 'Foreign resident label', true, 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('borrowers_personal_data_step1.radio.is_foreigner.yes', 'radio_option', 'form', 'borrowers_personal_data_step1', 'Yes for foreign resident', true, 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('borrowers_personal_data_step1.radio.is_foreigner.no', 'radio_option', 'form', 'borrowers_personal_data_step1', 'No for foreign resident', true, 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  
  -- Public person question
  ('borrowers_personal_data_step1.label.public_person', 'label', 'form', 'borrowers_personal_data_step1', 'Public office holder label', true, 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('borrowers_personal_data_step1.radio.public_person.yes', 'radio_option', 'form', 'borrowers_personal_data_step1', 'Yes for public person', true, 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('borrowers_personal_data_step1.radio.public_person.no', 'radio_option', 'form', 'borrowers_personal_data_step1', 'No for public person', true, 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  
  -- Continue button
  ('borrowers_personal_data_step1.button.continue', 'button', 'action', 'borrowers_personal_data_step1', 'Continue button text', true, 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  
  -- Back button
  ('borrowers_personal_data_step1.button.back', 'button', 'navigation', 'borrowers_personal_data_step1', 'Back button text', true, 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (content_key) DO UPDATE 
SET 
  screen_location = EXCLUDED.screen_location,
  component_type = EXCLUDED.component_type,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active,
  updated_at = CURRENT_TIMESTAMP;

-- Now insert translations for each content item - Russian
INSERT INTO content_translations (content_item_id, language_code, content_value, created_at, updated_at)
SELECT 
  ci.id,
  'ru',
  CASE ci.content_key
    WHEN 'borrowers_personal_data_step1.title.main' THEN 'Личные данные заемщиков'
    WHEN 'borrowers_personal_data_step1.info.privacy_notice' THEN 'Ваши личные данные защищены в соответствии с политикой конфиденциальности'
    WHEN 'borrowers_personal_data_step1.label.name_surname' THEN 'Имя и фамилия'
    WHEN 'borrowers_personal_data_step1.input.name_surname.placeholder' THEN 'Введите полное имя'
    WHEN 'borrowers_personal_data_step1.input.name_surname.error' THEN 'Пожалуйста, введите имя и фамилию'
    WHEN 'borrowers_personal_data_step1.label.birthday' THEN 'Дата рождения'
    WHEN 'borrowers_personal_data_step1.input.birthday.placeholder' THEN 'ДД.ММ.ГГГГ'
    WHEN 'borrowers_personal_data_step1.label.education' THEN 'Образование'
    WHEN 'borrowers_personal_data_step1.dropdown.education.placeholder' THEN 'Выберите уровень образования'
    WHEN 'borrowers_personal_data_step1.dropdown.education.option_1' THEN 'Начальное'
    WHEN 'borrowers_personal_data_step1.dropdown.education.option_2' THEN 'Среднее'
    WHEN 'borrowers_personal_data_step1.dropdown.education.option_3' THEN 'Бакалавр'
    WHEN 'borrowers_personal_data_step1.dropdown.education.option_4' THEN 'Магистр'
    WHEN 'borrowers_personal_data_step1.dropdown.education.option_5' THEN 'Доктор наук'
    WHEN 'borrowers_personal_data_step1.label.additional_citizenships' THEN 'У вас есть дополнительное гражданство?'
    WHEN 'borrowers_personal_data_step1.radio.additional_citizenships.yes' THEN 'Да'
    WHEN 'borrowers_personal_data_step1.radio.additional_citizenships.no' THEN 'Нет'
    WHEN 'borrowers_personal_data_step1.label.taxes' THEN 'Вы обязаны платить налоги в зарубежных странах?'
    WHEN 'borrowers_personal_data_step1.radio.taxes.yes' THEN 'Да'
    WHEN 'borrowers_personal_data_step1.radio.taxes.no' THEN 'Нет'
    WHEN 'borrowers_personal_data_step1.label.childrens' THEN 'Дети до 18 лет'
    WHEN 'borrowers_personal_data_step1.input.childrens.placeholder' THEN 'Количество детей'
    WHEN 'borrowers_personal_data_step1.label.medical_insurance' THEN 'У вас есть действующая медицинская страховка?'
    WHEN 'borrowers_personal_data_step1.radio.medical_insurance.yes' THEN 'Да'
    WHEN 'borrowers_personal_data_step1.radio.medical_insurance.no' THEN 'Нет'
    WHEN 'borrowers_personal_data_step1.label.is_foreigner' THEN 'Вы считаетесь иностранным резидентом?'
    WHEN 'borrowers_personal_data_step1.radio.is_foreigner.yes' THEN 'Да'
    WHEN 'borrowers_personal_data_step1.radio.is_foreigner.no' THEN 'Нет'
    WHEN 'borrowers_personal_data_step1.label.public_person' THEN 'Вы занимаете высокую государственную должность?'
    WHEN 'borrowers_personal_data_step1.radio.public_person.yes' THEN 'Да'
    WHEN 'borrowers_personal_data_step1.radio.public_person.no' THEN 'Нет'
    WHEN 'borrowers_personal_data_step1.button.continue' THEN 'Продолжить'
    WHEN 'borrowers_personal_data_step1.button.back' THEN 'Назад'
  END,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM content_items ci
WHERE ci.screen_location = 'borrowers_personal_data_step1'
ON CONFLICT (content_item_id, language_code) DO UPDATE 
SET 
  content_value = EXCLUDED.content_value,
  updated_at = CURRENT_TIMESTAMP;

-- Hebrew translations
INSERT INTO content_translations (content_item_id, language_code, content_value, created_at, updated_at)
SELECT 
  ci.id,
  'he',
  CASE ci.content_key
    WHEN 'borrowers_personal_data_step1.title.main' THEN 'פרטים אישיים של הלווים'
    WHEN 'borrowers_personal_data_step1.info.privacy_notice' THEN 'הפרטים האישיים שלך מוגנים בהתאם למדיניות הפרטיות'
    WHEN 'borrowers_personal_data_step1.label.name_surname' THEN 'שם פרטי ושם משפחה'
    WHEN 'borrowers_personal_data_step1.input.name_surname.placeholder' THEN 'הזן שם מלא'
    WHEN 'borrowers_personal_data_step1.input.name_surname.error' THEN 'אנא הזן שם פרטי ושם משפחה'
    WHEN 'borrowers_personal_data_step1.label.birthday' THEN 'תאריך לידה'
    WHEN 'borrowers_personal_data_step1.input.birthday.placeholder' THEN 'יום.חודש.שנה'
    WHEN 'borrowers_personal_data_step1.label.education' THEN 'השכלה'
    WHEN 'borrowers_personal_data_step1.dropdown.education.placeholder' THEN 'בחר רמת השכלה'
    WHEN 'borrowers_personal_data_step1.dropdown.education.option_1' THEN 'יסודית'
    WHEN 'borrowers_personal_data_step1.dropdown.education.option_2' THEN 'תיכונית'
    WHEN 'borrowers_personal_data_step1.dropdown.education.option_3' THEN 'תואר ראשון'
    WHEN 'borrowers_personal_data_step1.dropdown.education.option_4' THEN 'תואר שני'
    WHEN 'borrowers_personal_data_step1.dropdown.education.option_5' THEN 'דוקטורט'
    WHEN 'borrowers_personal_data_step1.label.additional_citizenships' THEN 'האם יש לך אזרחות נוספת?'
    WHEN 'borrowers_personal_data_step1.radio.additional_citizenships.yes' THEN 'כן'
    WHEN 'borrowers_personal_data_step1.radio.additional_citizenships.no' THEN 'לא'
    WHEN 'borrowers_personal_data_step1.label.taxes' THEN 'האם אתה חייב במס במדינות זרות?'
    WHEN 'borrowers_personal_data_step1.radio.taxes.yes' THEN 'כן'
    WHEN 'borrowers_personal_data_step1.radio.taxes.no' THEN 'לא'
    WHEN 'borrowers_personal_data_step1.label.childrens' THEN 'ילדים מתחת לגיל 18'
    WHEN 'borrowers_personal_data_step1.input.childrens.placeholder' THEN 'מספר ילדים'
    WHEN 'borrowers_personal_data_step1.label.medical_insurance' THEN 'האם יש לך ביטוח בריאות בתוקף?'
    WHEN 'borrowers_personal_data_step1.radio.medical_insurance.yes' THEN 'כן'
    WHEN 'borrowers_personal_data_step1.radio.medical_insurance.no' THEN 'לא'
    WHEN 'borrowers_personal_data_step1.label.is_foreigner' THEN 'האם אתה נחשב תושב זר?'
    WHEN 'borrowers_personal_data_step1.radio.is_foreigner.yes' THEN 'כן'
    WHEN 'borrowers_personal_data_step1.radio.is_foreigner.no' THEN 'לא'
    WHEN 'borrowers_personal_data_step1.label.public_person' THEN 'האם אתה מכהן בתפקיד ציבורי בכיר?'
    WHEN 'borrowers_personal_data_step1.radio.public_person.yes' THEN 'כן'
    WHEN 'borrowers_personal_data_step1.radio.public_person.no' THEN 'לא'
    WHEN 'borrowers_personal_data_step1.button.continue' THEN 'המשך'
    WHEN 'borrowers_personal_data_step1.button.back' THEN 'חזור'
  END,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM content_items ci
WHERE ci.screen_location = 'borrowers_personal_data_step1'
ON CONFLICT (content_item_id, language_code) DO UPDATE 
SET 
  content_value = EXCLUDED.content_value,
  updated_at = CURRENT_TIMESTAMP;

-- English translations
INSERT INTO content_translations (content_item_id, language_code, content_value, created_at, updated_at)
SELECT 
  ci.id,
  'en',
  CASE ci.content_key
    WHEN 'borrowers_personal_data_step1.title.main' THEN 'Personal Details of Borrowers'
    WHEN 'borrowers_personal_data_step1.info.privacy_notice' THEN 'Your personal data is protected according to our privacy policy'
    WHEN 'borrowers_personal_data_step1.label.name_surname' THEN 'Name and Surname'
    WHEN 'borrowers_personal_data_step1.input.name_surname.placeholder' THEN 'Enter your full name'
    WHEN 'borrowers_personal_data_step1.input.name_surname.error' THEN 'Please enter name and surname'
    WHEN 'borrowers_personal_data_step1.label.birthday' THEN 'Date of Birth'
    WHEN 'borrowers_personal_data_step1.input.birthday.placeholder' THEN 'DD.MM.YYYY'
    WHEN 'borrowers_personal_data_step1.label.education' THEN 'Education'
    WHEN 'borrowers_personal_data_step1.dropdown.education.placeholder' THEN 'Select education level'
    WHEN 'borrowers_personal_data_step1.dropdown.education.option_1' THEN 'Elementary'
    WHEN 'borrowers_personal_data_step1.dropdown.education.option_2' THEN 'High School'
    WHEN 'borrowers_personal_data_step1.dropdown.education.option_3' THEN 'Bachelor Degree'
    WHEN 'borrowers_personal_data_step1.dropdown.education.option_4' THEN 'Master Degree'
    WHEN 'borrowers_personal_data_step1.dropdown.education.option_5' THEN 'Doctorate'
    WHEN 'borrowers_personal_data_step1.label.additional_citizenships' THEN 'Do you have additional citizenship?'
    WHEN 'borrowers_personal_data_step1.radio.additional_citizenships.yes' THEN 'Yes'
    WHEN 'borrowers_personal_data_step1.radio.additional_citizenships.no' THEN 'No'
    WHEN 'borrowers_personal_data_step1.label.taxes' THEN 'Are you liable for tax in foreign countries?'
    WHEN 'borrowers_personal_data_step1.radio.taxes.yes' THEN 'Yes'
    WHEN 'borrowers_personal_data_step1.radio.taxes.no' THEN 'No'
    WHEN 'borrowers_personal_data_step1.label.childrens' THEN 'Children under 18'
    WHEN 'borrowers_personal_data_step1.input.childrens.placeholder' THEN 'Number of children'
    WHEN 'borrowers_personal_data_step1.label.medical_insurance' THEN 'Are you covered by valid health insurance?'
    WHEN 'borrowers_personal_data_step1.radio.medical_insurance.yes' THEN 'Yes'
    WHEN 'borrowers_personal_data_step1.radio.medical_insurance.no' THEN 'No'
    WHEN 'borrowers_personal_data_step1.label.is_foreigner' THEN 'Are you considered a foreign resident?'
    WHEN 'borrowers_personal_data_step1.radio.is_foreigner.yes' THEN 'Yes'
    WHEN 'borrowers_personal_data_step1.radio.is_foreigner.no' THEN 'No'
    WHEN 'borrowers_personal_data_step1.label.public_person' THEN 'Are you holding a senior public office?'
    WHEN 'borrowers_personal_data_step1.radio.public_person.yes' THEN 'Yes'
    WHEN 'borrowers_personal_data_step1.radio.public_person.no' THEN 'No'
    WHEN 'borrowers_personal_data_step1.button.continue' THEN 'Continue'
    WHEN 'borrowers_personal_data_step1.button.back' THEN 'Back'
  END,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM content_items ci
WHERE ci.screen_location = 'borrowers_personal_data_step1'
ON CONFLICT (content_item_id, language_code) DO UPDATE 
SET 
  content_value = EXCLUDED.content_value,
  updated_at = CURRENT_TIMESTAMP;

-- Verify the data was inserted
SELECT 
  nm.confluence_num,
  nm.confluence_title_ru,
  nm.screen_location,
  nm.sort_order,
  COUNT(ci.id) as content_items_count
FROM navigation_mapping nm
LEFT JOIN content_items ci ON ci.screen_location = nm.screen_location AND ci.is_active = true
WHERE nm.confluence_num = '6'
GROUP BY nm.confluence_num, nm.confluence_title_ru, nm.screen_location, nm.sort_order;

-- Show sample content items
SELECT 
  ci.content_key,
  ci.component_type,
  ct.content_value as russian_content
FROM content_items ci
LEFT JOIN content_translations ct ON ci.id = ct.content_item_id AND ct.language_code = 'ru'
WHERE ci.screen_location = 'borrowers_personal_data_step1'
ORDER BY ci.content_key
LIMIT 10;