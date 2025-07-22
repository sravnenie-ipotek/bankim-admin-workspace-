import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import { ContentListItem } from './types';
import './ContentListBase.css';

/**
 * ContentListBaseProps interface defines the props for the reusable content list component
 * @param sectionTitle - The title of the content section (e.g., "Рассчитать ипотеку")
 * @param contentType - The type of content to filter by (e.g., "mortgage", "credit")
 * @param breadcrumbItems - Array of breadcrumb navigation items
 */
interface ContentListBaseProps {
  sectionTitle: string;
  contentType: string;
  breadcrumbItems?: Array<{ label: string; isActive?: boolean }>;
}

/**
 * ContentListBase is a reusable component that displays filtered content lists
 * following the Confluence Page 3 specification. It handles search, pagination,
 * and action buttons while avoiding code duplication across content sections.
 */
export const ContentListBase: React.FC<ContentListBaseProps> = ({
  sectionTitle,
  contentType,
  breadcrumbItems = []
}) => {
  // Authentication context for permission checks
  const { user, hasPermission } = useAuth();
  
  // State management for component data and UI
  const [contentPages, setContentPages] = useState<ContentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Pagination configuration
  const itemsPerPage = 20;

  /**
   * Fetch content data from API on component mount
   * Filters content by contentType and handles error states
   */
  useEffect(() => {
    const fetchContentData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch content based on content type
        const response = await apiService.getContentByContentType(contentType);
        
        if (response.success && response.data) {
          // Ensure response.data is an array
          const data = Array.isArray(response.data) ? response.data : [];
          setContentPages(data);
          console.log(`✅ Loaded ${data.length} items for ${contentType}:`, data);
        } else {
          console.warn(`⚠️ API response failed for ${contentType}:`, response);
          // Set empty array on API failure
          setContentPages([]);
          throw new Error(response.error || 'Failed to fetch content data');
        }
      } catch (err) {
        console.error(`❌ Error fetching ${contentType} content:`, err);
        // Ensure we always have an empty array on error
        setContentPages([]);
        setError('Не удалось загрузить данные. Попробуйте еще раз.');
      } finally {
        setLoading(false);
      }
    };

    fetchContentData();
  }, [contentType]);

  /**
   * Filter content pages based on search query
   * Searches across page title, ID, and content fields
   */
  const filteredPages = useMemo(() => {
    // Ensure contentPages is always an array
    const pages = Array.isArray(contentPages) ? contentPages : [];
    
    if (!searchQuery.trim()) return pages;
    
    const query = searchQuery.toLowerCase();
    return pages.filter(page => 
      page.title?.toLowerCase().includes(query) ||
      page.id?.toString().includes(query) ||
      page.pageNumber?.toString().includes(query)
    );
  }, [contentPages, searchQuery]);

  /**
   * Calculate pagination values for current page
   */
  const paginationData = useMemo(() => {
    // Ensure filteredPages is always an array
    const pages = Array.isArray(filteredPages) ? filteredPages : [];
    
    const totalPages = Math.ceil(pages.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, pages.length);
    const currentItems = pages.slice(startIndex, endIndex);
    
    return {
      totalPages,
      startIndex: startIndex + 1,
      endIndex,
      currentItems,
      totalItems: pages.length
    };
  }, [filteredPages, currentPage, itemsPerPage]);

  /**
   * Handle search input changes with debouncing
   */
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  /**
   * Handle page navigation clicks
   */
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= paginationData.totalPages) {
      setCurrentPage(page);
    }
  };

  /**
   * Handle edit action - navigates to appropriate edit page based on content type
   */
  const handleEditClick = (page: ContentListItem) => {
    if (!hasPermission('write/content-management')) {
      console.log('No edit permission for user:', user?.role);
      return;
    }

    const editPath = `/content/main/action/${page.id}`;
    window.location.href = editPath;
  };

  /**
   * Handle view action - opens page preview in new tab
   */
  const handleViewClick = (page: ContentListItem) => {
    const previewUrl = `/preview/${contentType}/${page.id}`;
    window.open(previewUrl, '_blank');
  };

  /**
   * Render breadcrumb navigation if items provided
   */
  const renderBreadcrumbs = () => {
    if (!breadcrumbItems.length) return null;

    return (
      <div className="breadcrumb-container">
        {breadcrumbItems.map((item, index) => (
          <React.Fragment key={index}>
            <span className={`breadcrumb-item ${item.isActive ? 'active' : ''}`}>
              {item.label}
            </span>
            {index < breadcrumbItems.length - 1 && (
              <span className="breadcrumb-separator">›</span>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  /**
   * Render pagination controls with page numbers and navigation arrows
   */
  const renderPagination = () => {
    const { totalPages } = paginationData;
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    // Calculate visible page range
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // Adjust if we're near the end
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Add page numbers
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="pagination-container">
        <span className="pagination-info">
          Показывает {paginationData.startIndex}-{paginationData.endIndex} из {paginationData.totalItems}
        </span>
        <div className="pagination-controls">
          {/* Previous page arrow */}
          <button 
            className="pagination-arrow"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Page numbers */}
          {startPage > 1 && (
            <>
              <button
                className="pagination-number"
                onClick={() => handlePageChange(1)}
              >
                1
              </button>
              {startPage > 2 && <span className="pagination-ellipsis">...</span>}
            </>
          )}

          {pageNumbers.map(pageNum => (
            <button
              key={pageNum}
              className={`pagination-number ${pageNum === currentPage ? 'active' : ''}`}
              onClick={() => handlePageChange(pageNum)}
            >
              {pageNum}
            </button>
          ))}

          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <span className="pagination-ellipsis">...</span>}
              <button
                className="pagination-number"
                onClick={() => handlePageChange(totalPages)}
              >
                {totalPages}
              </button>
            </>
          )}

          {/* Next page arrow */}
          <button 
            className="pagination-arrow"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="content-list-container">
        <div className="loading-state">Загрузка...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="content-list-container">
        <div className="error-state">{error}</div>
      </div>
    );
  }

  return (
    <div className="content-list-container">
      {/* Page header */}
      <div className="page-header">
        <h1 className="page-title">{sectionTitle}</h1>
        {renderBreadcrumbs()}
      </div>

      {/* Content tabs - following Figma design pattern */}
      <div className="content-tabs">
        <div className="tab active">До регистрации</div>
        <div className="tab">Личный кабинет</div>
        <div className="tab">Админ панель для сайтов</div>
        <div className="tab">Админ панель для банков</div>
      </div>

      {/* Main content section */}
      <div className="content-section">
        <h2 className="section-title">Список страниц</h2>
        
        {/* Search box */}
        <div className="search-container">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="search-icon">
            <path d="M14 14L10.344 10.344M11.3333 6.66667C11.3333 9.24671 9.24671 11.3333 6.66667 11.3333C4.08662 11.3333 2 9.24671 2 6.66667C2 4.08662 4.08662 2 6.66667 2C9.24671 2 11.3333 4.08662 11.3333 6.66667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Искать по названию, ID, номеру страницы"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>

        {/* Content table */}
        <div className="content-table">
          {/* Table header */}
          <div className="table-header">
            <div className="header-cell title-cell">НАЗВАНИЕ СТРАНИЦЫ</div>
            <div className="header-cell count-cell">Количество действии</div>
            <div className="header-cell date-cell">Были изменения</div>
            <div className="header-cell actions-cell"></div>
          </div>

          {/* Table body */}
          <div className="table-body">
            {paginationData.currentItems.length === 0 ? (
              <div className="empty-state">
                Страницы не найдены
              </div>
            ) : (
              paginationData.currentItems.map((page) => (
                <div key={page.id} className="table-row">
                  <div className="table-cell title-cell">
                    <span className="page-title-text">{page.title}</span>
                  </div>
                  <div className="table-cell count-cell">
                    <span className="action-count">{page.actionCount || 0}</span>
                  </div>
                  <div className="table-cell date-cell">
                    <span className="last-modified">
                      {page.lastModified ? 
                        new Date(page.lastModified).toLocaleDateString('ru-RU', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }).replace(',', ' |') : 
                        '—'
                      }
                    </span>
                  </div>
                  <div className="table-cell actions-cell">
                    <div className="action-buttons">
                      <button
                        className="action-button view-button"
                        onClick={() => handleViewClick(page)}
                        title="Просмотр"
                      >
                        <img src="/src/assets/images/static/icons/eye.svg" alt="View" />
                      </button>
                      {hasPermission('write/content-management') && (
                        <button
                          className="action-button edit-button"
                          onClick={() => handleEditClick(page)}
                          title="Редактировать"
                        >
                          <img src="/src/assets/images/static/icons/pencil.svg" alt="Edit" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pagination */}
        {renderPagination()}
      </div>
    </div>
  );
};

export default ContentListBase; 