/**
 * JSONB Dropdown Management Service
 * Handles all JSONB-based dropdown operations for the admin panel
 */

const { contentPool } = require('../config/database-content.js');
const NodeCache = require('node-cache');

// Initialize cache with 5-minute TTL
const contentCache = new NodeCache({ stdTTL: 300 });

class DropdownService {
  /**
   * Get all dropdowns for a specific screen
   * @param {string} screenLocation - The screen location identifier
   * @param {string} language - Language code (en, he, ru)
   * @returns {Array} Array of dropdown configurations
   */
  async getScreenDropdowns(screenLocation, language = 'en') {
    const cacheKey = `dropdowns_jsonb_${screenLocation}_${language}`;
    
    // Check cache first
    const cached = contentCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const client = await contentPool.connect();
    try {
      const query = `
        SELECT 
          dropdown_key,
          field_name,
          dropdown_data,
          is_active,
          updated_at
        FROM dropdown_configs
        WHERE screen_location = $1 AND is_active = true
        ORDER BY field_name
      `;
      
      const result = await client.query(query, [screenLocation]);
      
      const dropdowns = result.rows.map(row => ({
        key: row.dropdown_key,
        field: row.field_name,
        label: row.dropdown_data?.label?.[language] || row.dropdown_data?.label?.en || '',
        placeholder: row.dropdown_data?.placeholder?.[language] || row.dropdown_data?.placeholder?.en || '',
        options: row.dropdown_data?.options?.map(opt => ({
          value: opt.value,
          text: opt.text?.[language] || opt.text?.en || ''
        })) || [],
        lastUpdated: row.updated_at
      }));

      // Cache the result
      contentCache.set(cacheKey, dropdowns);
      
      return dropdowns;
    } finally {
      client.release();
    }
  }

  /**
   * Get single dropdown configuration by key
   * @param {string} dropdownKey - Unique dropdown identifier
   * @returns {Object} Complete dropdown configuration with all languages
   */
  async getDropdownByKey(dropdownKey) {
    const cacheKey = `dropdown_single_${dropdownKey}`;
    
    // Check cache first
    const cached = contentCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const client = await contentPool.connect();
    try {
      const query = `
        SELECT 
          dropdown_key,
          screen_location,
          field_name,
          dropdown_data,
          business_path,
          is_active,
          created_at,
          updated_at,
          updated_by
        FROM dropdown_configs
        WHERE dropdown_key = $1
      `;
      
      const result = await client.query(query, [dropdownKey]);
      
      if (result.rows.length === 0) {
        return null;
      }

      const data = result.rows[0];
      
      // Cache the result
      contentCache.set(cacheKey, data);
      
      return data;
    } finally {
      client.release();
    }
  }

  /**
   * Update dropdown configuration
   * @param {string} dropdownKey - Unique dropdown identifier
   * @param {Object} dropdownData - JSONB data with all languages
   * @param {Object} user - User object from session
   * @returns {Object} Updated dropdown configuration
   */
  async updateDropdown(dropdownKey, dropdownData, user) {
    // Validate all languages are present
    if (!dropdownData.label?.en || !dropdownData.label?.he || !dropdownData.label?.ru) {
      throw new Error('All language labels are required (en, he, ru)');
    }

    const client = await contentPool.connect();
    try {
      await client.query('BEGIN');

      // Update the dropdown
      const updateQuery = `
        UPDATE dropdown_configs
        SET 
          dropdown_data = $1,
          updated_at = NOW(),
          updated_by = $2
        WHERE dropdown_key = $3
        RETURNING *
      `;
      
      const result = await client.query(updateQuery, [
        JSON.stringify(dropdownData),
        user?.email || 'admin',
        dropdownKey
      ]);

      if (result.rows.length === 0) {
        throw new Error(`Dropdown not found: ${dropdownKey}`);
      }

      // Log the change for audit
      await this.logDropdownChange(client, {
        dropdownKey,
        action: 'UPDATE',
        oldData: null, // Could fetch old data first if needed
        newData: dropdownData,
        user
      });

      await client.query('COMMIT');

      // Clear all related caches
      this.clearDropdownCache(dropdownKey);

      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Create new dropdown configuration
   * @param {string} screenLocation - Screen identifier
   * @param {string} fieldName - Field name
   * @param {Object} dropdownData - JSONB data with all languages
   * @param {Object} user - User object from session
   * @returns {Object} Created dropdown configuration
   */
  async createDropdown(screenLocation, fieldName, dropdownData, user) {
    // Validate all languages are present
    if (!dropdownData.label?.en || !dropdownData.label?.he || !dropdownData.label?.ru) {
      throw new Error('All language labels are required (en, he, ru)');
    }

    const dropdownKey = `${screenLocation}_${fieldName}`;
    
    const client = await contentPool.connect();
    try {
      await client.query('BEGIN');

      const insertQuery = `
        INSERT INTO dropdown_configs 
        (business_path, screen_location, field_name, dropdown_key, dropdown_data, created_by, updated_by)
        VALUES ('admin', $1, $2, $3, $4, $5, $5)
        ON CONFLICT (dropdown_key) 
        DO UPDATE SET 
          dropdown_data = $4,
          updated_at = NOW(),
          updated_by = $5
        RETURNING *
      `;
      
      const result = await client.query(insertQuery, [
        screenLocation,
        fieldName,
        dropdownKey,
        JSON.stringify(dropdownData),
        user?.email || 'admin'
      ]);

      // Log the change for audit
      await this.logDropdownChange(client, {
        dropdownKey,
        action: 'CREATE',
        oldData: null,
        newData: dropdownData,
        user
      });

      await client.query('COMMIT');

      // Clear related caches
      this.clearDropdownCache(dropdownKey);

      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Delete dropdown configuration (soft delete by setting is_active = false)
   * @param {string} dropdownKey - Unique dropdown identifier
   * @param {Object} user - User object from session
   * @returns {boolean} Success status
   */
  async deleteDropdown(dropdownKey, user) {
    const client = await contentPool.connect();
    try {
      await client.query('BEGIN');

      const deleteQuery = `
        UPDATE dropdown_configs
        SET 
          is_active = false,
          updated_at = NOW(),
          updated_by = $1
        WHERE dropdown_key = $2
        RETURNING *
      `;
      
      const result = await client.query(deleteQuery, [
        user?.email || 'admin',
        dropdownKey
      ]);

      if (result.rows.length === 0) {
        throw new Error(`Dropdown not found: ${dropdownKey}`);
      }

      // Log the change for audit
      await this.logDropdownChange(client, {
        dropdownKey,
        action: 'DELETE',
        oldData: result.rows[0].dropdown_data,
        newData: null,
        user
      });

      await client.query('COMMIT');

      // Clear related caches
      this.clearDropdownCache(dropdownKey);

      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get all available screens with dropdowns
   * @returns {Array} List of screen locations
   */
  async getAvailableScreens() {
    const cacheKey = 'dropdown_screens_list';
    
    // Check cache first
    const cached = contentCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const client = await contentPool.connect();
    try {
      const query = `
        SELECT DISTINCT 
          screen_location,
          COUNT(*) as dropdown_count
        FROM dropdown_configs
        WHERE is_active = true
        GROUP BY screen_location
        ORDER BY screen_location
      `;
      
      const result = await client.query(query);
      
      const screens = result.rows.map(row => ({
        screen: row.screen_location,
        dropdownCount: parseInt(row.dropdown_count)
      }));

      // Cache for 10 minutes
      contentCache.set(cacheKey, screens, 600);
      
      return screens;
    } finally {
      client.release();
    }
  }

  /**
   * Log dropdown changes for audit trail
   * @private
   */
  async logDropdownChange(client, { dropdownKey, action, oldData, newData, user }) {
    try {
      const auditQuery = `
        INSERT INTO dropdown_audit_log (
          dropdown_key,
          action_type,
          old_data,
          new_data,
          user_email,
          user_id,
          created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
      `;

      await client.query(auditQuery, [
        dropdownKey,
        action,
        oldData ? JSON.stringify(oldData) : null,
        newData ? JSON.stringify(newData) : null,
        user?.email || 'system',
        user?.id || null
      ]);
    } catch (error) {
      // Log error but don't fail the main operation
      console.error('Audit log error:', error);
    }
  }

  /**
   * Clear cache for dropdown and related screens
   * @private
   */
  clearDropdownCache(dropdownKey) {
    // Clear specific dropdown cache
    contentCache.del(`dropdown_single_${dropdownKey}`);
    
    // Clear all screen-based caches (pattern matching)
    const keys = contentCache.keys();
    keys.forEach(key => {
      if (key.startsWith('dropdowns_jsonb_') || key === 'dropdown_screens_list') {
        contentCache.del(key);
      }
    });
  }

  /**
   * Validate dropdown data structure
   * @param {Object} dropdownData - Data to validate
   * @returns {Object} Validation result
   */
  validateDropdownData(dropdownData) {
    const errors = [];
    
    // Check required fields
    if (!dropdownData.label) {
      errors.push('Label is required');
    } else {
      if (!dropdownData.label.en) errors.push('English label is required');
      if (!dropdownData.label.he) errors.push('Hebrew label is required');
      if (!dropdownData.label.ru) errors.push('Russian label is required');
    }
    
    // Check placeholder (optional but if present, needs all languages)
    if (dropdownData.placeholder) {
      if (!dropdownData.placeholder.en) errors.push('English placeholder is required');
      if (!dropdownData.placeholder.he) errors.push('Hebrew placeholder is required');
      if (!dropdownData.placeholder.ru) errors.push('Russian placeholder is required');
    }
    
    // Check options
    if (!dropdownData.options || !Array.isArray(dropdownData.options)) {
      errors.push('Options array is required');
    } else if (dropdownData.options.length === 0) {
      errors.push('At least one option is required');
    } else {
      dropdownData.options.forEach((option, index) => {
        if (!option.value) {
          errors.push(`Option ${index + 1}: value is required`);
        }
        if (!option.text) {
          errors.push(`Option ${index + 1}: text is required`);
        } else {
          if (!option.text.en) errors.push(`Option ${index + 1}: English text is required`);
          if (!option.text.he) errors.push(`Option ${index + 1}: Hebrew text is required`);
          if (!option.text.ru) errors.push(`Option ${index + 1}: Russian text is required`);
        }
      });
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Export singleton instance
module.exports = new DropdownService();