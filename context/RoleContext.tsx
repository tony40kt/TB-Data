import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Role = 'admin' | 'user' | 'guest';

const ROLE_KEY = 'tbdata.role';
const DEFAULT_ROLE: Role = 'admin';

const VALID_ROLES: Role[] = ['admin', 'user', 'guest'];

function isValidRole(value: string): value is Role {
  return (VALID_ROLES as string[]).includes(value);
}

type RoleContextValue = {
  role: Role;
  setRole: (role: Role) => Promise<void>;
  isLoading: boolean;
};

const RoleContext = createContext<RoleContextValue>({
  role: DEFAULT_ROLE,
  setRole: async () => {},
  isLoading: true,
});

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<Role>(DEFAULT_ROLE);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(ROLE_KEY)
      .then((stored) => {
        if (stored !== null && isValidRole(stored)) {
          setRoleState(stored);
        }
      })
      .catch((e) => {
        console.warn('[RoleContext] AsyncStorage.getItem failed:', e);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  async function setRole(newRole: Role) {
    setRoleState(newRole);
    try {
      await AsyncStorage.setItem(ROLE_KEY, newRole);
    } catch (e) {
      console.warn('[RoleContext] AsyncStorage.setItem failed - role change will not persist across app restarts:', e);
    }
  }

  return (
    <RoleContext.Provider value={{ role, setRole, isLoading }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole(): RoleContextValue {
  return useContext(RoleContext);
}
