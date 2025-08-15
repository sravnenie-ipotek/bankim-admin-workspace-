const bcrypt = require('bcrypt');
const { Pool } = require('pg');

// Database configuration
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'bankim_content',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function addAdminUser() {
  try {
    console.log('🔐 Adding admin user...');
    
    // Hash the password
    const password = 'Admin123!';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id, email FROM admin_users WHERE email = $1',
      ['admin@bankim.com']
    );
    
    if (existingUser.rows.length > 0) {
      console.log('👤 User admin@bankim.com already exists, updating password...');
      
      // Update the existing user's password
      await pool.query(
        'UPDATE admin_users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE email = $2',
        [hashedPassword, 'admin@bankim.com']
      );
      
      console.log('✅ Password updated for admin@bankim.com');
    } else {
      console.log('👤 Creating new admin user...');
      
      // Insert new user
      await pool.query(
        'INSERT INTO admin_users (email, password_hash, name, role) VALUES ($1, $2, $3, $4)',
        ['admin@bankim.com', hashedPassword, 'System Administrator', 'director']
      );
      
      console.log('✅ Admin user created: admin@bankim.com');
    }
    
    console.log('🔑 Login credentials:');
    console.log('   Email: admin@bankim.com');
    console.log('   Password: Admin123!');
    console.log('   Role: director');
    
  } catch (error) {
    console.error('❌ Error adding admin user:', error);
  } finally {
    await pool.end();
  }
}

// Run the script
addAdminUser();

