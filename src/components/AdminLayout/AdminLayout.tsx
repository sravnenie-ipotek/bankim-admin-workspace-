/**
 * AdminLayout Component
 * Combines TopNavigation and SharedMenu for consistent layout across admin pages
 * 
 * Features:
 * - Comprehensive top navigation with language selector, notifications, user profile
 * - Consistent sidebar navigation
 * - Responsive design
 * - Easy integration for admin pages
 * - Proper spacing and layout management
 * - Tech support and profile menu functionality
 */

import React, { useState } from 'react';
import { TopNavigation } from '../TopNavigation';
import { SharedMenu } from '../SharedMenu';
import './AdminLayout.css';

interface AdminLayoutProps {
  /** Page title to display in header */
  title: string;
  /** Current active menu item */
  activeMenuItem?: string;
  /** Children components to render in main content area */
  children: React.ReactNode;
  /** Custom CSS class for the layout */
  className?: string;
  /** Callback when menu item is clicked */
  onMenuItemClick?: (itemId: string) => void;
  /** Current selected language */
  selectedLanguage?: string;
  /** Notification count */
  notificationCount?: number;
  /** User profile data */
  userProfile?: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
    initials: string;
  };
  /** Bank context data */
  bankContext?: {
    id: string;
    name: string;
    shortName: string;
  };
}

/**
 * AdminLayout provides a consistent layout structure for all admin pages
 * Includes TopNavigation and SharedMenu with proper responsive behavior
 * Supports language switching, notifications, tech support, and user profile management
 */
const AdminLayout: React.FC<AdminLayoutProps> = ({
  title,
  activeMenuItem = 'dashboard',
  children,
  className = '',
  onMenuItemClick,
  selectedLanguage = 'ru',
  notificationCount = 0,
  userProfile = {
    id: '1',
    name: 'Admin User',
    email: 'admin@bankim.com',
    role: 'Administrator',
    initials: 'AU'
  },
  bankContext = {
    id: '1',
    name: 'Bank Mizrahi-Tefahot',
    shortName: 'BMT'
  }
}) => {
  const [currentActiveItem, setCurrentActiveItem] = useState(activeMenuItem);

  // TopNavigation handlers
  const handleLanguageChange = (languageCode: string) => {
    console.log('Language changed to:', languageCode);
    // TODO: Implement language change logic
  };

  const handleTechSupportClick = () => {
    console.log('Tech support clicked');
    // TODO: Implement tech support logic
  };

  const handleNotificationsClick = () => {
    console.log('Notifications clicked');
    // TODO: Implement notifications logic
  };

  const handleProfileMenuClick = (action: string) => {
    console.log('Profile menu action:', action);
    // TODO: Implement profile menu actions
    if (action === 'logout') {
      // Handle logout logic
      console.log('Logout clicked');
    }
  };

  const handleMenuItemClick = (itemId: string) => {
    setCurrentActiveItem(itemId);
    
    if (onMenuItemClick) {
      onMenuItemClick(itemId);
    }

    // Handle navigation based on menu item
    switch (itemId) {
      case 'dashboard':
        window.location.href = '/';
        break;
      case 'users':
        window.location.href = '/users';
        break;
      case 'reports':
        window.location.href = '/reports';
        break;
      case 'bank-employee':
        window.location.href = '/bank-employee';
        break;
      case 'user-registration':
        window.location.href = '/user-registration';
        break;
      case 'chat':
        window.location.href = '/chat';
        break;
      case 'settings':
        window.location.href = '/settings';
        break;
      case 'logout':
        // Handle logout logic
        console.log('Logout clicked');
        break;
      default:
        break;
    }
  };

  return (
    <div className={`admin-layout ${className}`}>
      <SharedMenu 
        activeItem={currentActiveItem}
        onItemClick={handleMenuItemClick}
      />
      
      <div className="admin-main-content">
        <TopNavigation
          selectedLanguage={selectedLanguage}
          notificationCount={notificationCount}
          userProfile={userProfile}
          bankContext={bankContext}
          onLanguageChange={handleLanguageChange}
          onTechSupportClick={handleTechSupportClick}
          onNotificationsClick={handleNotificationsClick}
          onProfileMenuClick={handleProfileMenuClick}
        />
        
        <main className="admin-page-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout; 