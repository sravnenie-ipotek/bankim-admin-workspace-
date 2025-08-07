/**
 * ContentMenu Component
 * Menu translations management - displays and allows editing of menu component translations
 * Based on ContentMain design structure
 * 
 * @version 2.0.0
 * @since 2025-01-20
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { apiService } from '../../services/api';
import { ContentPageWrapper } from '../../components/ContentPageWrapper';
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
  page_number?: number;
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
  const { language, t } = useLanguage();
  const [menuData, setMenuData] = useState<MenuData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(location.state?.searchTerm || '');
  const [currentPage, setCurrentPage] = useState(location.state?.fromPage || 1);
  const itemsPerPage = 12;

  // Helper function to format date for display
  const formatLastModified = (dateString: string | null | undefined): string => {
    if (!dateString) {
      return t('content.notModified');
    }
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return t('content.notModified');
      }
      
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      
      return `${day}.${month}.${year} | ${hours}:${minutes}`;
    } catch (error) {
      return t('content.notModified');
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
          setError(response.error || t('content.error.loading'));
        }
      } catch (err) {
        console.error('❌ Error fetching menu data:', err);
        setError(t('content.error.loading'));
      } finally {
        setLoading(false);
      }
    };

    fetchMenuData();
  }, [language]); // Re-fetch when language changes

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
      <ContentPageWrapper title={t('menu.menu')}>
        <div className="content-main">
          <div className="content-main__content">
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>{t('content.loadingContent')}</p>
            </div>
          </div>
        </div>
      </ContentPageWrapper>
    );
  }

  if (error) {
    return (
      <ContentPageWrapper title={t('menu.menu')}>
        <div className="content-main">
          <div className="content-main__content">
            <div className="error-container">
              <p>{t('content.error.loading')}: {error}</p>
              <button onClick={() => window.location.reload()}>{t('actions.refresh')}</button>
            </div>
          </div>
        </div>
      </ContentPageWrapper>
    );
  }

  return (
    <ContentPageWrapper title={t('menu.menu')} showTabNavigation={false}>
      <div className="content-main">
        {/* Content Section */}
        <div className="content-main__content">
          <h2 className="content-main__subtitle">{t('content.pages.list')}</h2>
          
          <div className="content-main__table-container">
            {/* Search Bar */}
            <div className="content-main__search">
              <svg className="search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M14 14L10.344 10.344M11.3333 6.66667C11.3333 9.24671 9.24671 11.3333 6.66667 11.3333C4.08662 11.3333 2 9.24671 2 6.66667C2 4.08662 4.08662 2 6.66667 2C9.24671 2 11.3333 4.08662 11.3333 6.66667Z" 
                      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <input
                type="text"
                placeholder={t('content.search.placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>


            {/* Table */}
            <div className="content-main__table">
              {/* Table Header */}
              <div className="table-header">
                <div className="header-cell page-name">{t('content.table.pageName')}</div>
                <div className="header-cell actions-count">{t('content.table.actionCount')}</div>
                <div className="header-cell last-modified">{t('content.table.lastModified')}</div>
                <div className="header-cell actions"></div>
              </div>

              {/* Table Body */}
              <div className="table-body">
                {currentItems.map((item, index) => (
                  <div key={item.id} className="table-row">
                    <div className="table-cell page-name">
                      {(() => {
                        const pageNum = item.page_number ?? (startIndex + index + 1);
                        const title = language === 'ru' ? item.translations.ru :
                                     language === 'he' ? item.translations.he :
                                     item.translations.en || item.content_key;
                        return `${pageNum}. ${title}`;
                      })()}
                    </div>
                    <div className="table-cell actions-count">
                      {item.actionCount || 1}
                    </div>
                    <div className="table-cell last-modified">
                      {formatLastModified(item.last_modified)}
                    </div>
                    <div className="table-cell actions">
                      <button 
                        className="action-button"
                        onClick={() => handleViewClick(item)}
                        aria-label={`Navigate to menu item`}
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pagination */}
            <div className="content-main__pagination">
              <span className="pagination-info">
                {t('content.pagination.showing')} {startIndex + 1}-{Math.min(endIndex, filteredItems.length)} {t('content.pagination.of')} {filteredItems.length}
              </span>
              <div className="pagination-controls">
                                 <button 
                   className="pagination-btn prev"
                   onClick={() => setCurrentPage((prev: number) => Math.max(1, prev - 1))}
                   disabled={currentPage === 1}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                
                <div className="pagination-numbers">
                  <button 
                    className={`page-number ${currentPage === 1 ? 'active' : ''}`}
                    onClick={() => setCurrentPage(1)}
                  >
                    1
                  </button>
                  {totalPages > 1 && (
                    <button 
                      className={`page-number ${currentPage === 2 ? 'active' : ''}`}
                      onClick={() => setCurrentPage(2)}
                    >
                      2
                    </button>
                  )}
                  {totalPages > 2 && (
                    <button 
                      className={`page-number ${currentPage === 3 ? 'active' : ''}`}
                      onClick={() => setCurrentPage(3)}
                    >
                      3
                    </button>
                  )}
                  {totalPages > 4 && (
                    <span className="page-ellipsis">...</span>
                  )}
                  {totalPages > 3 && (
                    <button 
                      className={`page-number ${currentPage === totalPages ? 'active' : ''}`}
                      onClick={() => setCurrentPage(totalPages)}
                    >
                      {totalPages}
                    </button>
                  )}
                </div>
                
                                 <button 
                   className="pagination-btn next"
                   onClick={() => setCurrentPage((prev: number) => Math.min(totalPages, prev + 1))}
                   disabled={currentPage === totalPages}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ContentPageWrapper>
  );
};

export default ContentMenu;