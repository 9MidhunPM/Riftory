// TypeScript interfaces for the marketplace app

/**
 * Seller Types:
 * - 'artisan': Normal mode - craftsmen, small businesses
 * - 'blackmarket': Upside Down mode - mysterious, dangerous sellers
 */
export type SellerType = 'artisan' | 'blackmarket';

export interface Seller {
  id: string;
  name: string;
  rating?: number;
  totalSales?: number;
  // Extended seller contact info for Product Detail page
  contactNumber?: string;
  address?: string;
  email?: string;
  // Seller type for mode-specific display
  type?: SellerType;
  // Payment details
  upiId?: string;
  qrImageUrl?: string;
}

export interface Product {
  id: string;
  title: string;
  price: number; // Price in INR
  imageUrl: string;
  images?: Array<{ url: string; publicId?: string }>; // Multiple images array
  seller: Seller;
  description?: string;
  category?: string;
  createdAt?: string;
  // Enhanced fields for For You page
  eerieDescription?: string; // Short, atmospheric description
  isCursed?: boolean; // For Upside Down mode warning indicator
  videoUrl?: string; // Optional looping video (mock)
  sellerType?: SellerType; // Override seller type for this product
}

/**
 * Favorite item with metadata
 * Stores minimal data for persistence (future MongoDB sync)
 */
export interface FavoriteItem {
  productId: string;
  product: Product;
  savedAt: string; // ISO timestamp
  fromUpsideDown: boolean; // Track which mode it was saved from
}

// ============================================
// NAVIGATION TYPES
// ============================================

/**
 * Home Stack Navigator Params
 * - Used for Stack navigation INSIDE the Home tab
 * - Navigation flow: ProductList → Reels → ProductDetail → AddProduct
 */
export type HomeStackParamList = {
  ProductList: undefined;
  Reels: undefined;
  ProductDetail: { product: Product };
  AddProduct: undefined;
  UpsideDown: undefined;
  AddUpsideDownProduct: undefined;
  UpsideDownReels: undefined;
};

/**
 * My Listings Stack Navigator Params
 * - Used for Stack navigation INSIDE the My Listings tab
 */
export type MyListingsStackParamList = {
  MyListingsMain: undefined;
  ProductDetail: { product: Product };
};

/**
 * Favorites Stack Navigator Params
 * - Used for Stack navigation INSIDE the Favorites tab
 */
export type FavoritesStackParamList = {
  FavoritesMain: undefined;
  ProductDetail: { product: Product };
};

/**
 * Root Tab Navigator Params
 * - Bottom tab navigation with 4 tabs
 * - Home tab contains a nested Stack navigator (HomeStack)
 * - MyListings tab contains a nested Stack navigator (MyListingsStack)
 * - Profile tab shows the EditProfile screen directly
 */
export type RootTabParamList = {
  HomeTab: undefined; // Contains HomeStack navigator
  MyListings: undefined; // Contains MyListingsStack navigator
  Favorites: undefined;
  Profile: undefined; // Direct EditProfile screen
};

/**
 * Settings Stack Navigator Params
 * - Used for Stack navigation INSIDE the Settings tab
 */
export type SettingsStackParamList = {
  SettingsMain: undefined;
  EditProfile: undefined;
};
