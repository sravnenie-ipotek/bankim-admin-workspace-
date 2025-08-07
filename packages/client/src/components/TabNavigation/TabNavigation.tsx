import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import './TabNavigation.css';

/**
 * TabNavigation Component
 * Application context tabs for content management
 * Based on devHelp/contentMenu/cssPages/types.md
 */
const TabNavigation: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="tab-navigation">
      <div className="tab-item active">
        <span className="tab-text">{t('navigation.tabs.public')}</span>
      </div>
      <div className="tab-separator"></div>
      <div className="tab-item">
        <span className="tab-text">{t('navigation.tabs.userPortal')}</span>
      </div>
      <div className="tab-separator"></div>
      <div className="tab-item">
        <span className="tab-text">{t('navigation.tabs.adminSite')}</span>
      </div>
      <div className="tab-separator"></div>
      <div className="tab-item">
        <span className="tab-text">{t('navigation.tabs.adminBank')}</span>
      </div>
      <div className="tab-separator"></div>
    </div>
  );
};

export default TabNavigation;