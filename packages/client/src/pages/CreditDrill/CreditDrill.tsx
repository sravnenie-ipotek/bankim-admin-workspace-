/**
 * CreditDrill Component
 * Drill-down page showing detailed actions for a specific credit page
 * Based on MortgageDrill pattern with identical design
 * 
 * @version 2.0.0
 * @since 2025-08-17
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import '../MortgageDrill/MortgageDrill.css'; // Use same styles as MortgageDrill for consistency
import { apiService } from '../../services/api';
import { Pagination, InlineEdit } from '../../components';
import { detectContentTypeFromPath, generateContentPaths, generateApiEndpoints } from '../../utils/contentTypeUtils';
import { useLanguage } from '../../contexts/LanguageContext';

interface CreditAction {
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
  page_number?: number;
}

interface CreditDrillData {
  pageTitle: string;
  actionCount: number;
  lastModified: string;
  actions: CreditAction[];
}

const CreditDrill: React.FC = () => {
  const { pageId } = useParams<{ pageId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const [drillData, setDrillData] = useState<CreditDrillData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(location.state?.searchTerm || '');
  const [currentPage, setCurrentPage] = useState(location.state?.fromPage || 1);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editedValues, setEditedValues] = useState<{ ru?: string; he?: string }>({});
  const itemsPerPage = 20;

  // Detect content type from URL path
  const contentType = detectContentTypeFromPath(location.pathname);

  useEffect(() => {
    fetchDrillData();
  }, [pageId, contentType]);

  const fetchDrillData = async () => {
    try {
      setLoading(true);
      console.log(`🔍 Fetching drill data for ${contentType} step ID: ${pageId}`);
      
      // Determine the correct endpoint based on content type
      const drillEndpoint = contentType === 'credit-refi' 
        ? `/api/content/credit-refi/drill/${pageId}`
        : `/api/content/credit/drill/${pageId}`;
        
      console.log(`📡 Calling drill endpoint: ${drillEndpoint}`);
      
      const drillResponse = await fetch(drillEndpoint).then(r => r.json());
      
      if (drillResponse.success && drillResponse.data) {
        const { pageTitle, actionCount, actions } = drillResponse.data;

        // Transform to drill data format
        const transformedActions: CreditAction[] = actions.map((item: any) => ({
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
          last_modified: item.last_modified || item.updated_at || new Date().toISOString(),
          page_number: item.page_number
        }));

        setDrillData({
          pageTitle: pageTitle || (contentType === 'credit-refi' 
            ? `Refinance Credit Step ${pageId?.replace('refinance_credit_', '').replace('credit_refi_', '') || '1'}`
            : `Credit Step ${pageId?.replace('credit_step', '') || '1'}`),
          actionCount: actionCount,
          lastModified: transformedActions.length > 0 ? 
            transformedActions.reduce((latest, action) => 
              new Date(action.last_modified) > new Date(latest) ? action.last_modified : latest, 
              transformedActions[0].last_modified
            ) : new Date().toISOString(),
          actions: transformedActions
        });
      } else {
        console.error('❌ Credit drill endpoint failed:', drillResponse);
        setError(t('content.error.loading'));
      }
    } catch (err) {
      console.error('❌ Error fetching drill data:', err);
      setError(t('content.error.loading'));
    } finally {
      setLoading(false);
    }
  };

  // Handle inline text updates
  const handleInlineUpdate = async (actionId: string, language: 'ru' | 'he' | 'en', newValue: string) => {
    try {
      console.log(`🔄 Updating ${language} translation for action ${actionId}:`, newValue);
      
      // Update via API
      const response = await apiService.updateMenuTranslation(actionId, language, newValue);
      
      if (response.success) {
        // Update local state
        setDrillData(prevData => {
          if (!prevData) return prevData;
          
          return {
            ...prevData,
            actions: prevData.actions.map(action => 
              action.id === actionId 
                ? {
                    ...action,
                    translations: {
                      ...action.translations,
                      [language]: newValue
                    },
                    last_modified: new Date().toISOString()
                  }
                : action
            )
          };
        });
        
        console.log(`✅ Successfully updated ${language} translation for action ${actionId}`);
      } else {
        console.error(`❌ Failed to update ${language} translation:`, response.error);
      }
    } catch (error) {
      console.error(`❌ Error updating ${language} translation:`, error);
    }
  };

  const handleEditClick = (action: CreditAction) => {
    console.log('🔍 Clicked action:', {
      id: action.id,
      component_type: action.component_type,
      content_key: action.content_key,
      description: action.description
    });
    
    // Get the component type display value to check
    const typeDisplay = getComponentTypeDisplay(action.component_type, action.content_key);
    console.log('📋 Type display:', typeDisplay);
    
    // Navigate based on component type
    const componentTypeLower = action.component_type?.toLowerCase();
    
    const paths = generateContentPaths(contentType, action.id, pageId);
    // Calculate the action number for display
    const startIndex = (currentPage - 1) * itemsPerPage;
    const actionIndex = filteredActions.findIndex(a => a.id === action.id);
    const displayActionNumber = action.page_number ?? ((location.state?.baseActionNumber || 0) + startIndex + actionIndex + 1);
    
    const navigationState = {
      fromPage: location.state?.fromPage || 1,
      searchTerm: location.state?.searchTerm || '',
      drillPage: currentPage,
      drillSearchTerm: searchTerm,
      returnPath: paths.drillPath,
      baseActionNumber: location.state?.baseActionNumber || 0,
      actionNumber: displayActionNumber
    };

    // For dropdown types - navigate to dropdown edit page
    if (typeDisplay === 'Дропдаун') {
      console.log('📋 Navigating to dropdown edit page:', paths.dropdownEditPath);
      navigate(paths.dropdownEditPath, { state: navigationState });
    } 
    // For text types - navigate to text edit page
    else if (componentTypeLower === 'text' || 
        componentTypeLower === 'label' ||
        componentTypeLower === 'field_label' ||
        componentTypeLower === 'link' ||
        componentTypeLower === 'button' ||
        componentTypeLower === 'title' ||
        componentTypeLower === 'subtitle' ||
        componentTypeLower === 'description' ||
        componentTypeLower === 'placeholder' ||
        componentTypeLower === 'error' ||
        componentTypeLower === 'warning' ||
        componentTypeLower === 'info' ||
        componentTypeLower === 'success' ||
        componentTypeLower === 'help' ||
        componentTypeLower === 'hint' ||
        componentTypeLower === 'tooltip' ||
        componentTypeLower === 'validation_message' ||
        componentTypeLower === 'content' ||
        componentTypeLower === 'message' ||
        componentTypeLower === 'plain_text') {
      console.log('📋 Navigating to text edit page:', paths.textEditPath);
      navigate(paths.textEditPath, { state: navigationState });
    }
    else {
      // Handle other component types as text by default
      console.log('📋 Unknown component type, navigating to text edit page:', componentTypeLower);
      navigate(paths.textEditPath, { state: navigationState });
    }
  };

  // Helper function to determine component type display
  const getComponentTypeDisplay = (componentType: string, contentKey?: string): string => {
    const typeLower = componentType?.toLowerCase();
    
    // Check if content_key contains dropdown indicators
    if (contentKey && (contentKey.includes('dropdown') || contentKey.includes('select') || contentKey.includes('combo'))) {
      return 'Дропдаун';
    }
    
    // Map component types to display text
    if (typeLower === 'dropdown' || typeLower === 'select' || typeLower === 'option' || typeLower === 'combo') {
      return 'Дропдаун';
    } else if (typeLower === 'link' || typeLower === 'hyperlink' || typeLower === 'url') {
      return 'Ссылка';
    } else {
      return 'Текст';
    }
  };

  // Filter actions based on search term
  const filteredActions = useMemo(() => {
    if (!drillData?.actions) return [];
    if (!searchTerm) return drillData.actions;
    
    const searchLower = searchTerm.toLowerCase();
    return drillData.actions.filter(action => 
      action.content_key?.toLowerCase().includes(searchLower) ||
      action.translations?.ru?.toLowerCase().includes(searchLower) ||
      action.translations?.he?.toLowerCase().includes(searchLower) ||
      action.translations?.en?.toLowerCase().includes(searchLower) ||
      action.component_type?.toLowerCase().includes(searchLower)
    );
  }, [drillData?.actions, searchTerm]);

  // Visible actions (exclude dropdown options from display)
  const visibleActions = useMemo(() => {
    return filteredActions.filter(action => 
      action.component_type?.toLowerCase() !== 'option'
    );
  }, [filteredActions]);

  // Pagination logic
  const totalPages = Math.ceil(visibleActions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentActions = visibleActions.slice(startIndex, endIndex);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle back navigation
  const handleBack = () => {
    const returnPath = contentType === 'credit-refi' ? '/content/credit-refi' : '/content/credit';
    navigate(returnPath, { 
      state: { 
        searchTerm: location.state?.searchTerm || '',
        fromPage: location.state?.fromPage || 1
      } 
    });
  };

  // Format last modified date
  const formatLastModified = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${day}.${month}.${year} | ${hours}:${minutes}`;
    } catch {
      return dateString;
    }
  };

  // Helper function to extract meaningful text from translations
  const extractDisplayText = (translation: string, language: 'ru' | 'he' | 'en'): string => {
    if (!translation) return '';
    
    // Check if the translation starts with JSON-like structure
    if (translation.trim().startsWith('[') || translation.trim().startsWith('{')) {
      try {
        const parsed = JSON.parse(translation);
        
        // If it's an array, take the first item
        if (Array.isArray(parsed) && parsed.length > 0) {
          const firstItem = parsed[0];
          // If the first item has a label property, use it
          if (typeof firstItem === 'object' && firstItem.label) {
            return firstItem.label;
          }
        }
        
        // If it's an object with label property
        if (typeof parsed === 'object' && parsed.label) {
          return parsed.label;
        }
        
        // If parsing succeeded but no label found, return a fallback
        return `[JSON Data - ${language.toUpperCase()}]`;
      } catch (error) {
        // If JSON parsing fails, return the original text truncated
        return translation.length > 50 ? translation.substring(0, 50) + '...' : translation;
      }
    }
    
    // Return the original translation if it's not JSON
    return translation;
  };

  if (loading) {
    return (
      <div className="mortgage-drill-loading">
        <div className="loading-spinner"></div>
        <p>{t('content.loadingContent')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mortgage-drill-error">
        <p>{t('content.error.loading')}: {error}</p>
        <button onClick={handleBack}>{t('common.back')}</button>
      </div>
    );
  }

  if (!drillData) {
    return (
      <div className="mortgage-drill-error">
        <p>{t('content.noContent')}</p>
        <button onClick={handleBack}>{t('common.back')}</button>
      </div>
    );
  }

  return (
    <div className="mortgage-drill-page">
      {/* Main Content */}
      <div className="mortgage-drill-main">
        {/* Breadcrumb */}
        <div className="breadcrumb-container">
          <span className="breadcrumb-item" onClick={handleBack}>{t('menu.contentSite')}</span>
          <div className="breadcrumb-separator"></div>
          <span className="breadcrumb-item" onClick={handleBack}>
            {contentType === 'credit-refi' ? t('menu.creditRefi') : t('menu.credit')}
          </span>
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
            <span className="info-label">Номер действия</span>
            <span className="info-value">{visibleActions.length}</span>
          </div>
          <div className="info-card">
            <span className="info-label">{t('content.table.lastModified')}</span>
            <span className="info-value">{formatLastModified(drillData.lastModified)}</span>
          </div>
        </div>

        {/* Page Preview Section */}
        <div className="page-preview-section">
          <h2 className="section-title">{t('content.pages.list')}</h2>
          <div className="page-preview-container">
            <div className="page-preview-placeholder">
              <span>{contentType === 'credit-refi' ? t('menu.creditRefi') : t('menu.credit')}</span>
            </div>
          </div>
        </div>

        {/* Page State Thumbnails - Credit has 3 steps, Credit-Refi has 4 steps */}
        <div className="page-state-thumbnails">
          <div className="nav-thumbnail nav-prev">‹</div>
          <div className="state-thumbnail">1</div>
          <div className="state-thumbnail">2</div>
          <div className="state-thumbnail">3</div>
          {contentType === 'credit-refi' && <div className="state-thumbnail">4</div>}
          <div className="nav-thumbnail nav-next">›</div>
        </div>

        {/* Actions List Title */}
        <h2 className="section-title">{t('content.table.actionCount')}</h2>

        {/* Table Section */}
        <div className="table-section">
          {/* Container following drill_1.md design */}
          <div style={{ width: '100%', maxWidth: '1400px', background: 'var(--gray-800, #1F2A37)', boxShadow: '0px 1px 2px -1px rgba(0, 0, 0, 0.10)', borderRadius: '8px', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex' }}>
            {/* Search Header */}
            <div style={{ alignSelf: 'stretch', padding: '16px', justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex' }}>
              <div style={{ width: '100%', height: '42px', position: 'relative' }}>
                <div style={{ width: '403px', height: '42px', left: '0px', top: '0px', position: 'absolute' }}>
                  <div style={{ width: '403px', height: '42px', left: '0px', top: '0px', position: 'absolute', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: '8px', display: 'inline-flex' }}>
                    <div style={{ width: '403px', paddingLeft: '16px', paddingRight: '16px', paddingTop: '12px', paddingBottom: '12px', background: 'var(--gray-700, #374151)', borderRadius: '8px', border: '1px var(--gray-600, #4B5563) solid', justifyContent: 'flex-start', alignItems: 'center', gap: '10px', display: 'inline-flex' }}>
                      <div style={{ justifyContent: 'flex-start', alignItems: 'center', gap: '10px', display: 'flex' }}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <g id="magnifyingglass">
                            <path id="Union" fillRule="evenodd" clipRule="evenodd" d="M10.6002 12.0498C9.49758 12.8568 8.13777 13.3333 6.66667 13.3333C2.98477 13.3333 0 10.3486 0 6.66667C0 2.98477 2.98477 0 6.66667 0C10.3486 0 13.3333 2.98477 13.3333 6.66667C13.3333 8.15637 12.8447 9.53194 12.019 10.6419C12.0265 10.6489 12.0338 10.656 12.0411 10.6633L15.5118 14.1339C15.7722 14.3943 15.7722 14.8164 15.5118 15.0768C15.2514 15.3372 14.8293 15.3372 14.5689 15.0768L11.0983 11.6061C11.0893 11.597 11.0805 11.5878 11.0718 11.5785C10.9133 11.4255 10.7619 11.2632 10.6181 11.0923C10.6121 11.0845 10.6062 11.0765 10.6002 11.0685V12.0498ZM11.3333 6.66667C11.3333 9.244 9.244 11.3333 6.66667 11.3333C4.08934 11.3333 2 9.244 2 6.66667C2 4.08934 4.08934 2 6.66667 2C9.244 2 11.3333 4.08934 11.3333 6.66667Z" fill="#9CA3AF"/>
                          </g>
                        </svg>
                        <input
                          type="text"
                          placeholder={t('content.search.placeholder')}
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--gray-400, #9CA3AF)', fontSize: '14px', fontFamily: 'Arimo', fontWeight: '400', lineHeight: '21px', flex: 1 }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ paddingLeft: '12px', paddingRight: '12px', paddingTop: '8px', paddingBottom: '8px', right: '16px', top: '4px', position: 'absolute', background: 'var(--gray-800, #1F2A37)', borderRadius: '8px', border: '1px var(--gray-600, #4B5563) solid', justifyContent: 'center', alignItems: 'center', gap: '8px', display: 'inline-flex' }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g id="funnel">
                      <path id="Union" fillRule="evenodd" clipRule="evenodd" d="M0.666504 3.46685C0.666504 1.71402 1.68758 0.333313 3.00755 0.333313H12.9922C14.3122 0.333313 15.3332 1.71402 15.3332 3.46685C15.3332 4.28415 14.9974 5.02664 14.4718 5.58069L10.6665 9.52712V12.8668C10.6665 13.3553 10.3781 13.7943 9.93136 13.9799L7.59803 14.9466C7.05307 15.1723 6.42474 14.9081 6.18612 14.3503C6.08565 14.1172 6.08565 13.8548 6.18612 13.6217V9.52712L2.52808 5.58069C2.00242 5.02664 1.6666 4.28415 1.6666 3.46685H0.666504ZM3.00755 2.33331C2.5767 2.33331 2.6666 2.95273 2.6666 3.46685C2.6666 3.66545 2.72946 3.88552 2.93685 4.10611L6.83975 8.23616C6.95236 8.35487 7.01385 8.5118 7.01163 8.67425L6.99994 13.4668L8.66658 12.7668V8.67425C8.66435 8.5118 8.72585 8.35487 8.83846 8.23616L12.5281 4.10611C12.7355 3.88552 12.9983 3.66545 12.9983 3.46685C12.9983 2.95273 13.423 2.33331 12.9922 2.33331H3.00755Z" fill="#F9FAFB"/>
                    </g>
                  </svg>
                  <div style={{ color: 'var(--gray-50, #F9FAFB)', fontSize: '12px', fontFamily: 'Arimo', fontWeight: '500', lineHeight: '18px' }}>{t('common.filter')}</div>
                </div>
              </div>
            </div>

            {/* Table Content - Column-based layout following drill_1.md */}
            <div className="drill-table-columns">
            {/* Column 1: НОМЕР ДЕЙСТВИЯ */}
            <div className="table-column" style={{ width: '180px' }}>
              <div className="column-header">
                <div style={{ color: 'var(--gray-400, #9CA3AF)', fontSize: '12px', fontFamily: 'Arimo', fontWeight: '600', textTransform: 'uppercase', lineHeight: '18px' }}>
                  {t('content.table.actionCount').toUpperCase()}
                </div>
              </div>
              <div className="column-divider"></div>
              {currentActions.map((action, index) => (
                <React.Fragment key={`action-${action.id}`}>
                  <div className="column-cell">
                    <div style={{ flex: '1 1 0', color: 'var(--white, white)', fontSize: '14px', fontFamily: 'Arimo', fontWeight: '600', lineHeight: '21px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={`${(action.page_number ?? ((location.state?.baseActionNumber || 0) + startIndex + index + 1))}.${action.description || action.translations.ru || action.content_key}`}>
                      {(action.page_number ?? ((location.state?.baseActionNumber || 0) + startIndex + index + 1))}.{action.description || action.translations.ru || action.content_key}
                    </div>
                  </div>
                  <div className="column-divider"></div>
                </React.Fragment>
              ))}
            </div>

            {/* Column 2: ID */}
            <div className="table-column" style={{ width: '200px' }}>
              <div className="column-header">
                <div style={{ color: 'var(--gray-400, #9CA3AF)', fontSize: '12px', fontFamily: 'Arimo', fontWeight: '600', textTransform: 'uppercase', lineHeight: '18px' }}>
                  ID
                </div>
              </div>
              <div className="column-divider"></div>
              {currentActions.map((action) => (
                <React.Fragment key={`id-${action.id}`}>
                  <div className="column-cell">
                    <div style={{ flex: '1 1 0', color: 'var(--gray-300, #D1D5DB)', fontSize: '12px', fontFamily: 'Arimo', fontWeight: '400', lineHeight: '21px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={action.screen_location || action.id}>
                      {action.screen_location || action.id}
                    </div>
                  </div>
                  <div className="column-divider"></div>
                </React.Fragment>
              ))}
            </div>

            {/* Column 3: ТИП */}
            <div className="table-column" style={{ width: '126px' }}>
              <div className="column-header">
                <div style={{ color: 'var(--gray-400, #9CA3AF)', fontSize: '12px', fontFamily: 'Arimo', fontWeight: '600', textTransform: 'uppercase', lineHeight: '18px' }}>
                  {t('content.type').toUpperCase()}
                </div>
              </div>
              <div className="column-divider"></div>
              {currentActions.map((action) => (
                <React.Fragment key={`type-${action.id}`}>
                  <div className="column-cell">
                    <div style={{ color: 'var(--white, white)', fontSize: '14px', fontFamily: 'Arimo', fontWeight: '500', lineHeight: '21px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={getComponentTypeDisplay(action.component_type, action.content_key)}>
                      {getComponentTypeDisplay(action.component_type, action.content_key)}
                    </div>
                  </div>
                  <div className="column-divider"></div>
                </React.Fragment>
              ))}
            </div>

            {/* Column 4: КОНТЕНТ РУС */}
            <div className="table-column" style={{ flex: 1 }}>
              <div className="column-header">
                <div style={{ color: 'var(--gray-400, #9CA3AF)', fontSize: '12px', fontFamily: 'Arimo', fontWeight: '600', textTransform: 'uppercase', lineHeight: '18px' }}>
                  {t('content.contentRu').toUpperCase()}
                </div>
              </div>
              <div className="column-divider"></div>
              {currentActions.map((action) => (
                <React.Fragment key={`ru-${action.id}`}>
                  <div className="column-cell">
                    <InlineEdit
                      value={editingRowId === action.id && editedValues.ru !== undefined ? editedValues.ru : extractDisplayText(action.translations.ru, 'ru')}
                      onSave={(newValue) => handleInlineUpdate(action.id, 'ru', newValue)}
                      className="inline-edit-cell"
                      isEditing={editingRowId === action.id}
                      onEditingChange={(editing) => {
                        if (editing) {
                          setEditingRowId(action.id);
                          setEditedValues({ ru: action.translations.ru, he: action.translations.he });
                        } else if (editingRowId === action.id) {
                          setEditingRowId(null);
                          setEditedValues({});
                        }
                      }}
                    />
                  </div>
                  <div className="column-divider"></div>
                </React.Fragment>
              ))}
            </div>

            {/* Column 5: КОНТЕНТ ИВРИТ */}
            <div className="table-column" style={{ flex: 1 }}>
              <div className="column-header">
                <div style={{ color: 'var(--gray-400, #9CA3AF)', fontSize: '12px', fontFamily: 'Arimo', fontWeight: '600', textTransform: 'uppercase', lineHeight: '18px' }}>
                  {t('content.contentHe').toUpperCase()}
                </div>
              </div>
              <div className="column-divider"></div>
              {currentActions.map((action) => (
                <React.Fragment key={`he-${action.id}`}>
                  <div className="column-cell">
                    <InlineEdit
                      value={editingRowId === action.id && editedValues.he !== undefined ? editedValues.he : extractDisplayText(action.translations.he, 'he')}
                      onSave={(newValue) => handleInlineUpdate(action.id, 'he', newValue)}
                      className="inline-edit-cell inline-edit-rtl"
                      isEditing={editingRowId === action.id}
                      onEditingChange={(editing) => {
                        if (editing) {
                          setEditingRowId(action.id);
                          setEditedValues({ ru: action.translations.ru, he: action.translations.he });
                        } else if (editingRowId === action.id) {
                          setEditingRowId(null);
                          setEditedValues({});
                        }
                      }}
                      dir="rtl"
                    />
                  </div>
                  <div className="column-divider"></div>
                </React.Fragment>
              ))}
            </div>

            {/* Column 6: ДЕЙСТВИЯ */}
            <div className="table-column" style={{ width: '120px' }}>
              <div className="column-header">
                <div style={{ color: 'var(--gray-400, #9CA3AF)', fontSize: '12px', fontFamily: 'Arimo', fontWeight: '600', textTransform: 'uppercase', lineHeight: '18px' }}>
                  {t('content.actions').toUpperCase()}
                </div>
              </div>
              <div className="column-divider"></div>
              {currentActions.map((action) => (
                <React.Fragment key={`actions-${action.id}`}>
                  <div className="column-cell">
                    <button className="action-button" onClick={() => handleEditClick(action)}>
                      {t('common.edit')}
                    </button>
                  </div>
                  <div className="column-divider"></div>
                </React.Fragment>
              ))}
            </div>
          </div>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination-container">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CreditDrill;