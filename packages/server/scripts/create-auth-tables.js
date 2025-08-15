const { corePool } = require('../config/database-core-cjs');

async function createAuthTables() {
  const client = await corePool.connect();
  
  try {
    console.log('🚀 Creating authentication tables...');
    
    // Create admin_users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL CHECK (role IN ('director', 'administration', 'sales-manager', 'content-manager', 'brokers', 'bank-employee')),
        is_active BOOLEAN DEFAULT TRUE,
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Created admin_users table');

    // Create session table for session storage
    await client.query(`
      CREATE TABLE IF NOT EXISTS session (
        sid VARCHAR(255) PRIMARY KEY,
        sess JSON NOT NULL,
        expire TIMESTAMP(6) NOT NULL
      )
    `);
    console.log('✅ Created session table');

    // Create login_audit_log table
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
    console.log('✅ Created login_audit_log table');

    // Create content_audit_log table for content changes
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
    console.log('✅ Created content_audit_log table');

    // Create default admin user
    const bcrypt = require('bcrypt');
    const defaultPassword = 'Admin123!'; // Default password for initial setup
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const existingUser = await client.query('SELECT id FROM admin_users WHERE email = $1', ['admin@bankim.com']);
    
    if (existingUser.rows.length === 0) {
      await client.query(`
        INSERT INTO admin_users (email, password_hash, name, role, is_active)
        VALUES ($1, $2, $3, $4, $5)
      `, ['admin@bankim.com', hashedPassword, 'System Administrator', 'director', true]);
      
      console.log('✅ Created default admin user');
      console.log('   📧 Email: admin@bankim.com');
      console.log('   🔑 Password: Admin123!');
      console.log('   ⚠️  Please change this password after first login');
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    console.log('✅ Authentication tables setup complete');
    
  } catch (error) {
    console.error('❌ Error creating authentication tables:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run if called directly
if (require.main === module) {
  createAuthTables()
    .then(() => {
      console.log('🎉 Authentication setup completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Authentication setup failed:', error);
      process.exit(1);
    });
}

module.exports = { createAuthTables };