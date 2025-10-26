import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import React, { createContext, useContext, useEffect, useState } from 'react';

export type User = {
  id_usu: number;
  nombre: string;
  apellido: string;
  correo: string;
  telefono?: string | null;
  foto_uri?: string | null; // added
};

type AuthContextType = {
  user: User | null;
  setUser: (u: User | null) => void;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  signOut: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // hydrate from storage
  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem('hm:user');
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed?.foto_uri) {
        try {
          const info = await FileSystem.getInfoAsync(parsed.foto_uri);
          if (!info.exists) parsed.foto_uri = null;
        } catch {}
      }
      setUser(parsed);
    })();
  }, []);

  // persist on change
  useEffect(() => {
    if (user) AsyncStorage.setItem('hm:user', JSON.stringify(user));
    else AsyncStorage.removeItem('hm:user');
  }, [user]);

  const signOut = async () => {
    setUser(null);
    await AsyncStorage.removeItem('hm:user');
  };

  return (
    <AuthContext.Provider value={{ user, setUser, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
