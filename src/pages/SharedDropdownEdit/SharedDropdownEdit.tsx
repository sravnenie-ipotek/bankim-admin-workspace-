/**
 * SharedDropdownEdit Component
 * Shared component for editing dropdown content across all content types
 * 
 * @version 1.0.0
 * @since 2025-01-29
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { AdminLayout, InlineEdit } from '../../components';
import { apiService } from '../../services/api';
import { getDropdownConfig, DropdownContent, DropdownOption } from '../../utils/dropdownConfigs';
import './SharedDropdownEdit.css';

const SharedDropdownEdit: React.FC = () => {
  const { actionId } = useParams<{ actionId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract content type from the URL path
  const pathname = location.pathname;
  const contentTypeMatch = pathname.match(/\/content\/([^\/]+)\/dropdown-edit/);
  const contentType = contentTypeMatch ? contentTypeMatch[1] : '';
  
  console.log('SharedDropdownEdit - pathname:', pathname);
  console.log('SharedDropdownEdit - contentType:', contentType);
  console.log('SharedDropdownEdit - actionId:', actionId);
  
  // Get configuration for this content type
  const config = getDropdownConfig(contentType);
  
  // State management
  const [content, setContent] = useState<DropdownContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Get action number from location state
  const actionNumber = location.state?.actionNumber || null;
  
  // Form states
  const [titleRu, setTitleRu] = useState('');
  const [titleHe, setTitleHe] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [dropdownOptions, setDropdownOptions] = useState<DropdownOption[]>([]);

  // Monitor dropdownOptions state changes
  useEffect(() => {
    console.log('🔄 dropdownOptions state changed:', dropdownOptions);
  }, [dropdownOptions]);

  // Validate configuration exists
  useEffect(() => {
    if (!config) {
      setError(`Неизвестный тип контента: ${contentType}`);
      setLoading(false);
    }
  }, [config, contentType]);

  // Fetch content data
  useEffect(() => {
    if (config && actionId) {
      fetchContentData();
    }
  }, [config, actionId]);

  const fetchContentData = async () => {
    if (!config || !actionId) return;
    
    try {
      setLoading(true);
      console.log(`📋 Fetching ${contentType} dropdown content for action ID: ${actionId}`);
      
      // First try to fetch the specific content item by ID
      let response = await apiService.getContentItemById(actionId);
      
      // If that fails, try fetching from the content type's endpoint
      if (!response.success || !response.data) {
        console.log(`📋 Trying to fetch from ${contentType} content...`);
        const contentResponse = await apiService.getContentByType(contentType);
        
        if (contentResponse.success && contentResponse.data) {
          // Find the item in the content array
          const contentArray = contentResponse.data.content || contentResponse.data;
          const item = Array.isArray(contentArray) 
            ? contentArray.find((c: any) => c.id === actionId || c.id === parseInt(actionId))
            : null;
          
          if (item) {
            response = { success: true, data: item };
          }
        }
      }
      
      if (response.success && response.data) {
        const item = response.data;
        console.log('🔍 Raw content item response:', item);
        console.log('🔍 Item translations:', item.translations);
        
        // Handle translations - could be array or object
        let ru = '', he = '', en = '';
        if (Array.isArray(item.translations)) {
          const ruTrans = item.translations.find((t: any) => t.lang === 'ru' || t.language === 'ru');
          const heTrans = item.translations.find((t: any) => t.lang === 'he' || t.language === 'he');
          const enTrans = item.translations.find((t: any) => t.lang === 'en' || t.language === 'en');
          
          ru = (ruTrans as any)?.content_value || (ruTrans as any)?.text || (ruTrans as any)?.value || '';
          he = (heTrans as any)?.content_value || (heTrans as any)?.text || (heTrans as any)?.value || '';
          en = (enTrans as any)?.content_value || (enTrans as any)?.text || (enTrans as any)?.value || '';
        } else if (item.translations && typeof item.translations === 'object') {
          const trans = item.translations as any;
          ru = trans.ru || '';
          he = trans.he || '';
          en = trans.en || '';
        }
        
        setContent({
          id: item.id,
          content_key: item.content_key || '',
          component_type: item.component_type || 'dropdown',
          category: item.category || '',
          screen_location: item.screen_location || '',
          description: item.description || '',
          is_active: item.is_active !== false,
          translations: {
            ru,
            he,
            en
          },
          last_modified: item.updated_at || new Date().toISOString(),
          action_number: (item as any).action_number || actionNumber
        });
        
        console.log('📝 Setting title translations:');
        console.log('📝 Russian:', ru);
        console.log('📝 Hebrew:', he);
        console.log('📝 English:', en);
        
        setTitleRu(getSafeTranslation(ru, 'ru'));
        setTitleHe(getSafeTranslation(he, 'he'));
        setTitleEn(getSafeTranslation(en, 'en'));
        
        // Initialize dropdown options based on the content
        initializeDropdownOptions(item);
      } else {
        setError('Не удалось загрузить данные');
      }
    } catch (err) {
      console.error(`❌ Error fetching ${contentType} content data:`, err);
      setError('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const initializeDropdownOptions = async (item: any) => {
    if (!config) return;
    
    try {
      console.log(`📋 Fetching dropdown options for ${contentType} content key: ${item.content_key}`);
      
      const response = await config.api.fetchOptions(item.content_key);
      console.log('🔍 Raw dropdown options response:', response);
      
      if (response.success && response.data) {
        console.log('🔍 Raw dropdown options data:', response.data);
        
        const options = response.data.map((optionItem: any) => {
          console.log('🔍 Processing option item:', optionItem);
          
          // Handle different translation formats
          let ru = '', he = '', en = '';
          
          // First try the direct title properties (API format)
          if (optionItem.titleRu) {
            ru = optionItem.titleRu;
            he = optionItem.titleHe || '';
            en = optionItem.titleEn || '';
            console.log('📝 Using titleRu/titleHe format:', { ru, he, en });
          } else if (Array.isArray(optionItem.translations)) {
            const ruTrans = optionItem.translations.find((t: any) => t.lang === 'ru' || t.language === 'ru');
            const heTrans = optionItem.translations.find((t: any) => t.lang === 'he' || t.language === 'he');
            const enTrans = optionItem.translations.find((t: any) => t.lang === 'en' || t.language === 'en');
            
            ru = (ruTrans as any)?.content_value || (ruTrans as any)?.text || (ruTrans as any)?.value || '';
            he = (heTrans as any)?.content_value || (heTrans as any)?.text || (heTrans as any)?.value || '';
            en = (enTrans as any)?.content_value || (enTrans as any)?.text || (enTrans as any)?.value || '';
            console.log('📝 Using translations array format:', { ru, he, en });
          } else if (optionItem.translations) {
            ru = optionItem.translations.ru || '';
            he = optionItem.translations.he || '';
            en = optionItem.translations.en || '';
            console.log('📝 Using translations object format:', { ru, he, en });
          }
          
          const option = config.features.englishSupport ? { ru, he, en } : { ru, he };
          console.log(`📝 Final extracted option:`, option);
          return option;
        });
        
        console.log(`✅ Found ${options.length} dropdown options`);
        console.log('📋 Final options array:', options);
        
        const finalOptions = options.length > 0 ? options : [
          { ru: '', he: '', ...(config.features.englishSupport ? { en: '' } : {}) }
        ];
        
        console.log('🎯 Setting dropdownOptions state to:', finalOptions);
        
        // TEMPORARY TEST: Force Hebrew values to see if rendering works
        const testOptions = finalOptions.map((option: DropdownOption, index: number) => ({
          ...option,
          he: option.he || `Test Hebrew ${index + 1}`
        }));
        console.log('🧪 Test options with forced Hebrew:', testOptions);
        
        setDropdownOptions(testOptions);
      } else {
        console.log('⚠️ No dropdown options found, initializing with empty option');
        setDropdownOptions([
          { ru: '', he: '', ...(config.features.englishSupport ? { en: '' } : {}) }
        ]);
      }
    } catch (err) {
      console.error('❌ Error fetching dropdown options:', err);
      setDropdownOptions([
        { ru: '', he: '', ...(config.features.englishSupport ? { en: '' } : {}) }
      ]);
    }
  };

  const handleBack = () => {
    const returnPath = location.state?.returnPath || config?.breadcrumbBase || '/content';
    navigate(returnPath, {
      state: {
        fromPage: location.state?.fromPage || 1,
        searchTerm: location.state?.searchTerm || ''
      }
    });
  };

  const handleSave = async () => {
    if (!config || !actionId) return;
    
    try {
      setSaving(true);
      setError(null);
      
      // Update the main dropdown title
      const results = [];
      
      // Update Russian translation if changed
      if (titleRu !== content?.translations.ru) {
        results.push(await config.api.updateTitle(actionId, 'ru', titleRu));
      }
      
      // Update Hebrew translation if changed
      if (titleHe !== content?.translations.he) {
        results.push(await config.api.updateTitle(actionId, 'he', titleHe));
      }
      
      // Update English translation if supported and changed
      if (config.features.englishSupport && titleEn !== content?.translations.en) {
        results.push(await config.api.updateTitle(actionId, 'en', titleEn));
      }
      
      // Update options if the API supports it
      if (config.api.updateOptions && config.features.optionManagement) {
        await config.api.updateOptions(actionId, dropdownOptions);
      }
      
      console.log(`✅ ${contentType} dropdown updated successfully`);
      setHasChanges(false);
      
      // Navigate back after successful save
      handleBack();
    } catch (err) {
      console.error(`❌ Error saving ${contentType} content:`, err);
      setError('Ошибка при сохранении данных');
    } finally {
      setSaving(false);
    }
  };

  const handleOptionChange = (index: number, field: 'ru' | 'he' | 'en', value: string) => {
    const newOptions = [...dropdownOptions];
    newOptions[index][field] = value;
    setDropdownOptions(newOptions);
    setHasChanges(true);
  };

  const handleAddOption = () => {
    const newOption: DropdownOption = { 
      ru: '', 
      he: '',
      ...(config?.features.englishSupport ? { en: '' } : {})
    };
    setDropdownOptions([...dropdownOptions, newOption]);
    setHasChanges(true);
  };

  const handleDeleteOption = (index: number) => {
    const newOptions = dropdownOptions.filter((_, i) => i !== index);
    setDropdownOptions(newOptions);
    setHasChanges(true);
  };

  const handleReorderOption = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === dropdownOptions.length - 1)
    ) {
      return;
    }

    const newOptions = [...dropdownOptions];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newOptions[index], newOptions[targetIndex]] = [newOptions[targetIndex], newOptions[index]];
    
    setDropdownOptions(newOptions);
    setHasChanges(true);
  };

  const formatLastModified = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return `${date.toLocaleDateString('ru-RU')} | ${date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
    } catch {
      return '01.08.2023 | 12:03';
    }
  };

  // Helper function to safely parse and display translation text
  const getSafeTranslation = (translation: string, language: 'ru' | 'he' | 'en'): string => {
    if (!translation) return '';
    
    // Check if the translation looks like JSON
    if (translation.trim().startsWith('[') || translation.trim().startsWith('{')) {
      try {
        // Try to parse as JSON
        const parsed = JSON.parse(translation);
        
        // If it's an array, extract the first label
        if (Array.isArray(parsed) && parsed.length > 0) {
          const firstItem = parsed[0];
          if (typeof firstItem === 'object' && firstItem.label) {
            return firstItem.label;
          }
        }
        
        // If it's an object with label property
        if (typeof parsed === 'object' && parsed.label) {
          return parsed.label;
        }
        
        // If parsing succeeded but no label found, return a fallback
        return `[JSON Data - ${language.toUpperCase()}]`;
      } catch (error) {
        // If JSON parsing fails, return the original text truncated
        return translation.length > 50 ? translation.substring(0, 50) + '...' : translation;
      }
    }
    
    // Return the original translation if it's not JSON
    return translation;
  };

  // Loading state
  if (loading) {
    return (
      <AdminLayout title={config?.pageTitle || 'Редактирование дропдауна'} activeMenuItem={config?.activeMenuItem}>
        <div className="shared-dropdown-edit-loading">
          <div className="loading-spinner"></div>
          <p>Загрузка данных...</p>
        </div>
      </AdminLayout>
    );
  }

  // Error state
  if (error || !content || !config) {
    return (
      <AdminLayout title={config?.pageTitle || 'Редактирование дропдауна'} activeMenuItem={config?.activeMenuItem}>
        <div className="shared-dropdown-edit-error">
          <p>Ошибка: {error || 'Данные не найдены'}</p>
          <button onClick={handleBack}>Вернуться назад</button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={config.pageTitle} activeMenuItem={config.activeMenuItem}>
      <div className="shared-dropdown-edit-page">
        {/* Breadcrumb */}
        <div className="breadcrumb-container">
          <span className="breadcrumb-item" onClick={() => navigate('/content')}>
            {config.breadcrumbLabels.contentSite}
          </span>
          <div className="breadcrumb-separator"></div>
          <span className="breadcrumb-item" onClick={() => navigate(config.breadcrumbBase)}>
            {config.breadcrumbLabels.contentType}
          </span>
          <div className="breadcrumb-separator"></div>
          <span className="breadcrumb-item" onClick={handleBack}>
            {config.breadcrumbLabels.actionsList}
          </span>
          <div className="breadcrumb-separator"></div>
          <span className="breadcrumb-item active">
            {config.breadcrumbLabels.editDropdown}
          </span>
        </div>

        {/* Page Title */}
        <div className="page-title-section">
          <h1 className="page-title">
            Номер действия №{content.action_number || '3'} | {getSafeTranslation(content.translations.ru, 'ru') || 'Основной источник дохода'}
          </h1>
          <p className="page-subtitle">Home_page</p>
        </div>
        
        {/* Last Modified Box */}
        <div className="last-modified-box">
          <span className="last-modified-label">Последнее редактирование</span>
          <span className="last-modified-date">{formatLastModified(content.last_modified)}</span>
        </div>

        {/* Form */}
        <div className="dropdown-edit-form">
          {/* Title Section */}
          <h2 className="section-title">Заголовки действий</h2>
          
          <div className="form-section">
            <div className="language-fields">
                <div className="language-group">
                  <label className="language-label">RU</label>
                  <div className="form-group">
                    <input
                      type="text"
                      value={titleRu}
                      onChange={(e) => {
                        setTitleRu(e.target.value);
                        setHasChanges(true);
                      }}
                      className="form-input"
                      placeholder="Введите заголовок на русском языке"
                    />
                  </div>
                </div>

                <div className="language-group">
                  <label className="language-label">HEB</label>
                  <div className="form-group">
                    <input
                      type="text"
                      value={titleHe}
                      onChange={(e) => {
                        setTitleHe(e.target.value);
                        setHasChanges(true);
                      }}
                      className="form-input rtl"
                      placeholder="הזן כותרת בעברית"
                      dir="rtl"
                    />
                  </div>
                </div>

                {config.features.englishSupport && (
                  <div className="language-group">
                    <label className="language-label">EN</label>
                    <div className="form-group">
                      <input
                        type="text"
                        value={titleEn}
                        onChange={(e) => {
                          setTitleEn(e.target.value);
                          setHasChanges(true);
                        }}
                        className="form-input"
                        placeholder="Enter title in English"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

          {/* Dropdown Options Section */}
          {config.features.optionManagement && (
            <>
              <div className="section-header">
                <h2 className="section-title">Опции ответов</h2>
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="btn-add-option"
                >
                  <span className="add-icon"></span>
                  Добавить вариант
                </button>
              </div>

              <div className="form-section">
                <div className="options-list">
                  {dropdownOptions.map((option, index) => (
                    <div key={index} className="option-item">
                      <div className="option-number">
                        <div className="option-reorder-icon"></div>
                        <span className="option-index">{index + 1}</span>
                      </div>
                      
                      <div className="option-fields">
                        <div className="option-language-group">
                          <label className="option-label">RU</label>
                          <InlineEdit
                            value={option.ru}
                            onSave={(newValue) => handleOptionChange(index, 'ru', newValue)}
                            placeholder="Сотрудник"
                            className="option-inline-edit"
                          />
                        </div>

                        <div className="option-language-group">
                          <label className="option-label">HEB</label>
                          <InlineEdit
                            value={option.he}
                            onSave={(newValue) => handleOptionChange(index, 'he', newValue)}
                            placeholder="עובד"
                            className="option-inline-edit"
                            dir="rtl"
                          />
                        </div>

                        {config.features.englishSupport && (
                          <div className="option-language-group">
                            <label className="option-label">EN</label>
                            <InlineEdit
                              value={option.en || ''}
                              onSave={(newValue) => handleOptionChange(index, 'en', newValue)}
                              placeholder="Employee"
                              className="option-inline-edit"
                            />
                          </div>
                        )}
                      </div>

                      <div className="option-actions">
                        {config.features.optionReordering && (
                          <>
                            <button
                              className="btn-icon"
                              onClick={() => handleReorderOption(index, 'up')}
                              disabled={index === 0}
                              title="Переместить вверх"
                            >
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M12 8L6 14L7.41 15.41L12 10.83L16.59 15.41L18 14L12 8Z" fill="currentColor"/>
                              </svg>
                            </button>
                            <button
                              className="btn-icon"
                              onClick={() => handleReorderOption(index, 'down')}
                              disabled={index === dropdownOptions.length - 1}
                              title="Переместить вниз"
                            >
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M12 16L18 10L16.59 8.59L12 13.17L7.41 8.59L6 10L12 16Z" fill="currentColor"/>
                              </svg>
                            </button>
                          </>
                        )}
                        <button
                          className="btn-icon btn-delete"
                          onClick={() => handleDeleteOption(index)}
                          disabled={dropdownOptions.length <= 1}
                          title="Удалить"
                        >
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z" fill="currentColor"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
        
        {/* Form Actions */}
        <div className="form-actions">
          <button 
            type="button" 
            onClick={handleBack}
            className="btn btn-secondary"
          >
            Назад
          </button>
          <button 
            type="button" 
            onClick={handleSave}
            className="btn btn-primary"
            disabled={!hasChanges || saving}
          >
            {saving ? 'Сохранение...' : 'Сохранить и опубликовать'}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default SharedDropdownEdit;