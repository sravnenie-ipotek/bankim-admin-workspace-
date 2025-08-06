/**
 * Database Migration Script: Setup Banks and Bank Configurations Tables
 * DEVELOPMENT: Creates proper tables for Calculator Formula functionality using Railway database
 * PRODUCTION: Creates proper tables for Calculator Formula functionality using local PostgreSQL database (bankim_content)
 */

const { Pool } = require('pg');
// Load environment variables with proper path resolution
require('dotenv').config({ path: require('path').join(__dirname, '../../../.env.local') });
require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') });

const isProduction = process.env.NODE_ENV === 'production';
const dbType = isProduction ? 'Local PostgreSQL database' : 'Railway (Local Development)';

// Environment-specific database configuration
const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL,
  ssl: false, // No SSL for both Railway (dev) and local PostgreSQL (prod)
});

console.log(`🏦 Setting up Banks and Bank Configurations tables in ${dbType} database...`);
console.log(`📊 Using database: ${process.env.CONTENT_DATABASE_URL ? `${dbType} CONTENT_DATABASE_URL` : 'Not configured'}`);

async function setupBanksTables() {
  try {
    // Create banks table
    console.log('1️⃣ Creating banks table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS banks (
        id SERIAL PRIMARY KEY,
        name_en VARCHAR(255) NOT NULL,
        name_he VARCHAR(255) NOT NULL,
        name_ru VARCHAR(255) NOT NULL,
        code VARCHAR(50) UNIQUE NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create bank_configurations table
    console.log('2️⃣ Creating bank_configurations table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bank_configurations (
        id SERIAL PRIMARY KEY,
        bank_id INTEGER NOT NULL REFERENCES banks(id) ON DELETE CASCADE,
        base_interest_rate DECIMAL(5,3) NOT NULL,
        min_interest_rate DECIMAL(5,3) NOT NULL,
        max_interest_rate DECIMAL(5,3) NOT NULL,
        max_ltv_ratio DECIMAL(5,2) NOT NULL,
        min_credit_score INTEGER NOT NULL,
        max_loan_amount DECIMAL(15,2) NOT NULL,
        min_loan_amount DECIMAL(15,2) NOT NULL,
        processing_fee DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(bank_id)
      )
    `);

    // Check if banks table has data, if not insert sample banks
    console.log('3️⃣ Checking for existing bank data...');
    const bankCount = await pool.query('SELECT COUNT(*) as count FROM banks');
    const count = parseInt(bankCount.rows[0].count);

    if (count === 0) {
      console.log('4️⃣ Inserting sample bank data...');
      await pool.query(`
        INSERT INTO banks (name_en, name_he, name_ru, code) VALUES
        ('Bank Apoalim', 'בנק אפועלים', 'Банк Апоалим', 'APOALIM'),
        ('Bank Hapoalim', 'בנק הפועלים', 'Банк Хапоалим', 'HAPOALIM'),
        ('Bank Leumi', 'בנק לאומי', 'Банк Леуми', 'LEUMI'),
        ('Discount Bank', 'בנק דיסקונט', 'Банк Дисконт', 'DISCOUNT'),
        ('First International Bank', 'בנק בינלאומי ראשון', 'Первый международный банк', 'FIBI')
      `);

      // Insert sample bank configurations
      console.log('5️⃣ Inserting sample bank configurations...');
      await pool.query(`
        INSERT INTO bank_configurations (
          bank_id, base_interest_rate, min_interest_rate, max_interest_rate,
          max_ltv_ratio, min_credit_score, max_loan_amount, min_loan_amount, processing_fee
        ) VALUES
        (1, 3.500, 2.800, 4.500, 75.00, 620, 2000000.00, 100000.00, 1500.00),
        (2, 3.750, 3.000, 4.800, 80.00, 650, 2500000.00, 150000.00, 1750.00),
        (3, 3.250, 2.500, 4.200, 70.00, 600, 1800000.00, 80000.00, 1200.00),
        (4, 3.900, 3.200, 5.000, 75.00, 640, 2200000.00, 120000.00, 1600.00),
        (5, 3.600, 2.900, 4.600, 78.00, 630, 2100000.00, 110000.00, 1400.00)
      `);
    } else {
      console.log(`✅ Found ${count} existing banks, skipping data insertion`);
    }

    // Create update trigger for updated_at
    console.log('6️⃣ Creating update triggers...');
    await pool.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    await pool.query(`
      DROP TRIGGER IF EXISTS update_banks_updated_at ON banks;
      CREATE TRIGGER update_banks_updated_at BEFORE UPDATE ON banks
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    await pool.query(`
      DROP TRIGGER IF EXISTS update_bank_configurations_updated_at ON bank_configurations;
      CREATE TRIGGER update_bank_configurations_updated_at BEFORE UPDATE ON bank_configurations
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    // Verify setup
    console.log('7️⃣ Verifying setup...');
    const verifyBanks = await pool.query('SELECT COUNT(*) as count FROM banks WHERE is_active = true');
    const verifyConfigs = await pool.query('SELECT COUNT(*) as count FROM bank_configurations');
    
    console.log(`✅ Banks table setup complete: ${verifyBanks.rows[0].count} active banks`);
    console.log(`✅ Bank configurations table setup complete: ${verifyConfigs.rows[0].count} configurations`);

    // Show sample data
    const sampleBanks = await pool.query('SELECT id, name_ru, code FROM banks LIMIT 3');
    console.log('\n📋 Sample banks:');
    sampleBanks.rows.forEach(bank => {
      console.log(`   ${bank.id}: ${bank.name_ru} (${bank.code})`);
    });

    console.log(`\n🎉 Banks tables setup complete! Calculator Formula can now connect to ${dbType} database.`);

  } catch (error) {
    console.error('❌ Error setting up banks tables:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run setup
setupBanksTables()
  .then(() => {
    console.log('✅ Migration completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });