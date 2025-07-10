import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import './App.css'

// Import the QA Showcase component
import BankEmployee from './pages/BankEmployee'
import { AdminLayout } from './components'

// Role components with AdminLayout
const SalesManager = () => (
  <AdminLayout title="Менеджер по продажам" userRole="sales-manager">
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
  <AdminLayout title="Администрация" userRole="administration">
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
  <AdminLayout title="Брокеры" userRole="brokers">
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
  <AdminLayout title="Контент-менеджер" userRole="content-manager">
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
  <AdminLayout title="Директор" userRole="director">
    <div className="role-page-content">
      <div className="page-header">
        <h1>👑 Директор</h1>
        <p className="page-subtitle">Исполнительная панель управления и стратегический контроль</p>
      </div>
      
      <div className="development-notice">
        <div className="notice-card">
          <h3>🚧 В разработке</h3>
          <p>Исполнительная панель директора находится в активной разработке</p>
          <ul>
            <li>Стратегические отчеты</li>
            <li>Финансовая аналитика</li>
            <li>Управление подразделениями</li>
            <li>Контроль КПЭ</li>
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
          🧪 Go to Components Test Page
        </Link>
        <p>Interactive testing environment for adminShared/ components</p>
      </div>
    </div>
  </div>
)

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/director" element={<Director />} />
          <Route path="/administration" element={<Administration />} />
          <Route path="/sales-manager" element={<SalesManager />} />
          <Route path="/brokers" element={<Brokers />} />
          <Route path="/content-manager" element={<ContentManager />} />
          <Route path="/bank-employee" element={<BankEmployee />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App 