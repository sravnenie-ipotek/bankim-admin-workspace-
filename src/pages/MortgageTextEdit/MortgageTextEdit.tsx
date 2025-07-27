/**
 * MortgageTextEdit Component
 * Edit page for text-type mortgage content items
 * Based on editTextDrill.md design specification
 * 
 * @version 2.0.0
 * @since 2025-01-27
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { apiService } from '../../services/api';
import { SharedHeader, SharedMenu } from '../../components';
import './MortgageTextEdit.css';

/**
 * Generic function to find related content items for any given content item
 * Uses intelligent pattern matching to find dropdowns, options, help text, etc.
 */
const findRelatedContentItems = async (item: any, dataFetcher: () => Promise<any>) => {
  try {
    const baseKey = item.content_key || '';
    const screenLocation = item.screen_location || '';
    console.log(`📋 Finding related content for: ${baseKey}`);
    
    const response = await dataFetcher();
    if (!response.success || !response.data) {
      return [];
    }
    
    // Handle different response structures
    const contentItems = response.data.actions || response.data.mortgage_content || [];
    
    // Strategy 1: Find items with exact base key match (for dropdown families)
    const getBaseKey = (key: string) => {
      // Remove common suffixes to get the root key
      return key
        .replace(/_ph$/, '')                    // Remove placeholder suffix
        .replace(/_option_\d+$/, '')           // Remove option suffix (singular)
        .replace(/_options_\d+$/, '')          // Remove option suffix (plural)
        .replace(/_hint$/, '')                 // Remove hint suffix
        .replace(/_help$/, '');               // Remove help suffix
    };
    
    const rootKey = getBaseKey(baseKey);
    
    // Strategy 2: Extract meaningful parts of the key for broader matching
    const keyParts = baseKey.split('.');
    const meaningfulParts = keyParts.filter(part => 
      part.length > 3 && 
      !['app', 'form', 'field', 'mortgage', 'calculation'].includes(part)
    );
    
    // Find related items using multiple strategies
    const relatedItems = contentItems.filter((contentItem: any) => {
      const itemKey = contentItem.content_key || '';
      const itemType = contentItem.component_type || '';
      
      // Skip the item itself
      if (itemKey === baseKey) return false;
      
      // Strategy 1: Exact base key family match (highest priority)
      const itemRootKey = getBaseKey(itemKey);
      if (itemRootKey === rootKey && rootKey.length > 0) {
        return ['option', 'placeholder', 'help_text', 'hint', 'text'].includes(itemType);
      }
      
      // Strategy 2: Semantic similarity - check if keys share meaningful parts
      const hasSharedMeaningfulPart = meaningfulParts.some(part => 
        itemKey.includes(part) && part.length > 4
      );
      
      if (hasSharedMeaningfulPart) {
        return ['option', 'help_text', 'hint', 'placeholder'].includes(itemType);
      }
      
      // Strategy 3: Same screen location + component type relevance
      if (contentItem.screen_location === screenLocation) {
        // For labels/field_labels, find their related options and help text
        if (['label', 'field_label'].includes(item.component_type)) {
          return ['option', 'help_text', 'hint'].includes(itemType);
        }
        
        // For placeholders, find their related options
        if (item.component_type === 'placeholder') {
          return ['option', 'help_text'].includes(itemType);
        }
      }
      
      return false;
    });
    
    // Sort by relevance: exact matches first, then by action number
    const sortedItems = relatedItems
      .sort((a, b) => {
        const aRootKey = getBaseKey(a.content_key || '');
        const bRootKey = getBaseKey(b.content_key || '');
        
        // Exact base key matches first
        const aExactMatch = aRootKey === rootKey ? 1 : 0;
        const bExactMatch = bRootKey === rootKey ? 1 : 0;
        
        if (aExactMatch !== bExactMatch) {
          return bExactMatch - aExactMatch;
        }
        
        // Then sort by action number
        return (a.action_number || 0) - (b.action_number || 0);
      })
      .slice(0, 5); // Limit to top 5 most relevant items
    
    console.log(`✅ Found ${sortedItems.length} related items`);
    return sortedItems;
  } catch (error) {
    console.error('❌ Error finding related content:', error);
    return [];
  }
};

interface ContentTranslation {
  id: string;
  action_number: number;
  content_key: string;
  component_type: string;
  category: string;
  screen_location: string;
  description: string;
  is_active: boolean;
  translations: {
    ru: string;
    he: string;
    en: string;
  };
  last_modified: string;
}

const MortgageTextEdit: React.FC = () => {
  const { actionId } = useParams<{ actionId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [content, setContent] = useState<ContentTranslation | null>(null);
  const [relatedContent, setRelatedContent] = useState<ContentTranslation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Form state
  const [ruText, setRuText] = useState('');
  const [heText, setHeText] = useState('');
  const [additionalTexts, setAdditionalTexts] = useState<Array<{ ru: string; he: string }>>([]);

  useEffect(() => {
    fetchContentData();
  }, [actionId]);

  const fetchContentData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch the specific content item by ID
      console.log(`📋 Fetching content item with ID: ${actionId}`);
      const response = await apiService.getContentItemById(actionId || '');
      
      if (response.success && response.data) {
        const targetContent = response.data;
        
        if (targetContent) {
          const normalizedContent: ContentTranslation = {
            id: targetContent.id?.toString() || actionId || '',
            action_number: targetContent.action_number || 1,
            content_key: targetContent.content_key || '',
            component_type: targetContent.component_type || 'text',
            category: targetContent.category || '',
            screen_location: targetContent.screen_location || '',
            description: targetContent.description || targetContent.translations?.ru || '',
            is_active: targetContent.is_active !== false,
            translations: {
              ru: targetContent.translations?.ru || '',
              he: targetContent.translations?.he || '',
              en: targetContent.translations?.en || ''
            },
            last_modified: targetContent.updated_at || new Date().toISOString()
          };

          setContent(normalizedContent);
          setRuText(normalizedContent.translations.ru);
          setHeText(normalizedContent.translations.he);

          // Find related content for dropdowns/options
          console.log(`📋 Looking for related content for: ${normalizedContent.content_key}`);
          const related = await findRelatedContentItems(
            targetContent,
            async () => {
              // Fetch all individual mortgage content items for related content search
              console.log('📋 Fetching all individual mortgage content items...');
              return await apiService.getMortgageAllItems();
            }
          );
          
          // Convert related items to additional texts format
          if (related.length > 0) {
            const texts = related.map(item => ({
              ru: item.translations?.ru || '',
              he: item.translations?.he || ''
            }));
            setAdditionalTexts(texts);
          }
          
          setRelatedContent(related);
        } else {
          setError('Content not found');
        }
      } else {
        setError('Failed to fetch content');
      }
    } catch (err) {
      console.error('Error fetching content:', err);
      setError('Failed to load content data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!content) return;

    try {
      console.log(`💾 Saving changes for content item ${content.id}`);
      
      // Update Russian translation
      const ruResponse = await apiService.updateContentTranslation(
        content.id,
        'ru',
        ruText
      );
      
      if (!ruResponse.success) {
        throw new Error(`Failed to update Russian translation: ${ruResponse.error}`);
      }
      
      // Update Hebrew translation
      const heResponse = await apiService.updateContentTranslation(
        content.id,
        'he',
        heText
      );
      
      if (!heResponse.success) {
        throw new Error(`Failed to update Hebrew translation: ${heResponse.error}`);
      }
      
      console.log('✅ Successfully updated translations');
       
      // Handle additional texts if they exist
      // This would require additional API calls to update related content items
      
      setHasChanges(false);
      // Navigate back
      handleBack();
      
    } catch (err) {
      console.error('Error saving content:', err);
      setError(err instanceof Error ? err.message : 'Failed to save changes');
    }
  };

  const handleBack = () => {
    // Try to get the return path from location state first
    let returnPath = location.state?.returnPath;
    
    // If no return path is provided, construct the drill page path based on content data
    if (!returnPath && content) {
      // Map screen_location to step IDs for drill pages
      const screenToStepMap: Record<string, string> = {
        'mortgage_calculation': 'step.1.calculator',
        'mortgage_step1': 'step.1.calculator',
        'mortgage_step2': 'step.2.personal_data',
        'mortgage_step3': 'step.3.income_data',
        'mortgage_step4': 'step.4.program_selection'
      };
      
      const stepId = screenToStepMap[content.screen_location];
      if (stepId) {
        returnPath = `/content/mortgage/drill/${stepId}`;
        console.log(`📍 Constructed return path: ${returnPath} from screen_location: ${content.screen_location}`);
      } else {
        returnPath = '/content/mortgage';
        console.log(`⚠️ Unknown screen_location: ${content.screen_location}, using fallback: ${returnPath}`);
      }
    } else if (!returnPath) {
      returnPath = '/content/mortgage';
      console.log(`⚠️ No return path or content available, using fallback: ${returnPath}`);
    } else {
      console.log(`📍 Using provided return path: ${returnPath}`);
    }
    
    navigate(returnPath, {
      state: {
        fromPage: location.state?.fromPage,
        searchTerm: location.state?.searchTerm
      }
    });
  };

  const handleTextChange = (index: number, field: 'ru' | 'he', value: string) => {
    const newTexts = [...additionalTexts];
    newTexts[index][field] = value;
    setAdditionalTexts(newTexts);
    setHasChanges(true);
  };

  const handleAddOption = () => {
    setAdditionalTexts([...additionalTexts, { ru: '', he: '' }]);
    setHasChanges(true);
  };

  const handleDeleteOption = (index: number) => {
    const newTexts = additionalTexts.filter((_, i) => i !== index);
    setAdditionalTexts(newTexts);
    setHasChanges(true);
  };

  const formatLastModified = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return `${date.toLocaleDateString('ru-RU')} | ${date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
    } catch {
      return '22.07.2025 | 19:36';
    }
  };

  if (loading) {
    return (
      <div className="text-edit-loading">
        <div className="loading-spinner"></div>
        <p>Загрузка данных...</p>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="text-edit-error">
        <p>Ошибка: {error || 'Данные не найдены'}</p>
        <button onClick={handleBack}>Вернуться назад</button>
      </div>
    );
  }

  return (
    <div className="text-edit-page">
      <SharedMenu />
      <div className="text-edit-content">
        <SharedHeader />
        <div className="text-edit-main">
          {/* Breadcrumb */}
          <div className="breadcrumb-container">
            <span className="breadcrumb-item" onClick={() => navigate('/content/mortgage')}>
              Страницы сайта
            </span>
            <div className="breadcrumb-separator"></div>
            <span className="breadcrumb-item" onClick={() => navigate('/content/mortgage')}>
              Главная страница Страница №1
            </span>
            <div className="breadcrumb-separator"></div>
            <span className="breadcrumb-item active">
              Действие №{content.action_number || 3}
            </span>
          </div>

          {/* Page Title */}
          <div className="page-title-section">
            <h1 className="page-title">
              Номер действия №{content.action_number || 1} | {content.description || content.content_key}
            </h1>
            <div className="page-info">
              <span className="page-info-text">{content.screen_location || 'Home_page'}</span>
            </div>
          </div>

          {/* Last Modified Card */}
          <div className="info-card">
            <div className="info-label">Последнее редактирование</div>
            <div className="info-value">{formatLastModified(content.last_modified)}</div>
          </div>

          {/* Action Headers Section */}
          <h2 className="section-header">Заголовки действия</h2>
          
          <div className="input-group">
            <div className="language-tabs">
              <span className="language-tab active">RU</span>
            </div>
            <input
              type="text"
              className="input-field"
              value={ruText}
              onChange={(e) => {
                setRuText(e.target.value);
                setHasChanges(true);
              }}
              placeholder="Введите текст на русском"
            />
          </div>

          <div className="input-group">
            <div className="language-tabs">
              <span className="language-tab active">HEB</span>
            </div>
            <input
              type="text"
              className="input-field rtl"
              value={heText}
              onChange={(e) => {
                setHeText(e.target.value);
                setHasChanges(true);
              }}
              placeholder="הזן טקסט בעברית"
              dir="rtl"
            />
          </div>

          {/* Additional Text Section */}
          {additionalTexts.length > 0 && (
            <div className="additional-text-section">
              <h2 className="section-header">Дополнительный текст</h2>
              
              <div className="additional-text-list">
                {additionalTexts.map((text, index) => (
                  <div key={index} className="additional-text-item">
                    <span className="text-item-number">{index + 1}</span>
                    
                    <div className="text-item-content">
                      <div className="text-item-inputs">
                        <div className="text-item-field">
                          <div className="language-tabs">
                            <span className="language-tab active">RU</span>
                          </div>
                          <input
                            type="text"
                            className="input-field"
                            value={text.ru}
                            onChange={(e) => handleTextChange(index, 'ru', e.target.value)}
                            placeholder="Текст на русском"
                          />
                        </div>
                        
                        <div className="text-item-field">
                          <div className="language-tabs">
                            <span className="language-tab active">HEB</span>
                          </div>
                          <input
                            type="text"
                            className="input-field rtl"
                            value={text.he}
                            onChange={(e) => handleTextChange(index, 'he', e.target.value)}
                            placeholder="טקסט בעברית"
                            dir="rtl"
                          />
                        </div>
                      </div>
                      
                      <div className="text-item-actions">
                        <button 
                          className="icon-button"
                          onClick={() => handleDeleteOption(index)}
                          title="Удалить"
                        >
                          <span className="delete-icon">🗑</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <button className="add-variant-button" onClick={handleAddOption}>
                Добавить вариант
              </button>
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="bottom-actions">
          <div className="actions-container">
            <div></div>
            <div className="actions-buttons">
              <button className="button button-secondary" onClick={handleBack}>
                Назад
              </button>
              <button 
                className="button button-primary" 
                onClick={handleSave}
                disabled={!hasChanges}
              >
                Сохранить и опубликовать
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MortgageTextEdit;