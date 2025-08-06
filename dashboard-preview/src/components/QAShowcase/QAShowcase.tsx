import React from 'react'
import './QAShowcase.css'

// Mock data for demonstrations
const mockUser = {
  name: 'Александр Пушкин',
  email: 'bankimonline@mail.com',
  avatar: null
}

const mockBank = {
  name: 'Bank Hapoalim',
  logo: '/static/bank-logo.png'
}

// Removed unused mockNotifications array

export const QAShowcase: React.FC = () => {
  return (
    <div className="qa-showcase">
      <div className="qa-header">
        <h1>🔍 QA Environment - Implemented Navigation Components</h1>
        <p>Showcasing components from Confluence documentation</p>
      </div>

      {/* Section 1: Topnavigation Component (4 Actions) */}
      <div className="qa-section">
        <div className="qa-section-header">
          <h2>1️⃣ Topnavigation Component - 4 Actions</h2>
          <div className="confluence-link">
            📋 <a href="https://bankimonline.atlassian.net/wiki/spaces/Bankim/pages/110624859" target="_blank">
              Confluence: 1 Компонент. Topnavigation. Действий 4
            </a>
          </div>
        </div>
        
        <div className="implementation-status">✅ IMPLEMENTED</div>
        
        <div className="component-demo">
          <div className="demo-topnav">
            <div className="demo-topnav-left">
              <div className="demo-logo">🏦 BANKIMONLINE</div>
            </div>
            <div className="demo-topnav-right">
              <div className="demo-action">
                <button className="demo-btn">🌐 Русский ▼</button>
                <span className="action-label">Action #1: Language Dropdown</span>
              </div>
              <div className="demo-action">
                <button className="demo-btn">Русский</button>
                <span className="action-label">Action #2: Russian Selection</span>
              </div>
              <div className="demo-action">
                <button className="demo-btn">עברית</button>
                <span className="action-label">Action #3: Hebrew Selection</span>
              </div>
              <div className="demo-action">
                <button className="demo-btn" onClick={() => window.location.href = '/'}>
                  🏠 Logo Click
                </button>
                <span className="action-label">Action #4: Navigate to Main</span>
              </div>
            </div>
          </div>
        </div>

        <div className="implementation-location">
          📂 <strong>Implementation:</strong> 
          <code>mainapp/src/components/layout/Head/Header.tsx</code><br/>
          <code>mainapp/src/components/layout/Head/LoginLanguage.tsx</code>
        </div>
      </div>

      {/* Section 2: Top Navigation 2 (14 Actions) */}
      <div className="qa-section">
        <div className="qa-section-header">
          <h2>2️⃣ Top Navigation 2 - 14 Actions</h2>
          <div className="confluence-link">
            📋 <a href="https://bankimonline.atlassian.net/wiki/spaces/Bankim/pages/111740105" target="_blank">
              Confluence: 2 Top navigation 2 14
            </a>
          </div>
        </div>
        
        <div className="implementation-status">✅ IMPLEMENTED</div>
        
        <div className="component-demo">
          <div className="demo-shared-nav">
            <div className="demo-nav-left">
              <div className="demo-action">
                <select className="demo-select">
                  <option>🇷🇺 Russia</option>
                  <option>🇮🇱 Israel</option>
                </select>
                <span className="action-label">Actions #1,6,7: Language Selector</span>
              </div>
            </div>
            <div className="demo-nav-right">
              <div className="demo-action">
                <button className="demo-btn">🆘 Tech Support</button>
                <span className="action-label">Action #2: Tech Support</span>
              </div>
              <div className="demo-action">
                <button className="demo-btn">🔔 (2)</button>
                <span className="action-label">Actions #3,10,12,13,14: Notifications</span>
              </div>
              <div className="demo-action">
                <div className="demo-bank-logo">🏦 {mockBank.name}</div>
                <span className="action-label">Action #4: Bank Logo</span>
              </div>
              <div className="demo-action">
                <div className="demo-user-profile">
                  <span>👤 {mockUser.name}</span>
                  <button className="demo-btn">⚙️</button>
                </div>
                <span className="action-label">Actions #5,8,9,11: User Profile</span>
              </div>
            </div>
          </div>
        </div>

        <div className="implementation-location">
          📂 <strong>Implementation:</strong> 
          <code>mainapp/src/components/layout/SharedNavigation/SharedNavigation.tsx</code><br/>
          <code>mainapp/src/pages/PersonalCabinet/components/TopHeader/TopHeader.tsx</code>
        </div>
      </div>

      {/* Section 3: Side Navigation (9 Actions) */}
      <div className="qa-section">
        <div className="qa-section-header">
          <h2>3️⃣ Side Navigation - 9 Actions</h2>
          <div className="confluence-link">
            📋 <a href="https://bankimonline.atlassian.net/wiki/spaces/Bankim/pages/110757351" target="_blank">
              Confluence: 3 Side Navigation. 9
            </a>
          </div>
        </div>
        
        <div className="implementation-status">✅ IMPLEMENTED</div>
        
        <div className="component-demo">
          <div className="demo-sidebar">
            <div className="demo-sidebar-header">
              <div className="demo-action">
                <div className="demo-logo">🏦 BANKIMONLINE</div>
                <span className="action-label">Action #1: Logo</span>
              </div>
            </div>
            
            <div className="demo-sidebar-nav">
              <div className="demo-nav-item">
                <div className="demo-action">
                  <span>📊 Главная</span>
                  <span className="action-label">Action #2: Home</span>
                </div>
              </div>
              <div className="demo-nav-item">
                <div className="demo-action">
                  <span>👥 Клиенты</span>
                  <span className="action-label">Action #3: Clients</span>
                </div>
              </div>
              <div className="demo-nav-item">
                <div className="demo-action">
                  <span>📄 Предложения</span>
                  <span className="action-label">Action #4: Offers</span>
                </div>
              </div>
              <div className="demo-nav-item">
                <div className="demo-action">
                  <span>🏦 Банковские программы</span>
                  <span className="action-label">Action #5: Bank Programs</span>
                </div>
              </div>
              <div className="demo-nav-item">
                <div className="demo-action">
                  <span>➕ Создание аудитории</span>
                  <span className="action-label">Action #6: Audience Creation</span>
                </div>
              </div>
              <div className="demo-nav-item">
                <div className="demo-action">
                  <span>💬 Чат</span>
                  <span className="action-label">Action #7: Chat</span>
                </div>
              </div>
            </div>
            
            <div className="demo-sidebar-bottom">
              <div className="demo-nav-item">
                <div className="demo-action">
                  <span>⚙️ Настройки</span>
                  <span className="action-label">Action #8: Settings</span>
                </div>
              </div>
              <div className="demo-nav-item">
                <div className="demo-action">
                  <span>🚪 Выйти</span>
                  <span className="action-label">Action #9: Logout</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="implementation-location">
          📂 <strong>Implementation:</strong> 
          <code>mainapp/src/components/layout/SharedSideNavigation/SharedSideNavigation.tsx</code><br/>
          <code>mainapp/src/pages/PersonalCabinet/components/Sidebar/Sidebar.tsx</code>
        </div>
      </div>

      {/* Section 4: Personal Cabinet Layout */}
      <div className="qa-section">
        <div className="qa-section-header">
          <h2>4️⃣ Personal Cabinet Complete Layout</h2>
          <div className="confluence-link">
            📋 Combined implementation with responsive design
          </div>
        </div>
        
        <div className="implementation-status">✅ IMPLEMENTED</div>
        
        <div className="component-demo">
          <div className="demo-cabinet-layout">
            <div className="demo-cabinet-header">
              <span>📱 Responsive Top Header with Notifications & Profile</span>
            </div>
            <div className="demo-cabinet-content">
              <div className="demo-cabinet-sidebar">
                <span>📋 Collapsible Sidebar Navigation</span>
              </div>
              <div className="demo-cabinet-main">
                <span>📄 Main Content Area</span>
              </div>
            </div>
            <div className="demo-cabinet-footer">
              <span>⚖️ User Agreement | Privacy Policy</span>
            </div>
          </div>
        </div>

        <div className="implementation-location">
          📂 <strong>Implementation:</strong> 
          <code>mainapp/src/pages/PersonalCabinet/components/PersonalCabinetLayout/</code><br/>
          <code>mainapp/src/pages/PersonalCabinet/PersonalCabinet.tsx</code>
        </div>
      </div>

      {/* QA Test Instructions */}
      <div className="qa-section qa-instructions">
        <div className="qa-section-header">
          <h2>🧪 QA Testing Instructions</h2>
        </div>
        
        <div className="qa-test-grid">
          <div className="qa-test-card">
            <h3>🔍 Component Testing</h3>
            <ul>
              <li>✅ Language switching (RU ↔ HE)</li>
              <li>✅ RTL/LTR layout adaptation</li>
              <li>✅ Responsive design (Desktop/Mobile)</li>
              <li>✅ Navigation state management</li>
              <li>✅ User interaction flows</li>
            </ul>
          </div>
          
          <div className="qa-test-card">
            <h3>📱 Access Points</h3>
            <ul>
              <li><strong>Main App:</strong> http://localhost:5173</li>
              <li><strong>Personal Cabinet:</strong> /personal-cabinet</li>
              <li><strong>Admin Components:</strong> SharedNavigation</li>
              <li><strong>Bank Employee Interface:</strong> SharedSideNavigation</li>
            </ul>
          </div>
          
          <div className="qa-test-card">
            <h3>🎯 Test Scenarios</h3>
            <ul>
              <li>🌐 Multi-language navigation</li>
              <li>🔔 Notification system interactions</li>
              <li>👤 User profile management</li>
              <li>🏦 Bank-specific branding</li>
              <li>📱 Mobile responsiveness</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Implementation Summary */}
      <div className="qa-section qa-summary">
        <div className="qa-section-header">
          <h2>📊 Implementation Summary</h2>
        </div>
        
        <div className="summary-grid">
          <div className="summary-item">
            <div className="summary-number">4</div>
            <div className="summary-label">Actions</div>
            <div className="summary-desc">Topnavigation Component</div>
          </div>
          <div className="summary-item">
            <div className="summary-number">14</div>
            <div className="summary-label">Actions</div>
            <div className="summary-desc">Top Navigation 2</div>
          </div>
          <div className="summary-item">
            <div className="summary-number">9</div>
            <div className="summary-label">Actions</div>
            <div className="summary-desc">Side Navigation</div>
          </div>
          <div className="summary-item">
            <div className="summary-number">27</div>
            <div className="summary-label">Total</div>
            <div className="summary-desc">Navigation Actions</div>
          </div>
        </div>
        
        <div className="summary-status">
          <div className="status-indicator status-complete">
            ✅ All Confluence Requirements Implemented
          </div>
        </div>
      </div>
    </div>
  )
} 