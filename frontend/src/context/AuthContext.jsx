import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('annsetu_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('annsetu_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await authService.getMe();
          if (res.data) {
            setUser(res.data);
            localStorage.setItem('annsetu_user', JSON.stringify(res.data));
          }
        } catch (err) {
          logout();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, [token]);

  const login = async (credentials) => {
    const res = await authService.login(credentials);
    const { user: userData, token: jwtToken } = res.data;
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem('annsetu_token', jwtToken);
    localStorage.setItem('annsetu_user', JSON.stringify(userData));
    return userData;
  };

  const register = async (data) => {
    const res = await authService.register(data);
    const { user: userData, token: jwtToken } = res.data;
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem('annsetu_token', jwtToken);
    localStorage.setItem('annsetu_user', JSON.stringify(userData));
    return userData;
  };

  const updateProfile = async (profileData) => {
    const res = await authService.updateProfile(profileData);
    const updatedUser = res.data;
    setUser(updatedUser);
    localStorage.setItem('annsetu_user', JSON.stringify(updatedUser));
    return updatedUser;
  };

  const setUserFromData = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem('annsetu_token', jwtToken);
    localStorage.setItem('annsetu_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('annsetu_token');
    localStorage.removeItem('annsetu_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, updateProfile, logout, setUserFromData, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
