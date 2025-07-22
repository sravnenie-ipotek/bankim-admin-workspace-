/**
 * ContentMainText Component
 * Detail page for editing text elements (Text editing flow from Figma)
 * Following master-detail pattern from ContentMain (Page 4)
 * 
 * Business Logic:
 * - Receives text element ID from ContentMain page
 * - Allows editing text content with multilingual support (RU/HEB/EN)
 * - Supports typography controls (font, size, color, weight)
 * - Position and alignment controls
 * - Real-time preview functionality
 * 
 * Navigation Flow:
 * ContentMain (Page 4) → ContentMainText (Text Flow) → ContentMain (updated)
 * 
 * @version 1.0.0
 * @since 2025-01-20
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Breadcrumb from '../Chat/ContentManagement/components/Breadcrumb/Breadcrumb';
import { useNavigation } from '../../contexts/NavigationContext';
import './ContentMainText.css';
import { apiService, TextContent } from '../../services/api';

type Language = 'ru' | 'he' | 'en';

const ContentMainText: React.FC = () => {
  const { actionId } = useParams<{ actionId: string }>();
  const navigate = useNavigate();
  const { setCurrentSubmenu } = useNavigation();
  
  // States
  const [isLoading, setIsLoading] = useState(false);
  const [textData, setTextData] = useState<TextContent | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Set navigation context
  useEffect(() => {
    setCurrentSubmenu('content-main', 'Главная');
  }, [setCurrentSubmenu]);

  // Fetch real text data
  useEffect(() => {
    const fetchTextContent = async () => {
      if (!actionId) return;
      setIsLoading(true);
      
      try {
        const resp = await apiService.getTextContent(actionId);
        if (resp.success && resp.data) {
          setTextData(resp.data);
        } else {
          console.error('Failed to load text content', resp.error);
        }
      } catch (error) {
        console.error('Error fetching text content:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTextContent();
  }, [actionId]);

  // Handlers
  const handleBack = () => {
    if (hasChanges) {
      const confirm = window.confirm('У вас есть несохраненные изменения. Вы уверены, что хотите выйти?');
      if (!confirm) return;
    }
    navigate('/content/main');
  };

  const handleSaveAndPublish = async () => {
    if (!textData || !actionId) return;
    
    setIsSaving(true);
    try {
      const resp = await apiService.updateTextContent(actionId, textData);
      if (resp.success) {
        console.log('Text content saved successfully');
        setHasChanges(false);
        navigate('/content/main');
      } else {
        console.error('Failed to save text content:', resp.error);
        alert('Ошибка при сохранении. Попробуйте снова.');
      }
    } catch (error) {
      console.error('Error saving text content:', error);
      alert('Ошибка при сохранении. Попробуйте снова.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTextChange = (language: Language, value: string) => {
    if (!textData) return;
    
    setTextData({
      ...textData,
      textContent: {
        ...textData.textContent,
        [language]: value
      }
    });
    setHasChanges(true);
  };

  const handleAdditionalTextChange = (itemId: string, language: Language, value: string) => {
    if (!textData || !textData.additionalText) return;
    
    setTextData({
      ...textData,
      additionalText: textData.additionalText.map(item => 
        item.id === itemId 
          ? {
              ...item,
              translations: {
                ...item.translations,
                [language]: value
              }
            }
          : item
      )
    });
    setHasChanges(true);
  };

  const handleStyleChange = (styleKey: string, value: any) => {
    if (!textData) return;
    
    setTextData({
      ...textData,
      styling: {
        ...textData.styling,
        [styleKey]: value
      }
    });
    setHasChanges(true);
  };

  const handlePositionChange = (axis: 'x' | 'y', value: number) => {
    if (!textData) return;
    
    setTextData({
      ...textData,
      position: {
        ...textData.position,
        [axis]: value
      }
    });
    setHasChanges(true);
  };

  if (isLoading) {
    return (
      <div className="content-main-text loading">
        <div className="loading-spinner"></div>
        <p>Загрузка текстового контента...</p>
      </div>
    );
  }

  if (!textData) {
    return (
      <div className="content-main-text error">
        <p>Текстовый контент не найден</p>
        <button onClick={handleBack}>Вернуться назад</button>
      </div>
    );
  }

  // Breadcrumb paths for navigation
  const breadcrumbItems = [
    { label: 'Контент сайта', href: '/content-management' },
    { label: 'Главная', href: '/content/main' },
    { label: `Редактирование текста: Действие ${textData.actionNumber}`, isActive: true }
  ];

  return (
    <div className="content-main-text">
      {/* Navigation */}
      <div className="content-main-text__navigation">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      {/* Header */}
      <div className="content-main-text__header">
        <div className="header-left">
          <h1 className="page-title">
            Редактирование текста: Действие {textData.actionNumber}
          </h1>
          <p className="page-subtitle">
            Последнее изменение: {(() => {
              try {
                const date = new Date(textData.lastModified);
                return date.toLocaleDateString('ru-RU') + ' | ' + date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
              } catch (error) {
                return 'Дата недоступна';
              }
            })()}
          </p>
        </div>
      </div>

      {/* Main content layout following Figma structure */}
      <div className="content-main-text__body">
        {/* Text Content Sections */}
        
        {/* Section 1: Заголовки действия */}
        <div className="text-section">
          <h2 className="section-title">Заголовки действия</h2>
          <div className="language-inputs-row">
            <div className="language-input-group">
              <label className="input-label">RU</label>
              <div className="input-field">
                <input
                  type="text"
                  value={textData.textContent.ru}
                  onChange={(e) => handleTextChange('ru', e.target.value)}
                  className="text-input"
                  placeholder="Основой источник дохода"
                />
              </div>
            </div>
            
            <div className="language-input-group">
              <label className="input-label">HEB</label>
              <div className="input-field">
                <input
                  type="text"
                  value={textData.textContent.he}
                  onChange={(e) => handleTextChange('he', e.target.value)}
                  className="text-input heb-input"
                  placeholder="מקור הכנסה עיקרי"
                  dir="rtl"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Дополнительный текст */}
        <div className="text-section">
          <h2 className="section-title">Дополнительный текст</h2>
          
          <div className="additional-text-items">
            {textData.additionalText && textData.additionalText.map((item, index) => (
              <div key={item.id} className="text-item">
                <div className="item-number">{index + 1}</div>
                <div className="language-inputs-row">
                  <div className="language-input-group">
                    <label className="input-label">RU</label>
                    <div className="input-field">
                      <input
                        type="text"
                        value={item.translations.ru}
                        onChange={(e) => handleAdditionalTextChange(item.id, 'ru', e.target.value)}
                        className="text-input"
                        placeholder="Сотрудник"
                      />
                    </div>
                  </div>
                  
                  <div className="language-input-group">
                    <label className="input-label">HEB</label>
                    <div className="input-field">
                      <input
                        type="text"
                        value={item.translations.he}
                        onChange={(e) => handleAdditionalTextChange(item.id, 'he', e.target.value)}
                        className="text-input heb-input"
                        placeholder="עוֹבֵד"
                        dir="rtl"
                      />
                    </div>
                  </div>
                </div>
                <button className="edit-item-btn">
                  <span className="edit-icon">✏️</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="content-main-text__actions">
        <button 
          className="back-button" 
          onClick={handleBack}
          disabled={isSaving}
        >
          Назад
        </button>
        <button 
          className="save-publish-button" 
          onClick={handleSaveAndPublish}
          disabled={!hasChanges || isSaving}
        >
          {isSaving ? 'Сохранение...' : 'Сохранить и опубликовать'}
        </button>
      </div>
    </div>
  );
};

export default ContentMainText; 