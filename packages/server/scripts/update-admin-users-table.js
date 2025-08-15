const { Pool } = require('pg');
require('dotenv').config({ path: '../../.env.local' });
require('dotenv').config({ path: '../../.env' });

// Use the same configuration as the server
const isProduction = process.env.NODE_ENV === 'production';

const primaryConfig = {
  connectionString: process.env.CONTENT_DATABASE_URL,
  ssl: isProduction ? false : false,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  max: 10
};

console.log('🔌 Updating admin_users table structure...');

const pool = new Pool(primaryConfig);

async function updateAdminUsersTable() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Adding password_hash column to existing admin_users table...');
    
    // Check if password_hash column exists
    const columnCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'admin_users' AND column_name = 'password_hash'
    `);
    
    if (columnCheck.rows.length === 0) {
      // Add password_hash column
      await client.query(`
        ALTER TABLE admin_users 
        ADD COLUMN password_hash VARCHAR(255)
      `);
      console.log('✅ Added password_hash column');
    } else {
      console.log('ℹ️  password_hash column already exists');
    }
    
    // Update the existing admin user with a password hash
    const bcrypt = require('bcrypt');
    const defaultPassword = 'Admin123!';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    
    const updateResult = await client.query(`
      UPDATE admin_users 
      SET password_hash = $1
      WHERE email = 'admin@bankim.com' AND password_hash IS NULL
    `, [hashedPassword]);
    
    if (updateResult.rowCount > 0) {
      console.log('✅ Updated admin user with password hash');
      console.log('   📧 Email: admin@bankim.com');
      console.log('   🔑 Password: Admin123!');
    } else {
      console.log('ℹ️  Admin user already has password set');
    }
    
    // Also update the content_manager user
    const contentUpdateResult = await client.query(`
      UPDATE admin_users 
      SET password_hash = $1
      WHERE email = 'content@bankim.com' AND password_hash IS NULL
    `, [hashedPassword]);
    
    if (contentUpdateResult.rowCount > 0) {
      console.log('✅ Updated content manager with password hash');
      console.log('   📧 Email: content@bankim.com');
      console.log('   🔑 Password: Admin123!');
    }
    
    // Create session table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS session (
        sid VARCHAR(255) PRIMARY KEY,
        sess JSON NOT NULL,
        expire TIMESTAMP(6) NOT NULL
      )
    `);
    console.log('✅ Ensured session table exists');
    
    // Create audit log tables if they don't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS login_audit_log (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        user_id INTEGER REFERENCES admin_users(id),
        session_id VARCHAR(255),
        success BOOLEAN NOT NULL,
        failure_reason VARCHAR(255),
        ip_address INET,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Ensured login_audit_log table exists');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS content_audit_log (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES admin_users(id),
        user_email VARCHAR(255) NOT NULL,
        user_name VARCHAR(255) NOT NULL,
        user_role VARCHAR(50) NOT NULL,
        session_id VARCHAR(255),
        content_item_id INTEGER,
        content_key VARCHAR(255),
        screen_location VARCHAR(255),
        language_code VARCHAR(10),
        action_type VARCHAR(50) NOT NULL,
        field_changed VARCHAR(100) DEFAULT 'content_value',
        old_value TEXT,
        new_value TEXT,
        source_page VARCHAR(255),
        user_agent TEXT,
        ip_address INET,
        referer_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Ensured content_audit_log table exists');
    
    console.log('✅ Admin users table update complete');
    
  } catch (error) {
    console.error('❌ Error updating admin_users table:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run if called directly
if (require.main === module) {
  updateAdminUsersTable()
    .then(() => {
      console.log('🎉 Admin users table update completed successfully');
      pool.end();
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Admin users table update failed:', error);
      pool.end();
      process.exit(1);
    });
}

module.exports = { updateAdminUsersTable };