import React from 'react';
import { Link } from 'react-router-dom';
import './ComponentShowcase.css';

const ComponentShowcase: React.FC = () => {
  const components = [
    {
      name: 'SharedHeader',
      description: 'Reusable header with logo, title, and language selector',
      path: '/components/shared-header',
      features: ['Logo navigation', 'Page title display', 'Language selector', 'Confirmation dialogs']
    },
    {
      name: 'SharedMenu',
      description: 'Collapsible sidebar navigation with role-based sections',
      path: '/components/shared-menu',
      features: ['Role-based navigation', 'Collapsible sections', 'Active state management', 'Mobile responsive']
    },
    {
      name: 'AdminLayout',
      description: 'Complete layout wrapper combining header and menu',
      path: '/components/admin-layout',
      features: ['Unified layout', 'Responsive design', 'Consistent spacing', 'Role configuration']
    }
  ];

  return (
    <div className="component-showcase">
      <div className="showcase-header">
        <div className="header-content">
          <Link to="/" className="back-button">← Back to Dashboard</Link>
          <h1>🧪 Shared Components Showcase</h1>
          <p className="showcase-subtitle">
            View and test individual shared components in isolation
          </p>
        </div>
      </div>

      <div className="components-grid">
        {components.map((component) => (
          <div key={component.name} className="component-card">
            <div className="component-header">
              <h2 className="component-name">{component.name}</h2>
              <p className="component-description">{component.description}</p>
            </div>
            
            <div className="component-features">
              <h3>Features:</h3>
              <ul>
                {component.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
            
            <div className="component-actions">
              <Link 
                to={component.path} 
                className="preview-button"
              >
                🔍 View Standalone
              </Link>
              <Link 
                to={`${component.path}?mode=fullscreen`} 
                className="fullscreen-button"
              >
                🖥️ Fullscreen Mode
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="showcase-info">
        <div className="info-section">
          <h3>💡 About Component Showcase</h3>
          <p>
            This showcase allows you to test and view individual shared components 
            in isolation, helping with development, debugging, and design review.
          </p>
        </div>
        
        <div className="info-section">
          <h3>🎯 Testing Features</h3>
          <ul>
            <li><strong>Standalone View:</strong> Component with minimal styling context</li>
            <li><strong>Fullscreen Mode:</strong> Component in full viewport for layout testing</li>
            <li><strong>Interactive Testing:</strong> All component functionality preserved</li>
            <li><strong>Responsive Testing:</strong> Resize window to test responsive behavior</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ComponentShowcase; 