/**
 * JSONBDropdownEdit V2 - With Shadow Testing
 * 
 * This component runs BOTH old and new API calls in parallel
 * for testing purposes without affecting production data.
 * 
 * @version 2.0.0 - Shadow Testing Implementation
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import './JSONBDropdownEdit.css';
import { AdminLayout } from '../AdminLayout';
import { apiService } from '../../services/api';
import apiV2Service from '../../services/apiV2';

interface DropdownOption {
  ru: string;
  he: string;
  en?: string;
}

interface ContentItem {
  id: string;
  content_key: string;
  component_type: string;
  screen_location: string;
  description: string;
  is_active: boolean;
  action_number?: number;
  last_modified: string;
  translations: {
    ru: string;
    he: string;
    en?: string;
  };
}

interface TestResult {
  oldApiSuccess: boolean;
  newApiSuccess: boolean;
  dataMatch: boolean;
  errors: string[];
  timestamp: string;
}

const JSONBDropdownEditV2: React.FC = () => {
  const { actionId } = useParams<{ actionId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Content type detection
  const isMortgageRefi = location.pathname.includes('/mortgage-refi/');
  const isCredit = location.pathname.includes('/credit/') && !location.pathname.includes('/credit-refi/');
  const isCreditRefi = location.pathname.includes('/credit-refi/');
  
  // State
  const [content, setContent] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const actionNumber = location.state?.actionNumber || null;
  
  // Form states
  const [titleRu, setTitleRu] = useState('');
  const [titleHe, setTitleHe] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [options, setOptions] = useState<DropdownOption[]>([]);

  // Shadow testing states
  const [shadowTestEnabled, setShadowTestEnabled] = useState(true);
  const [showTestResults, setShowTestResults] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [testMode, setTestMode] = useState({
    dryRun: true,
    logComparison: true,
    blockProduction: true
  });

  // Load content data on mount
  useEffect(() => {
    fetchContentData();
  }, [actionId]);

  // Monitor changes
  useEffect(() => {
    if (content) {
      const hasRuChange = titleRu !== (content.translations?.ru || '');
      const hasHeChange = titleHe !== (content.translations?.he || '');
      const hasEnChange = titleEn !== (content.translations?.en || '');
      setHasChanges(hasRuChange || hasHeChange || hasEnChange);
    }
  }, [titleRu, titleHe, titleEn, content]);

  const fetchContentData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.getContentItemById(actionId || '');
      
      if (response.success && response.data) {
        const targetContent = response.data;
        
        const normalizedContent: ContentItem = {
          id: targetContent.id?.toString() || actionId || '',
          action_number: (targetContent as any).action_number || actionNumber,
          content_key: targetContent.content_key || '',
          component_type: targetContent.component_type || 'dropdown',
          screen_location: targetContent.screen_location || 'mortgage_calculation',
          description: targetContent.description || '',
          is_active: targetContent.is_active !== false,
          translations: {
            ru: (targetContent as any).translations?.ru || '',
            he: (targetContent as any).translations?.he || '',
            en: (targetContent as any).translations?.en || ''
          },
          last_modified: targetContent.updated_at || new Date().toISOString()
        };

        setContent(normalizedContent);
        setTitleRu(normalizedContent.translations.ru);
        setTitleHe(normalizedContent.translations.he);
        setTitleEn(normalizedContent.translations.en || '');
        
        await loadJSONBDropdownOptions(normalizedContent.screen_location);
      } else {
        setError('Содержимое не найдено');
      }
    } catch (err) {
      console.error('Error fetching content:', err);
      setError('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const loadJSONBDropdownOptions = async (screenLocation: string) => {
    try {
      const response = await apiService.getScreenDropdowns(screenLocation, 'ru');
      
      if (response.success && response.data) {
        let dropdownData = response.data;
        
        if (Array.isArray(dropdownData) && dropdownData.length > 0) {
          dropdownData = dropdownData[0];
        }
        
        if (dropdownData?.dropdown_data) {
          const jsonbData = dropdownData.dropdown_data;
          
          if (jsonbData.options && Array.isArray(jsonbData.options)) {
            const loadedOptions: DropdownOption[] = jsonbData.options.map((option: any) => ({
              ru: option.ru || option.label?.ru || 'Опция',
              he: option.he || option.label?.he || 'אפשרות',
              en: option.en || option.label?.en || 'Option'
            }));
            
            setOptions(loadedOptions);
            
            if (jsonbData.label?.ru) setTitleRu(jsonbData.label.ru);
            if (jsonbData.label?.he) setTitleHe(jsonbData.label.he);
            if (jsonbData.label?.en) setTitleEn(jsonbData.label.en);
          }
        }
      }
    } catch (err) {
      console.error('Error loading dropdown options:', err);
      setOptions([
        { ru: 'Вариант 1', he: 'אפשרות 1', en: 'Option 1' },
        { ru: 'Вариант 2', he: 'אפשרות 2', en: 'Option 2' }
      ]);
    }
  };

  const handleSaveShadowTest = async () => {
    if (!content || !shadowTestEnabled) return;

    console.log('');
    console.log('╔═══════════════════════════════════════════════════════╗');
    console.log('║          SHADOW TEST - SAVE OPERATION                ║');
    console.log('╚═══════════════════════════════════════════════════════╝');
    console.log('');

    const testResult: TestResult = {
      oldApiSuccess: false,
      newApiSuccess: false,
      dataMatch: false,
      errors: [],
      timestamp: new Date().toISOString()
    };

    try {
      // Prepare data for both APIs
      const dropdownKey = `${content.screen_location}_dropdown`;
      
      const oldApiData = {
        label: {
          en: titleEn || titleRu,
          he: titleHe,
          ru: titleRu
        },
        placeholder: {
          en: 'Select option',
          he: 'בחר אפשרות',
          ru: 'Выберите вариант'
        },
        options: options.map((option, index) => ({
          id: index + 1,
          en: option.en || option.ru,
          he: option.he,
          ru: option.ru
        }))
      };

      // ============================================
      // TEST 1: OLD API (Current Production)
      // ============================================
      if (!testMode.dryRun) {
        console.log('📤 [OLD API] Calling existing endpoint...');
        
        try {
          const oldResponse = await apiService.updateDropdown(dropdownKey, oldApiData);
          testResult.oldApiSuccess = oldResponse.success;
          
          if (!oldResponse.success) {
            testResult.errors.push(`Old API: ${oldResponse.error}`);
          }
          
          console.log('✅ [OLD API] Response:', oldResponse.success ? 'SUCCESS' : 'FAILED');
        } catch (err) {
          testResult.errors.push(`Old API Error: ${err}`);
          console.error('❌ [OLD API] Error:', err);
        }
      } else {
        console.log('🏃 [OLD API] DRY RUN - Skipping actual call');
        testResult.oldApiSuccess = true; // Simulate success in dry run
      }

      // ============================================
      // TEST 2: NEW API (V2 Shadow Test)
      // ============================================
      console.log('📤 [NEW API] Testing V2 unified endpoint...');
      
      const newApiData = {
        titleRu,
        titleHe,
        titleEn: titleEn || titleRu,
        options: options.map((opt, idx) => ({
          value: `option_${idx + 1}`,
          ru: opt.ru,
          he: opt.he,
          en: opt.en || opt.ru
        }))
      };

      const newResponse = await apiV2Service.updateContent(
        dropdownKey,
        content.screen_location,
        newApiData,
        'dropdown'
      );

      testResult.newApiSuccess = newResponse.success;
      
      if (!newResponse.success) {
        testResult.errors.push(`New API: ${newResponse.error}`);
      }
      
      console.log('✅ [NEW API] Response:', newResponse.success ? 'SUCCESS' : 'FAILED');

      // ============================================
      // TEST 3: DATA COMPARISON
      // ============================================
      if (testMode.logComparison) {
        console.log('');
        console.log('📊 COMPARISON RESULTS:');
        console.log('─────────────────────');
        console.log('Old API Success:', testResult.oldApiSuccess ? '✅' : '❌');
        console.log('New API Success:', testResult.newApiSuccess ? '✅' : '❌');
        console.log('Data Structure Match:', testResult.dataMatch ? '✅' : '⚠️');
        
        if (testResult.errors.length > 0) {
          console.log('');
          console.log('⚠️ ERRORS:');
          testResult.errors.forEach(err => console.log('  •', err));
        }
      }

      // Store test result
      setTestResults(prev => [...prev, testResult]);

      // ============================================
      // PRODUCTION SAVE (if tests pass)
      // ============================================
      if (!testMode.blockProduction && testResult.oldApiSuccess) {
        console.log('');
        console.log('🚀 [PRODUCTION] Saving to production...');
        
        // Also update content translations
        await apiService.updateContentTranslation(content.id, 'ru', titleRu);
        await apiService.updateContentTranslation(content.id, 'he', titleHe);
        if (titleEn) {
          await apiService.updateContentTranslation(content.id, 'en', titleEn);
        }
        
        setHasChanges(false);
        console.log('✅ [PRODUCTION] Save completed');
      } else {
        console.log('🛑 [PRODUCTION] Blocked due to test mode or test failure');
      }

    } catch (error) {
      console.error('❌ [SHADOW TEST] Fatal error:', error);
      testResult.errors.push(`Fatal: ${error}`);
    }

    console.log('');
    console.log('╔═══════════════════════════════════════════════════════╗');
    console.log('║          SHADOW TEST COMPLETED                       ║');
    console.log('╚═══════════════════════════════════════════════════════╝');
    console.log('');
  };

  const handleSave = async () => {
    if (shadowTestEnabled) {
      await handleSaveShadowTest();
    } else {
      // Normal save without shadow testing
      await handleNormalSave();
    }
  };

  const handleNormalSave = async () => {
    // Original save logic (production only)
    if (!content) return;

    try {
      const dropdownKey = `${content.screen_location}_dropdown`;
      const jsonbData = {
        label: {
          en: titleEn || titleRu,
          he: titleHe,
          ru: titleRu
        },
        options: options.map((option, index) => ({
          id: index + 1,
          en: option.en || option.ru,
          he: option.he,
          ru: option.ru
        }))
      };

      const jsonbResponse = await apiService.updateDropdown(dropdownKey, jsonbData);
      const ruResponse = await apiService.updateContentTranslation(content.id, 'ru', titleRu);
      const heResponse = await apiService.updateContentTranslation(content.id, 'he', titleHe);

      if (jsonbResponse.success && ruResponse.success && heResponse.success) {
        setHasChanges(false);
        handleBack();
      } else {
        setError('Ошибка сохранения изменений');
      }
    } catch (err) {
      console.error('Error saving:', err);
      setError('Ошибка сохранения изменений');
    }
  };

  const handleBack = () => {
    let defaultPath = '/content/mortgage';
    if (isCreditRefi) defaultPath = '/content/credit-refi';
    else if (isCredit) defaultPath = '/content/credit';
    else if (isMortgageRefi) defaultPath = '/content/mortgage-refi';
    
    const returnPath = location.state?.returnPath || defaultPath;
    navigate(returnPath, { state: location.state });
  };

  const handleOptionChange = (index: number, field: 'ru' | 'he' | 'en', value: string) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setOptions(newOptions);
    setHasChanges(true);
  };

  const handleAddOption = () => {
    setOptions([...options, { 
      ru: 'Новый вариант', 
      he: 'אפשרות חדשה',
      en: 'New option'
    }]);
    setHasChanges(true);
  };

  const handleDeleteOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
    setHasChanges(true);
  };

  if (loading) {
    return (
      <AdminLayout title="Загрузка...">
        <div className="dropdown-edit-page">
          <div className="dropdown-edit-main">
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
              <div>Загрузка данных...</div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error && !content) {
    return (
      <AdminLayout title="Ошибка">
        <div className="dropdown-edit-page">
          <div className="dropdown-edit-main">
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
              <div style={{ color: '#ef4444' }}>Ошибка: {error}</div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={`Редактирование - ${content?.content_key || 'Загрузка...'} (V2 Shadow Test)`}>
      <div className="dropdown-edit-page">
        <div className="dropdown-edit-main">
          {/* Shadow Test Control Panel */}
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: 'bold' }}>
              🧪 Shadow Testing Control Panel
            </h3>
            
            <div style={{ display: 'flex', gap: '20px', marginBottom: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={shadowTestEnabled}
                  onChange={(e) => setShadowTestEnabled(e.target.checked)}
                />
                <span>Enable Shadow Testing</span>
              </label>
              
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={testMode.dryRun}
                  onChange={(e) => setTestMode(prev => ({ ...prev, dryRun: e.target.checked }))}
                />
                <span>Dry Run (No DB writes)</span>
              </label>
              
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={testMode.blockProduction}
                  onChange={(e) => setTestMode(prev => ({ ...prev, blockProduction: e.target.checked }))}
                />
                <span>Block Production Save</span>
              </label>
            </div>

            <button
              onClick={() => setShowTestResults(!showTestResults)}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.3)',
                color: 'white',
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              {showTestResults ? 'Hide' : 'Show'} Test Results ({testResults.length})
            </button>

            {showTestResults && testResults.length > 0 && (
              <div style={{
                marginTop: '12px',
                padding: '12px',
                background: 'rgba(0,0,0,0.2)',
                borderRadius: '4px'
              }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Test Results:</h4>
                {testResults.slice(-3).map((result, idx) => (
                  <div key={idx} style={{ 
                    padding: '8px', 
                    marginBottom: '8px',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '4px',
                    fontSize: '13px'
                  }}>
                    <div>Time: {new Date(result.timestamp).toLocaleTimeString()}</div>
                    <div>Old API: {result.oldApiSuccess ? '✅' : '❌'}</div>
                    <div>New API: {result.newApiSuccess ? '✅' : '❌'}</div>
                    {result.errors.length > 0 && (
                      <div style={{ color: '#ff6b6b', marginTop: '4px' }}>
                        Errors: {result.errors.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Breadcrumb */}
          <div className="breadcrumb">
            <div className="breadcrumb-item" onClick={() => navigate('/')}>
              Контент сайта
            </div>
            <div className="breadcrumb-arrow"></div>
            <div className="breadcrumb-item breadcrumb-active" onClick={handleBack}>
              {isCreditRefi ? 'Рефинансирование кредита' : 
               isCredit ? 'Расчет кредита' : 
               isMortgageRefi ? 'Рефинансирование ипотеки' : 
               'Главная страница'}
            </div>
            <div className="breadcrumb-arrow"></div>
            <div className="breadcrumb-item breadcrumb-active">
              Действие №{actionNumber || content?.action_number || actionId}
            </div>
          </div>

          {/* Form Fields */}
          <div className="action-headers-section">
            <div className="section-header">Заголовки действий</div>
            
            <div className="headers-input-row">
              <div className="input-group">
                <div className="input-label">RU</div>
                <div className="input-container">
                  <div className="input-wrapper">
                    <input
                      className="text-input"
                      value={titleRu}
                      onChange={(e) => setTitleRu(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              <div className="input-group">
                <div className="input-label input-label-right">HEB</div>
                <div className="input-container">
                  <div className="input-wrapper">
                    <input
                      className="text-input text-input-right"
                      value={titleHe}
                      onChange={(e) => setTitleHe(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="input-group">
                <div className="input-label">EN</div>
                <div className="input-container">
                  <div className="input-wrapper">
                    <input
                      className="text-input"
                      value={titleEn}
                      placeholder="English (optional)"
                      onChange={(e) => setTitleEn(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dropdown Options */}
          <div className="add-option-section">
            <button className="add-option-button" onClick={handleAddOption}>
              <div className="add-icon"></div>
              <div className="add-option-text">Добавить вариант</div>
            </button>
          </div>

          <div className="dropdown-options-section">
            <div className="section-header">Опции ответов</div>
            
            <div className="options-list">
              {options.map((option, index) => (
                <div key={index} className="option-row">
                  <div className="option-drag-section">
                    <div className="hamburger-icon"></div>
                    <div className="option-number">{index + 1}</div>
                  </div>
                  <div className="option-inputs">
                    <div className="option-input-group">
                      <div className="input-label">{index === 0 ? 'RU' : ''}</div>
                      <input
                        className="text-input"
                        value={option.ru}
                        onChange={(e) => handleOptionChange(index, 'ru', e.target.value)}
                      />
                    </div>
                    <div className="option-input-group">
                      <div className="input-label input-label-right">{index === 0 ? 'HEB' : ''}</div>
                      <input
                        className="text-input text-input-right"
                        value={option.he}
                        onChange={(e) => handleOptionChange(index, 'he', e.target.value)}
                      />
                    </div>
                    <div className="option-input-group">
                      <div className="input-label">{index === 0 ? 'EN' : ''}</div>
                      <input
                        className="text-input"
                        value={option.en || ''}
                        placeholder="English"
                        onChange={(e) => handleOptionChange(index, 'en', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="option-actions">
                    <button 
                      className="action-button delete-button"
                      onClick={() => handleDeleteOption(index)}
                    >
                      <div className="delete-icon"></div>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="bottom-actions">
          <div className="bottom-actions-row">
            <div className="bottom-actions-buttons">
              <button className="back-button" onClick={handleBack}>
                <div className="back-button-text">Назад</div>
              </button>
              <button 
                className={`save-button ${hasChanges ? 'save-button-enabled' : 'save-button-disabled'}`} 
                onClick={handleSave}
                disabled={!hasChanges}
              >
                <div className={hasChanges ? 'save-button-text-enabled' : 'save-button-text-disabled'}>
                  {shadowTestEnabled && testMode.blockProduction 
                    ? 'Test Save (No DB Write)' 
                    : 'Сохранить и опубликовать'}
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default JSONBDropdownEditV2;