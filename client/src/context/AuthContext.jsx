import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api.js';

const AuthContext = createContext(null);
const TOKEN_KEY = 'skew_token';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .me(token)
      .then(({ user }) => setUser(user))
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const authenticate = useCallback(({ token, user }) => {
    localStorage.setItem(TOKEN_KEY, token);
    setToken(token);
    setUser(user);
  }, []);

  const signup = useCallback(
    async (body) => authenticate(await api.signup(body)),
    [authenticate]
  );

  const login = useCallback(
    async (body) => authenticate(await api.login(body)),
    [authenticate]
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
