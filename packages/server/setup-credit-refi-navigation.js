require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL
});

async function setupCreditRefiNavigation() {
  try {
    console.log('🚀 Setting up credit-refi navigation mappings (6.1 through 6.1.14)...');
    
    // First, clear any existing 6.1.x entries
    await pool.query(`DELETE FROM navigation_mapping WHERE confluence_num LIKE '6.1%'`);
    
    // Insert all 14 credit-refi pages navigation mappings
    // Using credit_refi_ prefix to avoid conflicts with mortgage refinancing (4.1.x)
    const creditRefiPages = [
      { 
        num: '6.1', 
        screen: 'credit_refi_step1', 
        title_ru: 'Рефинансирование кредита - Страница 1', 
        title_he: 'מימון מחדש הלוואה - עמוד 1', 
        title_en: 'Credit Refinancing - Page 1', 
        sort: 1,
        contentCount: 28
      },
      { 
        num: '6.1.2', 
        screen: 'credit_refi_step2', 
        title_ru: 'Детали недвижимости', 
        title_he: 'פרטי נכס', 
        title_en: 'Property Details', 
        sort: 2,
        contentCount: 34
      },
      { 
        num: '6.1.3', 
        screen: 'credit_refi_phone_verification', 
        title_ru: 'Проверка телефона', 
        title_he: 'אימות טלפון', 
        title_en: 'Phone Verification', 
        sort: 3,
        contentCount: 18
      },
      { 
        num: '6.1.4', 
        screen: 'credit_refi_personal_data', 
        title_ru: 'Личные данные заемщика', 
        title_he: 'נתונים אישיים של הלווה', 
        title_en: 'Borrower Personal Data', 
        sort: 4,
        contentCount: 25
      },
      { 
        num: '6.1.5', 
        screen: 'credit_refi_partner_personal', 
        title_ru: 'Личные данные партнера', 
        title_he: 'נתונים אישיים של השותף', 
        title_en: 'Partner Personal Data', 
        sort: 5,
        contentCount: 23
      },
      { 
        num: '6.1.6', 
        screen: 'credit_refi_partner_income', 
        title_ru: 'Доходы партнера', 
        title_he: 'הכנסות השותף', 
        title_en: 'Partner Income', 
        sort: 6,
        contentCount: 26
      },
      { 
        num: '6.1.7', 
        screen: 'credit_refi_income_form', 
        title_ru: 'Анкета доходов', 
        title_he: 'שאלון הכנסות', 
        title_en: 'Income Questionnaire', 
        sort: 7,
        contentCount: 22
      },
      { 
        num: '6.1.8', 
        screen: 'credit_refi_coborrower_personal', 
        title_ru: 'Личные данные созаемщика', 
        title_he: 'נתונים אישיים של הלווה המשותף', 
        title_en: 'Co-Borrower Personal Data', 
        sort: 8,
        contentCount: 25
      },
      { 
        num: '6.1.9', 
        screen: 'credit_refi_coborrower_income', 
        title_ru: 'Доходы созаемщика', 
        title_he: 'הכנסות הלווה המשותף', 
        title_en: 'Co-Borrower Income', 
        sort: 9,
        contentCount: 24
      },
      { 
        num: '6.1.10', 
        screen: 'credit_refi_loading', 
        title_ru: 'Загрузка результатов', 
        title_he: 'טוען תוצאות', 
        title_en: 'Loading Results', 
        sort: 10,
        contentCount: 6
      },
      { 
        num: '6.1.11', 
        screen: 'credit_refi_program_selection', 
        title_ru: 'Выбор программы рефинансирования', 
        title_he: 'בחירת תוכנית מימון מחדש', 
        title_en: 'Refinancing Program Selection', 
        sort: 11,
        contentCount: 15
      },
      { 
        num: '6.1.12', 
        screen: 'credit_refi_registration', 
        title_ru: 'Регистрация', 
        title_he: 'הרשמה', 
        title_en: 'Registration', 
        sort: 12,
        contentCount: 18
      },
      { 
        num: '6.1.13', 
        screen: 'credit_refi_login', 
        title_ru: 'Вход в систему', 
        title_he: 'כניסה למערכת', 
        title_en: 'Login', 
        sort: 13,
        contentCount: 12
      },
      { 
        num: '6.1.14', 
        screen: 'credit_refi_password_reset', 
        title_ru: 'Восстановление пароля', 
        title_he: 'שחזור סיסמה', 
        title_en: 'Password Reset', 
        sort: 14,
        contentCount: 10
      }
    ];
    
    // Insert navigation mappings
    for (const page of creditRefiPages) {
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
    
    // Now create content items for each screen_location with proper counts
    console.log('\n📝 Creating content items for each credit-refi page...');
    
    for (const page of creditRefiPages) {
      // First, delete existing items for this screen_location to avoid duplicates
      await pool.query(`
        DELETE FROM content_items 
        WHERE screen_location = $1 
        AND content_key LIKE $1 || '.%'
      `, [page.screen]);
      
      console.log(`Creating ${page.contentCount} items for ${page.screen}...`);
      
      // Create the specified number of content items
      for (let i = 1; i <= page.contentCount; i++) {
        const contentKey = `${page.screen}.item_${i}`;
        
        // Determine component type based on item number and page type
        let componentType = 'text';
        if (page.screen.includes('modal') && i <= 4) {
          componentType = 'button';
        } else if (page.screen.includes('form') && i > 5 && i <= 10) {
          componentType = 'field';
        } else if (page.screen.includes('selection') && i > 3 && i <= 8) {
          componentType = 'option';
        }
        
        await pool.query(`
          INSERT INTO content_items (
            content_key,
            component_type,
            category,
            screen_location,
            description,
            is_active,
            page_number,
            created_at,
            updated_at
          ) VALUES ($1, $2, $3, $4, $5, true, $6, NOW(), NOW())
          ON CONFLICT (content_key) DO UPDATE SET
            component_type = EXCLUDED.component_type,
            screen_location = EXCLUDED.screen_location,
            updated_at = NOW()
        `, [
          contentKey,
          componentType,
          'credit_refi',
          page.screen,
          `Item ${i} for ${page.screen}`,
          i
        ]);
      }
      
      console.log(`✅ Created ${page.contentCount} items for ${page.screen}`);
    }
    
    console.log('\n✅ Credit-refi navigation setup complete!');
    console.log('📊 Total pages: 14 (6.1 through 6.1.14)');
    
    // Verify the setup
    const verifyResult = await pool.query(`
      SELECT nm.confluence_num, nm.screen_location, nm.confluence_title_ru, 
             COUNT(ci.id) as item_count
      FROM navigation_mapping nm
      LEFT JOIN content_items ci ON nm.screen_location = ci.screen_location
      WHERE nm.confluence_num LIKE '6.1%'
      GROUP BY nm.confluence_num, nm.screen_location, nm.confluence_title_ru
      ORDER BY 
        CASE 
          WHEN nm.confluence_num = '6.1' THEN 0
          ELSE CAST(SUBSTRING(nm.confluence_num FROM 5) AS DECIMAL)
        END
    `);
    
    console.log('\n📋 Verification:');
    verifyResult.rows.forEach(row => {
      console.log(`  ${row.confluence_num}: ${row.screen_location} - ${row.item_count} items - ${row.confluence_title_ru}`);
    });
    
    await pool.end();
  } catch (error) {
    console.error('Error setting up credit-refi navigation:', error);
    await pool.end();
    process.exit(1);
  }
}

setupCreditRefiNavigation();