import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define user roles and their permissions
export type UserRole = 'director' | 'administration' | 'sales-manager' | 'content-manager' | 'brokers' | 'bank-employee';

export interface Permission {
  action: string;
  resource: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  permissions: Permission[];
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  hasPermission: (action: string, resource: string) => boolean;
  isRole: (role: UserRole) => boolean;
  loading: boolean;
}

// Define role-based permissions
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  director: [
    // Director has all permissions (super-admin)
    { action: 'read', resource: 'calculator-formula' },
    { action: 'write', resource: 'calculator-formula' },
    { action: 'edit', resource: 'calculator-formula' },
    { action: 'delete', resource: 'calculator-formula' },
    { action: 'manage', resource: 'users' },
    { action: 'manage', resource: 'system' },
    { action: 'view', resource: 'audit-logs' },
    { action: 'manage', resource: 'content' },
    { action: 'read', resource: 'content-management' },
    { action: 'write', resource: 'content-management' },
    { action: 'edit', resource: 'content-management' },
    { action: 'delete', resource: 'content-management' },
    { action: 'manage', resource: 'sales' },
    { action: 'manage', resource: 'brokers' }
  ],
  administration: [
    { action: 'read', resource: 'calculator-formula' },
    { action: 'manage', resource: 'users' },
    { action: 'manage', resource: 'system' },
    { action: 'view', resource: 'audit-logs' }
  ],
  'sales-manager': [
    { action: 'read', resource: 'calculator-formula' },
    { action: 'manage', resource: 'sales' },
    { action: 'view', resource: 'clients' }
  ],
  'content-manager': [
    { action: 'read', resource: 'calculator-formula' },
    { action: 'manage', resource: 'content' },
    { action: 'read', resource: 'content-management' },
    { action: 'write', resource: 'content-management' },
    { action: 'manage', resource: 'media' }
  ],
  brokers: [
    { action: 'read', resource: 'calculator-formula' },
    { action: 'view', resource: 'programs' }
  ],
  'bank-employee': [
    { action: 'read', resource: 'calculator-formula' },
    { action: 'view', resource: 'clients' },
    { action: 'manage', resource: 'documents' }
  ]
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('bankIM_admin_user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        
        // Update permissions to latest role definitions (in case roles were updated)
        const updatedUserData = {
          ...userData,
          permissions: ROLE_PERMISSIONS[userData.role as UserRole] || []
        };
        
        setUser(updatedUserData);
        localStorage.setItem('bankIM_admin_user', JSON.stringify(updatedUserData));
      } catch (error) {
        console.error('Failed to parse saved user data:', error);
        localStorage.removeItem('bankIM_admin_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, _password: string, role: UserRole): Promise<boolean> => {
    setLoading(true);
    
    try {
      // Mock authentication - in real app, this would call your API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      const userData: User = {
        id: `user_${Date.now()}`,
        email,
        name: email.split('@')[0], // Extract name from email
        role,
        permissions: ROLE_PERMISSIONS[role] || []
      };

      setUser(userData);
      localStorage.setItem('bankIM_admin_user', JSON.stringify(userData));
      setLoading(false);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      setLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('bankIM_admin_user');
  };

  const hasPermission = (action: string, resource: string): boolean => {
    if (!user) return false;
    
    return user.permissions.some(
      permission => permission.action === action && permission.resource === resource
    );
  };

  const isRole = (role: UserRole): boolean => {
    return user?.role === role;
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    hasPermission,
    isRole,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 