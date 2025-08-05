const { Pool } = require('pg');

async function testMenuQuery() {
  const databaseUrl = process.env.CONTENT_DATABASE_URL || process.env.DATABASE_URL;
  const isRailway = databaseUrl && databaseUrl.includes('railway.app');
  
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: isRailway ? {
      rejectUnauthorized: false
    } : false
  });

  try {
    console.log('Testing menu query...\n');
    
    // First, check what screen_locations exist that might be menu-related
    const menuCheckResult = await pool.query(`
      SELECT DISTINCT screen_location, COUNT(*) as item_count
      FROM content_items
      WHERE screen_location LIKE '%menu%' 
         OR screen_location LIKE '%sidebar%'
         OR screen_location LIKE '%navigation%'
         OR screen_location LIKE '%nav%'
      GROUP BY screen_location
      ORDER BY screen_location
    `);
    
    console.log('Menu-related screen_locations:');
    console.log(menuCheckResult.rows);
    console.log('\n');
    
    // Also check for any items that might be menu items by content_key
    const menuKeyResult = await pool.query(`
      SELECT DISTINCT screen_location, content_key, component_type
      FROM content_items
      WHERE content_key LIKE '%menu%' 
         OR content_key LIKE '%nav%'
         OR content_key LIKE '%sidebar%'
         OR category = 'navigation'
         OR category = 'menu'
      LIMIT 20
    `);
    
    console.log('Menu-related content by key/category:');
    console.log(menuKeyResult.rows);
    console.log('\n');
    
    // Check what categories exist
    const categoryResult = await pool.query(`
      SELECT DISTINCT category, COUNT(*) as item_count
      FROM content_items
      WHERE is_active = TRUE
      GROUP BY category
      ORDER BY category
    `);
    
    console.log('All categories:');
    console.log(categoryResult.rows);
    
  } catch (error) {
    console.error('Query error:', error);
  } finally {
    await pool.end();
  }
}

testMenuQuery();
