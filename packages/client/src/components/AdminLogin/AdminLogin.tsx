import React, { useState } from 'react';
import { useAuth, UserRole } from '../../contexts/AuthContext';
import './AdminLogin.css';

const AdminLogin: React.FC = () => {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('admin@bankim.com');
  const [password, setPassword] = useState('admin123');
  const [selectedRole, setSelectedRole] = useState<UserRole>('director');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Пожалуйста, заполните все поля');
      return;
    }

    const success = await login(email, password, selectedRole);
    if (!success) {
      setError('Ошибка входа в систему');
    }
  };

  const roles: { value: UserRole; label: string }[] = [
    { value: 'director', label: 'Директор' },
    { value: 'administration', label: 'Администратор' },
    { value: 'sales-manager', label: 'Менеджер по продажам' },
    { value: 'content-manager', label: 'Контент-менеджер' },
    { value: 'brokers', label: 'Брокер' },
    { value: 'bank-employee', label: 'Сотрудник банка' }
  ];

  return (
    <div className="admin-login">
      {/* Header with logo and language */}
      <div className="login-header">
        <div className="logo-container">
          <div className="logo">🏦</div>
        </div>
        <div className="language-selector">
          <span className="language-text">Русский</span>
          <span className="language-icon">🌐</span>
        </div>
      </div>

      {/* Main login form container */}
      <div className="login-container">
        <div className="form-header">
          <h1 className="form-title">Вход</h1>
          <p className="form-subtitle">Войти в аккаунт</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {/* Email field */}
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <div className="input-container">
              <span className="input-icon email-icon">📧</span>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Введите email"
                className="form-input"
                required
              />
            </div>
          </div>

          {/* Position/Role field */}
          <div className="form-group">
            <label htmlFor="role" className="form-label">Должность</label>
            <div className="select-container">
              <select
                id="role"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                className="form-select"
              >
                <option value="" disabled hidden>Выберите должность</option>
                {roles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
              <span className="select-arrow">⌄</span>
            </div>
          </div>

          {/* Password field */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">Введите пароль</label>
            <div className="input-container">
              <span className="input-icon password-icon">🔒</span>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Введите пароль"
                className="form-input"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {error && (
            <div className="error-message">
              ❌ {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="login-btn">
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>
      </div>

      {/* Footer logo */}
      <div className="footer-logo">
        <div className="footer-brand">🏦 BankIM</div>
      </div>
    </div>
  );
};

export default AdminLogin; 