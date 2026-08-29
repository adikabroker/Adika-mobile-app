import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';

export default function RootLayout() {
  const [ready, setReady] = useState(true);

  if (!ready) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator size="large" color="#16acbd" />
        <Text style={styles.bootTitle}>Adika</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}

const styles = StyleSheet.compile
  ? {}
  : StyleSheet.create({
      boot: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#16acbd',
      },
      bootTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ffffff',
        marginTop: 10,
      },
    });