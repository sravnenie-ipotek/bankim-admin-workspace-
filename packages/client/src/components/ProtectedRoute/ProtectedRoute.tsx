import React from 'react';
import { useAuth, UserRole } from '../../contexts/AuthContext';
import AdminLogin from '../AdminLogin/AdminLogin';

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
  const { user, loading, hasPermission, isRole } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        🔄 Загрузка...
      </div>
    );
  }

  // User not authenticated - show login
  if (!user) {
    return fallback || <AdminLogin />;
  }

  // Check role requirement
  if (requiredRole && !isRole(requiredRole)) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: '#e74c3c'
      }}>
        <div>🚫 Недостаточно прав доступа</div>
        <div style={{ fontSize: '14px', marginTop: '10px', color: '#666' }}>
          Требуется роль: {getRoleDisplayName(requiredRole)}
        </div>
        <div style={{ fontSize: '14px', color: '#666' }}>
          Ваша роль: {getRoleDisplayName(user.role)}
        </div>
      </div>
    );
  }

  // Check permission requirement
  if (requiredPermission && !hasPermission(requiredPermission.action, requiredPermission.resource)) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: '#e74c3c'
      }}>
        <div>🚫 Недостаточно прав доступа</div>
        <div style={{ fontSize: '14px', marginTop: '10px', color: '#666' }}>
          Требуется разрешение: {requiredPermission.action} на {requiredPermission.resource}
        </div>
      </div>
    );
  }

  // User is authenticated and authorized
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