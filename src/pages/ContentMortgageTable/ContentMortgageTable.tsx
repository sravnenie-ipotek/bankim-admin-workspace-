import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import './ContentMortgageTable.css';

interface MortgageItem {
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

const ContentMortgageTable: React.FC = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  
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
  const hasAllPermissions = hasPermission;
  
  // Log permissions for debugging
  console.log('ContentMortgageTable Debug:', {
    hasWritePermission,
    hasReadPermission,
    hasEditPermission
  });

  const [mortgageItems, setMortgageItems] = useState<MortgageItem[]>([]);
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
      
      const response = await fetch('http://localhost:3001/api/content/mortgage');
      const data = await response.json();
      
      if (data.success && data.data?.mortgage_content) {
        setMortgageItems(data.data.mortgage_content);
        console.log(`✅ Loaded ${data.data.mortgage_content.length} mortgage items`);
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

  // Filter items based on search
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return mortgageItems;
    
    const query = searchQuery.toLowerCase();
    return mortgageItems.filter(item => 
      item.content_key?.toLowerCase().includes(query) ||
      item.translations.ru?.toLowerCase().includes(query) ||
      item.translations.he?.includes(query) ||
      item.translations.en?.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query)
    );
  }, [mortgageItems, searchQuery]);

  // Pagination
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
  }, [filteredItems, currentPage]);

  const handleEditClick = (item: MortgageItem) => {
    navigate(`/content/mortgage/edit/${item.id}`);
  };

  const handleDropdownClick = (item: MortgageItem) => {
    // Navigate to dropdown options page
    navigate(`/content/mortgage/dropdown/${item.id}`);
  };

  const getComponentTypeDisplay = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'dropdown':
      case 'select':
        return 'Дропдаун';
      case 'text':
      case 'label':
        return 'Текст';
      case 'button':
        return 'Кнопка';
      case 'link':
        return 'Ссылка';
      case 'option':
        return 'Опция';
      case 'placeholder':
        return 'Плейсхолдер';
      default:
        return type || 'Текст';
    }
  };

  const getContentId = (contentKey: string) => {
    // Extract meaningful ID from content_key
    const parts = contentKey.split('.');
    return parts[parts.length - 1] || contentKey;
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= paginationData.totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="mortgage-table-container">
      {/* Debug Login Buttons */}
      <div style={{ padding: '10px', background: '#374151', margin: '10px 0', borderRadius: '4px' }}>
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
        <div className="mortgage-table">
          {/* Header */}
          <div className="page-header">
            <h1 className="page-title">Рассчитать ипотеку</h1>
            <div className="breadcrumb">
              <span className="breadcrumb-item">Контент сайта</span>
              <span className="breadcrumb-separator">›</span>
              <span className="breadcrumb-item active">Рассчитать ипотеку</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="content-tabs">
            <div className="tab active">До регистрации</div>
            <div className="tab">Личный кабинет</div>
            <div className="tab">Админ панель для сайтов</div>
            <div className="tab">Админ панель для банков</div>
          </div>

          {/* Content Section */}
          <div className="content-section">
            <h2 className="section-title">Список элементов</h2>
            
            {/* Search */}
            <div className="search-container">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="search-icon">
                <path d="M14 14L10.344 10.344M11.3333 6.66667C11.3333 9.24671 9.24671 11.3333 6.66667 11.3333C4.08662 11.3333 2 9.24671 2 6.66667C2 4.08662 4.08662 2 6.66667 2C9.24671 2 11.3333 4.08662 11.3333 6.66667Z" 
                      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <input
                type="text"
                className="search-input"
                placeholder="Искать по ключу, тексту, описанию"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Table */}
            <div className="table-header">
              <div className="header-cell number-cell">Номер действия</div>
              <div className="header-cell id-cell">ID</div>
              <div className="header-cell type-cell">Тип</div>
              <div className="header-cell ru-cell">RU</div>
              <div className="header-cell he-cell">HEB</div>
              <div className="header-cell actions-cell"></div>
            </div>

            {/* Table Body */}
            <div className="table-body">
              {paginationData.currentItems.length === 0 ? (
                <div className="empty-state">
                  Элементы не найдены
                </div>
              ) : (
                paginationData.currentItems.map((item, index) => (
                  <div key={item.id} className="table-row">
                    <div className="table-cell number-cell">
                      <span className="action-number">
                        {paginationData.startIndex + index + 1}.
                      </span>
                    </div>
                    <div className="table-cell id-cell">
                      <span className="content-id">{getContentId(item.content_key)}</span>
                    </div>
                    <div className="table-cell type-cell">
                      <span className={`content-type ${item.component_type?.toLowerCase()}`}>
                        {getComponentTypeDisplay(item.component_type)}
                      </span>
                    </div>
                    <div className="table-cell ru-cell">
                      <span className="translation-text">{item.translations.ru}</span>
                    </div>
                    <div className="table-cell he-cell">
                      <span className="translation-text heb-text" dir="rtl">
                        {item.translations.he}
                      </span>
                    </div>
                    <div className="table-cell actions-cell">
                      <div className="action-buttons">
                        {item.component_type?.toLowerCase() === 'dropdown' ? (
                          <button
                            className="action-button dropdown-button"
                            onClick={() => handleDropdownClick(item)}
                            title="Перейти к опциям"
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="2" 
                                    strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        ) : (
                          <div>
                            {/* Always show edit button for debugging */}
                            <button
                              className="action-button edit-button"
                              onClick={() => handleEditClick(item)}
                              title="Редактировать"
                              style={{ opacity: hasWritePermission ? 1 : 0.5 }}
                            >
                              <img src="/src/assets/images/static/icons/pencil.svg" alt="Edit" />
                            </button>
                            {/* Debug info */}
                            <small style={{ display: 'block', fontSize: '10px', color: hasWritePermission ? 'green' : 'red' }}>
                              {hasWritePermission ? 'Has Permission' : 'No Permission'}
                            </small>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
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
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  ‹
                </button>
                
                {[...Array(paginationData.totalPages)].map((_, i) => {
                  const page = i + 1;
                  if (
                    page === 1 ||
                    page === paginationData.totalPages ||
                    (page >= currentPage - 2 && page <= currentPage + 2)
                  ) {
                    return (
                      <button
                        key={page}
                        className={`pagination-number ${page === currentPage ? 'active' : ''}`}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </button>
                    );
                  } else if (
                    page === currentPage - 3 ||
                    page === currentPage + 3
                  ) {
                    return <span key={page} className="pagination-ellipsis">...</span>;
                  }
                  return null;
                })}
                
                <button 
                  className="pagination-arrow"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === paginationData.totalPages}
                >
                  ›
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ContentMortgageTable;