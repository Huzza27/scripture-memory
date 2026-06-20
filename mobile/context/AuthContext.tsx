import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import bibleApi from '../api/bibleApi';

// SecureStore is native-only; fall back to AsyncStorage on web
const storage = {
  async get(key: string): Promise<string | null> {
    if (Platform.OS === 'web') return AsyncStorage.getItem(key);
    return SecureStore.getItemAsync(key);
  },
  async set(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') { await AsyncStorage.setItem(key, value); return; }
    await SecureStore.setItemAsync(key, value);
  },
  async del(key: string): Promise<void> {
    if (Platform.OS === 'web') { await AsyncStorage.removeItem(key); return; }
    await SecureStore.deleteItemAsync(key);
  },
};

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export interface AuthUser {
  id: number;
  email: string;
  username: string;
  bio: string;
  created_at?: string;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  loading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (username: string, bio: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ token: null, user: null, loading: true });

  useEffect(() => {
    (async () => {
      try {
        const [token, userJson] = await Promise.all([
          storage.get(TOKEN_KEY),
          storage.get(USER_KEY),
        ]);
        if (token && userJson) {
          setState({ token, user: JSON.parse(userJson), loading: false });
        } else {
          setState(s => ({ ...s, loading: false }));
        }
      } catch {
        setState(s => ({ ...s, loading: false }));
      }
    })();
  }, []);

  async function persist(token: string, user: AuthUser) {
    await Promise.all([
      storage.set(TOKEN_KEY, token),
      storage.set(USER_KEY, JSON.stringify(user)),
    ]);
    setState({ token, user, loading: false });
  }

  async function login(email: string, password: string) {
    const { token, user } = await bibleApi.login(email, password);
    await persist(token, user);
  }

  async function register(email: string, password: string, username: string) {
    const { token, user } = await bibleApi.register(email, password, username);
    await persist(token, user);
  }

  async function logout() {
    await Promise.all([
      storage.del(TOKEN_KEY),
      storage.del(USER_KEY),
    ]);
    setState({ token: null, user: null, loading: false });
  }

  async function updateProfile(username: string, bio: string) {
    const updated = await bibleApi.updateProfile(username, bio);
    const newUser: AuthUser = { ...state.user!, ...updated };
    await storage.set(USER_KEY, JSON.stringify(newUser));
    setState(s => ({ ...s, user: newUser }));
  }

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
