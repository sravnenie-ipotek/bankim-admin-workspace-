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
import ContentMain from './pages/ContentMain/ContentMain'
import ContentMainDrill from './pages/ContentMainDrill'
import ContentMainConfirm from './pages/ContentMainConfirm'
import ContentMainText from './pages/ContentMainText'
import MainDrill from './pages/MainDrill/MainDrill'
import { AdminLayout, ErrorBoundary } from './components'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { NavigationProvider } from './contexts/NavigationContext'
import AdminLogin from './components/AdminLogin/AdminLogin'
import { ProtectedRoute } from './components/ProtectedRoute'
import { QAShowcase } from './components/QAShowcase/QAShowcase';
import QAMortgage from './pages/QAMortgage';
import ContentVerification from './pages/ContentVerification';
import QALanguage from './pages/QALanguage/QALanguage';
import { SharedContentScreen } from './pages/SharedContentScreen';
import { SharedContentEdit } from './pages/SharedContentEdit';
import MortgageDrill from './pages/MortgageDrill/MortgageDrill';
import CreditDrill from './pages/CreditDrill/CreditDrill';
import CreditTextEdit from './pages/CreditTextEdit';
import CreditRefiTextEdit from './pages/CreditRefiTextEdit';
import MortgageTextEdit from './pages/MortgageTextEdit';
import MortgageRefiDrill from './pages/MortgageRefiDrill';
import MortgageRefiTextEdit from './pages/MortgageRefiTextEdit';
import SharedDropdownEdit from './pages/SharedDropdownEdit';
import ContentMortgageRefi from './pages/ContentMortgageRefi';
import ContentGeneral from './pages/ContentGeneral';
import MenuDrill from './pages/MenuDrill';
import MenuTextEdit from './pages/MenuTextEdit';
import MenuEdit from './pages/MenuEdit';
import LanguageDemo from './components/LanguageDemo/LanguageDemo';
import LanguageTest from './components/LanguageTest/LanguageTest';
import DropdownAdmin from './pages/DropdownAdmin';
import JSONBDropdownEdit from './components/JSONBDropdownEdit';






// Chat component now imported above


// Placeholder components with "В разработке" notice
const UserManagement = () => (
  <AdminLayout title="Управление пользователями" activeMenuItem="user-management">
    <div className="development-notice">
      <div className="notice-card">
        <h3>🚧 В разработке</h3>
        <p>Система управления пользователями находится в активной разработке</p>
        <ul>
          <li>Создание и редактирование пользователей</li>
          <li>Управление профилями</li>
          <li>Настройка доступа</li>
        </ul>
      </div>
    </div>
  </AdminLayout>
)

const RolesPermissions = () => (
  <AdminLayout title="Роли и разрешения" activeMenuItem="roles-permissions">
    <div className="development-notice">
      <div className="notice-card">
        <h3>🚧 В разработке</h3>
        <p>Система ролей и разрешений находится в активной разработке</p>
        <ul>
          <li>Настройка ролей пользователей</li>
          <li>Управление разрешениями</li>
          <li>Контроль доступа к функциям</li>
        </ul>
      </div>
    </div>
  </AdminLayout>
)

const ActiveSessions = () => (
  <AdminLayout title="Активные сессии" activeMenuItem="active-sessions">
    <div className="development-notice">
      <div className="notice-card">
        <h3>🚧 В разработке</h3>
        <p>Мониторинг активных сессий находится в активной разработке</p>
        <ul>
          <li>Просмотр активных сессий</li>
          <li>Завершение сессий</li>
          <li>История подключений</li>
        </ul>
      </div>
    </div>
  </AdminLayout>
)

const AnalyticsDashboard = () => (
  <AdminLayout title="Аналитика" activeMenuItem="analytics-dashboard">
    <div className="development-notice">
      <div className="notice-card">
        <h3>🚧 В разработке</h3>
        <p>Панель аналитики находится в активной разработке</p>
        <ul>
          <li>Визуализация данных</li>
          <li>Ключевые метрики</li>
          <li>Интерактивные графики</li>
        </ul>
      </div>
    </div>
  </AdminLayout>
)

const Reports = () => (
  <AdminLayout title="Отчеты" activeMenuItem="reports">
    <div className="development-notice">
      <div className="notice-card">
        <h3>🚧 В разработке</h3>
        <p>Система отчетов находится в активной разработке</p>
        <ul>
          <li>Генерация отчетов</li>
          <li>Экспорт данных</li>
          <li>Автоматические отчеты</li>
        </ul>
      </div>
    </div>
  </AdminLayout>
)

const UserStats = () => (
  <AdminLayout title="Статистика пользователей" activeMenuItem="user-stats">
    <div className="development-notice">
      <div className="notice-card">
        <h3>🚧 В разработке</h3>
        <p>Статистика пользователей находится в активной разработке</p>
        <ul>
          <li>Анализ активности</li>
          <li>Поведенческие метрики</li>
          <li>Сегментация пользователей</li>
        </ul>
      </div>
    </div>
  </AdminLayout>
)

const Conversion = () => (
  <AdminLayout title="Конверсия" activeMenuItem="conversion">
    <div className="development-notice">
      <div className="notice-card">
        <h3>🚧 В разработке</h3>
        <p>Анализ конверсии находится в активной разработке</p>
        <ul>
          <li>Воронки конверсии</li>
          <li>A/B тестирование</li>
          <li>Оптимизация пользовательского пути</li>
        </ul>
      </div>
    </div>
  </AdminLayout>
)

const GeneralSettings = () => (
  <AdminLayout title="Общие настройки" activeMenuItem="general-settings">
    <div className="development-notice">
      <div className="notice-card">
        <h3>🚧 В разработке</h3>
        <p>Общие настройки системы находятся в активной разработке</p>
        <ul>
          <li>Конфигурация приложения</li>
          <li>Системные параметры</li>
          <li>Общие предпочтения</li>
        </ul>
      </div>
    </div>
  </AdminLayout>
)

const ApiConfiguration = () => (
  <AdminLayout title="API конфигурация" activeMenuItem="api-configuration">
    <div className="development-notice">
      <div className="notice-card">
        <h3>🚧 В разработке</h3>
        <p>Конфигурация API находится в активной разработке</p>
        <ul>
          <li>Настройка API endpoints</li>
          <li>Управление токенами</li>
          <li>Лимиты и квоты</li>
        </ul>
      </div>
    </div>
  </AdminLayout>
)

const Security = () => (
  <AdminLayout title="Безопасность" activeMenuItem="security">
    <div className="development-notice">
      <div className="notice-card">
        <h3>🚧 В разработке</h3>
        <p>Настройки безопасности находятся в активной разработке</p>
        <ul>
          <li>Политики безопасности</li>
          <li>Аутентификация</li>
          <li>Аудит безопасности</li>
        </ul>
      </div>
    </div>
  </AdminLayout>
)

const Integrations = () => (
  <AdminLayout title="Интеграции" activeMenuItem="integrations">
    <div className="development-notice">
      <div className="notice-card">
        <h3>🚧 В разработке</h3>
        <p>Управление интеграциями находится в активной разработке</p>
        <ul>
          <li>Настройка интеграций</li>
          <li>Веб-хуки</li>
          <li>API подключения</li>
        </ul>
      </div>
    </div>
  </AdminLayout>
)

const BanksList = () => (
  <AdminLayout title="Список банков" activeMenuItem="banks-list">
    <div className="development-notice">
      <div className="notice-card">
        <h3>🚧 В разработке</h3>
        <p>Управление списком банков находится в активной разработке</p>
        <ul>
          <li>Добавление банков</li>
          <li>Редактирование информации</li>
          <li>Управление статусами</li>
        </ul>
      </div>
    </div>
  </AdminLayout>
)

const BankSettings = () => (
  <AdminLayout title="Настройки банков" activeMenuItem="bank-settings">
    <div className="development-notice">
      <div className="notice-card">
        <h3>🚧 В разработке</h3>
        <p>Настройки банков находятся в активной разработке</p>
        <ul>
          <li>Конфигурация банков</li>
          <li>Параметры взаимодействия</li>
          <li>Специальные настройки</li>
        </ul>
      </div>
    </div>
  </AdminLayout>
)

const EventLog = () => (
  <AdminLayout title="Журнал событий" activeMenuItem="event-log">
    <div className="development-notice">
      <div className="notice-card">
        <h3>🚧 В разработке</h3>
        <p>Журнал системных событий находится в активной разработке</p>
        <ul>
          <li>Просмотр событий</li>
          <li>Фильтрация записей</li>
          <li>Экспорт логов</li>
        </ul>
      </div>
    </div>
  </AdminLayout>
)

const SystemErrors = () => (
  <AdminLayout title="Ошибки системы" activeMenuItem="system-errors">
    <div className="development-notice">
      <div className="notice-card">
        <h3>🚧 В разработке</h3>
        <p>Мониторинг системных ошибок находится в активной разработке</p>
        <ul>
          <li>Отслеживание ошибок</li>
          <li>Анализ сбоев</li>
          <li>Уведомления об ошибках</li>
        </ul>
      </div>
    </div>
  </AdminLayout>
)

const AuditActions = () => (
  <AdminLayout title="Аудит действий" activeMenuItem="audit-actions">
    <div className="development-notice">
      <div className="notice-card">
        <h3>🚧 В разработке</h3>
        <p>Система аудита действий находится в активной разработке</p>
        <ul>
          <li>Журнал пользовательских действий</li>
          <li>Трекинг изменений</li>
          <li>Отчеты по активности</li>
        </ul>
      </div>
    </div>
  </AdminLayout>
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
        
        {/* Language Demo for Testing */}
        <LanguageDemo />
        <LanguageTest />
        
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
  const { loading, user } = useAuth();

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

  // Enable authentication
  if (!user) {
    return <AdminLogin />;
  }

  return (
    <div className="app">
      <Routes>
        <Route path="/login" element={<AdminLogin />} />
        <Route path="/" element={<Navigate to="/content-management" replace />} />
        <Route path="/dev" element={<Dashboard />} />
        <Route path="/director" element={<Director />} />
        <Route path="/administration" element={<Administration />} />
        <Route path="/sales-manager" element={<SalesManager />} />
        <Route path="/brokers" element={<Brokers />} />
        <Route path="/content-manager" element={<ContentManager />} />

        {/* Users submenu routes */}
        <Route path="/users/management" element={<UserManagement />} />
        <Route path="/users/roles-permissions" element={<RolesPermissions />} />
        <Route path="/users/sessions" element={<ActiveSessions />} />

        {/* Analytics submenu routes */}
        <Route path="/analytics/dashboard" element={<AnalyticsDashboard />} />
        <Route path="/analytics/reports" element={<Reports />} />
        <Route path="/analytics/user-stats" element={<UserStats />} />
        <Route path="/analytics/conversion" element={<Conversion />} />

        {/* Settings submenu routes */}
        <Route path="/settings/general" element={<GeneralSettings />} />
        <Route path="/settings/api-config" element={<ApiConfiguration />} />
        <Route path="/settings/security" element={<Security />} />
        <Route path="/settings/integrations" element={<Integrations />} />

        {/* Banks submenu routes */}
        <Route path="/banks/list" element={<BanksList />} />
        <Route path="/banks/settings" element={<BankSettings />} />
        <Route path="/banks/api-config" element={<ApiConfiguration />} />

        {/* System Logs submenu routes */}
        <Route path="/system-logs/events" element={<EventLog />} />
        <Route path="/system-logs/errors" element={<SystemErrors />} />
        <Route path="/system-logs/audit" element={<AuditActions />} />

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
        <Route path="/qa-language" element={<QALanguage />} />
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
        
        {/* JSONB Dropdown Management - New admin interface for dropdown system */}
        <Route 
          path="/dropdown-admin" 
          element={
            <ErrorBoundary>
              <ProtectedRoute requiredPermission={{ action: 'write', resource: 'content-management' }}>
                <AdminLayout title="JSONB Dropdown Management" activeMenuItem="dropdown-admin">
                  <DropdownAdmin />
                </AdminLayout>
              </ProtectedRoute>
            </ErrorBoundary>
          } 
        />
        
        {/* JSONB Dropdown Edit - KEEPS ORIGINAL DESIGN but uses JSONB data */}
        <Route 
          path="/content/jsonb-dropdown-edit/:actionId" 
          element={
            <ErrorBoundary>
              <ProtectedRoute requiredPermission={{ action: 'update', resource: 'content-management' }}>
                <JSONBDropdownEdit />
              </ProtectedRoute>
            </ErrorBoundary>
          } 
        />
        
        {/* Content submenu routes - Special routes for main content */}
        <Route 
          path="/content/main" 
          element={
            <ErrorBoundary>
              <ProtectedRoute requiredPermission={{ action: 'read', resource: 'content-management' }}>
                <AdminLayout title="Главная страница" activeMenuItem="content-main">
                  <ContentMain />
                </AdminLayout>
              </ProtectedRoute>
            </ErrorBoundary>
          } 
        />
        <Route 
          path="/content/main/drill/:pageId" 
          element={
            <ErrorBoundary>
              <ProtectedRoute requiredPermission={{ action: 'read', resource: 'content-management' }}>
                <AdminLayout title="Главная страница" activeMenuItem="content-main">
                  <MainDrill />
                </AdminLayout>
              </ProtectedRoute>
            </ErrorBoundary>
          } 
        />
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
        
        {/* Main text edit route - MUST BE BEFORE generic edit route */}
        <Route 
          path="/content/main/text-edit/:actionId" 
          element={
            <ErrorBoundary>
              <ProtectedRoute requiredPermission={{ action: 'update', resource: 'content-management' }}>
                <AdminLayout title="Редактирование текста" activeMenuItem="content-main">
                  <ContentMainText />
                </AdminLayout>
              </ProtectedRoute>
            </ErrorBoundary>
          } 
        />
        
        {/* Main dropdown edit route - MUST BE BEFORE generic edit route */}
        <Route 
          path="/content/main/dropdown-edit/:actionId" 
          element={
            <ErrorBoundary>
              <ProtectedRoute requiredPermission={{ action: 'update', resource: 'content-management' }}>
                <AdminLayout title="Редактирование выпадающего списка" activeMenuItem="content-main">
                  <SharedDropdownEdit />
                </AdminLayout>
              </ProtectedRoute>
            </ErrorBoundary>
          } 
        />
        
        {/* Main general edit route */}
        <Route 
          path="/content/main/edit/:actionId" 
          element={
            <ErrorBoundary>
              <ProtectedRoute requiredPermission={{ action: 'update', resource: 'content-management' }}>
                <AdminLayout title="Редактирование контента" activeMenuItem="content-main">
                  <SharedContentEdit />
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
              {/* <ProtectedRoute requiredPermission={{ action: 'read', resource: 'content-management' }}> */}
                <AdminLayout title="Страница ипотеки" activeMenuItem="content-mortgage">
                  <MortgageDrill />
                </AdminLayout>
              {/* </ProtectedRoute> */}
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
        
        {/* Mortgage dropdown edit route - REDIRECTED TO JSONB ADMIN */}
        <Route 
          path="/content/mortgage/dropdown-edit/:actionId" 
          element={
            <ErrorBoundary>
              <ProtectedRoute requiredPermission={{ action: 'update', resource: 'content-management' }}>
                <JSONBDropdownEdit />
              </ProtectedRoute>
            </ErrorBoundary>
          } 
        />

        {/* Mortgage general edit route */}
        <Route 
          path="/content/mortgage/edit/:actionId" 
          element={
            <ErrorBoundary>
              {/* <ProtectedRoute requiredPermission={{ action: 'update', resource: 'content-management' }}> */}
                <AdminLayout title="Редактирование ипотеки" activeMenuItem="content-mortgage">
                  <SharedContentEdit />
                </AdminLayout>
              {/* </ProtectedRoute> */}
            </ErrorBoundary>
          } 
        />
        
        {/* Mortgage-refi drill route - specific drill page for mortgage refinancing content */}
        <Route 
          path="/content/mortgage-refi/drill/:pageId" 
          element={
            <ErrorBoundary>
              {/* <ProtectedRoute requiredPermission={{ action: 'read', resource: 'content-management' }}> */}
                <AdminLayout title="Страница рефинансирования" activeMenuItem="content-mortgage-refi">
                  <MortgageRefiDrill />
                </AdminLayout>
              {/* </ProtectedRoute> */}
            </ErrorBoundary>
          } 
        />
        
        {/* General content route - for general pages content management */}
        <Route 
          path="/content/general" 
          element={
            <ErrorBoundary>
              {/* <ProtectedRoute requiredPermission={{ action: 'read', resource: 'content-management' }}> */}
                <AdminLayout title="Общие страницы" activeMenuItem="content-general">
                  <ContentGeneral />
                </AdminLayout>
              {/* </ProtectedRoute> */}
            </ErrorBoundary>
          } 
        />


        {/* Credit drill route - specific drill page for credit content */}
        <Route 
          path="/content/credit/drill/:pageId" 
          element={
            <ErrorBoundary>
              {/* <ProtectedRoute requiredPermission={{ action: 'read', resource: 'content-management' }}> */}
                <AdminLayout title="Страница кредита" activeMenuItem="content-credit">
                  <CreditDrill />
                </AdminLayout>
              {/* </ProtectedRoute> */}
            </ErrorBoundary>
          } 
        />

        {/* Credit-refi drill route - specific drill page for credit refinancing content */}
        <Route 
          path="/content/credit-refi/drill/:pageId" 
          element={
            <ErrorBoundary>
              {/* <ProtectedRoute requiredPermission={{ action: 'read', resource: 'content-management' }}> */}
                <AdminLayout title="Страница рефинансирования кредита" activeMenuItem="content-credit-refi">
                  <CreditDrill />
                </AdminLayout>
              {/* </ProtectedRoute> */}
            </ErrorBoundary>
          } 
        />

        {/* General pages drill route - specific drill page for general content */}
        <Route 
          path="/content/general/drill/:pageId" 
          element={
            <ErrorBoundary>
              {/* <ProtectedRoute requiredPermission={{ action: 'read', resource: 'content-management' }}> */}
                <AdminLayout title="Общая страница" activeMenuItem="content-general">
                  <MortgageDrill />
                </AdminLayout>
              {/* </ProtectedRoute> */}
            </ErrorBoundary>
          } 
        />

        {/* General text edit route */}
        <Route 
          path="/content/general/text-edit/:actionId" 
          element={
            <ErrorBoundary>
              {/* <ProtectedRoute requiredPermission={{ action: 'update', resource: 'content-management' }}> */}
                <AdminLayout title="Редактирование текста общей страницы" activeMenuItem="content-general">
                  <SharedContentEdit />
                </AdminLayout>
              {/* </ProtectedRoute> */}
            </ErrorBoundary>
          } 
        />

        {/* General edit route */}
        <Route 
          path="/content/general/edit/:actionId" 
          element={
            <ErrorBoundary>
              {/* <ProtectedRoute requiredPermission={{ action: 'update', resource: 'content-management' }}> */}
                <AdminLayout title="Редактирование общей страницы" activeMenuItem="content-general">
                  <SharedContentEdit />
                </AdminLayout>
              {/* </ProtectedRoute> */}
            </ErrorBoundary>
          } 
        />

        {/* Credit text edit route */}
        <Route 
          path="/content/credit/text-edit/:actionId" 
          element={
            <ErrorBoundary>
              {/* <ProtectedRoute requiredPermission={{ action: 'update', resource: 'content-management' }}> */}
                <AdminLayout title="Редактирование текста кредита" activeMenuItem="content-credit">
                  <CreditTextEdit />
                </AdminLayout>
              {/* </ProtectedRoute> */}
            </ErrorBoundary>
          } 
        />

        {/* Credit dropdown edit route - REDIRECTED TO JSONB ADMIN */}
        <Route 
          path="/content/credit/dropdown-edit/:actionId" 
          element={
            <ErrorBoundary>
              <ProtectedRoute requiredPermission={{ action: 'update', resource: 'content-management' }}>
                <JSONBDropdownEdit />
              </ProtectedRoute>
            </ErrorBoundary>
          } 
        />

        {/* Credit general edit route */}
        <Route 
          path="/content/credit/edit/:actionId" 
          element={
            <ErrorBoundary>
              {/* <ProtectedRoute requiredPermission={{ action: 'update', resource: 'content-management' }}> */}
                <AdminLayout title="Редактирование кредита" activeMenuItem="content-credit">
                  <SharedContentEdit />
                </AdminLayout>
              {/* </ProtectedRoute> */}
            </ErrorBoundary>
          } 
        />

        {/* Credit-refi text edit route */}
        <Route 
          path="/content/credit-refi/text-edit/:actionId" 
          element={
            <ErrorBoundary>
              {/* <ProtectedRoute requiredPermission={{ action: 'update', resource: 'content-management' }}> */}
                <AdminLayout title="Редактирование текста рефинансирования кредита" activeMenuItem="content-credit-refi">
                  <CreditRefiTextEdit />
                </AdminLayout>
              {/* </ProtectedRoute> */}
            </ErrorBoundary>
          } 
        />

        {/* Credit-refi dropdown edit route - REDIRECTED TO JSONB ADMIN */}
        <Route 
          path="/content/credit-refi/dropdown-edit/:actionId" 
          element={
            <ErrorBoundary>
              <ProtectedRoute requiredPermission={{ action: 'update', resource: 'content-management' }}>
                <JSONBDropdownEdit />
              </ProtectedRoute>
            </ErrorBoundary>
          } 
        />

        {/* Credit-refi general edit route */}
        <Route 
          path="/content/credit-refi/edit/:actionId" 
          element={
            <ErrorBoundary>
              {/* <ProtectedRoute requiredPermission={{ action: 'update', resource: 'content-management' }}> */}
                <AdminLayout title="Редактирование рефинансирования кредита" activeMenuItem="content-credit-refi">
                  <SharedContentEdit />
                </AdminLayout>
              {/* </ProtectedRoute> */}
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
        
        {/* Mortgage-refi dropdown edit route - REDIRECTED TO JSONB ADMIN */}
        <Route 
          path="/content/mortgage-refi/dropdown-edit/:actionId" 
          element={
            <ErrorBoundary>
              <ProtectedRoute requiredPermission={{ action: 'update', resource: 'content-management' }}>
                <JSONBDropdownEdit />
              </ProtectedRoute>
            </ErrorBoundary>
          } 
        />

        {/* Mortgage-refi general edit route */}
        <Route 
          path="/content/mortgage-refi/edit/:actionId" 
          element={
            <ErrorBoundary>
              {/* <ProtectedRoute requiredPermission={{ action: 'update', resource: 'content-management' }}> */}
                <AdminLayout title="Редактирование рефинансирования ипотеки" activeMenuItem="content-mortgage-refi">
                  <SharedContentEdit />
                </AdminLayout>
              {/* </ProtectedRoute> */}
            </ErrorBoundary>
          } 
        />
        
        {/* Menu drill route - specific drill page for menu sections */}
        <Route 
          path="/content/menu/drill/:sectionId" 
          element={
            <ErrorBoundary>
              {/* <ProtectedRoute requiredPermission={{ action: 'read', resource: 'content-management' }}> */}
                <AdminLayout title="Раздел меню" activeMenuItem="content-menu">
                  <MenuDrill />
                </AdminLayout>
              {/* </ProtectedRoute> */}
            </ErrorBoundary>
          } 
        />

        {/* Menu text edit route */}
        <Route 
          path="/content/menu/text-edit/:actionId" 
          element={
            <ErrorBoundary>
              {/* <ProtectedRoute requiredPermission={{ action: 'update', resource: 'content-management' }}> */}
                <AdminLayout title="Редактирование текста меню" activeMenuItem="content-menu">
                  <MenuTextEdit />
                </AdminLayout>
              {/* </ProtectedRoute> */}
            </ErrorBoundary>
          } 
        />
        
        {/* Menu dropdown edit route - Direct to JSONB Edit */}
        <Route 
          path="/content/menu/dropdown-edit/:actionId" 
          element={
            <ErrorBoundary>
              <ProtectedRoute requiredPermission={{ action: 'update', resource: 'content-management' }}>
                <JSONBDropdownEdit />
              </ProtectedRoute>
            </ErrorBoundary>
          } 
        />

        {/* Menu general edit route */}
        <Route 
          path="/content/menu/edit/:actionId" 
          element={
            <ErrorBoundary>
              {/* <ProtectedRoute requiredPermission={{ action: 'update', resource: 'content-management' }}> */}
                <AdminLayout title="Редактирование меню" activeMenuItem="content-menu">
                  <MenuEdit />
                </AdminLayout>
              {/* </ProtectedRoute> */}
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
              {/* <ProtectedRoute requiredPermission={{ action: 'read', resource: 'content-management' }}> */}
                <AdminLayout title="Рефинансирование ипотеки" activeMenuItem="content-mortgage-refi">
                  <ContentMortgageRefi />
                </AdminLayout>
              {/* </ProtectedRoute> */}
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
        {/* Temporarily disabled to prevent redirects during development */}
        {/* <Route path="*" element={<Navigate to="/admin/login" replace />} /> */}
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

export default App // Test frontend change
