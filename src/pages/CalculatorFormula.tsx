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
// import { apiService } from '../services/api'; // Unused in current implementation
import { useAuth } from '../contexts/AuthContext';
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

  // Load banks on mount
  useEffect(() => {
    loadBanks();
  }, []);

  // Load bank configuration when bank is selected
  useEffect(() => {
    if (selectedBankId) {
      loadBankConfiguration(selectedBankId);
    }
  }, [selectedBankId]);

  const loadBanks = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/banks');
      const result = await response.json();
      
      if (result.success && result.data) {
        setBanks(result.data);
        // Auto-select first bank if available
        if (result.data.length > 0) {
          setSelectedBankId(result.data[0].id);
        }
      } else {
        console.error('Failed to load banks:', result.error);
      }
    } catch (error) {
      console.error('Error loading banks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadBankConfiguration = async (bankId: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/banks/${bankId}/configuration`);
      const result = await response.json();
      
      if (result.success && result.data) {
        setBankConfiguration(result.data);
        setEditData(result.data);
      } else {
        // Bank doesn't have configuration yet
        setBankConfiguration(null);
        setEditData({
          bank_id: bankId,
          base_interest_rate: '3.500',
          min_interest_rate: '2.800',
          max_interest_rate: '4.500',
          max_ltv_ratio: '75.00',
          min_credit_score: 620,
          max_loan_amount: '2000000.00',
          min_loan_amount: '100000.00',
          processing_fee: '1500.00'
        });
      }
    } catch (error) {
      console.error('Error loading bank configuration:', error);
      setBankConfiguration(null);
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
      return `Поле "${fieldName}" обязательно для заполнения`;
    }
    
    // Allow only numbers and dots
    const numericPattern = /^[0-9.]+$/;
    if (!numericPattern.test(value.toString())) {
      return `Поле "${fieldName}" должно содержать только цифры и точки`;
    }
    
    // Check for valid decimal number
    if (isNaN(parseFloat(value.toString()))) {
      return `Поле "${fieldName}" должно содержать корректное числовое значение`;
    }
    
    return null;
  };

  // Validate all fields
  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};
    
    const fields = {
      base_interest_rate: 'Базовая процентная ставка',
      min_interest_rate: 'Минимальная ставка',
      max_interest_rate: 'Максимальная ставка',
      max_ltv_ratio: 'Максимальный LTV',
      min_credit_score: 'Минимальный кредитный рейтинг',
      max_loan_amount: 'Максимальная сумма кредита',
      min_loan_amount: 'Минимальная сумма кредита',
      processing_fee: 'Комиссия за обработку'
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
      errors.max_interest_rate = 'Максимальная ставка должна быть больше минимальной';
    }

    if (parseFloat(editData.min_loan_amount || '0') >= parseFloat(editData.max_loan_amount || '0')) {
      errors.max_loan_amount = 'Максимальная сумма должна быть больше минимальной';
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

  // Save changes
  const handleSave = async () => {
    if (!validateForm() || !selectedBankId) {
      return;
    }

    setIsLoading(true);
    try {
      const endpoint = bankConfiguration 
        ? `http://localhost:3001/api/banks/${selectedBankId}/configuration`
        : `http://localhost:3001/api/banks/${selectedBankId}/configuration`;
      
      const method = bankConfiguration ? 'PUT' : 'POST';
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          baseInterestRate: editData.base_interest_rate,
          minInterestRate: editData.min_interest_rate,
          maxInterestRate: editData.max_interest_rate,
          maxLtvRatio: editData.max_ltv_ratio,
          minCreditScore: editData.min_credit_score,
          maxLoanAmount: editData.max_loan_amount,
          minLoanAmount: editData.min_loan_amount,
          processingFee: editData.processing_fee
        })
      });

      const result = await response.json();
      
      if (result.success && result.data) {
        setBankConfiguration(result.data);
        setIsEditMode(false);
        console.log('Bank configuration saved successfully:', result.data);
      } else {
        console.error('Failed to save bank configuration:', result.error);
      }
    } catch (error) {
      console.error('Error saving bank configuration:', error);
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
    if (!selectedBankId) return 'Выберите банк';
    const bank = banks.find(b => b.id === selectedBankId);
    return bank ? bank.name_ru : 'Неизвестный банк';
  };

  // Helper function to get display names for roles
  const getRoleDisplayName = (role: string): string => {
    const roleNames: Record<string, string> = {
      'director': 'Директор',
      'administration': 'Администратор',
      'sales-manager': 'Менеджер по продажам',
      'content-manager': 'Контент-менеджер',
      'brokers': 'Брокер',
      'bank-employee': 'Сотрудник банка'
    };
    return roleNames[role] || role;
  };

  return (
    <AdminLayout 
      title="Формула калькулятора" 
      activeMenuItem="calculator-formula"
    >
      <div className="calculator-formula-page">
        {/* Action 3: Page Title */}
        <div className="page-header">
          <h1 className="page-title">Формула калькулятора</h1>
          
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
                  Редактировать формулу
                </button>
              ) : (
                <div className="permission-notice">
                  <span className="notice-icon">🔒</span>
                  <span className="notice-text">
                    Редактирование доступно только директорам
                  </span>
                  {user && (
                    <span className="current-role">
                      (Ваша роль: {getRoleDisplayName(user.role)})
                    </span>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {isLoading && (
          <div className="loading-indicator">
            Загрузка...
          </div>
        )}

        {/* Bank Selection Dropdown */}
        <div className="bank-selection-section">
          <h2 className="section-title">Выбор банка</h2>
          <div className="bank-selector">
            <label className="formula-label">Банк для настройки:</label>
            <select 
              className="bank-dropdown"
              value={selectedBankId || ''}
              onChange={(e) => handleBankSelection(parseInt(e.target.value))}
              disabled={isLoading || isEditMode}
            >
              <option value="">Выберите банк...</option>
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
              <h3>Настройки для банка: <strong>{getSelectedBankName()}</strong></h3>
              {!bankConfiguration && (
                <div className="no-config-notice">
                  ⚠️ У данного банка пока нет конфигурации. Будет создана новая при сохранении.
                </div>
              )}
            </div>

            {/* Interest Rate Section */}
            <div className="formula-section">
              <h2 className="section-title">Процентные ставки</h2>
              
              <div className="formula-grid">
                {renderInputField('base_interest_rate', 'Базовая процентная ставка (%)', '3.500')}
                {renderInputField('min_interest_rate', 'Минимальная ставка (%)', '2.800')}
                {renderInputField('max_interest_rate', 'Максимальная ставка (%)', '4.500')}
              </div>
            </div>

            {/* Loan Parameters Section */}
            <div className="formula-section">
              <h2 className="section-title">Параметры кредитования</h2>
              
              <div className="formula-grid">
                {renderInputField('max_ltv_ratio', 'Максимальный LTV (%)', '75.00')}
                {renderInputField('min_credit_score', 'Минимальный кредитный рейтинг', '620', true)}
                {renderInputField('processing_fee', 'Комиссия за обработку (₪)', '1500.00')}
              </div>
            </div>

            {/* Loan Amount Section */}
            <div className="formula-section">
              <h2 className="section-title">Лимиты по сумме кредита</h2>
              
              <div className="formula-row">
                {renderInputField('min_loan_amount', 'Минимальная сумма (₪)', '100000.00')}
                {renderInputField('max_loan_amount', 'Максимальная сумма (₪)', '2000000.00')}
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
                  Сохранить изменения
                </button>
                <button 
                  className="cancel-btn"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  Отменить
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