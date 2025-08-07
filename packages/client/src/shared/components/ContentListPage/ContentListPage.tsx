/**
 * ContentListPage Component
 * Shared page wrapper for content list pages with tab navigation
 * Based on countMortgrageAdmin design
 * 
 * @version 1.0.0
 * @since 2025-01-28
 */

import React, { useState } from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { ContentTable, ContentTableColumn } from '../ContentTable';
import { Pagination } from '../../../components';
import './ContentListPage.css';

export interface TabConfig {
  id: string;
  label: string;
  active?: boolean;
}

export interface ContentListPageProps {
  title: string;
  tabs?: TabConfig[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  data: any[];
  columns: ContentTableColumn[];
  onRowAction?: (item: any, index: number) => void;
  loading?: boolean;
  error?: string | null;
  itemsPerPage?: number;
}

// Default tabs will be generated dynamically using translations

const ContentListPage: React.FC<ContentListPageProps> = ({
  title,
  tabs,
  activeTab = 'public',
  onTabChange,
  searchValue = '',
  onSearchChange,
  data,
  columns,
  onRowAction,
  loading = false,
  error = null,
  itemsPerPage = 12
}) => {
  const { t } = useLanguage();
  const [currentPage, setCurrentPage] = useState(1);

  // Generate default tabs with translations
  const defaultTabs: TabConfig[] = [
    { id: 'public', label: t('navigation.tabs.public'), active: true },
    { id: 'user_portal', label: t('navigation.tabs.userPortal') },
    { id: 'cms', label: t('navigation.tabs.adminSite') },
    { id: 'bank_ops', label: t('navigation.tabs.adminBank') }
  ];

  // Use provided tabs or default to translated tabs
  const finalTabs = tabs || defaultTabs;

  // Calculate pagination
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = data.slice(startIndex, endIndex);


  return (
    <div className="content-list-page">
      {/* Main Content */}
      <div className="content-list-main">
        {/* Page Title */}
        <h1 className="page-title">{title}</h1>

        {/* Tab Navigation */}
        {finalTabs && finalTabs.length > 0 && (
          <div className="tab-navigation">
            {finalTabs.map((tab, index) => (
              <React.Fragment key={tab.id}>
                <button
                  className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => onTabChange?.(tab.id)}
                >
                  {tab.label}
                </button>
                {index < finalTabs.length - 1 && <div className="tab-separator" />}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Content Section */}
        <div className="content-section">
          <h2 className="section-title">Список страниц</h2>

          {/* Content Table */}
          <ContentTable
            columns={columns}
            data={currentItems}
            onRowAction={onRowAction}
            searchValue={searchValue}
            onSearchChange={onSearchChange}
            loading={loading}
            error={error}
            className="content-list-table"
          />

          {/* Pagination */}
          {!loading && !error && data.length > 0 && (
            <div className="content-list-pagination">
              <span className="pagination-info">
                Показывает {startIndex + 1}-{Math.min(endIndex, data.length)} из {data.length}
              </span>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={data.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                size="medium"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentListPage;