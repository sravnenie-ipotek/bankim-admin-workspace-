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
    { action: 'update', resource: 'content-management' },
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
    { action: 'update', resource: 'content-management' },
    { action: 'edit', resource: 'content-management' },
    { action: 'manage', resource: 'media' }
  ],
  brokers: [
    { action: 'read', resource: 'calculator-formula' },
    { action: 'view', resource: 'programs' }
  ],
  'bank-employee': [
    { action: 'read', resource: 'calculator-formula' },
    { action: 'view', resource: 'clients' },
    { action: 'manage', resource: 'documents' },
    { action: 'read', resource: 'content-management' },
    { action: 'write', resource: 'content-management' },
    { action: 'update', resource: 'content-management' },
    { action: 'edit', resource: 'content-management' }
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

// API base URL - use proxy in development, environment URL in production
// Use environment variable or default to relative URL (production uses same server)
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Map database roles to frontend roles
const mapDatabaseRoleToFrontendRole = (dbRole: string): UserRole => {
  const roleMap: Record<string, UserRole> = {
    'super_admin': 'director',
    'content_manager': 'content-manager',
    'administration': 'administration',
    'sales-manager': 'sales-manager',
    'brokers': 'brokers',
    'bank-employee': 'bank-employee'
  };
  
  return roleMap[dbRole] || 'content-manager'; // Default to content-manager if unknown
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Local storage helpers
  const saveUserToStorage = (userData: User) => {
    try {
      localStorage.setItem('bankIM_admin_user', JSON.stringify(userData));
      localStorage.setItem('bankIM_admin_timestamp', Date.now().toString());
    } catch (error) {
      console.warn('Failed to save user to localStorage:', error);
    }
  };

  const getUserFromStorage = (): User | null => {
    try {
      const userData = localStorage.getItem('bankIM_admin_user');
      const timestamp = localStorage.getItem('bankIM_admin_timestamp');
      
      if (!userData || !timestamp) return null;
      
      // Check if session is less than 24 hours old
      const sessionAge = Date.now() - parseInt(timestamp);
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      
      if (sessionAge > maxAge) {
        // Session expired, clear storage
        localStorage.removeItem('bankIM_admin_user');
        localStorage.removeItem('bankIM_admin_timestamp');
        return null;
      }
      
      return JSON.parse(userData);
    } catch (error) {
      console.warn('Failed to get user from localStorage:', error);
      return null;
    }
  };

  const clearUserFromStorage = () => {
    try {
      localStorage.removeItem('bankIM_admin_user');
      localStorage.removeItem('bankIM_admin_timestamp');
    } catch (error) {
      console.warn('Failed to clear user from localStorage:', error);
    }
  };

  // Check for existing session on app load
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // First, try to get user from localStorage (immediate restore)
        const storedUser = getUserFromStorage();
        if (storedUser) {
          setUser(storedUser);
          setLoading(false);
          
          // Validate session with server in background
          try {
            const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
              credentials: 'include'
            });
            
            if (!response.ok) {
              // Server session invalid, clear local storage and reset user
              console.log('Server session invalid, clearing local session');
              clearUserFromStorage();
              setUser(null);
            }
          } catch (error) {
            console.warn('Background session validation failed:', error);
            // Keep local session since server might be unreachable
          }
          return;
        }

        // No stored user, check server session
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data && data.data.user) {
            const mappedRole = mapDatabaseRoleToFrontendRole(data.data.user.role);
            const userData: User = {
              id: data.data.user.id,
              email: data.data.user.email,
              name: data.data.user.name,
              role: mappedRole,
              permissions: ROLE_PERMISSIONS[mappedRole] || []
            };
            setUser(userData);
            saveUserToStorage(userData);
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string, _role: UserRole): Promise<boolean> => {
    setLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        const mappedRole = mapDatabaseRoleToFrontendRole(data.data.user.role);
        const userData: User = {
          id: data.data.user.id,
          email: data.data.user.email,
          name: data.data.user.name,
          role: mappedRole,
          permissions: ROLE_PERMISSIONS[mappedRole] || []
        };

        setUser(userData);
        saveUserToStorage(userData);
        setLoading(false);
        return true;
      } else {
        console.error('Login failed:', data.error);
        setLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Login failed:', error);
      setLoading(false);
      return false;
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      clearUserFromStorage();
    }
  };

  const hasPermission = (action: string, resource: string): boolean => {
    if (!user || !user.permissions) {
      return false;
    }
    
    return user.permissions.some(permission => 
      permission.action === action && permission.resource === resource
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