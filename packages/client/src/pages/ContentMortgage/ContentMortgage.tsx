/**
 * ContentMortgage Component
 * Mortgage translations management - displays and allows editing of mortgage component translations
 * Now using shared ContentListPage component
 * 
 * @version 3.0.0
 * @since 2025-01-28
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { apiService } from '../../services/api';
import { ContentListPage, ContentTableColumn } from '../../shared/components';
import './ContentMortgage.css';

// Helper function to format date for display
const formatLastModified = (dateString: string | null | undefined, t: (key: string) => string): string => {
  if (!dateString) {
    return t('content.notModified');
  }
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return t('content.notModified');
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
    return t('content.notModified');
  }
};

interface MortgageTranslation {
  id: string;
  confluence_num?: string;  // Add Confluence number from navigation mapping
  content_key: string;
  component_type: string;
  category: string;
  screen_location: string;
  description: string;
  is_active: boolean;
  page_number?: number;
  translations: {
    ru: string;
    he: string;
    en: string;
  };
  lastModified: string;
  actionCount: number;
  contentType: string;
}

interface MortgageData {
  status: string;
  content_count: number;
  mortgage_items: MortgageTranslation[];
}

const ContentMortgage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, t } = useLanguage();
  const [mortgageData, setMortgageData] = useState<MortgageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(location.state?.searchTerm || '');
  const itemsPerPage = 15; // Show all 14 mortgage pages at once

  useEffect(() => {
    const fetchMortgageData = async () => {
      try {
        setLoading(true);
        console.log('🔄 Fetching mortgage translations from database...');
        const response = await apiService.getContentByContentType('mortgage');
        
        if (response.success && response.data) {
          // Data is already normalized by apiService.getContentByContentType
          const normalizedItems = response.data.map((item: any) => ({
            ...item,
            id: item.id || '',
            confluence_num: item.confluence_num, // Preserve Confluence number
            content_key: item.content_key || '',
            translations: {
              ru: item.translations?.ru || item.title || '',
              he: item.translations?.he || '',
              en: item.translations?.en || ''
            },
            actionCount: item.actionCount || 0,
            contentType: item.contentType || 'text',
            lastModified: item.lastModified || item.last_modified || item.updated_at || new Date().toISOString()
          }));
          
          const normalizedData: MortgageData = {
            status: 'success',
            content_count: normalizedItems.length,
            mortgage_items: normalizedItems
          };
          
          setMortgageData(normalizedData);
          console.log('✅ Successfully loaded mortgage data:', normalizedData);
          console.log('First item:', normalizedItems[0]); // Log first item to see structure
        } else {
          console.error('❌ Failed to fetch mortgage translations from database:', response.error);
          setError(response.error || 'Failed to fetch mortgage translations from database');
        }
      } catch (err) {
        console.error('❌ Error fetching mortgage data:', err);
        setError('Failed to load mortgage data');
      } finally {
        setLoading(false);
      }
    };

    fetchMortgageData();
  }, [language]); // Re-fetch data when language changes

  const handleViewClick = (item: MortgageTranslation, itemIndex: number) => {
    // Navigate directly to the drill page for this individual page
    const screenLocation = item.screen_location || item.content_key;
    
    // Calculate the base action number for continuous numbering
    let baseActionNumber = 0;
    for (let i = 0; i < itemIndex; i++) {
      baseActionNumber += filteredItems[i].actionCount || 0;
    }
    
    // Navigate to drill page to show detailed actions for this page
    navigate(`/content/mortgage/drill/${screenLocation}`, { 
      state: { 
        searchTerm: searchTerm,
        baseActionNumber: baseActionNumber,
        parentItemNumber: itemIndex + 1,
        confluenceNum: item.confluence_num,
        title: item.translations?.ru || item.content_key
      } 
    });
  };

  const filteredItems = useMemo(() => {
    if (!mortgageData?.mortgage_items) return [];
    return mortgageData.mortgage_items.filter(item =>
      item.content_key?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.translations?.ru?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.translations?.he?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.translations?.en?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [mortgageData?.mortgage_items, searchTerm]);

  // Define columns for the ContentTable
  const columns: ContentTableColumn[] = [
    {
      key: 'name',
      title: t('content.table.pageName'),
      width: '362px',
      render: (_value, item, index) => {
        // Use Confluence number if available, otherwise fall back to page_number or index
        const pageNum = item.confluence_num || item.page_number || (index + 1);
        const title = language === 'ru' ? (item.translations?.ru || item.content_key) :
                     language === 'he' ? (item.translations?.he || item.content_key) :
                     (item.translations?.en || item.content_key);
        const fullText = `${pageNum}. ${title}`;
        return (
          <span title={fullText.length > 30 ? fullText : undefined}>
            {fullText}
          </span>
        );
      }
    },
    {
      key: 'actionCount',
      title: 'Количество действий',
      width: '160px',
      align: 'center',
      render: (value) => <span>{value || 0}</span>
    },
    {
      key: 'lastModified',
      title: t('content.table.lastModified'),
      width: '160px',
      render: (value) => <span>{formatLastModified(value, t)}</span>
    }
  ];

  // Handle row action
  const handleRowAction = (item: MortgageTranslation, _index: number) => {
    // Calculate the actual index in the full filtered list
    const actualIndex = filteredItems.findIndex(i => i.id === item.id);
    handleViewClick(item, actualIndex);
  };

  if (loading) {
    return (
      <div className="content-mortgage-loading">
        <div className="loading-spinner">Загрузка...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="content-mortgage-error">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  // Default to table view for now since tree needs debugging
  return (
    <ContentListPage
      title=""
      tabs={[]}
      data={filteredItems}
      columns={columns}
      onRowAction={handleRowAction}
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
      loading={false}
      error={null}
      itemsPerPage={itemsPerPage}
    />
  );
};

export default ContentMortgage;
