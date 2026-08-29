/**
 * Adika Marketplace API client (Expo)
 * - HMAC device auth (Bearer adk1.*)
 * - AsyncStorage response cache for instant UI
 * - All data via Flask API (Render) → Supabase; do NOT call Supabase REST from the app
 */
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Application from 'expo-application';
import { Platform } from 'react-native';
import type {
  AuthResponse,
  AuthUser,
  Listing,
  ListingCategory,
  ListingsResponse,
  ReqType,
} from '../types/listing';

const TOKEN_KEY = 'adika_access_token';
const USER_KEY = 'adika_user_json';
const DEVICE_KEY = 'adika_device_id';
const CACHE_PREFIX = 'adika_cache_v1:';
const LISTINGS_TTL_MS = 90_000;

function resolveBaseUrl(): string {
  const fromEnv = (process.env.EXPO_PUBLIC_API_BASE || '').trim().replace(/\/$/, '');
  if (fromEnv) return fromEnv;
  const extra = Constants.expoConfig?.extra as { apiBaseUrl?: string } | undefined;
  const fromExtra = (extra?.apiBaseUrl || '').trim().replace(/\/$/, '');
  if (fromExtra && !fromExtra.includes('YOUR-RENDER')) return fromExtra;
  // Production Flask on Render (shared with Telegram Mini App)
  return 'https://adika-y37t.onrender.com';
}

export const API_BASE = resolveBaseUrl();

type RequestOptions = {
  method?: string;
  body?: unknown;
  auth?: boolean;
  headers?: Record<string, string>;
  cacheKey?: string;
  cacheTtlMs?: number;
  skipCache?: boolean;
};

type CacheEntry<T> = { savedAt: number; data: T };

async function cacheGet<T>(key: string, ttlMs: number): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CacheEntry<T>;
    if (!parsed?.savedAt || Date.now() - parsed.savedAt > ttlMs) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

async function cacheSet<T>(key: string, data: T): Promise<void> {
  try {
    const entry: CacheEntry<T> = { savedAt: Date.now(), data };
    await AsyncStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
  } catch {
    /* storage full */
  }
}

export async function clearApiCache(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const mine = keys.filter((k) => k.startsWith(CACHE_PREFIX));
    if (mine.length) await AsyncStorage.multiRemove(mine);
  } catch {
    /* ignore */
  }
}

export async function getDeviceId(): Promise<string> {
  try {
    const cached = await AsyncStorage.getItem(DEVICE_KEY);
    if (cached && cached.length >= 8) return cached;
  } catch {
    /* ignore */
  }
  let id = '';
  try {
    if (Platform.OS === 'android') {
      id = String(
        Application.getAndroidId?.() ||
          (Application as { androidId?: string }).androidId ||
          ''
      );
    }
  } catch {
    /* ignore */
  }
  if (!id || id.length < 8) {
    id = `adika-${Platform.OS}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }
  try {
    await AsyncStorage.setItem(DEVICE_KEY, id);
  } catch {
    /* ignore */
  }
  return id;
}

async function getStoredToken(): Promise<string | null> {
  try {
    const t = await SecureStore.getItemAsync(TOKEN_KEY);
    if (t) return t;
  } catch {
    /* fall through */
  }
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function setSession(token: string, user: unknown): Promise<void> {
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user ?? {}));
  } catch {
    await AsyncStorage.setItem(TOKEN_KEY, token);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user ?? {}));
  }
}

export async function clearSession(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
  } catch {
    /* ignore */
  }
  try {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
  } catch {
    /* ignore */
  }
}

export async function getStoredUser(): Promise<AuthUser | null> {
  try {
    let raw = await SecureStore.getItemAsync(USER_KEY);
    if (!raw) raw = await AsyncStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export async function apiRequest<T = unknown>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const method = options.method || (options.body !== undefined ? 'POST' : 'GET');
  const cacheKey = options.cacheKey;
  const ttl = options.cacheTtlMs ?? LISTINGS_TTL_MS;

  if (method === 'GET' && cacheKey && !options.skipCache) {
    const hit = await cacheGet<T>(cacheKey, ttl);
    if (hit !== null) return hit;
  }

  const base = API_BASE.replace(/\/$/, '');
  const url = path.startsWith('http')
    ? path
    : `${base}${path.startsWith('/') ? '' : '/'}${path}`;

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'X-Adika-Platform': Platform.OS === 'ios' ? 'ios' : 'android',
    'X-Adika-Client': 'expo',
    ...(options.headers || {}),
  };

  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (options.auth !== false) {
    const token = await getStoredToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }

  if (!res.ok) {
    const msg =
      (data as { message?: string })?.message ||
      (data as { error?: string })?.error ||
      `HTTP ${res.status}`;
    throw new Error(msg);
  }

  if (method === 'GET' && cacheKey) {
    await cacheSet(cacheKey, data as T);
  }

  return data as T;
}

/** HMAC device login — required before protected write APIs */
export async function authenticateDevice(displayName?: string): Promise<AuthResponse> {
  const device_id = await getDeviceId();
  const data = await apiRequest<AuthResponse>('/api/auth/device', {
    method: 'POST',
    auth: false,
    skipCache: true,
    body: {
      device_id,
      display_name: displayName || 'Adika User',
    },
  });
  if (data.success && data.access_token) {
    await setSession(data.access_token, data.user);
  }
  return data;
}

export async function healthCheck(): Promise<{ ok?: boolean; database?: string }> {
  return apiRequest('/api/health', { auth: false, skipCache: true });
}

export type FetchListingsParams = {
  page?: number;
  limit?: number;
  type?: ReqType;
  category?: ListingCategory | string;
  q?: string;
  chassis_only?: boolean;
  active_only?: boolean;
  forceRefresh?: boolean;
};

export async function fetchListings(
  params: FetchListingsParams = {}
): Promise<{ items: Listing[]; hasMore: boolean; total: number; fromCache?: boolean }> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const type = params.type ?? 'SELL';
  const cat = (params.category || '').trim();

  const qs = new URLSearchParams();
  qs.set('page', String(page));
  qs.set('limit', String(limit));
  qs.set('order', 'DESC');
  qs.set('active_only', params.active_only === false ? '0' : '1');
  qs.set('type', type);
  if (cat && !/^(all|ሁሉም)$/i.test(cat)) qs.set('category', cat);
  if (params.q?.trim()) qs.set('q', params.q.trim());
  if (params.chassis_only) qs.set('chassis_only', '1');

  const cacheKey = `listings:${qs.toString()}`;

  if (!params.forceRefresh) {
    const cached = await cacheGet<ListingsResponse>(cacheKey, LISTINGS_TTL_MS);
    if (cached) {
      const items = cached.items || cached.listings || [];
      void apiRequest<ListingsResponse>(`/api/explorer/listings?${qs}`, {
        auth: true,
        cacheKey,
        skipCache: true,
      }).catch(() => undefined);
      return {
        items,
        hasMore: !!(cached.has_more || cached.hasMore),
        total: Number(cached.total ?? items.length),
        fromCache: true,
      };
    }
  }

  const data = await apiRequest<ListingsResponse>(`/api/explorer/listings?${qs}`, {
    auth: true,
    cacheKey,
    skipCache: !!params.forceRefresh,
    cacheTtlMs: LISTINGS_TTL_MS,
  });

  const items = data.items || data.listings || [];
  return {
    items,
    hasMore: !!(data.has_more || data.hasMore),
    total: Number(data.total ?? items.length),
    fromCache: false,
  };
}

/**
 * Link phone so favorites / listings sync with Telegram Mini App account.
 * Requires Bearer device token. OTP: production should use SMS; Phase-0 accepts server-configured test OTP.
 */
export async function linkPhoneNumber(phone: string, otp: string) {
  const data = await apiRequest<{
    success: boolean;
    access_token?: string;
    user?: AuthUser;
    message?: string;
  }>('/api/auth/link-phone', {
    method: 'POST',
    auth: true,
    skipCache: true,
    body: { phone, otp },
  });
  if (data.success && data.access_token) {
    await setSession(data.access_token, data.user);
  }
  return data;
}

/** Toggle favorite — uses authenticated user_id from device token */
export async function toggleFavorite(listingId: string | number) {
  const user = await getStoredUser();
  return apiRequest<{ success: boolean; is_favorite?: boolean; favorited?: boolean }>(
    '/api/favorites/toggle',
    {
      method: 'POST',
      auth: true,
      skipCache: true,
      body: {
        listing_id: listingId,
        user_id: user?.user_id ?? user?.id,
        chat_id: user?.user_id ?? user?.id,
      },
    }
  );
}

export function getListingImageUrl(item: Listing): string | null {
  const candidates: unknown[] = [
    item.cover_webp_url,
    item.photo_id,
    item.photos,
    item.photo_urls,
    item.listing_photos,
  ];
  for (const c of candidates) {
    if (!c) continue;
    if (Array.isArray(c) && c[0]) return normalizeImageSrc(String(c[0]));
    if (typeof c === 'string') {
      const s = c.trim();
      if (!s) continue;
      if (s.startsWith('[')) {
        try {
          const parsed = JSON.parse(s);
          if (Array.isArray(parsed) && parsed[0]) return normalizeImageSrc(String(parsed[0]));
        } catch {
          /* continue */
        }
      }
      return normalizeImageSrc(s);
    }
  }
  return null;
}

function normalizeImageSrc(s: string): string | null {
  if (!s) return null;
  if (s.startsWith('http://') || s.startsWith('https://') || s.startsWith('data:')) return s;
  if (/^[A-Za-z0-9_-]{20,}$/.test(s) && !s.includes('/') && !s.includes('.')) return null;
  if (/^[A-Za-z0-9+/=\s]+$/.test(s) && s.length > 120) {
    return `data:image/jpeg;base64,${s.replace(/\s/g, '')}`;
  }
  if (s.startsWith('/')) return `${API_BASE.replace(/\/$/, '')}${s}`;
  return s;
}

export function formatPrice(item: Listing): string {
  const raw = item.price_etb ?? item.price;
  if (raw === undefined || raw === null || raw === '') return 'ለዋጋ ደውሉ';
  const n =
    typeof raw === 'number' ? raw : Number(String(raw).replace(/[^\d.]/g, ''));
  if (!Number.isFinite(n) || n <= 0 || n > 300_000_000) return 'ለዋጋ ደውሉ';
  return `${Math.round(n).toLocaleString('en-US')} ETB`;
}

export function listingTitle(item: Listing): string {
  const sub = (item.sub_category || '').trim();
  if (sub) return sub;
  if (item.brand || item.model) {
    return [item.brand, item.model].filter(Boolean).join(' ');
  }
  const desc = (item.description || '').split('\n')[0]?.trim() || '';
  if (desc && desc.length < 70) return desc;
  const cat = item.main_category || item.category || '';
  if (cat === 'መኪና' || /car|vehicle/i.test(cat)) return 'መኪና';
  if (cat === 'ቤት' || /house|propert/i.test(cat)) return 'ቤት';
  if (cat === 'ንግድ' || /commercial/i.test(cat)) return 'ንግድ';
  return item.title || cat || 'ማስታወቂያ';
}
