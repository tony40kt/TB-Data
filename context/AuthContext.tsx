import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CURRENT_EMAIL_KEY = 'tbdata.currentEmail';

type AuthContextValue = {
  currentEmail: string | null;
  isAuthLoading: boolean;
  setCurrentEmail: (email: string | null) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  currentEmail: null,
  isAuthLoading: true,
  setCurrentEmail: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentEmail, setCurrentEmailState] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(CURRENT_EMAIL_KEY)
      .then((stored) => {
        setCurrentEmailState(stored ?? null);
      })
      .catch((e) => {
        console.warn('[AuthContext] Failed to read currentEmail:', e);
      })
      .finally(() => {
        setIsAuthLoading(false);
      });
  }, []);

  async function setCurrentEmail(email: string | null) {
    setCurrentEmailState(email);
    try {
      if (email === null) {
        await AsyncStorage.removeItem(CURRENT_EMAIL_KEY);
      } else {
        await AsyncStorage.setItem(CURRENT_EMAIL_KEY, email);
      }
    } catch (e) {
      console.warn('[AuthContext] Failed to persist currentEmail:', e);
    }
  }

  return (
    <AuthContext.Provider value={{ currentEmail, isAuthLoading, setCurrentEmail }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
