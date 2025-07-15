import React from 'react';
import { useAuth, UserRole } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  requiredPermission?: {
    action: string;
    resource: string;
  };
  fallback?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  requiredPermission,
  fallback
}) => {
  const { user, hasPermission, isRole } = useAuth();

  // If no user is logged in
  if (!user) {
    return (
      <div className="access-denied">
        <div className="error-card">
          <h2>🔐 Требуется авторизация</h2>
          <p>Пожалуйста, войдите в систему для доступа к этой странице.</p>
        </div>
      </div>
    );
  }

  // Check role requirement
  if (requiredRole && !isRole(requiredRole)) {
    return fallback || (
      <div className="access-denied">
        <div className="error-card">
          <h2>🚫 Доступ запрещен</h2>
          <p>У вас недостаточно прав для доступа к этой странице.</p>
          <div className="access-info">
            <p><strong>Ваша роль:</strong> {getRoleDisplayName(user.role)}</p>
            <p><strong>Требуемая роль:</strong> {getRoleDisplayName(requiredRole)}</p>
          </div>
        </div>
      </div>
    );
  }

  // Check permission requirement
  if (requiredPermission && !hasPermission(requiredPermission.action, requiredPermission.resource)) {
    return fallback || (
      <div className="access-denied">
        <div className="error-card">
          <h2>🚫 Недостаточно прав</h2>
          <p>У вас нет разрешения на выполнение этого действия.</p>
          <div className="access-info">
            <p><strong>Требуемое разрешение:</strong> {requiredPermission.action} для {requiredPermission.resource}</p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// Helper function to get display names for roles
const getRoleDisplayName = (role: UserRole): string => {
  const roleNames: Record<UserRole, string> = {
    'director': 'Директор',
    'administration': 'Администратор',
    'sales-manager': 'Менеджер по продажам',
    'content-manager': 'Контент-менеджер',
    'brokers': 'Брокер',
    'bank-employee': 'Сотрудник банка'
  };
  return roleNames[role] || role;
};

export default ProtectedRoute; 