import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { searchLogs, LogRow } from '../../db/logs';

type SearchState = 'idle' | 'done' | 'error';

const MAX_REMARK_PREVIEW_LENGTH = 30;

export default function SearchScreen() {
  const router = useRouter();
  const [keyword, setKeyword] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [results, setResults] = useState<LogRow[]>([]);
  const [searchState, setSearchState] = useState<SearchState>('idle');

  function handleSearch() {
    try {
      const rows = searchLogs({
        keyword: keyword.trim() || undefined,
        start_date: startDate.trim() || undefined,
        end_date: endDate.trim() || undefined,
      });
      setResults(rows);
      setSearchState('done');
    } catch (err) {
      console.error('[UI] ❌ 搜尋失敗：', err);
      setResults([]);
      setSearchState('error');
    }
  }

  function handleClear() {
    setKeyword('');
    setStartDate('');
    setEndDate('');
    setResults([]);
    setSearchState('idle');
  }

  function renderItem({ item }: { item: LogRow }) {
    const remarkPreview = item.remark
      ? item.remark.length > MAX_REMARK_PREVIEW_LENGTH
        ? item.remark.slice(0, MAX_REMARK_PREVIEW_LENGTH) + '…'
        : item.remark
      : null;

    return (
      <TouchableOpacity
        style={styles.item}
        onPress={() => router.push(`/logs/${item.id}`)}
        activeOpacity={0.7}
      >
        <View style={styles.itemRow}>
          <Text style={styles.itemDate}>{item.record_date}</Text>
          {item.fault_code ? (
            <Text style={styles.itemFaultCode}>故障碼：{item.fault_code}</Text>
          ) : null}
        </View>
        <Text style={styles.itemSub}>
          {item.location}　機號：{item.machine_no}
        </Text>
        {remarkPreview ? (
          <Text style={styles.itemRemark}>{remarkPreview}</Text>
        ) : null}
      </TouchableOpacity>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* 搜尋條件區 */}
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="關鍵字（地點 / 機號 / 故障碼 / 備註）"
          placeholderTextColor="#94A3B8"
          value={keyword}
          onChangeText={setKeyword}
          returnKeyType="search"
          onSubmitEditing={handleSearch}
        />
        <View style={styles.dateRow}>
          <TextInput
            style={[styles.input, styles.dateInput]}
            placeholder="起始日期 YYYY-MM-DD"
            placeholderTextColor="#94A3B8"
            value={startDate}
            onChangeText={setStartDate}
            keyboardType="numbers-and-punctuation"
          />
          <Text style={styles.dateSep}>至</Text>
          <TextInput
            style={[styles.input, styles.dateInput]}
            placeholder="結束日期 YYYY-MM-DD"
            placeholderTextColor="#94A3B8"
            value={endDate}
            onChangeText={setEndDate}
            keyboardType="numbers-and-punctuation"
          />
        </View>
        <View style={styles.btnRow}>
          <TouchableOpacity
            style={[styles.btn, styles.searchBtn]}
            onPress={handleSearch}
            activeOpacity={0.8}
          >
            <Text style={styles.searchBtnText}>🔍 搜尋</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btn, styles.clearBtn]}
            onPress={handleClear}
            activeOpacity={0.8}
          >
            <Text style={styles.clearBtnText}>清除條件</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 結果區 */}
      {searchState === 'idle' ? (
        <View style={styles.hintContainer}>
          <Text style={styles.hintIcon}>🔍</Text>
          <Text style={styles.hintText}>請輸入條件後按搜尋</Text>
        </View>
      ) : searchState === 'error' ? (
        <View style={styles.hintContainer}>
          <Text style={styles.hintIcon}>❌</Text>
          <Text style={styles.hintText}>搜尋時發生錯誤，請稍後再試</Text>
        </View>
      ) : results.length === 0 ? (
        <View style={styles.hintContainer}>
          <Text style={styles.hintIcon}>📭</Text>
          <Text style={styles.hintText}>沒有符合的日誌</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  form: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  input: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1E293B',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateInput: {
    flex: 1,
  },
  dateSep: {
    fontSize: 14,
    color: '#475569',
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  btn: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 11,
    alignItems: 'center',
  },
  searchBtn: {
    backgroundColor: '#2563EB',
  },
  searchBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  clearBtn: {
    backgroundColor: '#E2E8F0',
  },
  clearBtnText: {
    color: '#475569',
    fontSize: 15,
    fontWeight: '600',
  },
  hintContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  hintIcon: {
    fontSize: 48,
  },
  hintText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
  },
  item: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 14,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemDate: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  itemFaultCode: {
    fontSize: 13,
    fontWeight: '600',
    color: '#DC2626',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  itemSub: {
    fontSize: 14,
    color: '#475569',
  },
  itemRemark: {
    fontSize: 13,
    color: '#94A3B8',
  },
  separator: {
    height: 10,
  },
});
