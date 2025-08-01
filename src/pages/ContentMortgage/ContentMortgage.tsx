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
import { apiService } from '../../services/api';
import { ContentListPage, ContentTableColumn } from '../../shared/components';
import './ContentMortgage.css';

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

interface MortgageTranslation {
  id: string;
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
  const [mortgageData, setMortgageData] = useState<MortgageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(location.state?.searchTerm || '');
  const [selectedLanguage, setSelectedLanguage] = useState<'ru' | 'he' | 'en'>('ru');
  const itemsPerPage = 12;

  useEffect(() => {
    const fetchMortgageData = async () => {
      try {
        setLoading(true);
        console.log('🔄 Fetching mortgage translations from database...');
        const response = await apiService.getContentByContentType('mortgage');
        
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
  }, []);


  const handleViewClick = (item: MortgageTranslation, itemIndex: number) => {
    // Use the actual screen_location from the database
    // This ensures consistency with the database conventions documented in procceessesPagesInDB.md
    const stepId = item.screen_location || item.content_key;
    
    // Calculate the base action number for continuous numbering
    // Sum up all action counts of items before this one
    let baseActionNumber = 0;
    for (let i = 0; i < itemIndex; i++) {
      baseActionNumber += filteredItems[i].actionCount || 0;
    }
    
    // Navigate to drill page to show detailed actions for this page
    navigate(`/content/mortgage/drill/${stepId}`, { 
      state: { 
        searchTerm: searchTerm,
        baseActionNumber: baseActionNumber,
        parentItemNumber: itemIndex + 1
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
      title: 'НАЗВАНИЕ СТРАНИЦЫ',
      width: '362px',
      render: (_value, item, index) => {
        const pageNum = item.page_number ?? (index + 1);
        const title = selectedLanguage === 'ru' ? (item.translations?.ru || item.content_key) :
                     selectedLanguage === 'he' ? (item.translations?.he || item.content_key) :
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
      width: '224px',
      align: 'center',
      render: (value) => <span>{value || 1}</span>
    },
    {
      key: 'lastModified',
      title: 'Были изменения',
      width: '224px',
      render: (value) => <span>{formatLastModified(value)}</span>
    }
  ];

  // Handle row action
  const handleRowAction = (item: MortgageTranslation, _index: number) => {
    // Calculate the actual index in the full filtered list
    const actualIndex = filteredItems.findIndex(i => i.id === item.id);
    handleViewClick(item, actualIndex);
  };

  return (
    <ContentListPage
      title=""  // Empty title since ContentPageWrapper already provides it
      tabs={[]}  // Empty tabs since ContentPageWrapper already provides them
      data={filteredItems}
      columns={columns}
      onRowAction={handleRowAction}
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
      loading={loading}
      error={error}
      itemsPerPage={itemsPerPage}
    />
  );
};

export default ContentMortgage;