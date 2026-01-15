import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useRef, useState } from 'react';
import {
    Animated,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProductCard } from '../components';
import {
    addFavorite,
    fetchFavorites,
    fetchUpsideDownProducts,
    ProductData,
    removeFavorite,
} from '../services/api';
import { HomeStackParamList, Product } from '../types';

type NavigationProp = NativeStackNavigationProp<HomeStackParamList, 'UpsideDown'>;

// Creepy purple color palette
const creepyColors = {
  background: '#0a0612',
  backgroundSecondary: '#120a1f',
  primary: '#9b30ff',
  accent: '#ff1493',
  text: '#e8d5ff',
  textMuted: '#6b4d8a',
  glow: '#bf5fff',
  danger: '#ff3366',
};

const UpsideDownScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  // Animations
  const flickerAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const fabScaleAnim = useRef(new Animated.Value(0)).current;

  const convertToProduct = (apiProduct: ProductData): Product => ({
    id: apiProduct._id || apiProduct.id || '',
    title: apiProduct.title,
    price: apiProduct.price,
    imageUrl: apiProduct.imageUrl || apiProduct.images?.[0]?.url || 'https://via.placeholder.com/400',
    images: apiProduct.images || [],
    description: apiProduct.description,
    category: apiProduct.category,
    createdAt: apiProduct.createdAt,
    seller: apiProduct.seller
      ? {
          id: apiProduct.seller.id || '',
          name: apiProduct.seller.name || '???',
          rating: apiProduct.seller.rating,
          totalSales: apiProduct.seller.totalSales,
          contactNumber: apiProduct.seller.contactNumber,
          address: apiProduct.seller.address,
          email: apiProduct.seller.email,
          type: 'blackmarket',
        }
      : { id: '', name: '???' },
  });

  useFocusEffect(
    useCallback(() => {
      loadProducts();
      loadFavorites();

      // Start creepy animations
      startFlickerAnimation();
      startFloatAnimation();

      // Animate FAB entrance
      Animated.spring(fabScaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        delay: 300,
        useNativeDriver: true,
      }).start();

      // Haptic on enter
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

      return () => {
        fabScaleAnim.setValue(0);
      };
    }, [])
  );

  const startFlickerAnimation = () => {
    const flicker = () => {
      const randomOpacity = 0.7 + Math.random() * 0.3;
      Animated.timing(flickerAnim, {
        toValue: randomOpacity,
        duration: 50 + Math.random() * 150,
        useNativeDriver: true,
      }).start(() => {
        setTimeout(flicker, Math.random() * 2000 + 500);
      });
    };
    flicker();
  };

  const startFloatAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -8,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 8,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await fetchUpsideDownProducts();
      setProducts(data.map(convertToProduct));
    } catch (error) {
      console.error('[UpsideDown] Error loading products:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadFavorites = async () => {
    try {
      const favorites = await fetchFavorites();
      const ids = new Set(favorites.map((fav) => fav.product._id || fav.product.id || ''));
      setFavoriteIds(ids);
    } catch (error) {
      console.error('[UpsideDown] Error loading favorites:', error);
    }
  };

  const handleFavoritePress = async (product: Product) => {
    const productId = product.id;
    const isFavorite = favoriteIds.has(productId);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      if (isFavorite) {
        await removeFavorite(productId);
        setFavoriteIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });
      } else {
        await addFavorite(productId);
        setFavoriteIds((prev) => new Set(prev).add(productId));
      }
    } catch (error) {
      console.error('[UpsideDown] Error toggling favorite:', error);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    loadProducts();
    loadFavorites();
  };

  const handleProductPress = (product: Product) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('ProductDetail', { product });
  };

  const handleAddProduct = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    navigation.navigate('AddUpsideDownProduct');
  };

  const handleReelsPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('UpsideDownReels');
  };

  const handleGoBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.goBack();
  };

  const renderProduct = ({ item, index }: { item: Product; index: number }) => (
    <ProductCard
      product={item}
      onPress={handleProductPress}
      onFavoritePress={handleFavoritePress}
      isFavorite={favoriteIds.has(item.id)}
      isCreepy={true}
      index={index}
    />
  );

  const renderHeader = () => (
    <Animated.View style={[styles.header, { opacity: flickerAnim }]}>
      <LinearGradient
        colors={['#1a0a2e', '#0a0612', 'transparent']}
        style={styles.headerGradient}
      >
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Ionicons name="chevron-back" size={28} color={creepyColors.text} />
        </TouchableOpacity>

        <Animated.View style={{ transform: [{ translateY: floatAnim }], flex: 1 }}>
          <Text style={styles.headerTitle}>☠️ UPSIDE DOWN ☠️</Text>
          <Text style={styles.headerSubtitle}>
            {products.length} cursed item{products.length !== 1 ? 's' : ''} lurking...
          </Text>
        </Animated.View>

        <View style={styles.headerSpacer} />
      </LinearGradient>

      {/* Creepy decorative elements */}
      <View style={styles.glitchLine} />
    </Animated.View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Animated.Text
        style={[styles.emptyIcon, { transform: [{ translateY: floatAnim }] }]}
      >
        👁️
      </Animated.Text>
      <Text style={styles.emptyTitle}>The void is empty...</Text>
      <Text style={styles.emptySubtitle}>
        Be the first to list something forbidden
      </Text>
      <TouchableOpacity style={styles.emptyButton} onPress={handleAddProduct}>
        <LinearGradient
          colors={[creepyColors.primary, creepyColors.accent]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.emptyButtonGradient}
        >
          <Text style={styles.emptyButtonText}>+ Add Cursed Item</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Animated background particles */}
      <View style={styles.particlesContainer}>
        {[...Array(20)].map((_, i) => (
          <Animated.View
            key={i}
            style={[
              styles.particle,
              {
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: flickerAnim,
                transform: [{ scale: 0.3 + Math.random() * 0.7 }],
              },
            ]}
          />
        ))}
      </View>

      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {renderHeader()}

        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[creepyColors.primary]}
              tintColor={creepyColors.primary}
              progressBackgroundColor={creepyColors.backgroundSecondary}
            />
          }
          showsVerticalScrollIndicator={false}
        />

        {/* Reels FAB */}
        <Animated.View
          style={[styles.reelsFab, { transform: [{ scale: fabScaleAnim }] }]}
        >
          <TouchableOpacity onPress={handleReelsPress} activeOpacity={0.8}>
            <LinearGradient
              colors={[creepyColors.accent, '#8b008b']}
              style={styles.fabGradient}
            >
              <Ionicons name="play" size={24} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Add Product FAB */}
        <Animated.View
          style={[styles.addFab, { transform: [{ scale: fabScaleAnim }] }]}
        >
          <TouchableOpacity onPress={handleAddProduct} activeOpacity={0.8}>
            <LinearGradient
              colors={[creepyColors.primary, '#4a0080']}
              style={styles.fabGradient}
            >
              <Ionicons name="add" size={28} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>

      {/* Bottom gradient fade */}
      <LinearGradient
        colors={['transparent', creepyColors.background]}
        style={styles.bottomFade}
        pointerEvents="none"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: creepyColors.background,
  },
  safeArea: {
    flex: 1,
  },
  particlesContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: creepyColors.primary,
    shadowColor: creepyColors.glow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  header: {
    paddingBottom: 8,
  },
  headerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(155, 48, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(155, 48, 255, 0.4)',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: creepyColors.text,
    textAlign: 'center',
    letterSpacing: 2,
    textShadowColor: creepyColors.glow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  headerSubtitle: {
    fontSize: 12,
    color: creepyColors.textMuted,
    textAlign: 'center',
    marginTop: 4,
    fontStyle: 'italic',
  },
  headerSpacer: {
    width: 40,
  },
  glitchLine: {
    height: 1,
    backgroundColor: creepyColors.primary,
    opacity: 0.3,
    marginHorizontal: 16,
    shadowColor: creepyColors.glow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  listContent: {
    padding: 8,
    paddingBottom: 120,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: creepyColors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: creepyColors.textMuted,
    marginBottom: 24,
    fontStyle: 'italic',
  },
  emptyButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  emptyButtonGradient: {
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  emptyButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  reelsFab: {
    position: 'absolute',
    bottom: 100,
    left: 20,
  },
  addFab: {
    position: 'absolute',
    bottom: 100,
    right: 20,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: creepyColors.glow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  bottomFade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
});

export default UpsideDownScreen;
