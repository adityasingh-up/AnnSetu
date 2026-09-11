import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'annsetu_token';
const USER_KEY = 'annsetu_user';

// In-memory fallback if SecureStore is unavailable
const memoryStorage = new Map();

const isSecureStoreAvailable = async () => {
  if (Platform.OS === 'web') return false;
  try {
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
  }
};

export const storage = {
  async setToken(token) {
    try {
      const available = await isSecureStoreAvailable();
      if (available) {
        await SecureStore.setItemAsync(TOKEN_KEY, token);
      } else if (typeof localStorage !== 'undefined') {
        localStorage.setItem(TOKEN_KEY, token);
      } else {
        memoryStorage.set(TOKEN_KEY, token);
      }
    } catch {
      memoryStorage.set(TOKEN_KEY, token);
    }
  },

  async getToken() {
    try {
      const available = await isSecureStoreAvailable();
      if (available) {
        return await SecureStore.getItemAsync(TOKEN_KEY);
      } else if (typeof localStorage !== 'undefined') {
        return localStorage.getItem(TOKEN_KEY);
      } else {
        return memoryStorage.get(TOKEN_KEY) || null;
      }
    } catch {
      return memoryStorage.get(TOKEN_KEY) || null;
    }
  },

  async removeToken() {
    try {
      const available = await isSecureStoreAvailable();
      if (available) {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
      } else if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(TOKEN_KEY);
      }
      memoryStorage.delete(TOKEN_KEY);
    } catch {
      memoryStorage.delete(TOKEN_KEY);
    }
  },

  async setUser(user) {
    const serialized = JSON.stringify(user);
    try {
      const available = await isSecureStoreAvailable();
      if (available) {
        await SecureStore.setItemAsync(USER_KEY, serialized);
      } else if (typeof localStorage !== 'undefined') {
        localStorage.setItem(USER_KEY, serialized);
      } else {
        memoryStorage.set(USER_KEY, serialized);
      }
    } catch {
      memoryStorage.set(USER_KEY, serialized);
    }
  },

  async getUser() {
    try {
      let val = null;
      const available = await isSecureStoreAvailable();
      if (available) {
        val = await SecureStore.getItemAsync(USER_KEY);
      } else if (typeof localStorage !== 'undefined') {
        val = localStorage.getItem(USER_KEY);
      } else {
        val = memoryStorage.get(USER_KEY);
      }
      return val ? JSON.parse(val) : null;
    } catch {
      const val = memoryStorage.get(USER_KEY);
      return val ? JSON.parse(val) : null;
    }
  },

  async removeUser() {
    try {
      const available = await isSecureStoreAvailable();
      if (available) {
        await SecureStore.deleteItemAsync(USER_KEY);
      } else if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(USER_KEY);
      }
      memoryStorage.delete(USER_KEY);
    } catch {
      memoryStorage.delete(USER_KEY);
    }
  },

  async clear() {
    await this.removeToken();
    await this.removeUser();
    memoryStorage.clear();
  },
};

