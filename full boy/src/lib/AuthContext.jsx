import React, { createContext, useContext } from 'react';

const AuthContext = createContext();

/**
 * Simplified AuthProvider for local running.
 * No authentication required — the app is always considered authenticated.
 */
export const AuthProvider = ({ children }) => {
  const logout = () => {};
  const navigateToLogin = () => {};
  const checkAppState = async () => {};

  return (
    <AuthContext.Provider value={{
      user: { id: 'local', email: 'local@localhost', role: 'admin' },
      isAuthenticated: true,
      isLoadingAuth: false,
      isLoadingPublicSettings: false,
      authError: null,
      appPublicSettings: null,
      logout,
      navigateToLogin,
      checkAppState
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
