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
import { useLanguage } from '../../contexts/LanguageContext';
import { apiService } from '../../services/api';
import { ContentListPage, ContentTableColumn } from '../../shared/components';
import { ContentListItem } from '../ContentListBase/types';
import './ContentCredit.css';

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
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${day}.${month}.${year} | ${hours}:${minutes}`;
  } catch (error) {
    return t('content.notModified');
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
  const { language, t } = useLanguage();
  const [creditData, setCreditData] = useState<CreditData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(location.state?.searchTerm || '');
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
          setError(response.error || t('content.error.loading'));
        }
      } catch (err) {
        console.error('❌ Error fetching credit data:', err);
        setError(t('content.error.loading'));
      } finally {
        setLoading(false);
        console.log('🏁 Credit data fetch completed');
      }
    };

    fetchCreditData();
  }, [language]); // Re-fetch when language changes

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
      title: t('content.table.pageName'),
      width: '362px',
      render: (_value, item, index) => {
        const pageNum = (item as any).page_number ?? (index + 1);
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
      title: t('content.table.actionCount'),
      width: '224px',
      align: 'center',
      render: (value) => <span>{value || 1}</span>
    },
    {
      key: 'lastModified',
      title: t('content.table.lastModified'),
      width: '224px',
      render: (value) => <span>{formatLastModified(value, t)}</span>
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