/**
 * ContentMenu Component
 * Menu translations management - displays and allows editing of menu component translations
 * Based on Figma design node-id=79-78410
 * 
 * @version 1.1.0
 * @since 2025-01-20
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiService } from '../../services/api';
import './ContentMenu.css';

interface MenuSection {
  id: string;
  content_key: string;
  component_type: string;
  category: string;
  screen_location: string;
  description: string;
  is_active: boolean;
  actionCount: number;
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
  menu_content: MenuSection[];
}

const ContentMenu: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuData, setMenuData] = useState<MenuData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(location.state?.searchTerm || '');
  const [currentPage, setCurrentPage] = useState(location.state?.fromPage || 1);

  const [selectedLanguage, setSelectedLanguage] = useState<'ru' | 'he' | 'en'>('ru');
  const itemsPerPage = 12;

  // Helper function to format date for display
  const formatLastModified = (dateString: string | null | undefined): string => {
    if (!dateString) {
      return 'Не изменялось';
    }
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Не изменялось';
      }
      
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      
      return `${day}.${month}.${year} | ${hours}:${minutes}`;
    } catch (error) {
      return 'Не изменялось';
    }
  };

  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        setLoading(true);
        console.log('🔄 Fetching menu content from database...');
        const response = await apiService.getMenuContent();
        
        if (response.success && response.data) {
          // Data is already normalized by apiService.getMenuContent
          const normalizedData: MenuData = {
            status: 'success',
            content_count: response.data.content_count,
            menu_content: response.data.menu_content
          };
          
          setMenuData(normalizedData);
          console.log('✅ Successfully loaded menu content:', normalizedData);
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




  const handleViewClick = (item: MenuSection) => {
    // Use the actual screen_location from the item
    const screenLocation = item.screen_location;
    
    console.log(`📍 Navigating to menu drill for item:`, item);
    console.log(`📍 Screen location: "${screenLocation}"`);
    console.log(`📍 Content key: "${item.content_key}"`);
    
    if (!screenLocation) {
      console.error('❌ No screen_location found for item:', item);
      return;
    }
    
    // Navigate to drill page using the actual screen_location
    navigate(`/content/menu/drill/${screenLocation}`, { 
      state: { 
        fromPage: currentPage,
        searchTerm: searchTerm 
      } 
    });
  };

  const filteredItems = useMemo(() => {
    if (!menuData?.menu_content) return [];
    return menuData.menu_content.filter(item =>
      item.content_key?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.translations?.ru?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.translations?.he?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.translations?.en?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [menuData?.menu_content, searchTerm]);

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

      {/* Main Content */}
      <div className="content-menu-main">
        {/* List of Pages Title */}
        <h2 className="page-list-title">Список страниц</h2>

        {/* Search Section - moved to top level */}
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

        {/* Table Section */}
        <div className="table-section">

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
                    <span 
                      className="text9" 
                      title={(() => {
                        const fullText = `${startIndex + index + 1}. ${
                          selectedLanguage === 'ru' ? item.translations.ru :
                          selectedLanguage === 'he' ? item.translations.he :
                          item.translations.en || item.content_key
                        }`;
                        return fullText.length > 30 ? fullText : undefined;
                      })()}
                    >
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
                {currentItems.map((item) => (
                  <React.Fragment key={`actions-${item.id}`}>
                    <div className="box4"></div>
                    <span className="text15">{item.actionCount || 1}</span>
                  </React.Fragment>
                ))}
              </div>

              {/* Column 3 - Last Modified */}
              <div className="column12">
                {currentItems.map((item) => (
                  <React.Fragment key={`modified-${item.id}`}>
                    <div className="box4"></div>
                    <span className="text20">{formatLastModified(item.last_modified)}</span>
                  </React.Fragment>
                ))}
              </div>

              {/* Column 4 - Actions */}
              <div className="column7">
                {currentItems.map((item) => (
                  <React.Fragment key={`action-${item.id}`}>
                    <div className="box6"></div>
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
                  </React.Fragment>
                ))}
              </div>
            </div>
            </div>
          </div>

          {/* Pagination */}
          <div className="row-view12">
            <span className="text18">
              Показывает {startIndex + 1}-{Math.min(endIndex, filteredItems.length)} из {filteredItems.length}
            </span>
            <div className="row-view13">
              <div 
                className="pagination-arrow left"
                onClick={() => setCurrentPage((prev: number) => Math.max(1, prev - 1))}
                style={{ opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M10 12L6 8L10 4" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              
              {/* Page 1 */}
              <div 
                className={currentPage === 1 ? "view6" : "view5"}
                onClick={() => setCurrentPage(1)}
                style={{ cursor: 'pointer' }}
              >
                <span className={currentPage === 1 ? "text20" : "text19"}>1</span>
              </div>
              
              {/* Show page 2 if total pages >= 2 */}
              {totalPages >= 2 && (
                <div 
                  className={currentPage === 2 ? "view6" : "view5"}
                  onClick={() => setCurrentPage(2)}
                  style={{ cursor: 'pointer' }}
                >
                  <span className={currentPage === 2 ? "text20" : "text19"}>2</span>
                </div>
              )}
              
              {/* Show page 3 if total pages >= 3 */}
              {totalPages >= 3 && (
                <div 
                  className={currentPage === 3 ? "view6" : "view5"}
                  onClick={() => setCurrentPage(3)}
                  style={{ cursor: 'pointer' }}
                >
                  <span className={currentPage === 3 ? "text20" : "text19"}>3</span>
                </div>
              )}
              
              {/* Show ellipsis if there are more than 4 pages */}
              {totalPages > 4 && (
                <div className="view5">
                  <span className="text19">...</span>
                </div>
              )}
              
              {/* Show last page if there are more than 3 pages */}
              {totalPages > 3 && (
                <div 
                  className={currentPage === totalPages ? "view6" : "view5"}
                  onClick={() => setCurrentPage(totalPages)}
                  style={{ cursor: 'pointer' }}
                >
                  <span className={currentPage === totalPages ? "text20" : "text19"}>{totalPages}</span>
                </div>
              )}
              
              <div 
                className="pagination-arrow right"
                onClick={() => setCurrentPage((prev: number) => Math.min(totalPages, prev + 1))}
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