-- Comprehensive Database Check for BankIM Management Portal
-- ============================================================

-- 1. CREDIT-REFI SECTION (6.1.x)
-- -------------------------------
SELECT '=== CREDIT-REFI SECTION ===' as section;

SELECT 
  nm.confluence_num,
  nm.screen_location,
  COUNT(DISTINCT ci.id) as content_items,
  COUNT(DISTINCT ct.id) as translations,
  COUNT(DISTINCT ct.id)::float / NULLIF(COUNT(DISTINCT ci.id) * 3, 0) * 100 as translation_coverage
FROM navigation_mapping nm
LEFT JOIN content_items ci ON nm.screen_location = ci.screen_location AND ci.is_active = TRUE
LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
WHERE nm.confluence_num LIKE '6.1%'
GROUP BY nm.confluence_num, nm.screen_location
ORDER BY 
  CASE 
    WHEN nm.confluence_num = '6.1' THEN 0
    WHEN nm.confluence_num LIKE '6.1.%.%' THEN 
      CAST(SUBSTRING(nm.confluence_num FROM 5 FOR POSITION('.' IN SUBSTRING(nm.confluence_num FROM 5)) - 1) AS DECIMAL) + 
      CAST(SUBSTRING(nm.confluence_num FROM POSITION('.' IN SUBSTRING(nm.confluence_num FROM 5)) + 5) AS DECIMAL) / 1000
    ELSE CAST(SUBSTRING(nm.confluence_num FROM 5) AS DECIMAL)
  END;

-- 2. CREDIT SECTION (5.1.x)
-- --------------------------
SELECT '=== CREDIT SECTION ===' as section;

SELECT 
  nm.confluence_num,
  nm.screen_location,
  COUNT(DISTINCT ci.id) as content_items,
  COUNT(DISTINCT ct.id) as translations,
  COUNT(DISTINCT ct.id)::float / NULLIF(COUNT(DISTINCT ci.id) * 3, 0) * 100 as translation_coverage
FROM navigation_mapping nm
LEFT JOIN content_items ci ON nm.screen_location = ci.screen_location AND ci.is_active = TRUE
LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
WHERE nm.confluence_num LIKE '5.1%'
GROUP BY nm.confluence_num, nm.screen_location
ORDER BY 
  CASE 
    WHEN nm.confluence_num = '5.1' THEN 0
    ELSE CAST(SUBSTRING(nm.confluence_num FROM 5) AS DECIMAL)
  END;

-- 3. MORTGAGE-REFI SECTION (4.1.x)
-- ---------------------------------
SELECT '=== MORTGAGE-REFI SECTION ===' as section;

SELECT 
  nm.confluence_num,
  nm.screen_location,
  COUNT(DISTINCT ci.id) as content_items,
  COUNT(DISTINCT ct.id) as translations,
  COUNT(DISTINCT ct.id)::float / NULLIF(COUNT(DISTINCT ci.id) * 3, 0) * 100 as translation_coverage
FROM navigation_mapping nm
LEFT JOIN content_items ci ON nm.screen_location = ci.screen_location AND ci.is_active = TRUE
LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
WHERE nm.confluence_num LIKE '4.1%'
GROUP BY nm.confluence_num, nm.screen_location
ORDER BY 
  CASE 
    WHEN nm.confluence_num = '4.1' THEN 0
    ELSE CAST(SUBSTRING(nm.confluence_num FROM 5) AS DECIMAL)
  END;

-- 4. MORTGAGE SECTION (Standard)
-- -------------------------------
SELECT '=== MORTGAGE SECTION ===' as section;

SELECT 
  ci.screen_location,
  COUNT(DISTINCT ci.id) as content_items,
  COUNT(DISTINCT ct.id) as translations,
  COUNT(DISTINCT ct.id)::float / NULLIF(COUNT(DISTINCT ci.id) * 3, 0) * 100 as translation_coverage
FROM content_items ci
LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
WHERE ci.screen_location LIKE 'mortgage_%' 
  AND ci.screen_location NOT IN (
    SELECT screen_location FROM navigation_mapping WHERE confluence_num LIKE '4.1%'
  )
  AND ci.is_active = TRUE
GROUP BY ci.screen_location
ORDER BY ci.screen_location;

-- 5. SUMMARY STATISTICS
-- ----------------------
SELECT '=== SUMMARY STATISTICS ===' as section;

WITH stats AS (
  SELECT 
    CASE 
      WHEN ci.screen_location LIKE 'credit_refi_%' THEN 'Credit-Refi (6.1.x)'
      WHEN ci.screen_location LIKE 'credit_%' AND ci.screen_location NOT LIKE 'credit_refi_%' THEN 'Credit (5.1.x)'
      WHEN ci.screen_location IN (SELECT screen_location FROM navigation_mapping WHERE confluence_num LIKE '4.1%') THEN 'Mortgage-Refi (4.1.x)'
      WHEN ci.screen_location LIKE 'mortgage_%' THEN 'Mortgage (Standard)'
      ELSE 'Other'
    END as section,
    COUNT(DISTINCT ci.id) as content_items,
    COUNT(DISTINCT ct.id) as translations
  FROM content_items ci
  LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
  WHERE ci.is_active = TRUE
  GROUP BY 
    CASE 
      WHEN ci.screen_location LIKE 'credit_refi_%' THEN 'Credit-Refi (6.1.x)'
      WHEN ci.screen_location LIKE 'credit_%' AND ci.screen_location NOT LIKE 'credit_refi_%' THEN 'Credit (5.1.x)'
      WHEN ci.screen_location IN (SELECT screen_location FROM navigation_mapping WHERE confluence_num LIKE '4.1%') THEN 'Mortgage-Refi (4.1.x)'
      WHEN ci.screen_location LIKE 'mortgage_%' THEN 'Mortgage (Standard)'
      ELSE 'Other'
    END
)
SELECT 
  section,
  content_items,
  translations,
  ROUND(translations::float / NULLIF(content_items * 3, 0) * 100) as coverage_percent
FROM stats
ORDER BY section;

-- 6. MISSING NAVIGATION MAPPINGS
-- -------------------------------
SELECT '=== MISSING NAVIGATION MAPPINGS ===' as section;

SELECT DISTINCT ci.screen_location, COUNT(*) as items_without_mapping
FROM content_items ci
LEFT JOIN navigation_mapping nm ON ci.screen_location = nm.screen_location
WHERE nm.id IS NULL 
  AND ci.is_active = TRUE
  AND ci.screen_location IN (
    'credit_summary', 'credit_step1', 'credit_phone_verification',
    'credit_personal_data', 'credit_partner_personal', 'credit_partner_income',
    'credit_income_employed', 'credit_coborrower_personal', 'credit_coborrower_income',
    'credit_loading_screen', 'credit_program_selection', 'credit_registration_page',
    'credit_login_page', 'reset_password_page'
  )
GROUP BY ci.screen_location
ORDER BY ci.screen_location;

-- 7. CONTENT ITEMS WITHOUT ANY TRANSLATIONS
-- ------------------------------------------
SELECT '=== CONTENT WITHOUT TRANSLATIONS ===' as section;

SELECT 
  ci.screen_location,
  COUNT(*) as items_without_translations
FROM content_items ci
LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
WHERE ct.id IS NULL
  AND ci.is_active = TRUE
  AND ci.screen_location LIKE ANY(ARRAY['credit_%', 'mortgage_%', 'refinance_%'])
GROUP BY ci.screen_location
ORDER BY COUNT(*) DESC
LIMIT 20;