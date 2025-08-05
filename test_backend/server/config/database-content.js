import pg from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const { Pool } = pg;

// Content database configuration
export const contentConfig = {
  name: 'bankim_content',
  host: 'shortline.proxy.rlwy.net',
  port: 33452,
  database: 'railway',
  connectionString: process.env.CONTENT_DATABASE_URL || 'postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway',
  ssl: { rejectUnauthorized: false },
  tables: {
    content: 'test_content',
    pages: 'pages',
    articles: 'articles',
    media: 'media'
  }
};

// Create connection pool for content database
export const contentPool = new Pool({
  connectionString: contentConfig.connectionString,
  ssl: contentConfig.ssl,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection
export const testContentConnection = async () => {
  try {
    const client = await contentPool.connect();
    console.log('✅ Connected to bankim_content database');
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Content database connection failed:', error.message);
    return false;
  }
};

// Content database operations
export const contentOperations = {
  
  // Get all content items with translations
  getAllContentItems: async () => {
    const client = await contentPool.connect();
    try {
      const result = await client.query(`
        SELECT 
          ci.id, ci.content_key, ci.content_type, ci.category, 
          ci.screen_location, ci.component_type, ci.description, 
          ci.is_active, ci.created_at, ci.updated_at,
          json_agg(
            json_build_object(
              'language_code', ct.language_code,
              'content_value', ct.content_value,
              'status', ct.status,
              'is_default', ct.is_default
            )
          ) as translations
        FROM content_items ci
        LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
        WHERE ci.is_active = true
        GROUP BY ci.id, ci.content_key, ci.content_type, ci.category, 
                 ci.screen_location, ci.component_type, ci.description, 
                 ci.is_active, ci.created_at, ci.updated_at
        ORDER BY ci.created_at DESC
      `);
      return result.rows;
    } catch (error) {
      console.error('Error getting content items:', error);
      return [];
    } finally {
      client.release();
    }
  },

  // Get content item by ID with translations
  getContentItemById: async (id) => {
    const client = await contentPool.connect();
    try {
      const result = await client.query(`
        SELECT 
          ci.id, ci.content_key, ci.content_type, ci.category, 
          ci.screen_location, ci.component_type, ci.description, 
          ci.is_active, ci.created_at, ci.updated_at,
          json_agg(
            json_build_object(
              'language_code', ct.language_code,
              'content_value', ct.content_value,
              'status', ct.status,
              'is_default', ct.is_default
            )
          ) as translations
        FROM content_items ci
        LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
        WHERE ci.id = $1
        GROUP BY ci.id, ci.content_key, ci.content_type, ci.category, 
                 ci.screen_location, ci.component_type, ci.description, 
                 ci.is_active, ci.created_at, ci.updated_at
      `, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting content item:', error);
      return null;
    } finally {
      client.release();
    }
  },

  // Get all content categories
  getContentCategories: async () => {
    const client = await contentPool.connect();
    try {
      const result = await client.query(`
        SELECT * FROM content_categories 
        WHERE is_active = true 
        ORDER BY sort_order, name
      `);
      return result.rows;
    } catch (error) {
      console.error('Error getting content categories:', error);
      return [];
    } finally {
      client.release();
    }
  },

  // Get all languages
  getLanguages: async () => {
    const client = await contentPool.connect();
    try {
      const result = await client.query(`
        SELECT * FROM languages 
        WHERE is_active = true 
        ORDER BY is_default DESC, name
      `);
      return result.rows;
    } catch (error) {
      console.error('Error getting languages:', error);
      return [];
    } finally {
      client.release();
    }
  },

  // Update content translation
  updateContentTranslation: async (contentItemId, languageCode, contentValue, userId = 1) => {
    const client = await contentPool.connect();
    try {
      const result = await client.query(`
        UPDATE content_translations 
        SET content_value = $1, updated_at = CURRENT_TIMESTAMP, created_by = $2
        WHERE content_item_id = $3 AND language_code = $4
        RETURNING *
      `, [contentValue, userId, contentItemId, languageCode]);
      
      if (result.rows.length === 0) {
        // Create new translation if it doesn't exist
        const insertResult = await client.query(`
          INSERT INTO content_translations (content_item_id, language_code, content_value, created_by)
          VALUES ($1, $2, $3, $4)
          RETURNING *
        `, [contentItemId, languageCode, contentValue, userId]);
        return insertResult.rows[0];
      }
      
      return result.rows[0];
    } catch (error) {
      console.error('Error updating content translation:', error);
      return null;
    } finally {
      client.release();
    }
  },

  // Create new content item
  createContentItem: async (contentData, userId = 1) => {
    const client = await contentPool.connect();
    try {
      await client.query('BEGIN');
      
      // Create content item
      const itemResult = await client.query(`
        INSERT INTO content_items (content_key, content_type, category, screen_location, component_type, description, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `, [contentData.content_key, contentData.content_type, contentData.category, 
          contentData.screen_location, contentData.component_type, contentData.description, userId]);
      
      const contentItem = itemResult.rows[0];
      
      // Create translations for each language
      if (contentData.translations && contentData.translations.length > 0) {
        for (const translation of contentData.translations) {
          await client.query(`
            INSERT INTO content_translations (content_item_id, language_code, content_value, created_by)
            VALUES ($1, $2, $3, $4)
          `, [contentItem.id, translation.language_code, translation.content_value, userId]);
        }
      }
      
      await client.query('COMMIT');
      return contentItem;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creating content item:', error);
      return null;
    } finally {
      client.release();
    }
  },

  // UI Settings Operations
  
  // Get all UI settings
  getUISettings: async () => {
    const client = await contentPool.connect();
    try {
      const result = await client.query(`
        SELECT id, setting_key, setting_value, description, created_at, updated_at
        FROM ui_settings 
        ORDER BY setting_key
      `);
      return result.rows;
    } catch (error) {
      console.error('Error getting UI settings:', error);
      return [];
    } finally {
      client.release();
    }
  },

  // Get specific UI setting by key
  getUISettingByKey: async (settingKey) => {
    const client = await contentPool.connect();
    try {
      const result = await client.query(`
        SELECT id, setting_key, setting_value, description, created_at, updated_at
        FROM ui_settings 
        WHERE setting_key = $1
      `, [settingKey]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting UI setting:', error);
      return null;
    } finally {
      client.release();
    }
  },

  // Update UI setting
  updateUISetting: async (settingKey, settingValue) => {
    const client = await contentPool.connect();
    try {
      const result = await client.query(`
        UPDATE ui_settings 
        SET setting_value = $1, updated_at = CURRENT_TIMESTAMP
        WHERE setting_key = $2
        RETURNING id, setting_key, setting_value, description, created_at, updated_at
      `, [settingValue, settingKey]);
      
      if (result.rows.length === 0) {
        // Create new setting if it doesn't exist
        const insertResult = await client.query(`
          INSERT INTO ui_settings (setting_key, setting_value, description)
          VALUES ($1, $2, $3)
          RETURNING id, setting_key, setting_value, description, created_at, updated_at
        `, [settingKey, settingValue, 'UI setting']);
        return insertResult.rows[0];
      }
      
      return result.rows[0];
    } catch (error) {
      console.error('Error updating UI setting:', error);
      return null;
    } finally {
      client.release();
    }
  },
  
  // Get database info
  getDbInfo: async () => {
    const client = await contentPool.connect();
    try {
      const tablesResult = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);
      
      return {
        database: contentConfig.name,
        host: contentConfig.host,
        port: contentConfig.port,
        tables: tablesResult.rows.map(t => t.table_name),
        environment: process.env.NODE_ENV || 'development'
      };
    } catch (error) {
      console.error('Error getting database info:', error);
      return null;
    } finally {
      client.release();
    }
  }
};

// Initialize content database
export const initializeContentDatabase = async () => {
  console.log('🚀 Initializing Content Database...');
  console.log(`📊 Database: ${contentConfig.name}`);
  console.log(`🔗 Host: ${contentConfig.host}:${contentConfig.port}`);
  
  const connected = await testContentConnection();
  if (connected) {
    // Get db info to verify tables exist
    const dbInfo = await contentOperations.getDbInfo();
    if (dbInfo && dbInfo.tables.length > 0) {
      console.log('✅ Content database initialization complete');
      console.log(`📋 Found ${dbInfo.tables.length} tables: ${dbInfo.tables.join(', ')}`);
    } else {
      console.error('❌ Content database has no tables');
    }
  } else {
    console.error('❌ Content database initialization failed');
  }
}; 