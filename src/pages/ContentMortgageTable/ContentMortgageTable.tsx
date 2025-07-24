import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
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
                <div className="table-row">
                  <div className="table-cell page-name-cell">
                    <span className="page-name">2.Калькулятор ипотеки.</span>
                  </div>
                  <div className="table-cell actions-count-cell">
                    <span className="action-count">15</span>
                  </div>
                  <div className="table-cell last-modified-cell">
                    <span className="last-modified">01.08.2023 | 12:03</span>
                  </div>
                  <div className="table-cell action-buttons-cell">
                    <button className="navigate-button">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="table-row">
                  <div className="table-cell page-name-cell">
                    <span className="page-name">4.Анкета личных данных</span>
                  </div>
                  <div className="table-cell actions-count-cell">
                    <span className="action-count">23</span>
                  </div>
                  <div className="table-cell last-modified-cell">
                    <span className="last-modified">01.08.2023 | 12:03</span>
                  </div>
                  <div className="table-cell action-buttons-cell">
                    <button className="navigate-button">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="table-row">
                  <div className="table-cell page-name-cell">
                    <span className="page-name">7.Анкета доходов. Наемный работник</span>
                  </div>
                  <div className="table-cell actions-count-cell">
                    <span className="action-count">22</span>
                  </div>
                  <div className="table-cell last-modified-cell">
                    <span className="last-modified">01.08.2023 | 12:03</span>
                  </div>
                  <div className="table-cell action-buttons-cell">
                    <button className="navigate-button">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="table-row">
                  <div className="table-cell page-name-cell">
                    <span className="page-name">7.1 Добавление источника дохода</span>
                  </div>
                  <div className="table-cell actions-count-cell">
                    <span className="action-count">9</span>
                  </div>
                  <div className="table-cell last-modified-cell">
                    <span className="last-modified">01.08.2023 | 12:03</span>
                  </div>
                  <div className="table-cell action-buttons-cell">
                    <button className="navigate-button">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="table-row">
                  <div className="table-cell page-name-cell">
                    <span className="page-name">7.2 Добавление доп источника дохода</span>
                  </div>
                  <div className="table-cell actions-count-cell">
                    <span className="action-count">5</span>
                  </div>
                  <div className="table-cell last-modified-cell">
                    <span className="last-modified">01.08.2023 | 12:03</span>
                  </div>
                  <div className="table-cell action-buttons-cell">
                    <button className="navigate-button">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="table-row">
                  <div className="table-cell page-name-cell">
                    <span className="page-name">7.3 Добавление долгового обязательства</span>
                  </div>
                  <div className="table-cell actions-count-cell">
                    <span className="action-count">7</span>
                  </div>
                  <div className="table-cell last-modified-cell">
                    <span className="last-modified">01.08.2023 | 12:03</span>
                  </div>
                  <div className="table-cell action-buttons-cell">
                    <button className="navigate-button">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="table-row">
                  <div className="table-cell page-name-cell">
                    <span className="page-name">11. Выбор программ ипотеки</span>
                  </div>
                  <div className="table-cell actions-count-cell">
                    <span className="action-count">11</span>
                  </div>
                  <div className="table-cell last-modified-cell">
                    <span className="last-modified">01.08.2023 | 12:03</span>
                  </div>
                  <div className="table-cell action-buttons-cell">
                    <button className="navigate-button">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="table-row">
                  <div className="table-cell page-name-cell">
                    <span className="page-name">11.1 Детали банка. Описание</span>
                  </div>
                  <div className="table-cell actions-count-cell">
                    <span className="action-count">3</span>
                  </div>
                  <div className="table-cell last-modified-cell">
                    <span className="last-modified">01.08.2023 | 12:03</span>
                  </div>
                  <div className="table-cell action-buttons-cell">
                    <button className="navigate-button">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="table-row">
                  <div className="table-cell page-name-cell">
                    <span className="page-name">11.2 Детали банка. Условия</span>
                  </div>
                  <div className="table-cell actions-count-cell">
                    <span className="action-count">3</span>
                  </div>
                  <div className="table-cell last-modified-cell">
                    <span className="last-modified">01.08.2023 | 12:03</span>
                  </div>
                  <div className="table-cell action-buttons-cell">
                    <button className="navigate-button">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Pagination */}
              <div className="pagination-container">
                <span className="pagination-info">
                  Показывает 1-20 из 1000
                </span>
                <div className="pagination-controls">
                  <button className="pagination-arrow" disabled>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <button className="pagination-number">1</button>
                  <button className="pagination-number active">2</button>
                  <button className="pagination-number">3</button>
                  <span className="pagination-ellipsis">...</span>
                  <button className="pagination-number">100</button>
                  <button className="pagination-arrow">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ContentMortgageTable;