import React, { createContext, useContext, useState, ReactNode } from 'react';

interface NavigationState {
  currentSubmenu: string | null;
  submenuLabel: string | null;
}

interface NavigationContextType {
  navigationState: NavigationState;
  setCurrentSubmenu: (submenuId: string | null, label: string | null) => void;
  clearSubmenu: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

interface NavigationProviderProps {
  children: ReactNode;
}

export const NavigationProvider: React.FC<NavigationProviderProps> = ({ children }) => {
  const [navigationState, setNavigationState] = useState<NavigationState>({
    currentSubmenu: null,
    submenuLabel: null
  });

  const setCurrentSubmenu = (submenuId: string | null, label: string | null) => {
    setNavigationState({
      currentSubmenu: submenuId,
      submenuLabel: label
    });
  };

  const clearSubmenu = () => {
    setNavigationState({
      currentSubmenu: null,
      submenuLabel: null
    });
  };

  return (
    <NavigationContext.Provider value={{
      navigationState,
      setCurrentSubmenu,
      clearSubmenu
    }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = (): NavigationContextType => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}; 