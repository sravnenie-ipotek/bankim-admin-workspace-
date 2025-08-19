#!/usr/bin/env node

/**
 * Quick setup script to ensure admin user exists
 * Run with: node setup-admin-user.js
 */

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: './packages/server/.env' });

// Database configuration
const pool = new Pool({
  connectionString: process.env.MANAGEMENT_DATABASE_URL || process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function setupAdminUser() {
  console.log('🔧 Setting up admin user...\n');
  
  const email = 'admin@bankim.com';
  const password = 'Admin123!';
  const name = 'System Administrator';
  const role = 'director';
  
  try {
    // Check if user exists
    const checkResult = await pool.query(
      'SELECT id, email, name, role FROM admin_users WHERE email = $1',
      [email]
    );
    
    if (checkResult.rows.length > 0) {
      console.log('✅ Admin user already exists:');
      console.log(`   Email: ${email}`);
      console.log(`   Name: ${checkResult.rows[0].name}`);
      console.log(`   Role: ${checkResult.rows[0].role}`);
      console.log(`   Password: ${password}`);
      
      // Update password to ensure it's correct
      const hashedPassword = await bcrypt.hash(password, 10);
      await pool.query(
        'UPDATE admin_users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE email = $2',
        [hashedPassword, email]
      );
      console.log('\n🔄 Password has been reset to default');
    } else {
      // Create new user
      const hashedPassword = await bcrypt.hash(password, 10);
      await pool.query(
        'INSERT INTO admin_users (email, password_hash, name, role, is_active) VALUES ($1, $2, $3, $4, $5)',
        [email, hashedPassword, name, role, true]
      );
      
      console.log('✅ Admin user created successfully:');
      console.log(`   Email: ${email}`);
      console.log(`   Password: ${password}`);
      console.log(`   Name: ${name}`);
      console.log(`   Role: ${role}`);
    }
    
    console.log('\n📝 Login Instructions:');
    console.log('1. Go to http://localhost:3002');
    console.log('2. Click on "Login" or navigate to /login');
    console.log('3. Use these credentials:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log('\n⚠️  Change this password in production!');
    
  } catch (error) {
    console.error('❌ Error setting up admin user:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Make sure the database is running');
    console.error('2. Check your DATABASE_URL or MANAGEMENT_DATABASE_URL in .env');
    console.error('3. Ensure admin_users table exists (run migrations)');
  } finally {
    await pool.end();
  }
}

// Run the setup
setupAdminUser();