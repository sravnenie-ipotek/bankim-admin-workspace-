/**
 * Calculator Formula Page - Director Admin Panel
 * Page 11: Формула калькулятора. Директор. Стр.11 . Действий 15
 * 
 * Business Logic:
 * - View and edit calculator formulas that determine mortgage/credit programs shown to clients
 * - 15 specific actions as per Confluence specification
 * - Support for view mode and edit mode with proper validation
 * - Multi-language content management support
 * - Numeric validation (numbers and dots only)
 * 
 * Features:
 * - Program Duration section (min/max terms)
 * - Financing section (percentage)
 * - Interest Rate section (multiple rate inputs)
 * - Edit mode with save/cancel functionality
 * - Responsive design (mobile/tablet support)
 */

import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout/AdminLayout';
import { apiService, type FormulaData } from '../services/api';
import './CalculatorFormula.css';



interface ValidationErrors {
  [key: string]: string;
}

const CalculatorFormula: React.FC = () => {
  // State management
  const [isEditMode, setIsEditMode] = useState(false);
  const [formulaData, setFormulaData] = useState<FormulaData>({
    minTerm: '12',
    maxTerm: '360',
    financingPercentage: '80',
    bankInterestRate: '3.5',
    baseInterestRate: '2.8',
    variableInterestRate: '1.2',
    interestChangePeriod: '12',
    inflationIndex: '2.1'
  });
  const [editData, setEditData] = useState<FormulaData>(formulaData);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  // Load formula data on mount
  useEffect(() => {
    loadFormulaData();
  }, []);

  const loadFormulaData = async () => {
    setIsLoading(true);
    try {
      const result = await apiService.getCalculatorFormula();
      
      if (result.success && result.data) {
        setFormulaData(result.data);
        setEditData(result.data);
      } else {
        console.error('Failed to load formula data:', result.error);
      }
    } catch (error) {
      console.error('Error loading formula data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Validation function for numeric inputs (numbers and dots only)
  const validateNumericInput = (value: string, fieldName: string): string | null => {
    if (!value.trim()) {
      return `Поле "${fieldName}" обязательно для заполнения`;
    }
    
    // Allow only numbers and dots
    const numericPattern = /^[0-9.]+$/;
    if (!numericPattern.test(value)) {
      return `Поле "${fieldName}" должно содержать только цифры и точки`;
    }
    
    // Check for valid decimal number
    if (isNaN(parseFloat(value))) {
      return `Поле "${fieldName}" должно содержать корректное числовое значение`;
    }
    
    return null;
  };

  // Validate all fields
  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};
    
    const fields = {
      minTerm: 'Минимальный срок',
      maxTerm: 'Максимальный срок',
      financingPercentage: 'Финансирование в процентах',
      bankInterestRate: 'Процент который дает банк',
      baseInterestRate: 'Процентная ставка',
      variableInterestRate: 'Меняющийся процент',
      interestChangePeriod: 'Период изменения процента',
      inflationIndex: 'Индекс инфляции'
    };

    Object.entries(fields).forEach(([key, label]) => {
      const error = validateNumericInput(editData[key as keyof FormulaData], label);
      if (error) {
        errors[key] = error;
      }
    });

    // Additional validation: min term should be less than max term
    if (parseFloat(editData.minTerm) >= parseFloat(editData.maxTerm)) {
      errors.maxTerm = 'Максимальный срок должен быть больше минимального';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle input changes in edit mode
  const handleInputChange = (field: keyof FormulaData, value: string) => {
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

  // Action 4: Edit formula button
  const handleEditClick = () => {
    setIsEditMode(true);
    setEditData(formulaData);
    setValidationErrors({});
  };

  // Save changes
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await apiService.updateCalculatorFormula(editData);
      
      if (result.success && result.data) {
        setFormulaData(result.data);
        setIsEditMode(false);
        console.log('Formula saved successfully:', result.data);
      } else {
        console.error('Failed to save formula:', result.error);
        // TODO: Show error message to user
      }
    } catch (error) {
      console.error('Error saving formula:', error);
      // TODO: Show error message to user
    } finally {
      setIsLoading(false);
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setIsEditMode(false);
    setEditData(formulaData);
    setValidationErrors({});
  };

  // Render input field
  const renderInputField = (
    field: keyof FormulaData,
    label: string,
    placeholder?: string
  ) => {
    const value = isEditMode ? editData[field] : formulaData[field];
    const hasError = validationErrors[field];

    return (
      <div className="formula-input-group">
        <label className="formula-label">{label}</label>
        {isEditMode ? (
          <div className="formula-input-wrapper">
            <input
              type="text"
              className={`formula-input ${hasError ? 'error' : ''}`}
              value={value}
              placeholder={placeholder}
              onChange={(e) => handleInputChange(field, e.target.value)}
              disabled={isLoading}
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

  return (
    <AdminLayout 
      title="Формула калькулятора" 
      activeMenuItem="calculator-formula"
    >
      <div className="calculator-formula-page">
        {/* Action 3: Page Title */}
        <div className="page-header">
          <h1 className="page-title">Формула калькулятора</h1>
          
          {/* Action 4: Edit Formula Button */}
          {!isEditMode && (
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
          )}
        </div>

        {isLoading && (
          <div className="loading-indicator">
            Загрузка...
          </div>
        )}

        <div className="formula-content">
          
          {/* Actions 5-7: Program Duration Section */}
          <div className="formula-section">
            {/* Action 5: Section Title */}
            <h2 className="section-title">Срок программы</h2>
            
            <div className="formula-row">
              {/* Action 6: Minimum Term */}
              {renderInputField('minTerm', 'Минимальный срок (месяцы)', '12')}
              
              {/* Action 7: Maximum Term */}
              {renderInputField('maxTerm', 'Максимальный срок (месяцы)', '360')}
            </div>
          </div>

          {/* Actions 8-9: Financing Section */}
          <div className="formula-section">
            {/* Action 8: Section Title */}
            <h2 className="section-title">Финансирование</h2>
            
            <div className="formula-row">
              {/* Action 9: Financing Percentage */}
              {renderInputField('financingPercentage', 'Финансирование в процентах (%)', '80')}
            </div>
          </div>

          {/* Actions 10-15: Interest Rate Section */}
          <div className="formula-section">
            {/* Action 10: Section Title */}
            <h2 className="section-title">Процент</h2>
            
            <div className="formula-grid">
              {/* Action 11: Bank Interest Rate */}
              {renderInputField('bankInterestRate', 'Процент который дает банк (%)', '3.5')}
              
              {/* Action 12: Base Interest Rate */}
              {renderInputField('baseInterestRate', 'Процентная ставка (%)', '2.8')}
              
              {/* Action 13: Variable Interest Rate */}
              {renderInputField('variableInterestRate', 'Меняющийся процент (%)', '1.2')}
              
              {/* Action 14: Interest Change Period */}
              {renderInputField('interestChangePeriod', 'Период изменения процента (месяцы)', '12')}
              
              {/* Action 15: Inflation Index */}
              {renderInputField('inflationIndex', 'Индекс инфляции (%)', '2.1')}
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
      </div>
    </AdminLayout>
  );
};

export default CalculatorFormula; 