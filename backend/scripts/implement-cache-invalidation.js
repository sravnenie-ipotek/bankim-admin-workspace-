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
 * Cache Invalidation System for Dropdown Content
 * Following @dropDownDBlogic patterns for consistent cache management
 */

class DropdownCacheManager {
  constructor() {
    this.cacheVersion = 1;
    this.cacheKeys = new Set();
    this.invalidationQueue = [];
  }

  /**
   * Generate cache key for dropdown content
   * @param {string} contentType - mortgage, mortgage-refi, credit, credit-refi, menu, general
   * @param {string} contentKey - The specific content key
   * @param {string} endpoint - options, container, validate
   * @returns {string} Cache key
   */
  generateCacheKey(contentType, contentKey, endpoint = 'options') {
    return `dropdown:${contentType}:${contentKey}:${endpoint}:v${this.cacheVersion}`;
  }

  /**
   * Generate ETag for dropdown content
   * @param {string} contentType - Content type
   * @param {string} contentKey - Content key
   * @param {number} optionsCount - Number of options
   * @param {string} lastModified - Last modification timestamp
   * @returns {string} ETag value
   */
  generateETag(contentType, contentKey, optionsCount, lastModified) {
    const hash = `${contentType}-${contentKey}-${optionsCount}-${lastModified}`;
    return `"${hash}"`;
  }

  /**
   * Invalidate cache for specific dropdown content
   * @param {string} contentType - Content type
   * @param {string} contentKey - Content key
   * @param {string} reason - Reason for invalidation
   */
  invalidateCache(contentType, contentKey, reason = 'content_updated') {
    const cacheKeys = [
      this.generateCacheKey(contentType, contentKey, 'options'),
      this.generateCacheKey(contentType, contentKey, 'container'),
      this.generateCacheKey(contentType, contentKey, 'validate')
    ];

    cacheKeys.forEach(key => {
      this.cacheKeys.delete(key);
      this.invalidationQueue.push({
        key,
        contentType,
        contentKey,
        reason,
        timestamp: new Date().toISOString()
      });
    });

    console.log(`🔄 Cache invalidated for ${contentType}:${contentKey} (${reason})`);
  }

  /**
   * Invalidate cache for all dropdown content of a specific type
   * @param {string} contentType - Content type to invalidate
   * @param {string} reason - Reason for invalidation
   */
  invalidateContentTypeCache(contentType, reason = 'content_type_updated') {
    const keysToRemove = [];
    
    this.cacheKeys.forEach(key => {
      if (key.includes(`dropdown:${contentType}:`)) {
        keysToRemove.push(key);
      }
    });

    keysToRemove.forEach(key => {
      this.cacheKeys.delete(key);
      this.invalidationQueue.push({
        key,
        contentType,
        contentKey: 'all',
        reason,
        timestamp: new Date().toISOString()
      });
    });

    console.log(`🔄 Cache invalidated for all ${contentType} content (${reason})`);
  }

  /**
   * Invalidate cache for related dropdown content
   * @param {string} contentType - Content type
   * @param {string} baseContentKey - Base content key
   * @param {string} reason - Reason for invalidation
   */
  invalidateRelatedCache(contentType, baseContentKey, reason = 'related_content_updated') {
    // Find all content keys that start with the base key
    const keysToRemove = [];
    
    this.cacheKeys.forEach(key => {
      if (key.includes(`dropdown:${contentType}:`) && key.includes(baseContentKey)) {
        keysToRemove.push(key);
      }
    });

    keysToRemove.forEach(key => {
      this.cacheKeys.delete(key);
      this.invalidationQueue.push({
        key,
        contentType,
        contentKey: baseContentKey,
        reason,
        timestamp: new Date().toISOString()
      });
    });

    console.log(`🔄 Cache invalidated for related ${contentType}:${baseContentKey} content (${reason})`);
  }

  /**
   * Force cache version increment (nuclear option)
   * @param {string} reason - Reason for version increment
   */
  incrementCacheVersion(reason = 'cache_version_increment') {
    this.cacheVersion++;
    this.cacheKeys.clear();
    
    this.invalidationQueue.push({
      key: 'all',
      contentType: 'all',
      contentKey: 'all',
      reason,
      timestamp: new Date().toISOString()
    });

    console.log(`🔄 Cache version incremented to ${this.cacheVersion} (${reason})`);
  }

  /**
   * Get cache invalidation statistics
   * @returns {Object} Cache statistics
   */
  getCacheStats() {
    return {
      cacheVersion: this.cacheVersion,
      activeCacheKeys: this.cacheKeys.size,
      invalidationQueueLength: this.invalidationQueue.length,
      recentInvalidations: this.invalidationQueue.slice(-10)
    };
  }

  /**
   * Clear invalidation queue
   */
  clearInvalidationQueue() {
    this.invalidationQueue = [];
    console.log('🧹 Cache invalidation queue cleared');
  }
}

/**
 * Database-triggered cache invalidation
 * Monitors content_translations table for changes
 */
async function setupDatabaseCacheInvalidation() {
  console.log('🔧 Setting up database-triggered cache invalidation...\n');

  try {
    // Create cache invalidation log table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cache_invalidation_log (
        id BIGSERIAL PRIMARY KEY,
        content_item_id BIGINT REFERENCES content_items(id),
        content_key VARCHAR,
        component_type VARCHAR,
        screen_location VARCHAR,
        language_code VARCHAR(2),
        invalidation_type VARCHAR(50),
        reason VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create function to log cache invalidations
    await pool.query(`
      CREATE OR REPLACE FUNCTION log_cache_invalidation()
      RETURNS TRIGGER AS $$
      BEGIN
        INSERT INTO cache_invalidation_log (
          content_item_id,
          content_key,
          component_type,
          screen_location,
          language_code,
          invalidation_type,
          reason
        ) VALUES (
          COALESCE(NEW.content_item_id, OLD.content_item_id),
          (SELECT content_key FROM content_items WHERE id = COALESCE(NEW.content_item_id, OLD.content_item_id)),
          (SELECT component_type FROM content_items WHERE id = COALESCE(NEW.content_item_id, OLD.content_item_id)),
          (SELECT screen_location FROM content_items WHERE id = COALESCE(NEW.content_item_id, OLD.content_item_id)),
          COALESCE(NEW.language_code, OLD.language_code),
          TG_OP,
          CASE 
            WHEN TG_OP = 'INSERT' THEN 'new_translation'
            WHEN TG_OP = 'UPDATE' THEN 'translation_updated'
            WHEN TG_OP = 'DELETE' THEN 'translation_deleted'
          END
        );
        RETURN COALESCE(NEW, OLD);
      END;
      $$ LANGUAGE plpgsql
    `);

    // Create trigger for content_translations table
    await pool.query(`
      DROP TRIGGER IF EXISTS cache_invalidation_trigger ON content_translations
    `);

    await pool.query(`
      CREATE TRIGGER cache_invalidation_trigger
      AFTER INSERT OR UPDATE OR DELETE ON content_translations
      FOR EACH ROW EXECUTE FUNCTION log_cache_invalidation()
    `);

    console.log('✅ Database cache invalidation triggers created');

  } catch (error) {
    console.error('❌ Error setting up database cache invalidation:', error);
  }
}

/**
 * Analyze cache invalidation patterns
 */
async function analyzeCacheInvalidationPatterns() {
  console.log('📊 Analyzing cache invalidation patterns...\n');

  try {
    // Check recent cache invalidations
    const recentInvalidations = await pool.query(`
      SELECT 
        content_key,
        component_type,
        screen_location,
        language_code,
        invalidation_type,
        reason,
        COUNT(*) as invalidation_count
      FROM cache_invalidation_log
      WHERE created_at >= NOW() - INTERVAL '24 hours'
      GROUP BY content_key, component_type, screen_location, language_code, invalidation_type, reason
      ORDER BY invalidation_count DESC
      LIMIT 10
    `);

    console.log('📋 Recent cache invalidations (last 24 hours):');
    recentInvalidations.rows.forEach((row, i) => {
      console.log(`  ${i+1}. ${row.content_key} (${row.component_type}) - ${row.invalidation_type} - ${row.invalidation_count} times`);
    });

    // Analyze dropdown-specific invalidations
    const dropdownInvalidations = await pool.query(`
      SELECT 
        content_key,
        component_type,
        screen_location,
        COUNT(*) as invalidation_count
      FROM cache_invalidation_log
      WHERE created_at >= NOW() - INTERVAL '7 days'
        AND component_type IN ('dropdown', 'option', 'dropdown_option', 'placeholder', 'label')
      GROUP BY content_key, component_type, screen_location
      ORDER BY invalidation_count DESC
      LIMIT 10
    `);

    console.log('\n📋 Dropdown-specific cache invalidations (last 7 days):');
    dropdownInvalidations.rows.forEach((row, i) => {
      console.log(`  ${i+1}. ${row.content_key} (${row.component_type}, ${row.screen_location}) - ${row.invalidation_count} times`);
    });

    // Analyze content type patterns
    const contentTypePatterns = await pool.query(`
      SELECT 
        CASE 
          WHEN screen_location LIKE 'mortgage_step%' THEN 'mortgage'
          WHEN screen_location LIKE 'refinance_mortgage%' THEN 'mortgage-refi'
          WHEN screen_location LIKE 'credit_step%' THEN 'credit'
          WHEN screen_location LIKE 'refinance_credit%' THEN 'credit-refi'
          WHEN screen_location = 'main_page' THEN 'menu'
          WHEN screen_location = 'general' THEN 'general'
          ELSE 'other'
        END as content_type,
        COUNT(*) as invalidation_count
      FROM cache_invalidation_log
      WHERE created_at >= NOW() - INTERVAL '7 days'
        AND component_type IN ('dropdown', 'option', 'dropdown_option', 'placeholder', 'label')
      GROUP BY content_type
      ORDER BY invalidation_count DESC
    `);

    console.log('\n📋 Cache invalidation by content type (last 7 days):');
    contentTypePatterns.rows.forEach((row, i) => {
      console.log(`  ${i+1}. ${row.content_type}: ${row.invalidation_count} invalidations`);
    });

  } catch (error) {
    console.error('❌ Error analyzing cache invalidation patterns:', error);
  }
}

/**
 * Implement smart cache invalidation strategies
 */
async function implementSmartCacheInvalidation() {
  console.log('🧠 Implementing smart cache invalidation strategies...\n');

  try {
    // Strategy 1: Invalidate related content when dropdown container changes
    const containerChanges = await pool.query(`
      SELECT 
        content_key,
        screen_location,
        COUNT(*) as change_count
      FROM cache_invalidation_log
      WHERE created_at >= NOW() - INTERVAL '1 hour'
        AND component_type = 'dropdown'
      GROUP BY content_key, screen_location
      ORDER BY change_count DESC
    `);

    console.log('📋 Container changes requiring related invalidation:');
    containerChanges.rows.forEach((row, i) => {
      console.log(`  ${i+1}. ${row.content_key} (${row.screen_location}) - ${row.change_count} changes`);
    });

    // Strategy 2: Invalidate options when container changes
    const optionInvalidations = await pool.query(`
      SELECT 
        ci.content_key,
        ci.screen_location,
        COUNT(cil.id) as invalidation_count
      FROM content_items ci
      LEFT JOIN cache_invalidation_log cil ON ci.content_key LIKE cil.content_key || '_%'
        AND cil.created_at >= NOW() - INTERVAL '1 hour'
      WHERE ci.component_type IN ('option', 'dropdown_option')
        AND ci.is_active = TRUE
      GROUP BY ci.content_key, ci.screen_location
      HAVING COUNT(cil.id) > 0
      ORDER BY invalidation_count DESC
      LIMIT 10
    `);

    console.log('\n📋 Option invalidations triggered by container changes:');
    optionInvalidations.rows.forEach((row, i) => {
      console.log(`  ${i+1}. ${row.content_key} (${row.screen_location}) - ${row.invalidation_count} invalidations`);
    });

    // Strategy 3: Batch invalidation for efficiency
    const batchInvalidations = await pool.query(`
      SELECT 
        screen_location,
        COUNT(*) as invalidation_count,
        COUNT(DISTINCT content_key) as unique_content_keys
      FROM cache_invalidation_log
      WHERE created_at >= NOW() - INTERVAL '1 hour'
        AND component_type IN ('dropdown', 'option', 'dropdown_option', 'placeholder', 'label')
      GROUP BY screen_location
      HAVING COUNT(*) > 5
      ORDER BY invalidation_count DESC
    `);

    console.log('\n📋 Batch invalidation opportunities:');
    batchInvalidations.rows.forEach((row, i) => {
      console.log(`  ${i+1}. ${row.screen_location}: ${row.invalidation_count} invalidations, ${row.unique_content_keys} unique keys`);
    });

  } catch (error) {
    console.error('❌ Error implementing smart cache invalidation:', error);
  }
}

/**
 * Generate cache invalidation recommendations
 */
async function generateCacheRecommendations() {
  console.log('💡 Generating cache invalidation recommendations...\n');

  try {
    const cacheManager = new DropdownCacheManager();

    // Recommendation 1: Content type-based invalidation
    console.log('📋 RECOMMENDATION 1: Content Type-Based Invalidation');
    console.log('   - Invalidate all mortgage content when any mortgage item changes');
    console.log('   - Invalidate all mortgage-refi content when any refinance item changes');
    console.log('   - Use cache version increment for major content updates');
    console.log('');

    // Recommendation 2: Related content invalidation
    console.log('📋 RECOMMENDATION 2: Related Content Invalidation');
    console.log('   - When dropdown container changes, invalidate all related options');
    console.log('   - When placeholder changes, invalidate container cache');
    console.log('   - When label changes, invalidate container cache');
    console.log('');

    // Recommendation 3: Batch invalidation
    console.log('📋 RECOMMENDATION 3: Batch Invalidation');
    console.log('   - Group invalidations by screen_location for efficiency');
    console.log('   - Use database triggers for automatic invalidation');
    console.log('   - Implement invalidation queue for high-frequency updates');
    console.log('');

    // Recommendation 4: Smart ETag generation
    console.log('📋 RECOMMENDATION 4: Smart ETag Generation');
    console.log('   - Include content type, key, and options count in ETag');
    console.log('   - Include last modification timestamp in ETag');
    console.log('   - Use hash-based ETags for better cache control');
    console.log('');

    // Recommendation 5: Cache warming
    console.log('📋 RECOMMENDATION 5: Cache Warming');
    console.log('   - Pre-populate cache for frequently accessed dropdowns');
    console.log('   - Warm cache after content updates');
    console.log('   - Use background jobs for cache warming');
    console.log('');

    return cacheManager;

  } catch (error) {
    console.error('❌ Error generating cache recommendations:', error);
  }
}

/**
 * Main function to implement cache invalidation
 */
async function implementCacheInvalidation() {
  console.log('🚀 IMPLEMENTING CACHE INVALIDATION SYSTEM');
  console.log('=========================================\n');

  try {
    // Step 1: Setup database triggers
    await setupDatabaseCacheInvalidation();

    // Step 2: Analyze patterns
    await analyzeCacheInvalidationPatterns();

    // Step 3: Implement smart strategies
    await implementSmartCacheInvalidation();

    // Step 4: Generate recommendations
    const cacheManager = await generateCacheRecommendations();

    // Step 5: Test cache invalidation
    console.log('🧪 Testing cache invalidation...\n');

    // Test individual invalidation
    cacheManager.invalidateCache('mortgage', 'calculate_mortgage_type', 'test_invalidation');
    cacheManager.invalidateCache('mortgage-refi', 'mortgage_refinance_bank', 'test_invalidation');

    // Test content type invalidation
    cacheManager.invalidateContentTypeCache('mortgage', 'test_content_type_invalidation');

    // Test related content invalidation
    cacheManager.invalidateRelatedCache('mortgage', 'calculate_mortgage', 'test_related_invalidation');

    // Test version increment
    cacheManager.incrementCacheVersion('test_version_increment');

    // Display cache stats
    const stats = cacheManager.getCacheStats();
    console.log('📊 Cache Manager Statistics:');
    console.log(`   Cache Version: ${stats.cacheVersion}`);
    console.log(`   Active Cache Keys: ${stats.activeCacheKeys}`);
    console.log(`   Invalidation Queue Length: ${stats.invalidationQueueLength}`);
    console.log(`   Recent Invalidations: ${stats.recentInvalidations.length}`);

    console.log('\n✅ Cache invalidation system implemented successfully!');

  } catch (error) {
    console.error('❌ Error implementing cache invalidation:', error);
  } finally {
    await pool.end();
  }
}

// Execute if run directly
if (require.main === module) {
  implementCacheInvalidation().catch(console.error);
}

module.exports = { 
  DropdownCacheManager,
  setupDatabaseCacheInvalidation,
  analyzeCacheInvalidationPatterns,
  implementSmartCacheInvalidation,
  generateCacheRecommendations,
  implementCacheInvalidation
}; 