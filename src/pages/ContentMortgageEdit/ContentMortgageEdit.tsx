import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import { ContentListItem } from '../ContentListBase/types';
import AdminLayout from '../../components/AdminLayout/AdminLayout';
import './ContentMortgageEdit.css';

interface DropdownOption {
  id: string;
  order: number;
  titleRu: string;
  titleHe: string;
}

interface MortgageContentItem extends ContentListItem {
  contentKey?: string;
}

const ContentMortgageEdit: React.FC = () => {
  const { itemId } = useParams<{ itemId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [contentItem, setContentItem] = useState<MortgageContentItem | null>(null);
  const [dropdownOptions, setDropdownOptions] = useState<DropdownOption[]>([]);
  const [titleRu, setTitleRu] = useState('');
  const [titleHe, setTitleHe] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchContentItem();
  }, [itemId]);

  const fetchContentItem = async () => {
    try {
      setLoading(true);
      // Fetch the specific content item
      const response = await apiService.getContentByContentType('mortgage');
      
      if (response.success && response.data) {
        const item = response.data.find(item => item.id === itemId);
        if (item) {
          setContentItem(item);
          setTitleRu(item.title || '');
          
          // If it's a dropdown, fetch its options
          if (item.contentType === 'dropdown') {
            fetchDropdownOptions(item);
          }
        } else {
          setError('Content item not found');
        }
      }
    } catch (err) {
      console.error('Error fetching content:', err);
      setError('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownOptions = async (item: MortgageContentItem) => {
    try {
      // For mortgage content, we need to use the item's ID to fetch options
      // The API will handle converting ID to content_key if needed
      const response = await apiService.getMortgageDropdownOptions(item.id);
      
      console.log('Fetching options for item:', item.id, 'Response:', response);
      
      if (response.success && response.data && response.data.length > 0) {
        setDropdownOptions(response.data);
      } else {
        // No options found - this dropdown might not have options yet
        setDropdownOptions([]);
      }
    } catch (err) {
      console.error('Error fetching dropdown options:', err);
      setDropdownOptions([]);
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
      // Reorder remaining options
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

    // Update order numbers
    const reordered = newOptions.map((opt, idx) => ({
      ...opt,
      order: idx + 1
    }));
    setDropdownOptions(reordered);
  };

  const handleSave = async () => {
    try {
      // TODO: Implement save functionality
      console.log('Saving:', {
        titleRu,
        titleHe,
        options: dropdownOptions
      });
      alert('Сохранено успешно!');
    } catch (err) {
      console.error('Error saving:', err);
      alert('Ошибка при сохранении');
    }
  };

  const handleBack = () => {
    navigate('/content/mortgage');
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="mortgage-edit-container">
          <div className="loading-state">Загрузка...</div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="mortgage-edit-container">
          <div className="error-state">{error}</div>
        </div>
      </AdminLayout>
    );
  }

  const isDropdown = contentItem?.contentType === 'dropdown';

  return (
    <AdminLayout>
      <div className="mortgage-edit-container">
        {/* Breadcrumb */}
        <div className="breadcrumb-container">
          <span className="breadcrumb-item">Контент сайта</span>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-item">Рассчитать ипотеку</span>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-item active">Страница №{contentItem?.pageNumber}</span>
        </div>

        {/* Header */}
        <div className="page-header-edit">
          <h1 className="page-title-edit">
            Номер страницы №{contentItem?.pageNumber} | {contentItem?.title}
          </h1>
          <span className="page-subtitle">Mortgage_page</span>
        </div>

        {/* Last Edit Info */}
        <div className="last-edit-info">
          <span className="last-edit-label">Последнее редактирование</span>
          <span className="last-edit-date">
            {new Date(contentItem?.lastModified || '').toLocaleDateString('ru-RU')} | {new Date(contentItem?.lastModified || '').toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {/* Title Section */}
        <div className="section-container">
          <h2 className="section-title">Заголовки действий</h2>
          
          <div className="input-group">
            <label className="input-label">RU</label>
            <input
              type="text"
              className="text-input"
              value={titleRu}
              onChange={(e) => setTitleRu(e.target.value)}
              placeholder="Введите заголовок на русском"
            />
          </div>

          <div className="input-group">
            <label className="input-label">HEB</label>
            <input
              type="text"
              className="text-input rtl"
              value={titleHe}
              onChange={(e) => setTitleHe(e.target.value)}
              placeholder="הזן כותרת בעברית"
              dir="rtl"
            />
          </div>
        </div>

        {/* Dropdown Options Section (only for dropdown type) */}
        {isDropdown && (
          <div className="section-container">
            <div className="section-header">
              <h2 className="section-title">Опции ответов</h2>
              <button className="add-option-btn" onClick={handleAddOption}>
                <span className="add-icon">+</span>
                <span>Добавить вариант</span>
              </button>
            </div>

            <div className="options-list">
              {dropdownOptions.map((option, index) => (
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
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="action-buttons">
          <button className="btn-secondary" onClick={handleBack}>
            Назад
          </button>
          <button className="btn-primary" onClick={handleSave}>
            Сохранить и опубликовать
          </button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ContentMortgageEdit;