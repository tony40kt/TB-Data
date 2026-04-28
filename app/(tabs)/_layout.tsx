import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { initDb } from '../../db/init';
import { TAB_CONFIG } from '../../navigation/tabs';

type DbStatus = 'loading' | 'ready' | 'error';

export default function TabsLayout() {
  const [status, setStatus] = useState<DbStatus>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const run = async () => {
      await Promise.resolve(); // yield to React so 'loading' renders first
      try {
        initDb();
        setStatus('ready');
      } catch (err: unknown) {
        setErrorMsg(err instanceof Error ? err.message : String(err));
        setStatus('error');
      }
    };
    run();
  }, []);

  if (status === 'loading') {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.text}>資料庫初始化中…</Text>
      </View>
    );
  }

  if (status === 'error') {
    return (
      <View style={styles.center}>
        <Text style={styles.icon}>❌</Text>
        <Text style={styles.title}>初始化失敗</Text>
        <Text style={styles.text}>{errorMsg}</Text>
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: { backgroundColor: '#FFFFFF' },
      }}
    >
      {TAB_CONFIG.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            headerTitle: tab.headerTitle,
            tabBarLabel: tab.title,
            tabBarIcon: ({ color }) => (
              <Text style={{ fontSize: 18, color }}>{tab.icon}</Text>
            ),
          }}
        />
      ))}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    gap: 12,
  },
  icon: {
    fontSize: 48,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  text: {
    fontSize: 16,
    color: '#475569',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
});
