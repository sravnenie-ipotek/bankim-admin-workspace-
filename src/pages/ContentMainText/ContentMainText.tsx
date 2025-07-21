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
  const [activeLanguage, setActiveLanguage] = useState<Language>('ru');
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
  const breadcrumbPaths = [
    { label: 'Главная', path: '/' },
    { label: 'Управление контентом', path: '/content-management' },
    { label: 'Главная', path: '/content/main' },
    { label: `Редактирование текста: Действие ${textData.actionNumber}`, path: '' }
  ];

  return (
    <div className="content-main-text">
      {/* Navigation */}
      <div className="content-main-text__navigation">
        <Breadcrumb paths={breadcrumbPaths} />
      </div>

      {/* Header */}
      <div className="content-main-text__header">
        <div className="header-left">
          <h1 className="page-title">
            Редактирование текста: Действие {textData.actionNumber}
          </h1>
          <p className="page-subtitle">
            Последнее изменение: {textData.lastModified.toLocaleDateString('ru-RU')} | {textData.lastModified.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>

      {/* Main content layout */}
      <div className="content-main-text__body">
        {/* Left panel - Controls */}
        <div className="text-controls-panel">
          <div className="panel-section">
            <h3 className="section-title">Языковые версии</h3>
            
            {/* Language Tabs */}
            <div className="language-tabs">
              <button 
                className={`lang-tab ${activeLanguage === 'ru' ? 'active' : ''}`}
                onClick={() => setActiveLanguage('ru')}
              >
                RU
              </button>
              <button 
                className={`lang-tab ${activeLanguage === 'he' ? 'active' : ''}`}
                onClick={() => setActiveLanguage('he')}
              >
                HE
              </button>
              <button 
                className={`lang-tab ${activeLanguage === 'en' ? 'active' : ''}`}
                onClick={() => setActiveLanguage('en')}
              >
                EN
              </button>
            </div>

            {/* Text Input */}
            <div className="text-input-section">
              <label className="input-label">Текст ({activeLanguage.toUpperCase()})</label>
              <textarea
                value={textData.textContent[activeLanguage]}
                onChange={(e) => handleTextChange(activeLanguage, e.target.value)}
                className="text-input-area"
                style={{ direction: activeLanguage === 'he' ? 'rtl' : 'ltr' }}
                placeholder={activeLanguage === 'ru' ? 'Введите текст на русском' : 
                           activeLanguage === 'he' ? 'הכנס טקסט בעברית' : 'Enter text in English'}
                rows={4}
              />
            </div>
          </div>

          {/* Typography Controls */}
          <div className="panel-section">
            <h3 className="section-title">Типографика</h3>
            
            <div className="controls-grid">
              <div className="control-group">
                <label className="control-label">Шрифт</label>
                <select 
                  value={textData.styling.font} 
                  onChange={(e) => handleStyleChange('font', e.target.value)}
                  className="control-select"
                >
                  <option value="Arimo">Arimo</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Open Sans">Open Sans</option>
                  <option value="Inter">Inter</option>
                </select>
              </div>

              <div className="control-group">
                <label className="control-label">Размер</label>
                <input 
                  type="number" 
                  value={textData.styling.size} 
                  onChange={(e) => handleStyleChange('size', parseInt(e.target.value))}
                  className="control-input"
                  min="8"
                  max="72"
                />
              </div>

              <div className="control-group">
                <label className="control-label">Цвет</label>
                <input 
                  type="color" 
                  value={textData.styling.color} 
                  onChange={(e) => handleStyleChange('color', e.target.value)}
                  className="control-color"
                />
              </div>

              <div className="control-group">
                <label className="control-label">Насыщенность</label>
                <select 
                  value={textData.styling.weight} 
                  onChange={(e) => handleStyleChange('weight', e.target.value)}
                  className="control-select"
                >
                  <option value="400">Normal</option>
                  <option value="500">Medium</option>
                  <option value="600">Semibold</option>
                  <option value="700">Bold</option>
                </select>
              </div>

              <div className="control-group">
                <label className="control-label">Выравнивание</label>
                <select 
                  value={textData.styling.alignment} 
                  onChange={(e) => handleStyleChange('alignment', e.target.value)}
                  className="control-select"
                >
                  <option value="left">Слева</option>
                  <option value="center">По центру</option>
                  <option value="right">Справа</option>
                  <option value="justify">По ширине</option>
                </select>
              </div>
            </div>
          </div>

          {/* Position Controls */}
          <div className="panel-section">
            <h3 className="section-title">Позиционирование</h3>
            
            <div className="position-controls">
              <div className="control-group">
                <label className="control-label">Позиция X</label>
                <input 
                  type="number" 
                  value={textData.position.x} 
                  onChange={(e) => handlePositionChange('x', parseInt(e.target.value))}
                  className="control-input"
                />
              </div>

              <div className="control-group">
                <label className="control-label">Позиция Y</label>
                <input 
                  type="number" 
                  value={textData.position.y} 
                  onChange={(e) => handlePositionChange('y', parseInt(e.target.value))}
                  className="control-input"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right panel - Preview */}
        <div className="text-preview-panel">
          <h3 className="section-title">Предпросмотр</h3>
          
          <div className="preview-area">
            <div className="preview-content">
              <p 
                className="preview-text"
                style={{
                  fontFamily: textData.styling.font,
                  fontSize: `${textData.styling.size}px`,
                  color: textData.styling.color,
                  fontWeight: textData.styling.weight,
                  textAlign: textData.styling.alignment as any,
                  direction: activeLanguage === 'he' ? 'rtl' : 'ltr',
                  transform: `translate(${textData.position.x}px, ${textData.position.y}px)`
                }}
              >
                {textData.textContent[activeLanguage] || 'Предпросмотр текста'}
              </p>
            </div>
          </div>

          {/* Language Preview Cards */}
          <div className="language-previews">
            {(['ru', 'he', 'en'] as Language[]).map((lang) => (
              <div key={lang} className="language-preview-card">
                <div className="preview-card-header">
                  <h4>{lang.toUpperCase()}</h4>
                </div>
                <div className="preview-card-content">
                  <p 
                    style={{
                      fontFamily: textData.styling.font,
                      fontSize: `${Math.max(textData.styling.size * 0.8, 12)}px`,
                      color: textData.styling.color,
                      fontWeight: textData.styling.weight,
                      textAlign: textData.styling.alignment as any,
                      direction: lang === 'he' ? 'rtl' : 'ltr'
                    }}
                  >
                    {textData.textContent[lang] || `Текст на ${lang}`}
                  </p>
                </div>
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