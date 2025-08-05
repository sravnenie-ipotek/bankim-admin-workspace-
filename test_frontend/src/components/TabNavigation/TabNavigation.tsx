import React from 'react';
import './TabNavigation.css';

/**
 * TabNavigation Component
 * Application context tabs for content management
 * Based on devHelp/contentMenu/cssPages/types.md
 */
const TabNavigation: React.FC = () => {
  return (
    <div className="tab-navigation">
      <div className="tab-item active">
        <span className="tab-text">До регистрации</span>
      </div>
      <div className="tab-separator"></div>
      <div className="tab-item">
        <span className="tab-text">Личный кабинет</span>
      </div>
      <div className="tab-separator"></div>
      <div className="tab-item">
        <span className="tab-text">Админ панель для сайтов</span>
      </div>
      <div className="tab-separator"></div>
      <div className="tab-item">
        <span className="tab-text">Админ панель для банков</span>
      </div>
      <div className="tab-separator"></div>
    </div>
  );
};

export default TabNavigation;