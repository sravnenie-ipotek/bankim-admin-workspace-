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
  const { setCurrentSubmenu } = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [menuData, setMenuData] = useState<MenuData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

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
            console.log('✅ Processing real menu data from bankim_content:', data.menu_items);
            
            // Process real database items and map component_type to category
            const processedItems = data.menu_items.map((item, index) => {
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
                id: item.id?.toString() || (index + 1).toString(),
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
            
            setMenuData({
              status: data.status || 'success',
              content_count: data.content_count || processedItems.length,
              menu_items: processedItems
            });
            
            console.log('✅ Processed menu items:', processedItems.length);
          } else {
            throw new Error('Invalid data structure received from API');
          }
        } else {
          console.error('❌ Failed to fetch menu translations from database:', response.error);
          setError(response.error || 'Failed to fetch menu translations from database');
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

    const confirmDelete = window.confirm(`Вы уверены, что хотите удалить "${item.content_key}"?`);
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
            <div className="header-cell number-header">
              <span>НОМЕР ДЕЙСТВИЯ</span>
            </div>
            <div className="header-cell id-header">
              <span>ID</span>
            </div>
            <div className="header-cell type-header">
              <span>ТИП</span>
            </div>
            <div className="header-cell ru-header">
              <span>RU</span>
            </div>
            <div className="header-cell he-header">
              <span>HEB</span>
            </div>
            <div className="header-cell actions-header">
              {/* Empty header for actions */}
            </div>
          </div>
          
          {/* Table Body */}
          <div className="table-body">
            {currentItems.map((item, index) => (
              <div key={item.id} className={`table-row ${editingItem === item.id ? 'editing' : ''}`}>
                {/* Action Number Column - matches Figma text13 */}
                <div className="cell number-cell">
                  <span className="action-number">{`${startIndex + index + 1}.`}</span>
                </div>

                {/* ID Column - matches Figma text14 */}
                <div className="cell id-cell">
                  <span className="content-id">{item.content_key}</span>
                </div>

                {/* Type Column - matches Figma text15, text16, text17, text18, text19 */}
                <div className="cell type-cell">
                  <span className={`content-type ${item.category?.toLowerCase()}`}>
                    {item.category === 'dropdown' ? 'Дропдаун' : 
                     item.category === 'link' ? 'Ссылка' : 
                     item.category === 'text' ? 'Текст' : 
                     'Дропдаун'}
                  </span>
                </div>

                {/* RU Translation Column - matches Figma text20, text21 */}
                <div className="cell ru-cell">
                  {editingItem === item.id ? (
                    <input
                      type="text"
                      value={item.translations?.ru || ''}
                      onChange={(e) => handleTranslationChange(item.id, 'ru', e.target.value)}
                      className="translation-input"
                      placeholder="Русский перевод"
                    />
                  ) : (
                    <span className="translation-text">{item.translations?.ru || ''}</span>
                  )}
                </div>

                {/* HE Translation Column - matches Figma text23, text24 */}
                <div className="cell he-cell">
                  {editingItem === item.id ? (
                    <input
                      type="text"
                      value={item.translations?.he || ''}
                      onChange={(e) => handleTranslationChange(item.id, 'he', e.target.value)}
                      className="translation-input heb-input"
                      dir="rtl"
                      placeholder="תרגום עברי"
                    />
                  ) : (
                    <span className="translation-text heb-text" dir="rtl">{item.translations?.he || ''}</span>
                  )}
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