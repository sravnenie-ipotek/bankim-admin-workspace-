require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL
});

async function setupCreditRefiChildPages() {
  try {
    console.log('🚀 Setting up credit-refi CHILD pages navigation mappings (6.1.7.1, 6.1.7.2, 6.1.7.3, 6.1.12.1, 6.1.13.1, 6.1.13.2)...');
    
    // Define the 6 child pages with their specifications
    const childPages = [
      { 
        num: '6.1.7.1', 
        screen: 'credit_refi_income_source_modal_1', 
        title_ru: 'Модальное окно источника дохода #1', 
        title_he: 'חלון מודאלי למקור הכנסה #1', 
        title_en: 'Source of Income Modal #1', 
        sort: 71,  // After 6.1.7
        contentCount: 18,
        parent: '6.1.7'
      },
      { 
        num: '6.1.7.2', 
        screen: 'credit_refi_income_source_modal_2', 
        title_ru: 'Модальное окно источника дохода #2', 
        title_he: 'חלון מודאלי למקור הכנסה #2', 
        title_en: 'Source of Income Modal #2', 
        sort: 72,
        contentCount: 18,  // Same structure as 6.1.7.1
        parent: '6.1.7'
      },
      { 
        num: '6.1.7.3', 
        screen: 'credit_refi_obligation_modal_1', 
        title_ru: 'Модальное окно обязательств #1', 
        title_he: 'חלון מודאלי להתחייבויות #1', 
        title_en: 'Obligation Modal #1', 
        sort: 73,
        contentCount: 16,
        parent: '6.1.7'
      },
      { 
        num: '6.1.12.1', 
        screen: 'credit_refi_registration_success_toast', 
        title_ru: 'Уведомление об успешной регистрации', 
        title_he: 'הודעת הרשמה מוצלחת', 
        title_en: 'Registration Success Toast', 
        sort: 121,  // After 6.1.12
        contentCount: 2,
        parent: '6.1.12'
      },
      { 
        num: '6.1.13.1', 
        screen: 'credit_refi_wrong_password_modal', 
        title_ru: 'Модальное окно неверного пароля', 
        title_he: 'חלון מודאלי לסיסמה שגויה', 
        title_en: 'Wrong Password Modal', 
        sort: 131,  // After 6.1.13
        contentCount: 6,
        parent: '6.1.13'
      },
      { 
        num: '6.1.13.2', 
        screen: 'credit_refi_account_locked_modal', 
        title_ru: 'Модальное окно блокировки аккаунта', 
        title_he: 'חלון מודאלי לחשבון נעול', 
        title_en: 'Account Locked Modal', 
        sort: 132,
        contentCount: 4,
        parent: '6.1.13'
      }
    ];
    
    // Insert navigation mappings for child pages
    for (const page of childPages) {
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
        console.log(`📝 Updated ${page.num}: ${page.screen}`);
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
        console.log(`✅ Added ${page.num}: ${page.screen}`);
      }
    }
    
    // Now create content items for each child page with proper counts
    console.log('\n📝 Creating content items for each credit-refi child page...');
    
    for (const page of childPages) {
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
        if (page.screen.includes('modal')) {
          // Modals typically have buttons and form fields
          if (i <= 2) {
            componentType = 'button';
          } else if (i <= 4) {
            componentType = 'title';
          } else if (page.screen.includes('income_source') && i > 4 && i <= 12) {
            componentType = 'field';
          } else if (page.screen.includes('obligation') && i > 4 && i <= 10) {
            componentType = 'field';
          } else if (page.screen.includes('password') && i === 3) {
            componentType = 'link';
          }
        } else if (page.screen.includes('toast')) {
          // Toast notifications are simple
          componentType = i === 1 ? 'title' : 'text';
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
          `Item ${i} for ${page.title_en}`,
          i
        ]);
      }
      
      console.log(`✅ Created ${page.contentCount} items for ${page.screen} (${page.title_ru})`);
    }
    
    // Add draft translations for the new content items
    console.log('\n🌐 Adding draft translations for new child page items...');
    
    for (const page of childPages) {
      const contentItems = await pool.query(`
        SELECT id, content_key, description 
        FROM content_items 
        WHERE screen_location = $1
      `, [page.screen]);
      
      for (const item of contentItems.rows) {
        // Check if translations exist
        const existingTranslations = await pool.query(
          `SELECT id FROM content_translations WHERE content_item_id = $1`,
          [item.id]
        );
        
        if (existingTranslations.rows.length === 0) {
          // Add draft translations for all three languages
          const languages = [
            { code: 'ru', text: `${page.title_ru} - ${item.description}` },
            { code: 'he', text: `${page.title_he} - ${item.description}` },
            { code: 'en', text: `${page.title_en} - ${item.description}` }
          ];
          
          for (const lang of languages) {
            await pool.query(`
              INSERT INTO content_translations (
                content_item_id,
                language_code,
                content_value,
                status,
                created_at,
                updated_at
              ) VALUES ($1, $2, $3, 'draft', NOW(), NOW())
            `, [item.id, lang.code, lang.text]);
          }
        }
      }
      
      console.log(`✅ Added translations for ${page.screen}`);
    }
    
    console.log('\n✅ Credit-refi child pages setup complete!');
    console.log('📊 Total child pages added: 6');
    console.log('📊 Parent pages with children:');
    console.log('  - 6.1.7 (Анкета доходов) has 3 child modals');
    console.log('  - 6.1.12 (Регистрация) has 1 success toast');
    console.log('  - 6.1.13 (Вход в систему) has 2 error modals');
    
    // Verify the setup
    const verifyResult = await pool.query(`
      SELECT nm.confluence_num, nm.screen_location, nm.confluence_title_ru, 
             COUNT(ci.id) as item_count
      FROM navigation_mapping nm
      LEFT JOIN content_items ci ON nm.screen_location = ci.screen_location
      WHERE nm.confluence_num IN ('6.1.7.1', '6.1.7.2', '6.1.7.3', '6.1.12.1', '6.1.13.1', '6.1.13.2')
      GROUP BY nm.confluence_num, nm.screen_location, nm.confluence_title_ru
      ORDER BY nm.sort_order
    `);
    
    console.log('\n📋 Verification of child pages:');
    verifyResult.rows.forEach(row => {
      console.log(`  ${row.confluence_num}: ${row.screen_location} - ${row.item_count} items - ${row.confluence_title_ru}`);
    });
    
    // Show complete hierarchy
    const fullHierarchy = await pool.query(`
      SELECT confluence_num, screen_location, confluence_title_ru
      FROM navigation_mapping
      WHERE confluence_num LIKE '6.1%'
      ORDER BY 
        CASE 
          WHEN confluence_num = '6.1' THEN 0
          WHEN confluence_num LIKE '6.1.%.%' THEN 
            CAST(SUBSTRING(confluence_num FROM 5 FOR POSITION('.' IN SUBSTRING(confluence_num FROM 5)) - 1) AS DECIMAL) + 
            CAST(SUBSTRING(confluence_num FROM POSITION('.' IN SUBSTRING(confluence_num FROM 5)) + 5) AS DECIMAL) / 100
          ELSE CAST(SUBSTRING(confluence_num FROM 5) AS DECIMAL)
        END
    `);
    
    console.log('\n📊 Complete credit-refi hierarchy (20 pages total):');
    fullHierarchy.rows.forEach(row => {
      const indent = (row.confluence_num.match(/\./g) || []).length > 1 ? '    └─ ' : '  ';
      console.log(`${indent}${row.confluence_num}: ${row.confluence_title_ru}`);
    });
    
    await pool.end();
  } catch (error) {
    console.error('Error setting up credit-refi child pages:', error);
    await pool.end();
    process.exit(1);
  }
}

setupCreditRefiChildPages();