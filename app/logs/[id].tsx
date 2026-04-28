import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getLogById, LogRow } from '../../db/logs';

type LoadState = 'loading' | 'found' | 'not_found' | 'error';

/** 空值顯示 — */
function display(value: string | null | undefined): string {
  return value != null && value !== '' ? value : '—';
}

export default function LogDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [state, setState] = useState<LoadState>('loading');
  const [log, setLog] = useState<LogRow | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    try {
      const numId = Number(id);
      if (!Number.isInteger(numId) || numId <= 0) {
        setState('not_found');
        return;
      }
      const row = getLogById(numId);
      if (row == null) {
        setState('not_found');
      } else {
        setLog(row);
        setState('found');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg);
      setState('error');
    }
  }, [id]);

  if (state === 'loading') {
    return (
      <View style={styles.center}>
        <Text style={styles.statusText}>讀取中…</Text>
      </View>
    );
  }

  if (state === 'not_found') {
    return (
      <View style={styles.center}>
        <Text style={styles.statusText}>找不到此日誌</Text>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.replace('/logs')}
        >
          <Text style={styles.backBtnText}>返回列表</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (state === 'error') {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>讀取失敗</Text>
        <Text style={styles.errorDetail}>{errorMsg}</Text>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.replace('/logs')}
        >
          <Text style={styles.backBtnText}>返回列表</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const fields: { label: string; value: string }[] = [
    { label: '記錄日期', value: display(log?.record_date) },
    { label: '地點', value: display(log?.location) },
    { label: '機號', value: display(log?.machine_no) },
    { label: '升降機系統', value: display(log?.lift_system) },
    { label: '升降機軟件', value: display(log?.lift_software) },
    { label: '變頻型號', value: display(log?.vfd_model) },
    { label: '變頻軟件', value: display(log?.vfd_software) },
    { label: '摩打型號', value: display(log?.motor_model) },
    { label: '故障碼', value: display(log?.fault_code) },
    { label: '備註', value: display(log?.remark) },
    { label: '建立時間', value: display(log?.created_at) },
    { label: '更新時間', value: display(log?.updated_at) },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {fields.map(({ label, value }) => (
        <View key={label} style={styles.row}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.value}>{value}</Text>
        </View>
      ))}

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
        >
          <Text style={styles.backBtnText}>← 返回列表</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionBtn, styles.disabled]} disabled>
          <Text style={styles.actionBtnText}>編輯（待完成）</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionBtn, styles.disabled]} disabled>
          <Text style={styles.actionBtnText}>刪除（待完成）</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 16,
    gap: 4,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    gap: 16,
    padding: 24,
  },
  statusText: {
    fontSize: 18,
    color: '#475569',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#DC2626',
  },
  errorDetail: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  row: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    flex: 1,
  },
  value: {
    fontSize: 14,
    color: '#1E293B',
    flex: 2,
    textAlign: 'right',
  },
  actions: {
    marginTop: 16,
    gap: 10,
  },
  backBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  backBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  actionBtn: {
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  disabled: {
    backgroundColor: '#E2E8F0',
  },
  actionBtnText: {
    color: '#94A3B8',
    fontSize: 15,
    fontWeight: '600',
  },
});
