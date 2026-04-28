import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
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
        name="logs/[id]"
        options={{
          title: '日誌詳情',
          headerBackTitle: '返回',
        }}
      />
    </Stack>
  );
}
