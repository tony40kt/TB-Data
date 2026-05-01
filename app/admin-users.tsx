import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useRole, Role } from '../context/RoleContext';

const ROLE_LABELS: Record<Role, string> = {
  admin: '管理員',
  user: '一般使用者',
  guest: '訪客',
};

const ROLES: Role[] = ['admin', 'user', 'guest'];

export default function AdminUsersScreen() {
  const { role, roleMap, knownEmails, setRoleForEmail, isLoading } = useRole();
  const router = useRouter();

  // Track pending role changes before saving
  const [pendingMap, setPendingMap] = useState<Record<string, Role>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>讀取中…</Text>
      </View>
    );
  }

  // Permission guard — redirect if not admin
  if (role !== 'admin') {
    return (
      <View style={styles.center}>
        <Text style={styles.lockIcon}>🔒</Text>
        <Text style={styles.noPermText}>僅限管理員存取</Text>
        <Text style={styles.noPermHint}>目前角色無權限進入此頁面</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace('/(tabs)/settings')}
          accessibilityLabel="返回設定"
        >
          <Text style={styles.backButtonText}>返回設定</Text>
        </TouchableOpacity>
      </View>
    );
  }

  function getEffectiveRole(email: string): Role {
    if (pendingMap[email] !== undefined) return pendingMap[email];
    const r = roleMap[email];
    return r ?? 'user';
  }

  function handleRoleChange(email: string, newRole: Role) {
    setPendingMap((prev) => ({ ...prev, [email]: newRole }));
    setSavedMsg('');
  }

  async function handleSave() {
    setIsSaving(true);
    setSavedMsg('');
    try {
      await Promise.all(
        Object.entries(pendingMap).map(([email, newRole]) => setRoleForEmail(email, newRole))
      );
      setPendingMap({});
      setSavedMsg('✅ 已儲存');
    } catch (e) {
      Alert.alert('儲存失敗', '請再試一次');
    } finally {
      setIsSaving(false);
    }
  }

  const hasPendingChanges = Object.keys(pendingMap).length > 0;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.subtitle}>管理本機已登入過的帳號角色</Text>

      {knownEmails.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>目前尚無已登入帳號</Text>
          <Text style={styles.emptyHint}>帳號登入後會自動出現在此清單</Text>
        </View>
      ) : (
        knownEmails.map((email) => {
          const effectiveRole = getEffectiveRole(email);
          const isPending = pendingMap[email] !== undefined;
          return (
            <View key={email} style={[styles.row, isPending && styles.rowPending]}>
              <Text style={styles.email} numberOfLines={1}>{email}</Text>
              <View style={styles.rolePicker}>
                {ROLES.map((r) => (
                  <TouchableOpacity
                    key={r}
                    style={[styles.roleBtn, effectiveRole === r && styles.roleBtnActive]}
                    onPress={() => handleRoleChange(email, r)}
                    accessibilityLabel={`將 ${email} 設為${ROLE_LABELS[r]}`}
                  >
                    <Text
                      style={[
                        styles.roleBtnText,
                        effectiveRole === r && styles.roleBtnTextActive,
                      ]}
                    >
                      {ROLE_LABELS[r]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          );
        })
      )}

      {knownEmails.length > 0 && (
        <>
          <TouchableOpacity
            style={[
              styles.saveButton,
              (!hasPendingChanges || isSaving) && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={!hasPendingChanges || isSaving}
            accessibilityLabel="儲存角色變更"
          >
            <Text style={styles.saveButtonText}>
              {isSaving ? '儲存中…' : '💾 儲存'}
            </Text>
          </TouchableOpacity>

          {savedMsg !== '' && (
            <Text style={styles.savedMsg}>{savedMsg}</Text>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    gap: 12,
    padding: 24,
  },
  loadingText: {
    fontSize: 16,
    color: '#475569',
  },
  lockIcon: {
    fontSize: 48,
  },
  noPermText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  noPermHint: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  backButton: {
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
    backgroundColor: '#2563EB',
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  container: {
    padding: 20,
    backgroundColor: '#F8FAFC',
    gap: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#475569',
    fontWeight: '500',
  },
  emptyHint: {
    fontSize: 13,
    color: '#94A3B8',
  },
  row: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    gap: 10,
  },
  rowPending: {
    borderColor: '#BFDBFE',
    backgroundColor: '#EFF6FF',
  },
  email: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '500',
  },
  rolePicker: {
    flexDirection: 'row',
    gap: 8,
  },
  roleBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
  },
  roleBtnActive: {
    borderColor: '#2563EB',
    backgroundColor: '#DBEAFE',
  },
  roleBtnText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
  },
  roleBtnTextActive: {
    color: '#1D4ED8',
    fontWeight: '700',
  },
  saveButton: {
    marginTop: 8,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#94A3B8',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  savedMsg: {
    fontSize: 14,
    color: '#16A34A',
    textAlign: 'center',
  },
});
