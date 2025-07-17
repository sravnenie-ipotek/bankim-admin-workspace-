import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom'
import './App.css'

// Import components
import BankEmployee from './pages/BankEmployee'
import ComponentShowcase from './pages/ComponentShowcase'
import ContentListPage from './pages/ContentListPage';
import ContentManagementPage from './pages/ContentManagementPage';
import SharedHeaderPreview from './pages/SharedHeaderPreview'
import TableDemo from './pages/TableDemo'
import CalculatorFormula from './pages/CalculatorFormula'
import Chat from './pages/Chat'
import { AdminLayout, ErrorBoundary } from './components'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import AdminLogin from './components/AdminLogin/AdminLogin'
import { ProtectedRoute } from './components/ProtectedRoute'
import { QAShowcase } from './components/QAShowcase/QAShowcase';

// Placeholder components for missing routes
const PlaceholderPage = ({ title, description, icon, activeMenuItem }: { title: string; description: string; icon: string; activeMenuItem: string }) => (
  <AdminLayout title={title} activeMenuItem={activeMenuItem}>
    <div className="role-page-content">
      <div className="page-header">
        <h1>{icon} {title}</h1>
        <p className="page-subtitle">{description}</p>
      </div>
      
      <div className="development-notice">
        <div className="notice-card">
          <h3>🚧 В разработке</h3>
          <p>Эта страница находится в активной разработке и будет доступна в ближайшее время.</p>
          <div className="placeholder-actions">
            <Link to="/" className="btn-primary">
              🏠 Вернуться на главную
            </Link>
            <Link to="/bank-employee" className="btn-secondary">
              🧪 Перейти к тестовой странице
            </Link>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
)

const _Users = () => (
  <PlaceholderPage 
    title="Клиенты" 
    description="Управление клиентской базой и взаимодействие с клиентами"
    icon="👥"
    activeMenuItem="users"
  />
)

const _Reports = () => (
  <PlaceholderPage 
    title="Предложения" 
    description="Отчеты по предложениям и аналитика продаж"
    icon="📊"
    activeMenuItem="reports"
  />
)

const _UserRegistration = () => (
  <PlaceholderPage 
    title="Создание аудитории" 
    description="Регистрация новых пользователей и создание целевых аудиторий"
    icon="👤"
    activeMenuItem="user-registration"
  />
)

// Chat component now imported above

const _Settings = () => (
  <PlaceholderPage 
    title="Настройки" 
    description="Системные настройки и конфигурация приложения"
    icon="⚙️"
    activeMenuItem="settings"
  />
)

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
          <Link to="/bank-employee" className="btn-primary">
            🧪 Перейти к тестовой странице компонентов
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
          <Link to="/bank-employee" className="btn-primary">
            🧪 Перейти к тестовой странице компонентов
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
          <Link to="/bank-employee" className="btn-primary">
            🧪 Перейти к тестовой странице компонентов
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
          <Link to="/bank-employee" className="btn-primary">
            🧪 Перейти к тестовой странице компонентов
          </Link>
        </div>
      </div>
    </div>
  </AdminLayout>
)

const Director = () => (
  <AdminLayout title="Директор" activeMenuItem="director">
    <div className="role-page-content">
      <div className="page-header">
        <h1>👑 Директор</h1>
        <p className="page-subtitle">Исполнительная панель управления и стратегический контроль</p>
      </div>
      
      <div className="development-notice">
        <div className="notice-card">
          <h3>🚀 Готовые компоненты</h3>
          <p>Реализованные функции директора:</p>
          <ul>
            <li>✅ Формула калькулятора - настройка параметров расчета</li>
            <li>🚧 Стратегические отчеты</li>
            <li>🚧 Финансовая аналитика</li>
            <li>🚧 Управление подразделениями</li>
            <li>🚧 Контроль КПЭ</li>
          </ul>
        </div>
        <div className="test-link">
          <Link to="/calculator-formula" className="btn-primary">
            🧮 Формула калькулятора
          </Link>
        </div>
        <div className="test-link">
          <Link to="/bank-employee" className="btn-primary">
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

        <Link to="/bank-employee" className="role-card employee">
          <div className="role-header">
            <span className="role-icon">🏛️</span>
            <h3>Bank Employee</h3>
          </div>
          <p className="role-permissions">21 permissions</p>
          <p className="role-desc">Daily operations</p>
        </Link>
      </div>
      
      <div className="main-test-link">
        <Link to="/bank-employee" className="test-components-btn">
          🧪 Go to Bank Employee Test Page
        </Link>
        <p>Interactive testing environment for bank employee functionality</p>
      </div>
      
      <div className="main-test-link">
        <Link to="/components" className="test-components-btn">
          🔬 Component Showcase
        </Link>
        <p>Test individual shared components in isolation</p>
      </div>
      
      <div className="main-test-link">
        <Link to="/table-demo" className="test-components-btn">
          📊 Table Component Demo
        </Link>
        <p>Interactive bank data table with exact Figma specifications</p>
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
        <Route path="/" element={<Dashboard />} />
        <Route path="/director" element={<Director />} />
        <Route path="/administration" element={<Administration />} />
        <Route path="/sales-manager" element={<SalesManager />} />
        <Route path="/brokers" element={<Brokers />} />
        <Route path="/content-manager" element={<ContentManager />} />
        <Route path="/bank-employee" element={<BankEmployee />} />
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
        <Route path="/components" element={<ComponentShowcase />} />
        <Route path="/components/shared-header" element={<SharedHeaderPreview />} />
        <Route path="/table-demo" element={<TableDemo />} />
        <Route path="/qa-showcase" element={<QAShowcase />} />
        <Route path="/content" element={<ContentListPage />} />
        <Route path="/content/:pageId" element={<ContentManagementPage />} />
        <Route 
          path="/content-management" 
          element={
            <ErrorBoundary>
              <ProtectedRoute requiredPermission={{ action: 'read', resource: 'content-management' }}>
                <Chat activeSection="content-management" />
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
      <Router>
        <AppRouter />
      </Router>
    </AuthProvider>
  )
}

export default App 