import { View, Text, StyleSheet } from 'react-native';

export default function SearchScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🔍</Text>
      <Text style={styles.title}>搜尋</Text>
      <Text style={styles.hint}>多條件搜尋功能開發中</Text>
      <Text style={styles.issue}>（對應 Issue #19 / #20 / #21）</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    gap: 8,
    padding: 24,
  },
  icon: {
    fontSize: 48,
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  hint: {
    fontSize: 16,
    color: '#475569',
  },
  issue: {
    fontSize: 13,
    color: '#94A3B8',
  },
});
