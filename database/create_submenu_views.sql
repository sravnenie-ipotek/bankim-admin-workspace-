-- =================================================================
-- SUBMENU VIEWS (Auto-generated 2025-07-26)
-- =================================================================
-- 1. Generic summary view – action counts for every screen_location
-- -----------------------------------------------------------------
CREATE OR REPLACE VIEW v_page_action_counts AS
SELECT
    screen_location,
    COUNT(*)        AS action_count,
    MAX(updated_at) AS last_modified
FROM content_items
WHERE is_active = TRUE
GROUP BY screen_location;

-- 2. Detailed view for the "Mortgage" submenu
-- -----------------------------------------------------------------
--    This view reproduces the columns expected by the frontend
--    while hiding the complex joins/filters inside the DB layer.
--    Add additional views (credit, refinance, etc.) by copy-pasting
--    the pattern below and changing the screen_location predicate.
CREATE OR REPLACE VIEW v_mortgage_content AS
SELECT
    ci.id,
    ci.content_key,
    ci.component_type,
    ci.category,
    ci.screen_location,
    ci.description,
    ci.is_active,
    ci.action_count, -- <- populated via trigger/migration
    ct_ru.content_value AS title_ru,
    ct_he.content_value AS title_he,
    ct_en.content_value AS title_en,
    ci.updated_at
FROM content_items ci
LEFT JOIN content_translations ct_ru ON ci.id = ct_ru.content_item_id AND ct_ru.language_code = 'ru'
LEFT JOIN content_translations ct_he ON ci.id = ct_he.content_item_id AND ct_he.language_code = 'he'
LEFT JOIN content_translations ct_en ON ci.id = ct_en.content_item_id AND ct_en.language_code = 'en'
WHERE ci.is_active = TRUE
  AND ci.screen_location = 'mortgage_calculation'
  AND ct_ru.content_value IS NOT NULL
  AND ci.component_type <> 'option'      -- exclude individual dropdown options
  AND ci.content_key NOT LIKE '%_option_%'
  AND ci.content_key NOT LIKE '%_ph'
ORDER BY ci.content_key; 