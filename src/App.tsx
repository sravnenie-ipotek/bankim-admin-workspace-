import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import './App.css'

// Import the QA Showcase component
import BankEmployee from './pages/BankEmployee'

// Role components
const SalesManager = () => (
  <div className="role-page">
    <h1>Для Менеджера по продажам</h1>
    <p>Sales Manager Management Interface - In Development</p>
    <p><Link to="/bank-employee">Go to Components Test Page</Link></p>
  </div>
)

const Administration = () => (
  <div className="role-page">
    <h1>Для Администрации</h1>
    <p>Administration Management Interface - In Development</p>
    <p><Link to="/bank-employee">Go to Components Test Page</Link></p>
  </div>
)

const Brokers = () => (
  <div className="role-page">
    <h1>Для Брокеров</h1>
    <p>Brokers Management Interface - In Development</p>
    <p><Link to="/bank-employee">Go to Components Test Page</Link></p>
  </div>
)

const ContentManager = () => (
  <div className="role-page">
    <h1>Для Контент-менеджера</h1>
    <p>Content Manager Interface - In Development</p>
    <p><Link to="/bank-employee">Go to Components Test Page</Link></p>
  </div>
)

const Director = () => (
  <div className="role-page">
    <h1>Для Директора</h1>
    <p>Director Management Interface - In Development</p>
    <p><Link to="/bank-employee">Go to Components Test Page</Link></p>
  </div>
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