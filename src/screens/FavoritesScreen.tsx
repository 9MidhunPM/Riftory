import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import {
    FlatList,
    RefreshControl,
    StyleSheet
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState, ProductCard } from '../components';
import GradientHeader from '../components/GradientHeader';
import { ProductGridSkeleton } from '../components/ProductCardSkeleton';
import { FavoriteData, fetchFavorites, ProductData } from '../services/api';
import theme from '../theme';
import { FavoritesStackParamList, Product } from '../types';

/**
 * Favorites Screen
 * 
 * Displays all products that have been added to favorites from MongoDB.
 * Products can be favorited via double-tap in Reels/ForYou screen.
 */

type FavoritesNavigationProp = NativeStackNavigationProp<FavoritesStackParamList>;

const FavoritesScreen: React.FC = () => {
  const navigation = useNavigation<FavoritesNavigationProp>();
  const [favorites, setFavorites] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Convert API product to app Product type
  const convertToProduct = (apiProduct: ProductData): Product => ({
    id: apiProduct._id || apiProduct.id || '',
    title: apiProduct.title,
    price: apiProduct.price,
    imageUrl: apiProduct.imageUrl || apiProduct.images?.[0]?.url || 'https://via.placeholder.com/400',
    images: apiProduct.images, // Include all images for carousel
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

  // Load favorites when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadFavorites();
      return () => {};
    }, [])
  );

  const loadFavorites = async () => {
    try {
      const data = await fetchFavorites();
      // Extract product from favorite data
      const products = data.map((fav: FavoriteData) => fav.product);
      setFavorites(products);
    } catch (error) {
      console.error('[FavoritesScreen] Error loading favorites:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadFavorites();
  };

  const handleProductPress = (product: Product) => {
    navigation.navigate('ProductDetail', { product });
  };

  const renderProduct = ({ item }: { item: ProductData }) => (
    <ProductCard product={convertToProduct(item)} onPress={handleProductPress} />
  );

  const renderEmpty = () => (
    <EmptyState
      title="No Favorites Yet"
      message="Start browsing and tap the heart on items you love to save them here!"
      iconName="heart-outline"
    />
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <GradientHeader
          title="Favorites"
          subtitle="Your saved products"
        />
        <ProductGridSkeleton count={6} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <GradientHeader
        title="Favorites"
        subtitle={favorites.length > 0
          ? `${favorites.length} saved item${favorites.length !== 1 ? 's' : ''}`
          : 'Your saved products will appear here'}
      />
      
      <FlatList
        data={favorites}
        renderItem={renderProduct}
        keyExtractor={(item) => item._id || item.id || Math.random().toString()}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
            progressBackgroundColor={theme.colors.backgroundSecondary}
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  listContent: {
    padding: 8,
    paddingBottom: 100,
    flexGrow: 1,
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
});

export default FavoritesScreen;
