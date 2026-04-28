import { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { listLogs, LogRow } from '../../db/logs';

const MAX_REMARK_PREVIEW_LENGTH = 30;

export default function LogsListScreen() {
  const router = useRouter();
  const [logs, setLogs] = useState<LogRow[]>([]);

  useFocusEffect(
    useCallback(() => {
      try {
        const rows = listLogs();
        setLogs(rows);
      } catch (err) {
        console.error('[UI] ❌ 載入日誌列表失敗：', err);
        setLogs([]);
      }
    }, []),
  );

  function handlePress(id: number) {
    router.push(`/logs/${id}`);
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
        onPress={() => handlePress(item.id)}
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
    <View style={styles.container}>
      {logs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyText}>目前尚無日誌，請先新增一筆</Text>
        </View>
      ) : (
        <FlatList
          data={logs}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
  },
});
