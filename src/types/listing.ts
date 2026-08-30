export type ReqType = 'SELL' | 'BUY';
export type ListingCategory = '' | 'መኪና' | 'ቤት' | 'ንግድ';

export interface Listing {
  id: number | string;
  title?: string;
  description?: string;
  price?: string | number;
  price_etb?: string | number;
  main_category?: string;
  category?: string;
  sub_category?: string;
  req_type?: string;
  phone?: string;
  photo_id?: string;
  photos?: string[];
  photo_urls?: string[] | string;
  listing_photos?: string[] | string;
  cover_webp_url?: string;
  status?: string;
  created_at?: string;
  view_count?: number;
  user_name?: string;
  brand?: string;
  model?: string;
  extra_data?: Record<string, unknown>;
}

export interface ListingsResponse {
  status?: string;
  success?: boolean;
  items?: Listing[];
  listings?: Listing[];
  total?: number;
  page?: number;
  has_more?: boolean;
  hasMore?: boolean;
}

export interface AuthUser {
  id: number;
  user_id: number;
  display_name?: string;
  platform?: string;
  device_id?: string;
}

export interface AuthResponse {
  success: boolean;
  access_token?: string;
  token_type?: string;
  expires_in?: number;
  expires_at?: number;
  user?: AuthUser;
  message?: string;
}
