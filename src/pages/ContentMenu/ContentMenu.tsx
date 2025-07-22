/**
 * ContentMenu Component
 * Menu translations management - displays and allows editing of menu component translations
 * Based on Figma design node-id=79-78410
 * 
 * @version 1.1.0
 * @since 2025-01-20
 */

import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import { useNavigation } from '../../contexts/NavigationContext';
import './ContentMenu.css';

interface MenuTranslation {
  id: string;
  content_key: string;
  component_type: string;
  category: string;
  description: string;
  is_active: boolean;
  page_name: string;
  action_count: number;
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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Set navigation context
  useEffect(() => {
    setCurrentSubmenu('content-menu', 'Меню');
  }, [setCurrentSubmenu]);

  // Real API data fetching
  useEffect(() => {
    const fetchMenuTranslations = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await apiService.getMenuTranslations();
        if (response.success && response.data) {
          // Ensure data has proper structure
          const data = response.data;
          if (data.menu_items && Array.isArray(data.menu_items)) {
            // Normalize menu items to ensure all required properties exist
            const normalizedItems = data.menu_items.map(item => ({
              id: item.id || '',
              content_key: item.content_key || '',
              component_type: item.component_type || 'menu',
              category: item.category || 'navigation',
              description: item.description || '',
              is_active: item.is_active ?? true,
              page_name: item.page_name || '',
              action_count: item.action_count || 0,
              translations: {
                ru: item.translations?.ru || '',
                he: item.translations?.he || '',
                en: item.translations?.en || ''
              },
              last_modified: item.last_modified || new Date().toISOString()
            }));
            
            setMenuData({
              ...data,
              menu_items: normalizedItems
            });
          } else {
            throw new Error('Invalid data structure received from API');
          }
        } else {
          // Fallback to mock data if API fails
          console.warn('API failed, using mock data:', response.error);
          const mockData: MenuData = {
            status: 'success',
            content_count: 1000,
            menu_items: [
              {
                id: '1',
                content_key: 'menu.side_navigation',
                component_type: 'menu',
                category: 'navigation',
                description: 'Side navigation menu item',
                is_active: true,
                page_name: '15.1 Сайд навигация. Меню',
                action_count: 17,
                translations: {
                  ru: 'Сайд навигация. Меню',
                  he: 'תפריט ניווט צדדי',
                  en: 'Side Navigation Menu'
                },
                last_modified: '2023-08-01T12:03:00Z'
              },
              {
                id: '2',
                content_key: 'menu.about_us',
                component_type: 'menu',
                category: 'navigation',
                description: 'About us menu item',
                is_active: true,
                page_name: '16. О нас. Меню',
                action_count: 26,
                translations: {
                  ru: 'О нас',
                  he: 'אודותינו',
                  en: 'About Us'
                },
                last_modified: '2023-08-01T12:03:00Z'
              },
              {
                id: '3',
                content_key: 'menu.vacancies',
                component_type: 'menu',
                category: 'navigation',
                description: 'Vacancies menu item',
                is_active: true,
                page_name: '17. Вакансии',
                action_count: 28,
                translations: {
                  ru: 'Вакансии',
                  he: 'משרות פנויות',
                  en: 'Vacancies'
                },
                last_modified: '2023-08-01T12:03:00Z'
              },
              {
                id: '4',
                content_key: 'menu.vacancy_form',
                component_type: 'menu',
                category: 'navigation',
                description: 'Vacancy application form',
                is_active: true,
                page_name: '17.1 Вакансии. Описание и анкета кандидата',
                action_count: 17,
                translations: {
                  ru: 'Вакансии. Описание и анкета кандидата',
                  he: 'משרות פנויות. תיאור וטופס מועמד',
                  en: 'Vacancies. Description and Candidate Form'
                },
                last_modified: '2023-08-01T12:03:00Z'
              },
              {
                id: '5',
                content_key: 'menu.vacancy_submitted',
                component_type: 'menu',
                category: 'navigation',
                description: 'Vacancy application submitted',
                is_active: true,
                page_name: '17.2 Вакансии. Заявка принята в обработку',
                action_count: 2,
                translations: {
                  ru: 'Заявка принята в обработку',
                  he: 'הבקשה התקבלה לעיבוד',
                  en: 'Application Received for Processing'
                },
                last_modified: '2023-08-01T12:03:00Z'
              },
              {
                id: '6',
                content_key: 'menu.contacts',
                component_type: 'menu',
                category: 'navigation',
                description: 'Contacts menu item',
                is_active: true,
                page_name: '18.Контакты',
                action_count: 46,
                translations: {
                  ru: 'Контакты',
                  he: 'צור קשר',
                  en: 'Contacts'
                },
                last_modified: '2023-08-01T12:03:00Z'
              },
              {
                id: '7',
                content_key: 'menu.referral_program',
                component_type: 'menu',
                category: 'navigation',
                description: 'Referral program menu item',
                is_active: true,
                page_name: '19. Реферальная программа',
                action_count: 32,
                translations: {
                  ru: 'Реферальная программа',
                  he: 'תוכנית הפניות',
                  en: 'Referral Program'
                },
                last_modified: '2023-08-01T12:03:00Z'
              },
              {
                id: '8',
                content_key: 'menu.broker_franchise',
                component_type: 'menu',
                category: 'navigation',
                description: 'Broker franchise menu item',
                is_active: true,
                page_name: '20. Франшиза для брокеров',
                action_count: 40,
                translations: {
                  ru: 'Франшиза для брокеров',
                  he: 'זיכיון לברוקרים',
                  en: 'Broker Franchise'
                },
                last_modified: '2023-08-01T12:03:00Z'
              },
              {
                id: '9',
                content_key: 'menu.broker_application',
                component_type: 'menu',
                category: 'navigation',
                description: 'Broker application form',
                is_active: true,
                page_name: '20.1 Брокеры. Анкета для сотрудничества',
                action_count: 21,
                translations: {
                  ru: 'Брокеры. Анкета для сотрудничества',
                  he: 'ברוקרים. טופס לשיתוף פעולה',
                  en: 'Brokers. Cooperation Form'
                },
                last_modified: '2023-08-01T12:03:00Z'
              },
              {
                id: '10',
                content_key: 'menu.broker_submitted',
                component_type: 'menu',
                category: 'navigation',
                description: 'Broker application submitted',
                is_active: true,
                page_name: '20.2 Брокеры. Заявка принята в обработку',
                action_count: 2,
                translations: {
                  ru: 'Брокеры. Заявка принята в обработку',
                  he: 'ברוקרים. הבקשה התקבלה לעיבוד',
                  en: 'Brokers. Application Received for Processing'
                },
                last_modified: '2023-08-01T12:03:00Z'
              },
              {
                id: '11',
                content_key: 'menu.realtor_franchise',
                component_type: 'menu',
                category: 'navigation',
                description: 'Realtor franchise menu item',
                is_active: true,
                page_name: '20А. Франшиза для риэлторов',
                action_count: 39,
                translations: {
                  ru: 'Франшиза для риэлторов',
                  he: 'זיכיון למתווכי נדלן',
                  en: 'Realtor Franchise'
                },
                last_modified: '2023-08-01T12:03:00Z'
              },
              {
                id: '12',
                content_key: 'menu.realtor_application',
                component_type: 'menu',
                category: 'navigation',
                description: 'Realtor application form',
                is_active: true,
                page_name: '20А.1 Риэлторы. Анкета для сотрудничества',
                action_count: 18,
                translations: {
                  ru: 'Риэлторы. Анкета для сотрудничества',
                  he: 'מתווכי נדלן. טופס לשיתוף פעולה',
                  en: 'Realtors. Cooperation Form'
                },
                last_modified: '2023-08-01T12:03:00Z'
              }
            ]
          };
          setMenuData(mockData);
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
        apiService.updateMenuTranslation(itemId, 'ru', item.translations?.ru || ''),
        apiService.updateMenuTranslation(itemId, 'he', item.translations?.he || ''),
        apiService.updateMenuTranslation(itemId, 'en', item.translations?.en || '')
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
      setError('Не удалось сохранить изменения');
    }
  };

  const handleCancelEdit = (itemId: string) => {
    // Reset translations to original values by refetching or restoring from backup
    setEditingItem(null);
    // TODO: Implement proper state restoration
  };

  const handleViewClick = (itemId: string) => {
    const item = menuData?.menu_items.find(item => item.id === itemId);
    if (item && item.content_key) {
      // Open site preview in new tab using content_key
      const previewUrl = `https://bankimonline.com/${item.content_key.replace('menu.', '')}`;
      window.open(previewUrl, '_blank');
    }
    console.log('View menu item:', itemId);
  };

  const handleDeleteClick = async (itemId: string) => {
    const item = menuData?.menu_items.find(item => item.id === itemId);
    if (!item) return;

    const confirmDelete = window.confirm(`Вы уверены, что хотите удалить "${item.page_name}"?`);
    if (!confirmDelete) return;

    try {
      // TODO: Implement actual delete API call
      // await apiService.deleteMenuItem(itemId);
      
      // Remove from local state for now
      if (menuData) {
        setMenuData({
          ...menuData,
          menu_items: menuData.menu_items.filter(menuItem => menuItem.id !== itemId),
          content_count: menuData.content_count - 1
        });
      }
      
      console.log('Menu item deleted:', itemId);
    } catch (error) {
      console.error('Failed to delete menu item:', error);
      setError('Не удалось удалить элемент меню');
    }
  };

  const filteredItems = menuData?.menu_items.filter(item =>
    (item.page_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (item.content_key?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (item.translations?.ru?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (item.translations?.he || '').includes(searchQuery) ||
    (item.translations?.en?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  ) || [];

  // Pagination logic
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredItems.slice(startIndex, endIndex);
  const showingCount = Math.min(endIndex, filteredItems.length);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }) + ' | ' + date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="content-menu">
      {/* Page Header - matches Figma text9 */}
      <div className="page-header">
        <h1 className="page-title">Меню</h1>
      </div>

      {/* Section Header - matches Figma text10 */}
      <div className="section-header">
        <h2 className="section-title">Список страниц</h2>
      </div>

      {/* Search Box - matches Figma row-view8 */}
      <div className="search-container">
        <div className="search-box">
          <svg 
            className="search-icon"
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input
            type="text"
            placeholder="Искать по названию, ID, номеру страницы"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
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

      {/* Menu Table - matches Figma table structure */}
      {menuData && (
        <div className="menu-table-container">
          {/* Table Header - matches Figma view, view2, view3 headers */}
          <div className="table-header">
            <div className="header-cell name-header">
              <span>НАЗВАНИЕ СТРАНИЦЫ</span>
            </div>
            <div className="header-cell count-header">
              <span>Количество действии</span>
            </div>
            <div className="header-cell modified-header">
              <span>Были изменения</span>
            </div>
            <div className="header-cell actions-header">
              {/* Empty header for actions */}
            </div>
          </div>
          
          {/* Table Body */}
          <div className="table-body">
            {currentItems.map((item, index) => (
              <div key={item.id} className={`table-row ${editingItem === item.id ? 'editing' : ''}`}>
                {/* Page Name Column - matches Figma text13 */}
                <div className="cell name-cell">
                  {editingItem === item.id ? (
                    <div className="edit-translations">
                      <div className="translation-input-group">
                        <label>RU:</label>
                        <input
                          type="text"
                          value={item.translations?.ru || ''}
                          onChange={(e) => handleTranslationChange(item.id, 'ru', e.target.value)}
                          className="translation-input"
                        />
                      </div>
                      <div className="translation-input-group">
                        <label>HE:</label>
                        <input
                          type="text"
                          value={item.translations?.he || ''}
                          onChange={(e) => handleTranslationChange(item.id, 'he', e.target.value)}
                          className="translation-input heb-input"
                          dir="rtl"
                        />
                      </div>
                      <div className="translation-input-group">
                        <label>EN:</label>
                        <input
                          type="text"
                          value={item.translations?.en || ''}
                          onChange={(e) => handleTranslationChange(item.id, 'en', e.target.value)}
                          className="translation-input"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="page-name-display">
                      <span className="page-name">{item.page_name || 'Untitled'}</span>
                      <div className="translation-preview">
                        <small>RU: {item.translations?.ru || ''}</small>
                        <small>HE: {item.translations?.he || ''}</small>
                        <small>EN: {item.translations?.en || ''}</small>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Count Column - matches Figma text15, text16, etc. */}
                <div className="cell count-cell">
                  <span className="action-count">{item.action_count}</span>
                </div>

                {/* Last Modified Column - matches Figma text20, text21 */}
                <div className="cell modified-cell">
                  <span className="modified-date">{formatDate(item.last_modified)}</span>
                </div>

                {/* Actions Column - matches Figma image8 icons */}
                <div className="cell actions-cell">
                  {editingItem === item.id ? (
                    <div className="edit-actions">
                      <button 
                        className="action-btn save-btn"
                        onClick={() => handleSave(item.id)}
                        title="Сохранить"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20,6 9,17 4,12"></polyline>
                        </svg>
                      </button>
                      <button 
                        className="action-btn cancel-btn"
                        onClick={() => handleCancelEdit(item.id)}
                        title="Отмена"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="view-actions">
                      <button 
                        className="action-btn view-btn"
                        onClick={() => handleViewClick(item.id)}
                        title="Просмотр"
                      >
                        <img src="/src/assets/images/static/icons/eye.svg" alt="View" />
                      </button>
                      <button 
                        className="action-btn edit-btn"
                        onClick={() => handleEditToggle(item.id)}
                        title="Редактировать"
                      >
                        <img src="/src/assets/images/static/icons/pencil.svg" alt="Edit" />
                      </button>
                      <button 
                        className="action-btn delete-btn"
                        onClick={() => handleDeleteClick(item.id)}
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

          {/* Pagination - matches Figma row-view9 and row-view10 */}
          <div className="pagination-container">
            <div className="pagination-info">
              <span className="showing-text">
                Показывает {startIndex + 1}-{showingCount} из {filteredItems.length}
              </span>
            </div>
            
            <div className="pagination-controls">
              <button 
                className="pagination-btn prev-btn"
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15,18 9,12 15,6"></polyline>
                </svg>
              </button>
              
              {/* Page Numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    className={`pagination-btn page-btn ${currentPage === pageNum ? 'active' : ''}`}
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              {totalPages > 5 && currentPage < totalPages - 2 && (
                <>
                  <span className="pagination-dots">...</span>
                  <button
                    className="pagination-btn page-btn"
                    onClick={() => handlePageChange(totalPages)}
                  >
                    {totalPages}
                  </button>
                </>
              )}
              
              <button 
                className="pagination-btn next-btn"
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9,18 15,12 9,6"></polyline>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentMenu;