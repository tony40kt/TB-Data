import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import Constants from 'expo-constants';
import { insertLog, getLatestLog, LogRow } from '../../db/logs';
import { useRole, Role } from '../../context/RoleContext';
import { useAuth } from '../../context/AuthContext';
import { DEV_MODE } from '../../constants/devConfig';

type InsertStatus = 'idle' | 'success' | 'failure';

const ROLE_LABELS: Record<Role, string> = {
  admin: '管理員',
  user: '一般使用者',
  guest: '訪客',
};

const ROLE_BUTTONS: { role: Role; label: string }[] = [
  { role: 'admin', label: '管理員' },
  { role: 'user', label: '一般使用者' },
  { role: 'guest', label: '訪客' },
];

function getRoleHint(r: Role): string {
  switch (r) {
    case 'admin': return '管理員：全功能';
    case 'user':  return '一般使用者：不可匯出資料';
    case 'guest': return '訪客：唯讀（不可新增／編輯／刪除）';
  }
}

export default function SettingsScreen() {
  const { role, setRole, isLoading } = useRole();
  const { currentEmail, isAuthLoading, signIn, signOut } = useAuth();
  const [switchMsg, setSwitchMsg] = useState('');
  const [insertStatus, setInsertStatus] = useState<InsertStatus>('idle');
  const [insertMsg, setInsertMsg] = useState('');
  const [latestLog, setLatestLog] = useState<LogRow | null>(null);

  const version = Constants.expoConfig?.version ?? '—';

  async function handleRoleSwitch(newRole: Role) {
    if (newRole === role) return;
    await setRole(newRole);
    setSwitchMsg(`✅ 已切換為：${ROLE_LABELS[newRole]}`);
  }

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

  if (isLoading || isAuthLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.version}>讀取中…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>⚙️</Text>
      <Text style={styles.title}>設定</Text>
      <Text style={styles.version}>版本：{version}</Text>

      {/* 登入狀態區塊 */}
      <View style={styles.authSection}>
        <Text style={styles.authStatus}>
          {currentEmail ? `已登入：${currentEmail}` : '未登入'}
        </Text>
        {currentEmail ? (
          <TouchableOpacity style={[styles.button, styles.buttonDanger]} onPress={signOut}>
            <Text style={styles.buttonText}>登出</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.button} onPress={signIn}>
            <Text style={styles.buttonText}>🔑 使用 Gmail 登入</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.roleSection}>
        <Text style={styles.roleLabel}>目前角色：</Text>
        <Text style={styles.roleValue}>{ROLE_LABELS[role]}</Text>
      </View>

      <View style={styles.roleButtons}>
        {ROLE_BUTTONS.map(({ role: r, label }) => (
          <TouchableOpacity
            key={r}
            style={[styles.roleButton, role === r && styles.roleButtonActive]}
            onPress={() => handleRoleSwitch(r)}
            accessibilityLabel={`切換角色：${label}`}
          >
            <Text style={[styles.roleButtonText, role === r && styles.roleButtonTextActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {switchMsg !== '' && (
        <Text style={styles.switchMsg}>{switchMsg}</Text>
      )}

      <Text style={styles.roleHint}>{getRoleHint(role)}</Text>

      <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={handleCreateTestLog}>
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
  authSection: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    width: '100%',
  },
  authStatus: {
    fontSize: 15,
    color: '#334155',
    fontWeight: '500',
    textAlign: 'center',
  },
  roleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  roleLabel: {
    fontSize: 16,
    color: '#475569',
  },
  roleValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  roleButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  roleButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
  roleButtonActive: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  roleButtonTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  switchMsg: {
    fontSize: 14,
    color: '#16A34A',
    textAlign: 'center',
  },
  roleHint: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
  },
  button: {
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 28,
    backgroundColor: '#2563EB',
    borderRadius: 8,
  },
  buttonSecondary: {
    backgroundColor: '#64748B',
  },
  buttonDanger: {
    backgroundColor: '#DC2626',
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
