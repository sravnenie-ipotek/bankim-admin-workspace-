/**
 * ContentMainConfirm Component
 * Content approval page for content managers (Page 4.3)
 * Following master-detail pattern from ContentMain (Page 4) → ContentMainConfirm (Page 4.3)
 * 
 * Business Logic:
 * - Content managers only - review and approve copywriter changes
 * - Shows list of pending changes requiring approval
 * - Publish all changes button for batch approval
 * - Individual change review and approval system
 * 
 * Navigation Flow:
 * ContentMain (Page 4) → ContentMainConfirm (Page 4.3) → ContentMain (updated)
 * 
 * @version 1.0.0
 * @since 2025-01-21
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Breadcrumb from '../Chat/ContentManagement/components/Breadcrumb/Breadcrumb';
import { useNavigation } from '../../contexts/NavigationContext';
import './ContentMainConfirm.css';
import { apiService } from '../../services/api';

interface ChangeOption {
  id: string;
  order: number;
  titleRu: string;
  titleHe: string;
  isChanged: boolean;
  changeType: 'added' | 'modified' | 'deleted';
}

interface PendingChange {
  id: string;
  actionNumber: number;
  titleRu: string;
  titleHe: string;
  lastModified: string;
  copywriterName: string;
  changeCount: number;
  options: ChangeOption[];
}

const ContentMainConfirm: React.FC = () => {
  const { actionId } = useParams<{ actionId: string }>();
  const navigate = useNavigate();
  const { setCurrentSubmenu } = useNavigation();
  
  // States
  const [isLoading, setIsLoading] = useState(false);
  const [changeData, setChangeData] = useState<PendingChange | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  // Set navigation context
  useEffect(() => {
    setCurrentSubmenu('content-main', 'Главная');
  }, [setCurrentSubmenu]);

  // Fetch pending change data
  useEffect(() => {
    const fetchPending = async () => {
      if (!actionId) return;
      setIsLoading(true);
      // TODO: replace with dedicated pending change endpoint when available
      const resp = await apiService.getMainPageAction(actionId);
      if (resp.success && resp.data) {
        const action = resp.data;
        setChangeData({
          id: action.id,
          actionNumber: action.actionNumber,
          titleRu: action.titleRu,
          titleHe: action.titleHe,
          lastModified: action.lastModified.toLocaleDateString('ru-RU') + ' | ' +
            action.lastModified.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
          copywriterName: 'неизвестно',
          changeCount: 0,
          options: []
        });
      } else {
        console.error('Failed to load pending change', resp.error);
      }
      setIsLoading(false);
    };

    fetchPending();
  }, [actionId]);

  // Handlers
  const handleBack = () => {
    navigate('/content/main');
  };

  const handlePublishAllChanges = async () => {
    setIsPublishing(true);
    try {
      // TODO: Implement API call to approve all changes
      console.log('Publishing all changes for action:', changeData?.id);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show success message and navigate back
      alert('Все изменения успешно опубликованы!');
      navigate('/content/main');
    } catch (error) {
      console.error('Error publishing changes:', error);
      alert('Ошибка при публикации изменений. Попробуйте снова.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleEditOption = (optionId: string) => {
    console.log('Editing option:', optionId);
    // TODO: Implement option editing
  };

  const handleDeleteOption = (optionId: string) => {
    console.log('Deleting option:', optionId);
    // TODO: Implement option deletion
  };

  if (isLoading) {
    return (
      <div className="content-main-confirm loading">
        <div className="loading-spinner"></div>
        <p>Загрузка изменений...</p>
      </div>
    );
  }

  if (!changeData) {
    return (
      <div className="content-main-confirm error">
        <p>Изменения не найдены</p>
        <button onClick={handleBack}>Вернуться назад</button>
      </div>
    );
  }

  return (
    <div className="content-main-confirm">
      {/* Breadcrumb Navigation */}
      <div className="breadcrumb-section">
        <Breadcrumb
          items={[
            { label: 'Контент сайта', href: '/content-management' },
            { label: 'Главная страница Страница №1', href: '/content/main' },
            { label: `Действие №${changeData.actionNumber}`, href: '#', isActive: true }
          ]}
        />
      </div>

      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-main">
          <h1>Номер дейcтвия №{changeData.actionNumber} | Основной источник дохода</h1>
          <span className="page-subtitle">Home_page</span>
        </div>
      </div>

      {/* Last Modified Card */}
      <div className="last-modified-card">
        <span className="last-modified-label">Последнее редактирование</span>
        <span className="last-modified-time">{changeData.lastModified}</span>
      </div>

      {/* Action Headers Section */}
      <div className="action-headers-section">
        <h2 className="section-title">Заголовки действий</h2>
        <div className="headers-container">
          <div className="header-display-group">
            <label className="display-label">RU</label>
            <div className="display-wrapper">
              <span className="header-display-text">{changeData.titleRu}</span>
            </div>
          </div>
          <div className="header-display-group heb-display">
            <label className="display-label">HEB</label>
            <div className="display-wrapper">
              <span className="header-display-text heb-text">{changeData.titleHe}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Publish All Changes Button */}
      <div className="publish-section">
        <button 
          className="publish-all-btn" 
          onClick={handlePublishAllChanges}
          disabled={isPublishing}
        >
          <span className="publish-icon">+</span>
          {isPublishing ? 'Публикация...' : 'Опубликовать все изменения'}
        </button>
      </div>

      {/* Options Section */}
      <div className="options-section">
        <h2 className="section-title">Опции ответов</h2>

        <div className="options-list">
          {changeData.options.map((option) => (
            <div key={option.id} className={`option-row ${option.isChanged ? 'changed' : ''}`}>
              <div className="option-left-section">
                <div className="change-indicator">
                  {option.isChanged && (
                    <span className={`change-icon change-${option.changeType}`}>
                      {option.changeType === 'added' && '●'}
                      {option.changeType === 'modified' && '●'}
                      {option.changeType === 'deleted' && '●'}
                    </span>
                  )}
                </div>
                <div className="option-number">{option.order}</div>
              </div>
              
              <div className="option-content-section">
                <div className="option-display-group">
                  <label className="option-label">RU</label>
                  <div className="option-display-wrapper">
                    <span className="option-display-text">{option.titleRu}</span>
                  </div>
                </div>
                <div className="option-display-group">
                  <label className="option-label">HEB</label>
                  <div className="option-display-wrapper">
                    <span className="option-display-text heb-text">{option.titleHe}</span>
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
          onClick={handlePublishAllChanges}
          disabled={isPublishing}
        >
          {isPublishing ? 'Публикация...' : 'Сохранить и опубликовать'}
        </button>
      </div>
    </div>
  );
};

export default ContentMainConfirm;