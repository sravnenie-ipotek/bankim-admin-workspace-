/**
 * ContentTable Component
 * Reusable table component for content list pages based on glavnaia design
 * 
 * @version 1.0.0
 * @since 2025-01-28
 */

import React from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import './ContentTable.css';

export interface ContentTableColumn {
  key: string;
  title: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, item: any, index: number) => React.ReactNode;
}

export interface ContentTableProps {
  columns: ContentTableColumn[];
  data: any[];
  onRowAction?: (item: any, index: number) => void;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  showSearch?: boolean;
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  className?: string;
}

const ContentTable: React.FC<ContentTableProps> = ({
  columns,
  data,
  onRowAction,
  searchPlaceholder,
  searchValue = '',
  onSearchChange,
  showSearch = true,
  loading = false,
  error = null,
  emptyMessage,
  className = ''
}) => {
  const { t } = useLanguage();
  
  // Use translation functions with fallback to props
  const finalSearchPlaceholder = searchPlaceholder || t('content.search.placeholder');
  const finalEmptyMessage = emptyMessage || t('content.noData');
  if (loading) {
    return (
      <div className="content-table-loading">
        <div className="loading-spinner"></div>
        <p>{t('content.loading')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="content-table-error">
        <p>{t('content.error.loading')}: {error}</p>
        <button onClick={() => window.location.reload()}>{t('actions.refresh')}</button>
      </div>
    );
  }

  return (
    <div className={`content-table-container ${className}`}>
      {/* Search Section */}
      {showSearch && (
        <div className="content-table-header">
          <div className="content-table-search">
            <div className="search-input-wrapper">
              <svg className="search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M7.333 12.667A5.333 5.333 0 1 0 7.333 2a5.333 5.333 0 0 0 0 10.667zM14 14l-2.9-2.9" 
                      stroke="#9CA3AF" 
                      strokeWidth="1.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"/>
              </svg>
              <input
                type="text"
                placeholder={finalSearchPlaceholder}
                value={searchValue}
                onChange={(e) => onSearchChange?.(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
        </div>
      )}

      {/* Table Section */}
      <div className="content-table-wrapper">
        {/* Table Header */}
        <div className="content-table-row content-table-header-row">
          {columns.map((column) => (
            <div 
              key={column.key}
              className={`content-table-cell content-table-header-cell`}
              style={{ width: column.width }}
            >
              <span className="header-text">{column.title}</span>
            </div>
          ))}
          {onRowAction && (
            <div className="content-table-cell content-table-header-cell action-cell"></div>
          )}
        </div>

        <div className="content-table-divider"></div>

        {/* Table Body */}
        <div className="content-table-body">
          {data.length === 0 ? (
            <div className="content-table-empty">
              <p>{finalEmptyMessage}</p>
            </div>
          ) : (
            data.map((item, index) => (
              <React.Fragment key={item.id || index}>
                <div className="content-table-row">
                  {columns.map((column) => (
                    <div 
                      key={column.key}
                      className={`content-table-cell ${column.align ? `align-${column.align}` : ''}`}
                      style={{ width: column.width }}
                    >
                      {column.render ? 
                        column.render(item[column.key], item, index) : 
                        <span className="cell-text">{item[column.key]}</span>
                      }
                    </div>
                  ))}
                  {onRowAction && (
                    <div className="content-table-cell action-cell">
                      <button 
                        className="action-button"
                        onClick={() => onRowAction(item, index)}
                        aria-label="View details"
                      >
                        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                          <path d="M7.33 4.58L12.83 11L7.33 17.42" 
                                stroke="currentColor" 
                                strokeWidth="2" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
                {index < data.length - 1 && <div className="content-table-divider"></div>}
              </React.Fragment>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentTable;