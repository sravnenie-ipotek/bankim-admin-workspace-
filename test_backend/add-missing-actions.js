const { Client } = require('pg');

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:yCtOqSQRkZqtWEdQMWJGUPTYIyOZnALp@monorail.proxy.rlwy.net:42693/railway';

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function addMissingActions() {
  try {
    await client.connect();
    console.log('Connected to database');

    // Check current count
    const countBefore = await client.query("SELECT COUNT(*) FROM content_items WHERE screen_location = 'main_page' AND component_type = 'dropdown'");
    console.log('Current dropdown actions:', countBefore.rows[0].count);

    // Add missing content items
    const insertItems = `
      INSERT INTO content_items (content_key, content_type, category, screen_location, component_type, description) VALUES
      ('app.main.action.9.dropdown.income_stability', 'text', 'dropdowns', 'main_page', 'dropdown', 'Income stability dropdown action 9'),
      ('app.main.action.10.dropdown.bank_account', 'text', 'dropdowns', 'main_page', 'dropdown', 'Bank account dropdown action 10'),
      ('app.main.action.11.dropdown.loan_term', 'text', 'dropdowns', 'main_page', 'dropdown', 'Loan term dropdown action 11'),
      ('app.main.action.12.dropdown.payment_method', 'text', 'dropdowns', 'main_page', 'dropdown', 'Payment method dropdown action 12')
      ON CONFLICT (content_key) DO NOTHING
      RETURNING id, content_key
    `;

    const itemsResult = await client.query(insertItems);
    console.log('Added items:', itemsResult.rows.map(r => r.content_key));

    // Add translations for each new item
    for (let i = 9; i <= 12; i++) {
      const translations = {
        9: { ru: 'Стабильность дохода', he: 'יציבות הכנסה', en: 'Income Stability' },
        10: { ru: 'Банковский счет', he: 'חשבון בנק', en: 'Bank Account' },
        11: { ru: 'Срок кредита', he: 'תקופת הלוואה', en: 'Loan Term' },
        12: { ru: 'Способ оплаты', he: 'אמצעי תשלום', en: 'Payment Method' }
      };

      const itemId = await client.query(
        "SELECT id FROM content_items WHERE content_key = $1",
        [`app.main.action.${i}.dropdown.${Object.keys(translations[i])[2].toLowerCase().replace(' ', '_')}`]
      );

      if (itemId.rows.length > 0) {
        const id = itemId.rows[0].id;
        
        for (const [lang, value] of Object.entries(translations[i])) {
          await client.query(
            `INSERT INTO content_translations (content_item_id, language_code, content_value, is_default, status) 
             VALUES ($1, $2, $3, $4, 'approved') 
             ON CONFLICT (content_item_id, language_code) DO NOTHING`,
            [id, lang, value, false]
          );
        }
        console.log(`Added translations for action ${i}`);
      }
    }

    // Verify final count
    const countAfter = await client.query("SELECT COUNT(*) FROM content_items WHERE screen_location = 'main_page' AND component_type = 'dropdown'");
    console.log('Total dropdown actions now:', countAfter.rows[0].count);

    await client.end();
    console.log('✅ Successfully added missing actions 9-12');
  } catch (err) {
    console.error('Error:', err);
    await client.end();
    process.exit(1);
  }
}

addMissingActions();