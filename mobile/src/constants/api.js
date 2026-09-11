import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Dynamically determine the backend host for Android Emulator, iOS, physical phone (Expo Go), and Web
const getBaseHost = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:5000';
  }

  // 1. Try to read dynamic IP from Expo connection to Laptop (works on any Wi-Fi automatically)
  const hostUri = Constants.expoConfig?.hostUri || Constants.manifest2?.extra?.expoClient?.hostUri || Constants.manifest?.debuggerHost;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
      return `http://${ip}:5000`;
    }
  }

  // 2. Default fallback to current local Wi-Fi IP
  return 'http://10.132.122.31:5000';
};

export const HOST = getBaseHost();
export const BASE_URL = `${HOST}/api/v1`;
export const SOCKET_URL = HOST;

