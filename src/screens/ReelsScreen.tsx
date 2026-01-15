import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import {
    Dimensions,
    FlatList,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import ReelItem from '../components/ReelItem';
import { fetchAllProducts, ProductData } from '../services/api';
import theme from '../theme';
import { HomeStackParamList, Product } from '../types';

/**
 * ReelsScreen - Full-screen vertical product browsing
 * 
 * REELS SCROLLING LOGIC:
 * - Uses FlatList with pagingEnabled for snap-to-screen scrolling
 * - Each item height = screen height (minus status bar for full-screen feel)
 * - snapToInterval ensures each scroll lands exactly on a product
 * - decelerationRate="fast" makes scrolling feel snappy
 * - Horizontal scrolling is completely disabled
 * 
 * NAVIGATION FLOW:
 * Home → Reels → Product Detail
 * - Single tap on reel → navigates to ProductDetail with full product object
 * - Back button returns to Reels, then to Home
 */

type ReelsNavigationProp = NativeStackNavigationProp<HomeStackParamList, 'Reels'>;

const ReelsScreen: React.FC = () => {
  const navigation = useNavigation<ReelsNavigationProp>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Get screen dimensions for full-screen items
  // Using window height for each reel item
  const screenHeight = Dimensions.get('window').height;

  // Convert API product to app Product type
  const convertToProduct = (apiProduct: ProductData): Product => ({
    id: apiProduct._id || apiProduct.id || '',
    title: apiProduct.title,
    price: apiProduct.price,
    imageUrl: apiProduct.imageUrl || apiProduct.images?.[0]?.url || 'https://via.placeholder.com/400',
    images: apiProduct.images || [],
    description: apiProduct.description,
    category: apiProduct.category,
    createdAt: apiProduct.createdAt,
    seller: apiProduct.seller ? {
      id: apiProduct.seller.id || '',
      name: apiProduct.seller.name || 'Unknown Seller',
      rating: apiProduct.seller.rating,
      totalSales: apiProduct.seller.totalSales,
      contactNumber: apiProduct.seller.contactNumber,
      address: apiProduct.seller.address,
      email: apiProduct.seller.email,
      type: (apiProduct.seller.type as 'artisan' | 'blackmarket') || 'artisan',
    } : {
      id: '',
      name: 'Unknown Seller',
    },
  });

  // Load products when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadProducts();
      return () => {};
    }, [])
  );

  const loadProducts = async () => {
    try {
      const data = await fetchAllProducts();
      const convertedProducts = data.map(convertToProduct);
      setProducts(convertedProducts);
    } catch (error) {
      console.error('[ReelsScreen] Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle single tap - navigate to product detail
  const handleSingleTap = useCallback((product: Product) => {
    navigation.navigate('ProductDetail', { product });
  }, [navigation]);

  // Render each reel item
  const renderReel = useCallback(({ item }: { item: Product }) => (
    <ReelItem
      product={item}
      onSingleTap={handleSingleTap}
      screenHeight={screenHeight}
    />
  ), [handleSingleTap, screenHeight]);

  // Key extractor for FlatList performance
  const keyExtractor = useCallback((item: Product) => item.id, []);

  // Get item layout for optimized scrolling (fixed height items)
  const getItemLayout = useCallback((_: any, index: number) => ({
    length: screenHeight,
    offset: screenHeight * index,
    index,
  }), [screenHeight]);

  // Handle empty product list edge case
  if (!loading && products.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>📦</Text>
        <Text style={styles.emptyTitle}>No Products</Text>
        <Text style={styles.emptyMessage}>
          There are no products to display in reels mode.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Hide status bar for immersive experience */}
      <StatusBar hidden />
      
      {/* Back button - positioned at top left */}
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
        activeOpacity={0.7}
      >
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      {/**
       * FlatList Configuration for Reels:
       * - pagingEnabled: Snaps to each item boundary
       * - snapToInterval: Exactly one screen height per snap
       * - decelerationRate: Fast for snappy scrolling feel
       * - showsVerticalScrollIndicator: Hidden for clean UI
       * - horizontal: false (vertical only)
       * - getItemLayout: Optimizes scrolling for fixed-height items
       */}
      <FlatList
        data={products}
        renderItem={renderReel}
        keyExtractor={keyExtractor}
        pagingEnabled
        snapToInterval={screenHeight}
        snapToAlignment="start"
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        horizontal={false}
        getItemLayout={getItemLayout}
        // Disable horizontal scroll completely
        scrollEnabled
        bounces={false}
        // Require longer scroll gesture to change reels
        scrollEventThrottle={16}
        disableIntervalMomentum={true}
        // Performance optimizations
        removeClippedSubviews
        maxToRenderPerBatch={2}
        windowSize={3}
        initialNumToRender={1}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(229, 9, 20, 0.3)',
  },
  backButtonText: {
    fontSize: 24,
    color: theme.colors.textPrimary,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
});

export default ReelsScreen;
