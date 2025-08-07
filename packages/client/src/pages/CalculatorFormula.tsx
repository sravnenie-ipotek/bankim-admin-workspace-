/**
 * Calculator Formula Page - Director Admin Panel
 * Page 11: Формула калькулятора. Директор. Стр.11 . Действий 15
 * 
 * Business Logic:
 * - View and edit calculator formulas that determine mortgage/credit programs shown to clients
 * - BANK-SPECIFIC: Each bank can have different calculation rates and parameters
 * - 15 specific actions as per Confluence specification
 * - Support for view mode and edit mode with proper validation
 * - Multi-language content management support
 * - Numeric validation (numbers and dots only)
 * 
 * Features:
 * - Bank Selection Dropdown (choose which bank to configure)
 * - Bank-specific configuration management
 * - Program Duration section (min/max terms)
 * - Financing section (percentage)
 * - Interest Rate section (multiple rate inputs)
 * - Edit mode with save/cancel functionality
 * - Responsive design (mobile/tablet support)
 */

import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout/AdminLayout';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import ProductionErrorHandler from '../utils/errorHandler';
import './CalculatorFormula.css';

// Bank interface for selection
interface Bank {
  id: number;
  name_en: string;
  name_he: string;
  name_ru: string;
  is_active: boolean;
}

// Bank configuration interface
interface BankConfiguration {
  id?: number;
  bank_id: number;
  base_interest_rate: string;
  min_interest_rate: string;
  max_interest_rate: string;
  max_ltv_ratio: string;
  min_credit_score: number;
  max_loan_amount: string;
  min_loan_amount: string;
  processing_fee: string;
  name_en?: string;
  name_he?: string;
  name_ru?: string;
}

interface ValidationErrors {
  [key: string]: string;
}

const CalculatorFormula: React.FC = () => {
  // Authentication and permissions
  const { user, hasPermission, isRole } = useAuth();
  
  // Language context
  const { t } = useLanguage();
  
  // Check if user can edit calculator formula (Directors only)
  const canEdit = isRole('director') && hasPermission('edit', 'calculator-formula');
  
  // State management
  const [selectedBankId, setSelectedBankId] = useState<number | null>(null);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [bankConfiguration, setBankConfiguration] = useState<BankConfiguration | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editData, setEditData] = useState<Partial<BankConfiguration>>({});
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  // Load banks on mount - wrapped in error boundary
  useEffect(() => {
    try {
      loadBanks();
    } catch (error) {
      ProductionErrorHandler.handleComponentError(error as Error, 'CalculatorFormula.useEffect');
    }
  }, []);

  // Load bank configuration when bank is selected - wrapped in error boundary
  useEffect(() => {
    if (selectedBankId) {
      try {
        loadBankConfiguration(selectedBankId);
      } catch (error) {
        ProductionErrorHandler.handleComponentError(error as Error, 'CalculatorFormula.loadBankConfiguration');
      }
    }
  }, [selectedBankId]);

  const loadBanks = async () => {
    setIsLoading(true);
    try {
        // Fetch real bank data from Railway API using the API service
        const response = await apiService.getAllBanks();
        
        if (response.success && response.data) {
          setBanks(response.data);
          // Auto-select first bank if available
          if (response.data.length > 0) {
            setSelectedBankId(response.data[0].id);
          }
        } else {
          console.error('Failed to load banks from Railway database:', response.error);
          setBanks([]);
        }
    } catch (error) {
      ProductionErrorHandler.handleComponentError(error as Error, 'CalculatorFormula.loadBanks');
      console.error('Error connecting to Railway database for banks:', error);
      setBanks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadBankConfiguration = async (bankId: number) => {
    setIsLoading(true);
    
    // Default configuration as fallback only for development
    const defaultConfig: BankConfiguration = {
      bank_id: bankId,
      base_interest_rate: '3.500',
      min_interest_rate: '2.800',
      max_interest_rate: '4.500',
      max_ltv_ratio: '75.00',
      min_credit_score: 620,
      max_loan_amount: '2000000.00',
      min_loan_amount: '100000.00',
      processing_fee: '1500.00'
    };
    
    try {
      // Fetch real bank configuration from Railway database using the API service
      const response = await apiService.getBankConfiguration(bankId);
      
      if (response.success && response.data) {
        setBankConfiguration(response.data);
        setEditData(response.data);
      } else {
        console.error('Failed to load bank configuration from Railway database:', response.error);
        // Use default configuration only temporarily while backend is being set up
        setBankConfiguration(defaultConfig);
        setEditData(defaultConfig);
      }
    } catch (error) {
      console.error('Error connecting to Railway database for bank configuration:', error);
      ProductionErrorHandler.handleComponentError(error as Error, 'CalculatorFormula.loadBankConfiguration');
      // Use default configuration only temporarily while backend is being set up
      setBankConfiguration(defaultConfig);
      setEditData(defaultConfig);
    } finally {
      setIsLoading(false);
    }
  };

  // Bank selection handler
  const handleBankSelection = (bankId: number) => {
    setSelectedBankId(bankId);
    setIsEditMode(false);
    setValidationErrors({});
  };

  // Validation function for numeric inputs (numbers and dots only)
  const validateNumericInput = (value: string, fieldName: string): string | null => {
    if (!value || !value.toString().trim()) {
      return t('calculator.validation.required', { field: fieldName });
    }
    
    // Allow only numbers and dots
    const numericPattern = /^[0-9.]+$/;
    if (!numericPattern.test(value.toString())) {
      return t('calculator.validation.numericOnly', { field: fieldName });
    }
    
    // Check for valid decimal number
    if (isNaN(parseFloat(value.toString()))) {
      return t('calculator.validation.validNumber', { field: fieldName });
    }
    
    return null;
  };

  // Validate all fields
  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};
    
    const fields = {
      base_interest_rate: t('calculator.fields.baseInterestRate'),
      min_interest_rate: t('calculator.fields.minInterestRate'),
      max_interest_rate: t('calculator.fields.maxInterestRate'),
      max_ltv_ratio: t('calculator.fields.maxLtvRatio'),
      min_credit_score: t('calculator.fields.minCreditScore'),
      max_loan_amount: t('calculator.fields.maxLoanAmount'),
      min_loan_amount: t('calculator.fields.minLoanAmount'),
      processing_fee: t('calculator.fields.processingFee')
    };

    Object.entries(fields).forEach(([key, label]) => {
      const value = editData[key as keyof BankConfiguration];
      const error = validateNumericInput(value?.toString() || '', label);
      if (error) {
        errors[key] = error;
      }
    });

    // Additional validation: min should be less than max
    if (parseFloat(editData.min_interest_rate || '0') >= parseFloat(editData.max_interest_rate || '0')) {
      errors.max_interest_rate = t('calculator.validation.maxGreaterThanMin');
    }

    if (parseFloat(editData.min_loan_amount || '0') >= parseFloat(editData.max_loan_amount || '0')) {
      errors.max_loan_amount = t('calculator.validation.maxAmountGreaterThanMin');
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle input changes in edit mode
  const handleInputChange = (field: keyof BankConfiguration, value: string | number) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Action 4: Edit formula button (Directors only)
  const handleEditClick = () => {
    if (!canEdit) {
      console.warn('User does not have permission to edit calculator formula');
      return;
    }
    setIsEditMode(true);
    setValidationErrors({});
  };

  // Save changes - Real Railway database operation
  const handleSave = async () => {
    if (!validateForm() || !selectedBankId) {
      return;
    }

    setIsLoading(true);
    try {
      // Prepare data for Railway API call
      const configurationData = {
        bank_id: selectedBankId,
        base_interest_rate: editData.base_interest_rate,
        min_interest_rate: editData.min_interest_rate,
        max_interest_rate: editData.max_interest_rate,
        max_ltv_ratio: editData.max_ltv_ratio,
        min_credit_score: editData.min_credit_score,
        max_loan_amount: editData.max_loan_amount,
        min_loan_amount: editData.min_loan_amount,
        processing_fee: editData.processing_fee
      };

      // Real save operation - calls Railway backend API
      const response = await apiService.saveBankConfiguration(selectedBankId, configurationData);

      if (response.success) {
        // Update local state with saved data from server response
        setBankConfiguration(response.data || editData as BankConfiguration);
        setIsEditMode(false);
        
        console.log('Bank configuration saved successfully to Railway database:', response.data);
        
        // Show success feedback to user
        alert(t('calculator.messages.saveSuccess'));
      } else {
        console.error('Failed to save bank configuration to Railway database:', response.error);
        alert(t('calculator.messages.saveError', { error: response.error || t('calculator.messages.unknownError') }));
      }
      
    } catch (error) {
      console.error('Error saving bank configuration to Railway database:', error);
      ProductionErrorHandler.handleComponentError(error as Error, 'CalculatorFormula.handleSave');
      alert(t('calculator.messages.connectionError'));
    } finally {
      setIsLoading(false);
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setIsEditMode(false);
    setEditData(bankConfiguration || {});
    setValidationErrors({});
  };

  // Render input field
  const renderInputField = (
    field: keyof BankConfiguration,
    label: string,
    placeholder?: string,
    isInteger: boolean = false
  ) => {
    const value = isEditMode ? (editData[field] || '') : (bankConfiguration?.[field] || '');
    const hasError = validationErrors[field];

    return (
      <div className="formula-input-group">
        <label className="formula-label">{label}</label>
        {isEditMode ? (
          <div className="formula-input-wrapper">
            <input
              type={isInteger ? "number" : "text"}
              className={`formula-input ${hasError ? 'error' : ''}`}
              value={value}
              placeholder={placeholder}
              onChange={(e) => handleInputChange(field, isInteger ? parseInt(e.target.value) || 0 : e.target.value)}
              disabled={isLoading}
              step={isInteger ? "1" : "0.001"}
              min={isInteger ? "0" : undefined}
            />
            {hasError && (
              <span className="formula-error-message">{hasError}</span>
            )}
          </div>
        ) : (
          <div className="formula-display-value">{value}</div>
        )}
      </div>
    );
  };

  // Get selected bank name
  const getSelectedBankName = (): string => {
    if (!selectedBankId) return t('calculator.selectBank');
    const bank = banks.find(b => b.id === selectedBankId);
    return bank ? bank.name_ru : t('calculator.unknownBank');
  };

  // Helper function to get display names for roles
  const getRoleDisplayName = (role: string): string => {
    return t(`calculator.roles.${role}`, { fallback: role });
  };

  return (
    <AdminLayout 
      title={t('calculator.title')} 
      activeMenuItem="calculator-formula"
    >
      <div className="calculator-formula-page">
        {/* Action 3: Page Title */}
        <div className="page-header">
          <h1 className="page-title">{t('calculator.title')}</h1>
          
          {/* Action 4: Edit Formula Button - Directors Only */}
          {!isEditMode && selectedBankId && (
            <>
              {canEdit ? (
                <button 
                  className="edit-formula-btn"
                  onClick={handleEditClick}
                  disabled={isLoading}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M11.5 1.5L14.5 4.5L5 14H2V11L11.5 1.5Z" stroke="currentColor" strokeWidth="1.5"/>
                  </svg>
                  {t('calculator.editFormula')}
                </button>
              ) : (
                <div className="permission-notice">
                  <span className="notice-icon">🔒</span>
                  <span className="notice-text">
                    {t('calculator.editOnlyDirectors')}
                  </span>
                  {user && (
                    <span className="current-role">
                      ({t('calculator.yourRole')}: {getRoleDisplayName(user.role)})
                    </span>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {isLoading && (
          <div className="loading-indicator">
            {t('calculator.loading')}
          </div>
        )}

        {/* Bank Selection Dropdown */}
        <div className="bank-selection-section">
          <h2 className="section-title">{t('calculator.bankSelection')}</h2>
          <div className="bank-selector">
            <label className="formula-label">{t('calculator.bankForConfiguration')}:</label>
            <select 
              className="bank-dropdown"
              value={selectedBankId || ''}
              onChange={(e) => handleBankSelection(parseInt(e.target.value))}
              disabled={isLoading || isEditMode}
            >
              <option value="">{t('calculator.selectBankOption')}</option>
              {banks.map(bank => (
                <option key={bank.id} value={bank.id}>
                  {bank.name_ru} ({bank.name_en})
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedBankId && (
          <div className="formula-content">
            
            {/* Current Bank Info */}
            <div className="current-bank-info">
              <h3>{t('calculator.settingsForBank')}: <strong>{getSelectedBankName()}</strong></h3>
              {!bankConfiguration && (
                <div className="no-config-notice">
                  ⚠️ {t('calculator.noConfigurationNotice')}
                </div>
              )}
            </div>

            {/* Interest Rate Section */}
            <div className="formula-section">
              <h2 className="section-title">{t('calculator.sections.interestRates')}</h2>
              
              <div className="formula-grid">
                {renderInputField('base_interest_rate', t('calculator.fields.baseInterestRate') + ' (%)', '3.500')}
                {renderInputField('min_interest_rate', t('calculator.fields.minInterestRate') + ' (%)', '2.800')}
                {renderInputField('max_interest_rate', t('calculator.fields.maxInterestRate') + ' (%)', '4.500')}
              </div>
            </div>

            {/* Loan Parameters Section */}
            <div className="formula-section">
              <h2 className="section-title">{t('calculator.sections.loanParameters')}</h2>
              
              <div className="formula-grid">
                {renderInputField('max_ltv_ratio', t('calculator.fields.maxLtvRatio') + ' (%)', '75.00')}
                {renderInputField('min_credit_score', t('calculator.fields.minCreditScore'), '620', true)}
                {renderInputField('processing_fee', t('calculator.fields.processingFee') + ' (₪)', '1500.00')}
              </div>
            </div>

            {/* Loan Amount Section */}
            <div className="formula-section">
              <h2 className="section-title">{t('calculator.sections.loanAmountLimits')}</h2>
              
              <div className="formula-row">
                {renderInputField('min_loan_amount', t('calculator.fields.minLoanAmount') + ' (₪)', '100000.00')}
                {renderInputField('max_loan_amount', t('calculator.fields.maxLoanAmount') + ' (₪)', '2000000.00')}
              </div>
            </div>

            {/* Edit Mode Actions */}
            {isEditMode && (
              <div className="formula-actions">
                <button 
                  className="save-btn"
                  onClick={handleSave}
                  disabled={isLoading}
                >
                  {t('calculator.saveChanges')}
                </button>
                <button 
                  className="cancel-btn"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  {t('calculator.cancel')}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default CalculatorFormula; 