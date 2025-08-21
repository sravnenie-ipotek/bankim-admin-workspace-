require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL
});

async function setupCreditNavigation() {
  try {
    console.log('🚀 Setting up credit navigation mappings...');
    
    // First, clear any existing 5.1.x entries
    await pool.query(`DELETE FROM navigation_mapping WHERE confluence_num LIKE '5.1%'`);
    
    // Insert all 14 credit pages navigation mappings
    const creditPages = [
      { num: '5.1', screen: 'credit_step1', title_ru: 'Калькулятор кредита - Страница 1', title_he: 'מחשבון אשראי - עמוד 1', title_en: 'Credit Calculator - Page 1', sort: 1 },
      { num: '5.1.2', screen: 'credit_phone_verification', title_ru: 'Ввод номера телефона', title_he: 'הזנת מספר טלפון', title_en: 'Phone Number Entry', sort: 2 },
      { num: '5.1.3', screen: 'credit_personal_data', title_ru: 'Форма личных данных', title_he: 'טופס נתונים אישיים', title_en: 'Personal Data Form', sort: 3 },
      { num: '5.1.4', screen: 'credit_partner_personal', title_ru: 'Личные данные партнера', title_he: 'נתונים אישיים של השותף', title_en: 'Partner Personal Data', sort: 4 },
      { num: '5.1.5', screen: 'credit_partner_income', title_ru: 'Доходы партнера', title_he: 'הכנסות השותף', title_en: 'Partner Income', sort: 5 },
      { num: '5.1.6', screen: 'credit_income_employed', title_ru: 'Анкета доходов - Наемный работник', title_he: 'שאלון הכנסות - שכיר', title_en: 'Income Form - Employed', sort: 6 },
      { num: '5.1.7', screen: 'credit_coborrower_personal', title_ru: 'Личные данные созаемщика', title_he: 'נתונים אישיים של הלווה המשותף', title_en: 'Co-Borrower Personal Data', sort: 7 },
      { num: '5.1.8', screen: 'credit_coborrower_income', title_ru: 'Доходы созаемщика', title_he: 'הכנסות הלווה המשותף', title_en: 'Co-Borrower Income', sort: 8 },
      { num: '5.1.9', screen: 'credit_loading_screen', title_ru: 'Экран загрузки', title_he: 'מסך טעינה', title_en: 'Loading Screen', sort: 9 },
      { num: '5.1.10', screen: 'credit_program_selection', title_ru: 'Выбор программы кредита', title_he: 'בחירת תוכנית הלוואה', title_en: 'Credit Program Selection', sort: 10 },
      { num: '5.1.11', screen: 'credit_summary', title_ru: 'Сводка заявки', title_he: 'סיכום הבקשה', title_en: 'Application Summary', sort: 11 },
      { num: '5.1.12', screen: 'credit_registration_page', title_ru: 'Страница регистрации', title_he: 'עמוד הרשמה', title_en: 'Registration Page', sort: 12 },
      { num: '5.1.13', screen: 'credit_login_page', title_ru: 'Страница входа', title_he: 'עמוד כניסה', title_en: 'Login Page', sort: 13 },
      { num: '5.1.14', screen: 'reset_password_page', title_ru: 'Восстановление пароля', title_he: 'שחזור סיסמה', title_en: 'Password Reset', sort: 14 }
    ];
    
    for (const page of creditPages) {
      // Check if entry exists first
      const existing = await pool.query(
        `SELECT id FROM navigation_mapping WHERE confluence_num = $1`,
        [page.num]
      );
      
      if (existing.rows.length > 0) {
        // Update existing
        await pool.query(`
          UPDATE navigation_mapping SET
            screen_location = $2,
            confluence_title_ru = $3,
            confluence_title_he = $4,
            confluence_title_en = $5,
            sort_order = $6,
            updated_at = NOW()
          WHERE confluence_num = $1
        `, [page.num, page.screen, page.title_ru, page.title_he, page.title_en, page.sort]);
      } else {
        // Insert new
        await pool.query(`
          INSERT INTO navigation_mapping (
            confluence_num, 
            screen_location, 
            confluence_title_ru, 
            confluence_title_he, 
            confluence_title_en,
            sort_order,
            created_at,
            updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
        `, [page.num, page.screen, page.title_ru, page.title_he, page.title_en, page.sort]);
      }
      
      console.log(`✅ Added ${page.num}: ${page.screen} - ${page.title_ru}`);
    }
    
    // Now ensure content items exist for the new screen_locations that don't have them yet
    const newScreenLocations = [
      'credit_phone_verification',
      'credit_personal_data', 
      'credit_partner_personal',
      'credit_partner_income',
      'credit_income_employed',
      'credit_coborrower_personal',
      'credit_coborrower_income',
      'credit_loading_screen',
      'credit_program_selection',
      'credit_summary',
      'credit_registration_page',
      'credit_login_page',
      'reset_password_page'
    ];
    
    // Check which ones already exist
    const existingResult = await pool.query(`
      SELECT DISTINCT screen_location 
      FROM content_items 
      WHERE screen_location = ANY($1)
    `, [newScreenLocations]);
    
    const existing = existingResult.rows.map(r => r.screen_location);
    const toCreate = newScreenLocations.filter(sl => !existing.includes(sl));
    
    console.log(`\n📝 Need to create sample content for: ${toCreate.join(', ')}`);
    
    // Create sample content items for missing screen_locations
    // Based on the user's templates, we'll create the specified number of items
    const itemCounts = {
      'credit_step1': 30,
      'credit_phone_verification': 7,
      'credit_personal_data': 23,
      'credit_partner_personal': 18,
      'credit_partner_income': 20,
      'credit_income_employed': 22,
      'credit_coborrower_personal': 20,
      'credit_coborrower_income': 20,
      'credit_loading_screen': 2,
      'credit_program_selection': 11,
      'credit_summary': 12,
      'credit_registration_page': 20,
      'credit_login_page': 26,
      'reset_password_page': 15
    };
    
    for (const screenLocation of toCreate) {
      const count = itemCounts[screenLocation] || 10;
      console.log(`Creating ${count} items for ${screenLocation}...`);
      
      // Create sample content items
      for (let i = 1; i <= count; i++) {
        const contentKey = `${screenLocation}.item_${i}`;
        
        await pool.query(`
          INSERT INTO content_items (
            content_key,
            component_type,
            category,
            screen_location,
            description,
            is_active,
            created_at,
            updated_at
          ) VALUES ($1, $2, $3, $4, $5, true, NOW(), NOW())
          ON CONFLICT (content_key) DO NOTHING
        `, [
          contentKey,
          'text',
          'credit',
          screenLocation,
          `Item ${i} for ${screenLocation}`
        ]);
      }
    }
    
    console.log('\n✅ Credit navigation setup complete!');
    console.log('📊 Total pages: 14 (5.1 through 5.1.14)');
    
    // Verify the setup
    const verifyResult = await pool.query(`
      SELECT nm.confluence_num, nm.screen_location, nm.confluence_title_ru, COUNT(ci.id) as item_count
      FROM navigation_mapping nm
      LEFT JOIN content_items ci ON nm.screen_location = ci.screen_location
      WHERE nm.confluence_num LIKE '5.1%'
      GROUP BY nm.confluence_num, nm.screen_location, nm.confluence_title_ru
      ORDER BY nm.confluence_num
    `);
    
    console.log('\n📋 Verification:');
    verifyResult.rows.forEach(row => {
      console.log(`  ${row.confluence_num}: ${row.screen_location} - ${row.item_count} items`);
    });
    
    await pool.end();
  } catch (error) {
    console.error('Error setting up credit navigation:', error);
    await pool.end();
    process.exit(1);
  }
}

setupCreditNavigation();