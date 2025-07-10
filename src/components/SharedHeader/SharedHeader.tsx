/**
 * SharedHeader Component
 * Reusable header component for the management portal
 * Based on Figma Admin Panel Design System
 * 
 * Features:
 * - Dark background (#111928)
 * - Logo with yellow/white vector graphics
 * - Language selector with dropdown and flags
 * - Responsive design
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SharedHeader.css';

interface SharedHeaderProps {
  /** Show confirmation dialog when clicking logo */
  confirmNavigation?: boolean;
  /** Custom confirmation message */
  confirmationMessage?: string;
  /** Custom navigation path (default: '/') */
  navigateTo?: string;
  /** Custom logo click handler */
  onLogoClick?: () => void;
}

/**
 * SharedHeader component provides a reusable header with logo and navigation
 * Designed to match the Figma Admin Panel Design System
 */
const SharedHeader: React.FC<SharedHeaderProps> = ({
  confirmNavigation = false,
  confirmationMessage,
  navigateTo = '/',
  onLogoClick
}) => {
  const navigate = useNavigate();
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('Русский');

  /**
   * Handle logo click with optional confirmation
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

  /**
   * Handle language selection
   */
  const handleLanguageSelect = (language: string) => {
    setSelectedLanguage(language);
    setIsLanguageDropdownOpen(false);
    // TODO: Implement actual language switching logic
  };

  /**
   * Toggle language dropdown
   */
  const toggleLanguageDropdown = () => {
    setIsLanguageDropdownOpen(!isLanguageDropdownOpen);
  };

  return (
    <div className="navbar-container">
      <div className="navbar-content">
        {/* Logo Section */}
        <div className="logo-section">
          <button
            type="button"
            className="logo-button"
            onClick={handleLogoClick}
            aria-label="Go to dashboard"
          >
            <div className="logo-frame">
              {/* Actual logo image from public folder */}
              <img 
                src="/assets/images/logo.png" 
                alt="BankIM Logo" 
                className="logo-image"
                width="96"
                height="43"
              />
            </div>
          </button>
        </div>

        {/* Language Selector */}
        <div className="language-selector-frame">
          <div className="language-selector">
            <button 
              className="language-button"
              onClick={toggleLanguageDropdown}
              aria-label="Select language"
            >
              <span className="selected-language">{selectedLanguage}</span>
              <div className={`dropdown-arrow ${isLanguageDropdownOpen ? 'open' : ''}`}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path 
                    d="M7 10l5 5 5-5" 
                    stroke="#F3F4F6" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </button>

            {/* Dropdown Menu */}
            {isLanguageDropdownOpen && (
              <div className="dropdown-menu">
                <div className="dropdown-content">
                  {/* Russian Option */}
                  <button 
                    className="nav-link"
                    onClick={() => handleLanguageSelect('Русский')}
                  >
                    <div className="flag-icon russia-flag">
                      <div className="flag-white"></div>
                      <div className="flag-blue"></div>
                      <div className="flag-red"></div>
                    </div>
                    <span className="language-text">Русский</span>
                  </button>

                  {/* Hebrew/Israeli Option */}
                  <button 
                    className="nav-link"
                    onClick={() => handleLanguageSelect('עברית')}
                  >
                    <div className="flag-icon israel-flag">
                      <div className="flag-white-bg"></div>
                      <div className="star-of-david"></div>
                      <div className="flag-blue-stripe-top"></div>
                      <div className="flag-blue-stripe-bottom"></div>
                    </div>
                    <span className="language-text">עברית</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharedHeader; 