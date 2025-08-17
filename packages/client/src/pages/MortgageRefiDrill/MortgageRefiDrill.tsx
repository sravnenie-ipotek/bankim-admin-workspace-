/**
 * MortgageRefiDrill Component
 * Drill-down page showing detailed actions for a specific mortgage refinancing page
 * Based on MortgageDrill design structure
 * 
 * @version 1.0.0
 * @since 2025-01-20
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { apiService } from '../../services/api';
import { Pagination, InlineEdit } from '../../components';
import '../MortgageDrill/MortgageDrill.css'; // Reuse drill styles

interface MortgageRefiAction {
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

interface MortgageRefiDrillData {
  pageTitle: string;
  actionCount: number;
  lastModified: string;
  actions: MortgageRefiAction[];
}

const MortgageRefiDrill: React.FC = () => {
  const { pageId } = useParams<{ pageId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [drillData, setDrillData] = useState<MortgageRefiDrillData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  // const [selectedLanguage] = useState<'ru' | 'he' | 'en'>('ru');
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editedValues, setEditedValues] = useState<{ ru?: string; he?: string }>({});
  const itemsPerPage = 20; // Show more items per page to accommodate all mortgage-refi content

  useEffect(() => {
    fetchDrillData();
  }, [pageId]);

  const fetchDrillData = async () => {
    try {
      setLoading(true);
      console.log(`🔍 Fetching mortgage-refi drill data for step ID: ${pageId}`);
      
      // Use the backend drill endpoint for mortgage-refi
      const drillResponse = await fetch(`/api/content/mortgage-refi/drill/${pageId}`).then(r => r.json());
      
      if (drillResponse.success && drillResponse.data) {
        const drillData = drillResponse.data as any;
        const { pageTitle, actionCount, actions, is_placeholder, step_info } = drillData;

        // Check if this is a placeholder step
        if (is_placeholder || !actions || actions.length === 0) {
          // Handle placeholder steps (2-4)
          const placeholderTitle = step_info?.title || {};
          setDrillData({
            pageTitle: placeholderTitle.ru || placeholderTitle.en || `Step ${pageId}`,
            actionCount: 0,
            lastModified: new Date().toISOString(),
            actions: []
          });
          
          // Set a helpful message for placeholder steps
          if (is_placeholder) {
            setError(step_info?.message || 'Этот шаг еще не настроен в базе данных. Контент будет доступен после добавления.');
          }
          return;
        }

        // Transform to drill data format
        const transformedActions: MortgageRefiAction[] = actions.map((item: any) => ({
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
      } else {
        setError('Не удалось загрузить данные рефинансирования');
      }
    } catch (err) {
      console.error('❌ Error fetching mortgage-refi drill data:', err);
      setError('Ошибка загрузки данных рефинансирования');
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

  const handleEditClick = (action: MortgageRefiAction) => {
    console.log('🔍 Clicked mortgage-refi action:', {
      id: action.id,
      component_type: action.component_type,
      content_key: action.content_key,
      description: action.description
    });
    
    // Get the component type display value to check
    const typeDisplay = getComponentTypeDisplay(action.component_type, action.content_key);
    console.log('📋 Type display:', typeDisplay);
    
    // Calculate the action number for display (same as in the UI)
    const startIndex = (currentPage - 1) * itemsPerPage;
    const actionIndex = filteredActions.findIndex(a => a.id === action.id);
    const displayActionNumber = action.actionNumber ?? ((location.state?.baseActionNumber || 0) + startIndex + actionIndex + 1);
    
    // Navigate based on component type
    const componentTypeLower = action.component_type?.toLowerCase();
    
    // For dropdown types - navigate to the special dropdown edit page (check typeDisplay first)
    if (typeDisplay === 'Дропдаун') {
      const dropdownEditUrl = `/content/mortgage-refi/dropdown-edit/${action.id}`;
      console.log('📋 Navigating to mortgage-refi dropdown edit page:', dropdownEditUrl);
      
      const navigationState = {
        fromPage: currentPage,
        searchTerm: searchTerm,
        drillPage: currentPage,
        drillSearchTerm: searchTerm,
        returnPath: `/content/mortgage-refi/drill/${pageId}`,
        baseActionNumber: location.state?.baseActionNumber || 0,
        actionNumber: displayActionNumber // Pass the action number to dropdown edit page
      };
      
      navigate(dropdownEditUrl, { state: navigationState });
    } 
    // For text types - navigate to the special text edit page
    else if (componentTypeLower === 'text' || 
        componentTypeLower === 'label' ||
        componentTypeLower === 'field_label' ||
        componentTypeLower === 'link' ||
        componentTypeLower === 'button' ||
        typeDisplay === 'Текст' ||
        typeDisplay === 'Ссылка') {
      const textEditUrl = `/content/mortgage-refi/text-edit/${action.id}`;
      console.log('✅ Navigating to mortgage-refi text edit page:', textEditUrl);
      
      const navigationState = {
        fromPage: currentPage,
        searchTerm: searchTerm,
        drillPage: currentPage,
        drillSearchTerm: searchTerm,
        returnPath: `/content/mortgage-refi/drill/${pageId}`,
        baseActionNumber: location.state?.baseActionNumber || 0,
        actionNumber: displayActionNumber // Pass the action number to text edit page
      };
      
      navigate(textEditUrl, { state: navigationState });
    } 
    // For other types - navigate to standard edit page
    else {
      console.log('➡️ Navigating to standard edit page for type:', action.component_type);
      navigate(`/content/mortgage-refi/edit/${action.id}`, { 
        state: { 
          fromPage: currentPage,
          searchTerm: searchTerm,
          returnPath: `/content/mortgage-refi/drill/${pageId}`
        } 
      });
    }
  };

  const handleBack = () => {
    navigate('/content/mortgage-refi', { 
      state: { 
        fromPage: location.state?.fromPage || 1,
        searchTerm: location.state?.searchTerm || ''
      } 
    });
  };

  // Hide dropdown options from drill pages (following @dropDownDBlogic rules)
  const visibleActions = useMemo(() => {
    if (!drillData?.actions) return [];
    return drillData.actions.filter(action => {
      // Hide dropdown options from drill pages - they should only appear in dropdown edit pages
      // According to @dropDownDBlogic rules, only main dropdown fields should be visible in drill pages
      if (action.component_type?.toLowerCase() === 'option' || 
          action.component_type?.toLowerCase() === 'dropdown_option' ||
          action.component_type?.toLowerCase() === 'field_option') {
        return false; // Hide dropdown options from drill pages
      }
      return true; // Show all other content types
    });
  }, [drillData?.actions]);

  const filteredActions = useMemo(() => {
    if (!visibleActions) return [];
    if (!searchTerm) return visibleActions;
    
    return visibleActions.filter(action => {
      return (
        action.content_key?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        action.translations?.ru?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        action.translations?.he?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        action.component_type?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [visibleActions, searchTerm]);

  const totalPages = Math.ceil(filteredActions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentActions = filteredActions.slice(startIndex, endIndex);

  // Helper function to safely parse and display translation text
  const getSafeTranslation = (translation: string, language: 'ru' | 'he' | 'en'): string => {
    if (!translation) return '';
    
    // Check if the translation looks like JSON
    if (translation.trim().startsWith('[') || translation.trim().startsWith('{')) {
      try {
        // Try to parse as JSON
        const parsed = JSON.parse(translation);
        
        // If it's an array, extract the first label
        if (Array.isArray(parsed) && parsed.length > 0) {
          const firstItem = parsed[0];
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

  const formatLastModified = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return `${date.toLocaleDateString('ru-RU')} | ${date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
    } catch {
      return '01.08.2023 | 12:03';
    }
  };

  const getComponentTypeDisplay = (componentType: string, contentKey: string = '') => {
    // Check if this is a dropdown-related field based on content patterns
    const isDropdownField = contentKey.includes('_option') || 
                            contentKey.includes('citizenship') ||
                            contentKey.includes('education') ||
                            contentKey.includes('family_status') ||
                            contentKey.includes('main_source') ||
                            contentKey.includes('debt_types') ||
                            contentKey.includes('has_additional') ||
                            contentKey.includes('property_ownership') ||
                            contentKey.includes('first_home') ||
                            contentKey.includes('sphere') ||
                            contentKey.includes('type') ||
                            contentKey.includes('when_needed') ||
                            // Only include _ph if it's not a standalone placeholder
                            (contentKey.includes('_ph') && !contentKey.endsWith('_ph'));

    // According to Confluence specification, only 3 types are allowed:
    // 1. Ссылка (Link) - website links
    // 2. Текст (Text) - any text (headers, input labels, etc.)
    // 3. Дропдаун (Dropdown) - multiselect and singleselect inputs with options
    switch (componentType?.toLowerCase()) {
      case 'dropdown':
      case 'dropdown_container':
      case 'select':
        return 'Дропдаун';
      case 'option':
      case 'dropdown_option':
        return 'Дропдаун';
      case 'label':
      case 'field_label':
        return isDropdownField ? 'Дропдаун' : 'Текст';
      case 'link':
      case 'button':
        return 'Ссылка';
      // All other component types are classified as 'Текст' according to Confluence spec
      case 'text':
      case 'placeholder':
      case 'help_text':
      case 'header':
      case 'section_header':
      case 'title':
      case 'hint':
      case 'tooltip':
      case 'notice':
      case 'disclaimer':
      case 'unit':
      default:
        return 'Текст';
    }
  };

  if (loading) {
    return (
      <div className="mortgage-drill-loading">
        <div className="loading-spinner"></div>
        <p>Загрузка данных страницы рефинансирования...</p>
      </div>
    );
  }

  if (error) {
    // Check if this is a placeholder step message
    const isPlaceholder = error.includes('еще не настроен') || error.includes('not yet configured');
    
    return (
      <div className={isPlaceholder ? "mortgage-drill-placeholder" : "mortgage-drill-error"}>
        <div className="placeholder-container">
          <h2>{drillData?.pageTitle || `Шаг ${pageId}`}</h2>
          <p className={isPlaceholder ? "placeholder-message" : "error-message"}>{error}</p>
          {isPlaceholder && (
            <div className="placeholder-info">
              <p>📝 Этот шаг будет доступен после добавления контента в базу данных.</p>
              <p>Пожалуйста, обратитесь к администратору для настройки этого раздела.</p>
            </div>
          )}
          <button onClick={handleBack} className="back-button">Вернуться назад</button>
        </div>
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
          <span className="breadcrumb-item" onClick={handleBack}>Рефинансирование ипотеки</span>
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
            <span className="info-label">Последнее редактирование</span>
            <span className="info-value">{formatLastModified(drillData.lastModified)}</span>
          </div>
        </div>

        {/* Page Preview Section */}
        <div className="page-preview-section">
          <h2 className="section-title">Страница и ее состояния</h2>
          <div className="page-preview-container">
            <div className="page-preview-placeholder">
              <span>Предварительный просмотр рефинансирования ипотеки</span>
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
                          placeholder="Искать по названию, ID, номеру страницы"
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
                  <div style={{ color: 'var(--gray-50, #F9FAFB)', fontSize: '12px', fontFamily: 'Arimo', fontWeight: '500', lineHeight: '18px' }}>Фильтры</div>
                </div>
              </div>
            </div>

            {/* Table Content - Column-based layout following drill_1.md */}
            <div className="drill-table-columns">
            {/* Column 1: НОМЕР ДЕЙСТВИЯ */}
            <div className="table-column" style={{ width: '180px' }}>
              <div className="column-header">
                <div style={{ color: 'var(--gray-400, #9CA3AF)', fontSize: '12px', fontFamily: 'Arimo', fontWeight: '600', textTransform: 'uppercase', lineHeight: '18px' }}>
                  НОМЕР ДЕЙСТВИЯ
                </div>
              </div>
              <div className="column-divider"></div>
              {currentActions.map((action, index) => (
                <React.Fragment key={`action-${action.id}`}>
                  <div className="column-cell">
                    <div style={{ flex: '1 1 0', color: 'var(--white, white)', fontSize: '14px', fontFamily: 'Arimo', fontWeight: '600', lineHeight: '21px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={`${startIndex + index + 1}.${action.description || action.translations.ru || action.content_key}`}>
                      {startIndex + index + 1}.{action.description || action.translations.ru || action.content_key}
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
                  ТИП
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

            {/* Column 4: RU */}
            <div className="table-column" style={{ width: '240px' }}>
              <div className="column-header">
                <div style={{ color: 'var(--gray-400, #9CA3AF)', fontSize: '12px', fontFamily: 'Arimo', fontWeight: '600', textTransform: 'uppercase', lineHeight: '18px' }}>
                  RU
                </div>
              </div>
              <div className="column-divider"></div>
              {currentActions.map((action) => {
                const isEditing = editingRowId === action.id;
                const typeDisplay = getComponentTypeDisplay(action.component_type, action.content_key);
                const isLink = typeDisplay === 'Ссылка';
                
                return (
                  <React.Fragment key={`ru-${action.id}`}>
                    <div className="column-cell">
                      {isEditing && isLink ? (
                        <InlineEdit
                          value={editedValues.ru !== undefined ? editedValues.ru : getSafeTranslation(action.translations.ru, 'ru')}
                          onSave={(newValue) => {
                            setEditedValues(prev => ({ ...prev, ru: newValue }));
                          }}
                          placeholder="Введите текст..."
                          className="drill-table-inline-edit"
                          startInEditMode={true}
                          hideButtons={true}
                        />
                      ) : (
                        <div style={{ color: 'var(--white, white)', fontSize: '14px', fontFamily: 'Arimo', fontWeight: '400', lineHeight: '21px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={getSafeTranslation(action.translations.ru, 'ru')}>
                          {getSafeTranslation(action.translations.ru, 'ru')}
                        </div>
                      )}
                    </div>
                    <div className="column-divider"></div>
                  </React.Fragment>
                );
              })}
            </div>

            {/* Column 5: HEB */}
            <div className="table-column" style={{ width: '240px' }}>
              <div className="column-header">
                <div style={{ color: 'var(--gray-400, #9CA3AF)', fontSize: '12px', fontFamily: 'Arimo', fontWeight: '600', textTransform: 'uppercase', lineHeight: '18px' }}>
                  HEB
                </div>
              </div>
              <div className="column-divider"></div>
              {currentActions.map((action) => {
                const isEditing = editingRowId === action.id;
                const typeDisplay = getComponentTypeDisplay(action.component_type, action.content_key);
                const isLink = typeDisplay === 'Ссылка';
                
                return (
                  <React.Fragment key={`he-${action.id}`}>
                    <div className="column-cell">
                      {isEditing && isLink ? (
                        <InlineEdit
                          value={editedValues.he !== undefined ? editedValues.he : getSafeTranslation(action.translations.he, 'he')}
                          onSave={(newValue) => {
                            setEditedValues(prev => ({ ...prev, he: newValue }));
                          }}
                          placeholder="הזן טקסט..."
                          className="drill-table-inline-edit"
                          startInEditMode={true}
                          hideButtons={true}
                          dir="rtl"
                        />
                      ) : (
                        <div style={{ flex: '1 1 0', textAlign: 'right', color: 'var(--white, white)', fontSize: '14px', fontFamily: 'Arimo', fontWeight: '400', lineHeight: '21px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', direction: 'rtl' }} title={getSafeTranslation(action.translations.he, 'he')}>
                          {getSafeTranslation(action.translations.he, 'he')}
                        </div>
                      )}
                    </div>
                    <div className="column-divider"></div>
                  </React.Fragment>
                );
              })}
            </div>

            {/* Column 6: Action Buttons */}
            <div className="table-column" style={{ width: '125px' }}>
              <div className="column-header" style={{ height: '50px' }}></div>
              <div className="column-divider"></div>
              {currentActions.map((action) => {
                const typeDisplay = getComponentTypeDisplay(action.component_type, action.content_key);
                const isLink = typeDisplay === 'Ссылка';
                
                return (
                  <React.Fragment key={`edit-${action.id}`}>
                    <div className="column-cell">
                      {isLink ? (
                        editingRowId === action.id ? (
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                              className="inline-edit-btn save"
                              onClick={async () => {
                                // Save both RU and HE translations if they were edited
                                if (editedValues.ru !== undefined) {
                                  await handleInlineUpdate(action.id, 'ru', editedValues.ru);
                                }
                                if (editedValues.he !== undefined) {
                                  await handleInlineUpdate(action.id, 'he', editedValues.he);
                                }
                                setEditingRowId(null);
                                setEditedValues({});
                              }}
                              title="Сохранить"
                              style={{
                                backgroundColor: '#10B981',
                                border: 'none',
                                borderRadius: '4px',
                                width: '32px',
                                height: '32px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                color: '#fff',
                                fontSize: '16px',
                                fontWeight: 'bold'
                              }}
                            >
                              ✓
                            </button>
                            <button
                              className="inline-edit-btn cancel"
                              onClick={() => {
                                setEditingRowId(null);
                                setEditedValues({});
                              }}
                              title="Отменить"
                              style={{
                                backgroundColor: '#EF4444',
                                border: 'none',
                                borderRadius: '4px',
                                width: '32px',
                                height: '32px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                color: '#fff',
                                fontSize: '16px',
                                fontWeight: 'bold'
                              }}
                            >
                              ✗
                            </button>
                          </div>
                        ) : (
                          <button
                            className="inline-edit-trigger"
                            onClick={() => {
                              setEditingRowId(action.id);
                              setEditedValues({});
                            }}
                            title="Редактировать"
                            style={{ 
                              backgroundColor: 'transparent',
                              border: '1px solid #4B5563',
                              borderRadius: '4px',
                              width: '32px',
                              height: '32px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              color: '#9CA3AF',
                              transition: 'all 0.2s'
                            }}
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M11.854 1.146a.5.5 0 0 1 0 .708L5.207 8.5l-.853 2.853a.5.5 0 0 0 .61.61l2.853-.853 6.646-6.647a.5.5 0 0 0 0-.707l-2-2a.5.5 0 0 0-.707 0l-1.902 1.902zm1.141 1.563L11.293 4.41 9.585 2.702l1.702-1.701 1.708 1.708z" fill="currentColor"/>
                            </svg>
                          </button>
                        )
                      ) : (
                        <div 
                          className="edit-icon-button"
                          onClick={() => {
                            console.log('🚀 Arrow clicked for mortgage-refi action:', action);
                            handleEditClick(action);
                          }}
                          title="Редактировать"
                          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', color: 'rgb(255, 255, 255)', backgroundColor: 'transparent', border: '1px solid rgb(55, 65, 81)', width: '40px', height: '40px', borderRadius: '4px' }}
                        >
                          →
                        </div>
                      )}
                    </div>
                    <div className="column-divider"></div>
                  </React.Fragment>
                );
              })}
            </div>
          </div>

            {/* Pagination */}
            <div style={{ alignSelf: 'stretch', padding: '16px', borderTop: '1px var(--gray-700, #374151) solid', justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex' }}>
              <div>
                <span style={{ color: '#9CA3AF', fontSize: '14px', fontFamily: 'Inter', fontWeight: '400', lineHeight: '21px' }}>Показывает </span>
                <span style={{ color: 'white', fontSize: '14px', fontFamily: 'Inter', fontWeight: '600', lineHeight: '21px' }}>{startIndex + 1}-{Math.min(endIndex, filteredActions.length)}</span>
                <span style={{ color: '#9CA3AF', fontSize: '14px', fontFamily: 'Inter', fontWeight: '400', lineHeight: '21px' }}> из </span>
                <span style={{ color: 'white', fontSize: '14px', fontFamily: 'Inter', fontWeight: '600', lineHeight: '21px' }}>{filteredActions.length}</span>
              </div>
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

export default MortgageRefiDrill; 