import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { coreOperations, testCoreConnection, initializeCoreDatabase, closeCoreConnection } from './config/database-core.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize bankim_core database on startup
const initializeApp = async () => {
  try {
    await testCoreConnection();
    await initializeCoreDatabase();
    console.log('🚀 bankim_core database ready');
  } catch (error) {
    console.error('❌ Failed to initialize bankim_core database:', error);
    process.exit(1);
  }
};

initializeApp();

// Routes

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const dbInfo = await coreOperations.getDbInfo();
    res.json({ 
      status: 'ok', 
      message: 'BankIM Management Portal API is running',
      timestamp: new Date().toISOString(),
      database: 'bankim_core (PostgreSQL)',
      tables: dbInfo.tables
    });
  } catch (error) {
    res.json({ 
      status: 'error', 
      message: 'Database connection failed',
      error: error.message
    });
  }
});

// Database info endpoint
app.get('/api/db-info', async (req, res) => {
  try {
    const dbInfo = await coreOperations.getDbInfo();
    res.json({
      success: true,
      data: dbInfo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Calculator Formula Routes

// Get calculator formula
app.get('/api/calculator-formula', async (req, res) => {
  try {
    const formula = await coreOperations.getCalculatorFormula();
    
    if (!formula) {
      return res.status(404).json({
        success: false,
        error: 'Calculator formula not found'
      });
    }
    
    // Transform database field names to frontend field names
    const transformedFormula = {
      minTerm: formula.min_term,
      maxTerm: formula.max_term,
      financingPercentage: formula.financing_percentage,
      bankInterestRate: formula.bank_interest_rate,
      baseInterestRate: formula.base_interest_rate,
      variableInterestRate: formula.variable_interest_rate,
      interestChangePeriod: formula.interest_change_period,
      inflationIndex: formula.inflation_index,
      id: formula.id,
      createdAt: formula.created_at,
      updatedAt: formula.updated_at
    };
    
    res.json({
      success: true,
      data: transformedFormula
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update calculator formula
app.put('/api/calculator-formula', async (req, res) => {
  try {
    const {
      minTerm, maxTerm, financingPercentage, bankInterestRate,
      baseInterestRate, variableInterestRate, interestChangePeriod, inflationIndex
    } = req.body;
    
    // Validation
    if (!minTerm || !maxTerm || !financingPercentage || !bankInterestRate ||
        !baseInterestRate || !variableInterestRate || !interestChangePeriod || !inflationIndex) {
      return res.status(400).json({
        success: false,
        error: 'All formula fields are required'
      });
    }
    
    // Validate numeric inputs (numbers and dots only)
    const numericFields = {
      minTerm, maxTerm, financingPercentage, bankInterestRate,
      baseInterestRate, variableInterestRate, interestChangePeriod, inflationIndex
    };
    
    for (const [fieldName, value] of Object.entries(numericFields)) {
      const numericPattern = /^[0-9.]+$/;
      if (!numericPattern.test(value) || isNaN(parseFloat(value))) {
        return res.status(400).json({
          success: false,
          error: `Field ${fieldName} must be a valid number`
        });
      }
    }
    
    // Additional validation: min term should be less than max term
    if (parseFloat(minTerm) >= parseFloat(maxTerm)) {
      return res.status(400).json({
        success: false,
        error: 'Maximum term must be greater than minimum term'
      });
    }
    
    const updatedFormula = await coreOperations.updateCalculatorFormula({
      minTerm, maxTerm, financingPercentage, bankInterestRate,
      baseInterestRate, variableInterestRate, interestChangePeriod, inflationIndex
    });
    
    if (!updatedFormula) {
      return res.status(500).json({
        success: false,
        error: 'Failed to update calculator formula'
      });
    }
    
    // Transform for response
    const transformedFormula = {
      minTerm: updatedFormula.min_term,
      maxTerm: updatedFormula.max_term,
      financingPercentage: updatedFormula.financing_percentage,
      bankInterestRate: updatedFormula.bank_interest_rate,
      baseInterestRate: updatedFormula.base_interest_rate,
      variableInterestRate: updatedFormula.variable_interest_rate,
      interestChangePeriod: updatedFormula.interest_change_period,
      inflationIndex: updatedFormula.inflation_index,
      id: updatedFormula.id,
      createdAt: updatedFormula.created_at,
      updatedAt: updatedFormula.updated_at
    };
    
    res.json({
      success: true,
      data: transformedFormula,
      message: 'Calculator formula updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Handle 404 for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  await closeCoreConnection();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down server...');
  await closeCoreConnection();
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 BankIM Management Portal API Server Starting...');
  console.log(`📡 Server running on http://localhost:${PORT}`);
  console.log(`🔍 Health check: http://localhost:${PORT}/health`);
  console.log(`📊 Database info: http://localhost:${PORT}/api/db-info`);
  console.log(`🧮 Calculator Formula API: http://localhost:${PORT}/api/calculator-formula`);
  console.log('📋 Database: bankim_core (PostgreSQL)');
  console.log('=====================================');
}); 