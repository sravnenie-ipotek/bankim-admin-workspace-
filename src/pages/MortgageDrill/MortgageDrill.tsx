/**
 * MortgageDrill Component
 * Drill-down page showing detailed actions for a specific mortgage page
 * Based on calculateMortgrate_drill1.md design structure
 * 
 * @version 1.0.0
 * @since 2025-01-26
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { apiService } from '../../services/api';
import { Pagination } from '../../components';
import './MortgageDrill.css';

interface MortgageAction {
  id: string;
  actionNumber: number;
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

interface MortgageDrillData {
  pageTitle: string;
  actionCount: number;
  lastModified: string;
  actions: MortgageAction[];
}

const MortgageDrill: React.FC = () => {
  const { pageId } = useParams<{ pageId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [drillData, setDrillData] = useState<MortgageDrillData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLanguage, setSelectedLanguage] = useState<'ru' | 'he' | 'en'>('ru');
  const itemsPerPage = 20; // Show more items per page to accommodate all mortgage content

  useEffect(() => {
    fetchDrillData();
  }, [pageId]);

  const fetchDrillData = async () => {
    try {
      setLoading(true);
      console.log(`🔍 Fetching drill data for step ID: ${pageId}`);
      
      // Try the backend drill endpoint first
      try {
        const drillResponse = await apiService.request(`/api/content/mortgage/drill/${pageId}`, 'GET');
        
        if (drillResponse.success && drillResponse.data) {
          const { pageTitle, stepGroup, actionCount, actions } = drillResponse.data;

          // Transform to drill data format
          const transformedActions: MortgageAction[] = actions.map((item: any) => ({
            id: item.id,
            actionNumber: item.actionNumber,
            content_key: item.content_key || '',
            component_type: item.component_type || 'text',
            category: item.category || '',
            screen_location: item.screen_location || '',
            description: item.description || '',
            is_active: item.is_active !== false,
            translations: {
              ru: item.translations?.ru || '',
              he: item.translations?.he || '',
              en: item.translations?.en || ''
            },
            last_modified: item.last_modified || new Date().toISOString()
          }));

          setDrillData({
            pageTitle: pageTitle,
            actionCount: actionCount,
            lastModified: transformedActions.length > 0 ? 
              transformedActions.reduce((latest, action) => 
                new Date(action.last_modified) > new Date(latest) ? action.last_modified : latest, 
                transformedActions[0].last_modified
              ) : new Date().toISOString(),
            actions: transformedActions
          });
          return;
        }
      } catch (drillError) {
        console.warn('Drill endpoint failed, falling back to all mortgage content items:', drillError);
      }
      
      // Fallback: get all individual mortgage content items across all steps
      const response = await apiService.request('/api/content/mortgage/all-items', 'GET');
      
      if (response.success && response.data) {
        // Use the data from the new all-items endpoint
        const { pageTitle, actionCount, actions: allActions } = response.data;

        // Transform to drill data format 
        const actions: MortgageAction[] = allActions.map((item: any) => ({
          id: item.id,
          actionNumber: item.actionNumber,
          content_key: item.content_key || '',
          component_type: item.component_type || 'text',
          category: item.category || '',
          screen_location: item.screen_location || '',
          description: item.description || '',
          is_active: item.is_active !== false,
          translations: {
            ru: item.translations?.ru || '',
            he: item.translations?.he || '',
            en: item.translations?.en || ''
          },
          last_modified: item.last_modified || new Date().toISOString()
        }));

        setDrillData({
          pageTitle: pageTitle,
          actionCount: actionCount,
          lastModified: actions.length > 0 ? 
            actions.reduce((latest, action) => 
              new Date(action.last_modified) > new Date(latest) ? action.last_modified : latest, 
              actions[0].last_modified
            ) : new Date().toISOString(),
          actions: actions
        });
      } else {
        setError('Не удалось загрузить данные');
      }
    } catch (err) {
      console.error('❌ Error fetching drill data:', err);
      setError('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (action: MortgageAction) => {
    // Navigate to edit page for this specific action
    navigate(`/content/mortgage/edit/${action.id}`, { 
      state: { 
        fromPage: currentPage,
        searchTerm: searchTerm,
        returnPath: `/content/mortgage/drill/${pageId}`
      } 
    });
  };

  const handleBack = () => {
    navigate('/content/mortgage', { 
      state: { 
        fromPage: location.state?.fromPage || 1,
        searchTerm: location.state?.searchTerm || ''
      } 
    });
  };

  const filteredActions = useMemo(() => {
    if (!drillData?.actions) return [];
    return drillData.actions.filter(action =>
      action.content_key?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      action.translations?.ru?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      action.translations?.he?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      action.component_type?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [drillData?.actions, searchTerm]);

  const totalPages = Math.ceil(filteredActions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentActions = filteredActions.slice(startIndex, endIndex);

  const formatLastModified = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return `${date.toLocaleDateString('ru-RU')} | ${date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
    } catch {
      return '01.08.2023 | 12:03';
    }
  };

  const getComponentTypeDisplay = (componentType: string) => {
    switch (componentType?.toLowerCase()) {
      case 'dropdown':
      case 'select':
        return 'Дропдаун';
      case 'link':
      case 'button':
        return 'Ссылка';
      case 'text':
      case 'label':
        return 'Текст';
      default:
        return 'Текст';
    }
  };

  if (loading) {
    return (
      <div className="mortgage-drill-loading">
        <div className="loading-spinner"></div>
        <p>Загрузка данных страницы...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mortgage-drill-error">
        <p>Ошибка: {error}</p>
        <button onClick={handleBack}>Вернуться назад</button>
      </div>
    );
  }

  if (!drillData) {
    return (
      <div className="mortgage-drill-error">
        <p>Данные не найдены</p>
        <button onClick={handleBack}>Вернуться назад</button>
      </div>
    );
  }

  return (
    <div className="mortgage-drill-page">
      {/* Main Content */}
      <div className="mortgage-drill-main">
        {/* Breadcrumb */}
        <div className="breadcrumb-container">
          <span className="breadcrumb-item" onClick={handleBack}>Контент сайта</span>
          <div className="breadcrumb-separator"></div>
          <span className="breadcrumb-item" onClick={handleBack}>Главная</span>
          <div className="breadcrumb-separator"></div>
          <span className="breadcrumb-item active">{drillData.pageTitle}</span>
        </div>

        {/* Page Header */}
        <div className="page-header-row">
          <h1 className="page-title">{drillData.pageTitle}</h1>
        </div>

        {/* Info Cards */}
        <div className="info-cards-row">
          <div className="info-card">
            <span className="info-label">Количество действий</span>
            <span className="info-value">{drillData.actionCount}</span>
          </div>
          <div className="info-card">
            <span className="info-label">Последнее редактирование</span>
            <span className="info-value">{formatLastModified(drillData.lastModified)}</span>
          </div>
        </div>

        {/* Page Preview Section */}
        <div className="page-preview-section">
          <h2 className="section-title">Страница и ее состояния</h2>
          <div className="page-preview-container">
            <div className="page-preview-placeholder">
              <span>Предварительный просмотр калькулятора ипотеки</span>
            </div>
          </div>
        </div>

        {/* Page State Thumbnails */}
        <div className="page-state-thumbnails">
          <div className="nav-thumbnail nav-prev">‹</div>
          <div className="state-thumbnail">1</div>
          <div className="state-thumbnail">2</div>
          <div className="state-thumbnail">3</div>
          <div className="state-thumbnail">4</div>
          <div className="state-thumbnail">5</div>
          <div className="state-thumbnail">6</div>
          <div className="nav-thumbnail nav-next">›</div>
        </div>

        {/* Actions List Title */}
        <h2 className="section-title">Список действий на странице</h2>

        {/* Table Section */}
        <div className="table-section">
          {/* Search Header */}
          <div className="table-header-controls">
            <div className="search-container">
              <div className="search-input-wrapper">
                <svg className="search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M7.333 12.667A5.333 5.333 0 1 0 7.333 2a5.333 5.333 0 0 0 0 10.667zM14 14l-2.9-2.9" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <input
                  type="text"
                  placeholder="Искать по действию"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              <button className="filters-button">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 4h12M4 8h8M6 12h4" stroke="#F9FAFB" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <span>Фильтры</span>
              </button>
            </div>
          </div>

          {/* Table Content */}
          <div className="drill-table">
            {/* Table Headers */}
            <div className="table-header-row">
              <div className="header-cell action-number">
                <span className="header-text">НОМЕР ДЕЙСТВИЯ</span>
              </div>
              <div className="header-cell action-id">
                <span className="header-text">ID</span>
              </div>
              <div className="header-cell action-type">
                <span className="header-text">ТИП</span>
              </div>
              <div className="header-cell action-ru">
                <span className="header-text">RU</span>
              </div>
              <div className="header-cell action-he">
                <span className="header-text">HEB</span>
              </div>
              <div className="header-cell action-buttons"></div>
            </div>

            {/* Table Rows */}
            <div className="table-body">
              {currentActions.map((action, index) => (
                <div key={action.id} className="table-row">
                  <div className="cell action-number">
                    <span className="cell-text">{startIndex + index + 1}. {action.description || action.translations.ru || action.content_key}</span>
                  </div>
                  <div className="cell action-id">
                    <span className="cell-text">{action.content_key}</span>
                  </div>
                  <div className="cell action-type">
                    <span className="cell-text">{getComponentTypeDisplay(action.component_type)}</span>
                  </div>
                  <div className="cell action-ru">
                    <span className="cell-text">{action.translations.ru}</span>
                  </div>
                  <div className="cell action-he">
                    <span className="cell-text cell-text-rtl">{action.translations.he}</span>
                  </div>
                  <div className="cell action-buttons">
                    <button
                      className="edit-button"
                      onClick={() => handleEditClick(action)}
                      title="Редактировать"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M11.333 2a1.167 1.167 0 0 1 1.651 1.651l-9 9L2 14l1.349-1.984 9-9z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="pagination-container">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredActions.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                size="medium"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MortgageDrill;