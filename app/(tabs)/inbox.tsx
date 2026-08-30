import React from 'react';
import { View, Text, StyleSheet, Pressable, Linking } from 'react-native';
import { API_BASE } from '../../src/api/client';

export default function InboxScreen() {
  return (
    <View style={styles.root}>
      <Text style={styles.title}>💬 Inbox</Text>
      <Text style={styles.sub}>
        ማሳወቂያዎችና የገዢ/ሻጭ መልእክቶች ከ Telegram Bot ጋር ይገናኛሉ።
      </Text>
      <Pressable
        style={styles.btn}
        onPress={() => Linking.openURL('https://t.me/AdikaMarketplaceBot').catch(() => {})}
      >
        <Text style={styles.btnText}>Telegram Bot ክፈት</Text>
      </Pressable>
      <Pressable
        style={[styles.btn, styles.btnAlt]}
        onPress={() => Linking.openURL(`${API_BASE.replace(/\/$/, '')}/explorer`)}
      >
        <Text style={styles.btnText}>Mini App Inbox</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#ecfeff', padding: 20, justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '800', color: '#0f172a' },
  sub: { marginTop: 8, color: '#64748b', lineHeight: 20, marginBottom: 20 },
  btn: {
    backgroundColor: '#16acbd',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  btnAlt: { backgroundColor: '#0f172a' },
  btnText: { color: '#fff', fontWeight: '800' },
});
