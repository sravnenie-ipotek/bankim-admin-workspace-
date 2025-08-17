-- Check what application contexts exist
SELECT * FROM application_contexts;

-- Check what content exists for refinance mortgage in each context  
SELECT 
  ci.screen_location,
  ac.context_code,
  ac.context_name_en,
  COUNT(*) as content_count
FROM content_items ci
LEFT JOIN application_contexts ac ON ci.app_context_id = ac.id
WHERE ci.screen_location LIKE '%refinance%' 
   OR ci.content_key LIKE '%refinance%'
GROUP BY ci.screen_location, ac.context_code, ac.context_name_en
ORDER BY ac.context_code, ci.screen_location;
