const { Pool } = require('pg');

// Load environment variables from parent directory
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  max: 10,
});

/**
 * Category Filtering System for Dropdown Content
 * Following @dropDownDBlogic patterns for consistent category management
 */

/**
 * Category definitions according to @dropDownDBlogic
 */
const CATEGORY_DEFINITIONS = {
  'form': {
    description: 'Form fields and input elements',
    includes: ['dropdown', 'option', 'placeholder', 'label', 'input', 'textarea'],
    examples: ['mortgage_refinance_bank', 'calculate_mortgage_type']
  },
  'navigation': {
    description: 'Menu items and navigation elements',
    includes: ['menu_item', 'nav_link', 'breadcrumb'],
    examples: ['app.main.action.1', 'app.main.action.2']
  },
  'buttons': {
    description: 'Action buttons and controls',
    includes: ['button', 'submit', 'cancel'],
    examples: ['next_button', 'back_button', 'submit_button']
  },
  'labels': {
    description: 'Section headers and titles',
    includes: ['title', 'header', 'section_label'],
    examples: ['page_title', 'section_header']
  },
  'validation': {
    description: 'Error messages and validation feedback',
    includes: ['error_message', 'success_message', 'warning'],
    examples: ['validation_error', 'success_notification']
  },
  'bank': {
    description: 'Bank-specific content',
    includes: ['bank_option', 'bank_info'],
    examples: ['bank_hapoalim', 'bank_leumi', 'bank_discount']
  },
  'property': {
    description: 'Property-related content',
    includes: ['property_type', 'property_info'],
    examples: ['property_apartment', 'property_house', 'property_commercial']
  },
  'income': {
    description: 'Income and employment content',
    includes: ['income_type', 'employment_info'],
    examples: ['income_salary', 'income_business', 'income_other']
  }
};

/**
 * Category Filter Manager
 */
class CategoryFilterManager {
  constructor() {
    this.categories = CATEGORY_DEFINITIONS;
    this.activeFilters = new Set();
  }

  /**
   * Get all available categories
   * @returns {Object} Available categories
   */
  getAvailableCategories() {
    return this.categories;
  }

  /**
   * Add category filter
   * @param {string} category - Category to filter by
   */
  addCategoryFilter(category) {
    if (this.categories[category]) {
      this.activeFilters.add(category);
      console.log(`✅ Added category filter: ${category}`);
    } else {
      console.log(`⚠️  Unknown category: ${category}`);
    }
  }

  /**
   * Remove category filter
   * @param {string} category - Category to remove from filter
   */
  removeCategoryFilter(category) {
    this.activeFilters.delete(category);
    console.log(`✅ Removed category filter: ${category}`);
  }

  /**
   * Clear all category filters
   */
  clearCategoryFilters() {
    this.activeFilters.clear();
    console.log('🧹 All category filters cleared');
  }

  /**
   * Get active category filters
   * @returns {Array} Active category filters
   */
  getActiveFilters() {
    return Array.from(this.activeFilters);
  }

  /**
   * Build WHERE clause for category filtering
   * @returns {string} WHERE clause for category filtering
   */
  buildCategoryWhereClause() {
    if (this.activeFilters.size === 0) {
      return '';
    }

    const categoryConditions = Array.from(this.activeFilters).map(category => {
      const categoryInfo = this.categories[category];
      if (categoryInfo && categoryInfo.includes) {
        const componentTypes = categoryInfo.includes.map(type => `'${type}'`).join(', ');
        return `ci.component_type IN (${componentTypes})`;
      }
      return `ci.category = '${category}'`;
    });

    return `AND (${categoryConditions.join(' OR ')})`;
  }

  /**
   * Get category statistics
   * @returns {Object} Category statistics
   */
  getCategoryStats() {
    return {
      totalCategories: Object.keys(this.categories).length,
      activeFilters: this.activeFilters.size,
      availableCategories: Object.keys(this.categories),
      activeFilterList: Array.from(this.activeFilters)
    };
  }
}

/**
 * Analyze current category usage in database
 */
async function analyzeCategoryUsage() {
  console.log('📊 Analyzing category usage in database...\n');

  try {
    // Analyze component types by category
    const componentTypeAnalysis = await pool.query(`
      SELECT 
        ci.category,
        ci.component_type,
        COUNT(*) as count
      FROM content_items ci
      WHERE ci.is_active = TRUE
      GROUP BY ci.category, ci.component_type
      ORDER BY ci.category, ci.component_type
    `);

    console.log('📋 Component types by category:');
    let currentCategory = '';
    componentTypeAnalysis.rows.forEach(row => {
      if (row.category !== currentCategory) {
        currentCategory = row.category;
        console.log(`\n  ${currentCategory || 'NULL'}:`);
      }
      console.log(`    ${row.component_type}: ${row.count} items`);
    });

    // Analyze dropdown-specific categories
    const dropdownCategoryAnalysis = await pool.query(`
      SELECT 
        ci.category,
        ci.component_type,
        ci.screen_location,
        COUNT(*) as count
      FROM content_items ci
      WHERE ci.is_active = TRUE
        AND ci.component_type IN ('dropdown', 'option', 'dropdown_option', 'placeholder', 'label')
      GROUP BY ci.category, ci.component_type, ci.screen_location
      ORDER BY ci.category, ci.component_type, ci.screen_location
    `);

    console.log('\n📋 Dropdown categories by screen location:');
    dropdownCategoryAnalysis.rows.forEach(row => {
      console.log(`  ${row.category || 'NULL'} - ${row.component_type} - ${row.screen_location}: ${row.count} items`);
    });

    // Find uncategorized content
    const uncategorizedContent = await pool.query(`
      SELECT 
        ci.content_key,
        ci.component_type,
        ci.screen_location,
        ci.category
      FROM content_items ci
      WHERE ci.is_active = TRUE
        AND (ci.category IS NULL OR ci.category = '')
      ORDER BY ci.screen_location, ci.content_key
      LIMIT 10
    `);

    console.log('\n📋 Uncategorized content (first 10):');
    uncategorizedContent.rows.forEach((row, i) => {
      console.log(`  ${i+1}. ${row.content_key} (${row.component_type}, ${row.screen_location})`);
    });

    return {
      componentTypeAnalysis: componentTypeAnalysis.rows,
      dropdownCategoryAnalysis: dropdownCategoryAnalysis.rows,
      uncategorizedContent: uncategorizedContent.rows
    };

  } catch (error) {
    console.error('❌ Error analyzing category usage:', error);
  }
}

/**
 * Implement category filtering for dropdown endpoints
 */
async function implementCategoryFiltering() {
  console.log('🔧 Implementing category filtering for dropdown endpoints...\n');

  try {
    const filterManager = new CategoryFilterManager();

    // Test 1: Filter by form category
    console.log('📋 TEST 1: Filtering by form category...');
    filterManager.addCategoryFilter('form');
    
    const formWhereClause = filterManager.buildCategoryWhereClause();
    console.log(`Form category WHERE clause: ${formWhereClause}`);

    // Test query with form filter
    const formResults = await pool.query(`
      SELECT 
        ci.content_key,
        ci.component_type,
        ci.category,
        ci.screen_location
      FROM content_items ci
      WHERE ci.is_active = TRUE
        AND ci.component_type IN ('dropdown', 'option', 'dropdown_option', 'placeholder', 'label')
        ${formWhereClause}
      ORDER BY ci.screen_location, ci.content_key
      LIMIT 10
    `);

    console.log(`✅ Found ${formResults.rows.length} form-related dropdown items`);
    formResults.rows.forEach((row, i) => {
      console.log(`  ${i+1}. ${row.content_key} (${row.component_type}, ${row.category})`);
    });

    // Test 2: Filter by bank category
    console.log('\n📋 TEST 2: Filtering by bank category...');
    filterManager.clearCategoryFilters();
    filterManager.addCategoryFilter('bank');

    const bankWhereClause = filterManager.buildCategoryWhereClause();
    console.log(`Bank category WHERE clause: ${bankWhereClause}`);

    // Test query with bank filter
    const bankResults = await pool.query(`
      SELECT 
        ci.content_key,
        ci.component_type,
        ci.category,
        ci.screen_location
      FROM content_items ci
      WHERE ci.is_active = TRUE
        AND ci.component_type IN ('dropdown', 'option', 'dropdown_option', 'placeholder', 'label')
        ${bankWhereClause}
      ORDER BY ci.screen_location, ci.content_key
      LIMIT 10
    `);

    console.log(`✅ Found ${bankResults.rows.length} bank-related dropdown items`);
    bankResults.rows.forEach((row, i) => {
      console.log(`  ${i+1}. ${row.content_key} (${row.component_type}, ${row.category})`);
    });

    // Test 3: Multiple category filters
    console.log('\n📋 TEST 3: Multiple category filters...');
    filterManager.clearCategoryFilters();
    filterManager.addCategoryFilter('form');
    filterManager.addCategoryFilter('bank');

    const multiWhereClause = filterManager.buildCategoryWhereClause();
    console.log(`Multiple categories WHERE clause: ${multiWhereClause}`);

    // Test query with multiple filters
    const multiResults = await pool.query(`
      SELECT 
        ci.content_key,
        ci.component_type,
        ci.category,
        ci.screen_location
      FROM content_items ci
      WHERE ci.is_active = TRUE
        AND ci.component_type IN ('dropdown', 'option', 'dropdown_option', 'placeholder', 'label')
        ${multiWhereClause}
      ORDER BY ci.screen_location, ci.content_key
      LIMIT 10
    `);

    console.log(`✅ Found ${multiResults.rows.length} items matching multiple categories`);
    multiResults.rows.forEach((row, i) => {
      console.log(`  ${i+1}. ${row.content_key} (${row.component_type}, ${row.category})`);
    });

    return filterManager;

  } catch (error) {
    console.error('❌ Error implementing category filtering:', error);
  }
}

/**
 * Update unified dropdown endpoints with category filtering
 */
async function updateUnifiedEndpointsWithCategoryFiltering() {
  console.log('🔄 Updating unified dropdown endpoints with category filtering...\n');

  try {
    // Generate updated endpoint code
    const updatedEndpointCode = `
/**
 * Universal dropdown options endpoint with category filtering
 * GET /api/content/dropdown/{contentType}/{contentKey}/options?categories=form,bank
 */
app.get('/api/content/dropdown/:contentType/:contentKey/options', async (req, res) => {
  const { contentType, contentKey } = req.params;
  const { categories } = req.query;
  
  try {
    console.log(\`Fetching unified dropdown options for \${contentType}:\${contentKey} with categories: \${categories}\`);
    
    // Parse category filters
    const categoryFilters = categories ? categories.split(',') : [];
    const filterManager = new CategoryFilterManager();
    categoryFilters.forEach(category => filterManager.addCategoryFilter(category.trim()));
    
    // Build category WHERE clause
    const categoryWhereClause = filterManager.buildCategoryWhereClause();
    
    // ... rest of existing endpoint logic with category filtering ...
    
    // Execute unified query with category filtering
    const result = await safeQuery(\`
      SELECT 
        ci.id,
        ci.content_key,
        ci.component_type,
        ci.screen_location,
        ci.category,
        ct_ru.content_value as title_ru,
        ct_he.content_value as title_he,
        ct_en.content_value as title_en,
        CAST(
          COALESCE(
            SUBSTRING(ci.content_key FROM '_option_([0-9]+)$'),
            SUBSTRING(ci.content_key FROM '_options_([0-9]+)$'),
            SUBSTRING(ci.content_key FROM '\\\\.option\\\\.([0-9]+)$')
          ) AS INTEGER
        ) as option_order
      FROM content_items ci
      LEFT JOIN content_translations ct_ru ON ci.id = ct_ru.content_item_id 
        AND ct_ru.language_code = 'ru' AND ct_ru.status = 'approved'
      LEFT JOIN content_translations ct_he ON ci.id = ct_he.content_item_id 
        AND ct_he.language_code = 'he' AND ct_he.status = 'approved'
      LEFT JOIN content_translations ct_en ON ci.id = ct_en.content_item_id 
        AND ct_en.language_code = 'en' AND ct_en.status = 'approved'
      \${whereClause}
      \${categoryWhereClause}
      ORDER BY option_order NULLS LAST, ci.content_key
    \`, queryParams);
    
    // Transform to unified response format with category info
    const options = result.rows.map((row, index) => ({
      id: row.id.toString(),
      content_key: row.content_key,
      component_type: row.component_type,
      screen_location: row.screen_location,
      category: row.category,
      order: row.option_order || (index + 1),
      translations: {
        ru: row.title_ru || '',
        he: row.title_he || '',
        en: row.title_en || ''
      }
    }));
    
    res.json({
      success: true,
      data: {
        content_type: contentType,
        content_key: actualContentKey,
        categories_filtered: categoryFilters,
        options_count: options.length,
        options: options
      }
    });
    
  } catch (error) {
    console.error(\`Unified dropdown options error for \${contentType}:\${contentKey}:\`, error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
`;

    console.log('✅ Updated endpoint code generated with category filtering');
    console.log('📋 Key features added:');
    console.log('   - Query parameter support: ?categories=form,bank');
    console.log('   - Category filter manager integration');
    console.log('   - Category information in response');
    console.log('   - Flexible category filtering logic');

    return updatedEndpointCode;

  } catch (error) {
    console.error('❌ Error updating unified endpoints:', error);
  }
}

/**
 * Generate category filtering recommendations
 */
async function generateCategoryFilteringRecommendations() {
  console.log('💡 Generating category filtering recommendations...\n');

  try {
    // Recommendation 1: Category standardization
    console.log('📋 RECOMMENDATION 1: Category Standardization');
    console.log('   - Use consistent categories across all content types');
    console.log('   - Follow @dropDownDBlogic category definitions');
    console.log('   - Avoid NULL categories in production content');
    console.log('');

    // Recommendation 2: Category-based filtering
    console.log('📋 RECOMMENDATION 2: Category-Based Filtering');
    console.log('   - Add category query parameters to unified endpoints');
    console.log('   - Support multiple category filters: ?categories=form,bank');
    console.log('   - Include category information in API responses');
    console.log('');

    // Recommendation 3: Category validation
    console.log('📋 RECOMMENDATION 3: Category Validation');
    console.log('   - Validate category values against allowed list');
    console.log('   - Provide helpful error messages for invalid categories');
    console.log('   - Log category usage for analytics');
    console.log('');

    // Recommendation 4: Category migration
    console.log('📋 RECOMMENDATION 4: Category Migration');
    console.log('   - Update existing content with proper categories');
    console.log('   - Use database migration scripts for bulk updates');
    console.log('   - Validate category assignments after migration');
    console.log('');

    // Recommendation 5: Category documentation
    console.log('📋 RECOMMENDATION 5: Category Documentation');
    console.log('   - Document category definitions and usage');
    console.log('   - Provide examples for each category');
    console.log('   - Include category information in API documentation');
    console.log('');

  } catch (error) {
    console.error('❌ Error generating category filtering recommendations:', error);
  }
}

/**
 * Main function to implement category filtering
 */
async function implementCategoryFilteringSystem() {
  console.log('🚀 IMPLEMENTING CATEGORY FILTERING SYSTEM');
  console.log('=========================================\n');

  try {
    // Step 1: Analyze current category usage
    const categoryAnalysis = await analyzeCategoryUsage();

    // Step 2: Implement category filtering
    const filterManager = await implementCategoryFiltering();

    // Step 3: Update unified endpoints
    const updatedEndpointCode = await updateUnifiedEndpointsWithCategoryFiltering();

    // Step 4: Generate recommendations
    await generateCategoryFilteringRecommendations();

    // Step 5: Test category filtering
    console.log('🧪 Testing category filtering...\n');

    // Test category manager
    const stats = filterManager.getCategoryStats();
    console.log('📊 Category Filter Manager Statistics:');
    console.log(`   Total Categories: ${stats.totalCategories}`);
    console.log(`   Active Filters: ${stats.activeFilters}`);
    console.log(`   Available Categories: ${stats.availableCategories.join(', ')}`);
    console.log(`   Active Filter List: ${stats.activeFilterList.join(', ')}`);

    // Test category definitions
    console.log('\n📋 Category Definitions:');
    Object.entries(CATEGORY_DEFINITIONS).forEach(([category, info]) => {
      console.log(`  ${category}: ${info.description}`);
      console.log(`    Includes: ${info.includes.join(', ')}`);
      console.log(`    Examples: ${info.examples.join(', ')}`);
    });

    console.log('\n✅ Category filtering system implemented successfully!');

  } catch (error) {
    console.error('❌ Error implementing category filtering system:', error);
  } finally {
    await pool.end();
  }
}

// Execute if run directly
if (require.main === module) {
  implementCategoryFilteringSystem().catch(console.error);
}

module.exports = { 
  CategoryFilterManager,
  CATEGORY_DEFINITIONS,
  analyzeCategoryUsage,
  implementCategoryFiltering,
  updateUnifiedEndpointsWithCategoryFiltering,
  generateCategoryFilteringRecommendations,
  implementCategoryFilteringSystem
}; 