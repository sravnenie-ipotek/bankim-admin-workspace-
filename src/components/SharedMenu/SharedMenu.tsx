/**
 * SharedMenu Component
 * Reusable navigation menu for the management portal
 * Used in admin pages that need consistent navigation
 * 
 * Features:
 * - Role-based navigation items
 * - Active state management
 * - Responsive design with mobile toggle
 * - Collapsible sections
 * - Icon-based navigation
 */

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './SharedMenu.css';

interface MenuItemProps {
  icon: string;
  label: string;
  path: string;
  badge?: string;
  isActive?: boolean;
}

interface MenuSectionProps {
  title: string;
  items: MenuItemProps[];
}

interface SharedMenuProps {
  /** Current user role */
  userRole?: string;
  /** Show/hide menu sections based on permissions */
  showAdminSections?: boolean;
  /** Custom menu items */
  customItems?: MenuItemProps[];
  /** Collapsed state */
  isCollapsed?: boolean;
  /** Mobile mode */
  isMobile?: boolean;
}

const SharedMenu: React.FC<SharedMenuProps> = ({
  userRole = 'bank-employee',
  showAdminSections = true,
  customItems = [],
  isCollapsed = false,
  isMobile = false
}) => {
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState<string[]>(['main']);
  const [isMenuCollapsed, setIsMenuCollapsed] = useState(isCollapsed);

  // Toggle section expansion
  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  // Check if menu item is active
  const isItemActive = (path: string) => {
    return location.pathname === path;
  };

  // Main navigation items
  const mainMenuItems: MenuItemProps[] = [
    {
      icon: '🏠',
      label: 'Dashboard',
      path: '/'
    },
    {
      icon: '🏛️',
      label: 'Bank Employee',
      path: '/bank-employee',
      badge: 'Active'
    },
    {
      icon: '👑',
      label: 'Director',
      path: '/director'
    },
    {
      icon: '⚙️',
      label: 'Administration',
      path: '/administration'
    },
    {
      icon: '📊',
      label: 'Sales Manager',
      path: '/sales-manager'
    },
    {
      icon: '📝',
      label: 'Content Manager',
      path: '/content-manager'
    },
    {
      icon: '🤝',
      label: 'Brokers',
      path: '/brokers'
    }
  ];

  // Admin tools section
  const adminToolsItems: MenuItemProps[] = [
    {
      icon: '👥',
      label: 'User Management',
      path: '/admin/users'
    },
    {
      icon: '🛡️',
      label: 'Permissions',
      path: '/admin/permissions'
    },
    {
      icon: '📊',
      label: 'Analytics',
      path: '/admin/analytics'
    },
    {
      icon: '⚙️',
      label: 'Settings',
      path: '/admin/settings'
    }
  ];

  // Client management section
  const clientManagementItems: MenuItemProps[] = [
    {
      icon: '👤',
      label: 'Client List',
      path: '/clients'
    },
    {
      icon: '📋',
      label: 'Applications',
      path: '/applications'
    },
    {
      icon: '📄',
      label: 'Documents',
      path: '/documents'
    },
    {
      icon: '💼',
      label: 'Services',
      path: '/services'
    }
  ];

  // Menu sections
  const menuSections: MenuSectionProps[] = [
    {
      title: 'Main Navigation',
      items: mainMenuItems
    },
    {
      title: 'Client Management',
      items: clientManagementItems
    },
    ...(showAdminSections ? [{
      title: 'Admin Tools',
      items: adminToolsItems
    }] : [])
  ];

  // Add custom items if provided
  if (customItems.length > 0) {
    menuSections.push({
      title: 'Custom',
      items: customItems
    });
  }

  return (
    <nav className={`shared-menu ${isMenuCollapsed ? 'collapsed' : ''} ${isMobile ? 'mobile' : ''}`}>
      {/* Menu Header */}
      <div className="menu-header">
        <div className="menu-title">
          {!isMenuCollapsed && (
            <>
              <span className="menu-icon">🎛️</span>
              <span className="menu-text">Admin Menu</span>
            </>
          )}
        </div>
        <button 
          className="menu-toggle"
          onClick={() => setIsMenuCollapsed(!isMenuCollapsed)}
          aria-label="Toggle menu"
        >
          {isMenuCollapsed ? '→' : '←'}
        </button>
      </div>

      {/* Menu Content */}
      <div className="menu-content">
        {menuSections.map((section, sectionIndex) => (
          <div key={section.title} className="menu-section">
            {!isMenuCollapsed && (
              <button
                className="section-header"
                onClick={() => toggleSection(section.title)}
                aria-expanded={expandedSections.includes(section.title)}
              >
                <span className="section-title">{section.title}</span>
                <span className="section-arrow">
                  {expandedSections.includes(section.title) ? '▼' : '▶'}
                </span>
              </button>
            )}
            
            {(expandedSections.includes(section.title) || isMenuCollapsed) && (
              <div className="section-items">
                {section.items.map((item, itemIndex) => (
                  <Link
                    key={`${section.title}-${itemIndex}`}
                    to={item.path}
                    className={`menu-item ${isItemActive(item.path) ? 'active' : ''}`}
                    title={isMenuCollapsed ? item.label : undefined}
                  >
                    <span className="item-icon">{item.icon}</span>
                    {!isMenuCollapsed && (
                      <>
                        <span className="item-label">{item.label}</span>
                        {item.badge && (
                          <span className="item-badge">{item.badge}</span>
                        )}
                      </>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Menu Footer */}
      <div className="menu-footer">
        {!isMenuCollapsed && (
          <div className="user-info">
            <div className="user-avatar">👤</div>
            <div className="user-details">
              <div className="user-name">Admin User</div>
              <div className="user-role">{userRole}</div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default SharedMenu; 