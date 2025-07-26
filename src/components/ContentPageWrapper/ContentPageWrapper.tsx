import React from 'react';
import { TabNavigation } from '../TabNavigation';
import './ContentPageWrapper.css';

interface ContentPageWrapperProps {
  title: string;
  children: React.ReactNode;
  showTabNavigation?: boolean;
}

/**
 * ContentPageWrapper Component
 * Wraps content pages with consistent title and tab navigation
 */
const ContentPageWrapper: React.FC<ContentPageWrapperProps> = ({ 
  title, 
  children, 
  showTabNavigation = true 
}) => {
  return (
    <div className="main-content-frame">
      {/* Page Title */}
      <h1 className="page-title">{title}</h1>
      
      {/* Tab Navigation */}
      {showTabNavigation && <TabNavigation />}
      
      {/* Content */}
      {children}
    </div>
  );
};

export default ContentPageWrapper;