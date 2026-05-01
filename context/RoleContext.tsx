import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  applyEmail: (email: string | null) => Promise<void>;
  roleMap: RoleMap;
  knownEmails: string[];
  isLoading: boolean;
};

const RoleContext = createContext<RoleContextValue>({
  role: DEFAULT_ROLE,
  setRole: async () => {},
  applyEmail: async () => {},
  roleMap: {},
  knownEmails: [],
  isLoading: true,
});

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<Role>(DEFAULT_ROLE);
  const [roleMap, setRoleMap] = useState<RoleMap>({});
  const [knownEmails, setKnownEmails] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Refs so callbacks always see the latest values without stale closures.
  const currentEmailRef = useRef<string | null>(null);
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
        setIsLoading(false);
      }
    }
    loadStorage();
  }, []);

  // Called by AuthContext when the logged-in email changes (login / logout / cold start).
  // - email === null  → guest (roleMap/knownEmails are preserved)
  // - email in roleMap with a valid role → use that stored role
  // - email not in roleMap or invalid  → default to 'user', persist, add to knownEmails
  const applyEmail = useCallback(async (email: string | null) => {
    currentEmailRef.current = email;

    if (email === null) {
      setRoleState('guest');
      return;
    }

    const map = { ...roleMapRef.current };
    const emails = knownEmailsRef.current;
    let mapChanged = false;
    let emailsChanged = false;

    if (!isValidRole(map[email])) {
      map[email] = 'user';
      mapChanged = true;
    }

    if (!emails.includes(email)) {
      emailsChanged = true;
    }

    setRoleState(map[email]);

    if (mapChanged) {
      roleMapRef.current = map;
      setRoleMap(map);
      try {
        await AsyncStorage.setItem(ROLE_MAP_KEY, JSON.stringify(map));
      } catch (e) {
        console.warn('[RoleContext] Failed to save roleMap:', e);
      }
    }

    if (emailsChanged) {
      const newEmails = [...emails, email];
      knownEmailsRef.current = newEmails;
      setKnownEmails(newEmails);
      try {
        await AsyncStorage.setItem(KNOWN_EMAILS_KEY, JSON.stringify(newEmails));
      } catch (e) {
        console.warn('[RoleContext] Failed to save knownEmails:', e);
      }
    }
  }, []);

  // setRole — updates the live role state and, if a user is logged in,
  // persists the new role to roleMap[currentEmail].
  async function setRole(newRole: Role) {
    setRoleState(newRole);

    const email = currentEmailRef.current;
    if (email !== null) {
      const newMap = { ...roleMapRef.current, [email]: newRole };
      roleMapRef.current = newMap;
      setRoleMap(newMap);
      try {
        await AsyncStorage.setItem(ROLE_MAP_KEY, JSON.stringify(newMap));
      } catch (e) {
        console.warn('[RoleContext] Failed to save roleMap:', e);
      }
    }
  }

  return (
    <RoleContext.Provider value={{ role, setRole, applyEmail, roleMap, knownEmails, isLoading }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole(): RoleContextValue {
  return useContext(RoleContext);
}
