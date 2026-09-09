import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('simrs_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api.get('/auth/me')
        .then(res => { setUser(res.data); setLoading(false); })
        .catch(() => { logout(); setLoading(false); });
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (nip, password) => {
    const res = await api.post('/auth/login', { nip, password });
    localStorage.setItem('simrs_token', res.data.token);
    localStorage.setItem('simrs_user', JSON.stringify(res.data.practitioner));
    setToken(res.data.token);
    setUser(res.data.practitioner);
    return res.data;
  };

  const register = async (data) => {
    const res = await api.post('/auth/register', data);
    return res.data;
  };

  const logout = () => {
    if (token) { api.post('/auth/logout').catch(() => {}); }
    localStorage.removeItem('simrs_token');
    localStorage.removeItem('simrs_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
