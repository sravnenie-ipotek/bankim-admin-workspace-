require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL
});

async function removeGenericCreditRefiTranslations() {
  try {
    console.log('🚀 Removing generic credit-refi translations...');
    
    // Find and delete generic translations
    const deleteQuery = `
      DELETE FROM content_translations ct
      WHERE ct.id IN (
        SELECT ct.id
        FROM content_translations ct
        JOIN content_items ci ON ct.content_item_id = ci.id
        WHERE ci.screen_location LIKE 'credit_refi_%'
          AND ci.is_active = TRUE
          AND (ct.content_value LIKE '%- Элемент %' 
               OR ct.content_value LIKE '%- פריט %'
               OR ct.content_value LIKE '%- Item %')
      )
    `;
    
    const result = await pool.query(deleteQuery);
    console.log(`✅ Removed ${result.rowCount} generic credit-refi translations`);
    
    // Verify the cleanup
    const verificationQuery = `
      SELECT 
        ci.screen_location,
        COUNT(DISTINCT ci.id) as total_items,
        COUNT(ct.id) as total_translations,
        COUNT(DISTINCT ct.content_item_id) as items_with_translations
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.screen_location LIKE 'credit_refi_%'
        AND ci.is_active = TRUE
      GROUP BY ci.screen_location
      ORDER BY ci.screen_location
    `;
    
    const verification = await pool.query(verificationQuery);
    
    console.log('\n📊 Translation status after cleanup:');
    verification.rows.forEach(row => {
      const coverage = row.total_items > 0 ? Math.round((row.items_with_translations / row.total_items) * 100) : 0;
      const status = coverage === 0 ? '🔴' : coverage < 50 ? '🟡' : '🟢';
      console.log(`  ${status} ${row.screen_location}: ${row.items_with_translations}/${row.total_items} items (${coverage}%)`);
    });
    
    console.log('\n✅ Generic translations cleanup complete!');
    console.log('📝 Credit-refi drill pages will now show empty translations');
    console.log('🎯 Ready for dev team to add real application content');
    
    await pool.end();
  } catch (error) {
    console.error('Error removing generic credit-refi translations:', error);
    await pool.end();
    process.exit(1);
  }
}

removeGenericCreditRefiTranslations();