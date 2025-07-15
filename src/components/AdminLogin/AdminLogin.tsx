import React, { useState } from 'react';
import { useAuth, UserRole } from '../../contexts/AuthContext';
import './AdminLogin.css';

const AdminLogin: React.FC = () => {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('director');
  const [error, setError] = useState('');

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
    { value: 'director', label: '👑 Директор' },
    { value: 'administration', label: '⚙️ Администратор' },
    { value: 'sales-manager', label: '📊 Менеджер по продажам' },
    { value: 'content-manager', label: '📝 Контент-менеджер' },
    { value: 'brokers', label: '🤝 Брокер' },
    { value: 'bank-employee', label: '🏦 Сотрудник банка' }
  ];

  return (
    <div className="admin-login">
      <div className="login-container">
        <div className="login-header">
          <h1>🏦 BankIM Admin Portal</h1>
          <p>Выберите роль для тестирования прав доступа</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@bankim.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Пароль:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">Роль:</label>
            <select
              id="role"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as UserRole)}
            >
              {roles.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="error-message">
              ❌ {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="login-btn">
            {loading ? 'Вход...' : 'Войти в систему'}
          </button>
        </form>

        <div className="demo-note">
          <h3>🧪 Демо-режим</h3>
          <p>Для тестирования калькулятора формул:</p>
          <ul>
            <li><strong>Директор:</strong> Полный доступ к редактированию</li>
            <li><strong>Другие роли:</strong> Только просмотр</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin; 