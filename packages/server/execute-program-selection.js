const { Pool } = require('pg');
require('dotenv').config({ path: '../../.env' });

const contentPool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const section4_1_11_ContentItems = [
  { content_key: 'program_selection.title', component_type: 'text', category: 'heading', description: 'Program selection title' },
  { content_key: 'program_selection.subtitle', component_type: 'text', category: 'heading', description: 'Program selection subtitle' },
  { content_key: 'program_selection.description', component_type: 'text', category: 'text', description: 'Program selection description' },
  { content_key: 'program_selection.program.standard', component_type: 'text', category: 'form', description: 'Standard program option' },
  { content_key: 'program_selection.program.premium', component_type: 'text', category: 'form', description: 'Premium program option' },
  { content_key: 'program_selection.program.flexible', component_type: 'text', category: 'form', description: 'Flexible program option' },
  { content_key: 'program_selection.details.interest_rate', component_type: 'text', category: 'text', description: 'Interest rate details' },
  { content_key: 'program_selection.details.term_length', component_type: 'text', category: 'text', description: 'Term length details' },
  { content_key: 'program_selection.button.select', component_type: 'text', category: 'action', description: 'Select program button' },
  { content_key: 'program_selection.button.compare', component_type: 'text', category: 'action', description: 'Compare programs button' },
  { content_key: 'program_selection.validation.selection_required', component_type: 'text', category: 'validation', description: 'Program selection required' },
  { content_key: 'program_selection.help.recommendation', component_type: 'text', category: 'text', description: 'Program recommendation help' }
];

const section4_1_11_Translations = [
  { content_key: 'program_selection.title', language_code: 'ru', content_value: 'Выбор программы рефинансирования' },
  { content_key: 'program_selection.title', language_code: 'he', content_value: 'בחירת תוכנית מימון מחדש' },
  { content_key: 'program_selection.title', language_code: 'en', content_value: 'Refinance Program Selection' },
  
  { content_key: 'program_selection.subtitle', language_code: 'ru', content_value: 'Выберите подходящую программу' },
  { content_key: 'program_selection.subtitle', language_code: 'he', content_value: 'בחר את התוכנית המתאימה' },
  { content_key: 'program_selection.subtitle', language_code: 'en', content_value: 'Choose the suitable program' },
  
  { content_key: 'program_selection.description', language_code: 'ru', content_value: 'На основе ваших данных мы подобрали лучшие программы рефинансирования' },
  { content_key: 'program_selection.description', language_code: 'he', content_value: 'בהתבסס על הנתונים שלך, בחרנו את תוכניות המימון המחדש הטובות ביותר' },
  { content_key: 'program_selection.description', language_code: 'en', content_value: 'Based on your data, we selected the best refinance programs' },
  
  { content_key: 'program_selection.program.standard', language_code: 'ru', content_value: 'Стандартная программа' },
  { content_key: 'program_selection.program.standard', language_code: 'he', content_value: 'תוכנית סטנדרטית' },
  { content_key: 'program_selection.program.standard', language_code: 'en', content_value: 'Standard Program' },
  
  { content_key: 'program_selection.program.premium', language_code: 'ru', content_value: 'Премиум программа' },
  { content_key: 'program_selection.program.premium', language_code: 'he', content_value: 'תוכנית פרמיום' },
  { content_key: 'program_selection.program.premium', language_code: 'en', content_value: 'Premium Program' },
  
  { content_key: 'program_selection.program.flexible', language_code: 'ru', content_value: 'Гибкая программа' },
  { content_key: 'program_selection.program.flexible', language_code: 'he', content_value: 'תוכנית גמישה' },
  { content_key: 'program_selection.program.flexible', language_code: 'en', content_value: 'Flexible Program' },
  
  { content_key: 'program_selection.details.interest_rate', language_code: 'ru', content_value: 'Процентная ставка' },
  { content_key: 'program_selection.details.interest_rate', language_code: 'he', content_value: 'שיעור ריבית' },
  { content_key: 'program_selection.details.interest_rate', language_code: 'en', content_value: 'Interest Rate' },
  
  { content_key: 'program_selection.details.term_length', language_code: 'ru', content_value: 'Срок кредита' },
  { content_key: 'program_selection.details.term_length', language_code: 'he', content_value: 'תקופת ההלוואה' },
  { content_key: 'program_selection.details.term_length', language_code: 'en', content_value: 'Loan Term' },
  
  { content_key: 'program_selection.button.select', language_code: 'ru', content_value: 'Выбрать программу' },
  { content_key: 'program_selection.button.select', language_code: 'he', content_value: 'בחר תוכנית' },
  { content_key: 'program_selection.button.select', language_code: 'en', content_value: 'Select Program' },
  
  { content_key: 'program_selection.button.compare', language_code: 'ru', content_value: 'Сравнить программы' },
  { content_key: 'program_selection.button.compare', language_code: 'he', content_value: 'השווה תוכניות' },
  { content_key: 'program_selection.button.compare', language_code: 'en', content_value: 'Compare Programs' },
  
  { content_key: 'program_selection.validation.selection_required', language_code: 'ru', content_value: 'Выбор программы обязателен' },
  { content_key: 'program_selection.validation.selection_required', language_code: 'he', content_value: 'בחירת תוכנית היא שדה חובה' },
  { content_key: 'program_selection.validation.selection_required', language_code: 'en', content_value: 'Program selection is required' },
  
  { content_key: 'program_selection.help.recommendation', language_code: 'ru', content_value: 'Рекомендуем стандартную программу для большинства клиентов' },
  { content_key: 'program_selection.help.recommendation', language_code: 'he', content_value: 'אנו ממליצים על התוכנית הסטנדרטית לרוב הלקוחות' },
  { content_key: 'program_selection.help.recommendation', language_code: 'en', content_value: 'We recommend the standard program for most clients' }
];

async function executeSection4_1_11() {
  const client = await contentPool.connect();
  try {
    await client.query('BEGIN');
    console.log('🚀 Starting Section 4.1.11: Program Selection implementation...');

    for (const item of section4_1_11_ContentItems) {
      await client.query(`
        INSERT INTO content_items (content_key, component_type, category, screen_location, description, is_active, page_number, created_at, updated_at) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
        [item.content_key, item.component_type, item.category, 'program_selection', item.description, true, 1]
      );
    }

    for (const translation of section4_1_11_Translations) {
      const itemResult = await client.query('SELECT id FROM content_items WHERE content_key = $1', [translation.content_key]);
      if (itemResult.rows.length > 0) {
        await client.query(`
          INSERT INTO content_translations (content_item_id, language_code, content_value, created_at, updated_at)
          VALUES ($1, $2, $3, NOW(), NOW())`,
          [itemResult.rows[0].id, translation.language_code, translation.content_value]
        );
      }
    }

    await client.query('COMMIT');
    console.log('✅ Section 4.1.11: 12 items, 36 translations completed!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error implementing Section 4.1.11:', error);
    throw error;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  executeSection4_1_11()
    .then(() => console.log('🎉 Section 4.1.11 completed!'))
    .catch(error => console.error('💥 Failed:', error));
}

module.exports = { executeSection4_1_11 };