import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { coreOperations, testCoreConnection, initializeCoreDatabase, closeCoreConnection } from './config/database-core.js';
import { contentOperations, testContentConnection, initializeContentDatabase } from './config/database-content.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize databases on startup
const initializeApp = async () => {
  try {
    await testCoreConnection();
    await initializeCoreDatabase();
    console.log('🚀 bankim_core database ready');
    
    await testContentConnection();
    await initializeContentDatabase();
    console.log('🚀 bankim_content database ready');
  } catch (error) {
    console.error('❌ Failed to initialize databases:', error);
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

// Bank-Specific Calculation Routes (NEW)

// Get all active banks
app.get('/api/banks', async (req, res) => {
  try {
    const banks = await coreOperations.getAllBanks();
    
    res.json({
      success: true,
      data: banks,
      count: banks.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get specific bank by ID
app.get('/api/banks/:id', async (req, res) => {
  try {
    const bankId = parseInt(req.params.id);
    const bank = await coreOperations.getBankById(bankId);
    
    if (!bank) {
      return res.status(404).json({
        success: false,
        error: 'Bank not found'
      });
    }
    
    res.json({
      success: true,
      data: bank
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get all bank configurations
app.get('/api/bank-configurations', async (req, res) => {
  try {
    const configurations = await coreOperations.getAllBankConfigurations();
    
    res.json({
      success: true,
      data: configurations,
      count: configurations.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get bank configuration by bank ID
app.get('/api/banks/:id/configuration', async (req, res) => {
  try {
    const bankId = parseInt(req.params.id);
    const configuration = await coreOperations.getBankConfiguration(bankId);
    
    if (!configuration) {
      return res.status(404).json({
        success: false,
        error: 'Bank configuration not found'
      });
    }
    
    res.json({
      success: true,
      data: configuration
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Bank-specific Configuration Routes

// Get specific bank configuration
app.get('/api/banks/:bankId/configuration', async (req, res) => {
  try {
    const { bankId } = req.params;
    const config = await coreOperations.getBankConfiguration(bankId);
    
    if (!config) {
      return res.status(404).json({
        success: false,
        error: `Configuration not found for bank ID: ${bankId}`
      });
    }
    
    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('Error fetching bank configuration:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch bank configuration'
    });
  }
});

// Update specific bank configuration
app.put('/api/banks/:bankId/configuration', async (req, res) => {
  try {
    const { bankId } = req.params;
    const {
      baseInterestRate,
      minInterestRate,
      maxInterestRate,
      maxLtvRatio,
      minCreditScore,
      maxLoanAmount,
      minLoanAmount,
      processingFee
    } = req.body;

    // Validate required fields
    if (!baseInterestRate) {
      return res.status(400).json({
        success: false,
        error: 'Base interest rate is required'
      });
    }

    const updatedConfig = await coreOperations.updateBankConfiguration(bankId, {
      baseInterestRate,
      minInterestRate,
      maxInterestRate,
      maxLtvRatio,
      minCreditScore,
      maxLoanAmount,
      minLoanAmount,
      processingFee
    });

    console.log(`✅ Updated configuration for bank ID: ${bankId}`);
    
    res.json({
      success: true,
      data: updatedConfig,
      message: `Bank configuration updated successfully`
    });
  } catch (error) {
    console.error('Error updating bank configuration:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update bank configuration'
    });
  }
});

// Create configuration for bank without one
app.post('/api/banks/:bankId/configuration', async (req, res) => {
  try {
    const { bankId } = req.params;
    const {
      baseInterestRate,
      minInterestRate = '2.800',
      maxInterestRate = '4.500',
      maxLtvRatio = '75.00',
      minCreditScore = 620,
      maxLoanAmount = '2000000.00',
      minLoanAmount = '100000.00',
      processingFee = '1500.00'
    } = req.body;

    // Validate required fields
    if (!baseInterestRate) {
      return res.status(400).json({
        success: false,
        error: 'Base interest rate is required'
      });
    }

    const newConfig = await coreOperations.createBankConfiguration(bankId, {
      baseInterestRate,
      minInterestRate,
      maxInterestRate,
      maxLtvRatio,
      minCreditScore,
      maxLoanAmount,
      minLoanAmount,
      processingFee
    });

    console.log(`✅ Created configuration for bank ID: ${bankId}`);
    
    res.json({
      success: true,
      data: newConfig,
      message: `Bank configuration created successfully`
    });
  } catch (error) {
    console.error('Error creating bank configuration:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create bank configuration'
    });
  }
});

// Get global banking standards
app.get('/api/banking-standards', async (req, res) => {
  try {
    const standards = await coreOperations.getGlobalBankingStandards();
    
    res.json({
      success: true,
      data: standards
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create customer application and calculate bank offers
app.post('/api/calculate-offers', async (req, res) => {
  try {
    const {
      customerId, loanAmount, downPayment, propertyValue,
      monthlyIncome, monthlyExpenses, creditScore,
      employmentType, propertyOwnership
    } = req.body;

    // Validation
    if (!loanAmount || !downPayment || !propertyValue || !monthlyIncome ||
        !monthlyExpenses || !creditScore || !employmentType || !propertyOwnership) {
      return res.status(400).json({
        success: false,
        error: 'All customer application fields are required'
      });
    }

    // Create customer application
    const application = await coreOperations.createCustomerApplication({
      customerId, loanAmount, downPayment, propertyValue,
      monthlyIncome, monthlyExpenses, creditScore,
      employmentType, propertyOwnership
    });

    // Get all active banks
    const banks = await coreOperations.getAllBanks();
    
    // Get global standards for fallback
    const globalStandards = await coreOperations.getGlobalBankingStandards();

    const offers = [];
    const logs = [];

    // Calculate offers for each bank
    for (const bank of banks) {
      try {
        // Get bank-specific configuration or use global standards
        const bankConfig = await coreOperations.getBankConfiguration(bank.id);
        
        let bankStandards;
        if (bankConfig) {
          // Use Tier 2: Bank-specific parameters
          bankStandards = {
            base_interest_rate: parseFloat(bankConfig.base_interest_rate),
            min_interest_rate: parseFloat(bankConfig.min_interest_rate),
            max_interest_rate: parseFloat(bankConfig.max_interest_rate),
            max_ltv_ratio: parseFloat(bankConfig.max_ltv_ratio),
            min_credit_score: bankConfig.min_credit_score
          };
        } else {
          // Use Tier 1: Global standards fallback
          bankStandards = {
            base_interest_rate: parseFloat(globalStandards.rate?.base_interest_rate || 3.50),
            min_interest_rate: 2.50,
            max_interest_rate: 5.00,
            max_ltv_ratio: parseFloat(globalStandards.ltv?.max_ltv_ratio || 50.01),
            min_credit_score: parseInt(globalStandards.credit?.min_credit_score || 620)
          };
        }

        // Calculate bank-specific rate
        const bankSpecificRate = await coreOperations.calculateBankSpecificRate(
          bank.id, 
          application, 
          bankStandards
        );

        if (bankSpecificRate !== null) {
          // Calculate LTV and DTI ratios
          const ltvRatio = (loanAmount / propertyValue) * 100;
          const monthlyPaymentEstimate = (loanAmount * bankSpecificRate / 100) / 12; // Simplified
          const dtiRatio = (monthlyPaymentEstimate / monthlyIncome) * 100;

          // Check eligibility
          const isEligible = 
            creditScore >= bankStandards.min_credit_score &&
            ltvRatio <= bankStandards.max_ltv_ratio &&
            dtiRatio <= 45; // Standard DTI limit

          if (isEligible) {
            // Create bank offer
            const offerData = {
              applicationId: application.id,
              bankId: bank.id,
              interestRate: bankSpecificRate,
              monthlyPayment: monthlyPaymentEstimate,
              totalPayment: monthlyPaymentEstimate * 360, // 30 years
              loanTerm: 360,
              approvalStatus: 'approved',
              ltvRatio: ltvRatio,
              dtiRatio: dtiRatio
            };

            const offer = await coreOperations.createBankOffer(offerData);
            offers.push({
              ...offer,
              bank_name_en: bank.name_en,
              bank_name_he: bank.name_he,
              bank_name_ru: bank.name_ru
            });

            // Log successful calculation
            await coreOperations.logCalculation({
              applicationId: application.id,
              bankId: bank.id,
              calculationStep: 'rate_calculation',
              inputValues: { customerData: application, bankStandards },
              outputValues: { rate: bankSpecificRate, ltv: ltvRatio, dti: dtiRatio },
              status: 'success'
            });

            console.log(`[CALC] Bank ${bank.id} (${bank.name_en}): SUCCESS - Rate: ${bankSpecificRate.toFixed(3)}%`);
          } else {
            // Log rejection
            await coreOperations.logCalculation({
              applicationId: application.id,
              bankId: bank.id,
              calculationStep: 'eligibility_check',
              inputValues: { creditScore, ltvRatio, dtiRatio },
              outputValues: { eligible: false, reason: 'Failed eligibility criteria' },
              status: 'rejected'
            });

            console.log(`[CALC] Bank ${bank.id} (${bank.name_en}): REJECTED - LTV: ${ltvRatio.toFixed(2)}%, DTI: ${dtiRatio.toFixed(2)}%`);
          }
        } else {
          // Log calculation failure
          await coreOperations.logCalculation({
            applicationId: application.id,
            bankId: bank.id,
            calculationStep: 'rate_calculation',
            inputValues: { customerData: application, bankStandards },
            outputValues: { error: 'Rate calculation returned null' },
            status: 'error'
          });

          console.error(`[CALC] Bank ${bank.id} (${bank.name_en}): FAILED - Rate calculation returned null`);
        }

      } catch (error) {
        // Log error
        await coreOperations.logCalculation({
          applicationId: application.id,
          bankId: bank.id,
          calculationStep: 'general_error',
          inputValues: { error: error.message },
          outputValues: {},
          status: 'error'
        });

        console.error(`[CALC] Bank ${bank.id} (${bank.name_en}): ERROR - ${error.message}`);
      }
    }

    // Sort offers by interest rate (best first)
    offers.sort((a, b) => a.interest_rate - b.interest_rate);

    res.json({
      success: true,
      data: {
        application: application,
        offers: offers,
        summary: {
          totalBanks: banks.length,
          offersReceived: offers.length,
          bestRate: offers.length > 0 ? offers[0].interest_rate : null,
          averageRate: offers.length > 0 ? (offers.reduce((sum, offer) => sum + offer.interest_rate, 0) / offers.length) : null
        }
      },
      message: `Calculated offers from ${offers.length} out of ${banks.length} banks`
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get offers for specific application
app.get('/api/applications/:id/offers', async (req, res) => {
  try {
    const applicationId = parseInt(req.params.id);
    const offers = await coreOperations.getBankOffersByApplication(applicationId);
    
    res.json({
      success: true,
      data: offers,
      count: offers.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Content Management Routes

// Get all content items with translations
app.get('/api/content-items', async (req, res) => {
  try {
    const contentItems = await contentOperations.getAllContentItems();
    
    res.json({
      success: true,
      data: contentItems,
      count: contentItems.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get specific content item by ID
app.get('/api/content-items/:id', async (req, res) => {
  try {
    const contentItemId = req.params.id;
    const contentItem = await contentOperations.getContentItemById(contentItemId);
    
    if (!contentItem) {
      return res.status(404).json({
        success: false,
        error: 'Content item not found'
      });
    }
    
    res.json({
      success: true,
      data: contentItem
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update content translation
app.put('/api/content-items/:id/translations/:languageCode', async (req, res) => {
  try {
    const { id: contentItemId, languageCode } = req.params;
    const { content_value } = req.body;
    
    if (!content_value) {
      return res.status(400).json({
        success: false,
        error: 'Content value is required'
      });
    }
    
    const updatedTranslation = await contentOperations.updateContentTranslation(
      contentItemId, 
      languageCode, 
      content_value
    );
    
    if (!updatedTranslation) {
      return res.status(500).json({
        success: false,
        error: 'Failed to update content translation'
      });
    }
    
    res.json({
      success: true,
      data: updatedTranslation,
      message: 'Content translation updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get all content categories
app.get('/api/content-categories', async (req, res) => {
  try {
    const categories = await contentOperations.getContentCategories();
    
    res.json({
      success: true,
      data: categories,
      count: categories.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get all languages
app.get('/api/languages', async (req, res) => {
  try {
    const languages = await contentOperations.getLanguages();
    
    res.json({
      success: true,
      data: languages,
      count: languages.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create new content item
app.post('/api/content-items', async (req, res) => {
  try {
    const contentData = req.body;
    
    // Validation
    if (!contentData.content_key || !contentData.content_type) {
      return res.status(400).json({
        success: false,
        error: 'Content key and content type are required'
      });
    }
    
    const newContentItem = await contentOperations.createContentItem(contentData);
    
    if (!newContentItem) {
      return res.status(500).json({
        success: false,
        error: 'Failed to create content item'
      });
    }
    
    res.status(201).json({
      success: true,
      data: newContentItem,
      message: 'Content item created successfully'
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