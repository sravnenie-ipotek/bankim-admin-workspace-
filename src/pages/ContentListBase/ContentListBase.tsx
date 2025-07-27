/**
 * ContentListBase Component
 * Reusable base component for content list pages - matches ContentMenu design
 * 
 * @version 2.0.0
 * @since 2025-01-20
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiService } from '../../services/api';
import { Pagination } from '../../components';
import './ContentListBase.css';

// Helper function to format date for display
const formatLastModified = (dateString: string | null | undefined): string => {
  if (!dateString) {
    return 'Не изменялось';
  }
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Не изменялось';
    }
    
    // Format date in Israel timezone using Intl.DateTimeFormat
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Jerusalem',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    
    const parts = formatter.formatToParts(date);
    const day = parts.find(p => p.type === 'day')?.value || '00';
    const month = parts.find(p => p.type === 'month')?.value || '00';
    const year = parts.find(p => p.type === 'year')?.value || '0000';
    const hours = parts.find(p => p.type === 'hour')?.value || '00';
    const minutes = parts.find(p => p.type === 'minute')?.value || '00';
     
    return `${day}.${month}.${year} | ${hours}:${minutes}`;
  } catch (error) {
    return 'Не изменялось';
  }
};

interface ContentTranslation {
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
  title?: string;
  actionCount?: number;
  contentType?: string;
}

interface ContentData {
  status: string;
  content_count: number;
  content_items: ContentTranslation[];
}

interface ContentListBaseProps {
  sectionTitle: string;
  contentType: string;
  breadcrumbItems?: Array<{ label: string; isActive?: boolean }>;
}

const ContentListBase: React.FC<ContentListBaseProps> = ({
  sectionTitle,
  contentType
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [contentData, setContentData] = useState<ContentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(location.state?.searchTerm || '');
  const [currentPage, setCurrentPage] = useState(location.state?.fromPage || 1);
  const [selectedLanguage, setSelectedLanguage] = useState<'ru' | 'he' | 'en'>('ru');
  const itemsPerPage = 12;

  useEffect(() => {
    const fetchContentData = async () => {
      try {
        setLoading(true);
        console.log(`🔄 Fetching ${contentType} translations from database...`);
        const response = await apiService.getContentByContentType(contentType);
        
        if (response.success && response.data) {
          // Normalize the data to ensure translations exist
          const normalizedItems = response.data.map((item: any) => ({
            ...item,
            id: item.id || '',
            content_key: item.content_key || '',
            translations: {
              ru: item.translations?.ru || item.title || '',
              he: item.translations?.he || '',
              en: item.translations?.en || ''
            },
            actionCount: item.actionCount || 1, // Use real actionCount from database
            contentType: item.contentType || contentType,
            last_modified: item.last_modified || null
          }));
          
          const normalizedData: ContentData = {
            status: 'success',
            content_count: normalizedItems.length,
            content_items: normalizedItems
          };
          
          setContentData(normalizedData);
          console.log(`✅ Successfully loaded ${contentType} data:`, normalizedData);
        } else {
          console.error(`❌ Failed to fetch ${contentType} translations from database:`, response.error);
          setError(response.error || `Failed to fetch ${contentType} translations from database`);
        }
      } catch (err) {
        console.error(`❌ Error fetching ${contentType} data:`, err);
        setError(`Failed to load ${contentType} data`);
      } finally {
        setLoading(false);
      }
    };

    fetchContentData();
  }, [contentType]);

  const handleViewClick = (item: ContentTranslation) => {
    // Navigate to drill page for the specific content type
    navigate(`/content/${contentType}/drill/${item.content_key}`, { 
      state: { 
        fromPage: currentPage,
        searchTerm: searchTerm,
        contentItem: item
      } 
    });
  };

  const filteredItems = useMemo(() => {
    if (!contentData?.content_items) return [];
    return contentData.content_items.filter(item =>
      item.content_key?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.translations?.ru?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.translations?.he?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.translations?.en?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [contentData?.content_items, searchTerm]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredItems.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="content-list-loading">
        <div className="loading-spinner"></div>
        <p>Загрузка данных {sectionTitle}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="content-list-error">
        <p>Ошибка: {error}</p>
        <button onClick={() => window.location.reload()}>Попробовать снова</button>
      </div>
    );
  }

  return (
    <div className="content-list-container">
      {/* Search Section */}
      <div className="search-section">
        <div className="search-container">
          <div className="search-input-wrapper">
            <svg className="search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M7.333 12.667A5.333 5.333 0 1 0 7.333 2a5.333 5.333 0 0 0 0 10.667zM14 14l-2.9-2.9" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <input
              type="text"
              placeholder="Искать по названию, ID, номеру страницы"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="table-section">
        {/* List of Pages Title */}
        <h2 className="page-list-title">Список страниц</h2>

        {/* Table Content - Column Layout */}
        <div className="content-table">
          {/* Table Header Row */}
          <div className="table-header-row">
            <div className="header-cell column6">
              <span className="text8">НАЗВАНИЕ СТРАНИЦЫ</span>
            </div>
            <div className="header-cell column12">
              <span className="text10">Количество действий</span>
            </div>
            <div className="header-cell column12">
              <span className="text10">Были изменения</span>
            </div>
            <div className="header-cell column7"></div>
          </div>
          
          <div className="table-divider"></div>
          
          <div className="row-view11">
            {/* Column 1 - Page Names */}
            <div className="column6">
              {currentItems.map((item, index) => (
                <React.Fragment key={`name-${item.id}`}>
                  <div className="box3"></div>
                  <span 
                    className="text9" 
                    title={(() => {
                      const fullText = `${startIndex + index + 1}. ${
                        selectedLanguage === 'ru' ? (item.translations?.ru || item.content_key) :
                        selectedLanguage === 'he' ? (item.translations?.he || item.content_key) :
                        (item.translations?.en || item.content_key)
                      }`;
                      return fullText.length > 30 ? fullText : undefined;
                    })()}
                  >
                    {`${startIndex + index + 1}. ${
                      selectedLanguage === 'ru' ? (item.translations?.ru || item.content_key) :
                      selectedLanguage === 'he' ? (item.translations?.he || item.content_key) :
                      (item.translations?.en || item.content_key)
                    }`}
                  </span>
                </React.Fragment>
              ))}
            </div>

            {/* Column 2 - Number of Actions */}
            <div className="column12">
              {currentItems.map((item) => (
                <React.Fragment key={`actions-${item.id}`}>
                  <div className="box4"></div>
                  <span className="text15">{item.actionCount || 1}</span>
                </React.Fragment>
              ))}
            </div>

            {/* Column 3 - Last Modified */}
            <div className="column12">
              {currentItems.map((item) => (
                <React.Fragment key={`modified-${item.id}`}>
                  <div className="box4"></div>
                  <span className="text20">{formatLastModified(item.last_modified)}</span>
                </React.Fragment>
              ))}
            </div>

            {/* Column 4 - Actions */}
            <div className="column7">
              {currentItems.map((item) => (
                <React.Fragment key={`action-${item.id}`}>
                  <div className="box6"></div>
                  <div
                    className="image8"
                    onClick={() => handleViewClick(item)}
                    style={{ 
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                      color: '#FFFFFF',
                      backgroundColor: 'transparent',
                      border: '1px solid #374151'
                    }}
                  >
                    →
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Modern UX-Friendly Pagination */}
        <div style={{ padding: '24px 16px' }}>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredItems.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            size="medium"
          />
        </div>
      </div>
    </div>
  );
};

export default ContentListBase;