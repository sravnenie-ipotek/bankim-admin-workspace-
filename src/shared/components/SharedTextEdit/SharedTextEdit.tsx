/**
 * SharedTextEdit Component
 * Reusable text editing component for TYPE TEXT content
 * Based on MortgageTextEdit design that looks good
 * 
 * @version 1.0.0 
 * @since 2025-01-28
 */

import React, { useState, useEffect } from 'react';
import './SharedTextEdit.css';

export interface TextEditData {
  id: string;
  action_number?: number;
  content_key: string;
  component_type: string;
  screen_location: string;
  description: string;
  is_active: boolean;
  translations: {
    ru: string;
    he: string;
    en?: string;
  };
  last_modified: string;
}

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
  isActive?: boolean;
}

export interface SharedTextEditProps {
  /** Content item to edit */
  content: TextEditData;
  /** Breadcrumb navigation items */
  breadcrumbs: BreadcrumbItem[];
  /** Loading state */
  loading?: boolean;
  /** Error message */
  error?: string | null;
  /** Save callback */
  onSave: (data: { ruText: string; heText: string; additionalTexts: Array<{ ru: string; he: string }> }) => void;
  /** Cancel/Back callback */
  onCancel: () => void;
  /** Show additional text section */
  showAdditionalText?: boolean;
  /** Custom page subtitle */
  pageSubtitle?: string;
  /** Saving state */
  saving?: boolean;
}

const SharedTextEdit: React.FC<SharedTextEditProps> = ({
  content,
  breadcrumbs,
  loading = false,
  error = null,
  onSave,
  onCancel,
  showAdditionalText = false,
  pageSubtitle,
  saving = false
}) => {
  const [ruText, setRuText] = useState('');
  const [heText, setHeText] = useState('');
  const [additionalTexts, setAdditionalTexts] = useState<Array<{ ru: string; he: string }>>([]);
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize form data from content
  useEffect(() => {
    if (content) {
      setRuText(content.translations?.ru || '');
      setHeText(content.translations?.he || '');
      setHasChanges(false);
    }
  }, [content]);

  const formatLastModified = (dateString: string | null | undefined): string => {
    if (!dateString) return 'Дата не указана';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Дата не указана';
      
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      
      return `${day}.${month}.${year} | ${hours}:${minutes}`;
    } catch {
      return 'Дата не указана';
    }
  };

  const handleTextChange = (index: number, lang: 'ru' | 'he', value: string) => {
    const newTexts = [...additionalTexts];
    newTexts[index] = { ...newTexts[index], [lang]: value };
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

  const handleSave = () => {
    onSave({
      ruText,
      heText,
      additionalTexts
    });
  };

  if (loading) {
    return (
      <div className="shared-text-edit-loading">
        <div className="loading-spinner"></div>
        <p>Загрузка...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="shared-text-edit-error">
        <p>Ошибка: {error}</p>
        <button onClick={onCancel}>Вернуться назад</button>
      </div>
    );
  }

  return (
    <div className="shared-text-edit">
      <div className="shared-text-edit-main">
        {/* Breadcrumb */}
        <div className="breadcrumb-container">
          {breadcrumbs.map((item, index) => (
            <React.Fragment key={index}>
              <span 
                className={`breadcrumb-item ${item.isActive ? 'active' : ''}`}
                onClick={item.onClick}
              >
                {item.label}
              </span>
              {index < breadcrumbs.length - 1 && <div className="breadcrumb-separator"></div>}
            </React.Fragment>
          ))}
        </div>

        {/* Page Title */}
        <div className="page-title-section">
          <h1 className="page-title">
            {content.action_number ? `Номер действия №${content.action_number} | ` : ''}
            {content.translations.ru || content.description || content.content_key}
          </h1>
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
        {showAdditionalText && additionalTexts.length > 0 && (
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
            <button className="button button-secondary" onClick={onCancel}>
              Назад
            </button>
            <button 
              className="button button-primary" 
              onClick={handleSave}
              disabled={!hasChanges || saving}
            >
              {saving ? 'Сохранение...' : 'Сохранить и опубликовать'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharedTextEdit; 