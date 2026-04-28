import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { initDb } from '../db/init';

type DbStatus = 'loading' | 'ready' | 'error';

export default function HomeScreen() {
  const [status, setStatus] = useState<DbStatus>('loading');
  const [errorMsg, setErrorMsg] = useState<string>('');

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

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      {status === 'loading' && (
        <>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.text}>資料庫初始化中…</Text>
        </>
      )}

      {status === 'ready' && (
        <>
          <Text style={styles.icon}>✅</Text>
          <Text style={styles.title}>TB-Data</Text>
          <Text style={styles.text}>資料庫初始化成功</Text>
        </>
      )}

      {status === 'error' && (
        <>
          <Text style={styles.icon}>❌</Text>
          <Text style={styles.title}>初始化失敗</Text>
          <Text style={styles.errorText}>{errorMsg}</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  text: {
    fontSize: 16,
    color: '#475569',
  },
  errorText: {
    fontSize: 14,
    color: '#DC2626',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
});
