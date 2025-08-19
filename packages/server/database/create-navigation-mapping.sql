-- Create navigation_mapping table in bankim_content database
-- This table maps Confluence structure to our database screen_locations

DROP TABLE IF EXISTS navigation_mapping CASCADE;

CREATE TABLE navigation_mapping (
    id SERIAL PRIMARY KEY,
    confluence_num VARCHAR(20) NOT NULL,
    confluence_title_ru TEXT NOT NULL,
    confluence_title_he TEXT,
    confluence_title_en TEXT,
    screen_location TEXT UNIQUE NOT NULL,
    parent_section VARCHAR(20),
    sort_order INT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(confluence_num, parent_section)
);

-- Create index for fast lookups
CREATE INDEX idx_navigation_mapping_parent ON navigation_mapping(parent_section);
CREATE INDEX idx_navigation_mapping_screen ON navigation_mapping(screen_location);
CREATE INDEX idx_navigation_mapping_active ON navigation_mapping(is_active) WHERE is_active = true;

-- Insert mortgage data based on Confluence structure (3.1 section)
-- https://bankimonline.atlassian.net/wiki/spaces/Bankim/pages/20447343/3.1.+.
INSERT INTO navigation_mapping 
  (confluence_num, confluence_title_ru, confluence_title_he, confluence_title_en, screen_location, parent_section, sort_order)
VALUES
  -- Main mortgage steps
  ('2', 'Калькулятор ипотеки', 'מחשבון משכנתא', 'Mortgage Calculator', 'mortgage_calculation', '3.1', 2),
  ('3', 'Ввод номера телефона', 'הזנת מספר טלפון', 'Phone Number Input', 'mortgage_step1', '3.1', 3),
  ('4', 'Анкета личных данных', 'טופס נתונים אישיים', 'Personal Data Form', 'mortgage_step2', '3.1', 4),
  ('5', 'Анкета партнера. Личные', 'נתוני בן/בת זוג', 'Partner Personal Data', 'mortgage_step3', '3.1', 5),
  ('6', 'Анкета партнера. Доходы', 'הכנסות בן/בת זוג', 'Partner Income', 'mortgage_step4', '3.1', 6),
  
  -- Refinance mortgage steps
  ('7', 'Рефинансирование - Шаг 1', 'מיחזור - שלב 1', 'Refinancing - Step 1', 'refinance_mortgage_1', '3.1', 7),
  ('8', 'Рефинансирование - Шаг 2', 'מיחזור - שלב 2', 'Refinancing - Step 2', 'refinance_mortgage_2', '3.1', 8),
  ('9', 'Рефинансирование - Шаг 3', 'מיחזור - שלב 3', 'Refinancing - Step 3', 'refinance_mortgage_3', '3.1', 9),
  ('10', 'Рефинансирование - Шаг 4', 'מיחזור - שלב 4', 'Refinancing - Step 4', 'refinance_mortgage_4', '3.1', 10),
  
  -- Additional refinance screens
  ('11', 'Рефинансирование - Расчет', 'מיחזור - חישוב', 'Refinancing - Calculation', 'refinance_mortgage_step1', '3.1', 11),
  ('12', 'Рефинансирование - Данные', 'מיחזור - נתונים', 'Refinancing - Data', 'refinance_mortgage_step2', '3.1', 12),
  ('13', 'Рефинансирование - Подтверждение', 'מיחזור - אישור', 'Refinancing - Confirmation', 'refinance_mortgage_step3', '3.1', 13);

-- Add comment to table
COMMENT ON TABLE navigation_mapping IS 'Maps Confluence documentation structure to database screen_locations for navigation';
COMMENT ON COLUMN navigation_mapping.confluence_num IS 'Number from Confluence documentation (e.g., 2, 3, 7.1)';
COMMENT ON COLUMN navigation_mapping.screen_location IS 'Corresponding screen_location value in content_items table';
COMMENT ON COLUMN navigation_mapping.parent_section IS 'Parent section in Confluence (e.g., 3.1 for mortgage)';

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_navigation_mapping_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_navigation_mapping_updated_at_trigger
    BEFORE UPDATE ON navigation_mapping
    FOR EACH ROW
    EXECUTE FUNCTION update_navigation_mapping_updated_at();

-- Verify the data
SELECT 
    confluence_num,
    confluence_title_ru,
    screen_location,
    parent_section,
    sort_order
FROM navigation_mapping
WHERE parent_section = '3.1'
ORDER BY sort_order;