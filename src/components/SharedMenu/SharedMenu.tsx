/**
 * SharedMenu Component
 * Side Navigation for the BankIM Management Portal
 * 
 * Business Logic based on Confluence: 3 Компонент. Side Navigation. Действий 9
 * Design based on Figma: Admin Panel Design system
 * 
 * Features:
 * - Precise 265px width sidebar with #1F2A37 background
 * - Logo section with exact positioning (20px 0px 0px 20px padding)
 * - Main navigation with Russian labels per business requirements
 * - Bottom navigation (Settings + Logout)
 * - Active state with #FBE54D yellow highlighting
 * - Exact spacing and dimensions per Figma specifications
 * - Icons with proper fill colors (#FBE54D active, #9CA3AF inactive)
 * - Arimo font family, 16px size, 500 weight
 * - 24px gaps between navigation items
 * - 12px gap between icon and label
 */

import React, { useState, useEffect } from 'react';
import './SharedMenu.css';
import logo from '../../assets/images/logo/primary-logo05-1.svg';
import { useAuth } from '../../contexts/AuthContext';
import { useFontSettings } from '../../hooks/useFontSettings';
import { useNavigation } from '../../contexts/NavigationContext';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

interface SubMenuItem {
  id: string;
  label: string;
  path: string;
}

interface NavItem {
  id: string;
  icon: string;
  label: string;
  active?: boolean;
  badge?: string;
  requiredPermission?: { action: string; resource: string };
  hasDropdown?: boolean;
  subItems?: SubMenuItem[];
}

export interface SharedMenuProps {
  activeItem?: string;
  onItemClick?: (itemId: string) => void;
}

const SharedMenu: React.FC<SharedMenuProps> = ({ activeItem = 'dashboard', onItemClick }) => {
  const { hasPermission } = useAuth();
  const { t } = useLanguage();
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const { fontSettings, loading: fontLoading } = useFontSettings();
  const { setCurrentSubmenu } = useNavigation();
  const location = useLocation();

  // Auto-expand content-management if any of its subitems is active
  useEffect(() => {
    const contentSubPaths = contentSubItems.map(item => item.path);
    if (contentSubPaths.includes(location.pathname)) {
      setExpandedItem('content-management');
    }
  }, [location.pathname]);

  // Apply font settings dynamically
  useEffect(() => {
    if (!fontLoading && fontSettings) {
      const style = document.createElement('style');
      style.id = 'shared-menu-font-settings';
      style.textContent = `
        .pages {
          font-family: '${fontSettings.menuFontFamily}', Arial, sans-serif !important;
          font-weight: ${fontSettings.menuMainFontWeight} !important;
          font-size: ${fontSettings.menuMainFontSize} !important;
          line-height: ${fontSettings.menuLineHeight} !important;
        }
        .submenu-label {
          font-family: '${fontSettings.menuFontFamily}', Arial, sans-serif !important;
          font-weight: ${fontSettings.menuSubFontWeight} !important;
          font-size: ${fontSettings.menuSubFontSize} !important;
          line-height: ${fontSettings.menuLineHeight} !important;
        }
      `;
      
      // Remove existing style if it exists
      const existingStyle = document.getElementById('shared-menu-font-settings');
      if (existingStyle) {
        existingStyle.remove();
      }
      
      document.head.appendChild(style);
    }
  }, [fontSettings, fontLoading]);

  // Content site sub-menu items
  const contentSubItems: SubMenuItem[] = [
    { id: 'content-main', label: t('menu.main'), path: '/content/main' },
    { id: 'content-menu', label: t('menu.menu'), path: '/content/menu' },
    { id: 'content-mortgage', label: t('menu.mortgage'), path: '/content/mortgage' },
    { id: 'content-mortgage-refi', label: t('menu.mortgageRefi'), path: '/content/mortgage-refi' },
    { id: 'content-credit', label: t('menu.credit'), path: '/content/credit' },
    { id: 'content-credit-refi', label: t('menu.creditRefi'), path: '/content/credit-refi' },
    { id: 'content-general', label: t('menu.general'), path: '/content/general' }
  ];

  // Main navigation items per Confluence business logic
  const mainNavItems: NavItem[] = [
    {
      id: 'dashboard',
      icon: 'chart-pie',
      label: t('menu.dashboard'), // Action #2: Dashboard
      active: activeItem === 'dashboard'
    },
    {
      id: 'users',
      icon: 'users-group',
      label: t('menu.clients') // Action #3: Clients/Users
    },
    {
      id: 'bank-employee',
      icon: 'bank',
      label: t('menu.bankEmployee') // Action #4: Bank Employee
    },
    {
      id: 'component-showcase',
      icon: 'ui-kit',
      label: t('menu.components') // Action #5: Components
    },
    {
      id: 'shared-header-preview',
      icon: 'computer-header',
      label: t('menu.header') // Action #6: Header
    },
    {
      id: 'calculator-formula',
      icon: 'calculator',
      label: t('menu.calculatorFormula') // Action #7: Calculator Formula
    },
    {
      id: 'chat',
      icon: 'messages',
      label: t('menu.chat') // Action #8: Chat
    },
    {
      id: 'content-management',
      icon: 'file-edit',
      label: t('menu.contentSite'), // Action #9: Content Management (standalone)
      hasDropdown: true,
      subItems: contentSubItems
    }
  ];

  // Bottom navigation items per Confluence business logic
  const bottomNavItems: NavItem[] = [
    {
      id: 'settings',
      icon: 'cog',
      label: t('menu.settings') // Action #8: Settings
    },
    {
      id: 'logout',
      icon: 'arrow-right-to-bracket-outline',
      label: t('auth.logout') // Action #9: Logout
    }
  ];

  const handleItemClick = (itemId: string, item: NavItem) => {
    
    // Handle dropdown toggle
    if (item.hasDropdown) {
      setExpandedItem(expandedItem === itemId ? null : itemId);
      return;
    }
    
    if (onItemClick) {
      onItemClick(itemId);
    }
  };

  const handleSubItemClick = (subItemId: string, subItemLabel: string) => {
    // Set the current submenu in navigation context
    setCurrentSubmenu(subItemId, subItemLabel);
    
    if (onItemClick) {
      onItemClick(subItemId);
    }
  };

  const renderSubMenu = (subItems: SubMenuItem[]) => {
    return (
      <div className="submenu">
        {subItems.map((subItem) => {
          const isActive = location.pathname === subItem.path;
          return (
            <div
              key={subItem.id}
              className={`submenu-item${isActive ? ' active' : ''}`}
              onClick={() => handleSubItemClick(subItem.id, subItem.label)}
              role="button"
              tabIndex={0}
              aria-label={subItem.label}
            >
              <div className="sublink-sidebar">
                <div className="left-content">
                  <span className="submenu-label">{subItem.label}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderNavItem = (item: NavItem) => {
    // Only mark parent as active if current path is exactly its path
    let isActive = false;
    if (item.hasDropdown && item.id === 'content-management') {
      isActive = location.pathname === '/content-management';
    } else {
      isActive = item.active || activeItem === item.id || location.pathname === `/${item.id}`;
    }
    const isExpanded = expandedItem === item.id;

    return (
      <div key={item.id} className="nav-item-container">
        <div
          className={`navlink-sidebar ${isActive ? 'active' : ''} ${item.hasDropdown ? 'has-dropdown' : ''}`}
          onClick={() => handleItemClick(item.id, item)}
          role="button"
          tabIndex={0}
          aria-label={item.label}
          aria-expanded={item.hasDropdown ? isExpanded : undefined}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleItemClick(item.id, item);
            }
          }}
        >
          <div className="left-content">
            <div className={`icon ${item.icon}`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                {renderIcon(item.icon, isActive)}
              </svg>
            </div>
            <span className="pages">{item.label}</span>
          </div>
          
          {item.hasDropdown && (
            <div className={`dropdown-arrow ${isExpanded ? 'expanded' : ''}`}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M4 6L8 10L12 6"
                  stroke={isActive ? '#FBE54D' : '#9CA3AF'}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          )}
          
          {item.badge && (
            <div className="icon-badge">
              <div className="badge">
                <span className="text">{item.badge}</span>
              </div>
            </div>
          )}
        </div>
        
        {item.hasDropdown && isExpanded && item.subItems && renderSubMenu(item.subItems)}
      </div>
    );
  };

  const renderIcon = (iconName: string, isActive: boolean) => {
    const color = isActive ? '#FBE54D' : '#9CA3AF'; // Active yellow or default inactive color
    
    switch (iconName) {
      case 'chart-pie':
        return (
          <path
            d="M12 2L2 8v12l10-5.5L22 20V8L12 2z"
            fill={color}
            stroke={color}
            strokeWidth="1"
          />
        );
      case 'users-group':
        return (
          <path
            d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zM4 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm5.5 3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM7.5 12c1.93 0 3.5 1.57 3.5 3.5S9.43 19 7.5 19 4 17.43 4 15.5 5.57 12 7.5 12zm9 0c1.93 0 3.5 1.57 3.5 3.5S18.43 19 16.5 19 13 17.43 13 15.5s1.57-3.5 3.5-3.5z"
            fill={color}
          />
        );
      case 'file-lines':
        return (
          <path
            d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11zm-2-8H8v-2h8v2zm0 4H8v-2h8v2z"
            fill={color}
          />
        );
      case 'bank':
        return (
          <path
            d="M12 2L2 7v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7l-10-5z"
            stroke={color}
            strokeWidth="2"
            fill="none"
          >
          </path>
        );
      case 'add-user':
        return (
          <path
            d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V8c0-.55-.45-1-1-1s-1 .45-1 1v2H2c-.55 0-1 .45-1 1s.45 1 1 1h2v2c0 .55.45 1 1 1s1-.45 1-1v-2h2c.55 0 1-.45 1-1s-.45-1-1-1H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
            fill={color}
          />
        );
      case 'messages':
        return (
          <path
            d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"
            fill={color}
          />
        );
      case 'calculator':
        return (
          <path
            d="M7 2h10c1.1 0 2 .9 2 2v16c0 1.1-.9 2-2 2H7c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2zm0 2v3h10V4H7zm2 5h2v2H9V9zm4 0h2v2h-2V9zm-4 4h2v2H9v-2zm4 0h2v6h-2v-6zm-4 4h2v2H9v-2z"
            fill={color}
          />
        );
      case 'cog':
        return (
          <path
            d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"
            fill={color}
          />
        );
      case 'file-edit':
        return (
          <path
            d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
            fill={color}
          />
        );
      case 'arrow-right-to-bracket-outline':
        return (
          <path
            d="M8 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h2c.55 0 1-.45 1-1s-.45-1-1-1H6V4h2c.55 0 1-.45 1-1s-.45-1-1-1zm9.5 7.5l-3-3c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41L15.17 10H10c-.55 0-1 .45-1 1s.45 1 1 1h5.17l-2.08 2.09c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0l3-3c.39-.39.39-1.02 0-1.41z"
            fill={color}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="sidebar" role="navigation" aria-label="Main navigation">
      <div className="content">
        
        {/* Logo Section - Action #1 per Confluence */}
        <div className="logo">
          <div className="logo-container">
            <div className="frame-3">
              <img src={logo} alt="BankIM Logo" className="logo-image" />
            </div>
          </div>
        </div>

        {/* Main Navigation - Actions #2-7 per Confluence */}
        <div className="main">
          {mainNavItems.map(renderNavItem)}
        </div>

        {/* Separator */}
        <div className="separator"></div>

        {/* Bottom Navigation - Actions #8-9 per Confluence */}
        <div className="bottom">
          {bottomNavItems.map(renderNavItem)}
        </div>
      </div>
      
      {/* Right border separator */}
      <div className="sidebar-separator"></div>
    </div>
  );
};

export default SharedMenu; 