/**
 * ContentMenu Component
 * Menu translations management - displays and allows editing of menu component translations
 * Based on Figma design node-id=79-78410
 * 
 * @version 1.1.0
 * @since 2025-01-20
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import './ContentMenu.css';

interface MenuTranslation {
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

interface MenuData {
  status: string;
  content_count: number;
  menu_items: MenuTranslation[];
}

const ContentMenu: React.FC = () => {
  const navigate = useNavigate();
  const [menuData, setMenuData] = useState<MenuData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedTranslations, setEditedTranslations] = useState<{
    ru: string;
    he: string;
  }>({ ru: '', he: '' });
  const itemsPerPage = 12;

  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        setLoading(true);
        console.log('🔄 Fetching menu translations from database...');
        const response = await apiService.getMenuTranslations();
        
        if (response.success && response.data) {
          const data = response.data;
          if (data.menu_items && Array.isArray(data.menu_items)) {
            const normalizedItems = data.menu_items.map(item => {
              // Map component_type to category for display
              let category = 'text';
              if (item.component_type === 'nav_link' || item.component_type === 'service_card' || item.component_type === 'link') {
                category = 'link';
              } else if (item.component_type === 'menu_item' || item.component_type === 'dropdown') {
                category = 'dropdown';
              } else if (item.component_type === 'heading' || item.component_type === 'title') {
                category = 'dropdown';
              } else {
                category = 'text';
              }
              
              return {
                id: item.id || '',
                content_key: item.content_key || '',
                component_type: item.component_type || 'menu',
                category: category,
                screen_location: item.screen_location || '',
                description: item.description || '',
                is_active: item.is_active ?? true,
                translations: {
                  ru: item.translations?.ru || '',
                  he: item.translations?.he || '',
                  en: item.translations?.en || ''
                },
                last_modified: item.last_modified || new Date().toISOString()
              };
            });
            
            const normalizedData: MenuData = {
              status: data.status || 'success',
              content_count: data.content_count || normalizedItems.length,
              menu_items: normalizedItems
            };
            
            setMenuData(normalizedData);
            console.log('✅ Successfully loaded menu data:', normalizedData);
          }
        } else {
          console.error('❌ Failed to fetch menu translations from database:', response.error);
          setError(response.error || 'Failed to fetch menu translations from database');
        }
      } catch (err) {
        console.error('❌ Error fetching menu data:', err);
        setError('Failed to load menu data');
      } finally {
        setLoading(false);
      }
    };

    fetchMenuData();
  }, []);

  const handleEditClick = (item: MenuTranslation) => {
    setEditingId(item.id);
    setEditedTranslations({
      ru: item.translations.ru,
      he: item.translations.he
    });
  };

  const handleTranslationChange = (field: 'ru' | 'he', value: string) => {
    setEditedTranslations(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async (itemId: string) => {
    try {
      // TODO: Implement save functionality with real API
      console.log('Saving translations for item:', itemId, editedTranslations);
      setEditingId(null);
    } catch (error) {
      console.error('Error saving translations:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditedTranslations({ ru: '', he: '' });
  };

  const handleViewClick = (item: MenuTranslation) => {
    if (item.category?.toLowerCase() === 'dropdown') {
      navigate(`/content/main/action/${item.id}`);
    } else if (item.category?.toLowerCase() === 'text') {
      navigate(`/content/main/text/${item.id}`);
    } else {
      window.open(`/content/preview/${item.id}`, '_blank');
    }
  };

  const handleDeleteClick = (item: MenuTranslation) => {
    if (window.confirm(`Вы уверены, что хотите удалить "${item.content_key}"?`)) {
      // TODO: Implement delete functionality
      console.log('Deleting item:', item.id);
    }
  };

  const filteredItems = useMemo(() => {
    if (!menuData?.menu_items) return [];
    return menuData.menu_items.filter(item =>
      item.content_key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.translations.ru.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.translations.he.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [menuData?.menu_items, searchTerm]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredItems.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="content-menu-loading">
        <div className="loading-spinner"></div>
        <p>Загрузка данных меню...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="content-menu-error">
        <p>Ошибка: {error}</p>
        <button onClick={() => window.location.reload()}>Попробовать снова</button>
      </div>
    );
  }

  return (
    <div className="content-menu-page">
      {/* Top Navigation Bar - matches Figma Navbar Admin panel */}
      <div className="navbar-admin-panel">
        <div className="navbar-content">
          <div className="language-selector">
            <span className="language-text">Русский</span>
            <img src="/src/assets/images/static/icons/chevron-down.svg" alt="Chevron" />
          </div>
          <div className="navbar-actions">
            <div className="navbar-action techsupport">
              <img src="/src/assets/images/static/icons/headset.svg" alt="Support" />
            </div>
            <div className="navbar-action notification">
              <img src="/src/assets/images/static/icons/bell.svg" alt="Notifications" />
              <div className="notification-badge">1</div>
            </div>
            <div className="profile-section">
              <div className="profile-avatar">
                <img src="/src/assets/images/static/profile-avatar.png" alt="Profile" />
              </div>
              <span className="profile-name">Александр Пушкин</span>
              <img src="/src/assets/images/static/icons/chevron-right.svg" alt="Profile Menu" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Frame */}
      <div className="main-content-frame">
        {/* First Section with Breadcrumb and Title */}
        <div className="first-section">
          {/* Breadcrumb */}
          <div className="breadcrumb">
            <div className="breadcrumb-link">
              <span>Контент сайта</span>
            </div>
            <img src="/src/assets/images/static/icons/chevron-right.svg" alt=">" className="breadcrumb-chevron" />
            <div className="breadcrumb-link">
              <span>Главная</span>
            </div>
            <img src="/src/assets/images/static/icons/chevron-right.svg" alt=">" className="breadcrumb-chevron" />
            <div className="breadcrumb-link current">
              <span>Калькулятор ипотеки Страница №2</span>
            </div>
          </div>

          {/* Page Title and Info Cards */}
          <div className="page-header">
            <div className="page-title-section">
              <h1 className="page-title">Калькулятор ипотеки Страница №2</h1>
            </div>
            <div className="info-cards">
              <div className="info-card">
                <div className="info-card-content">
                  <span className="info-label">Количество действий</span>
                  <span className="info-value">{menuData?.content_count || 0}</span>
                </div>
              </div>
              <div className="info-card">
                <div className="info-card-content">
                  <span className="info-label">Последнее редактирование</span>
                  <span className="info-value">01.08.2023 | 12:03</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Gallery Sections */}
        <div className="gallery-sections">
          <div className="gallery-section">
            <h2 className="gallery-title">Cтраница и ее состояния</h2>
            <div className="gallery-container">
              <div className="gallery-image"></div>
            </div>
          </div>
          <div className="gallery-carousel">
            <button className="carousel-btn prev">&lt;</button>
            <div className="carousel-images">
              <div className="carousel-image"></div>
              <div className="carousel-image"></div>
              <div className="carousel-image"></div>
              <div className="carousel-image"></div>
              <div className="carousel-image"></div>
              <div className="carousel-image"></div>
            </div>
            <button className="carousel-btn next">&gt;</button>
          </div>
        </div>

        {/* Actions List Title */}
        <h2 className="actions-list-title">Cписок действий на странице</h2>

        {/* Table Section */}
        <div className="table-section">
          {/* Table Header with Search and Filters */}
          <div className="table-header-controls">
            <div className="search-container">
              <div className="search-input-wrapper">
                <img src="/src/assets/images/static/icons/search.svg" alt="Search" className="search-icon" />
                <input
                  type="text"
                  placeholder="Искать по действию"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>
            <button className="filters-btn">
              <img src="/src/assets/images/static/icons/filters.svg" alt="Filters" />
              <span>Фильтры</span>
            </button>
          </div>

          {/* Table Content */}
          <div className="menu-table">
            {/* Table Headers */}
            <div className="table-headers">
              <div className="header-cell number-header">Номер действия</div>
              <div className="header-cell id-header">ID</div>
              <div className="header-cell type-header">Тип</div>
              <div className="header-cell ru-header">RU</div>
              <div className="header-cell he-header">HEb</div>
              <div className="header-cell actions-header"></div>
            </div>

            {/* Table Rows */}
            <div className="table-rows">
              {currentItems.map((item, index) => (
                <div key={item.id} className="table-row">
                  <div className="table-cell number-cell">
                    <span className="action-number">{`${startIndex + index + 1}.`}</span>
                  </div>
                  <div className="table-cell id-cell">
                    <span className="content-id">{item.content_key}</span>
                  </div>
                  <div className="table-cell type-cell">
                    <span className={`content-type ${item.category?.toLowerCase()}`}>
                      {item.category === 'dropdown' ? 'Дропдаун' : 
                       item.category === 'link' ? 'Ссылка' : 
                       item.category === 'text' ? 'Текст' : 
                       'Дропдаун'}
                    </span>
                  </div>
                  <div className="table-cell ru-cell">
                    {editingId === item.id ? (
                      <input
                        type="text"
                        value={editedTranslations.ru}
                        onChange={(e) => handleTranslationChange('ru', e.target.value)}
                        className="translation-input"
                      />
                    ) : (
                      <span className="translation-text">{item.translations.ru}</span>
                    )}
                  </div>
                  <div className="table-cell he-cell">
                    {editingId === item.id ? (
                      <input
                        type="text"
                        value={editedTranslations.he}
                        onChange={(e) => handleTranslationChange('he', e.target.value)}
                        className="translation-input heb-input"
                        dir="rtl"
                      />
                    ) : (
                      <span className="translation-text heb-text" dir="rtl">{item.translations.he}</span>
                    )}
                  </div>
                  <div className="table-cell actions-cell">
                    {editingId === item.id ? (
                      <div className="edit-actions">
                        <button onClick={() => handleSave(item.id)} className="save-btn">✓</button>
                        <button onClick={handleCancelEdit} className="cancel-btn">✗</button>
                      </div>
                    ) : (
                      <div className="row-actions">
                        <button 
                          className="action-btn view-btn" 
                          onClick={() => handleViewClick(item)}
                          title="Просмотр"
                        >
                          <img src="/src/assets/images/static/icons/eye.svg" alt="View" />
                        </button>
                        <button 
                          className="action-btn edit-btn" 
                          onClick={() => handleEditClick(item)}
                          title="Редактировать"
                        >
                          <img src="/src/assets/images/static/icons/pencil.svg" alt="Edit" />
                        </button>
                        <button 
                          className="action-btn delete-btn" 
                          onClick={() => handleDeleteClick(item)}
                          title="Удалить"
                        >
                          <img src="/src/assets/images/static/icons/trash.svg" alt="Delete" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pagination */}
          <div className="table-footer">
            <span className="pagination-info">
              Показывает {startIndex + 1}-{Math.min(endIndex, filteredItems.length)} из {filteredItems.length}
            </span>
            <div className="pagination">
              <button 
                className="pagination-btn" 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                &lt;
              </button>
              <span className="page-number current">1</span>
              <span className="page-number">2</span>
              <span className="page-number">3</span>
              <span className="page-ellipsis">...</span>
              <span className="page-number">{totalPages}</span>
              <button 
                className="pagination-btn" 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                &gt;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentMenu;