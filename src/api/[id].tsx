import React from 'react';
import { View, Text, StyleSheet, Pressable, Linking } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';

/**
 * Deep link targets:
 *   adika://listing/123
 *   https://adika.et/listing/123
 */
export default function ListingDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <>
      <Stack.Screen options={{ title: `ማስታወቂያ #${id}`, headerStyle: { backgroundColor: '#16acbd' }, headerTintColor: '#fff' }} />
      <View style={styles.root}>
        <Text style={styles.title}>Listing #{id}</Text>
        <Text style={styles.sub}>
          ዝርዝር ገጽ — Phase-1 ሙሉ data ከ /api/explorer ይጫናል።
        </Text>
        <Pressable
          style={styles.btn}
          onPress={() => Linking.openURL(`${process.env.EXPO_PUBLIC_API_BASE || 'https://adika-y37t.onrender.com'}/explorer`)}
        >
          <Text style={styles.btnText}>በ Web ይመልከቱ</Text>
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 20, backgroundColor: '#ecfeff' },
  title: { fontSize: 20, fontWeight: '800', color: '#0f172a' },
  sub: { marginTop: 8, color: '#64748b', lineHeight: 20 },
  btn: {
    marginTop: 20,
    backgroundColor: '#16acbd',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: '800' },
});
