import React, { createContext, useContext, useState } from 'react';

interface AuthContextType {
  clientId: string;
  setClientId: (id: string) => void;
  clientSecret: string;
  setClientSecret: (secret: string) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
  resetAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Persist credentials in localStorage (web) for OAuth redirect
  React.useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      if (clientId) window.localStorage.setItem('spotify_client_id', clientId);
      if (clientSecret) window.localStorage.setItem('spotify_client_secret', clientSecret);
    }
  }, [clientId, clientSecret]);

  // Restore credentials from localStorage (web) on mount
  React.useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedId = window.localStorage.getItem('spotify_client_id') || '';
      const storedSecret = window.localStorage.getItem('spotify_client_secret') || '';
      if (storedId) setClientId(storedId);
      if (storedSecret) setClientSecret(storedSecret);
    }
  }, []);

  const resetAuth = () => {
    setClientId('');
    setClientSecret('');
    setIsAuthenticated(false);
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem('spotify_client_id');
      window.localStorage.removeItem('spotify_client_secret');
    }
  };

  return (
    <AuthContext.Provider value={{ clientId, setClientId, clientSecret, setClientSecret, isAuthenticated, setIsAuthenticated, resetAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
