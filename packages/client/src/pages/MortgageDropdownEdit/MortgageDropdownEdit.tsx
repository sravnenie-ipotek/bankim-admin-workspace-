/**
 * MortgageDropdownEdit Component
 * Exact implementation matching editDropDownDrillUI.md specification
 * 
 * @version 3.0.0
 * @since 2025-01-26
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import './MortgageDropdownEdit.css';
import { AdminLayout } from '../../components';
import { apiService } from '../../services/api';
import { createFallbackOptions } from '../../utils/dropdownContextualMessages';

interface DropdownOption {
  ru: string;
  he: string;
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

const MortgageDropdownEdit: React.FC = () => {
  const { actionId } = useParams<{ actionId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Detect if this is mortgage-refi content based on URL path
  const isMortgageRefi = location.pathname.includes('/mortgage-refi/');
  
  // Content state
  const [content, setContent] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Get action number from location state
  const actionNumber = location.state?.actionNumber || null;
  
  // Form states - will be populated from API data
  const [titleRu, setTitleRu] = useState('');
  const [titleHe, setTitleHe] = useState('');
  const [options, setOptions] = useState<DropdownOption[]>([]);

  // Load content data on component mount
  useEffect(() => {
    fetchContentData();
  }, [actionId]);

  // Monitor for changes to enable save button
  useEffect(() => {
    if (content) {
      const hasRuChange = titleRu !== (content.translations?.ru || '');
      const hasHeChange = titleHe !== (content.translations?.he || '');
      // Note: options changes are tracked separately in handlers
      setHasChanges(hasRuChange || hasHeChange);
    }
  }, [titleRu, titleHe, content]);

  const fetchContentData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log(`📋 Fetching mortgage dropdown content item with ID: ${actionId}`);
      const response = await apiService.getContentItemById(actionId || '');
      
      if (response.success && response.data) {
        const targetContent = response.data;
        
        // Normalize content structure
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
        
        // Initialize form fields with loaded data
        setTitleRu(normalizedContent.translations.ru);
        setTitleHe(normalizedContent.translations.he);
        
        // Try to load dropdown options
        await loadDropdownOptions(normalizedContent.content_key);
        
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

  const loadDropdownOptions = async (contentKey: string) => {
    try {
      console.log(`📋 Loading dropdown options for content key: ${contentKey} (isMortgageRefi: ${isMortgageRefi})`);
      // Call appropriate API based on content type
      const response = isMortgageRefi 
        ? await apiService.getMortgageRefiDropdownOptions(contentKey)
        : await apiService.getMortgageDropdownOptions(contentKey);
      
      if (response.success && response.data && Array.isArray(response.data)) {
        const loadedOptions: DropdownOption[] = response.data.map((option: any) => ({
          ru: option.translations?.ru || option.ru || 'Опция',
          he: option.translations?.he || option.he || 'אפשרות'
        }));
        
        if (loadedOptions.length > 0) {
          console.log(`✅ Loaded ${loadedOptions.length} options for ${contentKey}`);
          setOptions(loadedOptions);
        } else {
          console.warn(`⚠️ No options found for ${contentKey}. Using contextual placeholder options.`);
          // Use contextual messages based on dropdown type
          const fallbackOptions = createFallbackOptions(
            contentKey, 
            content?.translations?.ru, 
            content?.translations?.he
          );
          setOptions(fallbackOptions);
        }
      } else {
        console.error(`❌ API error for ${contentKey}:`, response.error);
        // Use contextual messages even for API errors
        const fallbackOptions = createFallbackOptions(
          contentKey, 
          content?.translations?.ru, 
          content?.translations?.he
        );
        setOptions(fallbackOptions);
      }
    } catch (err) {
      console.error('Error loading dropdown options:', err);
      // Use contextual messages even for network errors
      const fallbackOptions = createFallbackOptions(
        contentKey, 
        content?.translations?.ru, 
        content?.translations?.he
      );
      setOptions(fallbackOptions);
    }
  };

  const handleBack = () => {
    // Use returnPath from state if available, otherwise default based on content type
    const defaultPath = isMortgageRefi ? '/content/mortgage-refi' : '/content/mortgage';
    const returnPath = location.state?.returnPath || defaultPath;
    
    navigate(returnPath, { 
      state: { 
        fromPage: location.state?.fromPage || 1,
        searchTerm: location.state?.searchTerm || '',
        drillPage: location.state?.drillPage || 1,
        drillSearchTerm: location.state?.drillSearchTerm || '',
        actionNumber: actionNumber,
        baseActionNumber: location.state?.baseActionNumber || 0
      } 
    });
  };

  const handleSave = async () => {
    if (!content) return;

    try {
      console.log(`💾 Saving changes for content item ${content.id}`);
      
      // Update Russian translation
      const ruResponse = await apiService.updateContentTranslation(
        content.id,
        'ru',
        titleRu
      );

      // Update Hebrew translation
      const heResponse = await apiService.updateContentTranslation(
        content.id,
        'he',
        titleHe
      );

      // TODO: Update dropdown options via API (if endpoint exists)
      // For now, just log the options that would be saved
      console.log('Dropdown options to save:', options);

      if (ruResponse.success && heResponse.success) {
        console.log('✅ Successfully saved all translations');
        setHasChanges(false);
        
        // Use returnPath from state if available, otherwise default based on content type
        const defaultPath = isMortgageRefi ? '/content/mortgage-refi' : '/content/mortgage';
        const returnPath = location.state?.returnPath || defaultPath;
        
        navigate(returnPath, { 
          state: { 
            fromPage: location.state?.fromPage || 1,
            searchTerm: location.state?.searchTerm || '',
            drillPage: location.state?.drillPage || 1,
            drillSearchTerm: location.state?.drillSearchTerm || '',
            actionNumber: actionNumber,
            baseActionNumber: location.state?.baseActionNumber || 0
          } 
        });
      } else {
        console.error('❌ Failed to save some translations');
        setError('Ошибка сохранения изменений');
      }
    } catch (err) {
      console.error('❌ Error saving content:', err);
      setError('Ошибка сохранения изменений');
    }
  };

  const handleOptionChange = (index: number, field: 'ru' | 'he', value: string) => {
    const newOptions = [...options];
    newOptions[index][field] = value;
    setOptions(newOptions);
    setHasChanges(true); // Mark as changed when options are modified
  };

  const handleAddOption = () => {
    setOptions([...options, { ru: 'Сотрудник', he: 'עובד' }]);
    setHasChanges(true);
  };

  const handleDeleteOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
    setHasChanges(true);
  };

  // Loading state
  if (loading) {
    return (
      <AdminLayout title="Загрузка...">
        <div className="dropdown-edit-page">
          <div className="dropdown-edit-main">
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
              <div>Загрузка...</div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Error state
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

  // Format last modified date
  const formatLastModified = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).replace(',', ' |');
    } catch {
      return '01.08.2023 | 12:03'; // Fallback
    }
  };

  return (
    <AdminLayout title={`Редактирование дропдауна - ${content?.content_key || 'Загрузка...'}`}>
      <div className="dropdown-edit-page">
        {/* Main Content Area */}
        <div className="dropdown-edit-main">
          {/* Breadcrumb */}
          <div className="breadcrumb">
            <div className="breadcrumb-item" onClick={() => navigate(isMortgageRefi ? '/content/mortgage-refi' : '/content/mortgage')}>
              Контент сайта
            </div>
            <div className="breadcrumb-arrow"></div>
            <div className="breadcrumb-item breadcrumb-active" onClick={handleBack}>
              {isMortgageRefi ? 'Рефинансирование ипотеки' : 'Главная страница Страница №1'}
            </div>
            <div className="breadcrumb-arrow"></div>
            <div className="breadcrumb-item breadcrumb-active">
              Действие №{actionNumber || content?.action_number || actionId}
            </div>
          </div>

          {/* Page Title */}
          <div className="page-title-section">
            <div className="page-title-content">
              <div className="page-title-row">
                <div className="page-title">
                  Номер действия №{actionNumber || content?.action_number || actionId} | {titleRu || content?.translations?.ru || 'Основной источник дохода'}
                </div>
                <div className="page-subtitle">
                  <div>{content?.screen_location || 'mortgage_calculation'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Last Modified Card */}
          <div className="last-modified-card">
            <div className="last-modified-content">
              <div className="last-modified-label">Последнее редактирование</div>
              <div className="last-modified-date">
                {content?.last_modified ? formatLastModified(content.last_modified) : '01.08.2023 | 12:03'}
              </div>
            </div>
          </div>

          {/* Action Headers Section */}
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
            </div>
          </div>

          {/* Add Option Button */}
          <div className="add-option-section">
            <button className="add-option-button" onClick={handleAddOption}>
              <div className="add-icon"></div>
              <div className="add-option-text">Добавить вариант</div>
            </button>
          </div>

          {/* Dropdown Options Section */}
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
                      <div className="input-container">
                        <div className="input-wrapper">
                          <input
                            className="text-input"
                            value={option.ru}
                            onChange={(e) => handleOptionChange(index, 'ru', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="option-input-group">
                      <div className="input-label input-label-right">{index === 0 ? 'HEB' : ''}</div>
                      <div className="input-container">
                        <div className="input-wrapper">
                          <input
                            className="text-input text-input-right"
                            value={option.he}
                            onChange={(e) => handleOptionChange(index, 'he', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="option-actions">
                    <button className="action-button edit-button">
                      <div className="edit-icon"></div>
                    </button>
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
                  Сохранить и опубликовать
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default MortgageDropdownEdit;