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
import { Breadcrumb } from '../Chat/ContentManagement/components/Breadcrumb';
import { UserInfoCards } from '../Chat/ContentManagement/components/UserInfoCards';
import { PageGallery } from '../Chat/ContentManagement/components/PageGallery';
import { ContentTable } from '../Chat/ContentManagement/components/ContentTable';
import type { ContentPage, ContentFilter } from '../Chat/ContentManagement/types/contentTypes';
import { apiService } from '../../services/api';
import type { MainPageContent } from '../../services/api';
import { useNavigation } from '../../contexts/NavigationContext';
import './ContentMain.css';

/**
 * Data transformation function - converts API data to ContentTable format
 * Follows CSS example structure from main_page.md
 */
const transformMainPageData = (apiData: MainPageContent): ContentPage[] => {
  return apiData.actions.map((action, index) => ({
    id: action.id,
    pageNumber: action.actionNumber,
    title: action.title,                    // "X.Основной источник дохода"
    titleRu: action.titleRu,               // "Рассчитать Ипотеку"
    titleHe: action.titleHe,               // "חשב את המשכנתא שלך"
    titleEn: action.titleEn,               // "Calculate Mortgage"
    actionCount: index + 1,
    lastModified: action.lastModified,
    modifiedBy: action.createdBy,
    category: 'main',
    status: action.status,
    url: `/income-main-${action.actionNumber}`,
    createdAt: action.createdAt,
    createdBy: action.createdBy
  }));
};

/**
 * ContentMain Component
 * Implements the main content management page following existing patterns
 */
const ContentMain: React.FC = () => {
  const { setCurrentSubmenu } = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionCount, setActionCount] = useState(33);
  const [lastModified, setLastModified] = useState("01.08.2023 | 15:03");
  const [contentFilter, setContentFilter] = useState<ContentFilter>({
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

  // Mock data for content pages - following existing ContentPage structure
  const [mockContentPages, setMockContentPages] = useState<ContentPage[]>([
    {
      id: '1',
      pageNumber: 1,
      title: '1.Основной источник дохода',
      titleRu: 'Рассчитать Ипотеку',
      titleHe: 'חשב את המשכנתא שלך',
      titleEn: 'Calculate Mortgage',
      actionCount: 1,
      lastModified: new Date('2024-12-10'),
      modifiedBy: 'director-1',
      category: 'main',
      status: 'published',
      url: '/income-main',
      createdAt: new Date('2024-12-01'),
      createdBy: 'director-1'
    },
    {
      id: '2',
      pageNumber: 2,
      title: '2.Основной источник дохода',
      titleRu: 'Рассчитать Ипотеку',
      titleHe: 'חשב את המשכנתא שלך',
      titleEn: 'Calculate Mortgage',
      actionCount: 2,
      lastModified: new Date('2024-12-11'),
      modifiedBy: 'director-1',
      category: 'main',
      status: 'published',
      url: '/income-main-2',
      createdAt: new Date('2024-12-01'),
      createdBy: 'director-1'
    },
    {
      id: '3',
      pageNumber: 3,
      title: '3.Основной источник дохода',
      titleRu: 'Рассчитать Ипотеку',
      titleHe: 'חשב את המשכנתא שלך',
      titleEn: 'Calculate Mortgage',
      actionCount: 3,
      lastModified: new Date('2024-12-12'),
      modifiedBy: 'director-1',
      category: 'main',
      status: 'draft',
      url: '/income-main-3',
      createdAt: new Date('2024-12-01'),
      createdBy: 'director-1'
    },
    {
      id: '4',
      pageNumber: 4,
      title: '4.Основной источник дохода',
      titleRu: 'Рассчитать Ипотеку',
      titleHe: 'חשב את המשכנתא שלך',
      titleEn: 'Calculate Mortgage',
      actionCount: 4,
      lastModified: new Date('2024-12-13'),
      modifiedBy: 'director-1',
      category: 'main',
      status: 'published',
      url: '/income-main-4',
      createdAt: new Date('2024-12-01'),
      createdBy: 'director-1'
    },
    {
      id: '5',
      pageNumber: 5,
      title: '5.Основной источник дохода',
      titleRu: 'Рассчитать Ипотеку',
      titleHe: 'חשב את המשכנתא שלך',
      titleEn: 'Calculate Mortgage',
      actionCount: 5,
      lastModified: new Date('2024-12-14'),
      modifiedBy: 'director-1',
      category: 'main',
      status: 'published',
      url: '/income-main-5',
      createdAt: new Date('2024-12-01'),
      createdBy: 'director-1'
    },
    {
      id: '6',
      pageNumber: 6,
      title: '6.Основной источник дохода',
      titleRu: 'Рассчитать Ипотеку',
      titleHe: 'חשב את המשכנתא שלך',
      titleEn: 'Calculate Mortgage',
      actionCount: 6,
      lastModified: new Date('2024-12-15'),
      modifiedBy: 'director-1',
      category: 'main',
      status: 'published',
      url: '/income-main-6',
      createdAt: new Date('2024-12-01'),
      createdBy: 'director-1'
    },
    {
      id: '7',
      pageNumber: 7,
      title: '7.Основной источник дохода',
      titleRu: 'Рассчитать Ипотеку',
      titleHe: 'חשב את המשכנתא שלך',
      titleEn: 'Calculate Mortgage',
      actionCount: 7,
      lastModified: new Date('2024-12-16'),
      modifiedBy: 'director-1',
      category: 'main',
      status: 'published',
      url: '/income-main-7',
      createdAt: new Date('2024-12-01'),
      createdBy: 'director-1'
    },
    {
      id: '8',
      pageNumber: 8,
      title: '8.Основной источник дохода',
      titleRu: 'Рассчитать Ипотеку',
      titleHe: 'חשב את המשכנתא שלך',
      titleEn: 'Calculate Mortgage',
      actionCount: 8,
      lastModified: new Date('2024-12-17'),
      modifiedBy: 'director-1',
      category: 'main',
      status: 'draft',
      url: '/income-main-8',
      createdAt: new Date('2024-12-01'),
      createdBy: 'director-1'
    },
    {
      id: '9',
      pageNumber: 9,
      title: '9.Основной источник дохода',
      titleRu: 'Рассчитать Ипотеку',
      titleHe: 'חשב את המשכנתא שלך',
      titleEn: 'Calculate Mortgage',
      actionCount: 9,
      lastModified: new Date('2024-12-18'),
      modifiedBy: 'director-1',
      category: 'main',
      status: 'published',
      url: '/income-main-9',
      createdAt: new Date('2024-12-01'),
      createdBy: 'director-1'
    },
    {
      id: '10',
      pageNumber: 10,
      title: '10.Основной источник дохода',
      titleRu: 'Рассчитать Ипотеку',
      titleHe: 'חשב את המשכנתא שלך',
      titleEn: 'Calculate Mortgage',
      actionCount: 10,
      lastModified: new Date('2024-12-19'),
      modifiedBy: 'director-1',
      category: 'main',
      status: 'published',
      url: '/income-main-10',
      createdAt: new Date('2024-12-01'),
      createdBy: 'director-1'
    },
    {
      id: '11',
      pageNumber: 11,
      title: '11.Основной источник дохода',
      titleRu: 'Рассчитать Ипотеку',
      titleHe: 'חשב את המשכנתא שלך',
      titleEn: 'Calculate Mortgage',
      actionCount: 11,
      lastModified: new Date('2024-12-20'),
      modifiedBy: 'director-1',
      category: 'main',
      status: 'published',
      url: '/income-main-11',
      createdAt: new Date('2024-12-01'),
      createdBy: 'director-1'
    },
    {
      id: '12',
      pageNumber: 12,
      title: '12.Основной источник дохода',
      titleRu: 'Рассчитать Ипотеку',
      titleHe: 'חשב את המשכנתא שלך',
      titleEn: 'Calculate Mortgage',
      actionCount: 12,
      lastModified: new Date('2024-12-21'),
      modifiedBy: 'director-1',
      category: 'main',
      status: 'published',
      url: '/income-main-12',
      createdAt: new Date('2024-12-01'),
      createdBy: 'director-1'
    }
  ]);

  // Data fetching effect - follows ContentManagement.tsx pattern
  useEffect(() => {
    const fetchMainPageData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await apiService.getMainPageContent();
        if (response.success && response.data) {
          const transformedData = transformMainPageData(response.data);
          setMockContentPages(transformedData);
          
          // Update UserInfoCards with API data
          setActionCount(response.data.actionCount);
          setLastModified(response.data.lastModified);
        } else {
          throw new Error(response.error || 'Ошибка загрузки данных');
        }
      } catch (err) {
        console.error('Failed to fetch main page data:', err);
        // Graceful fallback to mock data - no error display for development
        console.log('Falling back to mock data for development');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMainPageData();
  }, []);

  // Mock images for gallery - using data URLs to avoid network requests
  const pageImages = [
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMUYyQTM3Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPtCh0YLRgNCw0L3QuNGG0LAgMTwvdGV4dD48L3N2Zz4=',
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMUYyQTM3Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPtCh0YLRgNCw0L3QuNGG0LAgMjwvdGV4dD48L3N2Zz4=',
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMUYyQTM3Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPtCh0YLRgNCw0L3QuNGG0LAgMzwvdGV4dD48L3N2Zz4=',
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMUYyQTM3Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPtCh0YLRgNCw0L3QuNGG0LAgNDwvdGV4dD48L3N2Zz4=',
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMUYyQTM3Ci8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPtCh0YLRgNCw0L3QuNGG0LAgNTwvdGV4dD48L3N2Zz4=',
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMUYyQTM3Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPtCh0YLRgNCw0L3QuNGG0LAgNjwvdGV4dD48L3N2Zz4='
  ];

  // Handlers for table interactions
  const handleSortChange = (sortBy: any, sortOrder: 'asc' | 'desc') => {
    setContentFilter(prev => ({
      ...prev,
      sortBy,
      sortOrder
    }));
  };

  const handlePageSelect = (page: ContentPage) => {
    console.log('Page selected:', page);
  };

  const handleEdit = (page: ContentPage) => {
    console.log('Edit page:', page);
  };

  const handleDelete = (page: ContentPage) => {
    console.log('Delete page:', page);
  };

  const handleView = (page: ContentPage) => {
    console.log('View page:', page);
  };

  const handleMultiSelect = (pageIds: string[]) => {
    console.log('Multi-select:', pageIds);
  };

  // Retry function for error state
  const handleRetry = () => {
    window.location.reload();
  };

  // Loading state - matches existing ContentTable component
  if (isLoading) {
    return (
      <div className="content-table loading">
        <div className="table-loading">
          <div className="loading-spinner"></div>
          <p>Загрузка данных...</p>
        </div>
      </div>
    );
  }

  // Error state - follows existing error handling patterns
  if (error) {
    return (
      <div className="content-main error">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h3>Ошибка загрузки</h3>
          <p>{error}</p>
          <button onClick={handleRetry} className="retry-button">
            Повторить
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="content-main">
      {/* Breadcrumb Section */}
      <div className="breadcrumb-section">
        <Breadcrumb
          items={[
            { label: 'Контент сайта', href: '/content-management' },
            { label: 'Главная', href: '/content/main', isActive: true }
          ]}
        />
      </div>

      {/* Page Header Section */}
      <div className="page-header-section">
        <div className="page-title-container">
          <h1 className="page-title">
            Калькулятор ипотеки Страница №2
          </h1>
        </div>
        
        {/* User Info Cards */}
        <div className="info-cards-section">
          <UserInfoCards
            actionCount={actionCount}
            lastModified={lastModified}
          />
        </div>
      </div>

      {/* Page Gallery Section */}
      <div className="gallery-section">
        <PageGallery
          images={pageImages}
          title="Страница и ее состояния"
        />
      </div>

      {/* Actions Table Section */}
      <div className="actions-table-section">
        <div className="table-header">
          <h2>Список действий на странице</h2>
        </div>
        
        <div className="table-container">
          <ContentTable
            data={mockContentPages}
            filter={contentFilter}
            isLoading={isLoading}
            readonly={false}
            onSortChange={handleSortChange}
            onRowSelect={handlePageSelect}
            onMultiSelect={handleMultiSelect}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
            className="actions-table"
          />
        </div>
      </div>
    </div>
  );
};

export default ContentMain;