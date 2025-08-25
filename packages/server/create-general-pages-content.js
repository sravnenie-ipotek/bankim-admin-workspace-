const { Client } = require('pg');
require('dotenv').config();

const connectionString = process.env.CONTENT_DATABASE_URL;

// Sample general pages content
const GENERAL_PAGES = [
  {
    content_key: 'general_pages.privacy_policy',
    component_type: 'text',
    category: 'general',
    translations: {
      en: 'Privacy Policy',
      he: 'מדיניות פרטיות',
      ru: 'Политика конфиденциальности'
    }
  },
  {
    content_key: 'general_pages.terms_of_service',
    component_type: 'text',
    category: 'general',
    translations: {
      en: 'Terms of Service',
      he: 'תנאי שימוש',
      ru: 'Условия использования'
    }
  },
  {
    content_key: 'general_pages.about_us',
    component_type: 'text',
    category: 'general',
    translations: {
      en: 'About Us',
      he: 'אודותינו',
      ru: 'О нас'
    }
  },
  {
    content_key: 'general_pages.contact_us',
    component_type: 'text',
    category: 'general',
    translations: {
      en: 'Contact Us',
      he: 'צור קשר',
      ru: 'Свяжитесь с нами'
    }
  },
  {
    content_key: 'general_pages.faq',
    component_type: 'text',
    category: 'general',
    translations: {
      en: 'Frequently Asked Questions',
      he: 'שאלות נפוצות',
      ru: 'Часто задаваемые вопросы'
    }
  },
  {
    content_key: 'general_pages.help_center',
    component_type: 'text',
    category: 'general',
    translations: {
      en: 'Help Center',
      he: 'מרכז עזרה',
      ru: 'Центр помощи'
    }
  },
  {
    content_key: 'general_pages.accessibility',
    component_type: 'text',
    category: 'general',
    translations: {
      en: 'Accessibility Statement',
      he: 'הצהרת נגישות',
      ru: 'Заявление о доступности'
    }
  },
  {
    content_key: 'general_pages.cookie_policy',
    component_type: 'text',
    category: 'general',
    translations: {
      en: 'Cookie Policy',
      he: 'מדיניות עוגיות',
      ru: 'Политика использования файлов cookie'
    }
  },
  {
    content_key: 'general_pages.legal_notice',
    component_type: 'text',
    category: 'general',
    translations: {
      en: 'Legal Notice',
      he: 'הודעה משפטית',
      ru: 'Юридическое уведомление'
    }
  },
  {
    content_key: 'general_pages.sitemap',
    component_type: 'text',
    category: 'general',
    translations: {
      en: 'Sitemap',
      he: 'מפת אתר',
      ru: 'Карта сайта'
    }
  }
];

async function createGeneralPagesContent() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('📊 Creating general pages content in Railway database\n');

    await client.query('BEGIN');

    let createdCount = 0;

    for (const page of GENERAL_PAGES) {
      // Insert content item
      const itemResult = await client.query(`
        INSERT INTO content_items (
          content_key, 
          component_type, 
          category, 
          screen_location,
          is_active,
          page_number
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (content_key) DO UPDATE 
        SET screen_location = $4,
            updated_at = CURRENT_TIMESTAMP
        RETURNING id
      `, [
        page.content_key,
        page.component_type,
        page.category,
        'general_pages',
        true,
        createdCount + 1
      ]);

      const contentItemId = itemResult.rows[0].id;

      // Insert translations
      for (const [lang, translation] of Object.entries(page.translations)) {
        await client.query(`
          INSERT INTO content_translations (
            content_item_id, 
            language_code, 
            content_value, 
            status
          )
          VALUES ($1, $2, $3, 'approved')
          ON CONFLICT (content_item_id, language_code) 
          DO UPDATE SET 
            content_value = $3,
            updated_at = CURRENT_TIMESTAMP
        `, [contentItemId, lang, translation]);
      }

      createdCount++;
      console.log(`✅ Created: ${page.content_key}`);
    }

    await client.query('COMMIT');

    console.log(`\n✅ Successfully created ${createdCount} general page items`);

    // Verify
    const verifyResult = await client.query(`
      SELECT COUNT(*) as count
      FROM content_items
      WHERE screen_location = 'general_pages'
    `);

    console.log(`\n📋 Verification: ${verifyResult.rows[0].count} items with screen_location = 'general_pages'`);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

createGeneralPagesContent();