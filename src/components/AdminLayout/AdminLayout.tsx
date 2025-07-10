/**
 * AdminLayout Component
 * Combines SharedHeader and SharedMenu for consistent layout across admin pages
 * 
 * Features:
 * - Consistent header and sidebar navigation
 * - Responsive design
 * - Easy integration for admin pages
 * - Proper spacing and layout management
 */

import React from 'react';
import { SharedHeader } from '../SharedHeader';
import { SharedMenu } from '../SharedMenu';
import './AdminLayout.css';

interface AdminLayoutProps {
  /** Page title to display in header */
  title: string;
  /** Current user role */
  userRole?: string;
  /** Children components to render in main content area */
  children: React.ReactNode;
  /** Show/hide admin sections in menu */
  showAdminSections?: boolean;
  /** Custom CSS class for the layout */
  className?: string;
}

/**
 * AdminLayout provides a consistent layout structure for all admin pages
 * Includes SharedHeader and SharedMenu with proper responsive behavior
 */
const AdminLayout: React.FC<AdminLayoutProps> = ({
  title,
  userRole = 'admin',
  children,
  showAdminSections = true,
  className = ''
}) => {
  return (
    <div className={`admin-layout ${className}`}>
      <SharedMenu 
        userRole={userRole}
        showAdminSections={showAdminSections}
      />
      
      <div className="admin-main-content">
        <SharedHeader 
          title={title}
          navigateTo="/"
          confirmNavigation={false}
        />
        
        <main className="admin-page-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout; 