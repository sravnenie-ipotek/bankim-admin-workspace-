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
import { NavigationTree, TreeNode } from '../../components/NavigationTree';
import navigationManifest from '../../data/navigation-manifest.json';
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
  const [viewMode, setViewMode] = useState<'table' | 'tree'>('tree');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['mortgage', 'service_1', 'service_2', 'service_3']));
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


  // Build tree structure from manifest and API data
  const buildTreeStructure = (): TreeNode[] => {
    if (!mortgageData?.mortgage_items) return [];

    // Create a map of screen_location to mortgage items for quick lookup
    const itemMap = new Map<string, MortgageTranslation>();
    mortgageData.mortgage_items.forEach(item => {
      if (item.screen_location) {
        itemMap.set(item.screen_location, item);
      }
    });

    // Function to process manifest nodes
    const processNode = (node: any): TreeNode => {
      const treeNode: TreeNode = {
        id: node.id,
        confluence_num: node.confluence_num,
        title: node.title,
        screen_location: node.screen_location,
        children: node.children ? node.children.map(processNode) : undefined
      };

      // If this node has a screen_location, get data from API
      if (node.screen_location && itemMap.has(node.screen_location)) {
        const apiItem = itemMap.get(node.screen_location)!;
        treeNode.actionCount = apiItem.actionCount;
        treeNode.lastModified = apiItem.lastModified;
      }

      return treeNode;
    };

    // Build tree from manifest
    const mortgageSection = navigationManifest.mortgage;
    return [{
      id: mortgageSection.id,
      title: mortgageSection.title,
      children: mortgageSection.children.map(processNode)
    }];
  };

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
        parentItemNumber: itemIndex + 1,
        confluenceNum: item.confluence_num,  // Pass Confluence number
        title: item.translations?.ru || item.content_key  // Pass title
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

  // Handle tree node click
  const handleTreeNodeClick = (node: TreeNode) => {
    if (node.screen_location) {
      // Find the corresponding item in mortgageData
      const item = mortgageData?.mortgage_items.find(i => i.screen_location === node.screen_location);
      if (item) {
        const itemIndex = mortgageData?.mortgage_items.indexOf(item) || 0;
        handleViewClick(item, itemIndex);
      }
    }
  };

  // Handle tree node expand/collapse
  const handleToggleExpand = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  // Build tree data
  const treeData = useMemo(() => buildTreeStructure(), [mortgageData]);

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