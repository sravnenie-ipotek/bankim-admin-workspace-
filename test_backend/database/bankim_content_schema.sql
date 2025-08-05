-- bankim_content Database Schema
-- Content Management Database for BankIM Management Portal
-- Based on contentMenuConsumeInstructions.md specifications

-- =================================================================
-- 1. LANGUAGES TABLE
-- =================================================================
CREATE TABLE IF NOT EXISTS languages (
    id SERIAL PRIMARY KEY,
    code VARCHAR(10) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    native_name VARCHAR(100) NOT NULL,
    direction VARCHAR(3) CHECK (direction IN ('ltr', 'rtl')) DEFAULT 'ltr',
    is_active BOOLEAN DEFAULT TRUE,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert supported languages
INSERT INTO languages (code, name, native_name, direction, is_active, is_default) VALUES
('ru', 'Russian', 'Русский', 'ltr', TRUE, TRUE),
('he', 'Hebrew', 'עברית', 'rtl', TRUE, FALSE),
('en', 'English', 'English', 'ltr', TRUE, FALSE)
ON CONFLICT (code) DO NOTHING;

-- =================================================================
-- 2. CONTENT CATEGORIES TABLE
-- =================================================================
CREATE TABLE IF NOT EXISTS content_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    parent_id INTEGER REFERENCES content_categories(id),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert categories based on ContentPage categories
INSERT INTO content_categories (name, display_name, description, sort_order) VALUES
('dropdowns', 'Dropdown Elements', 'Dropdown menu options and selectors', 1),
('titles', 'Page Titles', 'Page and section titles', 2),
('labels', 'Form Labels', 'Form field labels and descriptions', 3),
('buttons', 'Button Text', 'Button labels and call-to-action text', 4),
('headers', 'Headers', 'Page headers and navigation elements', 5),
('metadata', 'Metadata', 'Page metadata and configuration', 6)
ON CONFLICT (name) DO NOTHING;

-- =================================================================
-- 3. CONTENT ITEMS TABLE  
-- =================================================================
CREATE TABLE IF NOT EXISTS content_items (
    id BIGSERIAL PRIMARY KEY,
    content_key VARCHAR(255) NOT NULL UNIQUE,
    content_type VARCHAR(20) CHECK (content_type IN ('text', 'html', 'markdown', 'json')) DEFAULT 'text',
    category VARCHAR(100) REFERENCES content_categories(name) ON UPDATE CASCADE,
    screen_location VARCHAR(100) NOT NULL,
    component_type VARCHAR(50) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_content_items_screen_location ON content_items(screen_location);
CREATE INDEX IF NOT EXISTS idx_content_items_category ON content_items(category);
CREATE INDEX IF NOT EXISTS idx_content_items_component_type ON content_items(component_type);
CREATE INDEX IF NOT EXISTS idx_content_items_active ON content_items(is_active) WHERE is_active = TRUE;

-- =================================================================
-- 4. CONTENT TRANSLATIONS TABLE
-- =================================================================
CREATE TABLE IF NOT EXISTS content_translations (
    id BIGSERIAL PRIMARY KEY,
    content_item_id BIGINT NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
    language_code VARCHAR(10) NOT NULL REFERENCES languages(code) ON UPDATE CASCADE,
    content_value TEXT NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) CHECK (status IN ('draft', 'review', 'approved', 'archived')) DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(content_item_id, language_code)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_content_translations_item_id ON content_translations(content_item_id);
CREATE INDEX IF NOT EXISTS idx_content_translations_language ON content_translations(language_code);
CREATE INDEX IF NOT EXISTS idx_content_translations_status ON content_translations(status);
CREATE INDEX IF NOT EXISTS idx_content_translations_approved ON content_translations(status, language_code) WHERE status = 'approved';

-- =================================================================
-- 5. TRIGGERS FOR UPDATED_AT
-- =================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables
CREATE TRIGGER update_languages_updated_at BEFORE UPDATE ON languages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_content_categories_updated_at BEFORE UPDATE ON content_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_content_items_updated_at BEFORE UPDATE ON content_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_content_translations_updated_at BEFORE UPDATE ON content_translations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =================================================================
-- 6. VALIDATION CONSTRAINTS
-- =================================================================

-- Ensure exactly one default language
CREATE UNIQUE INDEX IF NOT EXISTS idx_languages_single_default 
ON languages(is_default) WHERE is_default = TRUE;

-- Ensure exactly one default translation per content item
CREATE UNIQUE INDEX IF NOT EXISTS idx_content_translations_single_default 
ON content_translations(content_item_id) WHERE is_default = TRUE;

-- =================================================================
-- 7. SAMPLE DATA FOR MAIN PAGE CONTENT
-- =================================================================

-- Main page dropdown content items
INSERT INTO content_items (content_key, content_type, category, screen_location, component_type, description) VALUES
('app.main.action.1.dropdown.income_source', 'text', 'dropdowns', 'main_page', 'dropdown', 'Primary income source dropdown action 1'),
('app.main.action.2.dropdown.employment_type', 'text', 'dropdowns', 'main_page', 'dropdown', 'Employment type dropdown action 2'),
('app.main.action.3.dropdown.property_type', 'text', 'dropdowns', 'main_page', 'dropdown', 'Property type dropdown action 3'),
('app.main.action.4.dropdown.loan_purpose', 'text', 'dropdowns', 'main_page', 'dropdown', 'Loan purpose dropdown action 4'),
('app.main.action.5.dropdown.credit_history', 'text', 'dropdowns', 'main_page', 'dropdown', 'Credit history dropdown action 5'),
('app.main.action.6.dropdown.document_type', 'text', 'dropdowns', 'main_page', 'dropdown', 'Document type dropdown action 6'),
('app.main.action.7.dropdown.family_status', 'text', 'dropdowns', 'main_page', 'dropdown', 'Family status dropdown action 7'),
('app.main.action.8.dropdown.education_level', 'text', 'dropdowns', 'main_page', 'dropdown', 'Education level dropdown action 8')
ON CONFLICT (content_key) DO NOTHING;

-- Page metadata
INSERT INTO content_items (content_key, content_type, category, screen_location, component_type, description) VALUES
('app.main.page.title', 'text', 'titles', 'main_page', 'title', 'Main page title'),
('app.main.page.description', 'text', 'metadata', 'main_page', 'description', 'Main page description')
ON CONFLICT (content_key) DO NOTHING;

-- =================================================================
-- 8. CONTENT TRANSLATIONS DATA
-- =================================================================

-- Action 1: Income Source
WITH item AS (SELECT id FROM content_items WHERE content_key = 'app.main.action.1.dropdown.income_source')
INSERT INTO content_translations (content_item_id, language_code, content_value, is_default, status) VALUES
((SELECT id FROM item), 'ru', 'Основной источник дохода', TRUE, 'approved'),
((SELECT id FROM item), 'he', 'מקור הכנסה עיקרי', FALSE, 'approved'),
((SELECT id FROM item), 'en', 'Primary Income Source', FALSE, 'approved')
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- Action 2: Employment Type
WITH item AS (SELECT id FROM content_items WHERE content_key = 'app.main.action.2.dropdown.employment_type')
INSERT INTO content_translations (content_item_id, language_code, content_value, is_default, status) VALUES
((SELECT id FROM item), 'ru', 'Тип занятости', FALSE, 'approved'),
((SELECT id FROM item), 'he', 'סוג תעסוקה', FALSE, 'approved'),
((SELECT id FROM item), 'en', 'Employment Type', FALSE, 'approved')
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- Action 3: Property Type
WITH item AS (SELECT id FROM content_items WHERE content_key = 'app.main.action.3.dropdown.property_type')
INSERT INTO content_translations (content_item_id, language_code, content_value, is_default, status) VALUES
((SELECT id FROM item), 'ru', 'Тип недвижимости', FALSE, 'approved'),
((SELECT id FROM item), 'he', 'סוג נכס', FALSE, 'approved'),
((SELECT id FROM item), 'en', 'Property Type', FALSE, 'approved')
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- Action 4: Loan Purpose
WITH item AS (SELECT id FROM content_items WHERE content_key = 'app.main.action.4.dropdown.loan_purpose')
INSERT INTO content_translations (content_item_id, language_code, content_value, is_default, status) VALUES
((SELECT id FROM item), 'ru', 'Цель кредита', FALSE, 'approved'),
((SELECT id FROM item), 'he', 'מטרת הלוואה', FALSE, 'approved'),
((SELECT id FROM item), 'en', 'Loan Purpose', FALSE, 'approved')
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- Action 5: Credit History
WITH item AS (SELECT id FROM content_items WHERE content_key = 'app.main.action.5.dropdown.credit_history')
INSERT INTO content_translations (content_item_id, language_code, content_value, is_default, status) VALUES
((SELECT id FROM item), 'ru', 'Кредитная история', FALSE, 'approved'),
((SELECT id FROM item), 'he', 'היסטוריית אשראי', FALSE, 'approved'),
((SELECT id FROM item), 'en', 'Credit History', FALSE, 'approved')
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- Action 6: Document Type
WITH item AS (SELECT id FROM content_items WHERE content_key = 'app.main.action.6.dropdown.document_type')
INSERT INTO content_translations (content_item_id, language_code, content_value, is_default, status) VALUES
((SELECT id FROM item), 'ru', 'Тип документа', FALSE, 'approved'),
((SELECT id FROM item), 'he', 'סוג מסמך', FALSE, 'approved'),
((SELECT id FROM item), 'en', 'Document Type', FALSE, 'approved')
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- Action 7: Family Status
WITH item AS (SELECT id FROM content_items WHERE content_key = 'app.main.action.7.dropdown.family_status')
INSERT INTO content_translations (content_item_id, language_code, content_value, is_default, status) VALUES
((SELECT id FROM item), 'ru', 'Семейное положение', FALSE, 'approved'),
((SELECT id FROM item), 'he', 'מצב משפחתי', FALSE, 'approved'),
((SELECT id FROM item), 'en', 'Family Status', FALSE, 'approved')
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- Action 8: Education Level
WITH item AS (SELECT id FROM content_items WHERE content_key = 'app.main.action.8.dropdown.education_level')
INSERT INTO content_translations (content_item_id, language_code, content_value, is_default, status) VALUES
((SELECT id FROM item), 'ru', 'Уровень образования', FALSE, 'approved'),
((SELECT id FROM item), 'he', 'רמת השכלה', FALSE, 'approved'),
((SELECT id FROM item), 'en', 'Education Level', FALSE, 'approved')
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- Page Title
WITH item AS (SELECT id FROM content_items WHERE content_key = 'app.main.page.title')
INSERT INTO content_translations (content_item_id, language_code, content_value, is_default, status) VALUES
((SELECT id FROM item), 'ru', 'Калькулятор ипотеки - Главная страница', TRUE, 'approved'),
((SELECT id FROM item), 'he', 'מחשבון משכנתא - עמוד ראשי', FALSE, 'approved'),
((SELECT id FROM item), 'en', 'Mortgage Calculator - Main Page', FALSE, 'approved')
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- Page Description
WITH item AS (SELECT id FROM content_items WHERE content_key = 'app.main.page.description')
INSERT INTO content_translations (content_item_id, language_code, content_value, is_default, status) VALUES
((SELECT id FROM item), 'ru', 'Главная страница калькулятора ипотеки с основными параметрами', TRUE, 'approved'),
((SELECT id FROM item), 'he', 'עמוד הבית של מחשבון המשכנתא עם פרמטרים עיקריים', FALSE, 'approved'),
((SELECT id FROM item), 'en', 'Main page of mortgage calculator with primary parameters', FALSE, 'approved')
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- =================================================================
-- 9. VIEWS FOR API ACCESS
-- =================================================================

-- View for getting all approved content by screen location and language
CREATE OR REPLACE VIEW v_content_by_screen AS
SELECT 
    ci.content_key,
    ci.screen_location,
    ci.component_type,
    ci.category,
    ct.language_code,
    ct.content_value,
    ct.status,
    ci.is_active,
    ci.updated_at
FROM content_items ci
JOIN content_translations ct ON ct.content_item_id = ci.id
WHERE ci.is_active = TRUE 
  AND ct.status = 'approved';

-- View for content statistics
CREATE OR REPLACE VIEW v_content_stats AS
SELECT 
    screen_location,
    language_code,
    COUNT(*) as content_count,
    MAX(updated_at) as last_updated
FROM v_content_by_screen
GROUP BY screen_location, language_code;

-- =================================================================
-- 10. FUNCTIONS FOR API ENDPOINTS
-- =================================================================

-- Function to get content for specific screen and language
CREATE OR REPLACE FUNCTION get_content_by_screen(
    p_screen_location VARCHAR(100),
    p_language_code VARCHAR(10)
)
RETURNS TABLE (
    content_key VARCHAR(255),
    value TEXT,
    component_type VARCHAR(50),
    category VARCHAR(100),
    language VARCHAR(10),
    status VARCHAR(20)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        v.content_key,
        v.content_value as value,
        v.component_type,
        v.category,
        v.language_code as language,
        v.status
    FROM v_content_by_screen v
    WHERE v.screen_location = p_screen_location
      AND v.language_code = p_language_code
    ORDER BY v.content_key;
END;
$$ LANGUAGE plpgsql;

-- Function to get content with fallback
CREATE OR REPLACE FUNCTION get_content_with_fallback(
    p_content_key VARCHAR(255),
    p_language_code VARCHAR(10)
)
RETURNS TABLE (
    content_key VARCHAR(255),
    value TEXT,
    language VARCHAR(10),
    status VARCHAR(20),
    fallback_used BOOLEAN
) AS $$
DECLARE
    default_lang VARCHAR(10);
BEGIN
    -- Get default language
    SELECT code INTO default_lang FROM languages WHERE is_default = TRUE LIMIT 1;
    
    -- Try to get content in requested language first
    RETURN QUERY
    SELECT 
        v.content_key,
        v.content_value as value,
        v.language_code as language,
        v.status,
        FALSE as fallback_used
    FROM v_content_by_screen v
    WHERE v.content_key = p_content_key
      AND v.language_code = p_language_code
    LIMIT 1;
    
    -- If not found, fallback to default language
    IF NOT FOUND THEN
        RETURN QUERY
        SELECT 
            v.content_key,
            v.content_value as value,
            v.language_code as language,
            v.status,
            TRUE as fallback_used
        FROM v_content_by_screen v
        WHERE v.content_key = p_content_key
          AND v.language_code = default_lang
        LIMIT 1;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- =================================================================
-- VERIFICATION QUERIES
-- =================================================================

-- Check that data was inserted correctly
DO $$
DECLARE
    item_count INTEGER;
    translation_count INTEGER;
    approved_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO item_count FROM content_items WHERE screen_location = 'main_page';
    SELECT COUNT(*) INTO translation_count FROM content_translations WHERE status = 'approved';
    SELECT COUNT(*) INTO approved_count FROM v_content_by_screen WHERE screen_location = 'main_page';
    
    RAISE NOTICE 'Content items created: %', item_count;
    RAISE NOTICE 'Approved translations: %', translation_count;
    RAISE NOTICE 'Available content entries: %', approved_count;
    
    IF item_count = 0 OR translation_count = 0 THEN
        RAISE EXCEPTION 'Data insertion failed - no content found';
    END IF;
END $$;

-- Sample query to test the API function
SELECT 'Testing get_content_by_screen function:' as test;
SELECT * FROM get_content_by_screen('main_page', 'ru') LIMIT 5;

SELECT 'Testing get_content_with_fallback function:' as test;
SELECT * FROM get_content_with_fallback('app.main.action.1.dropdown.income_source', 'ru');

COMMIT;