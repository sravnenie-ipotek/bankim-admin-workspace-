-- Insert sample mortgage calculation content items
INSERT INTO content_items (content_key, component_type, category, screen_location, description, is_active)
VALUES 
  ('mortgage.title', 'text', 'headers', 'mortgage_calculation', 'Main title for mortgage calculation page', true),
  ('mortgage.subtitle', 'text', 'headers', 'mortgage_calculation', 'Subtitle for mortgage calculation page', true),
  ('mortgage.loan_amount', 'input', 'forms', 'mortgage_calculation', 'Loan amount input field', true),
  ('mortgage.interest_rate', 'input', 'forms', 'mortgage_calculation', 'Interest rate input field', true),
  ('mortgage.loan_term', 'dropdown', 'forms', 'mortgage_calculation', 'Loan term selection dropdown', true),
  ('mortgage.calculate_button', 'button', 'actions', 'mortgage_calculation', 'Calculate mortgage button', true),
  ('mortgage.monthly_payment', 'text', 'results', 'mortgage_calculation', 'Monthly payment result display', true)
ON CONFLICT (content_key) DO UPDATE 
SET updated_at = CURRENT_TIMESTAMP;

-- Get the IDs of the inserted items
WITH item_ids AS (
  SELECT id, content_key FROM content_items 
  WHERE screen_location = 'mortgage_calculation'
)
-- Insert translations for each content item
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT 
  id,
  lang.code,
  CASE 
    WHEN content_key = 'mortgage.title' THEN
      CASE lang.code
        WHEN 'ru' THEN 'Калькулятор ипотеки'
        WHEN 'he' THEN 'מחשבון משכנתא'
        WHEN 'en' THEN 'Mortgage Calculator'
      END
    WHEN content_key = 'mortgage.subtitle' THEN
      CASE lang.code
        WHEN 'ru' THEN 'Рассчитайте ваши ежемесячные платежи'
        WHEN 'he' THEN 'חשב את התשלומים החודשיים שלך'
        WHEN 'en' THEN 'Calculate your monthly payments'
      END
    WHEN content_key = 'mortgage.loan_amount' THEN
      CASE lang.code
        WHEN 'ru' THEN 'Сумма кредита'
        WHEN 'he' THEN 'סכום ההלוואה'
        WHEN 'en' THEN 'Loan Amount'
      END
    WHEN content_key = 'mortgage.interest_rate' THEN
      CASE lang.code
        WHEN 'ru' THEN 'Процентная ставка'
        WHEN 'he' THEN 'ריבית'
        WHEN 'en' THEN 'Interest Rate'
      END
    WHEN content_key = 'mortgage.loan_term' THEN
      CASE lang.code
        WHEN 'ru' THEN 'Срок кредита'
        WHEN 'he' THEN 'תקופת ההלוואה'
        WHEN 'en' THEN 'Loan Term'
      END
    WHEN content_key = 'mortgage.calculate_button' THEN
      CASE lang.code
        WHEN 'ru' THEN 'Рассчитать'
        WHEN 'he' THEN 'חשב'
        WHEN 'en' THEN 'Calculate'
      END
    WHEN content_key = 'mortgage.monthly_payment' THEN
      CASE lang.code
        WHEN 'ru' THEN 'Ежемесячный платеж'
        WHEN 'he' THEN 'תשלום חודשי'
        WHEN 'en' THEN 'Monthly Payment'
      END
  END,
  'approved'
FROM item_ids
CROSS JOIN languages lang
WHERE lang.is_active = true
ON CONFLICT (content_item_id, language_code) DO UPDATE 
SET content_value = EXCLUDED.content_value,
    status = EXCLUDED.status,
    updated_at = CURRENT_TIMESTAMP;