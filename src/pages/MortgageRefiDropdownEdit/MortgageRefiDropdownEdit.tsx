/**
 * MortgageRefiDropdownEdit Component
 * Edit page for dropdown-type mortgage refinancing content items
 * Based on MortgageDropdownEdit design specification
 * 
 * @version 1.0.0
 * @since 2025-01-20
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { apiService } from '../../services/api';
import { AdminLayout } from '../../components';
import '../MortgageDropdownEdit/MortgageDropdownEdit.css'; // Reuse dropdown edit styles

interface DropdownContent {
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

interface DropdownOption {
  ru: string;
  he: string;
}

const MortgageRefiDropdownEdit: React.FC = () => {
  const { actionId } = useParams<{ actionId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [content, setContent] = useState<DropdownContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Form states
  const [titleRu, setTitleRu] = useState('');
  const [titleHe, setTitleHe] = useState('');
  const [dropdownOptions, setDropdownOptions] = useState<DropdownOption[]>([]);

  useEffect(() => {
    fetchContentData();
  }, [actionId]);

  const fetchContentData = async () => {
    try {
      setLoading(true);
      console.log(`📋 Fetching mortgage-refi dropdown content for action ID: ${actionId}`);
      
      // Fetch the specific content item
      const response = await apiService.request(`/api/content/item/${actionId}`, 'GET');
      
      if (response.success && response.data) {
        const item = response.data;
        setContent({
          id: item.id,
          content_key: item.content_key || '',
          component_type: item.component_type || 'dropdown',
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
        
        // Initialize dropdown options based on the content
        await initializeDropdownOptions(item);
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

  const initializeDropdownOptions = async (item: any) => {
    try {
      // Use the generic API function to fetch dropdown options
      console.log(`📋 Fetching dropdown options for refinancing content key: ${item.content_key}`);
      
      const response = await apiService.getMortgageRefiDropdownOptions(item.content_key);
      
      if (response.success && response.data) {
        const options = response.data.map((optionItem: any) => ({
          ru: optionItem.translations?.ru || '',
          he: optionItem.translations?.he || ''
        }));
        
        console.log(`✅ Found ${options.length} dropdown options via generic API`);
        setDropdownOptions(options.length > 0 ? options : [
          { ru: '', he: '' } // Start with at least one empty option
        ]);
      } else {
        console.log('⚠️ No dropdown options found, initializing with empty option');
        setDropdownOptions([{ ru: '', he: '' }]);
      }
    } catch (err) {
      console.error('❌ Error fetching dropdown options:', err);
      // Initialize with empty options on error
      setDropdownOptions([{ ru: '', he: '' }]);
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

  const handleSave = async () => {
    try {
      const updateData = {
        translations: {
          ru: titleRu,
          he: titleHe,
          en: content?.translations.en || ''
        },
        dropdown_options: dropdownOptions
      };
      
      const response = await apiService.request(`/api/content/mortgage-refi/${actionId}`, 'PUT', updateData);
      
      if (response.success) {
        setHasChanges(false);
        // Navigate back after successful save
        handleBack();
      } else {
        setError('Ошибка при сохранении');
      }
    } catch (err) {
      console.error('❌ Error saving mortgage-refi content:', err);
      setError('Ошибка при сохранении данных рефинансирования');
    }
  };

  const handleOptionChange = (index: number, field: 'ru' | 'he', value: string) => {
    const newOptions = [...dropdownOptions];
    newOptions[index][field] = value;
    setDropdownOptions(newOptions);
    setHasChanges(true);
  };

  const handleAddOption = () => {
    setDropdownOptions([...dropdownOptions, { ru: '', he: '' }]);
    setHasChanges(true);
  };

  const handleDeleteOption = (index: number) => {
    const newOptions = dropdownOptions.filter((_, i) => i !== index);
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

  if (loading) {
    return (
      <AdminLayout title="Редактирование дропдауна" activeMenuItem="content-mortgage-refi">
        <div className="dropdown-edit-loading">
          <div className="loading-spinner"></div>
          <p>Загрузка данных рефинансирования...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error || !content) {
    return (
      <AdminLayout title="Редактирование дропдауна" activeMenuItem="content-mortgage-refi">
        <div className="dropdown-edit-error">
          <p>Ошибка: {error || 'Данные не найдены'}</p>
          <button onClick={handleBack}>Вернуться назад</button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Редактирование дропдауна" activeMenuItem="content-mortgage-refi">
      <div className="dropdown-edit-page">
        {/* Breadcrumb */}
        <div className="breadcrumb-container">
          <span className="breadcrumb-item" onClick={() => navigate('/content')}>Контент сайта</span>
          <div className="breadcrumb-separator"></div>
          <span className="breadcrumb-item" onClick={() => navigate('/content/mortgage-refi')}>Рефинансирование ипотеки</span>
          <div className="breadcrumb-separator"></div>
          <span className="breadcrumb-item" onClick={handleBack}>Список действий</span>
          <div className="breadcrumb-separator"></div>
          <span className="breadcrumb-item active">Редактирование дропдауна</span>
        </div>

        {/* Main Content */}
        <div className="dropdown-edit-main">
          <div className="page-header">
            <h1 className="page-title">Редактирование дропдауна рефинансирования</h1>
            <p className="page-subtitle">
              {content.action_number && `Действие ${content.action_number}: `}
              {content.content_key} ({content.component_type})
            </p>
          </div>

          {/* Form */}
          <div className="dropdown-edit-form">
            <div className="form-section">
              <h2 className="section-title">Заголовок дропдауна</h2>
              
              <div className="form-group">
                <label htmlFor="title-ru" className="form-label">
                  Русский <span className="required">*</span>
                </label>
                <input
                  id="title-ru"
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

              <div className="form-group">
                <label htmlFor="title-he" className="form-label">
                  עברית <span className="required">*</span>
                </label>
                <input
                  id="title-he"
                  type="text"
                  value={titleHe}
                  onChange={(e) => {
                    setTitleHe(e.target.value);
                    setHasChanges(true);
                  }}
                  className="form-input"
                  placeholder="הזן כותרת בעברית"
                  dir="rtl"
                />
              </div>
            </div>

            {/* Dropdown Options Section */}
            <div className="form-section">
              <div className="section-header">
                <h2 className="section-title">Опции дропдауна</h2>
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="btn btn-outline"
                >
                  + Добавить опцию
                </button>
              </div>

              <div className="options-list">
                {dropdownOptions.map((option, index) => (
                  <div key={index} className="option-item">
                    <div className="option-header">
                      <h3 className="option-title">Опция {index + 1}</h3>
                      <button
                        type="button"
                        onClick={() => handleDeleteOption(index)}
                        className="btn btn-danger-outline"
                        disabled={dropdownOptions.length <= 1}
                      >
                        Удалить
                      </button>
                    </div>
                    
                    <div className="option-fields">
                      <div className="form-group">
                        <label className="form-label">Русский</label>
                        <input
                          type="text"
                          value={option.ru}
                          onChange={(e) => handleOptionChange(index, 'ru', e.target.value)}
                          className="form-input"
                          placeholder="Введите опцию на русском языке"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">עברית</label>
                        <input
                          type="text"
                          value={option.he}
                          onChange={(e) => handleOptionChange(index, 'he', e.target.value)}
                          className="form-input"
                          placeholder="הזן אפשרות בעברית"
                          dir="rtl"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

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

export default MortgageRefiDropdownEdit; 