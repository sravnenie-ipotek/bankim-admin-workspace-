import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import { ContentListItem } from '../ContentListBase/types';
import { useNavigate } from 'react-router-dom';
import './ContentMortgageTable.css';

const ContentMortgageTable: React.FC = () => {
  const { hasPermission } = useAuth();
  const navigate = useNavigate();
  
  // Quick login function for testing
  const quickLogin = (role: string) => {
    const ROLE_PERMISSIONS: Record<string, any[]> = {
      director: [
        { action: 'read', resource: 'calculator-formula' },
        { action: 'write', resource: 'calculator-formula' },
        { action: 'edit', resource: 'calculator-formula' },
        { action: 'delete', resource: 'calculator-formula' },
        { action: 'manage', resource: 'users' },
        { action: 'manage', resource: 'system' },
        { action: 'view', resource: 'audit-logs' },
        { action: 'manage', resource: 'content' },
        { action: 'read', resource: 'content-management' },
        { action: 'write', resource: 'content-management' },
        { action: 'edit', resource: 'content-management' },
        { action: 'delete', resource: 'content-management' },
        { action: 'manage', resource: 'sales' },
        { action: 'manage', resource: 'brokers' }
      ],
      'content-manager': [
        { action: 'read', resource: 'calculator-formula' },
        { action: 'manage', resource: 'content' },
        { action: 'read', resource: 'content-management' },
        { action: 'write', resource: 'content-management' },
        { action: 'manage', resource: 'media' }
      ]
    };
    
    const testUser = {
      id: `test_${role}`,
      email: `${role}@bankim.com`,
      name: `Test ${role}`,
      role: role,
      permissions: ROLE_PERMISSIONS[role] || []
    };
    localStorage.setItem('bankIM_admin_user', JSON.stringify(testUser));
    window.location.reload();
  };

  // Debug permission check
  const hasWritePermission = hasPermission('write', 'content-management');
  const hasReadPermission = hasPermission('read', 'content-management');
  const hasEditPermission = hasPermission('edit', 'content-management');
  
  // Log permissions for debugging
  console.log('ContentMortgageTable Debug:', {
    hasWritePermission,
    hasReadPermission,
    hasEditPermission
  });

  const [mortgageItems, setMortgageItems] = useState<ContentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchMortgageContent();
  }, []);

  const fetchMortgageContent = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getContentByContentType('mortgage');
      
      if (response.success && response.data) {
        setMortgageItems(response.data);
        console.log(`✅ Loaded ${response.data.length} mortgage items`);
      } else {
        setError('Не удалось загрузить данные');
      }
    } catch (err) {
      console.error('Error fetching mortgage content:', err);
      setError('Ошибка при загрузке данных');
    } finally {
      setLoading(false);
    }
  };

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return mortgageItems;
    
    const query = searchQuery.toLowerCase();
    return mortgageItems.filter(item => 
      item.title?.toLowerCase().includes(query) ||
      item.id?.toLowerCase().includes(query) ||
      item.pageNumber?.toString().includes(query)
    );
  }, [mortgageItems, searchQuery]);

  // Pagination logic
  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filteredItems.length);
    const currentItems = filteredItems.slice(startIndex, endIndex);
    
    return {
      totalPages,
      startIndex,
      endIndex,
      currentItems,
      totalItems: filteredItems.length
    };
  }, [filteredItems, currentPage, itemsPerPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleNavigate = (item: ContentListItem) => {
    // Navigate to edit page for the specific mortgage content item
    navigate(`/content/mortgage/edit/${item.id}`);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${day}.${month}.${year} | ${hours}:${minutes}`;
    } catch {
      return '01.08.2023 | 12:03';
    }
  };

  return (
    <div className="mortgage-table-container">
      {/* Debug Login Buttons - Hidden */}
      <div style={{ display: 'none' }}>
        <h4 style={{ color: 'white', margin: '0 0 10px 0' }}>Debug: Permission Testing</h4>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <button 
            onClick={() => quickLogin('director')} 
            style={{ padding: '5px 10px', background: '#FBE54D', color: 'black', border: 'none', borderRadius: '4px' }}
          >
            Login as Director
          </button>
          <button 
            onClick={() => quickLogin('content-manager')} 
            style={{ padding: '5px 10px', background: '#60A5FA', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            Login as Content Manager
          </button>
          <button 
            onClick={() => { localStorage.removeItem('bankIM_admin_user'); window.location.reload(); }} 
            style={{ padding: '5px 10px', background: '#EF4444', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            Logout
          </button>
        </div>
        <div style={{ color: 'white', fontSize: '12px' }}>
          Permissions: Write={hasWritePermission ? '✅' : '❌'} | Read={hasReadPermission ? '✅' : '❌'} | Edit={hasEditPermission ? '✅' : '❌'}
        </div>
      </div>

      {loading && (
        <div className="loading-state">Загрузка...</div>
      )}

      {error && (
        <div className="error-state">{error}</div>
      )}

      {!loading && !error && (
        <>
          {/* Header */}
          <div className="page-header">
            <h1 className="page-title">Рассчитать ипотеку</h1>
          </div>

          {/* Content Section */}
          <div className="content-section">
            <h2 className="page-title" style={{ padding: '24px 24px 16px', margin: 0, fontSize: '24px' }}>Список страниц</h2>
            
            {/* Search */}
            <div className="search-container">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="search-icon">
                <path d="M14 14L10.344 10.344M11.3333 6.66667C11.3333 9.24671 9.24671 11.3333 6.66667 11.3333C4.08662 11.3333 2 9.24671 2 6.66667C2 4.08662 4.08662 2 6.66667 2C9.24671 2 11.3333 4.08662 11.3333 6.66667Z" 
                      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <input
                type="text"
                className="search-input"
                placeholder="Искать по названию, ID, номеру страницы"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Table */}
            <div className="pages-table">
              <div className="table-header">
                <div className="header-cell page-name-cell">НАЗВАНИЕ СТРАНИЦЫ</div>
                <div className="header-cell actions-count-cell">КОЛИЧЕСТВО ДЕЙСТВИЙ</div>
                <div className="header-cell last-modified-cell">БЫЛИ ИЗМЕНЕНИЯ</div>
                <div className="header-cell action-buttons-cell"></div>
              </div>

              {/* Table Body */}
              <div className="table-body">
                {paginationData.currentItems.length === 0 ? (
                  <div className="empty-state" style={{ padding: '40px', textAlign: 'center', color: '#9CA3AF' }}>
                    <p>Нет данных для отображения</p>
                  </div>
                ) : (
                  paginationData.currentItems.map((item) => (
                    <div key={item.id} className="table-row">
                      <div className="table-cell page-name-cell">
                        <span className="page-name">{item.title}</span>
                      </div>
                      <div className="table-cell actions-count-cell">
                        <span className="action-count">{item.actionCount}</span>
                      </div>
                      <div className="table-cell last-modified-cell">
                        <span className="last-modified">{formatDate(item.lastModified)}</span>
                      </div>
                      <div className="table-cell action-buttons-cell">
                        <button 
                          className="navigate-button"
                          onClick={() => handleNavigate(item)}
                          title={`Редактировать страницу ${item.pageNumber}`}
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
              
              {/* Pagination */}
              {paginationData.totalPages > 1 && (
                <div className="pagination-container">
                  <span className="pagination-info">
                    Показывает {paginationData.startIndex + 1}-{paginationData.endIndex} из {paginationData.totalItems}
                  </span>
                  <div className="pagination-controls">
                    <button 
                      className="pagination-arrow" 
                      disabled={currentPage === 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    
                    {/* Page numbers */}
                    {(() => {
                      const pages = [];
                      const showEllipsisStart = currentPage > 3;
                      const showEllipsisEnd = currentPage < paginationData.totalPages - 2;
                      
                      // Always show first page
                      pages.push(
                        <button 
                          key={1}
                          className={`pagination-number ${currentPage === 1 ? 'active' : ''}`}
                          onClick={() => handlePageChange(1)}
                        >
                          1
                        </button>
                      );
                      
                      // Show ellipsis if needed
                      if (showEllipsisStart && currentPage > 4) {
                        pages.push(<span key="ellipsis-start" className="pagination-ellipsis">...</span>);
                      }
                      
                      // Show pages around current page
                      for (let i = Math.max(2, currentPage - 1); i <= Math.min(paginationData.totalPages - 1, currentPage + 1); i++) {
                        pages.push(
                          <button 
                            key={i}
                            className={`pagination-number ${currentPage === i ? 'active' : ''}`}
                            onClick={() => handlePageChange(i)}
                          >
                            {i}
                          </button>
                        );
                      }
                      
                      // Show ellipsis if needed
                      if (showEllipsisEnd && currentPage < paginationData.totalPages - 3) {
                        pages.push(<span key="ellipsis-end" className="pagination-ellipsis">...</span>);
                      }
                      
                      // Always show last page if there's more than one page
                      if (paginationData.totalPages > 1) {
                        pages.push(
                          <button 
                            key={paginationData.totalPages}
                            className={`pagination-number ${currentPage === paginationData.totalPages ? 'active' : ''}`}
                            onClick={() => handlePageChange(paginationData.totalPages)}
                          >
                            {paginationData.totalPages}
                          </button>
                        );
                      }
                      
                      return pages;
                    })()}
                    
                    <button 
                      className="pagination-arrow"
                      disabled={currentPage === paginationData.totalPages}
                      onClick={() => handlePageChange(currentPage + 1)}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ContentMortgageTable;