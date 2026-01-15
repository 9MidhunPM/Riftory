import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    FlatList,
    Image,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from '../components';
import GradientHeader from '../components/GradientHeader';
import { deleteProduct, fetchMyListings, ProductData } from '../services/api';
import theme from '../theme';
import { MyListingsStackParamList, Product } from '../types';

type MyListingsNavigationProp = NativeStackNavigationProp<MyListingsStackParamList, 'MyListingsMain'>;

// Animated Listing Card Component
const ListingCard: React.FC<{
  item: ProductData;
  index: number;
  onView: (item: ProductData) => void;
  onDelete: (item: ProductData) => void;
}> = ({ item, index, onView, onDelete }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(fadeAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        delay: index * 80,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        delay: index * 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      tension: 300,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 300,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`;

  return (
    <Animated.View
      style={[
        styles.cardAnimated,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.listingCard}
        onPress={() => onView(item)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        {/* Image with gradient overlay */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: item.imageUrl || item.images?.[0]?.url || 'https://via.placeholder.com/100' }}
            style={styles.listingImage}
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.3)']}
            style={styles.imageOverlay}
          />
          {item.images && item.images.length > 1 && (
            <View style={styles.imageBadge}>
              <Ionicons name="images-outline" size={10} color="#fff" />
              <Text style={styles.imageBadgeText}>{item.images.length}</Text>
            </View>
          )}
        </View>

        {/* Info section */}
        <View style={styles.listingInfo}>
          <Text style={styles.listingTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.listingPrice}>{formatPrice(item.price)}</Text>
          {item.category && (
            <LinearGradient
              colors={['rgba(229, 9, 20, 0.2)', 'rgba(229, 9, 20, 0.1)']}
              style={styles.categoryBadge}
            >
              <Text style={styles.categoryText}>{item.category}</Text>
            </LinearGradient>
          )}
        </View>

        {/* Actions */}
        <View style={styles.listingActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onView(item)}
          >
            <Ionicons name="eye-outline" size={18} color={theme.colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => onDelete(item)}
          >
            <Ionicons name="trash-outline" size={18} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Bottom accent */}
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.accent, theme.colors.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.cardAccent}
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

/**
 * My Listings Screen
 * 
 * Shows user's own product listings from MongoDB.
 * - Fetches products by device ID
 * - Allows deletion of own products
 */
const MyListingsScreen: React.FC = () => {
  const navigation = useNavigation<MyListingsNavigationProp>();
  const [listings, setListings] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load listings when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadListings();
      return () => {};
    }, [])
  );

  const loadListings = async () => {
    try {
      const data = await fetchMyListings();
      setListings(data);
    } catch (error) {
      console.error('[MyListingsScreen] Error loading listings:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadListings();
  };

  const handleDelete = (item: ProductData) => {
    Alert.alert(
      'Delete Listing',
      `Are you sure you want to delete "${item.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProduct(item._id || item.id || '');
              setListings((prev) => prev.filter((l) => l._id !== item._id));
            } catch (error) {
              console.error('[MyListingsScreen] Delete error:', error);
              Alert.alert('Error', 'Failed to delete listing');
            }
          },
        },
      ]
    );
  };

  const handleViewDetails = (item: ProductData) => {
    // Convert to Product type for navigation
    const product: Product = {
      id: item._id || item.id || '',
      title: item.title,
      price: item.price,
      imageUrl: item.imageUrl || item.images?.[0]?.url || '',
      images: item.images, // Include all images for carousel
      description: item.description,
      category: item.category,
      createdAt: item.createdAt,
      seller: item.seller as Product['seller'],
    };
    navigation.navigate('ProductDetail', { product });
  };

  const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`;

  const renderItem = ({ item, index }: { item: ProductData; index: number }) => (
    <ListingCard
      item={item}
      index={index}
      onView={handleViewDetails}
      onDelete={handleDelete}
    />
  );

  const renderEmpty = () => (
    <EmptyState
      title="No Listings Yet"
      message="Products you list will appear here. Tap the + button on Home to add your first listing!"
      iconName="pricetag-outline"
    />
  );

  // Skeleton loader
  const SkeletonCard = () => (
    <View style={styles.skeletonCard}>
      <View style={styles.skeletonImage} />
      <View style={styles.skeletonInfo}>
        <View style={styles.skeletonTitle} />
        <View style={styles.skeletonPrice} />
        <View style={styles.skeletonCategory} />
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <GradientHeader
          title="My Listings"
          subtitle="Your products"
        />
        <View style={styles.listContent}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <GradientHeader
        title="My Listings"
        subtitle={`${listings.length} ${listings.length === 1 ? 'product' : 'products'} listed`}
      />

      <FlatList
        data={listings}
        renderItem={renderItem}
        keyExtractor={(item) => item._id || item.id || Math.random().toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
    flexGrow: 1,
  },
  cardAnimated: {
    marginBottom: 14,
  },
  listingCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.backgroundTertiary,
    borderRadius: theme.borderRadius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(229, 9, 20, 0.15)',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  imageContainer: {
    position: 'relative',
  },
  listingImage: {
    width: 85,
    height: 85,
    borderRadius: 12,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 12,
  },
  imageBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
  },
  imageBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  listingInfo: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  listingTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  listingPrice: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.primary,
    marginBottom: 8,
    textShadowColor: 'rgba(229, 9, 20, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(229, 9, 20, 0.3)',
  },
  categoryText: {
    fontSize: 11,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  listingActions: {
    justifyContent: 'space-around',
    paddingLeft: 10,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  deleteButton: {
    backgroundColor: 'rgba(229, 9, 20, 0.15)',
    borderColor: 'rgba(229, 9, 20, 0.3)',
  },
  cardAccent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
  },
  // Skeleton styles
  skeletonCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.backgroundTertiary,
    borderRadius: theme.borderRadius.lg,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  skeletonImage: {
    width: 85,
    height: 85,
    borderRadius: 12,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  skeletonInfo: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  skeletonTitle: {
    height: 16,
    width: '80%',
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonPrice: {
    height: 20,
    width: '50%',
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonCategory: {
    height: 14,
    width: '40%',
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 10,
  },
});

export default MyListingsScreen;
