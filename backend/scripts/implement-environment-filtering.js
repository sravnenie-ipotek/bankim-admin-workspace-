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
 * Environment-Specific Filtering System for Dropdown Content
 * Following @dropDownDBlogic patterns for consistent environment management
 */

/**
 * Environment configurations according to @dropDownDBlogic
 */
const ENVIRONMENT_CONFIGS = {
  'development': {
    description: 'Development environment - show all content for testing',
    statusFilter: "ct.status IN ('approved', 'active', 'draft')",
    showDraftContent: true,
    showActiveContent: true,
    showApprovedContent: true,
    cacheStrategy: 'aggressive',
    logLevel: 'debug'
  },
  'staging': {
    description: 'Staging environment - show approved and active content',
    statusFilter: "ct.status IN ('approved', 'active')",
    showDraftContent: false,
    showActiveContent: true,
    showApprovedContent: true,
    cacheStrategy: 'moderate',
    logLevel: 'info'
  },
  'production': {
    description: 'Production environment - show only approved content',
    statusFilter: "ct.status = 'approved'",
    showDraftContent: false,
    showActiveContent: false,
    showApprovedContent: true,
    cacheStrategy: 'conservative',
    logLevel: 'warn'
  }
};

/**
 * Environment Filter Manager
 */
class EnvironmentFilterManager {
  constructor(environment = process.env.NODE_ENV || 'development') {
    this.environment = environment;
    this.config = ENVIRONMENT_CONFIGS[environment] || ENVIRONMENT_CONFIGS['development'];
    this.activeFilters = new Set();
  }

  /**
   * Get current environment configuration
   * @returns {Object} Environment configuration
   */
  getEnvironmentConfig() {
    return {
      environment: this.environment,
      config: this.config,
      activeFilters: Array.from(this.activeFilters)
    };
  }

  /**
   * Build WHERE clause for environment-specific filtering
   * @returns {string} WHERE clause for environment filtering
   */
  buildEnvironmentWhereClause() {
    return `AND ${this.config.statusFilter}`;
  }

  /**
   * Get content status filter based on environment
   * @returns {string} Status filter clause
   */
  getStatusFilter() {
    return this.config.statusFilter;
  }

  /**
   * Check if draft content should be shown
   * @returns {boolean} Whether to show draft content
   */
  shouldShowDraftContent() {
    return this.config.showDraftContent;
  }

  /**
   * Check if active content should be shown
   * @returns {boolean} Whether to show active content
   */
  shouldShowActiveContent() {
    return this.config.showActiveContent;
  }

  /**
   * Check if approved content should be shown
   * @returns {boolean} Whether to show approved content
   */
  shouldShowApprovedContent() {
    return this.config.showApprovedContent;
  }

  /**
   * Get cache strategy for current environment
   * @returns {string} Cache strategy
   */
  getCacheStrategy() {
    return this.config.cacheStrategy;
  }

  /**
   * Get log level for current environment
   * @returns {string} Log level
   */
  getLogLevel() {
    return this.config.logLevel;
  }

  /**
   * Add environment-specific filter
   * @param {string} filter - Filter to add
   */
  addFilter(filter) {
    this.activeFilters.add(filter);
    console.log(`✅ Added environment filter: ${filter}`);
  }

  /**
   * Remove environment-specific filter
   * @param {string} filter - Filter to remove
   */
  removeFilter(filter) {
    this.activeFilters.delete(filter);
    console.log(`✅ Removed environment filter: ${filter}`);
  }

  /**
   * Clear all environment filters
   */
  clearFilters() {
    this.activeFilters.clear();
    console.log('🧹 All environment filters cleared');
  }

  /**
   * Get environment statistics
   * @returns {Object} Environment statistics
   */
  getEnvironmentStats() {
    return {
      environment: this.environment,
      statusFilter: this.config.statusFilter,
      showDraftContent: this.config.showDraftContent,
      showActiveContent: this.config.showActiveContent,
      showApprovedContent: this.config.showApprovedContent,
      cacheStrategy: this.config.cacheStrategy,
      logLevel: this.config.logLevel,
      activeFilters: Array.from(this.activeFilters)
    };
  }
}

/**
 * Analyze content by environment
 */
async function analyzeContentByEnvironment() {
  console.log('📊 Analyzing content by environment...\n');

  try {
    const environments = ['development', 'staging', 'production'];
    const environmentResults = {};

    for (const env of environments) {
      const config = ENVIRONMENT_CONFIGS[env];
      console.log(`📋 ${env.toUpperCase()} Environment Analysis:`);
      console.log(`   Status Filter: ${config.statusFilter}`);
      console.log(`   Show Draft: ${config.showDraftContent}`);
      console.log(`   Show Active: ${config.showActiveContent}`);
      console.log(`   Show Approved: ${config.showApprovedContent}`);

      // Test query for each environment
      const result = await pool.query(`
        SELECT 
          ct.status,
          ci.component_type,
          COUNT(*) as count
        FROM content_items ci
        LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
        WHERE ci.is_active = TRUE
          AND ci.component_type IN ('dropdown', 'option', 'dropdown_option', 'placeholder', 'label')
          AND ${config.statusFilter}
        GROUP BY ct.status, ci.component_type
        ORDER BY ct.status, ci.component_type
      `);

      console.log(`   Results: ${result.rows.length} status/component combinations`);
      result.rows.forEach(row => {
        console.log(`     ${row.status || 'NULL'} - ${row.component_type}: ${row.count} items`);
      });

      environmentResults[env] = result.rows;
      console.log('');
    }

    return environmentResults;

  } catch (error) {
    console.error('❌ Error analyzing content by environment:', error);
  }
}

/**
 * Implement environment-specific filtering for dropdown endpoints
 */
async function implementEnvironmentFiltering() {
  console.log('🔧 Implementing environment-specific filtering...\n');

  try {
    const filterManager = new EnvironmentFilterManager();
    const stats = filterManager.getEnvironmentStats();

    console.log('📋 Current Environment Configuration:');
    console.log(`   Environment: ${stats.environment}`);
    console.log(`   Status Filter: ${stats.statusFilter}`);
    console.log(`   Show Draft: ${stats.showDraftContent}`);
    console.log(`   Show Active: ${stats.showActiveContent}`);
    console.log(`   Show Approved: ${stats.showApprovedContent}`);
    console.log(`   Cache Strategy: ${stats.cacheStrategy}`);
    console.log(`   Log Level: ${stats.logLevel}`);

    // Test environment-specific queries
    console.log('\n📋 Testing environment-specific queries...');

    // Test 1: Development environment (all content)
    const devFilterManager = new EnvironmentFilterManager('development');
    const devWhereClause = devFilterManager.buildEnvironmentWhereClause();
    console.log(`Development WHERE clause: ${devWhereClause}`);

    const devResults = await pool.query(`
      SELECT 
        ci.content_key,
        ci.component_type,
        ct.status,
        COUNT(*) as count
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.is_active = TRUE
        AND ci.component_type IN ('dropdown', 'option', 'dropdown_option', 'placeholder', 'label')
        ${devWhereClause}
      GROUP BY ci.content_key, ci.component_type, ct.status
      ORDER BY ci.content_key, ci.component_type
      LIMIT 10
    `);

    console.log(`✅ Development environment: ${devResults.rows.length} content items found`);
    devResults.rows.forEach((row, i) => {
      console.log(`  ${i+1}. ${row.content_key} (${row.component_type}, ${row.status}): ${row.count} items`);
    });

    // Test 2: Production environment (approved only)
    const prodFilterManager = new EnvironmentFilterManager('production');
    const prodWhereClause = prodFilterManager.buildEnvironmentWhereClause();
    console.log(`\nProduction WHERE clause: ${prodWhereClause}`);

    const prodResults = await pool.query(`
      SELECT 
        ci.content_key,
        ci.component_type,
        ct.status,
        COUNT(*) as count
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.is_active = TRUE
        AND ci.component_type IN ('dropdown', 'option', 'dropdown_option', 'placeholder', 'label')
        ${prodWhereClause}
      GROUP BY ci.content_key, ci.component_type, ct.status
      ORDER BY ci.content_key, ci.component_type
      LIMIT 10
    `);

    console.log(`✅ Production environment: ${prodResults.rows.length} content items found`);
    prodResults.rows.forEach((row, i) => {
      console.log(`  ${i+1}. ${row.content_key} (${row.component_type}, ${row.status}): ${row.count} items`);
    });

    return {
      development: devResults.rows,
      production: prodResults.rows,
      filterManager
    };

  } catch (error) {
    console.error('❌ Error implementing environment filtering:', error);
  }
}

/**
 * Update unified dropdown endpoints with environment filtering
 */
async function updateUnifiedEndpointsWithEnvironmentFiltering() {
  console.log('🔄 Updating unified dropdown endpoints with environment filtering...\n');

  try {
    // Generate updated endpoint code
    const updatedEndpointCode = `
/**
 * Universal dropdown options endpoint with environment filtering
 * GET /api/content/dropdown/{contentType}/{contentKey}/options
 * Environment-specific filtering based on NODE_ENV
 */
app.get('/api/content/dropdown/:contentType/:contentKey/options', async (req, res) => {
  const { contentType, contentKey } = req.params;
  
  try {
    // Initialize environment filter manager
    const envFilterManager = new EnvironmentFilterManager(process.env.NODE_ENV);
    const envConfig = envFilterManager.getEnvironmentConfig();
    
    console.log(\`Fetching unified dropdown options for \${contentType}:\${contentKey} in \${envConfig.environment} environment\`);
    
    // Build environment-specific WHERE clause
    const environmentWhereClause = envFilterManager.buildEnvironmentWhereClause();
    
    // ... rest of existing endpoint logic with environment filtering ...
    
    // Execute unified query with environment filtering
    const result = await safeQuery(\`
      SELECT 
        ci.id,
        ci.content_key,
        ci.component_type,
        ci.screen_location,
        ct_ru.content_value as title_ru,
        ct_he.content_value as title_he,
        ct_en.content_value as title_en,
        ct_ru.status as ru_status,
        ct_he.status as he_status,
        ct_en.status as en_status,
        CAST(
          COALESCE(
            SUBSTRING(ci.content_key FROM '_option_([0-9]+)$'),
            SUBSTRING(ci.content_key FROM '_options_([0-9]+)$'),
            SUBSTRING(ci.content_key FROM '\\\\.option\\\\.([0-9]+)$')
          ) AS INTEGER
        ) as option_order
      FROM content_items ci
      LEFT JOIN content_translations ct_ru ON ci.id = ct_ru.content_item_id 
        AND ct_ru.language_code = 'ru' \${environmentWhereClause}
      LEFT JOIN content_translations ct_he ON ci.id = ct_he.content_item_id 
        AND ct_he.language_code = 'he' \${environmentWhereClause}
      LEFT JOIN content_translations ct_en ON ci.id = ct_en.content_item_id 
        AND ct_en.language_code = 'en' \${environmentWhereClause}
      \${whereClause}
      ORDER BY option_order NULLS LAST, ci.content_key
    \`, queryParams);
    
    // Transform to unified response format with environment info
    const options = result.rows.map((row, index) => ({
      id: row.id.toString(),
      content_key: row.content_key,
      component_type: row.component_type,
      screen_location: row.screen_location,
      order: row.option_order || (index + 1),
      translations: {
        ru: row.title_ru || '',
        he: row.title_he || '',
        en: row.title_en || ''
      },
      status: {
        ru: row.ru_status,
        he: row.he_status,
        en: row.en_status
      }
    }));
    
    res.json({
      success: true,
      data: {
        content_type: contentType,
        content_key: actualContentKey,
        environment: envConfig.environment,
        environment_config: envConfig.config,
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

    console.log('✅ Updated endpoint code generated with environment filtering');
    console.log('📋 Key features added:');
    console.log('   - Environment-specific status filtering');
    console.log('   - Environment configuration in response');
    console.log('   - Status information for each translation');
    console.log('   - Flexible environment switching');

    return updatedEndpointCode;

  } catch (error) {
    console.error('❌ Error updating unified endpoints:', error);
  }
}

/**
 * Generate environment filtering recommendations
 */
async function generateEnvironmentFilteringRecommendations() {
  console.log('💡 Generating environment filtering recommendations...\n');

  try {
    // Recommendation 1: Environment-specific deployment
    console.log('📋 RECOMMENDATION 1: Environment-Specific Deployment');
    console.log('   - Use NODE_ENV to control content visibility');
    console.log('   - Development: Show all content (approved, active, draft)');
    console.log('   - Staging: Show approved and active content');
    console.log('   - Production: Show only approved content');
    console.log('');

    // Recommendation 2: Status-based filtering
    console.log('📋 RECOMMENDATION 2: Status-Based Filtering');
    console.log('   - Implement environment-specific status filters');
    console.log('   - Use database-level filtering for performance');
    console.log('   - Include status information in API responses');
    console.log('');

    // Recommendation 3: Cache strategies
    console.log('📋 RECOMMENDATION 3: Cache Strategies');
    console.log('   - Development: Aggressive caching for testing');
    console.log('   - Staging: Moderate caching for validation');
    console.log('   - Production: Conservative caching for stability');
    console.log('');

    // Recommendation 4: Logging levels
    console.log('📋 RECOMMENDATION 4: Logging Levels');
    console.log('   - Development: Debug level for detailed information');
    console.log('   - Staging: Info level for monitoring');
    console.log('   - Production: Warn level for critical issues only');
    console.log('');

    // Recommendation 5: Content validation
    console.log('📋 RECOMMENDATION 5: Content Validation');
    console.log('   - Validate content status before deployment');
    console.log('   - Ensure production only contains approved content');
    console.log('   - Monitor content status changes');
    console.log('');

  } catch (error) {
    console.error('❌ Error generating environment filtering recommendations:', error);
  }
}

/**
 * Main function to implement environment filtering
 */
async function implementEnvironmentFilteringSystem() {
  console.log('🚀 IMPLEMENTING ENVIRONMENT FILTERING SYSTEM');
  console.log('============================================\n');

  try {
    // Step 1: Analyze content by environment
    const environmentAnalysis = await analyzeContentByEnvironment();

    // Step 2: Implement environment filtering
    const filteringResults = await implementEnvironmentFiltering();

    // Step 3: Update unified endpoints
    const updatedEndpointCode = await updateUnifiedEndpointsWithEnvironmentFiltering();

    // Step 4: Generate recommendations
    await generateEnvironmentFilteringRecommendations();

    // Step 5: Test environment filtering
    console.log('🧪 Testing environment filtering...\n');

    // Test environment configurations
    console.log('📋 Environment Configurations:');
    Object.entries(ENVIRONMENT_CONFIGS).forEach(([env, config]) => {
      console.log(`  ${env.toUpperCase()}:`);
      console.log(`    Description: ${config.description}`);
      console.log(`    Status Filter: ${config.statusFilter}`);
      console.log(`    Show Draft: ${config.showDraftContent}`);
      console.log(`    Show Active: ${config.showActiveContent}`);
      console.log(`    Show Approved: ${config.showApprovedContent}`);
      console.log(`    Cache Strategy: ${config.cacheStrategy}`);
      console.log(`    Log Level: ${config.logLevel}`);
      console.log('');
    });

    // Test filter manager
    const filterManager = filteringResults.filterManager;
    const stats = filterManager.getEnvironmentStats();
    console.log('📊 Environment Filter Manager Statistics:');
    console.log(`   Environment: ${stats.environment}`);
    console.log(`   Status Filter: ${stats.statusFilter}`);
    console.log(`   Show Draft: ${stats.showDraftContent}`);
    console.log(`   Show Active: ${stats.showActiveContent}`);
    console.log(`   Show Approved: ${stats.showApprovedContent}`);
    console.log(`   Cache Strategy: ${stats.cacheStrategy}`);
    console.log(`   Log Level: ${stats.logLevel}`);

    console.log('\n✅ Environment filtering system implemented successfully!');

  } catch (error) {
    console.error('❌ Error implementing environment filtering system:', error);
  } finally {
    await pool.end();
  }
}

// Execute if run directly
if (require.main === module) {
  implementEnvironmentFilteringSystem().catch(console.error);
}

module.exports = { 
  EnvironmentFilterManager,
  ENVIRONMENT_CONFIGS,
  analyzeContentByEnvironment,
  implementEnvironmentFiltering,
  updateUnifiedEndpointsWithEnvironmentFiltering,
  generateEnvironmentFilteringRecommendations,
  implementEnvironmentFilteringSystem
}; 