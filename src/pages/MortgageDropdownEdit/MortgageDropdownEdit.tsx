/**
 * MortgageDropdownEdit Component
 * Exact implementation matching editDropDownDrillUI.md specification
 * 
 * @version 3.0.0
 * @since 2025-01-26
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './MortgageDropdownEdit.css';
import { AdminLayout } from '../../components';

interface DropdownOption {
  ru: string;
  he: string;
}

const MortgageDropdownEdit: React.FC = () => {
  const navigate = useNavigate();
  
  // Form states matching the design specification
  const [titleRu, setTitleRu] = useState('Основой источник дохода');
  const [titleHe, setTitleHe] = useState('מקור הכנסה עיקרי');
  const [options, setOptions] = useState<DropdownOption[]>([
    { ru: 'Сотрудник', he: 'עובד' },
    { ru: 'Сотрудник', he: 'עובד' }, 
    { ru: 'Сотрудник', he: 'עובד' },
    { ru: 'Сотрудник', he: 'עובד' },
    { ru: 'Сотрудник', he: 'עובד' },
    { ru: 'Сотрудник', he: 'עובד' },
    { ru: 'Сотрудник', he: 'עובד' },
    { ru: 'Сотрудник', he: 'עובד' }
  ]);

  const handleBack = () => {
    navigate('/content/mortgage');
  };

  const handleSave = () => {
    console.log('Saving data...', { titleRu, titleHe, options });
  };

  const handleOptionChange = (index: number, field: 'ru' | 'he', value: string) => {
    const newOptions = [...options];
    newOptions[index][field] = value;
    setOptions(newOptions);
  };

  const handleAddOption = () => {
    setOptions([...options, { ru: 'Сотрудник', he: 'עובד' }]);
  };

  const handleDeleteOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
  };

  return (
    <AdminLayout>
      <div className="dropdown-edit-page">
        {/* Main Content Area */}
        <div className="dropdown-edit-main">
          {/* Breadcrumb */}
          <div className="breadcrumb">
            <div className="breadcrumb-item" onClick={() => navigate('/content/mortgage')}>
              Контент сайта
            </div>
            <div className="breadcrumb-arrow"></div>
            <div className="breadcrumb-item breadcrumb-active" onClick={() => navigate('/content/mortgage')}>
              Главная страница Страница №1
            </div>
            <div className="breadcrumb-arrow"></div>
            <div className="breadcrumb-item breadcrumb-active">
              Действие №3
            </div>
          </div>

          {/* Page Title */}
          <div className="page-title-section">
            <div className="page-title-content">
              <div className="page-title-row">
                <div className="page-title">
                  Номер действия №3 | Основной источник дохода
                </div>
                <div className="page-subtitle">
                  <div>Home_page</div>
                </div>
              </div>
            </div>
          </div>

          {/* Last Modified Card */}
          <div className="last-modified-card">
            <div className="last-modified-content">
              <div className="last-modified-label">Последнее редактирование</div>
              <div className="last-modified-date">01.08.2023 | 12:03</div>
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
                    <div className="drag-icon"></div>
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
            <div className="bottom-actions-spacer"></div>
            <div className="bottom-actions-buttons">
              <button className="back-button" onClick={handleBack}>
                <div className="back-button-text">Назад</div>
              </button>
              <button className="save-button save-button-enabled" onClick={handleSave}>
                <div className="save-button-text-enabled">Сохранить и опубликовать</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default MortgageDropdownEdit;