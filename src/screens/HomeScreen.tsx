import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useRef, useState } from 'react';
import {
    Animated,
    FlatList,
    NativeScrollEvent,
    NativeSyntheticEvent,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState, FloatingActionButton, ProductCard } from '../components';
import GradientHeader from '../components/GradientHeader';
import { ProductGridSkeleton } from '../components/ProductCardSkeleton';
import { addFavorite, fetchAllProducts, fetchFavorites, ProductData, removeFavorite } from '../services/api';
import theme from '../theme';
import { HomeStackParamList, Product } from '../types';

// Navigation type for HomeStack
type HomeScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList, 'ProductList'>;

/**
 * HomeScreen (Product List)
 * 
 * DATA FLOW TO PRODUCT DETAIL:
 * 1. Products are loaded from API (MongoDB)
 * 2. When user taps a ProductCard, handleProductPress is called
 * 3. The full product object is passed to ProductDetail via navigation params
 * 4. No refetch needed in ProductDetail - data comes from here
 */
const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  
  // Animations
  const fabScaleAnim = useRef(new Animated.Value(0)).current;
  const fabRotateAnim = useRef(new Animated.Value(0)).current;

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

  // Load products and favorites when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadProducts();
      loadFavorites();
      
      // Animate FAB entrance
      Animated.spring(fabScaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        delay: 300,
        useNativeDriver: true,
      }).start();
      
      return () => {
        fabScaleAnim.setValue(0);
      };
    }, [])
  );

  // Triple overscroll detector for Upside Down access
  // Scroll to bottom and keep trying to scroll down 3 times
  const overscrollCountRef = useRef(0);
  const lastOverscrollRef = useRef(0);
  const isAtBottomRef = useRef(false);
  const OVERSCROLL_WINDOW = 3000; // ms window to count consecutive overscrolls

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 50;
    const atBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
    isAtBottomRef.current = atBottom;
  };

  const handleScrollEndDrag = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize, velocity } = event.nativeEvent;
    const paddingToBottom = 50;
    const atBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
    
    // Detect if user is at bottom and trying to scroll further down (velocity.y < 0 means scrolling down)
    if (atBottom && velocity && velocity.y < -0.5) {
      const now = Date.now();
      if (now - lastOverscrollRef.current > OVERSCROLL_WINDOW) {
        overscrollCountRef.current = 0;
      }
      overscrollCountRef.current += 1;
      lastOverscrollRef.current = now;

      // Haptic feedback each overscroll attempt
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      if (overscrollCountRef.current >= 3) {
        overscrollCountRef.current = 0;
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        navigation.navigate('UpsideDown');
      }
    }
  };

  // Filter products based on search
  const filteredProducts = products.filter(product => 
    product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.seller.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const loadProducts = async () => {
    try {
      const data = await fetchAllProducts();
      const convertedProducts = data.map(convertToProduct);
      setProducts(convertedProducts);
    } catch (error) {
      console.error('[HomeScreen] Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    try {
      const favorites = await fetchFavorites();
      const ids = new Set(favorites.map(fav => fav.product._id || fav.product.id || ''));
      setFavoriteIds(ids);
    } catch (error) {
      console.error('[HomeScreen] Error loading favorites:', error);
    }
  };

  const handleFavoritePress = async (product: Product) => {
    const productId = product.id;
    const isFavorite = favoriteIds.has(productId);
    
    try {
      if (isFavorite) {
        await removeFavorite(productId);
        setFavoriteIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });
      } else {
        await addFavorite(productId);
        setFavoriteIds(prev => new Set(prev).add(productId));
      }
    } catch (error) {
      console.error('[HomeScreen] Error toggling favorite:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  };

  const handleProductPress = (product: Product) => {
    navigation.navigate('ProductDetail', { product });
  };

  const renderProduct = ({ item, index }: { item: Product; index: number }) => (
    <ProductCard 
      product={item} 
      onPress={handleProductPress} 
      onFavoritePress={handleFavoritePress}
      isFavorite={favoriteIds.has(item.id)}
      index={index} 
    />
  );

  const renderEmpty = () => (
    <EmptyState
      title="No Products Available"
      message="There are no products listed yet. Check back later!"
    />
  );

  // Navigate to Reels screen when FAB is pressed
  const handleReelsPress = () => {
    navigation.navigate('Reels');
  };

  // Navigate to Add Product screen
  const handleAddProductPress = () => {
    // Rotate animation on press
    Animated.sequence([
      Animated.timing(fabRotateAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fabRotateAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
    
    navigation.navigate('AddProduct');
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const fabRotation = fabRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg'],
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <GradientHeader
          title="Home"
          subtitle="Discover amazing products"
        />
        <ProductGridSkeleton count={6} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <GradientHeader
        title="Home"
        subtitle={`${products.length} products available`}
      />

      {/* Search Results Bar */}
      {searchQuery.length > 0 && (
        <View style={styles.searchResultsBar}>
          <Text style={styles.searchResultsText}>
            {filteredProducts.length} result{filteredProducts.length !== 1 ? 's' : ''} for "{searchQuery}"
          </Text>
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
        onScroll={handleScroll}
        onScrollEndDrag={handleScrollEndDrag}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
            progressBackgroundColor={theme.colors.backgroundSecondary}
          />
        }
        showsVerticalScrollIndicator={false}
      />
      
      {/* Floating Action Button - navigates to Reels */}
      <FloatingActionButton onPress={handleReelsPress} />
      
      {/* Add Product FAB - bottom right with premium styling */}
      <Animated.View 
        style={[
          styles.addProductFabContainer,
          { 
            transform: [
              { scale: fabScaleAnim },
              { rotate: fabRotation },
            ] 
          }
        ]}
      >
        <TouchableOpacity
          style={styles.addProductFab}
          onPress={handleAddProductPress}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[theme.colors.primary, '#b8070f']}
            style={styles.addProductFabGradient}
          >
            <Ionicons name="add" size={28} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
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
    marginTop: 12,
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  searchResultsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: theme.colors.backgroundSecondary,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  searchResultsText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  listContent: {
    padding: 8,
    paddingBottom: 100, // Space for tab bar and FABs
    flexGrow: 1,
  },
  addProductFabContainer: {
    position: 'absolute',
    bottom: 95,
    right: 20,
  },
  addProductFab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  addProductFabGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HomeScreen;
