import pg from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const { Pool } = pg;

// Database configuration for Railway PostgreSQL
const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
};

// Create connection pool
const pool = new Pool(dbConfig);

// Test database connection
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL database');
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

// Create test table
const createTestTable = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS test_users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      role VARCHAR(50) DEFAULT 'user',
      status VARCHAR(50) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  
  try {
    await pool.query(createTableQuery);
    console.log('✅ Test table "test_users" created successfully');
    
    // Check if table has data
    const countResult = await pool.query('SELECT COUNT(*) as count FROM test_users');
    const count = parseInt(countResult.rows[0].count);
    
    if (count === 0) {
      // Insert sample data
      const sampleUsers = [
        ['John Doe', 'john@bankim.com', 'admin', 'active'],
        ['Jane Smith', 'jane@bankim.com', 'manager', 'active'],
        ['Bob Johnson', 'bob@bankim.com', 'user', 'inactive'],
        ['Alice Brown', 'alice@bankim.com', 'user', 'active'],
        ['Charlie Wilson', 'charlie@bankim.com', 'manager', 'pending']
      ];
      
      for (const user of sampleUsers) {
        await pool.query(
          'INSERT INTO test_users (name, email, role, status) VALUES ($1, $2, $3, $4)',
          user
        );
      }
      
      console.log(`✅ Inserted ${sampleUsers.length} sample users`);
    }
    
  } catch (error) {
    console.error('❌ Error creating test table:', error.message);
  }
};

// Initialize database
const initializeDatabase = async () => {
  console.log('🚀 Initializing PostgreSQL database...');
  console.log(`📊 Database URL: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
  
  const connected = await testConnection();
  if (connected) {
    await createTestTable();
    console.log('✅ Database initialization complete');
  } else {
    console.error('❌ Database initialization failed');
  }
};

// Database operations
const dbOperations = {
  // Get all users
  getAllUsers: async () => {
    const query = 'SELECT * FROM test_users ORDER BY created_at DESC';
    const result = await pool.query(query);
    return result.rows;
  },
  
  // Get user by ID
  getUserById: async (id) => {
    const query = 'SELECT * FROM test_users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },
  
  // Create new user
  createUser: async (userData) => {
    const query = `
      INSERT INTO test_users (name, email, role, status) 
      VALUES ($1, $2, $3, $4) 
      RETURNING id
    `;
    const result = await pool.query(query, [
      userData.name, 
      userData.email, 
      userData.role || 'user', 
      userData.status || 'active'
    ]);
    return result.rows[0].id;
  },
  
  // Update user
  updateUser: async (id, userData) => {
    const query = `
      UPDATE test_users 
      SET name = $1, email = $2, role = $3, status = $4, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $5
    `;
    const result = await pool.query(query, [
      userData.name,
      userData.email,
      userData.role,
      userData.status,
      id
    ]);
    return result.rowCount > 0;
  },
  
  // Delete user
  deleteUser: async (id) => {
    const query = 'DELETE FROM test_users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount > 0;
  },
  
  // Get database info
  getDbInfo: async () => {
    const userCountResult = await pool.query('SELECT COUNT(*) as count FROM test_users');
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    return {
      database: 'PostgreSQL on Railway',
      tables: tablesResult.rows.map(t => t.table_name),
      userCount: parseInt(userCountResult.rows[0].count),
      environment: process.env.NODE_ENV || 'development'
    };
  }
};

// Export database pool and operations
export { pool, dbOperations, initializeDatabase }; 