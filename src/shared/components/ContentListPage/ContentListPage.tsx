/**
 * ContentListPage Component
 * Shared page wrapper for content list pages with tab navigation
 * Based on countMortgrageAdmin design
 * 
 * @version 1.0.0
 * @since 2025-01-28
 */

import React, { useState } from 'react';
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
  showLanguageSelector?: boolean;
  selectedLanguage?: 'ru' | 'he' | 'en';
  onLanguageChange?: (lang: 'ru' | 'he' | 'en') => void;
}

const defaultTabs: TabConfig[] = [
  { id: 'public', label: 'До регистрации', active: true },
  { id: 'user_portal', label: 'Личный кабинет' },
  { id: 'cms', label: 'Админ панель для сайтов' },
  { id: 'bank_ops', label: 'Админ панель для банков' }
];

const ContentListPage: React.FC<ContentListPageProps> = ({
  title,
  tabs = defaultTabs,
  activeTab = 'public',
  onTabChange,
  searchValue = '',
  onSearchChange,
  data,
  columns,
  onRowAction,
  loading = false,
  error = null,
  itemsPerPage = 12,
  showLanguageSelector = true,
  selectedLanguage = 'ru',
  onLanguageChange
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate pagination
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = data.slice(startIndex, endIndex);

  const handleLanguageClick = () => {
    if (onLanguageChange) {
      // Cycle through languages
      if (selectedLanguage === 'ru') onLanguageChange('he');
      else if (selectedLanguage === 'he') onLanguageChange('en');
      else onLanguageChange('ru');
    }
  };

  const getLanguageText = () => {
    switch (selectedLanguage) {
      case 'ru': return 'Русский';
      case 'he': return 'עברית';
      case 'en': return 'English';
      default: return 'Русский';
    }
  };

  return (
    <div className="content-list-page">
      {/* Top Navigation Bar */}
      <div className="content-list-navbar">
        <div className="navbar-content">
          {showLanguageSelector && (
            <div className="language-selector" onClick={handleLanguageClick}>
              <span className="language-text">{getLanguageText()}</span>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          )}
          <div className="navbar-actions">
            <img src="/src/assets/images/static/icons/headset.svg" alt="Support" className="navbar-icon" />
            <img src="/src/assets/images/static/icons/bell.svg" alt="Notifications" className="navbar-icon" />
            <div className="profile-section">
              <img src="/src/assets/images/static/profile-avatar.png" alt="Profile" className="profile-avatar" />
              <span className="profile-name">Александр Пушкин</span>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9 18L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="content-list-main">
        {/* Page Title */}
        <h1 className="page-title">{title}</h1>

        {/* Tab Navigation */}
        {tabs && tabs.length > 0 && (
          <div className="tab-navigation">
            {tabs.map((tab, index) => (
              <React.Fragment key={tab.id}>
                <button
                  className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => onTabChange?.(tab.id)}
                >
                  {tab.label}
                </button>
                {index < tabs.length - 1 && <div className="tab-separator" />}
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