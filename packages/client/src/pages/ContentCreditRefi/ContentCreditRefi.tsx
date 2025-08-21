/**
 * ContentCreditRefi Component
 * Credit refinancing translations management - displays and allows editing of credit refi component translations
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
import './ContentCreditRefi.css';

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

interface CreditRefiData {
  status: string;
  content_count: number;
  credit_refi_items: ContentListItem[];
}

const ContentCreditRefi: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, t } = useLanguage();
  const [creditRefiData, setCreditRefiData] = useState<CreditRefiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(location.state?.searchTerm || '');
  const itemsPerPage = 15; // Show all 14 credit-refi pages at once

  useEffect(() => {
    const fetchCreditRefiData = async () => {
      try {
        setLoading(true);
        console.log('🔄 Fetching all 14 credit-refi pages from database...');
        const response = await apiService.getCreditRefiAllItems();
        
        if (response.success && response.data) {
          // Normalize the data to ensure translations exist
          // Each item represents a screen_location (14 total for credit-refi pages)
          const normalizedItems = response.data.map((item: any, index: number) => ({
            ...item,
            id: item.id || `credit-refi-${index}`,
            confluence_num: item.confluence_num, // Preserve Confluence number (6.1 - 6.1.14)
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
          
          // Items should already be sorted by the API, but ensure proper order
          normalizedItems.sort((a: any, b: any) => {
            const numA = a.confluence_num === '6.1' ? 0 : parseFloat(a.confluence_num?.replace('6.1.', '') || '99');
            const numB = b.confluence_num === '6.1' ? 0 : parseFloat(b.confluence_num?.replace('6.1.', '') || '99');
            return numA - numB;
          });
          
          const normalizedData: CreditRefiData = {
            status: 'success',
            content_count: normalizedItems.length,
            credit_refi_items: normalizedItems
          };
          
          setCreditRefiData(normalizedData);
          console.log('✅ Successfully loaded all 14 credit-refi pages:', normalizedData);
          console.log(`📊 Total credit-refi pages: ${normalizedItems.length}`);
          console.log('Pages:', normalizedItems.map((item: any) => `${item.confluence_num}: ${item.screen_location} (${item.actionCount} items)`));
        } else {
          console.error('❌ Failed to fetch credit-refi translations from database:', response.error);
          setError(response.error || t('content.error.loading'));
        }
      } catch (err) {
        console.error('❌ Error fetching credit-refi data:', err);
        setError(t('content.error.loading'));
      } finally {
        setLoading(false);
      }
    };

    fetchCreditRefiData();
  }, [language]); // Re-fetch when language changes

  const handleViewClick = (item: ContentListItem) => {
    // Use the actual screen_location from the item
    const screenLocation = item.screen_location;
    
    console.log(`📍 Navigating to credit-refi drill for item:`, item);
    console.log(`📍 Screen location: "${screenLocation}"`);
    console.log(`📍 Content key: "${item.content_key}"`);
    
    if (!screenLocation) {
      console.error('❌ No screen_location found for item:', item);
      return;
    }
    
    // Navigate to drill page using the actual screen_location
    navigate(`/content/credit-refi/drill/${screenLocation}`, { 
      state: { 
        searchTerm: searchTerm 
      } 
    });
  };

  const filteredItems = useMemo(() => {
    if (!creditRefiData?.credit_refi_items) return [];
    return creditRefiData.credit_refi_items.filter(item =>
      item.content_key?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.translations?.ru?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.translations?.he?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.translations?.en?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [creditRefiData?.credit_refi_items, searchTerm]);

  // Define columns for the ContentTable
  const columns: ContentTableColumn[] = [
    {
      key: 'name',
      title: t('content.table.pageName'),
      width: '362px',
      render: (_value, item, index) => {
        // Display with Confluence number (6.1 - 6.1.14) and proper title
        const pageNum = (item as any).confluence_num || `6.1.${index === 0 ? '' : index + 1}`;
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

  return (
    <ContentListPage
      title={t('menu.creditRefi')}  // "Рефинансирование кредита"
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

export default ContentCreditRefi; 