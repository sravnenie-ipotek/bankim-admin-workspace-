-- Migration: Add Menu Navigation Items
-- This script adds menu navigation items to content_items and content_translations tables

-- Insert menu navigation items (using available IDs)
INSERT INTO content_items (content_key, component_type, category, description, screen_location, is_active, created_at, updated_at)
VALUES 
  ('menu.main.home', 'menu_item', 'navigation', 'Главная страница', 'menu_navigation', TRUE, NOW(), NOW()),
  ('menu.main.mortgage', 'menu_item', 'navigation', 'Калькулятор ипотеки', 'menu_navigation', TRUE, NOW(), NOW()),
  ('menu.main.credit', 'menu_item', 'navigation', 'Кредитный калькулятор', 'menu_navigation', TRUE, NOW(), NOW()),
  ('menu.main.general', 'menu_item', 'navigation', 'Общие страницы сайта', 'menu_navigation', TRUE, NOW(), NOW())
ON CONFLICT (content_key, screen_location) DO NOTHING;

-- Insert Russian translations for new menu items
INSERT INTO content_translations (content_item_id, language_code, content_value, status, created_at, updated_at)
SELECT ci.id, 'ru', 
  CASE ci.content_key
    WHEN 'menu.main.home' THEN 'Главная'
    WHEN 'menu.main.mortgage' THEN 'Рассчитать ипотеку'
    WHEN 'menu.main.credit' THEN 'Расчет Кредита'
    WHEN 'menu.main.general' THEN 'Общие страницы'
  END,
  'approved', NOW(), NOW()
FROM content_items ci
WHERE ci.screen_location = 'menu_navigation' 
  AND ci.component_type = 'menu_item'
  AND ci.content_key IN ('menu.main.home', 'menu.main.mortgage', 'menu.main.credit', 'menu.main.general')
  AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'ru'
  );

-- Insert Hebrew translations for new menu items
INSERT INTO content_translations (content_item_id, language_code, content_value, status, created_at, updated_at)
SELECT ci.id, 'he',
  CASE ci.content_key
    WHEN 'menu.main.home' THEN 'דף הבית'
    WHEN 'menu.main.mortgage' THEN 'חישוב משכנתא'
    WHEN 'menu.main.credit' THEN 'חישוב אשראי'
    WHEN 'menu.main.general' THEN 'דפים כלליים'
  END,
  'approved', NOW(), NOW()
FROM content_items ci
WHERE ci.screen_location = 'menu_navigation'
  AND ci.component_type = 'menu_item' 
  AND ci.content_key IN ('menu.main.home', 'menu.main.mortgage', 'menu.main.credit', 'menu.main.general')
  AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'he'
  );

-- Insert English translations for new menu items  
INSERT INTO content_translations (content_item_id, language_code, content_value, status, created_at, updated_at)
SELECT ci.id, 'en',
  CASE ci.content_key
    WHEN 'menu.main.home' THEN 'Home'
    WHEN 'menu.main.mortgage' THEN 'Calculate Mortgage'
    WHEN 'menu.main.credit' THEN 'Credit Calculator'
    WHEN 'menu.main.general' THEN 'General Pages'
  END,
  'approved', NOW(), NOW()
FROM content_items ci
WHERE ci.screen_location = 'menu_navigation'
  AND ci.component_type = 'menu_item'
  AND ci.content_key IN ('menu.main.home', 'menu.main.mortgage', 'menu.main.credit', 'menu.main.general')
  AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'en'
  );