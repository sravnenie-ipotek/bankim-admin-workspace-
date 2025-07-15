import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create database connection
const dbPath = path.join(__dirname, 'bankim_test.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create test table
const createTestTable = () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS test_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      role TEXT DEFAULT 'user',
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;
  
  try {
    db.exec(createTableQuery);
    console.log('✅ Test table "test_users" created successfully');
    
    // Insert some sample data if table is empty
    const count = db.prepare('SELECT COUNT(*) as count FROM test_users').get().count;
    
    if (count === 0) {
      const insertSampleData = db.prepare(`
        INSERT INTO test_users (name, email, role, status) VALUES (?, ?, ?, ?)
      `);
      
      const sampleUsers = [
        ['John Doe', 'john@bankim.com', 'admin', 'active'],
        ['Jane Smith', 'jane@bankim.com', 'manager', 'active'],
        ['Bob Johnson', 'bob@bankim.com', 'user', 'inactive'],
        ['Alice Brown', 'alice@bankim.com', 'user', 'active'],
        ['Charlie Wilson', 'charlie@bankim.com', 'manager', 'pending']
      ];
      
      const insertMany = db.transaction((users) => {
        for (const user of users) {
          insertSampleData.run(user);
        }
      });
      
      insertMany(sampleUsers);
      console.log(`✅ Inserted ${sampleUsers.length} sample users`);
    }
    
  } catch (error) {
    console.error('❌ Error creating test table:', error);
  }
};

// Create calculator formula table
const createCalculatorFormulaTable = () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS calculator_formula (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      min_term TEXT NOT NULL,
      max_term TEXT NOT NULL,
      financing_percentage TEXT NOT NULL,
      bank_interest_rate TEXT NOT NULL,
      base_interest_rate TEXT NOT NULL,
      variable_interest_rate TEXT NOT NULL,
      interest_change_period TEXT NOT NULL,
      inflation_index TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;
  
  try {
    db.exec(createTableQuery);
    console.log('✅ Calculator formula table created successfully');
    
    // Insert default formula data if table is empty
    const count = db.prepare('SELECT COUNT(*) as count FROM calculator_formula').get().count;
    
    if (count === 0) {
      const insertDefaultFormula = db.prepare(`
        INSERT INTO calculator_formula (
          min_term, max_term, financing_percentage, bank_interest_rate,
          base_interest_rate, variable_interest_rate, interest_change_period, inflation_index
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      // Default formula values per Confluence specifications
      insertDefaultFormula.run(['12', '360', '80', '3.5', '2.8', '1.2', '12', '2.1']);
      console.log('✅ Inserted default calculator formula');
    }
    
  } catch (error) {
    console.error('❌ Error creating calculator formula table:', error);
  }
};

// Initialize database
const initializeDatabase = () => {
  console.log('🚀 Initializing database...');
  console.log(`📁 Database path: ${dbPath}`);
  
  createTestTable();
  createCalculatorFormulaTable();
  
  console.log('✅ Database initialization complete');
};

// Database operations
const dbOperations = {
  // Get all users
  getAllUsers: () => {
    const query = 'SELECT * FROM test_users ORDER BY created_at DESC';
    return db.prepare(query).all();
  },
  
  // Get user by ID
  getUserById: (id) => {
    const query = 'SELECT * FROM test_users WHERE id = ?';
    return db.prepare(query).get(id);
  },
  
  // Create new user
  createUser: (userData) => {
    const query = `
      INSERT INTO test_users (name, email, role, status) 
      VALUES (?, ?, ?, ?)
    `;
    const result = db.prepare(query).run(
      userData.name, 
      userData.email, 
      userData.role || 'user', 
      userData.status || 'active'
    );
    return result.lastInsertRowid;
  },
  
  // Update user
  updateUser: (id, userData) => {
    const query = `
      UPDATE test_users 
      SET name = ?, email = ?, role = ?, status = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `;
    const result = db.prepare(query).run(
      userData.name,
      userData.email,
      userData.role,
      userData.status,
      id
    );
    return result.changes > 0;
  },
  
  // Delete user
  deleteUser: (id) => {
    const query = 'DELETE FROM test_users WHERE id = ?';
    const result = db.prepare(query).run(id);
    return result.changes > 0;
  },
  
  // Get database info
  getDbInfo: () => {
    const userCount = db.prepare('SELECT COUNT(*) as count FROM test_users').get().count;
    const formulaCount = db.prepare('SELECT COUNT(*) as count FROM calculator_formula').get().count;
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    
    return {
      database: 'bankim_test.db',
      tables: tables.map(t => t.name),
      userCount,
      formulaCount,
      path: dbPath
    };
  },

  // Calculator Formula Operations
  
  // Get current calculator formula (there should be only one active formula)
  getCalculatorFormula: () => {
    const query = 'SELECT * FROM calculator_formula ORDER BY updated_at DESC LIMIT 1';
    return db.prepare(query).get();
  },
  
  // Update calculator formula
  updateCalculatorFormula: (formulaData) => {
    const {
      minTerm, maxTerm, financingPercentage, bankInterestRate,
      baseInterestRate, variableInterestRate, interestChangePeriod, inflationIndex
    } = formulaData;
    
    // First check if formula exists
    const existing = db.prepare('SELECT id FROM calculator_formula LIMIT 1').get();
    
    if (existing) {
      // Update existing formula
      const query = `
        UPDATE calculator_formula 
        SET min_term = ?, max_term = ?, financing_percentage = ?, bank_interest_rate = ?,
            base_interest_rate = ?, variable_interest_rate = ?, interest_change_period = ?, 
            inflation_index = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `;
      const result = db.prepare(query).run(
        minTerm, maxTerm, financingPercentage, bankInterestRate,
        baseInterestRate, variableInterestRate, interestChangePeriod, inflationIndex,
        existing.id
      );
      return result.changes > 0;
    } else {
      // Create new formula
      const query = `
        INSERT INTO calculator_formula (
          min_term, max_term, financing_percentage, bank_interest_rate,
          base_interest_rate, variable_interest_rate, interest_change_period, inflation_index
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const result = db.prepare(query).run(
        minTerm, maxTerm, financingPercentage, bankInterestRate,
        baseInterestRate, variableInterestRate, interestChangePeriod, inflationIndex
      );
      return result.lastInsertRowid;
    }
  }
};

// Export database instance and operations
export { db, dbOperations, initializeDatabase }; 