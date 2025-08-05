-- Migration: Add action_count field to content_items table
-- Based on Confluence documentation specifications

-- Step 1: Add action_count column to content_items table
ALTER TABLE content_items 
ADD COLUMN IF NOT EXISTS action_count INTEGER DEFAULT 1;

-- Step 2: Create action count mapping based on Confluence specs
-- Confluence Page 138641552: "4. Контент сайта. Контент-менеджер/Копирайтер. Стр.4 . Действий 8"

-- Step 3: Update action counts for mortgage content based on Confluence documentation
UPDATE content_items 
SET action_count = CASE 
    -- Main page actions (from Confluence)
    WHEN content_key LIKE 'app.main.action.1.%' THEN 3  -- Income source
    WHEN content_key LIKE 'app.main.action.2.%' THEN 4  -- Employment type  
    WHEN content_key LIKE 'app.main.action.3.%' THEN 5  -- Property type
    WHEN content_key LIKE 'app.main.action.4.%' THEN 2  -- Loan purpose
    WHEN content_key LIKE 'app.main.action.5.%' THEN 6  -- Credit history
    WHEN content_key LIKE 'app.main.action.6.%' THEN 3  -- Document type
    WHEN content_key LIKE 'app.main.action.7.%' THEN 4  -- Family status
    WHEN content_key LIKE 'app.main.action.8.%' THEN 5  -- Education level
    WHEN content_key LIKE 'app.main.action.9.%' THEN 3  -- Income stability
    WHEN content_key LIKE 'app.main.action.10.%' THEN 2 -- Bank account
    WHEN content_key LIKE 'app.main.action.11.%' THEN 4 -- Loan term
    WHEN content_key LIKE 'app.main.action.12.%' THEN 3 -- Payment method
    ELSE 1
END
WHERE screen_location = 'main_page';

-- Step 4: Add page-level action counts based on Confluence specifications
-- Insert meta content items for page-level action counts
INSERT INTO content_items (content_key, content_type, category, screen_location, component_type, description, action_count) VALUES
('page.mortgage.calculator', 'text', 'metadata', 'mortgage_calculation', 'page', 'Калькулятор ипотеки', 15),
('page.personal.data.form', 'text', 'metadata', 'mortgage_calculation', 'page', 'Анкета личных данных', 23),
('page.income.form', 'text', 'metadata', 'mortgage_calculation', 'page', 'Анкета доходов. Наемный работник', 22),
('page.income.source.add', 'text', 'metadata', 'mortgage_calculation', 'page', 'Добавление источника дохода', 9),
('page.additional.income.add', 'text', 'metadata', 'mortgage_calculation', 'page', 'Добавление доп источника дохода', 5),
('page.debt.obligation.add', 'text', 'metadata', 'mortgage_calculation', 'page', 'Добавление долгового обязательства', 7),
('page.mortgage.programs', 'text', 'metadata', 'mortgage_calculation', 'page', 'Выбор программ ипотеки', 11),
('page.bank.details.description', 'text', 'metadata', 'mortgage_calculation', 'page', 'Детали банка. Описание', 3),
('page.bank.details.conditions', 'text', 'metadata', 'mortgage_calculation', 'page', 'Детали банка. Условия', 3)
ON CONFLICT (content_key) DO UPDATE SET 
    action_count = EXCLUDED.action_count,
    updated_at = CURRENT_TIMESTAMP;

-- Step 5: Create index for performance
CREATE INDEX IF NOT EXISTS idx_content_items_action_count ON content_items(action_count);

-- Step 6: Update view to include action_count
CREATE OR REPLACE VIEW v_content_by_screen AS
SELECT 
    ci.content_key,
    ci.screen_location,
    ci.component_type,
    ci.category,
    ci.action_count,
    ct.language_code,
    ct.content_value,
    ct.status,
    ci.is_active,
    ci.updated_at
FROM content_items ci
JOIN content_translations ct ON ct.content_item_id = ci.id
WHERE ci.is_active = TRUE 
  AND ct.status = 'approved';

-- Step 7: Add function to get aggregated action counts by page
CREATE OR REPLACE FUNCTION get_page_action_counts()
RETURNS TABLE (
    screen_location VARCHAR(100),
    page_title TEXT,
    total_actions INTEGER,
    last_modified TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ci.screen_location,
        COALESCE(ct.content_value, ci.description) as page_title,
        ci.action_count as total_actions,
        ci.updated_at as last_modified
    FROM content_items ci
    LEFT JOIN content_translations ct ON ci.id = ct.content_item_id AND ct.language_code = 'ru'
    WHERE ci.component_type = 'page' 
      AND ci.is_active = TRUE
    ORDER BY ci.screen_location, ci.action_count DESC;
END;
$$ LANGUAGE plpgsql; 