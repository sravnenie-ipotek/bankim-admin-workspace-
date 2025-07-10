/**
 * SharedHeader Component
 * Reusable header component for the management portal
 * Used in admin pages that need header functionality
 * 
 * Features:
 * - Logo with optional navigation confirmation
 * - Language selector (placeholder for now)
 * - Responsive design
 * - Standalone for management portal
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import './SharedHeader.css';

interface SharedHeaderProps {
  /** Show confirmation dialog when clicking logo */
  confirmNavigation?: boolean;
  /** Custom confirmation message */
  confirmationMessage?: string;
  /** Custom navigation path (default: '/') */
  navigateTo?: string;
  /** Hide language selector */
  hideLanguageSelector?: boolean;
  /** Custom logo click handler */
  onLogoClick?: () => void;
  /** Page title to display */
  title?: string;
}

/**
 * SharedHeader component provides a reusable header with logo and navigation
 * Designed for use in the management portal admin pages
 */
const SharedHeader: React.FC<SharedHeaderProps> = ({
  confirmNavigation = false,
  confirmationMessage,
  navigateTo = '/',
  hideLanguageSelector = false,
  onLogoClick,
  title = 'BankIM Management Portal'
}) => {
  const navigate = useNavigate();

  /**
   * Handle logo click with optional confirmation
   * If confirmNavigation is true, shows confirmation dialog
   * If custom onLogoClick is provided, uses that instead
   */
  const handleLogoClick = () => {
    if (onLogoClick) {
      onLogoClick();
      return;
    }

    if (confirmNavigation) {
      const message = confirmationMessage || 'Are you sure you want to leave this page? Your changes may be lost.';
      
      if (window.confirm(message)) {
        navigate(navigateTo);
      }
    } else {
      navigate(navigateTo);
    }
  };

  return (
    <div className="shared-header">
      <div className="header-container">
        <div className="header-content">
          {/* Logo Section */}
          <div className="logo-section">
            <button
              type="button"
              className="logo-button"
              onClick={handleLogoClick}
              aria-label="Go to dashboard"
            >
              <span className="logo-icon">🏛️</span>
              <span className="logo-text">BankIM</span>
            </button>
          </div>

          {/* Title Section */}
          <div className="title-section">
            <h1 className="page-title">{title}</h1>
          </div>

          {/* Right Section - Language Selector */}
          {!hideLanguageSelector && (
            <div className="right-section">
              <div className="language-selector">
                <button className="lang-button">EN</button>
                <button className="lang-button">RU</button>
                <button className="lang-button">HE</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SharedHeader; 