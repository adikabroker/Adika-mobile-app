import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import type { Listing } from '../types/listing';
import { formatPrice, getListingImageUrl, listingTitle } from '../api/client';

type Props = {
  item: Listing;
  onPress?: (item: Listing) => void;
};

export function ListingCard({ item, onPress }: Props) {
  const router = useRouter();
  const uri = useMemo(() => getListingImageUrl(item), [item]);
  const title = listingTitle(item);
  const price = formatPrice(item);
  const cat = item.main_category || item.category || '';

  const handlePress = () => {
    if (onPress) {
      onPress(item);
      return;
    }
    const lid = item?.id;
    if (lid === undefined || lid === null || lid === '') return;
    // In-app route only — do NOT use Linking.openURL('adika://...')
    router.push({
      pathname: '/listing/[id]',
      params: { id: String(lid) },
    });
  };

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${price}`}
    >
      <View style={styles.imageWrap}>
        {uri ? (
          <Image
            source={{ uri }}
            style={styles.image}
            contentFit="cover"
            transition={180}
            cachePolicy="memory-disk"
            recyclingKey={String(item.id)}
          />
        ) : (
          <View style={[styles.image, styles.placeholder]}>
            <Text style={styles.placeholderText}>Adika</Text>
          </View>
        )}
      </View>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        <Text style={styles.price} numberOfLines={1}>
          💰 {price}
        </Text>
        {!!cat && (
          <Text style={styles.cat} numberOfLines={1}>
            {cat}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    overflow: 'hidden',
    margin: 5,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  pressed: { opacity: 0.92, transform: [{ scale: 0.985 }] },
  imageWrap: {
    width: '100%',
    aspectRatio: 4 / 3,
    backgroundColor: '#e2e8f0',
  },
  image: { width: '100%', height: '100%' },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#cffafe',
  },
  placeholderText: { color: '#0e7490', fontWeight: '800', fontSize: 12 },
  body: { paddingHorizontal: 10, paddingVertical: 8, gap: 3 },
  title: { fontSize: 13, fontWeight: '700', color: '#0f172a', lineHeight: 17 },
  price: { fontSize: 12, fontWeight: '800', color: '#0e7490' },
  cat: { fontSize: 10, color: '#64748b', fontWeight: '600' },
});
