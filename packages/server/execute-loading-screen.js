const { Pool } = require('pg');
require('dotenv').config({ path: '../../.env' });

// Database configuration for content database
const contentPool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const section4_1_10_ContentItems = [
  // Loading Messages
  { content_key: 'loading_screen.title', component_type: 'text', category: 'heading', description: 'Loading screen title' },
  { content_key: 'loading_screen.message.processing', component_type: 'text', category: 'text', description: 'Processing application message' },
  { content_key: 'loading_screen.message.calculating', component_type: 'text', category: 'text', description: 'Calculating terms message' },
  { content_key: 'loading_screen.message.validating', component_type: 'text', category: 'text', description: 'Validating data message' },
  { content_key: 'loading_screen.message.please_wait', component_type: 'text', category: 'text', description: 'Please wait message' },
  { content_key: 'loading_screen.progress_indicator', component_type: 'text', category: 'text', description: 'Progress indicator text' }
];

const section4_1_10_Translations = [
  // Loading Messages
  { content_key: 'loading_screen.title', language_code: 'ru', content_value: 'Обработка заявки' },
  { content_key: 'loading_screen.title', language_code: 'he', content_value: 'עיבוד הבקשה' },
  { content_key: 'loading_screen.title', language_code: 'en', content_value: 'Processing Application' },
  
  { content_key: 'loading_screen.message.processing', language_code: 'ru', content_value: 'Обрабатываем вашу заявку на рефинансирование...' },
  { content_key: 'loading_screen.message.processing', language_code: 'he', content_value: 'מעבדים את בקשת המימון מחדש שלך...' },
  { content_key: 'loading_screen.message.processing', language_code: 'en', content_value: 'Processing your refinance application...' },
  
  { content_key: 'loading_screen.message.calculating', language_code: 'ru', content_value: 'Рассчитываем лучшие условия для вас...' },
  { content_key: 'loading_screen.message.calculating', language_code: 'he', content_value: 'מחשבים את התנאים הטובים ביותר עבורך...' },
  { content_key: 'loading_screen.message.calculating', language_code: 'en', content_value: 'Calculating the best terms for you...' },
  
  { content_key: 'loading_screen.message.validating', language_code: 'ru', content_value: 'Проверяем предоставленные данные...' },
  { content_key: 'loading_screen.message.validating', language_code: 'he', content_value: 'בודקים את הנתונים שסופקו...' },
  { content_key: 'loading_screen.message.validating', language_code: 'en', content_value: 'Validating the provided data...' },
  
  { content_key: 'loading_screen.message.please_wait', language_code: 'ru', content_value: 'Пожалуйста, подождите. Это может занять несколько минут.' },
  { content_key: 'loading_screen.message.please_wait', language_code: 'he', content_value: 'אנא המתן. זה עשוי לקחת כמה דקות.' },
  { content_key: 'loading_screen.message.please_wait', language_code: 'en', content_value: 'Please wait. This may take a few minutes.' },
  
  { content_key: 'loading_screen.progress_indicator', language_code: 'ru', content_value: 'Выполнено...' },
  { content_key: 'loading_screen.progress_indicator', language_code: 'he', content_value: 'הושלם...' },
  { content_key: 'loading_screen.progress_indicator', language_code: 'en', content_value: 'Completed...' }
];

async function executeSection4_1_10() {
  const client = await contentPool.connect();
  
  try {
    await client.query('BEGIN');
    console.log('🚀 Starting Section 4.1.10: Loading Screen implementation...');

    // Insert content items
    console.log('📝 Inserting 6 content items for loading_screen...');
    for (const item of section4_1_10_ContentItems) {
      await client.query(`
        INSERT INTO content_items (content_key, component_type, category, screen_location, description, is_active, page_number, created_at, updated_at) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
        [item.content_key, item.component_type, item.category, 'loading_screen', item.description, true, 1]
      );
    }

    // Insert translations
    console.log('🌐 Inserting 18 trilingual translations (6 items × 3 languages)...');
    for (const translation of section4_1_10_Translations) {
      // Get content_item_id
      const itemResult = await client.query(
        'SELECT id FROM content_items WHERE content_key = $1',
        [translation.content_key]
      );
      
      if (itemResult.rows.length > 0) {
        await client.query(`
          INSERT INTO content_translations (content_item_id, language_code, content_value, created_at, updated_at)
          VALUES ($1, $2, $3, NOW(), NOW())`,
          [itemResult.rows[0].id, translation.language_code, translation.content_value]
        );
      }
    }

    await client.query('COMMIT');
    console.log('✅ Section 4.1.10 implementation completed successfully!');
    console.log('📊 Summary:');
    console.log('   • 6 content items created for loading_screen');
    console.log('   • 18 trilingual translations added (RU/HE/EN)');
    console.log('   • Screen location: loading_screen');
    console.log('   • Components: loading messages, progress indicators');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error implementing Section 4.1.10:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Execute if run directly
if (require.main === module) {
  executeSection4_1_10()
    .then(() => {
      console.log('🎉 Section 4.1.10: Loading Screen implementation completed!');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Failed to implement Section 4.1.10:', error);
      process.exit(1);
    });
}

module.exports = { executeSection4_1_10 };