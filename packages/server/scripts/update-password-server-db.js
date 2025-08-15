// This script uses the exact same pool configuration as the server
const { Pool } = require('pg');
const path = require('path');
const rootDir = path.resolve(__dirname, '../..');

// Load environment variables exactly like the server does
require('dotenv').config({ path: path.join(rootDir, '.env.local') });
require('dotenv').config({ path: path.join(rootDir, '.env') });

// Use the exact same configuration as server.js
const isProduction = process.env.NODE_ENV === 'production';

const primaryConfig = {
  connectionString: process.env.CONTENT_DATABASE_URL,
  ssl: isProduction ? false : false,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  max: 10
};

console.log('🔌 Server database connection:', primaryConfig.connectionString?.split('@')[1]);

let pool = new Pool(primaryConfig);

async function updatePasswordInServerDatabase() {
  const client = await pool.connect();
  
  try {
    // Check current user
    const currentUser = await client.query('SELECT email, password_hash FROM admin_users WHERE email = $1', ['admin@bankim.com']);
    console.log('Current user in server database:', currentUser.rows.length > 0 ? 'Found' : 'Not found');
    
    if (currentUser.rows.length > 0) {
      const user = currentUser.rows[0];
      console.log('- Email:', user.email);
      console.log('- Has password_hash:', !!user.password_hash);
      console.log('- Password hash length:', user.password_hash ? user.password_hash.length : 0);
    }
    
    // Add password_hash column if it doesn't exist
    const columnCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'admin_users' AND column_name = 'password_hash'
    `);
    
    if (columnCheck.rows.length === 0) {
      await client.query(`ALTER TABLE admin_users ADD COLUMN password_hash VARCHAR(255)`);
      console.log('✅ Added password_hash column');
    }
    
    // Update the admin user with password hash
    const bcrypt = require('bcrypt');
    const defaultPassword = 'Admin123!';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    
    const updateResult = await client.query(`
      UPDATE admin_users 
      SET password_hash = $1
      WHERE email = 'admin@bankim.com'
    `, [hashedPassword]);
    
    console.log('✅ Updated admin user password hash, rows affected:', updateResult.rowCount);
    
    // Verify the update
    const verifyResult = await client.query('SELECT email, password_hash FROM admin_users WHERE email = $1', ['admin@bankim.com']);
    if (verifyResult.rows.length > 0) {
      const user = verifyResult.rows[0];
      const isValid = await bcrypt.compare('Admin123!', user.password_hash);
      console.log('✅ Password verification:', isValid ? 'SUCCESS' : 'FAILED');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run the update
updatePasswordInServerDatabase()
  .then(() => {
    console.log('🎉 Password update completed successfully');
    pool.end();
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Password update failed:', error);
    pool.end();
    process.exit(1);
  });