import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '../services/backendClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [backendReachable, setBackendReachable] = useState(true);

  const refreshMe = useCallback(async () => {
    try {
      const me = await api.get('/api/auth/me');
      setUser(me);
      setBackendReachable(true);
    } catch (err) {
      setUser(null);
      if (err instanceof TypeError) setBackendReachable(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshMe();
  }, [refreshMe]);

  const register = async (email, password, name) => {
    const created = await api.post('/api/auth/register', { email, password, name });
    await refreshMe();
    return created;
  };

  const login = async (email, password) => {
    const loggedIn = await api.post('/api/auth/login', { email, password });
    await refreshMe();
    return loggedIn;
  };

  const logout = async () => {
    await api.post('/api/auth/logout', {}).catch(() => {});
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, backendReachable, register, login, logout, refreshMe }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
