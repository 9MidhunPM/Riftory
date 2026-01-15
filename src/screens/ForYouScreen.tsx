import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    RefreshControl,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ViewToken,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import EnhancedReelItem from '../components/EnhancedReelItem';
import { fetchAllProducts, ProductData } from '../services/api';
import theme from '../theme';
import { Product } from '../types';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

// Calculate item height (full screen minus any system UI)
const ITEM_HEIGHT = SCREEN_HEIGHT;

type RootStackParamList = {
  ProductDetail: { product: Product };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Number of times to duplicate products for infinite scroll effect
const LOOP_MULTIPLIER = 10;

const ForYouScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loopedProducts, setLoopedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

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

  // Load products from API
  const loadProducts = useCallback(async () => {
    try {
      const data = await fetchAllProducts();
      const convertedProducts = data.map(convertToProduct);
      // Shuffle for variety
      const shuffled = [...convertedProducts].sort(() => Math.random() - 0.5);
      setProducts(shuffled);
      // Create looped array for infinite scroll
      const looped: Product[] = [];
      for (let i = 0; i < LOOP_MULTIPLIER; i++) {
        shuffled.forEach((product, idx) => {
          looped.push({ ...product, id: `${product.id}_loop${i}_${idx}` });
        });
      }
      setLoopedProducts(looped);
    } catch (error) {
      console.error('[ForYouScreen] Error loading products:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Load products when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadProducts();
      return () => {};
    }, [loadProducts])
  );

  // Handle refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadProducts();
  }, [loadProducts]);

  // Navigate to product detail
  const handleViewDetails = useCallback((product: Product) => {
    navigation.navigate('ProductDetail', { product });
  }, [navigation]);

  // Track visible item for optimizations
  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  // Optimized getItemLayout for snap scrolling
  const getItemLayout = useCallback((_: any, index: number) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  }), []);

  // Render each reel item
  const renderItem = useCallback(({ item, index }: { item: Product; index: number }) => (
    <EnhancedReelItem
      product={item}
      isActive={index === currentIndex}
      onViewDetails={handleViewDetails}
      screenHeight={ITEM_HEIGHT}
    />
  ), [currentIndex, handleViewDetails]);

  // Key extractor - use the unique looped id
  const keyExtractor = useCallback((item: Product) => item.id, []);

  // Handle back button
  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // Loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading products...</Text>
      </View>
    );
  }

  // Empty state
  if (products.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <Text style={styles.emptyIcon}>📦</Text>
        <Text style={styles.emptyTitle}>No Products Found</Text>
        <Text style={styles.emptySubtitle}>
          Pull down to refresh
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <FlatList
        ref={flatListRef}
        data={loopedProducts}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        pagingEnabled
        snapToInterval={ITEM_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        getItemLayout={getItemLayout}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        initialNumToRender={2}
        maxToRenderPerBatch={3}
        windowSize={5}
        removeClippedSubviews
        disableIntervalMomentum={true}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
            progressBackgroundColor={theme.colors.backgroundSecondary}
          />
        }
      />

      {/* Header with Back Button and For You text */}
      <SafeAreaView style={styles.headerContainer} edges={['top']}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>For You</Text>
        <View style={styles.headerSpacer} />
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.textMuted,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  backButton: {
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
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    textShadowColor: theme.colors.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  headerSpacer: {
    width: 40,
  },
});

export default ForYouScreen;
