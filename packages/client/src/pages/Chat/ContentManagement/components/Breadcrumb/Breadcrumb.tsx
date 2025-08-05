/**
 * Breadcrumb Component
 * Navigation breadcrumb for content management pages
 * 
 * @version 1.0.0
 * @author BankIM Development Team
 * @since 2024-12-17
 */

import React from 'react';
import './Breadcrumb.css';

interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = '' }) => {
  return (
    <div className={`breadcrumb ${className}`}>
      <div className="breadcrumb-container">
        {items.map((item, index) => (
          <React.Fragment key={index}>
            {index > 0 && (
              <span className="breadcrumb-separator">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M7.5 5L12.5 10L7.5 15" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            )}
            <div className="breadcrumb-item">
              {item.href && !item.isActive ? (
                <a href={item.href} className="breadcrumb-link">
                  {item.label}
                </a>
              ) : (
                <span className={`breadcrumb-text ${item.isActive ? 'active' : ''}`}>
                  {item.label}
                </span>
              )}
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default Breadcrumb;