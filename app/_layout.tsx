import { Stack } from 'expo-router';

export default function ListingLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#16acbd' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '800' },
      }}
    />
  );
}
