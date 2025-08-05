const { Pool } = require('pg');
require('dotenv').config();

// Database connection configuration
const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function addMortgageRefiContent() {
  try {
    console.log('🔧 Adding mortgage refinancing content to database...\n');

    // Start transaction
    await pool.query('BEGIN');

    // Define the mortgage refinancing steps
    const mortgageRefiSteps = [
      {
        screen_location: 'refinance_mortgage_1',
        content_key: 'app.mortgage_refi.step1.title',
        component_type: 'title',
        title_ru: 'Рефинансирование ипотеки',
        title_he: 'מחזור משכנתא',
        title_en: 'Mortgage Refinance'
      },
      {
        screen_location: 'refinance_mortgage_2',
        content_key: 'app.mortgage_refi.step2.title',
        component_type: 'title',
        title_ru: 'Банк текущей ипотеки',
        title_he: 'בנק המשכנתא הנוכחית',
        title_en: 'Current Bank'
      },
      {
        screen_location: 'refinance_mortgage_3',
        content_key: 'app.mortgage_refi.step3.title',
        component_type: 'title',
        title_ru: 'Данные о доходах',
        title_he: 'נתוני הכנסה',
        title_en: 'Income Data'
      },
      {
        screen_location: 'refinance_mortgage_4',
        content_key: 'app.mortgage_refi.step4.title',
        component_type: 'title',
        title_ru: 'Выбор программы',
        title_he: 'בחירת תוכנית',
        title_en: 'Program Selection'
      }
    ];

    console.log(`Creating ${mortgageRefiSteps.length} mortgage refinancing steps...`);

    for (const step of mortgageRefiSteps) {
      console.log(`Creating step: ${step.screen_location}`);
      
      // Insert content item
      const contentResult = await pool.query(`
        INSERT INTO content_items (content_key, component_type, screen_location, is_active, page_number)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
      `, [step.content_key, step.component_type, step.screen_location, true, 1]);
      
      const contentId = contentResult.rows[0].id;
      console.log(`  - Created content item with ID: ${contentId}`);

      // Insert translations
      await pool.query(`
        INSERT INTO content_translations (content_item_id, language_code, content_value)
        VALUES ($1, 'ru', $2), ($1, 'he', $3), ($1, 'en', $4)
      `, [contentId, step.title_ru, step.title_he, step.title_en]);
      
      console.log(`  - Added translations for ${step.screen_location}`);
    }

    // Add some additional content items for each step to make them more realistic
    const additionalContent = [
      // Step 1 content
      {
        screen_location: 'refinance_mortgage_1',
        content_key: 'app.mortgage_refi.step1.description',
        component_type: 'text',
        title_ru: 'Введите данные для расчета рефинансирования ипотеки',
        title_he: 'הזן נתונים לחישוב מחזור משכנתא',
        title_en: 'Enter data to calculate mortgage refinancing'
      },
      {
        screen_location: 'refinance_mortgage_1',
        content_key: 'app.mortgage_refi.step1.button',
        component_type: 'button',
        title_ru: 'Продолжить',
        title_he: 'המשך',
        title_en: 'Continue'
      },
      
      // Step 2 content
      {
        screen_location: 'refinance_mortgage_2',
        content_key: 'app.mortgage_refi.step2.description',
        component_type: 'text',
        title_ru: 'Выберите банк, в котором у вас текущая ипотека',
        title_he: 'בחר את הבנק שבו יש לך משכנתא נוכחית',
        title_en: 'Select the bank where you have your current mortgage'
      },
      {
        screen_location: 'refinance_mortgage_2',
        content_key: 'app.mortgage_refi.step2.button',
        component_type: 'button',
        title_ru: 'Далее',
        title_he: 'הבא',
        title_en: 'Next'
      },
      
      // Step 3 content
      {
        screen_location: 'refinance_mortgage_3',
        content_key: 'app.mortgage_refi.step3.description',
        component_type: 'text',
        title_ru: 'Укажите ваши доходы для расчета',
        title_he: 'ציין את הכנסותיך לחישוב',
        title_en: 'Specify your income for calculation'
      },
      {
        screen_location: 'refinance_mortgage_3',
        content_key: 'app.mortgage_refi.step3.button',
        component_type: 'button',
        title_ru: 'Рассчитать',
        title_he: 'חשב',
        title_en: 'Calculate'
      },
      
      // Step 4 content
      {
        screen_location: 'refinance_mortgage_4',
        content_key: 'app.mortgage_refi.step4.description',
        component_type: 'text',
        title_ru: 'Выберите подходящую программу рефинансирования',
        title_he: 'בחר תוכנית מחזור משכנתא מתאימה',
        title_en: 'Select a suitable mortgage refinancing program'
      },
      {
        screen_location: 'refinance_mortgage_4',
        content_key: 'app.mortgage_refi.step4.button',
        component_type: 'button',
        title_ru: 'Завершить',
        title_he: 'סיים',
        title_en: 'Complete'
      }
    ];

    console.log(`\nCreating ${additionalContent.length} additional content items...`);

    for (const content of additionalContent) {
      console.log(`Creating content: ${content.content_key}`);
      
      // Insert content item
      const contentResult = await pool.query(`
        INSERT INTO content_items (content_key, component_type, screen_location, is_active, page_number)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
      `, [content.content_key, content.component_type, content.screen_location, true, 1]);
      
      const contentId = contentResult.rows[0].id;

      // Insert translations
      await pool.query(`
        INSERT INTO content_translations (content_item_id, language_code, content_value)
        VALUES ($1, 'ru', $2), ($1, 'he', $3), ($1, 'en', $4)
      `, [contentId, content.title_ru, content.title_he, content.title_en]);
      
      console.log(`  - Created content item with ID: ${contentId}`);
    }

    // Commit transaction
    await pool.query('COMMIT');
    
    console.log('\n✅ Successfully added mortgage refinancing content to database!');
    
    // Verify the content was added
    console.log('\n🔍 Verifying added content...');
    const verifyResult = await pool.query(`
      SELECT 
        ci.screen_location,
        COUNT(*) as item_count,
        COUNT(CASE WHEN ci.is_active = TRUE THEN 1 END) as active_count
      FROM content_items ci
      WHERE ci.screen_location LIKE 'refinance_mortgage_%'
      GROUP BY ci.screen_location
      ORDER BY ci.screen_location
    `);
    
    console.log(`Found ${verifyResult.rows.length} mortgage refinancing screens:`);
    verifyResult.rows.forEach(row => {
      console.log(`  - ${row.screen_location}: ${row.item_count} items (${row.active_count} active)`);
    });

  } catch (error) {
    console.error('❌ Error adding mortgage refinancing content:', error);
    await pool.query('ROLLBACK');
  } finally {
    await pool.end();
  }
}

addMortgageRefiContent(); 