/**
 * ContentMainDrill Component
 * Detail page for editing dropdown elements (Page 4.1)
 * Following master-detail pattern from ContentMain (Page 4)
 * 
 * Business Logic:
 * - Receives dropdown element ID from ContentMain page
 * - Allows editing dropdown options with multilingual support (RU/HEB)
 * - Supports drag & drop reordering
 * - CRUD operations on dropdown options
 * 
 * Navigation Flow:
 * ContentMain (Page 4) → ContentMainDrill (Page 4.1) → ContentMain (updated)
 * 
 * @version 1.0.0
 * @since 2025-01-20
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Breadcrumb } from '../Chat/ContentManagement/components/Breadcrumb';
import { useNavigation } from '../../contexts/NavigationContext';
import './ContentMainDrill.css';

interface DropdownOption {
  id: string;
  order: number;
  titleRu: string;
  titleHe: string;
}

interface DropdownAction {
  id: string;
  actionNumber: number;
  titleRu: string;
  titleHe: string;
  lastModified: string;
  options: DropdownOption[];
}

const ContentMainDrill: React.FC = () => {
  const { actionId } = useParams<{ actionId: string }>();
  const navigate = useNavigate();
  const { setCurrentSubmenu } = useNavigation();
  
  // States
  const [isLoading, setIsLoading] = useState(false);
  const [dropdownData, setDropdownData] = useState<DropdownAction | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Set navigation context
  useEffect(() => {
    setCurrentSubmenu('content-main', 'Главная');
  }, [setCurrentSubmenu]);

  // Mock data for development
  useEffect(() => {
    // Simulate loading dropdown data
    setIsLoading(true);
    setTimeout(() => {
      setDropdownData({
        id: actionId || '1',
        actionNumber: 3,
        titleRu: 'Основной источник дохода',
        titleHe: 'מקור הכנסה עיקרי',
        lastModified: '01.08.2023 | 15:03',
        options: [
          { id: '1', order: 1, titleRu: 'Наемный работник', titleHe: 'שכיר' },
          { id: '2', order: 2, titleRu: 'Индивидуальный предприниматель', titleHe: 'עצמאי' },
          { id: '3', order: 3, titleRu: 'Владелец бизнеса', titleHe: 'בעל עסק' },
          { id: '4', order: 4, titleRu: 'Пенсионер', titleHe: 'פנסיונר' }
        ]
      });
      setIsLoading(false);
    }, 500);
  }, [actionId]);

  // Handlers
  const handleBack = () => {
    if (hasChanges) {
      const confirm = window.confirm('У вас есть несохраненные изменения. Вы уверены, что хотите выйти?');
      if (!confirm) return;
    }
    navigate('/content/main');
  };

  const handleSaveAndPublish = () => {
    // TODO: Implement save logic
    console.log('Saving and publishing changes...');
    setHasChanges(false);
    navigate('/content/main');
  };

  const handleAddOption = () => {
    console.log('Adding new option...');
    setHasChanges(true);
  };

  const handleEditOption = (optionId: string) => {
    console.log('Editing option:', optionId);
    setHasChanges(true);
  };

  const handleDeleteOption = (optionId: string) => {
    console.log('Deleting option:', optionId);
    setHasChanges(true);
  };

  const handleDragStart = (e: React.DragEvent, optionId: string) => {
    e.dataTransfer.setData('optionId', optionId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData('optionId');
    console.log('Moving option:', sourceId, 'to position of:', targetId);
    setHasChanges(true);
  };

  if (isLoading) {
    return (
      <div className="content-main-drill loading">
        <div className="loading-spinner"></div>
        <p>Загрузка данных...</p>
      </div>
    );
  }

  if (!dropdownData) {
    return (
      <div className="content-main-drill error">
        <p>Действие не найдено</p>
        <button onClick={handleBack}>Вернуться назад</button>
      </div>
    );
  }

  return (
    <div className="content-main-drill">
      {/* Breadcrumb Navigation */}
      <div className="breadcrumb-section">
        <Breadcrumb
          items={[
            { label: 'Контент сайта', href: '/content-management' },
            { label: 'Главная', href: '/content/main' },
            { label: `Действие №${dropdownData.actionNumber}`, href: '#', isActive: true }
          ]}
        />
      </div>

      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-main">
          <h1>Номер дейcтвия №{dropdownData.actionNumber} | Основной источник дохода</h1>
          <span className="page-subtitle">Home_page</span>
        </div>
      </div>

      {/* Last Modified Card */}
      <div className="last-modified-card">
        <span className="last-modified-label">Последнее редактирование</span>
        <span className="last-modified-time">{dropdownData.lastModified}</span>
      </div>

      {/* Action Headers Section */}
      <div className="action-headers-section">
        <h2 className="section-title">Заголовки действий</h2>
        <div className="headers-container">
          <div className="header-input-group">
            <label className="input-label">RU</label>
            <div className="input-wrapper">
              <input 
                type="text" 
                value={dropdownData.titleRu}
                onChange={(e) => {
                  setDropdownData({ ...dropdownData, titleRu: e.target.value });
                  setHasChanges(true);
                }}
                className="header-text-input"
                placeholder="Основной источник дохода"
              />
            </div>
          </div>
          <div className="header-input-group heb-input">
            <label className="input-label">HEB</label>
            <div className="input-wrapper">
              <input 
                type="text" 
                value={dropdownData.titleHe}
                onChange={(e) => {
                  setDropdownData({ ...dropdownData, titleHe: e.target.value });
                  setHasChanges(true);
                }}
                className="header-text-input heb-text"
                placeholder="מקור הכנסה עיקרי"
                dir="rtl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Add Option Button */}
      <div className="add-option-section">
        <button className="add-option-btn" onClick={handleAddOption}>
          <span className="add-icon">+</span>
          Добавить вариант
        </button>
      </div>

      {/* Options Section */}
      <div className="options-section">
        <h2 className="section-title">Опции ответов</h2>

        <div className="options-list">
          {dropdownData.options.map((option) => (
            <div 
              key={option.id} 
              className="option-row"
              draggable
              onDragStart={(e) => handleDragStart(e, option.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, option.id)}
            >
              <div className="option-left-section">
                <div className="drag-handle">
                  <span className="drag-icon">⋮⋮</span>
                </div>
                <div className="option-number">{option.order}</div>
              </div>
              
              <div className="option-inputs-section">
                <div className="option-input-group">
                  <label className="option-label">RU</label>
                  <div className="option-input-wrapper">
                    <input 
                      type="text" 
                      value={option.titleRu}
                      onChange={() => {
                        // Update option logic here
                        setHasChanges(true);
                      }}
                      className="option-text-input"
                      placeholder="Сотрудник"
                    />
                  </div>
                </div>
                <div className="option-input-group">
                  <label className="option-label">HEB</label>
                  <div className="option-input-wrapper">
                    <input 
                      type="text" 
                      value={option.titleHe}
                      onChange={() => {
                        // Update option logic here
                        setHasChanges(true);
                      }}
                      className="option-text-input heb-text"
                      placeholder="עובד"
                      dir="rtl"
                    />
                  </div>
                </div>
              </div>
              
              <div className="option-actions">
                <button 
                  className="action-btn edit-btn" 
                  onClick={() => handleEditOption(option.id)}
                  title="Редактировать"
                >
                  <span className="btn-icon">✏️</span>
                </button>
                <button 
                  className="action-btn delete-btn" 
                  onClick={() => handleDeleteOption(option.id)}
                  title="Удалить"
                >
                  <span className="btn-icon">🗑️</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button className="back-button" onClick={handleBack}>
          Назад
        </button>
        <button 
          className="save-publish-button" 
          onClick={handleSaveAndPublish}
          disabled={!hasChanges}
        >
          Сохранить и опубликовать
        </button>
      </div>
    </div>
  );
};

export default ContentMainDrill;