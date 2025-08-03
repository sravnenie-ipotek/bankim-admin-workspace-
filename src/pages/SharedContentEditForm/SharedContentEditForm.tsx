import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { apiService } from '../../services/api';
import './SharedContentEditForm.css';

// Common interfaces
interface ContentTranslations {
  ru: string;
  he: string;
  en?: string;
}

interface ContentItem {
  id: string;
  content_key: string;
  component_type: string;
  category: string;
  screen_location: string;
  description?: string;
  is_active: boolean;
  translations: ContentTranslations;
  last_modified: string;
  title?: string;
  actionCount?: number;
}

interface DropdownOption {
  id: string;
  order: number;
  titleRu: string;
  titleHe: string;
}

interface ContentEditConfig {
  pageSubtitle: string;
  supportedLanguages: ('ru' | 'he' | 'en')[];
  supportsDropdown: boolean;
  apiMethods: {
    fetch: () => Promise<any>;
    save: (data: any) => Promise<any>;
    fetchDropdownOptions?: (itemId: string) => Promise<any>;
    saveDropdownOptions?: (itemId: string, options: DropdownOption[]) => Promise<any>;
  };
  navigateBackPath: string;
}

// Configuration for each content type
const contentConfigs: Record<string, ContentEditConfig> = {
  mortgage: {
    pageSubtitle: 'Mortgage_page',
    supportedLanguages: ['ru', 'he'],
    supportsDropdown: true,
    apiMethods: {
      fetch: () => apiService.getMortgageContent(),
      save: (data) => apiService.updateMortgageContent(data.id, data),
      fetchDropdownOptions: (itemId) => apiService.getMortgageDropdownOptions(itemId),
      saveDropdownOptions: (itemId, options) => apiService.updateMortgageContent(itemId, { dropdown_options: options })
    },
    navigateBackPath: '/content/mortgage'
  },
  'mortgage-refi': {
    pageSubtitle: 'Mortgage_Refi_page',
    supportedLanguages: ['ru', 'he', 'en'],
    supportsDropdown: false,
    apiMethods: {
      fetch: () => apiService.getContentByContentType('mortgage-refi'),
      save: async (data) => {
        const results = [];
        for (const lang of ['ru', 'he', 'en']) {
          if (data.translations[lang] !== data.originalTranslations?.[lang]) {
            results.push(await apiService.updateContentTranslation(data.id, lang, data.translations[lang]));
          }
        }
        return { success: results.every(r => r.success) };
      }
    },
    navigateBackPath: '/content/mortgage-refi'
  },
  credit: {
    pageSubtitle: 'Credit_page',
    supportedLanguages: ['ru', 'he', 'en'],
    supportsDropdown: true,
    apiMethods: {
      fetch: () => apiService.getCreditContent(),
      save: async (data) => {
        // Credit uses individual translation updates
        const results = [];
        for (const lang of ['ru', 'he', 'en']) {
          if (data.translations[lang] !== data.originalTranslations?.[lang]) {
            results.push(await apiService.updateContentTranslation(data.id, lang, data.translations[lang]));
          }
        }
        return { success: results.every(r => r.success) };
      }
    },
    navigateBackPath: '/content/credit'
  },
  'credit-refi': {
    pageSubtitle: 'Credit_Refi_page',
    supportedLanguages: ['ru', 'he', 'en'],
    supportsDropdown: false,
    apiMethods: {
      fetch: () => apiService.getContentByContentType('credit-refi'),
      save: async (data) => {
        const results = [];
        for (const lang of ['ru', 'he', 'en']) {
          if (data.translations[lang] !== data.originalTranslations?.[lang]) {
            results.push(await apiService.updateContentTranslation(data.id, lang, data.translations[lang]));
          }
        }
        return { success: results.every(r => r.success) };
      }
    },
    navigateBackPath: '/content/credit-refi'
  },
  menu: {
    pageSubtitle: 'Menu_page',
    supportedLanguages: ['ru', 'he', 'en'],
    supportsDropdown: false,
    apiMethods: {
      fetch: () => apiService.getMenuTranslations(),
      save: async (data) => {
        // Menu uses individual translation updates
        const results = [];
        for (const lang of ['ru', 'he', 'en']) {
          if (data.translations[lang] !== data.originalTranslations?.[lang]) {
            results.push(await apiService.updateMenuTranslation(data.id, lang, data.translations[lang]));
          }
        }
        return { success: results.every(r => r.success) };
      }
    },
    navigateBackPath: '/content/menu'
  },
  general: {
    pageSubtitle: 'General_page',
    supportedLanguages: ['ru', 'he', 'en'],
    supportsDropdown: false,
    apiMethods: {
      fetch: () => apiService.getContentByContentType('general'),
      save: async (data) => {
        const results = [];
        for (const lang of ['ru', 'he', 'en']) {
          if (data.translations[lang] !== data.originalTranslations?.[lang]) {
            results.push(await apiService.updateContentTranslation(data.id, lang, data.translations[lang]));
          }
        }
        return { success: results.every(r => r.success) };
      }
    },
    navigateBackPath: '/content/general'
  }
};

interface SharedContentEditFormProps {
  contentType: string;
}

/**
 * SharedContentEditForm - A truly shared component for editing all content types
 * Handles translations, dropdown options, and saving based on content type configuration
 */
const SharedContentEditForm: React.FC<SharedContentEditFormProps> = ({ contentType }) => {
  const { itemId } = useParams<{ itemId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [contentItem, setContentItem] = useState<ContentItem | null>(null);
  const [dropdownOptions, setDropdownOptions] = useState<DropdownOption[]>([]);
  
  // Translation states
  const [translations, setTranslations] = useState<ContentTranslations>({
    ru: '',
    he: '',
    en: ''
  });
  
  const [error, setError] = useState<string | null>(null);
  
  // Get configuration for this content type
  const config = contentConfigs[contentType];
  
  if (!config) {
    return <div className="shared-edit-error">Unknown content type: {contentType}</div>;
  }

  useEffect(() => {
    fetchContentItem();
  }, [itemId, contentType]);

  const fetchContentItem = async () => {
    try {
      setLoading(true);
      console.log(`🔍 Fetching ${contentType} content for item ID: ${itemId}`);
      
      // First try to fetch the specific item by ID using the dedicated endpoint
      try {
        const itemResponse = await apiService.getContentItemById(itemId!);
        console.log(`📦 Direct item fetch response:`, itemResponse);
        
        if (itemResponse.success && itemResponse.data) {
          const item = itemResponse.data as any;
          setContentItem(item);
          setTranslations({
            ru: item.translations?.ru || '',
            he: item.translations?.he || '',
            en: item.translations?.en || ''
          });
          console.log(`✅ Found item via direct fetch:`, item);
          console.log(`🌐 Set translations:`, {
            ru: item.translations?.ru || '',
            he: item.translations?.he || '',
            en: item.translations?.en || ''
          });
          
          // Fetch dropdown options if supported
          if (config.supportsDropdown && item.component_type === 'dropdown' && config.apiMethods.fetchDropdownOptions) {
            console.log(`📊 Fetching dropdown options for ${contentType}`);
            const optionsResponse = await config.apiMethods.fetchDropdownOptions(itemId!);
            if (optionsResponse.success && optionsResponse.data) {
              setDropdownOptions(optionsResponse.data);
            }
          }
          return; // Success - exit early
        }
      } catch (directFetchError) {
        console.warn('Direct item fetch failed, falling back to list search:', directFetchError);
      }
      
      // Fallback: fetch all items and search
      const response = await config.apiMethods.fetch();
      console.log(`📦 API Response for ${contentType}:`, response);
      
      if (response.success && response.data) {
        // Find the specific item - try different response structures
        let items = [];
        
        if (Array.isArray(response.data)) {
          items = response.data;
          console.log(`📋 Found array with ${items.length} items`);
        } else if (response.data[`${contentType.replace('-', '_')}_content`]) {
          items = response.data[`${contentType.replace('-', '_')}_content`];
          console.log(`📋 Found ${contentType.replace('-', '_')}_content with ${items.length} items`);
        } else if (response.data[`${contentType}_content`]) {
          items = response.data[`${contentType}_content`];
          console.log(`📋 Found ${contentType}_content with ${items.length} items`);
        } else if (response.data.content_items) {
          items = response.data.content_items;
          console.log(`📋 Found content_items with ${items.length} items`);
        } else {
          items = [response.data];
          console.log(`📋 Using single item response`);
        }
        
        console.log(`🔎 Looking for item ID ${itemId} in ${items.length} items`);
        console.log(`📝 Available item IDs:`, items.map((i: any) => i.id));
        
        const item = items.find((i: any) => i.id === itemId || i.id === parseInt(itemId!));
        console.log(`✅ Found item:`, item);
        
        if (item) {
          setContentItem(item as any);
          setTranslations({
            ru: item.translations?.ru || '',
            he: item.translations?.he || '',
            en: item.translations?.en || ''
          });
          console.log(`🌐 Set translations:`, {
            ru: item.translations?.ru || '',
            he: item.translations?.he || '',
            en: item.translations?.en || ''
          });
          
          // Fetch dropdown options if supported
          if (config.supportsDropdown && item.component_type === 'dropdown' && config.apiMethods.fetchDropdownOptions) {
            console.log(`📊 Fetching dropdown options for ${contentType}`);
            const optionsResponse = await config.apiMethods.fetchDropdownOptions(itemId!);
            if (optionsResponse.success && optionsResponse.data) {
              setDropdownOptions(optionsResponse.data);
            }
          }
        } else {
          console.error(`❌ Content item not found. Looking for ID: ${itemId}`);
          setError('Content item not found');
        }
      } else {
        console.error(`❌ API response failed:`, response);
        setError(`Failed to load ${contentType} content`);
      }
    } catch (err) {
      console.error(`❌ Error fetching ${contentType} content:`, err);
      setError(`Failed to load ${contentType} content`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddOption = () => {
    const newOption: DropdownOption = {
      id: `new-${Date.now()}`,
      order: dropdownOptions.length + 1,
      titleRu: '',
      titleHe: ''
    };
    setDropdownOptions([...dropdownOptions, newOption]);
  };

  const handleUpdateOption = (optionId: string, field: 'titleRu' | 'titleHe', value: string) => {
    setDropdownOptions(options =>
      options.map(opt =>
        opt.id === optionId ? { ...opt, [field]: value } : opt
      )
    );
  };

  const handleDeleteOption = (optionId: string) => {
    setDropdownOptions(options => {
      const filtered = options.filter(opt => opt.id !== optionId);
      return filtered.map((opt, index) => ({
        ...opt,
        order: index + 1
      }));
    });
  };

  const handleMoveOption = (optionId: string, direction: 'up' | 'down') => {
    const index = dropdownOptions.findIndex(opt => opt.id === optionId);
    if (index === -1) return;

    const newOptions = [...dropdownOptions];
    if (direction === 'up' && index > 0) {
      [newOptions[index], newOptions[index - 1]] = [newOptions[index - 1], newOptions[index]];
    } else if (direction === 'down' && index < newOptions.length - 1) {
      [newOptions[index], newOptions[index + 1]] = [newOptions[index + 1], newOptions[index]];
    }

    const reordered = newOptions.map((opt, idx) => ({
      ...opt,
      order: idx + 1
    }));
    setDropdownOptions(reordered);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      console.log(`💾 Saving ${contentType} content...`);
      
      const saveData = {
        id: itemId!,
        translations,
        originalTranslations: contentItem?.translations,
        dropdown_options: dropdownOptions
      };
      
      console.log(`📤 Save data:`, saveData);
      const result = await config.apiMethods.save(saveData);
      console.log(`📥 Save result:`, result);
      
      if (result.success) {
        console.log(`✅ ${contentType} content saved successfully`);
        navigate(config.navigateBackPath, { 
          state: { 
            fromPage: location.state?.fromPage || 1,
            searchTerm: location.state?.searchTerm || ''
          } 
        });
      } else {
        console.error(`❌ Failed to save ${contentType} content:`, result);
        setError('Failed to save content');
      }
    } catch (err) {
      console.error(`❌ Error saving ${contentType} content:`, err);
      setError('Error saving content');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    navigate(config.navigateBackPath, { 
      state: { 
        fromPage: location.state?.fromPage || 1,
        searchTerm: location.state?.searchTerm || ''
      } 
    });
  };

  if (loading) {
    return (
      <div className="shared-edit-container">
        <div className="loading-state">Загрузка...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="shared-edit-container">
        <div className="error-state">{error}</div>
      </div>
    );
  }

  const isDropdown = contentItem?.component_type === 'dropdown';
  const breadcrumbLabel = contentType.charAt(0).toUpperCase() + contentType.slice(1);

  return (
    <div className="shared-edit-container">
      {/* Breadcrumb */}
      <div className="breadcrumb-container">
        <span className="breadcrumb-item">Контент сайта</span>
        <div className="breadcrumb-separator"></div>
        <span className="breadcrumb-item">{breadcrumbLabel}</span>
        <div className="breadcrumb-separator"></div>
        <span className="breadcrumb-item active">Редактирование</span>
      </div>

      {/* Header */}
      <div className="page-header-edit">
        <h1 className="page-title-edit">
          {contentItem?.translations?.ru || contentItem?.content_key || 'Загрузка...'}
        </h1>
        <span className="page-subtitle">{config.pageSubtitle}</span>
      </div>

      {/* Last Edit Info */}
      <div className="last-edit-info">
        <span className="last-edit-label">Последнее редактирование</span>
        <span className="last-edit-date">
          {contentItem?.last_modified && new Date(contentItem.last_modified).getTime() > 0 ? (
            <>
              {new Date(contentItem.last_modified).toLocaleDateString('ru-RU')} | 
              {' '}{new Date(contentItem.last_modified).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
            </>
          ) : (
            'Дата не указана'
          )}
        </span>
      </div>

      {/* Title Section */}
      <h2 className="section-title">Заголовки действий</h2>
      <div className="section-container">
        {config.supportedLanguages.map(lang => (
          <div key={lang} className="input-group">
            <label className="input-label">{lang.toUpperCase()}</label>
            <input
              type="text"
              className={`text-input ${lang === 'he' ? 'rtl' : ''}`}
              value={translations[lang] || ''}
              onChange={(e) => setTranslations(prev => ({ ...prev, [lang]: e.target.value }))}
              placeholder={`Введите текст на ${lang === 'ru' ? 'русском' : lang === 'he' ? 'иврите' : 'английском'}`}
              dir={lang === 'he' ? 'rtl' : 'ltr'}
            />
          </div>
        ))}
      </div>

      {/* Dropdown Options Section (only for dropdown type) */}
      {isDropdown && config.supportsDropdown && (
        <>
          <h2 className="section-title">Дополнительный текст</h2>
          <div className="section-container">
            <div className="section-header">
              <button className="add-option-btn" onClick={handleAddOption}>
                <span className="add-icon">+</span>
                <span>Добавить вариант</span>
              </button>
            </div>

            <div className="options-list">
              {dropdownOptions.length === 0 ? (
                <div className="no-options-message">
                  <p>Для этого поля пока нет вариантов ответов</p>
                  {contentType === 'credit' && (
                    <p style={{ margin: '10px 0 0 0', fontSize: '14px' }}>Функция dropdown опций для кредитов будет добавлена позже</p>
                  )}
                </div>
              ) : (
                dropdownOptions.map((option, index) => (
                  <div key={option.id} className="option-row">
                    <div className="option-number">{option.order}</div>
                    
                    <div className="option-inputs">
                      <div className="option-input-group">
                        <label className="input-label">RU</label>
                        <input
                          type="text"
                          className="option-input"
                          value={option.titleRu}
                          onChange={(e) => handleUpdateOption(option.id, 'titleRu', e.target.value)}
                          placeholder="Вариант на русском"
                        />
                      </div>
                      
                      <div className="option-input-group">
                        <label className="input-label">HEB</label>
                        <input
                          type="text"
                          className="option-input rtl"
                          value={option.titleHe}
                          onChange={(e) => handleUpdateOption(option.id, 'titleHe', e.target.value)}
                          placeholder="אפשרות בעברית"
                          dir="rtl"
                        />
                      </div>
                    </div>

                    <div className="option-actions">
                      <button 
                        className="option-action-btn"
                        onClick={() => handleMoveOption(option.id, 'up')}
                        disabled={index === 0}
                        title="Переместить вверх"
                      >
                        ↑
                      </button>
                      <button 
                        className="option-action-btn"
                        onClick={() => handleMoveOption(option.id, 'down')}
                        disabled={index === dropdownOptions.length - 1}
                        title="Переместить вниз"
                      >
                        ↓
                      </button>
                      <button 
                        className="option-action-btn delete"
                        onClick={() => handleDeleteOption(option.id)}
                        title="Удалить"
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* Action Buttons */}
      <div className="action-buttons">
        <div className="action-buttons-row">
          <div className="action-buttons-inner">
            <button className="btn-secondary" onClick={handleBack} disabled={saving}>
              Назад
            </button>
            <button className="btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Сохранение...' : 'Сохранить и опубликовать'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharedContentEditForm;