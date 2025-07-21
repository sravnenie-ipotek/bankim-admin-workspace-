/**
 * ContentMain Component
 * Main content management page for "Калькулятор ипотеки Страница №2"
 * 
 * Features:
 * - Reuses existing Breadcrumb, UserInfoCards, PageGallery, and ContentTable components
 * - Follows established dark theme and typography patterns
 * - Responsive design with mobile menu support
 * - Integrates with NavigationContext for submenu state
 * 
 * Reference: devHelp/contentMenu/content_main.md - Phase 1 implementation
 * Design: devHelp/contentMenu/cssPages/main_page.md
 * 
 * @version 1.0.0
 * @author BankIM Development Team
 * @since 2024-12-14
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../Chat/ContentManagement/components/Breadcrumb/Breadcrumb';
import UserInfoCards from '../Chat/ContentManagement/components/UserInfoCards/UserInfoCards';
import PageGallery from '../Chat/ContentManagement/components/PageGallery/PageGallery';
import ContentTable from '../Chat/ContentManagement/components/ContentTable/ContentTable';
import type { ContentPage, ContentFilter } from '../Chat/ContentManagement/types/contentTypes';
import { apiService } from '../../services/api';
import { useNavigation } from '../../contexts/NavigationContext';
import './ContentMain.css';

/**
 * Legacy data transformation function - converts old API data to ContentTable format
 * Kept for backward compatibility with existing MainPageContent API
 * Currently unused as we now use getAllMainPageLanguages() method
 */
// const transformMainPageData = (apiData: MainPageContent): ContentPage[] => {
//   return apiData.actions.map((action, index) => ({
//     id: action.id,
//     pageNumber: action.actionNumber,
//     title: action.title,                    // "X.Основной источник дохода"
//     titleRu: action.titleRu,               // "Рассчитать Ипотеку"
//     titleHe: action.titleHe,               // "חשב את המשכנתא שלך"
//     titleEn: action.titleEn,               // "Calculate Mortgage"
//     actionCount: index + 1,
//     lastModified: action.lastModified,
//     modifiedBy: action.createdBy,
//     category: 'main',
//     status: action.status,
//     url: `/dropdown-action-${action.actionNumber}`,
//     createdAt: action.createdAt,
//     createdBy: action.createdBy
//   }));
// };

/**
 * ContentMain Component
 * Implements the main content management page following existing patterns
 */
const ContentMain: React.FC = () => {
  const navigate = useNavigate();
  const { setCurrentSubmenu } = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionCount, setActionCount] = useState(33);
  const [lastModified, setLastModified] = useState("01.08.2023 | 15:03");
  
  // Basic filter state for ContentTable
  const [filter] = useState<ContentFilter>({
    searchQuery: '',
    sortBy: 'pageNumber',
    sortOrder: 'asc',
    page: 1,
    limit: 20
  });

  // Set navigation context when component mounts
  useEffect(() => {
    setCurrentSubmenu('content-main', 'Главная');
    
    // Cleanup function to clear submenu when component unmounts
    return () => {
      // Don't clear on unmount to maintain breadcrumb state during navigation
    };
  }, [setCurrentSubmenu]);

  // Content pages state - will be populated from API
  const [mockContentPages, setMockContentPages] = useState<ContentPage[]>([]);

  // Fetch real content data from bankim_content database API
  useEffect(() => {
    const fetchMainPageData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Try to fetch real data from bankim_content API - updated method
        const response = await apiService.getAllMainPageLanguages();
        
        if (response.success && response.data) {
          setMockContentPages(response.data);
          
          // Calculate total action count from all actions
          const totalActions = response.data.reduce((sum, page) => sum + page.actionCount, 0);
          setActionCount(totalActions);
          
          // Update last modified date from newest item
          setLastModified(response.data.length > 0 ? 
            response.data[0].lastModified.toLocaleDateString('ru-RU') + ' | ' +
            response.data[0].lastModified.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) :
            '01.08.2023 | 15:03'
          );
          
          console.log('Loaded content data from bankim_content API:', response.data.length, 'items');
        } else {
          throw new Error(response.error || 'Ошибка загрузки данных из bankim_content API');
        }
      } catch (err) {
        console.error('Failed to fetch content data from bankim_content API:', err);
        setError('Не удалось загрузить данные. Пожалуйста, убедитесь, что сервер запущен.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMainPageData();
  }, []);

  // Fixed mock images for gallery - corrected SVG format
  const pageImages = [
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMUYyQTM3Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPtCh0YLRgNCw0L3QuNGG0LAgMTwvdGV4dD48L3N2Zz4=',
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMUYyQTM3Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPtCh0YLRgNCw0L3QuNGG0LAgMjwvdGV4dD48L3N2Zz4=',
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMUYyQTM3Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPtCh0YLRgNCw0L3QuNGG0LAgMzwvdGV4dD48L3N2Zz4=',
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMUYyQTM3Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPtCh0YLRgNCw0L3QuNGG0LAgNDwvdGV4dD48L3N2Zz4=',
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMUYyQTM3Ci8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPtCh0YLRgNCw0L3QuNGG0LAgNTwvdGV4dD48L3N2Zz4=',
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMUYyQTM3Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1saXN0aXplPSIyNCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPtCh0YLRgNCw0L3QuNGG0LAgNjwvdGV4dD48L3N2Zz4='
  ];

  // Handlers for table interactions
  const handleSortChange = (sortBy: any, sortOrder: 'asc' | 'desc') => {
    console.log('Sort changed:', sortBy, sortOrder);
  };

  const handlePageSelect = (page: ContentPage) => {
    console.log('Page selected:', page);
  };

  const handleEdit = (page: ContentPage) => {
    // Determine which editing interface to use based on content type
    const contentType = page.contentType || 'dropdown'; // Default to dropdown for backward compatibility
    
    switch (contentType) {
      case 'text':
        navigate(`/content/main/text/${page.id}`);
        break;
      case 'link':
        // TODO: Implement link editing interface
        console.log('Link editing not yet implemented');
        navigate(`/content/main/action/${page.id}`); // Fallback to dropdown for now
        break;
      case 'dropdown':
      default:
        navigate(`/content/main/action/${page.id}`);
        break;
    }
  };


  // Breadcrumb paths for navigation
  const breadcrumbPaths = [
    { label: 'Главная', path: '/' },
    { label: 'Управление контентом', path: '/content-management' },
    { label: 'Главная', path: '/content/main' }
  ];

  return (
    <div className="content-main">
      {/* Top navigation with breadcrumb */}
      <Breadcrumb items={breadcrumbPaths.map((path, index) => ({
        label: path.label,
        href: path.path,
        isActive: index === breadcrumbPaths.length - 1
      }))} />

      {/* Main content container */}
      <div className="content-main__container">
        {/* Page header */}
        <div className="content-main__header">
          <h1 className="content-main__title">Калькулятор ипотеки Страница №2</h1>
          <p className="content-main__subtitle">Главная страница</p>
          
          {/* Page stats */}
          <div className="content-main__stats">
            <div className="content-main__stat">
              <span className="content-main__stat-label">Количество действий:</span>
              <span className="content-main__stat-value">{actionCount}</span>
            </div>
            <div className="content-main__stat">
              <span className="content-main__stat-label">Последнее изменение:</span>
              <span className="content-main__stat-value">{lastModified}</span>
            </div>
            <div className="content-main__stat">
              <span className="content-main__stat-label">URL:</span>
              <span className="content-main__stat-value content-main__stat-value--url">
                www.bankonline.il/ru/<span className="content-main__highlight">main-page</span>
              </span>
            </div>
          </div>
        </div>

        {/* User info cards */}
        <UserInfoCards actionCount={actionCount} lastModified={lastModified} />

        {/* Page gallery */}
        <div className="content-main__gallery-section">
          <h2 className="content-main__section-title">Галерея страницы</h2>
          <PageGallery images={pageImages} title="Галерея страницы" />
        </div>

        {/* Error message */}
        {error && (
          <div className="content-main__error">
            {error}
          </div>
        )}

        {/* Content table */}
        <div className="content-main__table-section">
          <h2 className="content-main__section-title">
            Активные страницы 
            <span className="content-main__badge">{mockContentPages.length}</span>
          </h2>
          <ContentTable 
            data={mockContentPages}
            filter={filter}
            isLoading={isLoading}
            readonly={false}
            onSortChange={handleSortChange}
            onRowSelect={handlePageSelect}
            onEdit={handleEdit}
          />
        </div>
      </div>
    </div>
  );
};

export default ContentMain;