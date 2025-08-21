-- Remove generic credit-refi translations that are misleading
-- These contain placeholder text like "Детали недвижимости - Элемент 1"

-- First, show what we're about to delete
SELECT 
  ci.screen_location,
  ct.language_code,
  ct.content_value,
  COUNT(*) as count
FROM content_translations ct
JOIN content_items ci ON ct.content_item_id = ci.id
WHERE ci.screen_location LIKE 'credit_refi_%'
  AND ci.is_active = TRUE
  AND (ct.content_value LIKE '%- Элемент %' 
       OR ct.content_value LIKE '%- פריט %'
       OR ct.content_value LIKE '%- Item %')
GROUP BY ci.screen_location, ct.language_code, ct.content_value
ORDER BY ci.screen_location, ct.language_code
LIMIT 20;

-- Count total generic translations to be removed
SELECT COUNT(*) as total_generic_translations
FROM content_translations ct
JOIN content_items ci ON ct.content_item_id = ci.id
WHERE ci.screen_location LIKE 'credit_refi_%'
  AND ci.is_active = TRUE
  AND (ct.content_value LIKE '%- Элемент %' 
       OR ct.content_value LIKE '%- פריט %'
       OR ct.content_value LIKE '%- Item %');

-- Delete the generic translations
DELETE FROM content_translations 
WHERE id IN (
  SELECT ct.id
  FROM content_translations ct
  JOIN content_items ci ON ct.content_item_id = ci.id
  WHERE ci.screen_location LIKE 'credit_refi_%'
    AND ci.is_active = TRUE
    AND (ct.content_value LIKE '%- Элемент %' 
         OR ct.content_value LIKE '%- פריט %'
         OR ct.content_value LIKE '%- Item %')
);

-- Verify cleanup - show translation status after cleanup
SELECT 
  ci.screen_location,
  COUNT(DISTINCT ci.id) as total_items,
  COUNT(ct.id) as total_translations,
  COUNT(DISTINCT ct.content_item_id) as items_with_translations,
  ROUND(
    CASE 
      WHEN COUNT(DISTINCT ci.id) = 0 THEN 0
      ELSE (COUNT(DISTINCT ct.content_item_id)::float / COUNT(DISTINCT ci.id) * 100)
    END, 0
  ) as coverage_percent
FROM content_items ci
LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
WHERE ci.screen_location LIKE 'credit_refi_%'
  AND ci.is_active = TRUE
GROUP BY ci.screen_location
ORDER BY ci.screen_location;