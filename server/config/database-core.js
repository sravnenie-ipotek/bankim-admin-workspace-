import pg from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const { Pool } = pg;

// Core database configuration (bankim_core)
export const coreConfig = {
  name: 'bankim_core',
  host: 'yamanote.proxy.rlwy.net',
  port: 53119,
  database: 'railway',
  connectionString: process.env.CORE_DATABASE_URL || process.env.MANAGEMENT_DATABASE_URL || 'postgresql://postgres:hNmqRehjTLTuTGysRIYrvPPaQBDrmNQA@yamanote.proxy.rlwy.net:53119/railway',
  ssl: { rejectUnauthorized: false },
  tables: {
    calculator_formula: 'calculator_formula',
    admin_users: 'admin_users',
    user_permissions: 'user_permissions',
    system_configurations: 'system_configurations',
    audit_logs: 'audit_logs',
    workflows: 'workflows'
  }
};

// Create connection pool for core database
export const corePool = new Pool({
  connectionString: coreConfig.connectionString,
  ssl: coreConfig.ssl,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test core database connection
export const testCoreConnection = async () => {
  try {
    const client = await corePool.connect();
    console.log('✅ Connected to bankim_core database');
    
    // Test query
    const result = await client.query('SELECT NOW() as current_time');
    console.log('🕒 Core database time:', result.rows[0].current_time);
    
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Core database connection failed:', error.message);
    return false;
  }
};

// Initialize core database tables
export const initializeCoreDatabase = async () => {
  const client = await corePool.connect();
  
  try {
    console.log('🚀 Initializing bankim_core database...');
    
    // Create calculator_formula table
    await client.query(`
      CREATE TABLE IF NOT EXISTS calculator_formula (
        id SERIAL PRIMARY KEY,
        min_term VARCHAR(10) NOT NULL,
        max_term VARCHAR(10) NOT NULL,
        financing_percentage VARCHAR(10) NOT NULL,
        bank_interest_rate VARCHAR(10) NOT NULL,
        base_interest_rate VARCHAR(10) NOT NULL,
        variable_interest_rate VARCHAR(10) NOT NULL,
        interest_change_period VARCHAR(10) NOT NULL,
        inflation_index VARCHAR(10) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Insert default calculator formula if none exists
    const formulaCount = await client.query('SELECT COUNT(*) FROM calculator_formula');
    if (parseInt(formulaCount.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO calculator_formula (
          min_term, max_term, financing_percentage, bank_interest_rate,
          base_interest_rate, variable_interest_rate, interest_change_period, inflation_index
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, ['12', '360', '80', '3.5', '2.8', '1.2', '12', '2.1']);
      
      console.log('✅ Inserted default calculator formula into bankim_core');
    }
    
    console.log('✅ bankim_core database initialization complete');
    
  } catch (error) {
    console.error('❌ Error initializing bankim_core database:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Core database operations
export const coreOperations = {
  // Calculator Formula Operations
  async getCalculatorFormula() {
    const client = await corePool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM calculator_formula ORDER BY updated_at DESC LIMIT 1'
      );
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  },

  async updateCalculatorFormula(formulaData) {
    const client = await corePool.connect();
    try {
      const {
        minTerm, maxTerm, financingPercentage, bankInterestRate,
        baseInterestRate, variableInterestRate, interestChangePeriod, inflationIndex
      } = formulaData;

      // Check if formula exists
      const existing = await client.query('SELECT id FROM calculator_formula LIMIT 1');
      
      if (existing.rows.length > 0) {
        // Update existing formula
        const result = await client.query(`
          UPDATE calculator_formula 
          SET min_term = $1, max_term = $2, financing_percentage = $3, bank_interest_rate = $4,
              base_interest_rate = $5, variable_interest_rate = $6, interest_change_period = $7, 
              inflation_index = $8, updated_at = CURRENT_TIMESTAMP 
          WHERE id = $9
          RETURNING *
        `, [
          minTerm, maxTerm, financingPercentage, bankInterestRate,
          baseInterestRate, variableInterestRate, interestChangePeriod, inflationIndex,
          existing.rows[0].id
        ]);
        return result.rows[0];
      } else {
        // Create new formula
        const result = await client.query(`
          INSERT INTO calculator_formula (
            min_term, max_term, financing_percentage, bank_interest_rate,
            base_interest_rate, variable_interest_rate, interest_change_period, inflation_index
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING *
        `, [
          minTerm, maxTerm, financingPercentage, bankInterestRate,
          baseInterestRate, variableInterestRate, interestChangePeriod, inflationIndex
        ]);
        return result.rows[0];
      }
    } finally {
      client.release();
    }
  },

  // Get database info
  async getDbInfo() {
    const client = await corePool.connect();
    try {
      const formulaCount = await client.query('SELECT COUNT(*) FROM calculator_formula');
      const tables = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);
      
      return {
        database: 'bankim_core',
        type: 'PostgreSQL',
        tables: tables.rows.map(t => t.table_name),
        formulaCount: parseInt(formulaCount.rows[0].count),
        host: coreConfig.host,
        port: coreConfig.port
      };
    } finally {
      client.release();
    }
  }
};

// Graceful shutdown
export const closeCoreConnection = async () => {
  try {
    await corePool.end();
    console.log('✅ bankim_core database connection closed');
  } catch (error) {
    console.error('❌ Error closing bankim_core connection:', error);
  }
}; 