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
  const itemsPerPage = 15; // Show all 14 credit pages at once

  useEffect(() => {
    console.log('🚀 ContentCredit component mounted, starting data fetch...');
    
    const fetchCreditData = async () => {
      try {
        setLoading(true);
        console.log('🔄 Fetching all 14 credit pages from database...');
        const response = await apiService.getCreditAllItems();
        
        console.log('📊 Raw API response:', response);
        
        if (response.success && response.data) {
          // Normalize the data to ensure translations exist
          // Each item represents a screen_location (14 total for credit pages)
          const normalizedItems = response.data.map((item: any, index: number) => ({
            ...item,
            id: item.id || `credit-${index}`,
            confluence_num: item.confluence_num, // Preserve Confluence number (5.1 - 5.1.14)
            content_key: item.content_key || item.screen_location || '',
            translations: {
              ru: item.translations?.ru || item.description || item.title || item.screen_location || '',
              he: item.translations?.he || '',
              en: item.translations?.en || ''
            },
            actionCount: item.actionCount || 0,
            contentType: item.contentType || 'section',
            lastModified: item.lastModified || item.last_modified || item.updated_at || new Date().toISOString()
          }));
          
          // Sort by confluence_num to ensure proper order (5.1, 5.1.2, ..., 5.1.14)
          normalizedItems.sort((a: any, b: any) => {
            const numA = parseFloat(a.confluence_num?.replace('5.1.', '').replace('5.1', '0') || '99');
            const numB = parseFloat(b.confluence_num?.replace('5.1.', '').replace('5.1', '0') || '99');
            return numA - numB;
          });
          
          const normalizedData: CreditData = {
            status: 'success',
            content_count: normalizedItems.length,
            credit_items: normalizedItems
          };
          
          setCreditData(normalizedData);
          console.log('✅ Successfully loaded all 14 credit pages:', normalizedData);
          console.log(`📊 Total credit pages: ${normalizedItems.length}`);
          console.log('Pages:', normalizedItems.map((item: any) => `${item.confluence_num}: ${item.screen_location} (${item.actionCount} items)`));
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
        // Display with Confluence number (5.1 - 5.1.14) and proper title
        const pageNum = (item as any).confluence_num || `5.1.${index === 0 ? '' : index + 1}`;
        const title = language === 'ru' ? (item.translations?.ru || (item as any).description || item.screen_location) :
                     language === 'he' ? (item.translations?.he || (item as any).description || item.screen_location) :
                     (item.translations?.en || (item as any).description || item.screen_location);
        const fullText = `${pageNum}. ${title}`;
        
        // Also show screen_location for clarity
        const screenInfo = `(${item.screen_location})`;
        
        return (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span title={fullText.length > 30 ? fullText : undefined}>
              {fullText}
            </span>
            <span style={{ fontSize: '0.85em', color: '#666', marginTop: '2px' }}>
              {screenInfo}
            </span>
          </div>
        );
      }
    },
    {
      key: 'actionCount',
      title: 'Количество действий',
      width: '160px',
      align: 'center',
      render: (value) => <span>{typeof value === 'number' ? value : 0}</span>
    },
    {
      key: 'lastModified',
      title: t('content.table.lastModified'),
      width: '160px',
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
      title={t('menu.credit')}  // "Рассчитать кредит"
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