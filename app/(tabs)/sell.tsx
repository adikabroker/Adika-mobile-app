import { View, Text, StyleSheet } from 'react-native';

/** Placeholder — Phase-1: post listing form → POST /api/post-listing */
export default function SellScreen() {
  return (
    <View style={styles.root}>
      <Text style={styles.title}>ማስታወቂያ ለጥፍ</Text>
      <Text style={styles.sub}>Phase-1፡ የሽያጭ ቅጽ እዚህ ይገናኛል (ተመሳሳይ /api/post-listing)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#ecfeff', padding: 24, justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: '800', color: '#0f172a' },
  sub: { marginTop: 8, color: '#64748b', fontSize: 14, lineHeight: 20 },
});
