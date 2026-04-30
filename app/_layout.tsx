import { Stack } from 'expo-router';
import { AuthProvider } from '../context/AuthContext';
import { RoleProvider } from '../context/RoleContext';

export default function RootLayout() {
  return (
    <AuthProvider>
    <RoleProvider>
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="logs/index"
        options={{
          title: '日誌列表',
          headerBackTitle: '返回',
        }}
      />
      <Stack.Screen
        name="logs/[id]/index"
        options={{
          title: '日誌詳情',
          headerBackTitle: '返回',
        }}
      />
      <Stack.Screen
        name="logs/[id]/edit"
        options={{
          title: '編輯日誌',
          headerBackTitle: '返回',
        }}
      />
    </Stack>
    </RoleProvider>
    </AuthProvider>
  );
}
