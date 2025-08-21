require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL
});

// Improved drill endpoint logic with COALESCE fallback
async function getImprovedDrillContent(screenLocation, requestedLang = 'en') {
  try {
    console.log(`🔄 Fetching drill content for: ${screenLocation}, language: ${requestedLang}`);
    
    const query = `
      SELECT 
        ci.id,
        ci.content_key,
        ci.component_type,
        ci.category,
        ci.screen_location,
        ci.is_active,
        ci.page_number,
        ci.updated_at,
        -- Primary language with English fallback
        COALESCE(
          MAX(CASE WHEN ct.language_code = $2 THEN ct.content_value END),  -- requested language
          MAX(CASE WHEN ct.language_code = 'en' THEN ct.content_value END), -- fallback to English
          NULL                                                             -- nothing
        ) AS text_value,
        -- Check if translation exists in requested language
        MAX(CASE WHEN ct.language_code = $2 THEN ct.content_value END) IS NOT NULL AS has_translation_requested,
        -- Check if fallback was used (has EN but not requested language)
        (MAX(CASE WHEN ct.language_code = $2 THEN ct.content_value END) IS NULL 
         AND MAX(CASE WHEN ct.language_code = 'en' THEN ct.content_value END) IS NOT NULL) AS fallback_used,
        -- Get all languages for debugging
        MAX(CASE WHEN ct.language_code = 'ru' THEN ct.content_value END) as text_ru,
        MAX(CASE WHEN ct.language_code = 'he' THEN ct.content_value END) as text_he,
        MAX(CASE WHEN ct.language_code = 'en' THEN ct.content_value END) as text_en
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
        AND ct.status IN ('approved', 'draft')
      WHERE ci.screen_location = $1
        AND ci.is_active = TRUE
      GROUP BY ci.id, ci.content_key, ci.component_type, ci.category, 
               ci.screen_location, ci.is_active, ci.page_number, ci.updated_at
      ORDER BY ci.page_number, ci.id
    `;
    
    const result = await pool.query(query, [screenLocation, requestedLang]);
    
    console.log(`🔍 Query returned ${result.rows.length} rows for ${screenLocation}`);
    
    const formattedData = result.rows.map(row => ({
      id: row.id,
      content_key: row.content_key,
      component_type: row.component_type,
      category: row.category,
      screen_location: row.screen_location,
      page_number: row.page_number,
      value: row.text_value || '',
      has_translation: row.has_translation_requested,
      fallback_used: row.fallback_used,
      // Debug info - all languages
      debug: {
        text_ru: row.text_ru || '',
        text_he: row.text_he || '',
        text_en: row.text_en || ''
      },
      updated_at: row.updated_at
    }));
    
    // Calculate statistics
    const stats = {
      total_items: formattedData.length,
      items_with_translation: formattedData.filter(item => item.has_translation).length,
      items_using_fallback: formattedData.filter(item => item.fallback_used).length,
      items_missing_translation: formattedData.filter(item => !item.has_translation && !item.fallback_used).length
    };
    
    stats.translation_coverage = stats.total_items > 0 ? 
      Math.round((stats.items_with_translation / stats.total_items) * 100) : 0;
    stats.fallback_coverage = stats.total_items > 0 ? 
      Math.round((stats.items_using_fallback / stats.total_items) * 100) : 0;
    
    return {
      success: true,
      data: {
        status: 'success',
        screenLocation,
        requestedLanguage: requestedLang,
        stats,
        items: formattedData
      }
    };
    
  } catch (error) {
    console.error('❌ Error fetching drill content:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Test function to validate the new approach
async function testImprovedLogic() {
  console.log('🧪 Testing improved drill logic...\n');
  
  const testCases = [
    // Test mortgage (should have 100% translations)
    { screen: 'mortgage_step1', lang: 'ru', expected: 'high_coverage' },
    { screen: 'mortgage_step1', lang: 'en', expected: 'high_coverage' },
    
    // Test credit (should have mixed translations)
    { screen: 'credit_step1', lang: 'ru', expected: 'some_coverage' },
    { screen: 'credit_summary', lang: 'en', expected: 'some_coverage' },
    
    // Test credit-refi (should have very low translations)
    { screen: 'credit_refi_step1', lang: 'ru', expected: 'low_coverage' },
    { screen: 'credit_refi_step2', lang: 'en', expected: 'very_low_coverage' }
  ];
  
  for (const testCase of testCases) {
    console.log(`📋 Testing: ${testCase.screen} (${testCase.lang})`);
    
    const result = await getImprovedDrillContent(testCase.screen, testCase.lang);
    
    if (result.success) {
      const { stats, items } = result.data;
      console.log(`  • Total items: ${stats.total_items}`);
      console.log(`  • Has translation: ${stats.items_with_translation} (${stats.translation_coverage}%)`);
      console.log(`  • Using fallback: ${stats.items_using_fallback} (${stats.fallback_coverage}%)`);
      console.log(`  • Missing: ${stats.items_missing_translation}`);
      
      // Show sample of missing items
      const missingItems = items.filter(item => !item.has_translation && !item.fallback_used);
      if (missingItems.length > 0) {
        console.log(`  • Missing examples: ${missingItems.slice(0, 3).map(item => item.content_key).join(', ')}`);
      }
      
      // Validation
      if (testCase.expected === 'high_coverage' && stats.translation_coverage < 80) {
        console.log(`  ⚠️  Expected high coverage but got ${stats.translation_coverage}%`);
      } else if (testCase.expected === 'very_low_coverage' && stats.translation_coverage > 20) {
        console.log(`  ⚠️  Expected very low coverage but got ${stats.translation_coverage}%`);
      } else {
        console.log(`  ✅ Coverage matches expected range`);
      }
    } else {
      console.log(`  ❌ Error: ${result.error}`);
    }
    console.log('');
  }
}

// Run tests if called directly
if (require.main === module) {
  testImprovedLogic()
    .then(() => {
      console.log('🎯 Test completed!');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Test failed:', error);
      process.exit(1);
    });
}

module.exports = {
  getImprovedDrillContent,
  testImprovedLogic
};