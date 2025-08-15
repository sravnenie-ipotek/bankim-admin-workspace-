// Update admin user password hash in core database
const { corePool } = require('../config/database-core-cjs');
const bcrypt = require('bcrypt');

async function updatePasswordInCoreDatabase() {
  const client = await corePool.connect();
  
  try {
    console.log('🔧 Updating password hash in core database...');
    
    // Check current user
    const currentUser = await client.query('SELECT email, password_hash FROM admin_users WHERE email = $1', ['admin@bankim.com']);
    console.log('Current user in core database:', currentUser.rows.length > 0 ? 'Found' : 'Not found');
    
    if (currentUser.rows.length > 0) {
      const user = currentUser.rows[0];
      console.log('- Email:', user.email);
      console.log('- Current password_hash:', user.password_hash ? user.password_hash.substring(0, 20) + '...' : 'null');
      console.log('- Is proper bcrypt hash:', user.password_hash && user.password_hash.startsWith('$2'));
    }
    
    // Generate proper bcrypt hash for Admin123!
    const defaultPassword = 'Admin123!';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    console.log('- New bcrypt hash generated:', hashedPassword.substring(0, 29) + '...');
    
    // Update the admin user with proper bcrypt hash
    const updateResult = await client.query(`
      UPDATE admin_users 
      SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
      WHERE email = 'admin@bankim.com'
    `, [hashedPassword]);
    
    console.log('✅ Updated admin user password hash in core DB, rows affected:', updateResult.rowCount);
    
    // Verify the update
    const verifyResult = await client.query('SELECT email, password_hash FROM admin_users WHERE email = $1', ['admin@bankim.com']);
    if (verifyResult.rows.length > 0) {
      const user = verifyResult.rows[0];
      console.log('- Verification - New hash starts with:', user.password_hash.substring(0, 10));
      const isValid = await bcrypt.compare('Admin123!', user.password_hash);
      console.log('✅ Password verification test:', isValid ? 'SUCCESS' : 'FAILED');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run the update
updatePasswordInCoreDatabase()
  .then(() => {
    console.log('🎉 Core database password update completed successfully');
    corePool.end();
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Core database password update failed:', error);
    corePool.end();
    process.exit(1);
  });