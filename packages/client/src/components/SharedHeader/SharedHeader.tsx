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
import { useLanguage, Language, LANGUAGES } from '../../contexts/LanguageContext';
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
  const { language, setLanguage, t } = useLanguage();
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);

  console.log('SharedHeader render: current language =', language);

  /**
   * Handle logo click with optional confirmation
   */
  const handleLogoClick = () => {
    if (onLogoClick) {
      onLogoClick();
      return;
    }

    if (confirmNavigation) {
      const message = confirmationMessage || t('messages.confirm.leave');
      
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
  const handleLanguageSelect = (lang: Language) => {
    console.log('SharedHeader: Changing language to', lang);
    setLanguage(lang);
    setIsLanguageDropdownOpen(false);
    console.log('SharedHeader: Language changed, dropdown closed');
  };

  /**
   * Toggle language dropdown
   */
  const toggleLanguageDropdown = () => {
    setIsLanguageDropdownOpen(!isLanguageDropdownOpen);
  };

  return (
    <div className="navbar-container">
          {/* Logo Section */}
          <div className="logo-section">
            <button
              type="button"
              className="logo-button"
              onClick={handleLogoClick}
              aria-label={t('common.goToDashboard')}
            >
            <div className="logo-frame">
              {/* Primary SVG logo from public folder */}
              <img 
                src="/assets/images/logo.svg" 
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
              aria-label={t('common.selectLanguage')}
            >
              <span className="selected-language">{LANGUAGES[language].name}</span>
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
                    className={`nav-link ${language === 'ru' ? 'active' : ''}`}
                    onClick={() => handleLanguageSelect('ru')}
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
                    className={`nav-link ${language === 'he' ? 'active' : ''}`}
                    onClick={() => handleLanguageSelect('he')}
                  >
                    <div className="flag-icon israel-flag">
                      <div className="flag-white-bg"></div>
                      <div className="star-of-david"></div>
                      <div className="flag-blue-stripe-top"></div>
                      <div className="flag-blue-stripe-bottom"></div>
                    </div>
                    <span className="language-text">עברית</span>
                  </button>

                  {/* English Option */}
                  <button 
                    className={`nav-link ${language === 'en' ? 'active' : ''}`}
                    onClick={() => handleLanguageSelect('en')}
                  >
                    <div className="flag-icon usa-flag">
                      <div className="flag-stripes"></div>
                      <div className="flag-canton"></div>
                    </div>
                    <span className="language-text">English</span>
                  </button>
              </div>
            </div>
          )}
          </div>
        </div>
    </div>
  );
};

export default SharedHeader; 