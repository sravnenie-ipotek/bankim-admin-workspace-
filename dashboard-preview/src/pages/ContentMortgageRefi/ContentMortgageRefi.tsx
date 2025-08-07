/**
 * ContentMortgageRefi Component
 * Mortgage refinancing translations management - displays and allows editing of mortgage refi component translations
 * Now using shared ContentListPage component
 * 
 * @version 3.0.0
 * @since 2025-01-28
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiService } from '../../services/api';
import { ContentListPage, ContentTableColumn } from '../../shared/components';
import { ContentListItem } from '../ContentListBase/types';
import './ContentMortgageRefi.css';

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
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${day}.${month}.${year} | ${hours}:${minutes}`;
  } catch (error) {
    return 'Не изменялось';
  }
};

interface MortgageRefiData {
  status: string;
  content_count: number;
  mortgage_items: ContentListItem[];
}

const ContentMortgageRefi: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mortgageRefiData, setMortgageRefiData] = useState<MortgageRefiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(location.state?.searchTerm || '');
  const [selectedLanguage] = useState<'ru' | 'he' | 'en'>('ru');
  const itemsPerPage = 12;

  useEffect(() => {
    const fetchMortgageRefiData = async () => {
      try {
        setLoading(true);
        console.log('🔄 Fetching mortgage-refi translations from database...');
        const response = await apiService.getContentByContentType('mortgage-refi');
        
        if (response.success && response.data) {
          // Data is already normalized by apiService.getContentByContentType
          const normalizedData: MortgageRefiData = {
            status: 'success',
            content_count: response.data.length,
            mortgage_items: response.data
          };
          
          setMortgageRefiData(normalizedData);
          console.log('✅ Successfully loaded mortgage-refi data:', normalizedData);
          console.log('First item:', response.data[0]); // Log first item to see structure
        } else {
          console.error('❌ Failed to fetch mortgage-refi translations from database:', response.error);
          setError(response.error || 'Failed to fetch mortgage-refi translations from database');
        }
      } catch (err) {
        console.error('❌ Error fetching mortgage-refi data:', err);
        setError('Failed to load mortgage-refi data');
      } finally {
        setLoading(false);
      }
    };

    fetchMortgageRefiData();
  }, []);

  const handleViewClick = (item: ContentListItem) => {
    // Use the actual screen_location from the item
    const screenLocation = item.screen_location;
    
    console.log(`📍 Navigating to mortgage-refi drill for item:`, item);
    console.log(`📍 Screen location: "${screenLocation}"`);
    console.log(`📍 Content key: "${item.content_key}"`);
    
    if (!screenLocation) {
      console.error('❌ No screen_location found for item:', item);
      return;
    }
    
    // Navigate to drill page using the actual screen_location
    navigate(`/content/mortgage-refi/drill/${screenLocation}`, { 
      state: { 
        searchTerm: searchTerm 
      } 
    });
  };

  const filteredItems = useMemo(() => {
    if (!mortgageRefiData?.mortgage_items) return [];
    return mortgageRefiData.mortgage_items.filter(item =>
      item.content_key?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.translations?.ru?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.translations?.he?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              item.translations?.en?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [mortgageRefiData?.mortgage_items, searchTerm]);

  // Define columns for the ContentTable
  const columns: ContentTableColumn[] = [
    {
      key: 'name',
      title: 'НАЗВАНИЕ СТРАНИЦЫ',
      width: '362px',
      render: (_value, item, index) => {
        const pageNum = (item as any).page_number ?? (index + 1);
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
      title: 'Номер действия',
      width: '160px',
      align: 'center',
      render: (value) => <span>{value || 1}</span>
    },
    {
      key: 'lastModified',
      title: 'Были изменения',
      width: '160px',
      render: (value) => <span>{formatLastModified(value)}</span>
    }
  ];

  // Handle row action
  const handleRowAction = (item: ContentListItem, _index: number) => {
    handleViewClick(item);
  };

  return (
    <ContentListPage
      title="Рефинансирование Ипотеки"
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

export default ContentMortgageRefi; 