/**
 * ContentCredit Component
 * Credit calculation translations management - displays and allows editing of credit component translations
 * Based on ContentMain design structure (same as ContentMenu)
 * 
 * @version 2.0.0
 * @since 2025-01-20
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiService } from '../../services/api';
import { ContentPageWrapper } from '../../components/ContentPageWrapper';
import { ContentListItem } from '../ContentListBase/types';
import './ContentCredit.css';

interface CreditData {
  status: string;
  content_count: number;
  credit_items: ContentListItem[];
}

const ContentCredit: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [creditData, setCreditData] = useState<CreditData | null>(null);
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
    const fetchCreditData = async () => {
      try {
        setLoading(true);
        console.log('🔄 Fetching credit translations from database...');
        const response = await apiService.getContentByContentType('credit');
        
        if (response.success && response.data) {
          // Data is already normalized by apiService.getContentByContentType
          const normalizedData: CreditData = {
            status: 'success',
            content_count: response.data.length,
            credit_items: response.data
          };
          
          setCreditData(normalizedData);
          console.log('✅ Successfully loaded credit data:', normalizedData);
          console.log('First item:', response.data[0]); // Log first item to see structure
        } else {
          console.error('❌ Failed to fetch credit translations from database:', response.error);
          setError(response.error || 'Failed to fetch credit translations from database');
        }
      } catch (err) {
        console.error('❌ Error fetching credit data:', err);
        setError('Failed to load credit data');
      } finally {
        setLoading(false);
      }
    };

    fetchCreditData();
  }, []);

  const handleViewClick = (item: ContentListItem) => {
    // Use the actual screen_location from the item
    const screenLocation = item.screen_location;
    
    console.log(`📍 Navigating to credit drill for item:`, item);
    console.log(`📍 Screen location: "${screenLocation}"`);
    console.log(`📍 Content key: "${item.content_key}"`);
    
    if (!screenLocation) {
      console.error('❌ No screen_location found for item:', item);
      return;
    }
    
    // Navigate to drill page using the actual screen_location
    navigate(`/content/credit/drill/${screenLocation}`, { 
      state: { 
        fromPage: currentPage,
        searchTerm: searchTerm 
      } 
    });
  };

  const filteredItems = useMemo(() => {
    if (!creditData?.credit_items) return [];
    return creditData.credit_items.filter(item =>
      item.content_key?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.translations?.ru?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.translations?.he?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.translations?.en?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [creditData?.credit_items, searchTerm]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredItems.slice(startIndex, endIndex);

  if (loading) {
    return (
      <ContentPageWrapper title="Расчет кредита">
        <div className="content-main">
          <div className="content-main__content">
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Загрузка данных расчета кредита...</p>
            </div>
          </div>
        </div>
      </ContentPageWrapper>
    );
  }

  if (error) {
    return (
      <ContentPageWrapper title="Расчет кредита">
        <div className="content-main">
          <div className="content-main__content">
            <div className="error-container">
              <p>Ошибка: {error}</p>
              <button onClick={() => window.location.reload()}>Попробовать снова</button>
            </div>
          </div>
        </div>
      </ContentPageWrapper>
    );
  }

  return (
    <ContentPageWrapper title="Расчет кредита">
      <div className="content-main">
        {/* Page Header */}
        <div className="content-main__header">
          <h1 className="content-main__title">Расчет кредита</h1>
        </div>

        {/* Content Section */}
        <div className="content-main__content">
          <h2 className="content-main__subtitle">Список страниц</h2>
          
          <div className="content-main__table-container">
            {/* Search Bar */}
            <div className="content-main__search">
              <svg className="search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M14 14L10.344 10.344M11.3333 6.66667C11.3333 9.24671 9.24671 11.3333 6.66667 11.3333C4.08662 11.3333 2 9.24671 2 6.66667C2 4.08662 4.08662 2 6.66667 2C9.24671 2 11.3333 4.08662 11.3333 6.66667Z" 
                      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <input
                type="text"
                placeholder="Искать по названию, ID, номеру страницы"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            {/* Language Selector */}
            <div className="language-selector-container">
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
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>

            {/* Table */}
            <div className="content-main__table">
              {/* Table Header */}
              <div className="table-header">
                <div className="header-cell page-name">НАЗВАНИЕ СТРАНИЦЫ</div>
                <div className="header-cell actions-count">Количество действий</div>
                <div className="header-cell last-modified">Были изменения</div>
                <div className="header-cell actions"></div>
              </div>

              {/* Table Body */}
              <div className="table-body">
                {currentItems.map((item, index) => (
                  <div key={item.id} className="table-row">
                    <div className="table-cell page-name">
                      {(() => {
                        const pageNum = (item as any).page_number ?? (startIndex + index + 1);
                        const title = selectedLanguage === 'ru' ? (item.translations?.ru || item.content_key) :
                                     selectedLanguage === 'he' ? (item.translations?.he || item.content_key) :
                                     (item.translations?.en || item.content_key);
                        return `${pageNum}. ${title}`;
                      })()}
                    </div>
                    <div className="table-cell actions-count">
                      {item.actionCount || 1}
                    </div>
                    <div className="table-cell last-modified">
                      {formatLastModified(item.lastModified)}
                    </div>
                    <div className="table-cell actions">
                      <button 
                        className="action-button"
                        onClick={() => handleViewClick(item)}
                        aria-label={`Navigate to credit item`}
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
                Показывает {startIndex + 1}-{Math.min(endIndex, filteredItems.length)} из {filteredItems.length}
              </span>
              <div className="pagination-controls">
                <button 
                  className="pagination-btn prev"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
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
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
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

export default ContentCredit; 