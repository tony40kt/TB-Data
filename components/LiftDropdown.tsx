/**
 * components/LiftDropdown.tsx
 *
 * 升降機系統 / 升降機軟件 下拉選單元件（Phase 2）。
 * - 選項：（不選擇）/ test-a / test-b
 * - value = null 表示「不選擇」，對應 DB 的 null
 * - 使用 Modal 呈現選項列表，樣式與表單其他 input 保持一致
 */

import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  StyleSheet,
} from 'react-native';

export type LiftValue = string | null;

/** 固定內建選項（Phase 2）。Phase 3+ 可改為從 props 傳入或後台管理。 */
export const LIFT_OPTIONS: { label: string; value: LiftValue }[] = [
  { label: '（不選擇）', value: null },
  { label: 'test-a', value: 'test-a' },
  { label: 'test-b', value: 'test-b' },
];

interface LiftDropdownProps {
  value: LiftValue;
  onChange: (value: LiftValue) => void;
  disabled?: boolean;
}

export function LiftDropdown({ value, onChange, disabled = false }: LiftDropdownProps) {
  const [open, setOpen] = useState(false);

  const selectedLabel =
    LIFT_OPTIONS.find((o) => o.value === value)?.label ?? '（不選擇）';
  const isPlaceholder = value === null;

  return (
    <View>
      <TouchableOpacity
        style={[styles.trigger, disabled && styles.triggerDisabled]}
        onPress={() => !disabled && setOpen(true)}
        disabled={disabled}
        activeOpacity={0.7}
        accessibilityRole="combobox"
        accessibilityState={{ expanded: open, disabled }}
      >
        <Text style={[styles.triggerText, isPlaceholder && styles.placeholderText]}>
          {selectedLabel}
        </Text>
        <Text style={styles.arrow}>▼</Text>
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <View style={styles.sheet}>
            {LIFT_OPTIONS.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <TouchableOpacity
                  key={String(opt.value)}
                  style={[styles.option, isSelected && styles.optionSelected]}
                  onPress={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  accessibilityRole="menuitem"
                  accessibilityState={{ selected: isSelected }}
                >
                  <Text
                    style={[styles.optionText, isSelected && styles.optionTextSelected]}
                  >
                    {opt.label}
                  </Text>
                  {isSelected && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  triggerDisabled: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  triggerText: {
    fontSize: 15,
    color: '#1E293B',
    flex: 1,
  },
  placeholderText: {
    color: '#94A3B8',
  },
  arrow: {
    fontSize: 12,
    color: '#94A3B8',
    marginLeft: 8,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 8,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  optionSelected: {
    backgroundColor: '#EFF6FF',
  },
  optionText: {
    fontSize: 16,
    color: '#1E293B',
    flex: 1,
  },
  optionTextSelected: {
    color: '#2563EB',
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 16,
    color: '#2563EB',
    marginLeft: 8,
  },
});
