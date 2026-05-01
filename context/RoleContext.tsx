import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Role = 'admin' | 'user' | 'guest';

const CURRENT_EMAIL_KEY = 'tbdata.currentEmail';
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
  const [role, setRoleState] = useState<Role>(DEFAULT_ROLE);
  const [roleMap, setRoleMap] = useState<RoleMap>({});
  const [knownEmails, setKnownEmails] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Ref to track the current email so setRole() can always update the right entry.
  const currentEmailRef = useRef<string | null>(null);
  const roleMapRef = useRef<RoleMap>({});
  const knownEmailsRef = useRef<string[]>([]);

  // On mount: read currentEmail + roleMap + knownEmails from AsyncStorage,
  // then apply the role decision defined in auth-spec.md §3 / §5.
  useEffect(() => {
    async function loadAndApply() {
      try {
        const [emailStored, mapJson, emailsJson] = await Promise.all([
          AsyncStorage.getItem(CURRENT_EMAIL_KEY),
          AsyncStorage.getItem(ROLE_MAP_KEY),
          AsyncStorage.getItem(KNOWN_EMAILS_KEY),
        ]);

        const email: string | null = emailStored ?? null;
        const map: RoleMap = mapJson ? (JSON.parse(mapJson) as RoleMap) : {};
        const emails: string[] = emailsJson ? (JSON.parse(emailsJson) as string[]) : [];

        currentEmailRef.current = email;
        roleMapRef.current = map;
        knownEmailsRef.current = emails;
        setRoleMap(map);
        setKnownEmails(emails);

        if (email === null) {
          setRoleState('guest');
          return;
        }

        let mapChanged = false;
        let emailsChanged = false;

        if (!isValidRole(map[email])) {
          // New email — default to 'user'
          map[email] = 'user';
          mapChanged = true;
        }

        if (!emails.includes(email)) {
          emails.push(email);
          emailsChanged = true;
        }

        setRoleState(map[email]);

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
      } catch (e) {
        console.warn('[RoleContext] Failed to load storage:', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadAndApply();
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
    <RoleContext.Provider value={{ role, setRole, roleMap, knownEmails, isLoading }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole(): RoleContextValue {
  return useContext(RoleContext);
}
