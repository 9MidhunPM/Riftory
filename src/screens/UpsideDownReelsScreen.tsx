import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
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
import { fetchUpsideDownProducts, ProductData } from '../services/api';
import { Product } from '../types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const ITEM_HEIGHT = SCREEN_HEIGHT;

// Creepy purple color palette
const creepyColors = {
  background: '#0a0612',
  backgroundSecondary: '#120a1f',
  primary: '#9b30ff',
  accent: '#ff1493',
  text: '#e8d5ff',
  textMuted: '#6b4d8a',
  glow: '#bf5fff',
  border: '#3d1a5c',
};

type RootStackParamList = {
  ProductDetail: { product: Product };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const LOOP_MULTIPLIER = 10;

const UpsideDownReelsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loopedProducts, setLoopedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  // Creepy flickering animation for title
  const flickerAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const flicker = () => {
      Animated.sequence([
        Animated.timing(flickerAnim, { toValue: 0.3, duration: 50, useNativeDriver: true }),
        Animated.timing(flickerAnim, { toValue: 1, duration: 50, useNativeDriver: true }),
        Animated.timing(flickerAnim, { toValue: 0.5, duration: 100, useNativeDriver: true }),
        Animated.timing(flickerAnim, { toValue: 1, duration: 50, useNativeDriver: true }),
      ]).start();
    };

    const interval = setInterval(flicker, 3000 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, [flickerAnim]);

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
      name: apiProduct.seller.name || '???',
      rating: apiProduct.seller.rating,
      totalSales: apiProduct.seller.totalSales,
      contactNumber: apiProduct.seller.contactNumber,
      address: apiProduct.seller.address,
      email: apiProduct.seller.email,
      type: 'blackmarket' as const,
    } : {
      id: '',
      name: '???',
      type: 'blackmarket' as const,
    },
  });

  // Load products from API
  const loadProducts = useCallback(async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      const data = await fetchUpsideDownProducts();
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
      console.error('[UpsideDownReels] Error loading products:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProducts();
      return () => {};
    }, [loadProducts])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadProducts();
  }, [loadProducts]);

  const handleViewDetails = useCallback((product: Product) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('ProductDetail', { product });
  }, [navigation]);

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const getItemLayout = useCallback((_: any, index: number) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  }), []);

  const renderItem = useCallback(({ item, index }: { item: Product; index: number }) => (
    <EnhancedReelItem
      product={item}
      isActive={index === currentIndex}
      onViewDetails={handleViewDetails}
      screenHeight={ITEM_HEIGHT}
    />
  ), [currentIndex, handleViewDetails]);

  const keyExtractor = useCallback((item: Product) => item.id, []);

  const handleGoBack = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.goBack();
  }, [navigation]);

  // Loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor={creepyColors.background} />
        <ActivityIndicator size="large" color={creepyColors.primary} />
        <Animated.Text style={[styles.loadingText, { opacity: flickerAnim }]}>
          Entering the void...
        </Animated.Text>
      </View>
    );
  }

  // Empty state
  if (products.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <StatusBar barStyle="light-content" backgroundColor={creepyColors.background} />
        <SafeAreaView style={styles.emptyHeader} edges={['top']}>
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
        </SafeAreaView>
        <Text style={styles.emptyIcon}>👁️</Text>
        <Text style={styles.emptyTitle}>The Void is Empty</Text>
        <Text style={styles.emptySubtitle}>
          No cursed items have been summoned yet...{'\n'}Add your first forbidden item.
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
            tintColor={creepyColors.primary}
            colors={[creepyColors.primary]}
            progressBackgroundColor={creepyColors.backgroundSecondary}
          />
        }
      />

      {/* Header with Back Button and Title */}
      <SafeAreaView style={styles.headerContainer} edges={['top']}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Animated.Text style={[styles.headerTitle, { opacity: flickerAnim }]}>
          ☠️ Forbidden Reels
        </Animated.Text>
        <View style={styles.headerSpacer} />
      </SafeAreaView>

      {/* Vignette effect overlay */}
      <View style={styles.vignetteTop} pointerEvents="none" />
      <View style={styles.vignetteBottom} pointerEvents="none" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: creepyColors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: creepyColors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: creepyColors.textMuted,
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: creepyColors.background,
    padding: 40,
  },
  emptyHeader: {
    position: 'absolute',
    top: 0,
    left: 16,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: creepyColors.text,
    marginBottom: 8,
    textShadowColor: creepyColors.glow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: creepyColors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
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
    backgroundColor: 'rgba(155, 48, 255, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: creepyColors.border,
  },
  backButtonText: {
    fontSize: 24,
    color: creepyColors.text,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: creepyColors.text,
    textShadowColor: creepyColors.glow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  headerSpacer: {
    width: 40,
  },
  vignetteTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
    shadowColor: creepyColors.primary,
    shadowOffset: { width: 0, height: 50 },
    shadowOpacity: 0.5,
    shadowRadius: 50,
  },
  vignetteBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: 'transparent',
    shadowColor: creepyColors.accent,
    shadowOffset: { width: 0, height: -50 },
    shadowOpacity: 0.5,
    shadowRadius: 50,
  },
});

export default UpsideDownReelsScreen;
