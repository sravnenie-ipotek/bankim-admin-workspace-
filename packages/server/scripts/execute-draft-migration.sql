-- 🔄 Draft Content Migration SQL
-- ===============================
-- 
-- PURPOSE: Convert 'active' status translations to 'approved' 
-- IMPACT: This will unlock 141 missing translations including critical dropdown options
-- 
-- BEFORE RUNNING:
-- 1. ✅ Backup database
-- 2. ✅ Test in development environment 
-- 3. ✅ Review affected content (see migrate-draft-content.js output)
-- 
-- AFFECTED CONTENT:
-- - 47 content items total
-- - 39 dropdown options (critical for functionality)
-- - 7 labels for form fields
-- - 1 title element
-- 
-- EXPECTED OUTCOME:
-- - Dropdown options will appear in production
-- - API endpoints will return more options (16+ instead of 8)
-- - All content follows consistent "approved" status
-- 
-- ⚠️ IMPORTANT: This affects production immediately!

BEGIN;

-- Step 1: Record current state for verification
CREATE TEMP TABLE migration_backup AS
SELECT 
  ct.id,
  ct.content_item_id,
  ct.language_code,
  ct.status as old_status,
  ci.content_key,
  ci.component_type,
  ci.screen_location
FROM content_translations ct
JOIN content_items ci ON ct.content_item_id = ci.id
WHERE ct.status = 'active'
  AND ci.is_active = TRUE;

-- Step 2: Show what will be migrated
SELECT 
  'MIGRATION PREVIEW' as action,
  component_type,
  COUNT(*) as items_to_migrate
FROM migration_backup
GROUP BY component_type
ORDER BY component_type;

-- Step 3: Perform the migration
UPDATE content_translations 
SET status = 'approved', updated_at = NOW()
WHERE status = 'active'
  AND content_item_id IN (
    SELECT id FROM content_items WHERE is_active = TRUE
  );

-- Step 4: Verify the migration results
SELECT 
  'POST-MIGRATION STATUS' as verification,
  ct.status,
  ci.component_type,
  COUNT(*) as count
FROM content_translations ct
JOIN content_items ci ON ct.content_item_id = ci.id
WHERE ci.is_active = TRUE
GROUP BY ct.status, ci.component_type
ORDER BY ct.status, ci.component_type;

-- Step 5: Critical validation - Check for remaining 'active' status
SELECT 
  'VALIDATION CHECK' as test,
  COUNT(*) as remaining_active_count,
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ SUCCESS: No active status remaining'
    ELSE '❌ ERROR: Still have active status records'
  END as result
FROM content_translations 
WHERE status = 'active';

-- Step 6: Test dropdown options are now discoverable
SELECT 
  'DROPDOWN TEST' as test,
  COUNT(*) as mortgage_refi_options_count,
  CASE 
    WHEN COUNT(*) > 15 THEN '✅ SUCCESS: Many options now discoverable'
    WHEN COUNT(*) > 0 THEN '⚠️ PARTIAL: Some options found'
    ELSE '❌ ERROR: No options found'
  END as result
FROM content_items ci
JOIN content_translations ct ON ci.id = ct.content_item_id
WHERE ci.content_key LIKE 'mortgage_refinance_bank_%'
  AND ci.component_type IN ('option', 'dropdown_option')
  AND ct.status = 'approved'
  AND ci.is_active = TRUE;

-- Step 7: Show sample of newly available content
SELECT 
  'SAMPLE MIGRATED CONTENT' as sample,
  ci.content_key,
  ci.component_type,
  ct.language_code,
  LEFT(ct.content_value, 30) as content_preview
FROM content_items ci
JOIN content_translations ct ON ci.id = ct.content_item_id
WHERE ci.content_key LIKE 'mortgage_refinance_bank_%'
  AND ci.component_type IN ('option', 'dropdown_option')
  AND ct.status = 'approved'
  AND ct.language_code = 'ru'
  AND ci.is_active = TRUE
ORDER BY ci.content_key
LIMIT 10;

-- Final decision point
SELECT 
  '🎯 MIGRATION SUMMARY' as summary,
  (SELECT COUNT(*) FROM migration_backup) as total_migrated,
  (SELECT COUNT(*) FROM content_translations WHERE status = 'active') as remaining_active,
  CASE 
    WHEN (SELECT COUNT(*) FROM content_translations WHERE status = 'active') = 0 
    THEN '✅ Ready to COMMIT - All active status converted'
    ELSE '❌ Issues found - Consider ROLLBACK'
  END as recommendation;

-- ============================================
-- DECISION POINT: Review the output above
-- ============================================
-- 
-- If all validations show ✅ SUCCESS:
--   COMMIT;
-- 
-- If any validations show ❌ ERROR:
--   ROLLBACK;
-- 
-- ============================================

-- Uncomment ONE of the following based on validation results:

-- COMMIT;   -- ✅ Use this if all validations passed
-- ROLLBACK; -- ❌ Use this if any issues found