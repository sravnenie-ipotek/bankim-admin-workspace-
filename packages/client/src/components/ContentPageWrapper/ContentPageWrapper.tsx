import React from 'react';
import { TabNavigation } from '../TabNavigation';
import './ContentPageWrapper.css';

interface ContentPageWrapperProps {
  title: string;
  children: React.ReactNode;
  showTabNavigation?: boolean;
  showTitle?: boolean;
}

/**
 * ContentPageWrapper Component
 * Wraps content pages with consistent title and tab navigation
 */
const ContentPageWrapper: React.FC<ContentPageWrapperProps> = ({ 
  title, 
  children, 
  showTabNavigation = true,
  showTitle = true
}) => {
  return (
    <div className="main-content-frame">
      {/* Page Title */}
      {showTitle && <h1 className="page-title">{title}</h1>}
      
      {/* Content Container with Tab Navigation */}
      <div className="content-with-tabs">
        {/* Tab Navigation */}
        {showTabNavigation && <TabNavigation />}
        
        {/* Content */}
        {children}
      </div>
    </div>
  );
};

export default ContentPageWrapper;