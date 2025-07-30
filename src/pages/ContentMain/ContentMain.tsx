/**
 * ContentMain Component
 * Main content navigation hub for "Контент сайта" (Page 3 from Confluence)
 * 
 * Features:
 * - Navigation hub showing all content sections
 * - Simple card-based layout with action counts
 * - Links to specific content section pages
 * - Dark theme design matching system standards
 * 
 * Reference: Confluence Page 138903604 - "3. Контент сайта. Контент-менеджер/Копирайтер. Стр.3"
 * Figma: https://www.figma.com/file/Eenpc3kJRZHhxQNB2lkOxa/AP-node-id=128-127736
 * 
 * @version 2.0.0
 * @author BankIM Development Team
 * @since 2024-12-14
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import './ContentMain.css';

/**
 * Content page interface for table rows
 */
interface ContentPage {
  id: string;
  title: string;
  pageNumber: number;
  actionCount: number;
  lastModified: string;
  path: string;
}

const ContentMain: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [contentPages, setContentPages] = useState<ContentPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = 20;

  // Fetch content pages from API
  useEffect(() => {
    const fetchContentPages = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔄 Fetching content pages from API...');
        const response = await apiService.getSitePages();
        
        if (response.success && response.data) {
          console.log('✅ Content pages loaded from database:', response.data);
          setContentPages(response.data);
        } else {
          console.error('❌ Failed to load content pages:', response.error);
          setError(response.error || 'Failed to load content pages');
          
          // Fallback to hardcoded data
          console.log('📝 Using fallback hardcoded data...');
          setContentPages([
            {
              id: 'main',
              title: 'Главная',
              pageNumber: 1,
              actionCount: 7,
              lastModified: '15.12.2024, 02:00',
              path: '#'
            },
            {
              id: 'menu',
              title: 'Меню',
              pageNumber: 2,
              actionCount: 17,
              lastModified: '15.12.2024, 02:00',
              path: '/content/menu'
            },
            {
              id: 'mortgage',
              title: 'Рассчитать ипотеку',
              pageNumber: 3,
              actionCount: 12,
              lastModified: '15.12.2024, 02:00',
              path: '/content/mortgage'
            },
            {
              id: 'mortgage-refi',
              title: 'Рефинансирование ипотеки',
              pageNumber: 4,
              actionCount: 8,
              lastModified: '15.12.2024, 02:00',
              path: '/content/mortgage-refi'
            },
            {
              id: 'credit',
              title: 'Расчет кредита',
              pageNumber: 5,
              actionCount: 15,
              lastModified: '15.12.2024, 02:00',
              path: '/content/credit'
            },
            {
              id: 'credit-refi',
              title: 'Рефинансирование кредита',
              pageNumber: 6,
              actionCount: 6,
              lastModified: '15.12.2024, 02:00',
              path: '/content/credit-refi'
            },
            {
              id: 'general',
              title: 'Общие страницы',
              pageNumber: 7,
              actionCount: 23,
              lastModified: '15.12.2024, 02:00',
              path: '/content/general'
            }
          ]);
        }
      } catch (error) {
        console.error('❌ Error fetching content pages:', error);
        setError(error instanceof Error ? error.message : 'Unknown error occurred');
        
        // Fallback to hardcoded data on error
        console.log('📝 Using fallback hardcoded data due to error...');
        setContentPages([
          {
            id: 'main',
            title: 'Главная',
            pageNumber: 1,
            actionCount: 7,
            lastModified: '15.12.2024, 02:00',
            path: '/content/main/drill/main_page'
          },
          {
            id: 'menu',
            title: 'Меню',
            pageNumber: 2,
            actionCount: 17,
            lastModified: '15.12.2024, 02:00',
            path: '/content/menu'
          },
          {
            id: 'mortgage',
            title: 'Рассчитать ипотеку',
            pageNumber: 3,
            actionCount: 12,
            lastModified: '15.12.2024, 02:00',
            path: '/content/mortgage'
          },
          {
            id: 'mortgage-refi',
            title: 'Рефинансирование ипотеки',
            pageNumber: 4,
            actionCount: 8,
            lastModified: '15.12.2024, 02:00',
            path: '/content/mortgage-refi'
          },
          {
            id: 'credit',
            title: 'Расчет кредита',
            pageNumber: 5,
            actionCount: 15,
            lastModified: '15.12.2024, 02:00',
            path: '/content/credit'
          },
          {
            id: 'credit-refi',
            title: 'Рефинансирование кредита',
            pageNumber: 6,
            actionCount: 6,
            lastModified: '15.12.2024, 02:00',
            path: '/content/credit-refi'
          },
          {
            id: 'general',
            title: 'Общие страницы',
            pageNumber: 7,
            actionCount: 23,
            lastModified: '15.12.2024, 02:00',
            path: '/content/general'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchContentPages();
  }, []);

  // Filter pages based on search
  const filteredPages = contentPages.filter(page =>
    page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    page.pageNumber.toString().includes(searchQuery)
  );

  // Pagination
  const totalItems = filteredPages.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const displayedPages = filteredPages.slice(startIndex, endIndex);

  /**
   * Handle page navigation
   */
  const handlePageClick = (page: ContentPage) => {
    navigate(page.path);
  };

  return (
    <div className="content-main">
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          {/* Table */}
          <div className="content-main__table">
            {/* Table Header */}
            <div className="table-header">
              <div className="header-cell page-name">НАЗВАНИЕ СТРАНИЦЫ</div>
              <div className="header-cell actions-count">Количество действии</div>
              <div className="header-cell last-modified">Были изменения</div>
              <div className="header-cell actions"></div>
            </div>

            {/* Table Body */}
            <div className="table-body">
              {loading ? (
                <div className="loading-message">Загрузка страниц...</div>
              ) : error ? (
                <div className="error-message">Ошибка загрузки: {error}</div>
              ) : displayedPages.length === 0 ? (
                <div className="no-data-message">Нет данных для отображения.</div>
              ) : (
                displayedPages.map((page) => (
                  <div key={page.id} className="table-row">
                    <div className="table-cell page-name">
                      {page.title} Страница №{page.pageNumber}
                    </div>
                    <div className="table-cell actions-count">
                      {page.actionCount}
                    </div>
                    <div className="table-cell last-modified">
                      {page.lastModified}
                    </div>
                    <div className="table-cell actions">
                      <button 
                        className="action-button"
                        onClick={() => handlePageClick(page)}
                        aria-label={`Navigate to ${page.title}`}
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Pagination */}
          <div className="content-main__pagination">
            <span className="pagination-info">
              Показывает {startIndex + 1}-{endIndex} из {totalItems}
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
  );
};

export default ContentMain;