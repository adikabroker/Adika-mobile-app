import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

interface ListingDetail {
  id: string | number;
  title: string;
  price: string | number;
  category: string;
  image?: string;
  description?: string;
  phone_number?: string;
  location?: string;
}

export default function ListingDetailScreen() {
  const { id, itemData } = useLocalSearchParams();
  const router = useRouter();

  const [item, setItem] = useState<ListingDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (itemData && typeof itemData === 'string') {
      try {
        setItem(JSON.parse(itemData));
        setLoading(false);
        return;
      } catch (e) {
        console.log('Error parsing local item data', e);
      }
    }

    const fetchDetail = async () => {
      try {
        const res = await fetch(`https://adika-y37t.onrender.com/api/explorer/listings`);
        const data = await res.json();
        const found = data?.find((l: any) => String(l.id) === String(id));
        if (found) {
          setItem(found);
        }
      } catch (err) {
        console.error('Fetch detail error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id, itemData]);

  const handleCall = () => {
    const phoneNumber = item?.phone_number || '+251900000000';
    Linking.openURL(`tel:${phoneNumber}`);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#16acbd" />
        <Text style={{ marginTop: 10, color: '#666' }}>ዝርዝሩ በመጫን ላይ...</Text>
      </View>
    );
  }

  if (!item) {
    return (
      <View style={styles.center}>
        <Text style={{ fontSize: 16, color: '#333' }}>መረጃው አልተገኘም</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>ተመለስ</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const placeholderImage = 'https://via.placeholder.com/400x300.png?text=No+Image';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 90 }}>
        <TouchableOpacity style={styles.floatingBack} onPress={() => router.back()}>
          <Text style={styles.backText}>‹ ተመለስ</Text>
        </TouchableOpacity>

        <Image
          source={{ uri: item.image || placeholderImage }}
          style={styles.image}
          resizeMode="cover"
        />

        <View style={styles.content}>
          <View style={styles.tagRow}>
            <Text style={styles.categoryBadge}>{item.category || 'General'}</Text>
          </View>

          <Text style={styles.title}>{item.title}</Text>

          <Text style={styles.price}>
            {typeof item.price === 'number'
              ? `${item.price.toLocaleString()} ETB`
              : `${item.price} ETB`}
          </Text>

          <View style={styles.divider} />

          <Text style={styles.sectionHeader}>መግለጫ (Description)</Text>
          <Text style={styles.description}>
            {item.description || 'ለዚህ እቃ ወይም ንብረት የተሰጠ ተጨማሪ መግለጫ የለም። ለበለጠ መረጃ ደውለው ይወቁ።'}
          </Text>

          {item.location && (
            <View style={{ marginTop: 15 }}>
              <Text style={styles.sectionHeader}>ቦታ (Location)</Text>
              <Text style={styles.locationText}>📍 {item.location}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.callButton} onPress={handleCall}>
          <Text style={styles.callButtonText}>📞 አሁኑኑ ይደውሉ</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  floatingBack: {
    position: 'absolute',
    top: 40,
    left: 16,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  backText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  image: { width: '100%', height: 280, backgroundColor: '#e2e8f0' },
  content: { padding: 20 },
  tagRow: { flexDirection: 'row', marginBottom: 8 },
  categoryBadge: {
    backgroundColor: '#e0f2fe',
    color: '#0369a1',
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  title: { fontSize: 22, fontWeight: 'bold', color: '#0f172a', marginBottom: 8 },
  price: { fontSize: 20, fontWeight: '700', color: '#16acbd', marginBottom: 16 },
  divider: { height: 1, backgroundColor: '#e2e8f0', marginVertical: 12 },
  sectionHeader: { fontSize: 15, fontWeight: '600', color: '#475569', marginBottom: 6 },
  description: { fontSize: 14, color: '#334155', lineHeight: 22 },
  locationText: { fontSize: 14, color: '#64748b' },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  callButton: { backgroundColor: '#16acbd', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  callButtonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  backBtn: { marginTop: 15, backgroundColor: '#16acbd', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
});
