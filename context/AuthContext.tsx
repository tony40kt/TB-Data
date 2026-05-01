import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useRole } from './RoleContext';

// 允許 Expo Go 關閉 OAuth popup 後自動返回
WebBrowser.maybeCompleteAuthSession();

const CURRENT_EMAIL_KEY = 'tbdata.currentEmail';

// 請在 Google Cloud Console 建立 OAuth 憑證後填入：
// https://console.cloud.google.com/apis/credentials
const GOOGLE_IOS_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? '';
const GOOGLE_WEB_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '';

type AuthContextValue = {
  currentEmail: string | null;
  isAuthLoading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  currentEmail: null,
  isAuthLoading: true,
  signIn: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { applyEmail } = useRole();
  const [currentEmail, setCurrentEmail] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    webClientId: GOOGLE_WEB_CLIENT_ID,
  });

  // Persist the email and apply the correct role from roleMap (#37 spec).
  const persistEmail = useCallback(async (email: string) => {
    try {
      await AsyncStorage.setItem(CURRENT_EMAIL_KEY, email);
      setCurrentEmail(email);
      await applyEmail(email);
    } catch (e) {
      console.warn('[AuthContext] AsyncStorage.setItem failed:', e);
    }
  }, [applyEmail]);

  const fetchGoogleUser = useCallback(async (accessToken: string) => {
    try {
      const res = await fetch(
        'https://www.googleapis.com/userinfo/v2/me',
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const user = await res.json();
      const email: string = user.email;
      if (email) {
        await persistEmail(email);
      }
    } catch (e) {
      console.warn('[AuthContext] fetchGoogleUser failed:', e);
    }
  }, [persistEmail]);

  // App 啟動時讀取已存的 currentEmail，並透過 applyEmail 從 roleMap 套用正確角色。
  useEffect(() => {
    AsyncStorage.getItem(CURRENT_EMAIL_KEY)
      .then(async (stored) => {
        setCurrentEmail(stored ?? null);
        await applyEmail(stored ?? null);
      })
      .catch((e) => {
        console.warn('[AuthContext] Failed to read currentEmail:', e);
      })
      .finally(() => {
        setIsAuthLoading(false);
      });
  }, [applyEmail]);

  // Gmail OAuth 回應處理
  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      if (authentication?.accessToken) {
        fetchGoogleUser(authentication.accessToken);
      }
    }
  }, [response, fetchGoogleUser]);

  async function signIn() {
    await promptAsync();
  }

  async function signOut() {
    try {
      await AsyncStorage.removeItem(CURRENT_EMAIL_KEY);
      setCurrentEmail(null);
      await applyEmail(null);
    } catch (e) {
      console.warn('[AuthContext] signOut failed:', e);
    }
  }

  return (
    <AuthContext.Provider value={{ currentEmail, isAuthLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
