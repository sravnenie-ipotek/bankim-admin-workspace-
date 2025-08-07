/**
 * ContentCredit Component
 * Credit calculation translations management - displays and allows editing of credit component translations
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
import './ContentCredit.css';

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

interface CreditData {
  status: string;
  content_count: number;
  credit_items: ContentListItem[];
}

const ContentCredit: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [creditData, setCreditData] = useState<CreditData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(location.state?.searchTerm || '');
  const [selectedLanguage] = useState<'ru' | 'he' | 'en'>('ru');
  const itemsPerPage = 12;

  useEffect(() => {
    console.log('🚀 ContentCredit component mounted, starting data fetch...');
    
    const fetchCreditData = async () => {
      try {
        setLoading(true);
        console.log('🔄 Fetching credit translations from database...');
        const response = await apiService.getContentByContentType('credit');
        
        console.log('📊 Raw API response:', response);
        
        if (response.success && response.data) {
          // Data is already normalized by apiService.getContentByContentType
          const normalizedData: CreditData = {
            status: 'success',
            content_count: response.data.length,
            credit_items: response.data
          };
          
          setCreditData(normalizedData);
          console.log('✅ Successfully loaded credit data:', normalizedData);
          console.log('📋 Credit items count:', normalizedData.credit_items.length);
          console.log('📋 First item:', response.data[0]); // Log first item to see structure
        } else {
          console.error('❌ Failed to fetch credit translations from database:', response.error);
          setError(response.error || 'Failed to fetch credit translations from database');
        }
      } catch (err) {
        console.error('❌ Error fetching credit data:', err);
        setError('Failed to load credit data');
      } finally {
        setLoading(false);
        console.log('🏁 Credit data fetch completed');
      }
    };

    fetchCreditData();
  }, []);

  const handleViewClick = (item: ContentListItem) => {
    // Use the actual screen_location from the item
    const screenLocation = item.screen_location;
    
    console.log(`📍 Navigating to credit drill for item:`, item);
    console.log(`📍 Screen location: "${screenLocation}"`);
    console.log(`📍 Content key: "${item.content_key}"`);
    
    if (!screenLocation) {
      console.error('❌ No screen_location found for item:', item);
      return;
    }
    
    // Navigate to drill page using the actual screen_location
    navigate(`/content/credit/drill/${screenLocation}`, { 
      state: { 
        searchTerm: searchTerm 
      } 
    });
  };

  const filteredItems = useMemo(() => {
    console.log('🔍 Filtering credit items...');
    console.log('📊 Credit data exists:', !!creditData);
    console.log('📊 Credit items count:', creditData?.credit_items?.length || 0);
    console.log('📊 Search term:', searchTerm);
    
    if (!creditData?.credit_items) {
      console.log('❌ No credit items to filter');
      return [];
    }
    
    const filtered = creditData.credit_items.filter(item =>
      item.content_key?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.translations?.ru?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.translations?.he?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.translations?.en?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    console.log('✅ Filtered items count:', filtered.length);
    console.log('✅ First filtered item:', filtered[0]);
    
    return filtered;
  }, [creditData?.credit_items, searchTerm]);

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

  console.log('🎨 Rendering ContentCredit component...');
  console.log('🎨 Loading state:', loading);
  console.log('🎨 Error state:', error);
  console.log('🎨 Filtered items for rendering:', filteredItems.length);

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

export default ContentCredit; 