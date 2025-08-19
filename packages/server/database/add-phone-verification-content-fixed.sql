-- Add phone verification modal content items
-- This modal appears after mortgage calculator (screen 2) when user proceeds
-- Screen location: mortgage_phone (based on navigation_mapping table)

-- First, ensure we're using the correct screen_location from navigation_mapping
-- Screen #3: Ввод номера телефона -> mortgage_phone

-- Insert content items for phone verification modal
INSERT INTO content_items (content_key, component_type, category, screen_location, description, is_active, page_number, created_at, updated_at)
VALUES 
  -- Modal title
  ('phone_verification_modal.title.enter_phone', 'text', 'modal', 'mortgage_phone', 'Modal title - Enter phone number', true, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  
  -- Sub-heading  
  ('phone_verification_modal.subtitle.receive_offers', 'text', 'modal', 'mortgage_phone', 'Subtitle - To receive offers from banks', true, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  
  -- Description text
  ('phone_verification_modal.description.personalized_offers', 'text', 'modal', 'mortgage_phone', 'Description - Personalized offers explanation', true, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  
  -- Full name input placeholder
  ('phone_verification_modal.input.full_name.placeholder', 'placeholder', 'form', 'mortgage_phone', 'Full name input placeholder', true, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  
  -- Full name input label
  ('phone_verification_modal.input.full_name.label', 'label', 'form', 'mortgage_phone', 'Full name input label', true, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  
  -- Phone number input placeholder
  ('phone_verification_modal.input.phone_number.placeholder', 'placeholder', 'form', 'mortgage_phone', 'Phone number input placeholder', true, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  
  -- Phone number input label
  ('phone_verification_modal.input.phone_number.label', 'label', 'form', 'mortgage_phone', 'Phone number input label', true, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  
  -- Country code display
  ('phone_verification_modal.display.country_code', 'text', 'form', 'mortgage_phone', 'Country code display +972', true, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  
  -- Legal disclaimer/terms text
  ('phone_verification_modal.legal.accept_terms', 'text', 'legal', 'mortgage_phone', 'Legal terms acceptance text', true, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  
  -- Continue button
  ('phone_verification_modal.button.continue', 'button', 'action', 'mortgage_phone', 'Continue button text', true, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  
  -- Existing customer link
  ('phone_verification_modal.link.existing_customer', 'link', 'navigation', 'mortgage_phone', 'Link for existing customers', true, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  
  -- Close button tooltip
  ('phone_verification_modal.button.close', 'button', 'action', 'mortgage_phone', 'Close modal button', true, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
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
    WHEN 'phone_verification_modal.title.enter_phone' THEN 'Введите ваш номер телефона'
    WHEN 'phone_verification_modal.subtitle.receive_offers' THEN 'Чтобы получить предложения от банков'
    WHEN 'phone_verification_modal.description.personalized_offers' THEN 'Вы можете использовать свой номер телефона для получения персонализированных предложений'
    WHEN 'phone_verification_modal.input.full_name.placeholder' THEN 'Полное имя'
    WHEN 'phone_verification_modal.input.full_name.label' THEN 'Имя'
    WHEN 'phone_verification_modal.input.phone_number.placeholder' THEN 'Номер телефона'
    WHEN 'phone_verification_modal.input.phone_number.label' THEN 'Мобильный телефон'
    WHEN 'phone_verification_modal.display.country_code' THEN '+972'
    WHEN 'phone_verification_modal.legal.accept_terms' THEN 'Нажимая "Продолжить", я принимаю пользовательское соглашение и политику конфиденциальности'
    WHEN 'phone_verification_modal.button.continue' THEN 'Продолжить'
    WHEN 'phone_verification_modal.link.existing_customer' THEN 'Уже клиент? Войти здесь'
    WHEN 'phone_verification_modal.button.close' THEN 'Закрыть'
  END,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM content_items ci
WHERE ci.screen_location = 'mortgage_phone'
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
    WHEN 'phone_verification_modal.title.enter_phone' THEN 'הזן את מספר הטלפון הנייד שלך'
    WHEN 'phone_verification_modal.subtitle.receive_offers' THEN 'כדי לקבל הצעות מבנקים'
    WHEN 'phone_verification_modal.description.personalized_offers' THEN 'אתה יכול להשתמש במספר הטלפון שלך כדי לקבל הצעות מותאמות אישית'
    WHEN 'phone_verification_modal.input.full_name.placeholder' THEN 'שם מלא'
    WHEN 'phone_verification_modal.input.full_name.label' THEN 'שם'
    WHEN 'phone_verification_modal.input.phone_number.placeholder' THEN 'מספר טלפון'
    WHEN 'phone_verification_modal.input.phone_number.label' THEN 'טלפון נייד'
    WHEN 'phone_verification_modal.display.country_code' THEN '+972'
    WHEN 'phone_verification_modal.legal.accept_terms' THEN 'בלחיצה על "המשך" אני מקבל את הסכם המשתמש ומדיניות פרטיות'
    WHEN 'phone_verification_modal.button.continue' THEN 'המשך'
    WHEN 'phone_verification_modal.link.existing_customer' THEN 'כבר לקוח? בוא כאן'
    WHEN 'phone_verification_modal.button.close' THEN 'סגור'
  END,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM content_items ci
WHERE ci.screen_location = 'mortgage_phone'
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
    WHEN 'phone_verification_modal.title.enter_phone' THEN 'Enter your mobile phone number'
    WHEN 'phone_verification_modal.subtitle.receive_offers' THEN 'To receive offers from banks'
    WHEN 'phone_verification_modal.description.personalized_offers' THEN 'You can use your phone number to receive personalized offers'
    WHEN 'phone_verification_modal.input.full_name.placeholder' THEN 'Full Name'
    WHEN 'phone_verification_modal.input.full_name.label' THEN 'Name'
    WHEN 'phone_verification_modal.input.phone_number.placeholder' THEN 'Phone Number'
    WHEN 'phone_verification_modal.input.phone_number.label' THEN 'Mobile Phone'
    WHEN 'phone_verification_modal.display.country_code' THEN '+972'
    WHEN 'phone_verification_modal.legal.accept_terms' THEN 'By clicking "Continue" I accept the user agreement and privacy policy'
    WHEN 'phone_verification_modal.button.continue' THEN 'Continue'
    WHEN 'phone_verification_modal.link.existing_customer' THEN 'Already a customer? Sign in here'
    WHEN 'phone_verification_modal.button.close' THEN 'Close'
  END,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM content_items ci
WHERE ci.screen_location = 'mortgage_phone'
ON CONFLICT (content_item_id, language_code) DO UPDATE 
SET 
  content_value = EXCLUDED.content_value,
  updated_at = CURRENT_TIMESTAMP;

-- Add content for screen 3.1 (Code input) as well
INSERT INTO content_items (content_key, component_type, category, screen_location, description, is_active, page_number, created_at, updated_at)
VALUES 
  -- Modal title for code verification
  ('code_verification_modal.title.enter_code', 'text', 'modal', 'mortgage_code_input', 'Modal title - Enter verification code', true, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  
  -- Instructions text
  ('code_verification_modal.instruction.sms_sent', 'text', 'modal', 'mortgage_code_input', 'SMS sent instruction', true, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  
  -- Code input fields (usually 4-6 digits)
  ('code_verification_modal.input.code', 'input', 'form', 'mortgage_code_input', 'Verification code input', true, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  
  -- Resend code link
  ('code_verification_modal.link.resend_code', 'link', 'action', 'mortgage_code_input', 'Resend verification code', true, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  
  -- Timer text
  ('code_verification_modal.text.timer', 'text', 'info', 'mortgage_code_input', 'Resend timer text', true, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  
  -- Verify button
  ('code_verification_modal.button.verify', 'button', 'action', 'mortgage_code_input', 'Verify code button', true, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  
  -- Back button
  ('code_verification_modal.button.back', 'button', 'navigation', 'mortgage_code_input', 'Back to phone input', true, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (content_key) DO UPDATE 
SET 
  screen_location = EXCLUDED.screen_location,
  component_type = EXCLUDED.component_type,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active,
  updated_at = CURRENT_TIMESTAMP;

-- Insert translations for code verification screen - Russian
INSERT INTO content_translations (content_item_id, language_code, content_value, created_at, updated_at)
SELECT 
  ci.id,
  'ru',
  CASE ci.content_key
    WHEN 'code_verification_modal.title.enter_code' THEN 'Введите код подтверждения'
    WHEN 'code_verification_modal.instruction.sms_sent' THEN 'Мы отправили SMS с кодом на ваш номер'
    WHEN 'code_verification_modal.input.code' THEN 'Код'
    WHEN 'code_verification_modal.link.resend_code' THEN 'Отправить код повторно'
    WHEN 'code_verification_modal.text.timer' THEN 'Повторная отправка через'
    WHEN 'code_verification_modal.button.verify' THEN 'Подтвердить'
    WHEN 'code_verification_modal.button.back' THEN 'Назад'
  END,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM content_items ci
WHERE ci.screen_location = 'mortgage_code_input'
ON CONFLICT (content_item_id, language_code) DO UPDATE 
SET 
  content_value = EXCLUDED.content_value,
  updated_at = CURRENT_TIMESTAMP;

-- Hebrew translations for code verification
INSERT INTO content_translations (content_item_id, language_code, content_value, created_at, updated_at)
SELECT 
  ci.id,
  'he',
  CASE ci.content_key
    WHEN 'code_verification_modal.title.enter_code' THEN 'הזן קוד אימות'
    WHEN 'code_verification_modal.instruction.sms_sent' THEN 'שלחנו SMS עם קוד למספר שלך'
    WHEN 'code_verification_modal.input.code' THEN 'קוד'
    WHEN 'code_verification_modal.link.resend_code' THEN 'שלח קוד שוב'
    WHEN 'code_verification_modal.text.timer' THEN 'שליחה חוזרת בעוד'
    WHEN 'code_verification_modal.button.verify' THEN 'אמת'
    WHEN 'code_verification_modal.button.back' THEN 'חזור'
  END,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM content_items ci
WHERE ci.screen_location = 'mortgage_code_input'
ON CONFLICT (content_item_id, language_code) DO UPDATE 
SET 
  content_value = EXCLUDED.content_value,
  updated_at = CURRENT_TIMESTAMP;

-- English translations for code verification
INSERT INTO content_translations (content_item_id, language_code, content_value, created_at, updated_at)
SELECT 
  ci.id,
  'en',
  CASE ci.content_key
    WHEN 'code_verification_modal.title.enter_code' THEN 'Enter verification code'
    WHEN 'code_verification_modal.instruction.sms_sent' THEN 'We sent an SMS with a code to your number'
    WHEN 'code_verification_modal.input.code' THEN 'Code'
    WHEN 'code_verification_modal.link.resend_code' THEN 'Resend code'
    WHEN 'code_verification_modal.text.timer' THEN 'Resend in'
    WHEN 'code_verification_modal.button.verify' THEN 'Verify'
    WHEN 'code_verification_modal.button.back' THEN 'Back'
  END,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM content_items ci
WHERE ci.screen_location = 'mortgage_code_input'
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
WHERE nm.parent_section = '3.1'
  AND nm.confluence_num IN ('3', '3.1')
GROUP BY nm.confluence_num, nm.confluence_title_ru, nm.screen_location, nm.sort_order
ORDER BY nm.sort_order;