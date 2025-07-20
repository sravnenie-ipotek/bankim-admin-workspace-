/**
 * TopNavigation Component
 * Comprehensive navigation header for the BankIM Management Portal
 * 
 * Features:
 * - Banks institution icon with hover effects (left side)
 * - Language selector with dropdown (Russian/Hebrew)
 * - Tech support icon with tooltip
 * - Notifications with badge counter
 * - Bank name display with context switching
 * - User profile with avatar and dropdown menu
 * - Responsive design with mobile considerations
 * - Accessibility support with ARIA attributes
 * 
 * Layout:
 * - Left side: Banks icon
 * - Right side: Language selector + Tech support + Notifications + Bank name + User profile
 * 
 * Based on Figma design: Admin Panel Design System
 * Matches existing gray/800 color scheme (#1F2A37)
 */

import React, { useState, useRef, useEffect } from 'react';
import './TopNavigation.css';
import { useNavigation } from '../../contexts/NavigationContext';

// Language options interface
interface LanguageOption {
  code: string;
  name: string;
  flag: string;
}

// User profile interface
interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  initials: string;
}

// Bank context interface
interface BankContext {
  id: string;
  name: string;
  shortName: string;
}

// Component props interface
export interface TopNavigationProps {
  /** Current selected language */
  selectedLanguage?: string;
  /** Available languages */
  languages?: LanguageOption[];
  /** Current user profile */
  userProfile?: UserProfile;
  /** Current bank context */
  bankContext?: BankContext;
  /** Notification count */
  notificationCount?: number;
  /** Language change handler */
  onLanguageChange?: (languageCode: string) => void;
  /** Tech support click handler */
  onTechSupportClick?: () => void;
  /** Notifications click handler */
  onNotificationsClick?: () => void;
  /** Bank context change handler */
  onBankContextChange?: (bankId: string) => void;
  /** User profile menu handlers */
  onProfileMenuClick?: (action: string) => void;
  /** Custom CSS class */
  className?: string;
}

const TopNavigation: React.FC<TopNavigationProps> = ({
  selectedLanguage = 'ru',
  languages = [
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'he', name: 'עברית', flag: '🇮🇱' }
  ],
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
  },
  notificationCount = 0,
  onLanguageChange,
  onTechSupportClick,
  onNotificationsClick,
  onBankContextChange: _onBankContextChange,
  onProfileMenuClick,
  className = ''
}) => {
  const { navigationState } = useNavigation();
  // State management for dropdowns
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  
  // Refs for dropdown management
  const languageRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Get current language details
  const currentLanguage = languages.find(lang => lang.code === selectedLanguage) || languages[0];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (languageRef.current && !languageRef.current.contains(event.target as Node)) {
        setIsLanguageDropdownOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle language selection
  const handleLanguageSelect = (languageCode: string) => {
    setIsLanguageDropdownOpen(false);
    onLanguageChange?.(languageCode);
  };

  // Handle profile menu actions
  const handleProfileMenuAction = (action: string) => {
    setIsProfileDropdownOpen(false);
    onProfileMenuClick?.(action);
  };

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent, action: () => void) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action();
    }
  };

  return (
    <nav className={`top-navigation ${className} ${navigationState.submenuLabel ? 'submenu-active' : ''}`} role="navigation" aria-label="Main navigation">
      <div className="top-nav-container">
        <div className="navbar-content">
          
          {/* Left Side - Banks Icon */}
          <div className="navbar-left">
            <div className="banks-icon" title="Banking Institution">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7l-10-5z" stroke="#9CA3AF" strokeWidth="2" fill="none"/>
                <path d="M6 11v6M10 11v6M14 11v6M18 11v6" stroke="#9CA3AF" strokeWidth="2"/>
                <path d="M2 7h20" stroke="#9CA3AF" strokeWidth="2"/>
              </svg>
            </div>
          </div>

          {/* Right Side - Navigation Items */}
          <div className="navbar-right">
          
          {/* Language Selector */}
          <div className="language-selector-wrapper" ref={languageRef}>
            <button
              className="language-selector"
              onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
              onKeyDown={(e) => handleKeyDown(e, () => setIsLanguageDropdownOpen(!isLanguageDropdownOpen))}
              aria-expanded={isLanguageDropdownOpen}
              aria-haspopup="true"
              aria-label={`Current language: ${currentLanguage.name}`}
            >
              <span className="language-text">{currentLanguage.name}</span>
              <div className={`language-arrow ${isLanguageDropdownOpen ? 'open' : ''}`}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M7 10l5 5 5-5z" fill="#F3F4F6" />
                </svg>
              </div>
            </button>

            {isLanguageDropdownOpen && (
              <div className="language-dropdown" role="menu" aria-label="Language options">
                {languages.map((language) => (
                  <button
                    key={language.code}
                    className={`language-option ${selectedLanguage === language.code ? 'selected' : ''}`}
                    onClick={() => handleLanguageSelect(language.code)}
                    role="menuitem"
                    aria-selected={selectedLanguage === language.code}
                  >
                    <span className="language-flag">{language.flag}</span>
                    <span className="language-name">{language.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Tech Support */}
          <button
            className="tech-support-btn"
            onClick={onTechSupportClick}
            aria-label="Technical support"
            title="Technical support"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-6h2v6zm0-8h-2V7h2v4z" fill="#9CA3AF" />
            </svg>
          </button>

          {/* Notifications */}
          <button
            className="notifications-btn"
            onClick={onNotificationsClick}
            aria-label={`Notifications ${notificationCount > 0 ? `(${notificationCount} new)` : ''}`}
            title={`Notifications ${notificationCount > 0 ? `(${notificationCount} new)` : ''}`}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" fill="#9CA3AF" />
            </svg>
            {notificationCount > 0 && (
              <span className="notification-badge" aria-hidden="true">
                {notificationCount > 99 ? '99+' : notificationCount}
              </span>
            )}
          </button>

          {/* Bank Name or Submenu Name */}
          <div className="bank-name" aria-label={`Current bank: ${bankContext.name}`}>
            {navigationState.submenuLabel ? (
              <span className="submenu-name" style={{ color: '#F9FAFB' }}>
                {navigationState.submenuLabel}
              </span>
            ) : (
              <span className="bank-name-text">{bankContext.name}</span>
            )}
          </div>

          {/* User Profile */}
          <div className="user-profile-wrapper" ref={profileRef}>
            <button
              className="user-profile-btn"
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              onKeyDown={(e) => handleKeyDown(e, () => setIsProfileDropdownOpen(!isProfileDropdownOpen))}
              aria-expanded={isProfileDropdownOpen}
              aria-haspopup="true"
              aria-label={`User menu for ${userProfile.name}`}
            >
              <div className="user-avatar">
                {userProfile.avatar ? (
                  <img src={userProfile.avatar} alt={`${userProfile.name} avatar`} />
                ) : (
                  <span className="user-initials">{userProfile.initials}</span>
                )}
              </div>
              <div className="user-info">
                <span className="user-name">{userProfile.name}</span>
                <span className="user-role">{userProfile.role}</span>
              </div>
              <div className={`profile-arrow ${isProfileDropdownOpen ? 'open' : ''}`}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M4 6l4 4 4-4" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </button>

            {isProfileDropdownOpen && (
              <div className="profile-dropdown" role="menu" aria-label="User profile options">
                <div className="profile-dropdown-header">
                  <div className="profile-dropdown-avatar">
                    {userProfile.avatar ? (
                      <img src={userProfile.avatar} alt={`${userProfile.name} avatar`} />
                    ) : (
                      <span className="profile-dropdown-initials">{userProfile.initials}</span>
                    )}
                  </div>
                  <div className="profile-dropdown-info">
                    <span className="profile-dropdown-name">{userProfile.name}</span>
                    <span className="profile-dropdown-email">{userProfile.email}</span>
                  </div>
                </div>
                
                <div className="profile-dropdown-separator"></div>
                
                <button
                  className="profile-dropdown-item"
                  onClick={() => handleProfileMenuAction('profile')}
                  role="menuitem"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2 1H6c-1.1 0-2 .9-2 2v2h8v-2c0-1.1-.9-2-2-2z" fill="#6B7280" />
                  </svg>
                  <span>Profile Settings</span>
                </button>
                
                <button
                  className="profile-dropdown-item"
                  onClick={() => handleProfileMenuAction('preferences')}
                  role="menuitem"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 10.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" fill="#6B7280" />
                    <path d="M13.5 8c0-.46-.04-.91-.1-1.36L12.2 6.1c-.11-.36-.26-.7-.44-1.02l.8-1.15c-.46-.64-1.01-1.19-1.65-1.65L9.76 3.08a5.5 5.5 0 0 0-1.02-.44L8.36 1.6C7.91 1.54 7.46 1.5 8 1.5c.54 0 1.09.04 1.64.1l.38 1.04c.36.11.7.26 1.02.44l1.15-.8c.64.46 1.19 1.01 1.65 1.65l-.8 1.15c.18.32.33.66.44 1.02l1.04.38c.06.55.1 1.1.1 1.64z" fill="#6B7280" />
                  </svg>
                  <span>Preferences</span>
                </button>
                
                <div className="profile-dropdown-separator"></div>
                
                <button
                  className="profile-dropdown-item logout"
                  onClick={() => handleProfileMenuAction('logout')}
                  role="menuitem"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M6 2H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h2M10 6l4 4-4 4M14 10H6" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>

          </div> {/* End navbar-right */}
        </div>
      </div>
    </nav>
  );
};

export default TopNavigation; 