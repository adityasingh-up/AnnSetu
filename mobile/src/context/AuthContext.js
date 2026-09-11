import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';
import { storage } from '../utils/storage';
import { DEMO_USERS } from '../utils/mockData';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount: restore session from storage (strictly filter out any legacy mock sessions)
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const savedToken = await storage.getToken();
        const savedUser = await storage.getUser();
        if (
          savedToken &&
          savedUser &&
          !savedToken.startsWith('demo_') &&
          !savedToken.startsWith('jwt_mock_') &&
          !savedUser._id?.startsWith('mock_')
        ) {
          setToken(savedToken);
          setUser(savedUser);
        } else if (savedToken || savedUser) {
          // Clear legacy mock session so unauthenticated state is clean
          await storage.clear();
          setToken(null);
          setUser(null);
        }
      } catch (e) {
        console.warn('Session restore error:', e);
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  const login = async (credentials) => {
    const res = await authApi.login(credentials);
    const userData = res?.data?.user || res?.data;
    const jwt = res?.data?.token || 'jwt_token';
    setUser(userData);
    setToken(jwt);
    await storage.setToken(jwt);
    await storage.setUser(userData);
    return userData;
  };

  const register = async (data) => {
    const res = await authApi.register(data);
    const payload = res?.data || {};
    const userData = payload.user || payload;
    const jwt = payload.token || `jwt_${Date.now()}`;
    const demoOTP = payload.demoOTP || '123456';
    return { userData, token: jwt, demoOTP };
  };

  const verifyOTPAndLogin = async ({ email, otp, pendingUser, token: passedToken }) => {
    await authApi.verifyOTP({ email, otp });
    const jwt = passedToken || `jwt_${Date.now()}`;
    const finalUser = pendingUser || {
      _id: `user_${Date.now()}`,
      name: email.split('@')[0],
      email: email,
      role: 'donor',
      isEmailVerified: true,
    };
    setUser(finalUser);
    setToken(jwt);
    await storage.setToken(jwt);
    await storage.setUser(finalUser);
    return finalUser;
  };

  const quickLogin = async (role = 'donor') => {
    const demoUser = DEMO_USERS[role] || DEMO_USERS.donor;
    const jwt = `demo_token_${role}_${Date.now()}`;
    setUser(demoUser);
    setToken(jwt);
    await storage.setToken(jwt);
    await storage.setUser(demoUser);
    return demoUser;
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await authApi.updateProfile(profileData);
      const updated = res?.data || { ...user, ...profileData };
      setUser(updated);
      await storage.setUser(updated);
      return updated;
    } catch {
      const updated = { ...user, ...profileData };
      setUser(updated);
      await storage.setUser(updated);
      return updated;
    }
  };

  const forgotPassword = async (data) => {
    try {
      return await authApi.forgotPassword(data);
    } catch (err) {
      throw err; // Propagate error so UI can show correct message
    }
  };

  const resetPassword = async (data) => {
    try {
      return await authApi.resetPassword(data);
    } catch (err) {
      throw err; // Propagate error so UI can show OTP/validation errors
    }
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    await storage.clear();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        verifyOTPAndLogin,
        quickLogin,
        updateProfile,
        forgotPassword,
        resetPassword,
        logout,
        authApi,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};

