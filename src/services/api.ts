import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Crypto from 'expo-crypto';

// API Base URL - configured via .env file
// To change: update API_URL in .env file, then restart Expo
const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3001/api';

const DEVICE_ID_KEY = '@riftory_device_id';

/**
 * Generate a UUID using expo-crypto (works in React Native)
 */
const generateUUID = (): string => {
  return Crypto.randomUUID();
};

/**
 * Get or create a unique device ID
 */
export const getDeviceId = async (): Promise<string> => {
  try {
    let deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);
    
    if (!deviceId) {
      deviceId = generateUUID();
      await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
    }
    
    return deviceId;
  } catch (error) {
    console.error('[API] Error getting device ID:', error);
    // Fallback to a random ID if AsyncStorage fails
    return generateUUID();
  }
};

/**
 * Generic API request handler
 */
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      console.error(`[API] Error response:`, data);
      throw new Error(data.error || `API request failed with status ${response.status}`);
    }

    return data;
  } catch (error: any) {
    console.error(`[API] Error ${endpoint}:`, error?.message || error);
    throw error;
  }
};

// ============================================
// PRODUCTS API
// ============================================

export interface ProductData {
  _id?: string;
  id?: string;
  title: string;
  price: number;
  description: string;
  category: string;
  images?: Array<{ url: string; publicId: string }>;
  imageUrl?: string;
  deviceId?: string;
  seller?: {
    id: string;
    name: string;
    rating?: number;
    totalSales?: number;
    contactNumber?: string;
    address?: string;
    email?: string;
    type?: string;
    upiId?: string;
    qrImageUrl?: string;
  };
  createdAt?: string;
  isActive?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
  error?: string;
  message?: string;
}

/**
 * Get all products
 */
export const fetchAllProducts = async (
  category?: string,
  limit = 50,
  skip = 0
): Promise<ProductData[]> => {
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  params.append('limit', limit.toString());
  params.append('skip', skip.toString());
  
  const response = await apiRequest<ApiResponse<ProductData[]>>(
    `/products?${params.toString()}`
  );
  return response.data;
};

/**
 * Get Upside Down products (special experimental/creepy listings)
 */
export const fetchUpsideDownProducts = async (
  limit = 50,
  skip = 0
): Promise<ProductData[]> => {
  const params = new URLSearchParams();
  params.append('limit', limit.toString());
  params.append('skip', skip.toString());

  const response = await apiRequest<ApiResponse<ProductData[]>>(
    `/products?upsideDown=true&${params.toString()}`
  );
  return response.data;
};

/**
 * Get my listings (products created by this device)
 */
export const fetchMyListings = async (): Promise<ProductData[]> => {
  const deviceId = await getDeviceId();
  const response = await apiRequest<ApiResponse<ProductData[]>>(
    `/products/my/${deviceId}`
  );
  return response.data;
};

/**
 * Get a single product by ID
 */
export const fetchProductById = async (productId: string): Promise<ProductData> => {
  const response = await apiRequest<ApiResponse<ProductData>>(
    `/products/${productId}`
  );
  return response.data;
};

/**
 * Create a new product
 */
export const createProduct = async (
  productData: {
    title: string;
    price: number;
    description: string;
    category: string;
    images: string[]; // Base64 images
    isUpsideDown?: boolean; // For Upside Down products
    seller?: {
      name: string;
      contactNumber?: string;
      address?: string;
      email?: string;
      upiId?: string;
      qrImageUrl?: string;
    };
  }
): Promise<ProductData> => {
  const deviceId = await getDeviceId();
  
  const response = await apiRequest<ApiResponse<ProductData>>('/products', {
    method: 'POST',
    body: JSON.stringify({
      ...productData,
      deviceId,
      isUpsideDown: productData.isUpsideDown || false,
      seller: {
        id: deviceId,
        name: productData.seller?.name || 'Riftory Seller',
        type: productData.isUpsideDown ? 'blackmarket' : 'artisan',
        ...productData.seller,
      },
    }),
  });
  
  return response.data;
};

/**
 * Update a product
 */
export const updateProduct = async (
  productId: string,
  updateData: Partial<ProductData> & { images?: string[] }
): Promise<ProductData> => {
  const deviceId = await getDeviceId();
  
  const response = await apiRequest<ApiResponse<ProductData>>(
    `/products/${productId}`,
    {
      method: 'PUT',
      body: JSON.stringify({ ...updateData, deviceId }),
    }
  );
  
  return response.data;
};

/**
 * Delete a product
 */
export const deleteProduct = async (productId: string): Promise<void> => {
  const deviceId = await getDeviceId();
  
  await apiRequest<ApiResponse<null>>(`/products/${productId}`, {
    method: 'DELETE',
    body: JSON.stringify({ deviceId }),
  });
};

// ============================================
// FAVORITES API
// ============================================

export interface FavoriteData {
  _id: string;
  deviceId: string;
  productId: string;
  product: ProductData;
  savedAt: string;
}

/**
 * Get all favorites for this device
 */
export const fetchFavorites = async (): Promise<FavoriteData[]> => {
  const deviceId = await getDeviceId();
  const response = await apiRequest<ApiResponse<FavoriteData[]>>(
    `/favorites/${deviceId}`
  );
  return response.data;
};

/**
 * Add a product to favorites
 */
export const addFavorite = async (productId: string): Promise<FavoriteData> => {
  const deviceId = await getDeviceId();
  
  const response = await apiRequest<ApiResponse<FavoriteData>>('/favorites', {
    method: 'POST',
    body: JSON.stringify({ deviceId, productId }),
  });
  
  return response.data;
};

/**
 * Remove a product from favorites
 */
export const removeFavorite = async (productId: string): Promise<void> => {
  const deviceId = await getDeviceId();
  
  await apiRequest<ApiResponse<null>>('/favorites', {
    method: 'DELETE',
    body: JSON.stringify({ deviceId, productId }),
  });
};

/**
 * Check if a product is favorited
 */
export const checkIsFavorite = async (productId: string): Promise<boolean> => {
  const deviceId = await getDeviceId();
  
  const response = await apiRequest<{ success: boolean; isFavorite: boolean }>(
    `/favorites/check/${deviceId}/${productId}`
  );
  
  return response.isFavorite;
};

// ============================================
// PROFILE API
// ============================================

export interface ProfileData {
  _id: string;
  deviceId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  avatar?: { url: string; publicId: string };
  settings: {
    notifications: boolean;
    darkMode: boolean;
  };
  createdAt: string;
  lastActive: string;
}

export interface ProfileStats {
  listingsCount: number;
  favoritesCount: number;
}

/**
 * Get or create profile for this device
 */
export const fetchProfile = async (): Promise<ProfileData> => {
  const deviceId = await getDeviceId();
  const response = await apiRequest<ApiResponse<ProfileData>>(
    `/profile/${deviceId}`
  );
  return response.data;
};

/**
 * Update profile
 */
export const updateProfile = async (
  updateData: Partial<Omit<ProfileData, '_id' | 'deviceId' | 'createdAt' | 'lastActive'>> & {
    avatar?: string; // Base64 image
  }
): Promise<ProfileData> => {
  const deviceId = await getDeviceId();
  
  const response = await apiRequest<ApiResponse<ProfileData>>(
    `/profile/${deviceId}`,
    {
      method: 'PUT',
      body: JSON.stringify(updateData),
    }
  );
  
  return response.data;
};

/**
 * Get profile stats
 */
export const fetchProfileStats = async (): Promise<ProfileStats> => {
  const deviceId = await getDeviceId();
  const response = await apiRequest<ApiResponse<ProfileStats>>(
    `/profile/${deviceId}/stats`
  );
  return response.data;
};
