import React from 'react';
import { UserRole } from '../../contexts/AuthContext';

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
  children
  // requiredRole,
  // requiredPermission,
  // fallback
}) => {
  // TEMPORARILY DISABLED: Authentication checks
  // TODO: Re-enable authentication when needed
  console.log('🔓 TEMPORARILY DISABLED: Authentication bypassed for development');
  
  // Always return children - no authentication required
  return <>{children}</>;
};

// Helper function to get display names for roles
// const getRoleDisplayName = (role: UserRole): string => {
//   const roleNames: Record<UserRole, string> = {
//     'director': 'Директор',
//     'administration': 'Администратор',
//     'sales-manager': 'Менеджер по продажам',
//     'content-manager': 'Контент-менеджер',
//     'brokers': 'Брокер',
//     'bank-employee': 'Сотрудник банка'
//   };
//   return roleNames[role] || role;
// };

export default ProtectedRoute; 