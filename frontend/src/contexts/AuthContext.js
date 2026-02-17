import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('quiz_token'));
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await axios.get(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data);
    } catch (err) {
      console.error('Auth check failed:', err);
      localStorage.removeItem('quiz_token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const loginWithSpotify = async () => {
    try {
      const res = await axios.get(`${API}/auth/spotify-login`);
      window.location.href = res.data.auth_url;
    } catch (err) {
      console.error('Failed to get Spotify auth URL:', err);
    }
  };

  const handleCallback = async (code) => {
    try {
      const res = await axios.post(`${API}/auth/spotify-callback`, { code });
      const { token: newToken, user: userData } = res.data;
      localStorage.setItem('quiz_token', newToken);
      setToken(newToken);
      setUser(userData);
      return true;
    } catch (err) {
      console.error('Spotify callback failed:', err);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('quiz_token');
    setToken(null);
    setUser(null);
  };

  const authAxios = axios.create({
    baseURL: API,
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });

  return (
    <AuthContext.Provider value={{
      user, token, loading, loginWithSpotify, handleCallback, logout, authAxios, fetchUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
