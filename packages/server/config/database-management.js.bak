import pg from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const { Pool } = pg;

// Management database configuration
export const managementConfig = {
  name: 'bankim_management',
  host: 'yamanote.proxy.rlwy.net',
  port: 53119,
  database: 'railway',
  connectionString: process.env.MANAGEMENT_DATABASE_URL || 'postgresql://postgres:hNmqRehjTLTuTGysRIYrvPPaQBDrmNQA@yamanote.proxy.rlwy.net:53119/railway',
  ssl: { rejectUnauthorized: false },
  tables: {
    management: 'test_management',
    users: 'users',
    accounts: 'accounts',
    transactions: 'transactions',
    audit_logs: 'audit_logs'
  }
};

// Create connection pool for management database
export const managementPool = new Pool({
  connectionString: managementConfig.connectionString,
  ssl: managementConfig.ssl,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection
export const testManagementConnection = async () => {
  try {
    const client = await managementPool.connect();
    console.log('✅ Connected to bankim_management database');
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Management database connection failed:', error.message);
    return false;
  }
};

// Management database operations
export const managementOperations = {
  // Test table operations
  createTestTable: async () => {
    const client = await managementPool.connect();
    try {
      await client.query('CREATE TABLE IF NOT EXISTS test_management (id INTEGER PRIMARY KEY)');
      await client.query('INSERT INTO test_management (id) VALUES (1) ON CONFLICT (id) DO NOTHING');
      return true;
    } catch (error) {
      console.error('Error creating test table:', error);
      return false;
    } finally {
      client.release();
    }
  },
  
  // Get all management data
  getAllManagement: async () => {
    const client = await managementPool.connect();
    try {
      const result = await client.query('SELECT * FROM test_management ORDER BY id');
      return result.rows;
    } catch (error) {
      console.error('Error getting management data:', error);
      return [];
    } finally {
      client.release();
    }
  },
  
  // Get database info
  getDbInfo: async () => {
    const client = await managementPool.connect();
    try {
      const tablesResult = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);
      
      return {
        database: managementConfig.name,
        host: managementConfig.host,
        port: managementConfig.port,
        tables: tablesResult.rows.map(t => t.table_name),
        environment: process.env.NODE_ENV || 'development'
      };
    } catch (error) {
      console.error('Error getting database info:', error);
      return null;
    } finally {
      client.release();
    }
  }
};

// Initialize management database
export const initializeManagementDatabase = async () => {
  console.log('🚀 Initializing Management Database...');
  console.log(`📊 Database: ${managementConfig.name}`);
  console.log(`🔗 Host: ${managementConfig.host}:${managementConfig.port}`);
  
  const connected = await testManagementConnection();
  if (connected) {
    const tableCreated = await managementOperations.createTestTable();
    if (tableCreated) {
      console.log('✅ Management database initialization complete');
    } else {
      console.error('❌ Management database table creation failed');
    }
  } else {
    console.error('❌ Management database initialization failed');
  }
}; 