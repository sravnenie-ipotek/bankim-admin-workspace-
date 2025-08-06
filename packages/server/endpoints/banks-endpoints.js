/**
 * Banks API Endpoints for Calculator Formula
 * LOCAL: Uses Railway database with proper banks and bank_configurations tables
 * PRODUCTION: Uses production database with same schema
 */

// Banks API endpoints for calculator formula - Railway for local, production DB for prod
const setupBanksEndpoints = (app, safeQuery) => {
  
  const isProduction = process.env.NODE_ENV === 'production';
  const dbType = isProduction ? 'Local PostgreSQL database' : 'Railway (Local Development)';
  console.log(`🏦 Setting up banks endpoints for ${dbType} database`);
  
  /**
   * GET /api/banks
   * DEVELOPMENT: Returns all active banks from Railway database
   * PRODUCTION: Returns all active banks from local PostgreSQL database (bankim_content)
   */
  app.get('/api/banks', async (req, res) => {
    try {
      console.log(`🏦 Banks endpoint called - fetching from ${dbType} database`);
      
      // Fetch banks from proper banks table (Railway local or Production database)
      const banksQuery = `
        SELECT 
          id,
          name_en,
          name_he,
          name_ru,
          code,
          is_active,
          created_at,
          updated_at
        FROM banks
        WHERE is_active = TRUE
        ORDER BY name_en
      `;
      
      const result = await safeQuery(banksQuery);
      console.log(`📊 Banks query returned ${result.rows.length} active banks`);
      
      if (result.rows.length > 0) {
        console.log(`📋 Sample bank:`, result.rows[0]);
      }
      
      res.json({
        success: true,
        data: result.rows
      });
      
    } catch (error) {
      console.error(`❌ Error fetching banks from ${dbType} database:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch banks from ${dbType} database`
      });
    }
  });

  /**
   * GET /api/banks/:bankId/configuration
   * DEVELOPMENT: Returns bank configuration from Railway database
   * PRODUCTION: Returns bank configuration from local PostgreSQL database (bankim_content)
   */
  app.get('/api/banks/:bankId/configuration', async (req, res) => {
    try {
      const { bankId } = req.params;
      console.log(`🏦 Bank configuration endpoint called for bank ID: ${bankId} (${dbType})`);
      
      // Fetch bank configuration from database (Railway local or Production)
      const configQuery = `
        SELECT 
          bc.id,
          bc.bank_id,
          bc.base_interest_rate,
          bc.min_interest_rate,
          bc.max_interest_rate,
          bc.max_ltv_ratio,
          bc.min_credit_score,
          bc.max_loan_amount,
          bc.min_loan_amount,
          bc.processing_fee,
          bc.created_at,
          bc.updated_at,
          b.name_en,
          b.name_he,
          b.name_ru,
          b.code
        FROM bank_configurations bc
        INNER JOIN banks b ON bc.bank_id = b.id
        WHERE bc.bank_id = $1 AND b.is_active = TRUE
      `;
      
      const result = await safeQuery(configQuery, [bankId]);
      
      if (result.rows.length === 0) {
        console.log(`⚠️ Bank configuration not found for bank ID: ${bankId}`);
        return res.status(404).json({
          success: false,
          error: `Bank configuration not found for bank ID: ${bankId}`
        });
      }
      
      const config = result.rows[0];
      console.log(`✅ Bank configuration found:`, {
        bank_id: config.bank_id,
        bank_name: config.name_ru,
        base_rate: config.base_interest_rate
      });
      
      res.json({
        success: true,
        data: config
      });
      
    } catch (error) {
      console.error(`❌ Error fetching bank configuration from ${dbType} database:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to fetch bank configuration from ${dbType} database`
      });
    }
  });

  /**
   * PUT /api/banks/:bankId/configuration
   * DEVELOPMENT: Updates bank configuration in Railway database
   * PRODUCTION: Updates bank configuration in local PostgreSQL database (bankim_content)
   */
  app.put('/api/banks/:bankId/configuration', async (req, res) => {
    try {
      const { bankId } = req.params;
      const configData = req.body;
      
      console.log(`💾 Updating bank configuration for bank ID: ${bankId} (${dbType})`);
      console.log(`📋 Configuration data:`, configData);
      
      // Validate required fields
      const requiredFields = [
        'base_interest_rate', 'min_interest_rate', 'max_interest_rate',
        'max_ltv_ratio', 'min_credit_score', 'max_loan_amount',
        'min_loan_amount', 'processing_fee'
      ];
      
      const missingFields = requiredFields.filter(field => !configData[field]);
      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          error: `Missing required fields: ${missingFields.join(', ')}`
        });
      }
      
      // Validate numeric fields
      const numericFields = [
        'base_interest_rate', 'min_interest_rate', 'max_interest_rate',
        'max_ltv_ratio', 'min_credit_score', 'max_loan_amount',
        'min_loan_amount', 'processing_fee'
      ];
      
      for (const field of numericFields) {
        const value = field === 'min_credit_score' ? 
          parseInt(configData[field]) : 
          parseFloat(configData[field]);
          
        if (isNaN(value)) {
          return res.status(400).json({
            success: false,
            error: `Invalid numeric value for field: ${field}`
          });
        }
      }
      
      // Check if bank exists
      const bankExistsQuery = `
        SELECT id, name_ru FROM banks WHERE id = $1 AND is_active = TRUE
      `;
      const bankResult = await safeQuery(bankExistsQuery, [bankId]);
      
      if (bankResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: `Bank with ID ${bankId} not found or inactive`
        });
      }
      
      // Update or insert bank configuration
      const updateQuery = `
        INSERT INTO bank_configurations (
          bank_id, base_interest_rate, min_interest_rate, max_interest_rate,
          max_ltv_ratio, min_credit_score, max_loan_amount, min_loan_amount, processing_fee
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (bank_id) DO UPDATE SET
          base_interest_rate = EXCLUDED.base_interest_rate,
          min_interest_rate = EXCLUDED.min_interest_rate,
          max_interest_rate = EXCLUDED.max_interest_rate,
          max_ltv_ratio = EXCLUDED.max_ltv_ratio,
          min_credit_score = EXCLUDED.min_credit_score,
          max_loan_amount = EXCLUDED.max_loan_amount,
          min_loan_amount = EXCLUDED.min_loan_amount,
          processing_fee = EXCLUDED.processing_fee,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `;
      
      const updateResult = await safeQuery(updateQuery, [
        bankId,
        configData.base_interest_rate,
        configData.min_interest_rate,
        configData.max_interest_rate,
        configData.max_ltv_ratio,
        configData.min_credit_score,
        configData.max_loan_amount,
        configData.min_loan_amount,
        configData.processing_fee
      ]);
      
      if (updateResult.rows.length === 0) {
        throw new Error('Failed to save bank configuration');
      }
      
      const savedConfig = updateResult.rows[0];
      console.log(`✅ Bank configuration saved successfully for ${bankResult.rows[0].name_ru}`);
      
      res.json({
        success: true,
        data: {
          ...savedConfig,
          bank_name_ru: bankResult.rows[0].name_ru
        }
      });
      
    } catch (error) {
      console.error(`❌ Error saving bank configuration to ${dbType} database:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to save bank configuration to ${dbType} database`
      });
    }
  });

  console.log(`✅ Banks endpoints configured for ${dbType} database`);
};

module.exports = setupBanksEndpoints;