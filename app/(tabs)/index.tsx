/**
 * Marketplace feed — Facebook Marketplace style retention UX
 * SELL/BUY tabs · Amharic chips · 2-col grid · pull-to-refresh · local cache
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { ListingCard } from '../../src/components/ListingCard';
import { clearApiCache, fetchListings } from '../../src/api/client';
import type { Listing, ListingCategory, ReqType } from '../../src/types/listing';

const FILTERS: { id: ListingCategory; label: string }[] = [
  { id: '', label: '✨ ሁሉም' },
  { id: 'መኪና', label: '🚗 መኪና' },
  { id: 'ቤት', label: '🏠 ቤት' },
  { id: 'ንግድ', label: '🏢 ንግድ' },
];

export default function MarketplaceScreen() {
  const [tab, setTab] = useState<ReqType>('SELL');
  const [category, setCategory] = useState<ListingCategory>('');
  const [q, setQ] = useState('');
  const [items, setItems] = useState<Listing[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fromCache, setFromCache] = useState(false);
  const requestId = useRef(0);

  const load = useCallback(
    async (opts: {
      pageToLoad?: number;
      search?: string;
      forceRefresh?: boolean;
    } = {}) => {
      const pageToLoad = opts.pageToLoad ?? 1;
      const searchQ = opts.search !== undefined ? opts.search : q;
      const rid = ++requestId.current;

      try {
        if (pageToLoad === 1 && !opts.forceRefresh) setLoading(true);
        if (pageToLoad > 1) setLoadingMore(true);
        setError(null);

        const res = await fetchListings({
          page: pageToLoad,
          limit: 20,
          type: tab,
          category: category || undefined,
          q: searchQ.trim() || undefined,
          forceRefresh: opts.forceRefresh,
        });

        if (rid !== requestId.current) return;

        setItems((prev) => (pageToLoad === 1 ? res.items : [...prev, ...res.items]));
        setHasMore(res.hasMore);
        setPage(pageToLoad);
        setFromCache(!!res.fromCache);
      } catch (e) {
        if (rid !== requestId.current) return;
        setError(e instanceof Error ? e.message : 'መጫን አልተቻለም');
        if (pageToLoad === 1) setItems([]);
      } finally {
        if (rid === requestId.current) {
          setLoading(false);
          setRefreshing(false);
          setLoadingMore(false);
        }
      }
    },
    [tab, category, q]
  );

  useEffect(() => {
    load({ pageToLoad: 1 });
  }, [tab, category]); // eslint-disable-line react-hooks/exhaustive-deps

  const onRefresh = async () => {
    setRefreshing(true);
    await clearApiCache();
    load({ pageToLoad: 1, forceRefresh: true });
  };

  const onEndReached = () => {
    if (loading || loadingMore || refreshing || !hasMore) return;
    load({ pageToLoad: page + 1 });
  };

  return (
    <View style={styles.root}>
      <View style={styles.tabs}>
        <Pressable
          onPress={() => setTab('SELL')}
          style={[styles.tabBtn, tab === 'SELL' && styles.tabBtnActive]}
        >
          <Text style={[styles.tabText, tab === 'SELL' && styles.tabTextActive]}>
            🛒 ገበያ
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setTab('BUY')}
          style={[styles.tabBtn, tab === 'BUY' && styles.tabBtnActive]}
        >
          <Text style={[styles.tabText, tab === 'BUY' && styles.tabTextActive]}>
            📋 ገዢዎች
          </Text>
        </Pressable>
      </View>

      <TextInput
        style={styles.search}
        placeholder="ፈልግ… (ሞዴል፣ ቦታ፣ ዋጋ)"
        placeholderTextColor="#94a3b8"
        value={q}
        onChangeText={setQ}
        onSubmitEditing={() => load({ pageToLoad: 1, search: q, forceRefresh: true })}
        returnKeyType="search"
      />

      <View style={styles.chips}>
        {FILTERS.map((f) => {
          const active = category === f.id;
          return (
            <Pressable
              key={f.id || 'all'}
              onPress={() => setCategory(f.id)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {fromCache && items.length > 0 ? (
        <Text style={styles.cacheHint}>⚡ ከካሽ ተጭኗል · በጀርባ ይዘምናል</Text>
      ) : null}

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={() => load({ pageToLoad: 1, forceRefresh: true })}>
            <Text style={styles.retry}>እንደገና ሞክር</Text>
          </Pressable>
        </View>
      ) : null}

      {loading && items.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator color="#16acbd" size="large" />
          <Text style={styles.loadingLabel}>ዝርዝር በመጫን ላይ…</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(it, i) => `${it.id ?? 'x'}-${i}`}
          numColumns={2}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#16acbd"
              colors={['#16acbd']}
            />
          }
          onEndReached={onEndReached}
          onEndReachedThreshold={0.35}
          windowSize={7}
          maxToRenderPerBatch={8}
          initialNumToRender={6}
          removeClippedSubviews
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyTitle}>No listings found</Text>
              <Text style={styles.emptySub}>ሌላ ምድብ ይሞክሩ ወይም ይፈልጉ</Text>
            </View>
          }
          renderItem={({ item }) => <ListingCard item={item} />}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator style={{ marginVertical: 16 }} color="#16acbd" />
            ) : (
              <View style={{ height: 28 }} />
            )
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#ecfeff' },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: 12,
    marginTop: 10,
    backgroundColor: '#16acbd',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  tabBtn: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  tabBtnActive: { backgroundColor: '#ffffff' },
  tabText: { color: '#ffffff', fontWeight: '700', fontSize: 13 },
  tabTextActive: { color: '#0e7490' },
  search: {
    marginHorizontal: 12,
    marginTop: 10,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    fontSize: 14,
    color: '#0f172a',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#a5f3fc',
  },
  chipActive: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#16acbd',
  },
  chipText: { fontSize: 12, fontWeight: '700', color: '#0e7490' },
  chipTextActive: { color: '#0f766e' },
  cacheHint: {
    marginHorizontal: 14,
    marginBottom: 4,
    fontSize: 11,
    color: '#0e7490',
    fontWeight: '600',
  },
  list: { paddingHorizontal: 7, paddingBottom: 28, flexGrow: 1 },
  center: { paddingTop: 72, alignItems: 'center', paddingHorizontal: 24 },
  loadingLabel: { marginTop: 10, color: '#0e7490', fontWeight: '600', fontSize: 13 },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: '#334155' },
  emptySub: { marginTop: 6, fontSize: 13, color: '#94a3b8', textAlign: 'center' },
  errorBox: {
    marginHorizontal: 12,
    marginBottom: 8,
    backgroundColor: '#fef2f2',
    padding: 10,
    borderRadius: 10,
  },
  errorText: { color: '#b91c1c', fontSize: 12, fontWeight: '600' },
  retry: { marginTop: 6, color: '#0e7490', fontWeight: '800', fontSize: 12 },
});
