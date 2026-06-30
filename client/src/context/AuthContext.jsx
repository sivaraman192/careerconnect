import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const normalizeUser = (u) => {
  if (!u) return null;
  const userCopy = { ...u };
  if (userCopy.role === 'seeker') {
    userCopy.role = 'jobseeker';
  }
  return userCopy;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkUser = async () => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed) {
          const normalized = normalizeUser(parsed);
          setUser(normalized);
        }
      } catch (e) {
        localStorage.clear();
      }
    }

    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await api.get('/auth/me');
      const u = normalizeUser(res.data.user || res.data);
      setUser(u);
      localStorage.setItem('user', JSON.stringify(u));
    } catch (err) {
      console.error('Session expired or invalid token');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUser();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const u = normalizeUser(res.data.user);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(u));
      setUser(u);
      return u;
    } catch (err) {
      throw err.response?.data?.message || err.message || 'Login failed';
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/register', userData);
      const u = normalizeUser(res.data.user);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(u));
      setUser(u);
      return u;
    } catch (err) {
      throw err.response?.data?.message || err.message || 'Registration failed';
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateProfile = async (formData) => {
    try {
      const res = await api.put('/auth/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      const u = normalizeUser(res.data.user || res.data);
      setUser(u);
      localStorage.setItem('user', JSON.stringify(u));
      return u;
    } catch (err) {
      throw err.response?.data?.message || 'Failed to update profile';
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      register, 
      logout, 
      updateProfile, 
      isAuthenticated: !!user, 
      checkUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
