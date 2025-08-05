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
    
    // Create calculator_formula table (keep existing)
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
    
    // Create banks table (Master bank list - 18 active banks)
    await client.query(`
      CREATE TABLE IF NOT EXISTS banks (
        id SERIAL PRIMARY KEY,
        name_en VARCHAR(255) NOT NULL,
        name_he VARCHAR(255) NOT NULL,
        name_ru VARCHAR(255) NOT NULL,
        url VARCHAR(500),
        tender BOOLEAN DEFAULT TRUE,
        priority INTEGER DEFAULT 1,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create bank_configurations table (Bank-specific calculation parameters)
    await client.query(`
      CREATE TABLE IF NOT EXISTS bank_configurations (
        id SERIAL PRIMARY KEY,
        bank_id INTEGER NOT NULL REFERENCES banks(id),
        product_type VARCHAR(50) DEFAULT 'mortgage',
        base_interest_rate DECIMAL(5,3) NOT NULL,
        min_interest_rate DECIMAL(5,3),
        max_interest_rate DECIMAL(5,3),
        max_ltv_ratio DECIMAL(5,2) NOT NULL,
        min_credit_score INTEGER NOT NULL,
        max_loan_amount DECIMAL(15,2),
        min_loan_amount DECIMAL(15,2),
        processing_fee DECIMAL(10,2) DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(bank_id, product_type)
      )
    `);
    
    // Create banking_standards table (Global fallback standards)
    await client.query(`
      CREATE TABLE IF NOT EXISTS banking_standards (
        id SERIAL PRIMARY KEY,
        business_path VARCHAR(100) NOT NULL,
        standard_category VARCHAR(100) NOT NULL,
        standard_name VARCHAR(100) NOT NULL,
        standard_value VARCHAR(50) NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(business_path, standard_category, standard_name)
      )
    `);
    
    // Create customer_applications table (Customer data)
    await client.query(`
      CREATE TABLE IF NOT EXISTS customer_applications (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER,
        loan_amount DECIMAL(15,2) NOT NULL,
        down_payment DECIMAL(15,2) NOT NULL,
        property_value DECIMAL(15,2) NOT NULL,
        monthly_income DECIMAL(10,2) NOT NULL,
        monthly_expenses DECIMAL(10,2) NOT NULL,
        credit_score INTEGER NOT NULL,
        employment_type VARCHAR(50) NOT NULL,
        property_ownership VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create bank_offers table (Store bank comparison results)
    await client.query(`
      CREATE TABLE IF NOT EXISTS bank_offers (
        id SERIAL PRIMARY KEY,
        application_id INTEGER NOT NULL REFERENCES customer_applications(id),
        bank_id INTEGER NOT NULL REFERENCES banks(id),
        interest_rate DECIMAL(5,3) NOT NULL,
        monthly_payment DECIMAL(10,2) NOT NULL,
        total_payment DECIMAL(15,2) NOT NULL,
        loan_term INTEGER NOT NULL,
        approval_status VARCHAR(20) DEFAULT 'approved',
        ltv_ratio DECIMAL(5,2) NOT NULL,
        dti_ratio DECIMAL(5,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create calculation_logs table (Detailed calculation logs)
    await client.query(`
      CREATE TABLE IF NOT EXISTS calculation_logs (
        id SERIAL PRIMARY KEY,
        application_id INTEGER NOT NULL REFERENCES customer_applications(id),
        bank_id INTEGER NOT NULL REFERENCES banks(id),
        calculation_step VARCHAR(100) NOT NULL,
        input_values JSONB,
        output_values JSONB,
        status VARCHAR(20) DEFAULT 'success',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

    // Insert sample banks if none exist
    const bankCount = await client.query('SELECT COUNT(*) FROM banks');
    if (parseInt(bankCount.rows[0].count) === 0) {
      const sampleBanks = [
        ['Bank Hapoalim', 'בנק הפועלים', 'Банк Апоалим', 'https://bankhapoalim.co.il', true, 1],
        ['Bank Leumi', 'בנק לאומי', 'Банк Леуми', 'https://bankleumi.co.il', true, 2],
        ['Discount Bank', 'בנק דיסקונט', 'Дисконт Банк', 'https://discountbank.co.il', true, 3],
        ['First International Bank', 'בנק הבינלאומי הראשון', 'Первый Международный Банк', 'https://fibi.co.il', true, 4],
        ['Mizrahi Tefahot Bank', 'בנק מזרחי טפחות', 'Банк Мизрахи Тефахот', 'https://mizrahi-tefahot.co.il', true, 5],
        ['Bank Igud', 'בנק איגוד', 'Банк Игуд', 'https://igud.co.il', true, 6],
        ['Citibank Israel', 'סיטיבנק ישראל', 'Ситибанк Израиль', 'https://citibank.co.il', true, 7],
        ['Bank Yaav', 'בנק יהב', 'Банк Яав', 'https://bankyahav.co.il', true, 8],
        ['Mercantil Discount', 'מרכנתיל דיסקונט', 'Меркантиль Дисконт', 'https://mercantile.co.il', true, 9],
        ['Bank Yerushalayim', 'בנק ירושלים', 'Банк Иерусалим', 'https://bankjerusalem.co.il', true, 10]
      ];
      
      for (const bank of sampleBanks) {
        await client.query(`
          INSERT INTO banks (name_en, name_he, name_ru, url, tender, priority) 
          VALUES ($1, $2, $3, $4, $5, $6)
        `, bank);
      }
      console.log('✅ Inserted 10 sample banks into bankim_core');
    }

    // Insert sample bank configurations if none exist
    const configCount = await client.query('SELECT COUNT(*) FROM bank_configurations');
    if (parseInt(configCount.rows[0].count) === 0) {
      const sampleConfigs = [
        [1, 'mortgage', 3.18, 2.80, 4.00, 75.00, 620, 2000000, 100000, 1500], // Bank Hapoalim
        [2, 'mortgage', 3.25, 2.90, 4.10, 80.00, 640, 2500000, 150000, 1200], // Bank Leumi
        [3, 'mortgage', 3.45, 3.00, 4.20, 70.00, 680, 2200000, 120000, 1800], // Discount Bank
        [4, 'mortgage', 3.30, 2.95, 4.05, 75.00, 650, 2300000, 130000, 1400], // First International
        [5, 'mortgage', 3.20, 2.85, 3.95, 82.00, 620, 2400000, 110000, 1600], // Mizrahi Tefahot
      ];
      
      for (const config of sampleConfigs) {
        await client.query(`
          INSERT INTO bank_configurations 
          (bank_id, product_type, base_interest_rate, min_interest_rate, max_interest_rate, 
           max_ltv_ratio, min_credit_score, max_loan_amount, min_loan_amount, processing_fee) 
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `, config);
      }
      console.log('✅ Inserted 5 sample bank configurations into bankim_core');
    }

    // Insert global banking standards if none exist
    const standardsCount = await client.query('SELECT COUNT(*) FROM banking_standards');
    if (parseInt(standardsCount.rows[0].count) === 0) {
      const globalStandards = [
        ['mortgage', 'ltv', 'max_ltv_ratio', '50.01'],
        ['mortgage', 'credit', 'min_credit_score', '620'],
        ['mortgage', 'dti', 'max_front_dti', '33.00'],
        ['mortgage', 'dti', 'max_back_dti', '42.00'],
        ['mortgage', 'rate', 'base_interest_rate', '3.50'],
        ['mortgage', 'term', 'max_loan_term', '360'],
        ['mortgage', 'amount', 'min_loan_amount', '100000']
      ];
      
      for (const standard of globalStandards) {
        await client.query(`
          INSERT INTO banking_standards (business_path, standard_category, standard_name, standard_value) 
          VALUES ($1, $2, $3, $4)
        `, standard);
      }
      console.log('✅ Inserted global banking standards into bankim_core');
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
  // Calculator Formula Operations (existing)
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

  // Bank Operations (NEW)
  async getAllBanks() {
    const client = await corePool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM banks WHERE is_active = true ORDER BY priority ASC'
      );
      return result.rows;
    } finally {
      client.release();
    }
  },

  async getBankById(bankId) {
    const client = await corePool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM banks WHERE id = $1 AND is_active = true',
        [bankId]
      );
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  },

  // Bank Configuration Operations (NEW)
  async getAllBankConfigurations() {
    const client = await corePool.connect();
    try {
      const result = await client.query(`
        SELECT bc.*, b.name_en, b.name_he, b.name_ru 
        FROM bank_configurations bc
        JOIN banks b ON bc.bank_id = b.id
        WHERE bc.is_active = true AND b.is_active = true
        ORDER BY b.priority ASC
      `);
      return result.rows;
    } finally {
      client.release();
    }
  },

  // Bank-specific Configuration Operations
  async getBankConfiguration(bankId) {
    const client = await corePool.connect();
    try {
      const result = await client.query(`
        SELECT bc.*, b.name_en, b.name_he, b.name_ru
        FROM bank_configurations bc
        JOIN banks b ON bc.bank_id = b.id
        WHERE bc.bank_id = $1 AND bc.is_active = true
      `, [bankId]);
      
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  },

  async updateBankConfiguration(bankId, configData) {
    const client = await corePool.connect();
    try {
      const {
        baseInterestRate,
        minInterestRate,
        maxInterestRate,
        maxLtvRatio,
        minCreditScore,
        maxLoanAmount,
        minLoanAmount,
        processingFee
      } = configData;

      // Check if configuration exists
      const existing = await client.query(
        'SELECT id FROM bank_configurations WHERE bank_id = $1',
        [bankId]
      );

      if (existing.rows.length === 0) {
        throw new Error(`No configuration found for bank ID: ${bankId}`);
      }

      const result = await client.query(`
        UPDATE bank_configurations SET
          base_interest_rate = COALESCE($2, base_interest_rate),
          min_interest_rate = COALESCE($3, min_interest_rate),
          max_interest_rate = COALESCE($4, max_interest_rate),
          max_ltv_ratio = COALESCE($5, max_ltv_ratio),
          min_credit_score = COALESCE($6, min_credit_score),
          max_loan_amount = COALESCE($7, max_loan_amount),
          min_loan_amount = COALESCE($8, min_loan_amount),
          processing_fee = COALESCE($9, processing_fee),
          updated_at = CURRENT_TIMESTAMP
        WHERE bank_id = $1
        RETURNING *
      `, [
        bankId,
        baseInterestRate,
        minInterestRate,
        maxInterestRate,
        maxLtvRatio,
        minCreditScore,
        maxLoanAmount,
        minLoanAmount,
        processingFee
      ]);

      return result.rows[0];
    } finally {
      client.release();
    }
  },

  async createBankConfiguration(bankId, configData) {
    const client = await corePool.connect();
    try {
      const {
        baseInterestRate,
        minInterestRate,
        maxInterestRate,
        maxLtvRatio,
        minCreditScore,
        maxLoanAmount,
        minLoanAmount,
        processingFee
      } = configData;

      // Check if bank exists
      const bankExists = await client.query(
        'SELECT id FROM banks WHERE id = $1',
        [bankId]
      );

      if (bankExists.rows.length === 0) {
        throw new Error(`Bank with ID ${bankId} does not exist`);
      }

      // Check if configuration already exists
      const existing = await client.query(
        'SELECT id FROM bank_configurations WHERE bank_id = $1',
        [bankId]
      );

      if (existing.rows.length > 0) {
        throw new Error(`Configuration already exists for bank ID: ${bankId}`);
      }

      const result = await client.query(`
        INSERT INTO bank_configurations (
          bank_id, product_type, base_interest_rate, min_interest_rate,
          max_interest_rate, max_ltv_ratio, min_credit_score,
          max_loan_amount, min_loan_amount, processing_fee, is_active
        ) VALUES ($1, 'mortgage', $2, $3, $4, $5, $6, $7, $8, $9, true)
        RETURNING *
      `, [
        bankId,
        baseInterestRate,
        minInterestRate,
        maxInterestRate,
        maxLtvRatio,
        minCreditScore,
        maxLoanAmount,
        minLoanAmount,
        processingFee
      ]);

      return result.rows[0];
    } finally {
      client.release();
    }
  },

  // Banking Standards Operations (NEW)
  async getGlobalBankingStandards() {
    const client = await corePool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM banking_standards WHERE is_active = true'
      );
      
      // Convert to object format for easier access
      const standards = {};
      result.rows.forEach(row => {
        if (!standards[row.standard_category]) {
          standards[row.standard_category] = {};
        }
        standards[row.standard_category][row.standard_name] = row.standard_value;
      });
      
      return standards;
    } finally {
      client.release();
    }
  },

  // Customer Application Operations (NEW)
  async createCustomerApplication(applicationData) {
    const client = await corePool.connect();
    try {
      const {
        customerId, loanAmount, downPayment, propertyValue,
        monthlyIncome, monthlyExpenses, creditScore,
        employmentType, propertyOwnership
      } = applicationData;

      const result = await client.query(`
        INSERT INTO customer_applications (
          customer_id, loan_amount, down_payment, property_value,
          monthly_income, monthly_expenses, credit_score,
          employment_type, property_ownership
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `, [
        customerId, loanAmount, downPayment, propertyValue,
        monthlyIncome, monthlyExpenses, creditScore,
        employmentType, propertyOwnership
      ]);

      return result.rows[0];
    } finally {
      client.release();
    }
  },

  async getCustomerApplication(applicationId) {
    const client = await corePool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM customer_applications WHERE id = $1',
        [applicationId]
      );
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  },

  // Bank Offers Operations (NEW)
  async createBankOffer(offerData) {
    const client = await corePool.connect();
    try {
      const {
        applicationId, bankId, interestRate, monthlyPayment,
        totalPayment, loanTerm, approvalStatus, ltvRatio, dtiRatio
      } = offerData;

      const result = await client.query(`
        INSERT INTO bank_offers (
          application_id, bank_id, interest_rate, monthly_payment,
          total_payment, loan_term, approval_status, ltv_ratio, dti_ratio
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `, [
        applicationId, bankId, interestRate, monthlyPayment,
        totalPayment, loanTerm, approvalStatus, ltvRatio, dtiRatio
      ]);

      return result.rows[0];
    } finally {
      client.release();
    }
  },

  async getBankOffersByApplication(applicationId) {
    const client = await corePool.connect();
    try {
      const result = await client.query(`
        SELECT bo.*, b.name_en, b.name_he, b.name_ru
        FROM bank_offers bo
        JOIN banks b ON bo.bank_id = b.id
        WHERE bo.application_id = $1
        ORDER BY bo.interest_rate ASC
      `, [applicationId]);

      return result.rows;
    } finally {
      client.release();
    }
  },

  // Calculation Log Operations (NEW)
  async logCalculation(logData) {
    const client = await corePool.connect();
    try {
      const {
        applicationId, bankId, calculationStep,
        inputValues, outputValues, status
      } = logData;

      const result = await client.query(`
        INSERT INTO calculation_logs (
          application_id, bank_id, calculation_step,
          input_values, output_values, status
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `, [
        applicationId, bankId, calculationStep,
        JSON.stringify(inputValues), JSON.stringify(outputValues), status
      ]);

      return result.rows[0];
    } finally {
      client.release();
    }
  },

  // Bank-Specific Rate Calculation (NEW - Core Logic)
  async calculateBankSpecificRate(bankId, customerData, bankStandards) {
    try {
      // Base rate from bank configuration or global standards
      let baseRate = bankStandards.base_interest_rate || 3.50;

      // Customer-specific adjustments
      const creditScore = customerData.credit_score;
      let rateAdjustment = 0;

      // Credit score adjustments (as per document)
      if (creditScore >= 750) {
        rateAdjustment = -0.3; // Excellent credit: -0.3%
      } else if (creditScore >= 700) {
        rateAdjustment = -0.1; // Good credit: -0.1%
      } else if (creditScore >= 650) {
        rateAdjustment = 0.0;  // Fair credit: no change
      } else if (creditScore >= 600) {
        rateAdjustment = 0.2;  // Poor credit: +0.2%
      } else {
        rateAdjustment = 0.5;  // Bad credit: +0.5%
      }

      // Property ownership adjustments (Confluence Action #12)
      const propertyOwnership = customerData.property_ownership;
      if (propertyOwnership === '50_percent_financing') {
        rateAdjustment -= 0.1; // Lower LTV = better rate
      } else if (propertyOwnership === '75_percent_financing') {
        rateAdjustment += 0.1; // Higher LTV = higher rate
      }

      // Employment type adjustments
      const employmentType = customerData.employment_type;
      if (employmentType === 'permanent') {
        rateAdjustment -= 0.05;
      } else if (employmentType === 'contract') {
        rateAdjustment += 0.15;
      } else if (employmentType === 'self_employed') {
        rateAdjustment += 0.25;
      }

      const finalRate = baseRate + rateAdjustment;

      // Ensure rate is within bank's min/max bounds
      const minRate = bankStandards.min_interest_rate || 2.50;
      const maxRate = bankStandards.max_interest_rate || 5.00;

      return Math.max(minRate, Math.min(maxRate, finalRate));

    } catch (error) {
      console.error(`[CALC] Bank ${bankId}: Rate calculation failed - ${error.message}`);
      return null; // Return null instead of throwing to prevent TypeError
    }
  },

  // Get database info (updated)
  async getDbInfo() {
    const client = await corePool.connect();
    try {
      const formulaCount = await client.query('SELECT COUNT(*) FROM calculator_formula');
      const bankCount = await client.query('SELECT COUNT(*) FROM banks');
      const configCount = await client.query('SELECT COUNT(*) FROM bank_configurations');
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
        bankCount: parseInt(bankCount.rows[0].count),
        configCount: parseInt(configCount.rows[0].count),
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