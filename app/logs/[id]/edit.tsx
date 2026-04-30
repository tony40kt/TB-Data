import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getLogById, updateLog, UpdateLogInput } from '../../../db/logs';
import { isValidDateYYYYMMDD } from '../../../utils/validation';
import { useRole } from '../../../context/RoleContext';
import { LiftDropdown, LiftValue } from '../../../components/LiftDropdown';

type LoadState = 'loading' | 'ready' | 'not_found' | 'load_error';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const ALPHANUMERIC_DOT_REGEX = /^[A-Za-z0-9.]+$/;
const FAULT_CODE_REGEX = /^\d+$/;

export default function LogEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { role } = useRole();
  const isGuest = role === 'guest';

  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [loadErrorMsg, setLoadErrorMsg] = useState('');

  // 表單欄位狀態
  const [record_date, setRecordDate] = useState('');
  const [location, setLocation] = useState('');
  const [machine_no, setMachineNo] = useState('');
  const [lift_system, setLiftSystem] = useState<LiftValue>(null);
  const [lift_software, setLiftSoftware] = useState<LiftValue>(null);
  const [vfd_model, setVfdModel] = useState('');
  const [vfd_software, setVfdSoftware] = useState('');
  const [motor_model, setMotorModel] = useState('');
  const [fault_code, setFaultCode] = useState('');
  const [remark, setRemark] = useState('');

  // 提交狀態
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    try {
      const numId = Number(id);
      if (!Number.isInteger(numId) || numId <= 0) {
        setLoadState('not_found');
        return;
      }
      const row = getLogById(numId);
      if (row == null) {
        setLoadState('not_found');
      } else {
        setRecordDate(row.record_date ?? '');
        setLocation(row.location ?? '');
        setMachineNo(row.machine_no ?? '');
        setLiftSystem(row.lift_system ?? null);
        setLiftSoftware(row.lift_software ?? null);
        setVfdModel(row.vfd_model ?? '');
        setVfdSoftware(row.vfd_software ?? '');
        setMotorModel(row.motor_model ?? '');
        setFaultCode(row.fault_code ?? '');
        setRemark(row.remark ?? '');
        setLoadState('ready');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setLoadErrorMsg(msg);
      setLoadState('load_error');
    }
  }, [id]);

  function validate(): string[] {
    const errors: string[] = [];
    if (!record_date.trim()) {
      errors.push('記錄日期不可空白');
    } else if (!DATE_REGEX.test(record_date.trim())) {
      errors.push('記錄日期格式必須為 YYYY-MM-DD');
    } else if (!isValidDateYYYYMMDD(record_date.trim())) {
      errors.push('記錄日期不是有效日期');
    }
    if (!location.trim()) {
      errors.push('地點不可空白');
    }
    if (!machine_no.trim()) {
      errors.push('機號不可空白');
    } else if (!ALPHANUMERIC_DOT_REGEX.test(machine_no.trim())) {
      errors.push('機號只能輸入英文/數字/句點(.)');
    }
    if (vfd_model.trim() && !ALPHANUMERIC_DOT_REGEX.test(vfd_model.trim())) {
      errors.push('變頻型號只能輸入英文/數字/句點(.)');
    }
    if (vfd_software.trim() && !ALPHANUMERIC_DOT_REGEX.test(vfd_software.trim())) {
      errors.push('變頻軟件只能輸入英文/數字/句點(.)');
    }
    if (motor_model.trim() && !ALPHANUMERIC_DOT_REGEX.test(motor_model.trim())) {
      errors.push('摩打型號只能輸入英文/數字/句點(.)');
    }
    if (fault_code.trim() && !FAULT_CODE_REGEX.test(fault_code.trim())) {
      errors.push('故障碼只能輸入數字');
    }
    return errors;
  }

  // 成功後導回詳情頁（等成功狀態渲染後再跳轉，清理 timer 避免 memory leak）
  useEffect(() => {
    if (!submitSuccess) return;
    const numId = Number(id);
    const timer = setTimeout(() => {
      router.replace(`/logs/${numId}`);
    }, 800);
    return () => clearTimeout(timer);
  }, [submitSuccess, id, router]);

  function handleSave() {
    setValidationErrors([]);
    setSubmitError('');
    setSubmitSuccess(false);

    const errors = validate();
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    const numId = Number(id);
    const input: UpdateLogInput = {
      record_date: record_date.trim(),
      location: location.trim(),
      machine_no: machine_no.trim(),
      lift_system: lift_system ?? null,
      lift_software: lift_software ?? null,
      vfd_model: vfd_model.trim() || undefined,
      vfd_software: vfd_software.trim() || undefined,
      motor_model: motor_model.trim() || undefined,
      fault_code: fault_code.trim() || undefined,
      remark: remark.trim() || undefined,
    };

    try {
      updateLog(numId, input);
      setSubmitSuccess(true);
      // 導航由 useEffect 在成功狀態渲染後執行
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setSubmitError(msg);
    }
  }

  // ── 載入中 ──
  if (loadState === 'loading') {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.statusText}>讀取中…</Text>
      </View>
    );
  }

  // ── 找不到 ──
  if (loadState === 'not_found') {
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

  // ── 載入失敗 ──
  if (loadState === 'load_error') {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>讀取失敗</Text>
        <Text style={styles.errorDetail}>{loadErrorMsg}</Text>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.replace('/logs')}
        >
          <Text style={styles.backBtnText}>返回列表</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── 編輯表單 ──
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {/* 驗證錯誤訊息 */}
      {validationErrors.length > 0 && (
        <View style={styles.errorBox}>
          {validationErrors.map((e) => (
            <Text key={e} style={styles.errorBoxText}>
              ⚠️ {e}
            </Text>
          ))}
        </View>
      )}

      {/* 更新失敗訊息 */}
      {submitError !== '' && (
        <View style={styles.errorBox}>
          <Text style={styles.errorBoxText}>❌ 更新失敗：{submitError}</Text>
        </View>
      )}

      {/* 成功訊息 */}
      {submitSuccess && (
        <View style={styles.successBox}>
          <Text style={styles.successText}>✅ 已更新，正在返回詳情頁…</Text>
        </View>
      )}

      {/* 必填欄位 */}
      <Text style={styles.sectionTitle}>必填欄位</Text>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>
          記錄日期 <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          value={record_date}
          onChangeText={setRecordDate}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#94A3B8"
          keyboardType="numbers-and-punctuation"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>
          地點 <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          value={location}
          onChangeText={setLocation}
          placeholder="工作地點"
          placeholderTextColor="#94A3B8"
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>
          機號 <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          value={machine_no}
          onChangeText={setMachineNo}
          placeholder="英文/數字/句點(.)"
          placeholderTextColor="#94A3B8"
          autoCapitalize="characters"
        />
      </View>

      {/* 選填欄位 */}
      <Text style={styles.sectionTitle}>選填欄位</Text>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>升降機系統</Text>
        <LiftDropdown
          value={lift_system}
          onChange={setLiftSystem}
          disabled={isGuest}
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>升降機軟件</Text>
        <LiftDropdown
          value={lift_software}
          onChange={setLiftSoftware}
          disabled={isGuest}
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>變頻型號</Text>
        <TextInput
          style={styles.input}
          value={vfd_model}
          onChangeText={setVfdModel}
          placeholder="（選填）"
          placeholderTextColor="#94A3B8"
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>變頻軟件</Text>
        <TextInput
          style={styles.input}
          value={vfd_software}
          onChangeText={setVfdSoftware}
          placeholder="（選填）"
          placeholderTextColor="#94A3B8"
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>摩打型號</Text>
        <TextInput
          style={styles.input}
          value={motor_model}
          onChangeText={setMotorModel}
          placeholder="（選填）"
          placeholderTextColor="#94A3B8"
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>故障碼</Text>
        <TextInput
          style={styles.input}
          value={fault_code}
          onChangeText={setFaultCode}
          placeholder="（選填）"
          placeholderTextColor="#94A3B8"
          keyboardType="number-pad"
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>備註</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={remark}
          onChangeText={setRemark}
          placeholder="（選填）"
          placeholderTextColor="#94A3B8"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      {/* 操作按鈕 */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.saveBtn, (submitSuccess || isGuest) && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={submitSuccess || isGuest}
        >
          <Text style={styles.saveBtnText}>💾 儲存</Text>
        </TouchableOpacity>
        {isGuest && (
          <Text style={styles.permissionHint}>🔒 訪客不可編輯記錄</Text>
        )}

        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => router.back()}
        >
          <Text style={styles.cancelBtnText}>取消</Text>
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
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    gap: 4,
  },
  errorBoxText: {
    fontSize: 14,
    color: '#DC2626',
  },
  successBox: {
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  successText: {
    fontSize: 14,
    color: '#16A34A',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 12,
    marginBottom: 8,
  },
  fieldGroup: {
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
  },
  required: {
    color: '#DC2626',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#1E293B',
  },
  textArea: {
    minHeight: 88,
  },
  actions: {
    marginTop: 20,
    gap: 10,
  },
  saveBtn: {
    backgroundColor: '#16A34A',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveBtnDisabled: {
    backgroundColor: '#86EFAC',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelBtn: {
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#475569',
    fontSize: 15,
    fontWeight: '600',
  },
  permissionHint: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
  },
});
