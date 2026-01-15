import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    FlatList,
    Image,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
    ViewToken,
} from 'react-native';
import { addFavorite, checkIsFavorite, removeFavorite } from '../services/api';
import theme from '../theme';
import { Product } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * ENHANCED REEL ITEM - For You Page Component
 * 
 * Features:
 * - Full-screen product display with ambient overlays
 * - Double-tap to like with heart burst animation
 * - Single tap to toggle UI visibility (immersive mode)
 * - Long press for quick actions menu
 * - Parallax effect on background image
 * - Fade-in text overlays
 * - Action buttons on right side (middle-bottom area)
 * 
 * GESTURE HANDLING:
 * - Horizontal swipe: Navigate through product images
 * - Vertical swipe: Navigate between reels
 * - Tap like button: Like/unlike product
 */

interface EnhancedReelItemProps {
  product: Product;
  onViewDetails: (product: Product) => void;
  screenHeight: number;
  isActive: boolean; // Whether this reel is currently visible
}

const EnhancedReelItem: React.FC<EnhancedReelItemProps> = ({
  product,
  onViewDetails,
  screenHeight,
  isActive,
}) => {
  const [imageError, setImageError] = useState(false);
  const [showUI, setShowUI] = useState(true); // UI visibility toggle
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [erroredImages, setErroredImages] = useState<Set<number>>(new Set());
  const imageFlatListRef = useRef<FlatList>(null);

  // Extract original product ID (remove _loop suffix for API calls)
  // The ForYouScreen adds "_loop{N}_{idx}" suffix for infinite scroll
  const getOriginalProductId = (id: string): string => {
    const loopMatch = id.match(/^(.+)_loop\d+_\d+$/);
    return loopMatch ? loopMatch[1] : id;
  };
  const originalProductId = getOriginalProductId(product.id);

  // Animation values
  const heartScale = useRef(new Animated.Value(0)).current;
  const heartOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const parallaxTranslate = useRef(new Animated.Value(0)).current;
  const favoriteScale = useRef(new Animated.Value(1)).current;
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);

  // Fade in text when reel becomes active
  useEffect(() => {
    if (isActive) {
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 400,
          delay: 200,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        // Subtle parallax on entry
        Animated.spring(parallaxTranslate, {
          toValue: 0,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
      
      // Check if this product is favorited
      checkFavoriteStatus();
    } else {
      textOpacity.setValue(0);
      overlayOpacity.setValue(0);
      parallaxTranslate.setValue(20);
    }
  }, [isActive, textOpacity, overlayOpacity, parallaxTranslate]);

  // Check favorite status from API
  const checkFavoriteStatus = async () => {
    try {
      const isFav = await checkIsFavorite(originalProductId);
      setFavorited(isFav);
    } catch (error) {
      console.error('[EnhancedReelItem] Error checking favorite:', error);
    }
  };

  // Toggle favorite via API
  const toggleFavoriteAPI = async (): Promise<boolean> => {
    if (isTogglingFavorite) return favorited;
    
    setIsTogglingFavorite(true);
    try {
      if (favorited) {
        await removeFavorite(originalProductId);
        setFavorited(false);
        return false;
      } else {
        await addFavorite(originalProductId);
        setFavorited(true);
        return true;
      }
    } catch (error) {
      console.error('[EnhancedReelItem] Error toggling favorite:', error);
      return favorited;
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  const formatPrice = (price: number): string => {
    return `₹${price.toLocaleString('en-IN')}`;
  };

  /**
   * Heart burst animation - Red heart, scale up and fade
   */
  const triggerHeartAnimation = useCallback(() => {
    setShowHeartAnimation(true);
    heartScale.setValue(0.2);
    heartOpacity.setValue(1);

    Animated.sequence([
      Animated.spring(heartScale, {
        toValue: 1.5,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(heartOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowHeartAnimation(false);
      heartScale.setValue(0);
    });
  }, [heartScale, heartOpacity]);

  /**
   * Pulse animation for favorite button
   */
  const triggerFavoritePulse = useCallback(() => {
    Animated.sequence([
      Animated.spring(favoriteScale, {
        toValue: 1.3,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.spring(favoriteScale, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();
  }, [favoriteScale]);

  /**
   * Handle favorite button press
   */
  const handleFavoritePress = async () => {
    // Optimistic UI update
    const wasLiked = !favorited;
    setFavorited(wasLiked);
    
    if (wasLiked) {
      triggerHeartAnimation();
    }
    triggerFavoritePulse();
    
    // API call in background
    toggleFavoriteAPI();
  };

  /**
   * Quick Actions handlers
   */
  const handleViewDetails = () => {
    setShowQuickActions(false);
    // Pass product with original ID for proper API lookups
    onViewDetails({ ...product, id: originalProductId });
  };

  const handleSave = async () => {
    // Optimistic UI update
    const wasLiked = !favorited;
    setFavorited(wasLiked);
    
    if (wasLiked) {
      triggerHeartAnimation();
    }
    triggerFavoritePulse();
    setShowQuickActions(false);
    
    // API call in background
    toggleFavoriteAPI();
  };

  // Get images list - fallback to imageUrl if no images array
  const imagesList = product.images && product.images.length > 0 
    ? product.images 
    : [{ url: product.imageUrl }];

  // Handle image error for specific index
  const handleImageErrorAtIndex = (index: number) => {
    setErroredImages(prev => new Set(prev).add(index));
  };

  // Track visible image in carousel
  const onImageViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      setCurrentImageIndex(viewableItems[0].index);
    }
  }).current;

  const imageViewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  // Render individual image in carousel
  const renderCarouselImage = useCallback(({ item, index }: { item: { url: string }; index: number }) => {
    const hasError = erroredImages.has(index);
    
    return (
      <View style={[styles.carouselImageContainer, { width: SCREEN_WIDTH, height: screenHeight }]}>
        {hasError ? (
          <View style={styles.fallbackImage}>
            <Text style={styles.fallbackEmoji}>🖼️</Text>
            <Text style={styles.fallbackText}>Image not available</Text>
          </View>
        ) : (
          <Image
            source={{ uri: item.url }}
            style={styles.image}
            onError={() => handleImageErrorAtIndex(index)}
            resizeMode="contain"
          />
        )}
      </View>
    );
  }, [erroredImages, screenHeight]);

  return (
    <View style={[styles.container, { height: screenHeight }]}>
      {/* Images Carousel - horizontal swipe to change images */}
      <View style={styles.imageContainer}>
        <FlatList
          ref={imageFlatListRef}
          data={imagesList}
          renderItem={renderCarouselImage}
          keyExtractor={(item, index) => `${item.url}-${index}`}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onImageViewableItemsChanged}
          viewabilityConfig={imageViewabilityConfig}
          getItemLayout={(_, index) => ({
            length: SCREEN_WIDTH,
            offset: SCREEN_WIDTH * index,
            index,
          })}
          bounces={false}
          scrollEnabled={imagesList.length > 1}
          nestedScrollEnabled={true}
          directionalLockEnabled={true}
          scrollEventThrottle={16}
        />
      </View>

      {/* Image Indicators */}
      {imagesList.length > 1 && (
        <View style={styles.centeredImageIndicators} pointerEvents="none">
          {imagesList.map((_, index) => (
            <View
              key={index}
              style={[
                styles.imageIndicator,
                index === currentImageIndex && styles.imageIndicatorActive,
              ]}
            />
          ))}
        </View>
      )}

      {/* Visual Overlays - no interaction */}
      <View style={styles.overlayContainer} pointerEvents="none">
        {/* Grain/Fog Overlay */}
        <Animated.View style={[styles.grainOverlay, { opacity: overlayOpacity }]} />
        {/* Vignette Effect */}
        <View style={styles.vignette} />
        {/* Gradient Overlay */}
        <View style={styles.gradientOverlay} />
      </View>

      {/* UI Elements - interactive buttons on top */}
      {showUI && (
        <Animated.View style={[styles.uiContainer, { opacity: textOpacity }]} pointerEvents="box-none">
            {/* Right Side Actions - Middle-Bottom area */}
            <View style={styles.rightSideActions}>
              {/* Favorite Button */}
              <TouchableOpacity
                  style={[styles.actionButton, favorited && styles.actionButtonActive]}
                  onPress={handleFavoritePress}
                  activeOpacity={0.7}
                >
                  <Animated.Text
                    style={[
                      styles.actionIcon,
                      { transform: [{ scale: favoriteScale }] },
                    ]}
                  >
                    {favorited ? '❤️' : '🤍'}
                  </Animated.Text>
                  <Text style={styles.actionLabel}>
                    {favorited ? 'Liked' : 'Like'}
                  </Text>
                </TouchableOpacity>

                {/* Details Button */}
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => onViewDetails({ ...product, id: originalProductId })}
                  activeOpacity={0.7}
                >
                  <Text style={styles.actionIcon}>👁️</Text>
                  <Text style={styles.actionLabel}>Details</Text>
                </TouchableOpacity>
              </View>

              {/* Bottom - Product Info */}
              <View style={styles.infoContainer}>
                {/* Seller Badge */}
                <View style={styles.sellerBadge}>
                  <Text style={styles.sellerBadgeText}>🎨 Artisan</Text>
                </View>

                {/* Product Title */}
                <Text style={styles.title} numberOfLines={2}>
                  {product.title}
                </Text>

                {/* Price - Tag Style */}
                <View style={styles.priceTag}>
                  <Text style={styles.price}>{formatPrice(product.price)}</Text>
                </View>

                {/* Description */}
                <Text style={styles.description} numberOfLines={2}>
                  {product.eerieDescription || product.description}
                </Text>

                {/* Seller Name */}
                <Text style={styles.seller}>
                  by {product.seller?.name || 'Unknown'}
                </Text>
            </View>

            {/* Interaction Hints */}
            <View style={styles.hintContainer} pointerEvents="none">
              <Text style={styles.hintText}>
                Swipe ← → for more photos • Swipe ↑ ↓ for more items
              </Text>
            </View>
        </Animated.View>
      )}

      {/* Heart Animation Overlay */}
      {showHeartAnimation && (
        <View style={[styles.heartAnimationContainer, { zIndex: 5 }]} pointerEvents="none">
          <Animated.Text
            style={[
              styles.heartAnimationText,
              {
                transform: [{ scale: heartScale }],
                opacity: heartOpacity,
              },
            ]}
          >
            ❤️
          </Animated.Text>
        </View>
      )}

      {/* Quick Actions Modal */}
      <Modal
        visible={showQuickActions}
        transparent
        animationType="fade"
        onRequestClose={() => setShowQuickActions(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowQuickActions(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>✨ Quick Actions</Text>

                <TouchableOpacity style={styles.modalButton} onPress={handleViewDetails}>
                  <Text style={styles.modalButtonIcon}>👁️</Text>
                  <Text style={styles.modalButtonText}>View Details</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.modalButton} onPress={handleSave}>
                  <Text style={styles.modalButtonIcon}>{favorited ? '💔' : '❤️'}</Text>
                  <Text style={styles.modalButtonText}>
                    {favorited ? 'Remove from Saved' : 'Save Item'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={() => setShowQuickActions(false)}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    backgroundColor: '#000',
  },
  contentContainer: {
    flex: 1,
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
  },

  imageContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  carouselImageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  fallbackImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.backgroundSecondary,
  },
  fallbackEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  fallbackText: {
    fontSize: 16,
    color: theme.colors.textMuted,
  },
  centeredImageIndicators: {
    position: 'absolute',
    bottom: 280,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    zIndex: 20,
  },
  imageIndicatorContainer: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    zIndex: 10,
  },
  imageIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  imageIndicatorActive: {
    backgroundColor: theme.colors.primary,
    width: 10,
    height: 10,
    borderRadius: 5,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },

  // Overlays
  grainOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(128, 128, 128, 0.05)',
  },
  vignette: {
    ...StyleSheet.absoluteFillObject,
    // Removed black border
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },

  // UI Container
  uiContainer: {
    ...StyleSheet.absoluteFillObject,
  },

  // Right Side Actions (Like, Share, Details) - Middle-Bottom positioning
  rightSideActions: {
    position: 'absolute',
    right: 16,
    bottom: 200, // Middle-bottom area of the screen
    alignItems: 'center',
    gap: 20,
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonActive: {
    // Active state styling
  },
  actionIcon: {
    fontSize: 32,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  actionLabel: {
    fontSize: 12,
    color: '#fff',
    marginTop: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },

  // Bottom Info Container
  infoContainer: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 80, // Leave space for right side actions
    padding: 20,
  },
  sellerBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(229, 9, 20, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12,
  },
  sellerBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textShadowColor: theme.colors.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  priceTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(229, 9, 20, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(229, 9, 20, 0.4)',
    transform: [{ rotate: '-1deg' }],
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    fontStyle: 'italic',
    color: theme.colors.primary,
    textShadowColor: 'rgba(229, 9, 20, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  description: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
    fontStyle: 'italic',
    marginBottom: 10,
    lineHeight: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  seller: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },

  // Hints
  hintContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  hintText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },

  // Heart Animation
  heartAnimationContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartAnimationText: {
    fontSize: 140,
    color: theme.colors.primary,
    textShadowColor: 'rgba(229, 9, 20, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 30,
  },

  // Quick Actions Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.backgroundSecondary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    borderWidth: 1,
    borderColor: 'rgba(229, 9, 20, 0.3)',
    borderBottomWidth: 0,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.backgroundTertiary,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  modalButtonIcon: {
    fontSize: 24,
  },
  modalButtonText: {
    fontSize: 16,
    color: theme.colors.textPrimary,
  },
  modalCancelButton: {
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    alignItems: 'center',
    backgroundColor: 'rgba(229, 9, 20, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(229, 9, 20, 0.3)',
  },
  modalCancelText: {
    fontSize: 16,
    color: theme.colors.primary,
  },
});

export default EnhancedReelItem;
