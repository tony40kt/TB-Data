import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { isValidDateYYYYMMDD } from '../../utils/validation';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const ALPHANUMERIC_DOT_REGEX = /^[A-Za-z0-9.]+$/;
const FAULT_CODE_REGEX = /^\d+$/;

function getTodayString(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export default function AddScreen() {
  const [record_date, setRecordDate] = useState(getTodayString());
  const [location, setLocation] = useState('');
  const [machine_no, setMachineNo] = useState('');
  const [lift_system, setLiftSystem] = useState('');
  const [lift_software, setLiftSoftware] = useState('');
  const [vfd_model, setVfdModel] = useState('');
  const [vfd_software, setVfdSoftware] = useState('');
  const [motor_model, setMotorModel] = useState('');
  const [fault_code, setFaultCode] = useState('');
  const [remark, setRemark] = useState('');

  const [validationErrors, setValidationErrors] = useState<string[]>([]);

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

  function handleSave() {
    const errors = validate();
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }
    setValidationErrors([]);
    Alert.alert('驗證通過', '尚未接 DB，已通過驗證。');
  }

  function handleReset() {
    setRecordDate(getTodayString());
    setLocation('');
    setMachineNo('');
    setLiftSystem('');
    setLiftSoftware('');
    setVfdModel('');
    setVfdSoftware('');
    setMotorModel('');
    setFaultCode('');
    setRemark('');
    setValidationErrors([]);
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {/* 驗證錯誤訊息 */}
      {validationErrors.length > 0 && (
        <View style={styles.errorBox}>
          {validationErrors.map((e, index) => (
            <Text key={index} style={styles.errorBoxText}>
              ⚠️ {e}
            </Text>
          ))}
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
        <TextInput
          style={styles.input}
          value={lift_system}
          onChangeText={setLiftSystem}
          placeholder="（選填）"
          placeholderTextColor="#94A3B8"
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>升降機軟件</Text>
        <TextInput
          style={styles.input}
          value={lift_software}
          onChangeText={setLiftSoftware}
          placeholder="（選填）"
          placeholderTextColor="#94A3B8"
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
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>💾 儲存</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
          <Text style={styles.resetBtnText}>🔄 清除</Text>
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
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  resetBtn: {
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  resetBtnText: {
    color: '#475569',
    fontSize: 15,
    fontWeight: '600',
  },
});
