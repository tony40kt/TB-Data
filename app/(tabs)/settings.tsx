import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Constants from 'expo-constants';
import { insertLog, getLatestLog, LogRow } from '../../db/logs';

type InsertStatus = 'idle' | 'success' | 'failure';

export default function SettingsScreen() {
  const [insertStatus, setInsertStatus] = useState<InsertStatus>('idle');
  const [insertMsg, setInsertMsg] = useState('');
  const [latestLog, setLatestLog] = useState<LogRow | null>(null);

  const version = Constants.expoConfig?.version ?? '—';

  function handleCreateTestLog() {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const rowId = insertLog({
        record_date: today,
        location: '測試地點',
        machine_no: 'TEST01',
        lift_system: '測試升降機系統',
        fault_code: '999',
        remark: '這是一筆由設定頁建立的測試日誌',
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
      <Text style={styles.icon}>⚙️</Text>
      <Text style={styles.title}>設定</Text>
      <Text style={styles.version}>版本：{version}</Text>

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
    padding: 24,
  },
  icon: {
    fontSize: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  version: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 8,
  },
  button: {
    marginTop: 8,
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
  },
});
