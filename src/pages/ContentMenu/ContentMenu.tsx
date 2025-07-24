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
  const [selectedLanguage, setSelectedLanguage] = useState<'ru' | 'he' | 'en'>('ru');
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
            const normalizedItems = data.menu_items.map((item: any) => {
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
      console.log('Saving translations for item:', itemId, editedTranslations);
      
      // Find the item to get its current data
      const item = menuData?.menu_items.find(i => i.id === itemId);
      if (!item) {
        console.error('Item not found');
        return;
      }
      
      // Save Russian translation
      if (editedTranslations.ru !== item.translations.ru) {
        const ruResponse = await apiService.updateMenuTranslation(itemId, 'ru', editedTranslations.ru);
        if (!ruResponse.success) {
          console.error('Failed to save Russian translation:', ruResponse.error);
          alert('Ошибка при сохранении русского перевода');
          return;
        }
      }
      
      // Save Hebrew translation
      if (editedTranslations.he !== item.translations.he) {
        const heResponse = await apiService.updateMenuTranslation(itemId, 'he', editedTranslations.he);
        if (!heResponse.success) {
          console.error('Failed to save Hebrew translation:', heResponse.error);
          alert('Ошибка при сохранении перевода на иврите');
          return;
        }
      }
      
      // Update local state
      if (menuData) {
        const updatedItems = menuData.menu_items.map(i => 
          i.id === itemId 
            ? { ...i, translations: { ...i.translations, ru: editedTranslations.ru, he: editedTranslations.he } }
            : i
        );
        setMenuData({ ...menuData, menu_items: updatedItems });
      }
      
      setEditingId(null);
      console.log('✅ Translations saved successfully');
    } catch (error) {
      console.error('Error saving translations:', error);
      alert('Произошла ошибка при сохранении');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditedTranslations({ ru: '', he: '' });
  };

  const handleViewClick = (item: MenuTranslation) => {
    // Navigate to edit page using the same pattern as mortgage
    navigate(`/content/menu/edit/${item.id}`);
  };

  // handleDeleteClick removed as it's not used in current implementation
  // It was likely for a future feature that wasn't implemented yet

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
      {/* Main Content Frame - wraps everything except sidebar */}
      <div className="column2">
        {/* Top Navigation Bar - matches Figma Navbar Admin panel */}
        <div className="navbar-admin-panel">
          <div className="language-selector" onClick={() => {
            // Cycle through languages
            if (selectedLanguage === 'ru') setSelectedLanguage('he');
            else if (selectedLanguage === 'he') setSelectedLanguage('en');
            else setSelectedLanguage('ru');
          }}>
            <span className="language-text">
              {selectedLanguage === 'ru' ? 'Русский' : 
               selectedLanguage === 'he' ? 'עברית' : 
               'English'}
            </span>
            <img src="/src/assets/images/static/icons/chevron-down.svg" alt="Chevron" className="image2" />
          </div>
          <img src="/src/assets/images/static/icons/headset.svg" alt="Support" className="image5" />
          <img src="/src/assets/images/static/icons/bell.svg" alt="Notifications" className="image5" />
          <div className="profile-section">
            <img src="/src/assets/images/static/profile-avatar.png" alt="Profile" className="image6" />
            <div className="view">
              <span className="profile-name">Александр Пушкин</span>
            </div>
            <img src="/src/assets/images/static/icons/chevron-right.svg" alt="Profile Menu" className="image2" />
          </div>
        </div>

      {/* Main Content Frame */}
      <div className="main-content-frame">
        {/* Page Title */}
        <h1 className="page-title">Меню</h1>

        {/* List of Pages Title */}
        <h2 className="page-list-title">Список страниц</h2>

        {/* Table Section */}
        <div className="table-section">
          {/* Table Header with Search and Filters */}
          <div className="table-header-controls">
            <div className="search-container">
              <div className="search-input-wrapper">
                <svg className="search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M7.333 12.667A5.333 5.333 0 1 0 7.333 2a5.333 5.333 0 0 0 0 10.667zM14 14l-2.9-2.9" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <input
                  type="text"
                  placeholder="Искать по названию, ID, номеру страницы"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>
          </div>

          {/* Table Content - Column Layout */}
          <div className="menu-table">
            {/* Table Header Row */}
            <div className="table-header-row">
              <div className="header-cell column6">
                <span className="text8">НАЗВАНИЕ СТРАНИЦЫ</span>
              </div>
              <div className="header-cell column12">
                <span className="text10">Количество действий</span>
              </div>
              <div className="header-cell column12">
                <span className="text10">Были изменения</span>
              </div>
              <div className="header-cell column7"></div>
            </div>
            
            <div className="table-divider"></div>
            
            <div className="row-view11">
              {/* Column 1 - Page Names */}
              <div className="column6">
                {currentItems.map((item, index) => (
                  <React.Fragment key={`name-${item.id}`}>
                    <div className="box3"></div>
                    <span className="text9">
                      {`${startIndex + index + 1}. ${
                        selectedLanguage === 'ru' ? item.translations.ru :
                        selectedLanguage === 'he' ? item.translations.he :
                        item.translations.en || item.content_key
                      }`}
                    </span>
                  </React.Fragment>
                ))}
              </div>

              {/* Column 2 - Number of Actions */}
              <div className="column12">
                {currentItems.map((item, index) => {
                  // Mock data for number of actions - randomize between 2 and 46
                  const actionCount = Math.floor(Math.random() * 44) + 2;
                  return (
                    <React.Fragment key={`actions-${item.id}`}>
                      <div className="box4"></div>
                      <span className="text15">{actionCount}</span>
                    </React.Fragment>
                  );
                })}
              </div>

              {/* Column 3 - Last Modified */}
              <div className="column12">
                {currentItems.map((item, index) => (
                  <React.Fragment key={`modified-${item.id}`}>
                    <div className="box4"></div>
                    <span className="text20">01.08.2023 | 12:03</span>
                  </React.Fragment>
                ))}
              </div>

              {/* Column 4 - Actions */}
              <div className="column7">
                {currentItems.map((item, index) => (
                  <React.Fragment key={`action-${item.id}`}>
                    <div className="box6"></div>
                    {editingId === item.id ? (
                      <div style={{ display: 'flex', gap: '8px', padding: '8px' }}>
                        <button onClick={() => handleSave(item.id)} className="save-btn">✓</button>
                        <button onClick={handleCancelEdit} className="cancel-btn">✗</button>
                      </div>
                    ) : (
                      <div
                        className="image8"
                        onClick={() => handleViewClick(item)}
                        style={{ 
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '24px',
                          color: '#FFFFFF',
                          backgroundColor: 'transparent',
                          border: '1px solid #374151'
                        }}
                      >
                        →
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
            </div>
          </div>

          {/* Pagination */}
          <div className="row-view12">
            <span className="text18">
              Показывает 1-20 из 1000
            </span>
            <div className="row-view13">
              <div 
                className="pagination-arrow left"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                style={{ opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M10 12L6 8L10 4" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="view5">
                <span className="text19">1</span>
              </div>
              <div className="view6">
                <span className="text20">2</span>
              </div>
              <div className="view5">
                <span className="text19">3</span>
              </div>
              <div className="view5">
                <span className="text19">...</span>
              </div>
              <div className="view5">
                <span className="text19">100</span>
              </div>
              <div 
                className="pagination-arrow right"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                style={{ opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M6 12L10 8L6 4" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentMenu;