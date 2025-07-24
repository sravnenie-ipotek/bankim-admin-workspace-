import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import './ContentMortgageEdit.css';

interface MortgageItem {
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
}

const ContentMortgageEdit: React.FC = () => {
  const { itemId } = useParams<{ itemId: string }>();
  const navigate = useNavigate();
  
  const [mortgageItem, setMortgageItem] = useState<MortgageItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Form states
  const [translations, setTranslations] = useState({
    ru: '',
    he: '',
    en: ''
  });

  useEffect(() => {
    fetchMortgageItem();
  }, [itemId]);

  const fetchMortgageItem = async () => {
    if (!itemId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all mortgage items and find the one we need
      const response = await apiService.getMortgageContent();
      
      if (response.success && response.data?.mortgage_content) {
        const item = response.data.mortgage_content.find((i: any) => i.id === itemId);
        
        if (item) {
          setMortgageItem(item);
          setTranslations({
            ru: item.translations.ru || '',
            he: item.translations.he || '',
            en: item.translations.en || ''
          });
        } else {
          setError('Элемент не найден');
        }
      } else {
        setError('Не удалось загрузить данные');
      }
    } catch (err) {
      console.error('Error fetching mortgage item:', err);
      setError('Ошибка при загрузке данных');
    } finally {
      setLoading(false);
    }
  };

  const handleTranslationChange = (lang: 'ru' | 'he' | 'en', value: string) => {
    setTranslations(prev => ({
      ...prev,
      [lang]: value
    }));
  };

  const handleSave = async () => {
    if (!mortgageItem) return;
    
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);
      
      // Save each translation
      const promises = Object.entries(translations).map(([lang, value]) => 
        apiService.updateContentTranslation(mortgageItem.id, lang, value)
      );
      
      const results = await Promise.all(promises);
      
      // Check if all saves were successful
      const allSuccessful = results.every(result => result.success);
      
      if (allSuccessful) {
        setSuccessMessage('Изменения успешно сохранены');
        
        // Clear the cache to ensure fresh data
        apiService.clearContentCache();
        
        // Refresh the item data
        await fetchMortgageItem();
        
        // Navigate back after a short delay
        setTimeout(() => {
          navigate('/content/mortgage');
        }, 1500);
      } else {
        setError('Некоторые изменения не удалось сохранить');
      }
    } catch (err) {
      console.error('Error saving translations:', err);
      setError('Ошибка при сохранении изменений');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/content/mortgage');
  };

  const getComponentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'text': 'Текст',
      'label': 'Метка',
      'button': 'Кнопка',
      'placeholder': 'Плейсхолдер',
      'option': 'Опция',
      'input': 'Поле ввода',
      'dropdown': 'Выпадающий список'
    };
    return labels[type] || type;
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      'form': 'Форма',
      'header': 'Заголовок',
      'progress': 'Прогресс',
      'test': 'Тест'
    };
    return labels[category] || category;
  };

  if (loading) {
    return (
      <div className="mortgage-edit-container">
        <div className="loading-state">Загрузка...</div>
      </div>
    );
  }

  if (error && !mortgageItem) {
    return (
      <div className="mortgage-edit-container">
        <div className="error-state">
          <p>{error}</p>
          <button onClick={handleCancel} className="btn-secondary">
            Вернуться к списку
          </button>
        </div>
      </div>
    );
  }

  if (!mortgageItem) {
    return (
      <div className="mortgage-edit-container">
        <div className="error-state">Элемент не найден</div>
      </div>
    );
  }

  return (
    <div className="mortgage-edit-container">
      {/* Header */}
      <div className="edit-header">
        <h1>Редактирование контента ипотеки</h1>
        <div className="breadcrumb">
          <span onClick={() => navigate('/content/mortgage')} className="breadcrumb-link">
            Рассчитать ипотеку
          </span>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-current">Редактирование</span>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="message message-error">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="message message-success">
          {successMessage}
        </div>
      )}

      {/* Item Info */}
      <div className="item-info">
        <div className="info-grid">
          <div className="info-item">
            <label>Ключ контента:</label>
            <span>{mortgageItem.content_key}</span>
          </div>
          <div className="info-item">
            <label>Тип компонента:</label>
            <span className="component-type">{getComponentTypeLabel(mortgageItem.component_type)}</span>
          </div>
          <div className="info-item">
            <label>Категория:</label>
            <span>{getCategoryLabel(mortgageItem.category)}</span>
          </div>
          <div className="info-item">
            <label>Описание:</label>
            <span>{mortgageItem.description}</span>
          </div>
          <div className="info-item">
            <label>Последнее изменение:</label>
            <span>
              {new Date(mortgageItem.last_modified).toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
          <div className="info-item">
            <label>Статус:</label>
            <span className={`status ${mortgageItem.is_active ? 'active' : 'inactive'}`}>
              {mortgageItem.is_active ? 'Активен' : 'Неактивен'}
            </span>
          </div>
        </div>
      </div>

      {/* Translation Form */}
      <div className="translation-form">
        <h2>Переводы</h2>
        
        <div className="translation-grid">
          {/* Russian */}
          <div className="translation-item">
            <div className="translation-header">
              <span className="language-flag">🇷🇺</span>
              <label>Русский</label>
            </div>
            <textarea
              value={translations.ru}
              onChange={(e) => handleTranslationChange('ru', e.target.value)}
              placeholder="Введите текст на русском"
              className="translation-input"
              rows={3}
            />
          </div>

          {/* Hebrew */}
          <div className="translation-item">
            <div className="translation-header">
              <span className="language-flag">🇮🇱</span>
              <label>Иврит</label>
            </div>
            <textarea
              value={translations.he}
              onChange={(e) => handleTranslationChange('he', e.target.value)}
              placeholder="הזן טקסט בעברית"
              className="translation-input"
              dir="rtl"
              rows={3}
            />
          </div>

          {/* English */}
          <div className="translation-item">
            <div className="translation-header">
              <span className="language-flag">🇬🇧</span>
              <label>Английский</label>
            </div>
            <textarea
              value={translations.en}
              onChange={(e) => handleTranslationChange('en', e.target.value)}
              placeholder="Enter text in English"
              className="translation-input"
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="edit-actions">
        <button 
          onClick={handleCancel} 
          className="btn-secondary"
          disabled={saving}
        >
          Отмена
        </button>
        <button 
          onClick={handleSave} 
          className="btn-primary"
          disabled={saving || (!translations.ru && !translations.he && !translations.en)}
        >
          {saving ? 'Сохранение...' : 'Сохранить изменения'}
        </button>
      </div>
    </div>
  );
};

export default ContentMortgageEdit;