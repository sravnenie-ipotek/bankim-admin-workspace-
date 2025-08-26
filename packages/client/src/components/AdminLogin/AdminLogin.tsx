import React, { useState } from 'react';
import { useAuth, UserRole } from '../../contexts/AuthContext';
import logoSvg from '../../assets/images/logo/primary-logo05-1.svg';
import './AdminLogin.css';

const AdminLogin: React.FC = () => {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('admin@bankim.com');
  const [password, setPassword] = useState('admin123');
  const [selectedRole, setSelectedRole] = useState<UserRole>('director');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('ru');

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
          <img src={logoSvg} alt="BankIM Logo" className="logo-image" />
        </div>
        <div className="language-selector">
          <select 
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="language-dropdown"
          >
            <option value="ru">Русский</option>
            <option value="he">עברית</option>
            <option value="en">English</option>
          </select>
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
              <svg className="input-icon" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
              </svg>
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
              <svg className="input-icon" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
              </svg>
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
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd"/>
                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.742L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                  </svg>
                )}
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
        <img src={logoSvg} alt="BankIM" style={{ height: '2rem' }} />
      </div>
    </div>
  );
};

export default AdminLogin; 