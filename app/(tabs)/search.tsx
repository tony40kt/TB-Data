import { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { searchLogs, LogRow, SearchLogsInput } from '../../db/logs';

type SearchState = 'idle' | 'loading' | 'done' | 'error';

const MAX_RECENT = 5;
const MAX_REMARK_PREVIEW = 30;

export default function SearchScreen() {
  const router = useRouter();

  // 搜尋條件
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [machineNo, setMachineNo] = useState('');
  const [faultCode, setFaultCode] = useState('');

  // 搜尋狀態
  const [searchState, setSearchState] = useState<SearchState>('idle');
  const [results, setResults] = useState<LogRow[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  // 最近搜尋（存 state，不持久化）
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const keywordRef = useRef<TextInput>(null);

  function hasAnyCondition(): boolean {
    return (
      keyword.trim() !== '' ||
      location.trim() !== '' ||
      machineNo.trim() !== '' ||
      faultCode.trim() !== ''
    );
  }

  function addToRecent(kw: string) {
    if (!kw.trim()) return;
    setRecentSearches((prev: string[]) => {
      const next = [kw.trim(), ...prev.filter((r: string) => r !== kw.trim())];
      return next.slice(0, MAX_RECENT);
    });
  }

  function handleSearch() {
    if (!hasAnyCondition()) return;
    const input: SearchLogsInput = {
      keyword: keyword.trim() || undefined,
      location: location.trim() || undefined,
      machineNo: machineNo.trim() || undefined,
      faultCode: faultCode.trim() || undefined,
    };
    setSearchState('loading');
    try {
      const rows = searchLogs(input);
      setResults(rows);
      setSearchState('done');
      addToRecent(keyword.trim());
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg);
      setSearchState('error');
    }
  }

  function handleClear() {
    setKeyword('');
    setLocation('');
    setMachineNo('');
    setFaultCode('');
    setResults([]);
    setSearchState('idle');
    setErrorMsg('');
    keywordRef.current?.focus();
  }

  function applyRecent(kw: string) {
    setKeyword(kw);
    setSearchState('idle');
  }

  async function handleCopyResults() {
    if (results.length === 0) return;
    try {
      const escapeField = (val: string | number | null | undefined): string => {
        if (val === null || val === undefined) return '';
        return String(val).replace(/[\t\n\r]/g, ' ');
      };
      const header = ['record_date', 'location', 'machine_no', 'fault_code', 'remark', 'id'].join('\t');
      const rows = results.map((r: LogRow) =>
        [r.record_date, r.location, r.machine_no, r.fault_code, r.remark, r.id]
          .map(escapeField)
          .join('\t'),
      );
      const tsv = [header, ...rows].join('\n');
      await Clipboard.setStringAsync(tsv);
      Alert.alert('複製成功', `✅ 已複製 ${results.length} 筆`);
    } catch {
      Alert.alert('複製失敗', '❌ 無法複製到剪貼簿，請再試一次');
    }
  }

  function renderResultItem({ item }: { item: LogRow }) {
    const remarkPreview = item.remark
      ? item.remark.length > MAX_REMARK_PREVIEW
        ? item.remark.slice(0, MAX_REMARK_PREVIEW) + '…'
        : item.remark
      : null;

    return (
      <TouchableOpacity
        style={styles.resultItem}
        onPress={() => router.push(`/logs/${item.id}`)}
        activeOpacity={0.7}
      >
        <View style={styles.resultItemRow}>
          <Text style={styles.resultDate}>{item.record_date}</Text>
          {item.fault_code ? (
            <Text style={styles.resultFaultCode}>故障碼：{item.fault_code}</Text>
          ) : null}
        </View>
        <Text style={styles.resultSub}>
          {item.location}　機號：{item.machine_no}
        </Text>
        {remarkPreview ? (
          <Text style={styles.resultRemark}>{remarkPreview}</Text>
        ) : null}
      </TouchableOpacity>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.flex}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        {/* 搜尋條件區 */}
        <View style={styles.formCard}>
          <TextInput
            ref={keywordRef}
            style={styles.input}
            placeholder="關鍵字（地點 / 機號 / 故障碼 / 備註）"
            placeholderTextColor="#94A3B8"
            value={keyword}
            onChangeText={setKeyword}
            returnKeyType="search"
            onSubmitEditing={handleSearch}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="地點（選填）"
            placeholderTextColor="#94A3B8"
            value={location}
            onChangeText={setLocation}
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />
          <TextInput
            style={styles.input}
            placeholder="機號（選填，英數）"
            placeholderTextColor="#94A3B8"
            value={machineNo}
            onChangeText={setMachineNo}
            returnKeyType="search"
            onSubmitEditing={handleSearch}
            autoCapitalize="characters"
          />
          <TextInput
            style={styles.input}
            placeholder="故障碼（選填）"
            placeholderTextColor="#94A3B8"
            value={faultCode}
            onChangeText={setFaultCode}
            returnKeyType="search"
            onSubmitEditing={handleSearch}
            keyboardType="number-pad"
          />

          <View style={styles.btnRow}>
            <TouchableOpacity
              style={[
                styles.searchBtn,
                !hasAnyCondition() && styles.searchBtnDisabled,
              ]}
              onPress={handleSearch}
              disabled={!hasAnyCondition() || searchState === 'loading'}
            >
              <Text style={styles.searchBtnText}>🔍 搜尋</Text>
            </TouchableOpacity>
            {(hasAnyCondition() || searchState === 'done' || searchState === 'error') && (
              <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
                <Text style={styles.clearBtnText}>✕ 清除</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* 最近搜尋 */}
        {recentSearches.length > 0 && searchState === 'idle' && (
          <View style={styles.recentSection}>
            <Text style={styles.sectionLabel}>最近搜尋</Text>
            <View style={styles.recentChips}>
              {recentSearches.map((r: string) => (
                <TouchableOpacity
                  key={r}
                  style={styles.chip}
                  onPress={() => applyRecent(r)}
                >
                  <Text style={styles.chipText}>{r}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* 狀態區域 */}
        {searchState === 'idle' && !hasAnyCondition() && (
          <View style={styles.emptyHint}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyTitle}>尚未搜尋</Text>
            <Text style={styles.emptyHintText}>
              輸入關鍵字或條件後，按「搜尋」或鍵盤送出鍵
            </Text>
          </View>
        )}

        {searchState === 'loading' && (
          <View style={styles.statusCenter}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={styles.loadingText}>搜尋中…</Text>
          </View>
        )}

        {searchState === 'error' && (
          <View style={styles.statusCenter}>
            <Text style={styles.errorText}>❌ 搜尋失敗</Text>
            <Text style={styles.errorDetail}>{errorMsg}</Text>
          </View>
        )}

        {searchState === 'done' && (
          <View style={styles.resultSection}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultCount}>
                共 {results.length} 筆結果
              </Text>
              {results.length > 0 && (
                <TouchableOpacity style={styles.copyBtn} onPress={handleCopyResults}>
                  <Text style={styles.copyBtnText}>📋 複製結果</Text>
                </TouchableOpacity>
              )}
            </View>
            {results.length === 0 ? (
              <View style={styles.noResult}>
                <Text style={styles.noResultIcon}>😶</Text>
                <Text style={styles.noResultText}>找不到符合條件的日誌</Text>
              </View>
            ) : (
              <FlatList
                data={results}
                keyExtractor={(item: LogRow) => String(item.id)}
                renderItem={renderResultItem}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
              />
            )}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 16,
    gap: 16,
    flexGrow: 1,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#1E293B',
    backgroundColor: '#F8FAFC',
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 2,
  },
  searchBtn: {
    flex: 1,
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  searchBtnDisabled: {
    backgroundColor: '#94A3B8',
  },
  searchBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  clearBtn: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  clearBtnText: {
    color: '#64748B',
    fontSize: 15,
    fontWeight: '600',
  },
  recentSection: {
    gap: 8,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  recentChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#EFF6FF',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  chipText: {
    fontSize: 13,
    color: '#2563EB',
  },
  emptyHint: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
    gap: 8,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  emptyHintText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    maxWidth: 260,
  },
  statusCenter: {
    alignItems: 'center',
    paddingTop: 32,
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: '#2563EB',
    fontWeight: '500',
  },
  errorText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#DC2626',
  },
  errorDetail: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
  },
  resultSection: {
    gap: 10,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  copyBtn: {
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  copyBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
  },
  noResult: {
    alignItems: 'center',
    paddingTop: 24,
    gap: 8,
  },
  noResultIcon: {
    fontSize: 36,
  },
  noResultText: {
    fontSize: 15,
    color: '#64748B',
  },
  resultItem: {
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
  resultItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultDate: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  resultFaultCode: {
    fontSize: 13,
    fontWeight: '600',
    color: '#DC2626',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  resultSub: {
    fontSize: 14,
    color: '#475569',
  },
  resultRemark: {
    fontSize: 13,
    color: '#94A3B8',
  },
  separator: {
    height: 10,
  },
});

