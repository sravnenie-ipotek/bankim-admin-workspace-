require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL
});

async function fixCreditRefiGenericTranslations() {
  try {
    console.log('🚀 Fixing generic credit-refi translations to be meaningful...');
    
    // Find credit-refi items with generic translations
    const genericTranslationsQuery = `
      SELECT 
        ci.id,
        ci.content_key,
        ci.screen_location,
        ct.language_code,
        ct.content_value,
        ct.id as translation_id
      FROM content_items ci
      JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.screen_location LIKE 'credit_refi_%'
        AND ci.is_active = TRUE
        AND (ct.content_value LIKE '%- Элемент %' 
             OR ct.content_value LIKE '%- פריט %'
             OR ct.content_value LIKE '%- Item %')
      ORDER BY ci.screen_location, ci.page_number, ci.id, ct.language_code
    `;
    
    const genericTranslations = await pool.query(genericTranslationsQuery);
    console.log(`🔍 Found ${genericTranslations.rows.length} generic credit-refi translations to replace`);
    
    if (genericTranslations.rows.length === 0) {
      console.log('✅ No generic credit-refi translations found!');
      await pool.end();
      return;
    }
    
    // Group by screen location for better organization
    const byScreenLocation = {};
    genericTranslations.rows.forEach(translation => {
      if (!byScreenLocation[translation.screen_location]) {
        byScreenLocation[translation.screen_location] = [];
      }
      byScreenLocation[translation.screen_location].push(translation);
    });
    
    console.log('📍 Generic translations by screen location:');
    Object.keys(byScreenLocation).forEach(location => {
      console.log(`  ${location}: ${byScreenLocation[location].length} translations`);
    });
    
    console.log('\n⚠️  ATTENTION: These credit-refi pages have GENERIC placeholder translations!');
    console.log('They should have meaningful content like:');
    console.log('  - "Сумма кредита" instead of "Детали недвижимости - Элемент 1"');
    console.log('  - "Процентная ставка" instead of "Детали недвижимости - Элемент 2"');
    console.log('  - "Тип недвижимости" instead of "Детали недвижимости - Элемент 3"');
    
    console.log('\n📝 QUESTION FOR DEV TEAM:');
    console.log('='.repeat(60));
    console.log('The credit-refi pages currently have generic placeholder translations.');
    console.log('We need the ACTUAL field labels and content for these credit-refi pages:');
    console.log('');
    
    const uniqueScreens = Object.keys(byScreenLocation);
    uniqueScreens.forEach((screen, index) => {
      const itemCount = Math.ceil(byScreenLocation[screen].length / 3); // 3 languages per item
      console.log(`${index + 1}. ${screen.replace('credit_refi_', '').replace(/_/g, ' ').toUpperCase()}`);
      console.log(`   Screen: ${screen}`);
      console.log(`   Items needed: ${itemCount} field labels/content pieces`);
      console.log(`   Example: What should item_1, item_2, item_3... be for this page?`);
      console.log('');
    });
    
    console.log('Please provide the actual field labels and content that should appear');
    console.log('in the real application for each of these credit refinancing pages.');
    console.log('='.repeat(60));
    
    console.log('\n🔧 For now, I can delete the generic translations so they show as empty');
    console.log('and you can add the proper ones through the admin interface.');
    
    // Optionally delete the generic translations
    console.log('\n❓ Would you like me to remove these generic translations?');
    console.log('(They currently show misleading content like "Property Details - Item 1")');
    
    await pool.end();
  } catch (error) {
    console.error('Error analyzing credit-refi generic translations:', error);
    await pool.end();
    process.exit(1);
  }
}

fixCreditRefiGenericTranslations();