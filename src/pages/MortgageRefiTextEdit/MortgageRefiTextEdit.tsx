/**
 * MortgageRefiTextEdit Component
 * Edit page for text-type mortgage refinancing content items
 * Based on MortgageTextEdit design specification
 * 
 * @version 1.0.0
 * @since 2025-01-20
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { apiService } from '../../services/api';
import { AdminLayout } from '../../components';
import '../MortgageTextEdit/MortgageTextEdit.css'; // Reuse text edit styles

interface TextContent {
  id: string;
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
  action_number?: number;
}

const MortgageRefiTextEdit: React.FC = () => {
  const { actionId } = useParams<{ actionId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [content, setContent] = useState<TextContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Form states
  const [titleRu, setTitleRu] = useState('');
  const [titleHe, setTitleHe] = useState('');
  const [additionalTexts, setAdditionalTexts] = useState<Array<{ ru: string; he: string }>>([]);

  useEffect(() => {
    fetchContentData();
  }, [actionId]);

  const fetchContentData = async () => {
    try {
      setLoading(true);
      console.log(`📖 Fetching mortgage-refi text content for action ID: ${actionId}`);
      
      // Fetch the specific content item
      const response = await apiService.request(`/api/content/item/${actionId}`, 'GET');
      
      if (response.success && response.data) {
        const item = response.data;
        setContent({
          id: item.id,
          content_key: item.content_key || '',
          component_type: item.component_type || 'text',
          category: item.category || '',
          screen_location: item.screen_location || '',
          description: item.description || '',
          is_active: item.is_active !== false,
          translations: {
            ru: item.translations?.ru || '',
            he: item.translations?.he || '',
            en: item.translations?.en || ''
          },
          last_modified: item.updated_at || new Date().toISOString(),
          action_number: item.action_number
        });
        
        setTitleRu(item.translations?.ru || '');
        setTitleHe(item.translations?.he || '');
        
        // Initialize additional texts based on the content
        await initializeAdditionalTexts(item);
      } else {
        setError('Не удалось загрузить данные рефинансирования');
      }
    } catch (err) {
      console.error('❌ Error fetching mortgage-refi content data:', err);
      setError('Ошибка загрузки данных рефинансирования');
    } finally {
      setLoading(false);
    }
  };

  const initializeAdditionalTexts = async (item: any) => {
    try {
      // Fetch related content based on the item's properties
      const baseKey = item.content_key;
      console.log(`📋 Fetching additional texts for refinancing content key: ${baseKey}`);
      
      // Fetch all content items for the same screen location  
      const response = await apiService.getContentByContentType('mortgage-refi');
      
      if (response.success && response.data) {
        const contentItems = response.data.mortgage_content || [];
        
        // Find related content items based on content key patterns
        const relatedItems = contentItems.filter((contentItem: any) => {
          const itemKey = contentItem.content_key || '';
          
          // Find items with same base key pattern
          if (baseKey.includes('property_ownership')) {
            return itemKey.includes('property_ownership') && 
                   (contentItem.component_type === 'option' || 
                    contentItem.component_type === 'help_text' ||
                    contentItem.component_type === 'placeholder');
          }
          
          // Find items with similar key patterns for other content types
          const keyParts = baseKey.split('.');
          const lastPart = keyParts[keyParts.length - 1];
          
          return itemKey.includes(lastPart) && 
                 itemKey !== baseKey && // Don't include the item itself
                 (contentItem.component_type === 'option' || 
                  contentItem.component_type === 'help_text' ||
                  contentItem.component_type === 'text' ||
                  contentItem.component_type === 'placeholder');
        });
        
        // Convert to additional text format
        const additionalTexts = relatedItems
          .slice(0, 8) // Limit to 8 items
          .map((relatedItem: any) => ({
            ru: relatedItem.translations?.ru || '',
            he: relatedItem.translations?.he || ''
          }));
        
        console.log(`✅ Found ${additionalTexts.length} related items for ${baseKey}`);
        
        // If no related items found, start with empty entries
        if (additionalTexts.length === 0) {
          setAdditionalTexts([{ ru: '', he: '' }]);
        } else {
          setAdditionalTexts(additionalTexts);
        }
      } else {
        console.log('❌ Failed to fetch mortgage-refi content for additional texts');
        setAdditionalTexts([{ ru: '', he: '' }]);
      }
    } catch (err) {
      console.error('❌ Error fetching additional texts:', err);
      setAdditionalTexts([{ ru: '', he: '' }]);
    }
  };

  const handleSave = async () => {
    if (!content) return;
    
    try {
      setLoading(true);
      console.log('💾 Saving mortgage-refi text changes...');
      
      const updateData = {
        translations: {
          ru: titleRu,
          he: titleHe,
          en: content.translations.en // Keep existing English
        }
      };
      
      const response = await apiService.request(`/api/content/mortgage-refi/${actionId}`, 'PUT', updateData);
      
      if (response.success) {
        console.log('✅ Mortgage-refi text saved successfully');
        setHasChanges(false);
        handleBack();
      } else {
        setError('Ошибка сохранения изменений');
      }
    } catch (err) {
      console.error('❌ Error saving mortgage-refi text:', err);
      setError('Ошибка сохранения изменений');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    const returnPath = location.state?.returnPath || '/content/mortgage-refi';
    navigate(returnPath, {
      state: {
        fromPage: location.state?.fromPage || 1,
        searchTerm: location.state?.searchTerm || ''
      }
    });
  };

  const handleInputChange = (setter: (value: string) => void, value: string) => {
    setter(value);
    setHasChanges(true);
  };

  if (loading) {
    return (
      <AdminLayout title="Редактирование текста" activeMenuItem="content-mortgage-refi">
        <div className="text-edit-loading">
          <div className="loading-spinner"></div>
          <p>Загрузка данных рефинансирования...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Редактирование текста" activeMenuItem="content-mortgage-refi">
        <div className="text-edit-error">
          <p>Ошибка: {error}</p>
          <button onClick={handleBack}>Вернуться назад</button>
        </div>
      </AdminLayout>
    );
  }

  if (!content) {
    return (
      <AdminLayout title="Редактирование текста" activeMenuItem="content-mortgage-refi">
        <div className="text-edit-error">
          <p>Данные не найдены</p>
          <button onClick={handleBack}>Вернуться назад</button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Редактирование текста" activeMenuItem="content-mortgage-refi">
      <div className="text-edit-page">
        {/* Breadcrumb */}
        <div className="breadcrumb-container">
          <span className="breadcrumb-item" onClick={() => navigate('/content')}>Контент сайта</span>
          <div className="breadcrumb-separator"></div>
          <span className="breadcrumb-item" onClick={() => navigate('/content/mortgage-refi')}>Рефинансирование ипотеки</span>
          <div className="breadcrumb-separator"></div>
          <span className="breadcrumb-item" onClick={handleBack}>Список действий</span>
          <div className="breadcrumb-separator"></div>
          <span className="breadcrumb-item active">Редактирование</span>
        </div>

        {/* Main Content */}
        <div className="text-edit-main">
          <div className="page-header">
            <h1 className="page-title">Редактирование текста рефинансирования</h1>
            <p className="page-subtitle">
              {content.action_number && `Действие ${content.action_number}: `}
              {content.content_key} ({content.component_type})
            </p>
          </div>

          {/* Form */}
          <div className="text-edit-form">
            <div className="form-section">
              <h2 className="section-title">Основной текст</h2>
              
              <div className="form-group">
                <label htmlFor="title-ru" className="form-label">
                  Русский <span className="required">*</span>
                </label>
                <textarea
                  id="title-ru"
                  value={titleRu}
                  onChange={(e) => handleInputChange(setTitleRu, e.target.value)}
                  className="form-textarea"
                  rows={3}
                  placeholder="Введите текст на русском языке"
                />
              </div>

              <div className="form-group">
                <label htmlFor="title-he" className="form-label">
                  עברית <span className="required">*</span>
                </label>
                <textarea
                  id="title-he"
                  value={titleHe}
                  onChange={(e) => handleInputChange(setTitleHe, e.target.value)}
                  className="form-textarea"
                  rows={3}
                  placeholder="הזן טקסט בעברית"
                  dir="rtl"
                />
              </div>
            </div>

            {/* Additional Texts Section */}
            {additionalTexts.length > 0 && (
              <div className="form-section">
                <h2 className="section-title">Дополнительные тексты</h2>
                {additionalTexts.map((text, index) => (
                  <div key={index} className="additional-text-group">
                    <h3 className="subsection-title">Текст {index + 1}</h3>
                    
                    <div className="form-group">
                      <label className="form-label">Русский</label>
                      <textarea
                        value={text.ru}
                        onChange={(e) => {
                          const newTexts = [...additionalTexts];
                          newTexts[index].ru = e.target.value;
                          setAdditionalTexts(newTexts);
                          setHasChanges(true);
                        }}
                        className="form-textarea"
                        rows={2}
                        placeholder="Введите дополнительный текст на русском языке"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">עברית</label>
                      <textarea
                        value={text.he}
                        onChange={(e) => {
                          const newTexts = [...additionalTexts];
                          newTexts[index].he = e.target.value;
                          setAdditionalTexts(newTexts);
                          setHasChanges(true);
                        }}
                        className="form-textarea"
                        rows={2}
                        placeholder="הזן טקסט נוסף בעברית"
                        dir="rtl"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Form Actions */}
            <div className="form-actions">
              <button 
                type="button" 
                onClick={handleBack}
                className="btn btn-secondary"
              >
                Отменить
              </button>
              <button 
                type="button" 
                onClick={handleSave}
                className="btn btn-primary"
                disabled={!hasChanges || loading}
              >
                {loading ? 'Сохранение...' : 'Сохранить изменения'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default MortgageRefiTextEdit; 