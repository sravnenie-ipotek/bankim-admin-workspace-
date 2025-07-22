/**
 * ContentMenu Component
 * Menu translations management - displays and allows editing of menu component translations
 * 
 * @version 1.0.0
 * @since 2025-01-20
 */

import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import Breadcrumb from '../Chat/ContentManagement/components/Breadcrumb/Breadcrumb';
import { useNavigation } from '../../contexts/NavigationContext';
import './ContentMenu.css';

interface MenuTranslation {
  id: string;
  content_key: string;
  component_type: string;
  category: string;
  description: string;
  is_active: boolean;
  translations: {
    ru: string;
    he: string;
    en: string;
  };
  last_modified: string;
}

interface MenuData {
  status: string;
  content_count: number;
  menu_items: MenuTranslation[];
}

const ContentMenu: React.FC = () => {
  const { setCurrentSubmenu } = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [menuData, setMenuData] = useState<MenuData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Set navigation context
  useEffect(() => {
    setCurrentSubmenu('content-menu', 'Меню');
  }, [setCurrentSubmenu]);

  // Fetch menu translations
  useEffect(() => {
    const fetchMenuTranslations = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await apiService.getMenuTranslations();
        if (response.success && response.data) {
          setMenuData(response.data);
        } else {
          throw new Error(response.error || 'Failed to fetch menu translations');
        }
      } catch (err) {
        setError('Не удалось загрузить переводы меню');
        console.error('Menu translations fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenuTranslations();
  }, []);

  const handleEditToggle = (itemId: string) => {
    setEditingItem(editingItem === itemId ? null : itemId);
  };

  const handleTranslationChange = (itemId: string, language: 'ru' | 'he' | 'en', value: string) => {
    if (!menuData) return;

    setMenuData({
      ...menuData,
      menu_items: menuData.menu_items.map(item =>
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
  };

  const handleSave = async (itemId: string) => {
    if (!menuData) return;
    
    const item = menuData.menu_items.find(item => item.id === itemId);
    if (!item) return;

    try {
      // Save all three translations
      const savePromises = [
        apiService.updateMenuTranslation(itemId, 'ru', item.translations.ru),
        apiService.updateMenuTranslation(itemId, 'he', item.translations.he),
        apiService.updateMenuTranslation(itemId, 'en', item.translations.en)
      ];

      await Promise.all(savePromises);
      
      // Update the last modified timestamp
      setMenuData({
        ...menuData,
        menu_items: menuData.menu_items.map(menuItem =>
          menuItem.id === itemId
            ? { ...menuItem, last_modified: new Date().toISOString() }
            : menuItem
        )
      });

      console.log('Menu item translations saved successfully:', itemId);
      setEditingItem(null);
    } catch (error) {
      console.error('Failed to save menu translations:', error);
      // TODO: Show error notification to user
    }
  };

  const filteredItems = menuData?.menu_items.filter(item =>
    item.content_key.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.translations.ru.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.translations.he.includes(searchQuery) ||
    item.translations.en.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="content-menu">
      {/* Breadcrumb Navigation */}
      <div className="breadcrumb-section">
        <Breadcrumb
          items={[
            { label: 'Контент сайта', href: '/content-management' },
            { label: 'Меню', href: '#', isActive: true }
          ]}
        />
      </div>

      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-main">
          <h1>Меню</h1>
          <span className="page-subtitle">Управление переводами меню сайта</span>
        </div>
      </div>

      {/* Search and Stats */}
      <div className="menu-controls">
        <div className="search-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="Искать по названию, ID, номеру страницы"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
        </div>
        
        <div className="menu-stats">
          <span>Показано {filteredItems.length} из {menuData?.content_count || 0}</span>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Загрузка переводов меню...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="error-state">
          <p>❌ {error}</p>
        </div>
      )}

      {/* Menu Items Table */}
      {menuData && (
        <div className="menu-table-container">
          <div className="menu-table-header">
            <div className="header-cell">НАЗВАНИЕ СТРАНИЦЫ</div>
            <div className="header-cell">КОЛИЧЕСТВО ДЕЙСТВИЙ</div>
            <div className="header-cell">БЫЛИ ИЗМЕНЕНИЯ</div>
            <div className="header-cell">ДЕЙСТВИЯ</div>
          </div>
          
          <div className="menu-table-body">
            {filteredItems.map((item) => (
              <div key={item.id} className="menu-table-row">
                <div className="menu-item-info">
                  <div className="menu-item-translations">
                    {editingItem === item.id ? (
                      // Edit mode
                      <div className="translation-inputs">
                        <div className="translation-input-group">
                          <label>RU:</label>
                          <input
                            type="text"
                            value={item.translations.ru}
                            onChange={(e) => handleTranslationChange(item.id, 'ru', e.target.value)}
                            className="translation-input"
                          />
                        </div>
                        <div className="translation-input-group">
                          <label>HE:</label>
                          <input
                            type="text"
                            value={item.translations.he}
                            onChange={(e) => handleTranslationChange(item.id, 'he', e.target.value)}
                            className="translation-input heb-input"
                            dir="rtl"
                          />
                        </div>
                        <div className="translation-input-group">
                          <label>EN:</label>
                          <input
                            type="text"
                            value={item.translations.en}
                            onChange={(e) => handleTranslationChange(item.id, 'en', e.target.value)}
                            className="translation-input"
                          />
                        </div>
                      </div>
                    ) : (
                      // Display mode
                      <div className="translation-display">
                        <div className="primary-title">{item.translations.ru}</div>
                        <div className="translation-line">
                          <span className="lang-code">RU:</span> {item.translations.ru}
                        </div>
                        <div className="translation-line">
                          <span className="lang-code">HE:</span> <span dir="rtl">{item.translations.he}</span>
                        </div>
                        <div className="translation-line">
                          <span className="lang-code">EN:</span> {item.translations.en}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="menu-item-meta">
                    <div className="content-key">{item.content_key}</div>
                  </div>
                </div>

                <div className="actions-count">
                  <span className="count-badge">1</span>
                </div>

                <div className="last-modified">
                  {new Date(item.last_modified).toLocaleDateString('ru-RU')} | {new Date(item.last_modified).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                </div>

                <div className="item-actions">
                  {editingItem === item.id ? (
                    <div className="edit-actions">
                      <button 
                        className="save-btn"
                        onClick={() => handleSave(item.id)}
                      >
                        ✓
                      </button>
                      <button 
                        className="cancel-btn"
                        onClick={() => setEditingItem(null)}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="view-actions">
                      <button 
                        className="view-btn"
                        title="Просмотр"
                      >
                        👁
                      </button>
                      <button 
                        className="edit-btn"
                        onClick={() => handleEditToggle(item.id)}
                        title="Редактировать"
                      >
                        ✏️
                      </button>
                      <button 
                        className="delete-btn"
                        title="Удалить"
                      >
                        🗑️
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentMenu;