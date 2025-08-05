import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SharedHeader } from '../components';
import './SharedHeaderPreview.css';

const SharedHeaderPreview: React.FC = () => {
  const location = useLocation();
  const isFullscreen = new URLSearchParams(location.search).get('mode') === 'fullscreen';
  
  const [headerConfig, setHeaderConfig] = useState({
    title: 'Сотрудник банка',
    confirmNavigation: false,
    hideLanguageSelector: false,
    navigateTo: '/'
  });

  const [customTitle, setCustomTitle] = useState('');

  const handleConfigChange = (key: string, value: boolean | string) => {
    setHeaderConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const presetConfigs = [
    {
      name: 'Bank Employee',
      config: {
        title: 'Сотрудник банка',
        confirmNavigation: false,
        hideLanguageSelector: false,
        navigateTo: '/'
      }
    },
    {
      name: 'Director',
      config: {
        title: 'Директор',
        confirmNavigation: true,
        hideLanguageSelector: false,
        navigateTo: '/'
      }
    },
    {
      name: 'Simple Header',
      config: {
        title: 'Simple Page',
        confirmNavigation: false,
        hideLanguageSelector: true,
        navigateTo: '/'
      }
    }
  ];

  if (isFullscreen) {
    return (
      <div className="fullscreen-preview">
        <SharedHeader {...headerConfig} />
        <div className="fullscreen-content">
          <div className="fullscreen-info">
            <h2>🖥️ Fullscreen SharedHeader Preview</h2>
            <p>This is how the SharedHeader looks in a full layout context.</p>
            <Link to="/components/shared-header" className="exit-fullscreen">
              ← Exit Fullscreen
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="header-preview">
      <div className="preview-container">
        <div className="preview-header">
          <Link to="/components" className="back-link">← Back to Components</Link>
          <h1>🧪 SharedHeader Component Preview</h1>
          <p className="preview-description">
            Test the SharedHeader component with different configurations and see how it behaves.
          </p>
        </div>

        <div className="preview-content">
          {/* Live Preview */}
          <div className="preview-section">
            <h2>🔍 Live Preview</h2>
            <div className="component-preview">
              <SharedHeader {...headerConfig} />
            </div>
          </div>

          {/* Configuration Panel */}
          <div className="config-section">
            <h2>⚙️ Configuration</h2>
            
            {/* Preset Configurations */}
            <div className="preset-configs">
              <h3>Quick Presets:</h3>
              <div className="preset-buttons">
                {presetConfigs.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => setHeaderConfig(preset.config)}
                    className="preset-button"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Manual Configuration */}
            <div className="config-controls">
              <h3>Manual Configuration:</h3>
              
              <div className="config-row">
                <label className="config-label">
                  Page Title:
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => {
                      setCustomTitle(e.target.value);
                      handleConfigChange('title', e.target.value || 'BankIM Management Portal');
                    }}
                    placeholder="Enter custom title..."
                    className="config-input"
                  />
                </label>
              </div>

              <div className="config-row">
                <label className="config-checkbox">
                  <input
                    type="checkbox"
                    checked={headerConfig.confirmNavigation}
                    onChange={(e) => handleConfigChange('confirmNavigation', e.target.checked)}
                  />
                  Enable navigation confirmation
                </label>
              </div>

              <div className="config-row">
                <label className="config-checkbox">
                  <input
                    type="checkbox"
                    checked={headerConfig.hideLanguageSelector}
                    onChange={(e) => handleConfigChange('hideLanguageSelector', e.target.checked)}
                  />
                  Hide language selector
                </label>
              </div>
            </div>
          </div>

          {/* Feature Information */}
          <div className="info-section">
            <h2>📋 Component Features</h2>
            <div className="features-grid">
              <div className="feature-card">
                <h3>🏛️ Logo Navigation</h3>
                <p>Clickable logo that navigates to dashboard with optional confirmation dialog.</p>
              </div>
              <div className="feature-card">
                <h3>📝 Dynamic Title</h3>
                <p>Customizable page title that adapts to current page context.</p>
              </div>
              <div className="feature-card">
                <h3>🌐 Language Selector</h3>
                <p>Multi-language support with EN/RU/HE options (currently placeholder).</p>
              </div>
              <div className="feature-card">
                <h3>📱 Responsive Design</h3>
                <p>Adapts to different screen sizes with mobile-optimized layout.</p>
              </div>
            </div>
          </div>

          {/* Code Example */}
          <div className="code-section">
            <h2>💻 Code Example</h2>
            <div className="code-block">
              <pre>
{`<SharedHeader 
  title="${headerConfig.title}"
  confirmNavigation={${headerConfig.confirmNavigation}}
  hideLanguageSelector={${headerConfig.hideLanguageSelector}}
  navigateTo="${headerConfig.navigateTo}"
/>`}
              </pre>
            </div>
          </div>

          {/* Testing Actions */}
          <div className="actions-section">
            <h2>🎯 Testing Actions</h2>
            <div className="action-buttons">
              <Link 
                to="/components/shared-header?mode=fullscreen" 
                className="action-button fullscreen"
              >
                🖥️ View Fullscreen
              </Link>
              <button 
                onClick={() => window.location.reload()} 
                className="action-button refresh"
              >
                🔄 Reset Component
              </button>
              <Link 
                to="/components" 
                className="action-button back"
              >
                📋 Back to Components
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharedHeaderPreview; 