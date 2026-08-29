import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';

interface Listing {
  id: string | number;
  title: string;
  price: string | number;
  category: string;
  image?: string;
  description?: string;
  phone_number?: string;
  location?: string;
}

const CATEGORIES = ['ሁሉም', 'መኪና', 'ቤት', 'ንግድ'];

export default function HomeScreen() {
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('ሁሉም');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchListings = async () => {
    try {
      const response = await fetch('https://adika-y37t.onrender.com/api/explorer/listings');
      const data = await response.json();
      if (Array.isArray(data)) {
        setListings(data);
        setFilteredListings(data);
      }
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchListings();
  };

  useEffect(() => {
    let result = listings;

    if (selectedCategory !== 'ሁሉም') {
      result = result.filter(
        (item) => item.category && item.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (searchQuery.trim() !== '') {
      result = result.filter((item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredListings(result);
  }, [selectedCategory, searchQuery, listings]);

  // ካርዱ ሲነካ ወደ Detail ገጽ መላኪያ የተስተካከለ ሎጂክ
  const handleItemPress = (item: Listing) => {
    router.push(`/listing/${item.id}`);
  };

  const renderCard = ({ item }: { item: Listing }) => {
    const placeholderImage = 'https://via.placeholder.com/300x200.png?text=No+Image';

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => handleItemPress(item)}
      >
        <Image
          source={{ uri: item.image || placeholderImage }}
          style={styles.cardImage}
          resizeMode="cover"
        />
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.cardPrice}>
            💰 {typeof item.price === 'number' ? `${item.price.toLocaleString()} ETB` : item.price}
          </Text>
          <Text style={styles.cardCategory}>{item.category || 'General'}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header Tabs */}
      <View style={styles.topHeader}>
        <TouchableOpacity style={[styles.headerTab, styles.headerTabActive]}>
          <Text style={styles.headerTabTextActive}>🛒 ገበያ</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerTab}>
          <Text style={styles.headerTabText}>📋 my orders</Text>
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="ፈልግ... (ሞዴል፣ ቦታ፣ ዋጋ)"
          placeholderTextColor="#94a3b8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Categories Horizontal Scroll */}
      <View style={styles.categoryContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(item) => item}
          renderItem={({ item }) => {
            const isActive = selectedCategory === item;
            return (
              <TouchableOpacity
                style={[styles.categoryBadge, isActive && styles.categoryBadgeActive]}
                onPress={() => setSelectedCategory(item)}
              >
                <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>
                  {item === 'ሁሉም' ? '✨ ሁሉም' : item === 'መኪና' ? '🚗 መኪና' : item === 'ቤት' ? '🏠 ቤት' : '🏢 ንግድ'}
                </Text>
              </TouchableOpacity>
            );
          }}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        />
      </View>

      {/* Main Listings Grid */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#16acbd" />
          <Text style={{ marginTop: 10, color: '#64748b' }}>መረጃዎች በመጫን ላይ...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredListings}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderCard}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={{ padding: 12, paddingBottom: 80 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#16acbd']} />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={{ fontSize: 15, color: '#64748b', marginTop: 40 }}>
                ምንም የተገኘ እቃ የለም
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#e0f7fa' },
  topHeader: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 10,
    gap: 10,
  },
  headerTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    alignItems: 'center',
  },
  headerTabActive: { backgroundColor: '#16acbd' },
  headerTabText: { fontWeight: 'bold', color: '#16acbd' },
  headerTabTextActive: { fontWeight: 'bold', color: '#ffffff' },

  searchContainer: { paddingHorizontal: 16, marginTop: 10 },
  searchInput: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0f172a',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },

  categoryContainer: { marginTop: 12, height: 40 },
  categoryBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  categoryBadgeActive: { backgroundColor: '#16acbd', borderColor: '#16acbd' },
  categoryText: { fontSize: 13, color: '#475569', fontWeight: '600' },
  categoryTextActive: { color: '#ffffff' },

  row: { justifyContent: 'space-between', marginBottom: 12 },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    width: '48%',
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardImage: { width: '100%', height: 130, backgroundColor: '#f1f5f9' },
  cardContent: { padding: 10 },
  cardTitle: { fontSize: 14, fontWeight: 'bold', color: '#0f172a' },
  cardPrice: { fontSize: 13, fontWeight: '700', color: '#16acbd', marginTop: 4 },
  cardCategory: { fontSize: 11, color: '#64748b', marginTop: 2 },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
