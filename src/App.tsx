import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom'
import './App.css'

// Import components
import ComponentShowcase from './pages/ComponentShowcase'
// import ContentManagementPage from './pages/ContentManagementPage'; // No longer used
import SharedHeaderPreview from './pages/SharedHeaderPreview'
import CalculatorFormula from './pages/CalculatorFormula'
import Chat from './pages/Chat'
import ContentManagement from './pages/Chat/ContentManagement/ContentManagement'
import ContentMainDrill from './pages/ContentMainDrill'
import ContentMainConfirm from './pages/ContentMainConfirm'
import ContentMainText from './pages/ContentMainText'
import { AdminLayout, ErrorBoundary } from './components'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { NavigationProvider } from './contexts/NavigationContext'
import AdminLogin from './components/AdminLogin/AdminLogin'
import { ProtectedRoute } from './components/ProtectedRoute'
import { QAShowcase } from './components/QAShowcase/QAShowcase';
import QAMortgage from './pages/QAMortgage';
import ContentVerification from './pages/ContentVerification';
import { SharedContentScreen } from './pages/SharedContentScreen';
import { SharedContentEdit } from './pages/SharedContentEdit';
import MortgageDrill from './pages/MortgageDrill/MortgageDrill';
import MortgageTextEdit from './pages/MortgageTextEdit';
import MortgageDropdownEdit from './pages/MortgageDropdownEdit';
import MortgageRefiDrill from './pages/MortgageRefiDrill';
import MortgageRefiTextEdit from './pages/MortgageRefiTextEdit';
import MortgageRefiDropdownEdit from './pages/MortgageRefiDropdownEdit';
import ContentMortgageRefi from './pages/ContentMortgageRefi';
import MenuDrill from './pages/MenuDrill';






// Chat component now imported above


// Role components with AdminLayout
const SalesManager = () => (
  <AdminLayout title="Менеджер по продажам" activeMenuItem="sales-manager">
    <div className="role-page-content">
      <div className="page-header">
        <h1>📊 Менеджер по продажам</h1>
        <p className="page-subtitle">Управление продажами и клиентской базой</p>
      </div>
      
      <div className="development-notice">
        <div className="notice-card">
          <h3>🚧 В разработке</h3>
          <p>Интерфейс менеджера по продажам находится в активной разработке</p>
          <ul>
            <li>Управление воронкой продаж</li>
            <li>Анализ конверсии клиентов</li>
            <li>Отчеты по продажам</li>
            <li>Управление задачами команды</li>
          </ul>
        </div>
        <div className="test-link">
          <Link to="/content-management" className="btn-primary">
            📝 Перейти к управлению контентом
          </Link>
        </div>
      </div>
    </div>
  </AdminLayout>
)

const Administration = () => (
  <AdminLayout title="Администрация" activeMenuItem="administration">
    <div className="role-page-content">
      <div className="page-header">
        <h1>⚙️ Администрация</h1>
        <p className="page-subtitle">Системное администрирование и управление пользователями</p>
      </div>
      
      <div className="development-notice">
        <div className="notice-card">
          <h3>🚧 В разработке</h3>
          <p>Панель администратора находится в активной разработке</p>
          <ul>
            <li>Управление пользователями и ролями</li>
            <li>Системные настройки</li>
            <li>Мониторинг безопасности</li>
            <li>Резервное копирование</li>
          </ul>
        </div>
        <div className="test-link">
          <Link to="/content-management" className="btn-primary">
            📝 Перейти к управлению контентом
          </Link>
        </div>
      </div>
    </div>
  </AdminLayout>
)

const Brokers = () => (
  <AdminLayout title="Брокеры" activeMenuItem="brokers">
    <div className="role-page-content">
      <div className="page-header">
        <h1>🤝 Брокеры</h1>
        <p className="page-subtitle">Управление партнерской сетью и внешними брокерами</p>
      </div>
      
      <div className="development-notice">
        <div className="notice-card">
          <h3>🚧 В разработке</h3>
          <p>Интерфейс для работы с брокерами находится в активной разработке</p>
          <ul>
            <li>Управление партнерами</li>
            <li>Комиссионная структура</li>
            <li>Отслеживание сделок</li>
            <li>Отчеты по партнерам</li>
          </ul>
        </div>
        <div className="test-link">
          <Link to="/content-management" className="btn-primary">
            📝 Перейти к управлению контентом
          </Link>
        </div>
      </div>
    </div>
  </AdminLayout>
)

const ContentManager = () => (
  <AdminLayout title="Контент-менеджер" activeMenuItem="content-manager">
    <div className="role-page-content">
      <div className="page-header">
        <h1>📝 Контент-менеджер</h1>
        <p className="page-subtitle">Управление контентом и медиа-ресурсами</p>
      </div>
      
      <div className="development-notice">
        <div className="notice-card">
          <h3>🚧 В разработке</h3>
          <p>Система управления контентом находится в активной разработке</p>
          <ul>
            <li>Редактирование страниц</li>
            <li>Управление медиа-библиотекой</li>
            <li>SEO-оптимизация</li>
            <li>Публикация материалов</li>
          </ul>
        </div>
        <div className="test-link">
          <Link to="/content-management" className="btn-primary">
            📝 Перейти к управлению контентом
          </Link>
        </div>
      </div>
    </div>
  </AdminLayout>
)

const Director = () => (
  <AdminLayout title="Директор" activeMenuItem="director">
    <div className="director-page">
      <div className="director-content">
        {/* Director Header */}
        <div className="director-header">
          <h1 className="director-title">
            <span className="crown-icon">👑</span>
            Директор
          </h1>
          <p className="director-subtitle">Исполнительная панель управления и стратегический контроль</p>
        </div>
        
        {/* Ready Components Panel */}
        <div className="ready-components-panel">
          <div className="panel-header">
            <span className="panel-icon">🚀</span>
            <h2>Готовые компоненты</h2>
          </div>
          
          <p className="panel-description">Реализованные функции директора:</p>
          
          <div className="components-list">
            <div className="component-item completed">
              <span className="component-icon">✅</span>
              <span className="component-text">Формула калькулятора - настройка параметров расчета</span>
            </div>
            
            <div className="component-item">
              <span className="component-icon">📊</span>
              <span className="component-text">Стратегические отчеты</span>
            </div>
            
            <div className="component-item">
              <span className="component-icon">💰</span>
              <span className="component-text">Финансовая аналитика</span>
            </div>
            
            <div className="component-item">
              <span className="component-icon">🏢</span>
              <span className="component-text">Управление подразделениями</span>
            </div>
            
            <div className="component-item">
              <span className="component-icon">📈</span>
              <span className="component-text">Контроль КПЭ</span>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="director-actions">
          <Link to="/calculator-formula" className="action-button primary">
            🧮 Формула калькулятора
          </Link>
          
          <Link to="/dev" className="action-button secondary">
            🧪 Перейти к тестовой странице компонентов
          </Link>
        </div>
      </div>
    </div>
  </AdminLayout>
)

// Dashboard component
const Dashboard = () => (
  <div className="dashboard">
    <div className="dashboard-header">
      <h1>🧪 BankIM Admin Components Testing Environment</h1>
      <p className="dashboard-subtitle">
        <strong>localhost:3002</strong> - Standalone Admin Panel Testing
      </p>
      <div className="dashboard-info">
        <div className="info-card">
          <h3>🎯 Purpose</h3>
          <p>Test and develop shared admin components before building actual admin pages</p>
        </div>
        <div className="info-card">
          <h3>📁 Shared Components</h3>
          <p>Located in <code>adminShared/components/</code> - used by all 6 admin roles</p>
        </div>
        <div className="info-card">
          <h3>🔧 Test Environment</h3>
          <p>Interactive testing with different admin role contexts and permissions</p>
        </div>
      </div>
    </div>

    <div className="role-cards">
      <h2>👥 Admin Roles (6 Types)</h2>
      <p>Each role has different permissions and access levels:</p>
      
      <div className="cards-grid">
        <Link to="/director" className="role-card director">
          <div className="role-header">
            <span className="role-icon">👑</span>
            <h3>Director</h3>
          </div>
          <p className="role-permissions">40 permissions</p>
          <p className="role-desc">Full super-admin access</p>
        </Link>

        <Link to="/administration" className="role-card administration">
          <div className="role-header">
            <span className="role-icon">⚙️</span>
            <h3>Administration</h3>
          </div>
          <p className="role-permissions">26 permissions</p>
          <p className="role-desc">User & system management</p>
        </Link>

        <Link to="/content-manager" className="role-card content">
          <div className="role-header">
            <span className="role-icon">📝</span>
            <h3>Content Manager</h3>
          </div>
          <p className="role-permissions">13 permissions</p>
          <p className="role-desc">Content & media management</p>
        </Link>

        <Link to="/sales-manager" className="role-card sales">
          <div className="role-header">
            <span className="role-icon">📊</span>
            <h3>Sales Manager</h3>
          </div>
          <p className="role-permissions">18 permissions</p>
          <p className="role-desc">Sales pipeline management</p>
        </Link>

        <Link to="/brokers" className="role-card brokers">
          <div className="role-header">
            <span className="role-icon">🤝</span>
            <h3>Brokers</h3>
          </div>
          <p className="role-permissions">9 permissions</p>
          <p className="role-desc">External partner access</p>
        </Link>

        <Link to="/content-management" className="role-card employee">
          <div className="role-header">
            <span className="role-icon">🏛️</span>
            <h3>Bank Employee</h3>
          </div>
          <p className="role-permissions">21 permissions</p>
          <p className="role-desc">Content management access</p>
        </Link>
      </div>
      
      <div className="main-test-link">
        <Link to="/content-management" className="test-components-btn">
          💼 Content Management
        </Link>
        <p>Manage site content and translations</p>
      </div>
      
      <div className="main-test-link">
        <Link to="/components" className="test-components-btn">
          🔬 Component Showcase
        </Link>
        <p>Test individual shared components in isolation</p>
      </div>
      
      <div className="main-test-link">
        <Link to="/content/mortgage" className="test-components-btn">
          📊 Mortgage Content
        </Link>
        <p>View and manage mortgage calculation content</p>
      </div>
    </div>
  </div>
)

// Main App Router Component
const AppRouter: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AdminLogin />;
  }

  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<Navigate to="/content-management" replace />} />
        <Route path="/dev" element={<Dashboard />} />
        <Route path="/director" element={<Director />} />
        <Route path="/administration" element={<Administration />} />
        <Route path="/sales-manager" element={<SalesManager />} />
        <Route path="/brokers" element={<Brokers />} />
        <Route path="/content-manager" element={<ContentManager />} />

        <Route 
          path="/calculator-formula" 
          element={
            <ErrorBoundary>
              <ProtectedRoute requiredPermission={{ action: 'read', resource: 'calculator-formula' }}>
                <CalculatorFormula />
              </ProtectedRoute>
            </ErrorBoundary>
          } 
        />
        <Route path="/chat" element={<Chat />} />
        <Route path="/components" element={<ComponentShowcase />} />
        <Route path="/components/shared-header" element={<SharedHeaderPreview />} />
        <Route path="/qa-showcase" element={<QAShowcase />} />
        <Route path="/qa-mortgage" element={<QAMortgage />} />
        {/* Removed old content/:pageId route - now handled by SharedContentScreen */}
        <Route 
          path="/content-management" 
          element={
            <ErrorBoundary>
              <ProtectedRoute requiredPermission={{ action: 'read', resource: 'content-management' }}>
                <AdminLayout title="Контент сайта" activeMenuItem="content-management">
                  <ContentManagement />
                </AdminLayout>
              </ProtectedRoute>
            </ErrorBoundary>
          } 
        />
        
        {/* Content submenu routes - Special routes for main content */}
        <Route 
          path="/content/main/action/:actionId" 
          element={
            <ErrorBoundary>
              <ProtectedRoute requiredPermission={{ action: 'write', resource: 'content-management' }}>
                <AdminLayout title="Редактирование действия" activeMenuItem="content-main">
                  <ContentMainDrill />
                </AdminLayout>
              </ProtectedRoute>
            </ErrorBoundary>
          } 
        />
        <Route 
          path="/content/main/confirm/:actionId" 
          element={
            <ErrorBoundary>
              <ProtectedRoute requiredPermission={{ action: 'write', resource: 'content-management' }}>
                <AdminLayout title="Подтверждение изменений" activeMenuItem="content-main">
                  <ContentMainConfirm />
                </AdminLayout>
              </ProtectedRoute>
            </ErrorBoundary>
          } 
        />
        <Route 
          path="/content/main/text/:actionId" 
          element={
            <ErrorBoundary>
              <ProtectedRoute requiredPermission={{ action: 'write', resource: 'content-management' }}>
                <AdminLayout title="Редактирование текста" activeMenuItem="content-main">
                  <ContentMainText />
                </AdminLayout>
              </ProtectedRoute>
            </ErrorBoundary>
          } 
        />
        
        {/* Mortgage drill route - specific drill page for mortgage content */}
        <Route 
          path="/content/mortgage/drill/:pageId" 
          element={
            <ErrorBoundary>
              <ProtectedRoute requiredPermission={{ action: 'read', resource: 'content-management' }}>
                <AdminLayout title="Страница ипотеки" activeMenuItem="content-mortgage">
                  <MortgageDrill />
                </AdminLayout>
              </ProtectedRoute>
            </ErrorBoundary>
          } 
        />
        
        {/* Mortgage text edit route - MUST BE BEFORE generic edit route */}
        <Route 
          path="/content/mortgage/text-edit/:actionId" 
          element={
            <ErrorBoundary>
              <ProtectedRoute requiredPermission={{ action: 'update', resource: 'content-management' }}>
                <AdminLayout title="Редактирование текста" activeMenuItem="content-mortgage">
                  <MortgageTextEdit />
                </AdminLayout>
              </ProtectedRoute>
            </ErrorBoundary>
          } 
        />
        
        {/* Mortgage dropdown edit route - MUST BE BEFORE generic edit route */}
        <Route 
          path="/content/mortgage/dropdown-edit/:actionId" 
          element={
            <ErrorBoundary>
              <ProtectedRoute requiredPermission={{ action: 'update', resource: 'content-management' }}>
                <AdminLayout title="Редактирование дропдауна" activeMenuItem="content-mortgage">
                  <MortgageDropdownEdit />
                </AdminLayout>
              </ProtectedRoute>
            </ErrorBoundary>
          } 
        />
        
        {/* Mortgage-refi drill route - specific drill page for mortgage refinancing content */}
        <Route 
          path="/content/mortgage-refi/drill/:pageId" 
          element={
            <ErrorBoundary>
              <ProtectedRoute requiredPermission={{ action: 'read', resource: 'content-management' }}>
                <AdminLayout title="Страница рефинансирования" activeMenuItem="content-mortgage-refi">
                  <MortgageRefiDrill />
                </AdminLayout>
              </ProtectedRoute>
            </ErrorBoundary>
          } 
        />
        
        {/* Menu drill route - specific drill page for menu sections */}
        <Route 
          path="/content/menu/drill/:sectionId" 
          element={
            <ErrorBoundary>
              <ProtectedRoute requiredPermission={{ action: 'read', resource: 'content-management' }}>
                <AdminLayout title="Раздел меню" activeMenuItem="content-menu">
                  <MenuDrill />
                </AdminLayout>
              </ProtectedRoute>
            </ErrorBoundary>
          } 
        />
        
        {/* Mortgage-refi text edit route - MUST BE BEFORE generic edit route */}
        <Route 
          path="/content/mortgage-refi/text-edit/:actionId" 
          element={
            <ErrorBoundary>
              <ProtectedRoute requiredPermission={{ action: 'update', resource: 'content-management' }}>
                <AdminLayout title="Редактирование текста" activeMenuItem="content-mortgage-refi">
                  <MortgageRefiTextEdit />
                </AdminLayout>
              </ProtectedRoute>
            </ErrorBoundary>
          } 
        />
        
        {/* Mortgage-refi dropdown edit route - MUST BE BEFORE generic edit route */}
        <Route 
          path="/content/mortgage-refi/dropdown-edit/:actionId" 
          element={
            <ErrorBoundary>
              <ProtectedRoute requiredPermission={{ action: 'update', resource: 'content-management' }}>
                <AdminLayout title="Редактирование дропдауна" activeMenuItem="content-mortgage-refi">
                  <MortgageRefiDropdownEdit />
                </AdminLayout>
              </ProtectedRoute>
            </ErrorBoundary>
          } 
        />
        
        {/* Shared content edit route - handles all content types */}
        <Route 
          path="/content/:contentType/edit/:itemId" 
          element={
            <ErrorBoundary>
              <ProtectedRoute requiredPermission={{ action: 'write', resource: 'content-management' }}>
                <SharedContentEdit />
              </ProtectedRoute>
            </ErrorBoundary>
          } 
        />
        
        {/* Explicit mortgage-refi list route (prevents accidental redirect to /admin/login) */}
        <Route 
          path="/content/mortgage-refi" 
          element={
            <ErrorBoundary>
              <ProtectedRoute requiredPermission={{ action: 'read', resource: 'content-management' }}>
                <AdminLayout title="Рефинансирование ипотеки" activeMenuItem="content-mortgage-refi">
                  <ContentMortgageRefi />
                </AdminLayout>
              </ProtectedRoute>
            </ErrorBoundary>
          } 
        />
        
        {/* Shared content list route - must be after specific routes */}
        <Route 
          path="/content/:contentType" 
          element={
            <ErrorBoundary>
              <ProtectedRoute requiredPermission={{ action: 'read', resource: 'content-management' }}>
                <SharedContentScreen />
              </ProtectedRoute>
            </ErrorBoundary>
          } 
        />
        <Route 
          path="/content/verification" 
          element={
            <ErrorBoundary>
              <ProtectedRoute requiredPermission={{ action: 'read', resource: 'content-management' }}>
                <AdminLayout title="Data Flow Verification" activeMenuItem="content-mortgage">
                  <ContentVerification />
                </AdminLayout>
              </ProtectedRoute>
            </ErrorBoundary>
          } 
        />

        {/* Fallback route - must be last */}
        <Route path="*" element={<Navigate to="/admin/login" replace />} />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <NavigationProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AppRouter />
        </Router>
      </NavigationProvider>
    </AuthProvider>
  )
}

export default App 