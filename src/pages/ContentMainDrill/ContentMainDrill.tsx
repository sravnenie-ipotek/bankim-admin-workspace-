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
        <h1>Редактирование Dropdown</h1>
        <p className="page-subtitle">Действие №{dropdownData.actionNumber} | Последнее изменение: {dropdownData.lastModified}</p>
      </div>

      {/* Action Headers Section */}
      <div className="action-headers-section">
        <h2>Заголовки действий</h2>
        <div className="headers-grid">
          <div className="header-input">
            <label>RU</label>
            <input 
              type="text" 
              value={dropdownData.titleRu}
              onChange={(e) => {
                setDropdownData({ ...dropdownData, titleRu: e.target.value });
                setHasChanges(true);
              }}
              placeholder="Название на русском"
            />
          </div>
          <div className="header-input">
            <label>HEB</label>
            <input 
              type="text" 
              value={dropdownData.titleHe}
              onChange={(e) => {
                setDropdownData({ ...dropdownData, titleHe: e.target.value });
                setHasChanges(true);
              }}
              placeholder="שם בעברית"
              dir="rtl"
            />
          </div>
        </div>
      </div>

      {/* Options Section */}
      <div className="options-section">
        <div className="section-header">
          <h2>Опции ответов</h2>
          <button className="add-option-btn" onClick={handleAddOption}>
            + Добавить вариант
          </button>
        </div>

        <div className="options-list">
          {dropdownData.options.map((option) => (
            <div 
              key={option.id} 
              className="option-item"
              draggable
              onDragStart={(e) => handleDragStart(e, option.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, option.id)}
            >
              <div className="drag-handle">
                <span className="drag-icon">⋮⋮</span>
              </div>
              <div className="option-number">{option.order}</div>
              <div className="option-content">
                <input 
                  type="text" 
                  value={option.titleRu}
                  onChange={() => {
                    // Update option logic here
                    setHasChanges(true);
                  }}
                  placeholder="RU"
                />
                <input 
                  type="text" 
                  value={option.titleHe}
                  onChange={() => {
                    // Update option logic here
                    setHasChanges(true);
                  }}
                  placeholder="HEB"
                  dir="rtl"
                />
              </div>
              <div className="option-actions">
                <button 
                  className="edit-btn" 
                  onClick={() => handleEditOption(option.id)}
                  title="Редактировать"
                >
                  ✏️
                </button>
                <button 
                  className="delete-btn" 
                  onClick={() => handleDeleteOption(option.id)}
                  title="Удалить"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button className="back-btn" onClick={handleBack}>
          ← Назад
        </button>
        <button 
          className="save-publish-btn" 
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