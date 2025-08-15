const { Pool } = require('pg');
require('dotenv').config();

// Core database configuration (bankim_core) - CommonJS version
const coreConfig = {
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
    workflows: 'workflows',
    // Add bank-specific calculation tables
    banks: 'banks',
    bank_configurations: 'bank_configurations', 
    banking_standards: 'banking_standards',
    customer_applications: 'customer_applications',
    bank_offers: 'bank_offers',
    calculation_logs: 'calculation_logs'
  }
};

// Create connection pool for core database
const corePool = new Pool({
  connectionString: coreConfig.connectionString,
  ssl: coreConfig.ssl,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test core database connection
const testCoreConnection = async () => {
  try {
    const client = await corePool.connect();
    console.log('✅ Connected to bankim_core database (auth)');
    
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

// Graceful shutdown
const closeCoreConnection = async () => {
  try {
    await corePool.end();
    console.log('✅ bankim_core database connection closed');
  } catch (error) {
    console.error('❌ Error closing bankim_core connection:', error);
  }
};

module.exports = {
  coreConfig,
  corePool,
  testCoreConnection,
  closeCoreConnection
};