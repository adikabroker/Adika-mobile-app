import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View, Text } from 'react-native';
import { ensureDeviceSession } from '../src/auth/session';
import { API_BASE, healthCheck } from '../src/api/client';

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        await ensureDeviceSession('Adika Android');
        try {
          await healthCheck();
        } catch {
          /* optional */
        }
      } catch (e) {
        setErr(e instanceof Error ? e.message : 'Auth failed');
      } finally {
        setReady(true);
      }
    })();
  }, []);

  if (!ready) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator size="large" color="#16acbd" />
        <Text style={styles.bootTitle}>Adika…</Text>
        <Text style={styles.bootSub}>{API_BASE}</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="listing/[id]"
          options={{ headerShown: true, title: 'ዝርዝር', headerStyle: { backgroundColor: '#16acbd' }, headerTintColor: '#fff' }}
        />
      </Stack>
      {err ? (
        <View style={styles.errBanner}>
          <Text style={styles.errText}>{err}</Text>
        </View>
      ) : null}
    </>
  );
}

const styles = {
  boot: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: '#ecfeff',
  },
  bootTitle: { marginTop: 12, color: '#0e7490', fontWeight: '700' as const },
  bootSub: { marginTop: 4, fontSize: 10, color: '#94a3b8' },
  errBanner: {
    position: 'absolute' as const,
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: '#fef2f2',
    padding: 10,
    borderRadius: 10,
  },
  errText: { color: '#b91c1c', fontSize: 12 },
};
