import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';

export type Role = 'admin' | 'user' | 'guest';

const ROLE_MAP_KEY = 'tbdata.roleMap';
const KNOWN_EMAILS_KEY = 'tbdata.knownEmails';
const DEFAULT_ROLE: Role = 'guest';

export type RoleMap = Record<string, Role>;

const VALID_ROLES: Role[] = ['admin', 'user', 'guest'];

function isValidRole(value: string): value is Role {
  return (VALID_ROLES as string[]).includes(value);
}

type RoleContextValue = {
  role: Role;
  setRole: (role: Role) => Promise<void>;
  roleMap: RoleMap;
  knownEmails: string[];
  isLoading: boolean;
};

const RoleContext = createContext<RoleContextValue>({
  role: DEFAULT_ROLE,
  setRole: async () => {},
  roleMap: {},
  knownEmails: [],
  isLoading: true,
});

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const { currentEmail, isAuthLoading } = useAuth();

  const [role, setRoleState] = useState<Role>(DEFAULT_ROLE);
  const [roleMap, setRoleMap] = useState<RoleMap>({});
  const [knownEmails, setKnownEmails] = useState<string[]>([]);
  const [isRoleMapLoaded, setIsRoleMapLoaded] = useState(false);

  // Use refs so the email-change effect always sees the latest values
  // without needing them in its dependency array (avoids infinite loops).
  const roleMapRef = useRef<RoleMap>({});
  const knownEmailsRef = useRef<string[]>([]);

  // Load roleMap + knownEmails from AsyncStorage once on mount.
  useEffect(() => {
    async function loadStorage() {
      try {
        const [mapJson, emailsJson] = await Promise.all([
          AsyncStorage.getItem(ROLE_MAP_KEY),
          AsyncStorage.getItem(KNOWN_EMAILS_KEY),
        ]);
        const map: RoleMap = mapJson ? (JSON.parse(mapJson) as RoleMap) : {};
        const emails: string[] = emailsJson ? (JSON.parse(emailsJson) as string[]) : [];
        roleMapRef.current = map;
        knownEmailsRef.current = emails;
        setRoleMap(map);
        setKnownEmails(emails);
      } catch (e) {
        console.warn('[RoleContext] Failed to load roleMap/knownEmails:', e);
      } finally {
        setIsRoleMapLoaded(true);
      }
    }
    loadStorage();
  }, []);

  // Apply role whenever currentEmail changes (or when storage finishes loading).
  // - currentEmail === null  → guest
  // - email in roleMap       → use stored role
  // - email not in roleMap   → initialize as 'user', persist, add to knownEmails
  useEffect(() => {
    if (!isRoleMapLoaded || isAuthLoading) return;

    if (currentEmail === null) {
      setRoleState('guest');
      return;
    }

    const map = { ...roleMapRef.current };
    const emails = [...knownEmailsRef.current];
    let mapChanged = false;
    let emailsChanged = false;

    if (!isValidRole(map[currentEmail])) {
      // New email — default to 'user'
      map[currentEmail] = 'user';
      mapChanged = true;
    }

    if (!emails.includes(currentEmail)) {
      emails.push(currentEmail);
      emailsChanged = true;
    }

    setRoleState(map[currentEmail]);

    if (mapChanged) {
      roleMapRef.current = map;
      setRoleMap(map);
      AsyncStorage.setItem(ROLE_MAP_KEY, JSON.stringify(map)).catch((e) => {
        console.warn('[RoleContext] Failed to save roleMap:', e);
      });
    }

    if (emailsChanged) {
      knownEmailsRef.current = emails;
      setKnownEmails(emails);
      AsyncStorage.setItem(KNOWN_EMAILS_KEY, JSON.stringify(emails)).catch((e) => {
        console.warn('[RoleContext] Failed to save knownEmails:', e);
      });
    }
  }, [currentEmail, isAuthLoading, isRoleMapLoaded]);

  // setRole — updates both the live role state and the persisted roleMap entry
  // for the currently logged-in email. When no email is set (guest), only the
  // live state is updated (no persistent mapping to store).
  async function setRole(newRole: Role) {
    setRoleState(newRole);

    if (currentEmail !== null) {
      const newMap = { ...roleMapRef.current, [currentEmail]: newRole };
      roleMapRef.current = newMap;
      setRoleMap(newMap);
      try {
        await AsyncStorage.setItem(ROLE_MAP_KEY, JSON.stringify(newMap));
      } catch (e) {
        console.warn('[RoleContext] Failed to save roleMap:', e);
      }
    }
  }

  const isLoading = isAuthLoading || !isRoleMapLoaded;

  return (
    <RoleContext.Provider value={{ role, setRole, roleMap, knownEmails, isLoading }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole(): RoleContextValue {
  return useContext(RoleContext);
}
