import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

type User = {
  id_usu: string;
  nombre?: string;
  correo?: string;
  [key: string]: any;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (user: User) => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (u: User | null) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const STORAGE_KEY = '@app_auth_user_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          setUser(JSON.parse(raw));
        }
      } catch (err) {
        console.warn('Failed to load auth from storage', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const persist = async (u: User | null) => {
    try {
      if (u) {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      } else {
        await AsyncStorage.removeItem(STORAGE_KEY);
      }
    } catch (err) {
      console.warn('Failed to persist auth', err);
    }
  };

  const signIn = async (u: User) => {
    setUser(u);
    await persist(u);
  };

  const signOut = async () => {
    setUser(null);
    await persist(null);
  };

  return <AuthContext.Provider value={{ user, loading, signIn, signOut, setUser }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
