import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { initDb } from '../db/init';
import { insertLog, getLatestLog, LogRow } from '../db/logs';

type DbStatus = 'loading' | 'ready' | 'error';

/** 測試日誌寫入後的顯示狀態 */
type InsertStatus = 'idle' | 'success' | 'failure';

export default function HomeScreen() {
  const [status, setStatus] = useState<DbStatus>('loading');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const [insertStatus, setInsertStatus] = useState<InsertStatus>('idle');
  const [insertMsg, setInsertMsg] = useState<string>('');
  const [latestLog, setLatestLog] = useState<LogRow | null>(null);

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

  function handleCreateTestLog() {
    if (status !== 'ready') {
      setInsertStatus('failure');
      setInsertMsg('資料庫尚未就緒，請稍候再試。');
      return;
    }
    try {
      const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      const rowId = insertLog({
        record_date: today,
        location: '測試地點',
        machine_no: 'TEST01',
        lift_system: '測試升降機系統',
        fault_code: '999',
        remark: '這是一筆由首頁 debug 按鈕建立的測試日誌',
      });
      const latest = getLatestLog();
      setInsertStatus('success');
      setInsertMsg(`✅ 已新增 1 筆日誌（rowId = ${rowId}）`);
      setLatestLog(latest);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[UI] ❌ 新增日誌失敗：', msg, err);
      setInsertStatus('failure');
      setInsertMsg(`新增失敗：${msg}`);
      setLatestLog(null);
    }
  }

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

          <TouchableOpacity style={styles.button} onPress={handleCreateTestLog}>
            <Text style={styles.buttonText}>建立測試日誌</Text>
          </TouchableOpacity>

          {insertStatus === 'success' && (
            <View style={styles.resultBox}>
              <Text style={styles.successText}>{insertMsg}</Text>
              {latestLog && (
                <Text style={styles.detailText}>
                  {`日期：${latestLog.record_date}　地點：${latestLog.location}　機號：${latestLog.machine_no}`}
                </Text>
              )}
            </View>
          )}

          {insertStatus === 'failure' && (
            <View style={styles.resultBox}>
              <Text style={styles.errorText}>{insertMsg}</Text>
            </View>
          )}
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
  button: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 28,
    backgroundColor: '#2563EB',
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  resultBox: {
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
  },
  successText: {
    fontSize: 15,
    color: '#16A34A',
    textAlign: 'center',
  },
  detailText: {
    fontSize: 13,
    color: '#475569',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#DC2626',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
});
