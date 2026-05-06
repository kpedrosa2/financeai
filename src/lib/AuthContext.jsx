import React, { createContext, useState, useContext, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { getToken } from "@/services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [appPublicSettings, setAppPublicSettings] = useState(null);

  useEffect(() => {
    checkUserAuth();
  }, []);

  const checkUserAuth = async () => {
    try {
      setIsLoadingAuth(true);
      setAuthError(null);

      if (!getToken()) {
        setUser(null);
        setIsAuthenticated(false);
        return;
      }

      const currentUser = await base44.auth.me();
      setUser(currentUser);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Falha na autenticação:", error);
      setIsAuthenticated(false);
      setAuthError({ type: "auth_required", message: "Authentication required" });
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const login = async (email, password) => {
    const currentUser = await base44.auth.login({ email, password });
    setUser(currentUser);
    setIsAuthenticated(true);
    return currentUser;
  };

  const register = async (name, email, password) => {
    const currentUser = await base44.auth.register({ name, email, password });
    setUser(currentUser);
    setIsAuthenticated(true);
    return currentUser;
  };

  const logout = (shouldRedirect = true) => {
    setUser(null);
    setIsAuthenticated(false);
    base44.auth.logout(shouldRedirect);
  };

  const navigateToLogin = () => {
    base44.auth.redirectToLogin(window.location.href);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      login,
      register,
      logout,
      navigateToLogin,
      checkAppState: checkUserAuth,
      checkUserAuth,
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
