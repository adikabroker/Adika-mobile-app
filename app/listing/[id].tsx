import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Linking,
  ActivityIndicator,
  Share,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import {
  API_BASE,
  fetchListings,
  formatPrice,
  getListingImageUrl,
  listingTitle,
} from '../../src/api/client';
import type { Listing } from '../../src/types/listing';

/**
 * Route: /listing/[id]
 * Deep links: adika://listing/902  OR  https://adika.et/listing/902
 */
export default function ListingDetailScreen() {
  const router = useRouter();
  const raw = useLocalSearchParams<{ id?: string | string[] }>();
  const id = useMemo(() => {
    const v = raw.id;
    if (Array.isArray(v)) return String(v[0] || '');
    return String(v || '').trim();
  }, [raw.id]);

  const [item, setItem] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('የማስታወቂያ መለያ የለም');
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        // Prefer dedicated endpoint if available; else search list pages
        const tryUrls = [
          `${API_BASE.replace(/\/$/, '')}/api/explorer/listings?id=${encodeURIComponent(id)}&limit=1`,
          `${API_BASE.replace(/\/$/, '')}/api/listings?id=${encodeURIComponent(id)}`,
        ];
        let found: Listing | null = null;
        for (const url of tryUrls) {
          try {
            const res = await fetch(url, { headers: { Accept: 'application/json' } });
            if (!res.ok) continue;
            const data = await res.json();
            const items: Listing[] = data.items || data.listings || (data.id ? [data] : []);
            const match = items.find((x) => String(x.id) === String(id));
            if (match) {
              found = match;
              break;
            }
            if (items[0] && String(items[0].id) === String(id)) {
              found = items[0];
              break;
            }
          } catch {
            /* next */
          }
        }
        if (!found) {
          // Fallback: first pages of SELL feed
          for (const page of [1, 2, 3]) {
            const res = await fetchListings({ page, limit: 50, type: 'SELL', forceRefresh: true });
            const match = res.items.find((x) => String(x.id) === String(id));
            if (match) {
              found = match;
              break;
            }
          }
        }
        if (!cancelled) {
          if (found) setItem(found);
          else setError('ማስታወቂያው አልተገኘም');
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'መጫን አልተቻለም');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const uri = item ? getListingImageUrl(item) : null;
  const title = item ? listingTitle(item) : `Listing #${id}`;
  const price = item ? formatPrice(item) : '';
  const phone = item?.phone ? String(item.phone).replace(/\s/g, '') : '';
  const cat = item?.main_category || item?.category || '';

  const onCall = () => {
    if (!phone) return;
    const tel = phone.startsWith('+') ? phone : phone.startsWith('0') ? phone : `+251${phone.replace(/^251/, '')}`;
    Linking.openURL(`tel:${tel}`);
  };

  const onShare = async () => {
    try {
      await Share.share({
        message: `${title}\n${price}\nhttps://adika.et/listing/${id}`,
        url: `https://adika.et/listing/${id}`,
      });
    } catch {
      /* ignore */
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: title.slice(0, 28) || 'ዝርዝር' }} />
      <ScrollView style={styles.root} contentContainerStyle={styles.content}>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#16acbd" />
            <Text style={styles.loadingText}>ዝርዝር በመጫን ላይ…</Text>
          </View>
        ) : error ? (
          <View style={styles.center}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable style={styles.btnSecondary} onPress={() => router.back()}>
              <Text style={styles.btnSecondaryText}>← ተመለስ</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={styles.imageWrap}>
              {uri ? (
                <Image source={{ uri }} style={styles.image} contentFit="cover" />
              ) : (
                <View style={[styles.image, styles.placeholder]}>
                  <Text style={styles.placeholderText}>Adika</Text>
                </View>
              )}
            </View>

            <View style={styles.body}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.price}>💰 {price}</Text>
              {!!cat && <Text style={styles.cat}>{cat}</Text>}
              <Text style={styles.id}>#{id}</Text>

              {!!item?.description && (
                <Text style={styles.desc}>{String(item.description).slice(0, 1200)}</Text>
              )}

              <View style={styles.actions}>
                {!!phone && (
                  <Pressable style={styles.btnPrimary} onPress={onCall}>
                    <Text style={styles.btnPrimaryText}>📞 ደውል</Text>
                  </Pressable>
                )}
                <Pressable style={styles.btnSecondary} onPress={onShare}>
                  <Text style={styles.btnSecondaryText}>🔗 አጋራ</Text>
                </Pressable>
                <Pressable style={styles.btnSecondary} onPress={() => router.back()}>
                  <Text style={styles.btnSecondaryText}>← ተመለስ</Text>
                </Pressable>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#ecfeff' },
  content: { paddingBottom: 40 },
  center: { paddingTop: 80, alignItems: 'center', paddingHorizontal: 24 },
  loadingText: { marginTop: 12, color: '#0e7490', fontWeight: '600' },
  errorText: { color: '#b91c1c', fontWeight: '700', textAlign: 'center', marginBottom: 16 },
  imageWrap: { width: '100%', aspectRatio: 4 / 3, backgroundColor: '#e2e8f0' },
  image: { width: '100%', height: '100%' },
  placeholder: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#cffafe' },
  placeholderText: { color: '#0e7490', fontWeight: '800' },
  body: { padding: 16, gap: 8 },
  title: { fontSize: 20, fontWeight: '800', color: '#0f172a' },
  price: { fontSize: 18, fontWeight: '800', color: '#0e7490' },
  cat: { fontSize: 13, color: '#64748b', fontWeight: '600' },
  id: { fontSize: 12, color: '#94a3b8' },
  desc: { marginTop: 8, fontSize: 14, lineHeight: 22, color: '#334155' },
  actions: { marginTop: 20, gap: 10 },
  btnPrimary: {
    backgroundColor: '#16acbd',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnPrimaryText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  btnSecondary: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  btnSecondaryText: { color: '#0e7490', fontWeight: '700', fontSize: 15 },
});
