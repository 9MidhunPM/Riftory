import React, { useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Image,
    StyleSheet,
    Text,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { useFavorites } from '../context';
import theme from '../theme';
import { Product } from '../types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * GESTURE HANDLING LOGIC:
 * 
 * Problem: Single tap and double tap conflict - we need to distinguish between them.
 * 
 * Solution: Use timing logic with useRef
 * - Track last tap timestamp
 * - If second tap occurs within DOUBLE_TAP_DELAY (300ms), it's a double tap
 * - If no second tap within delay, it's a single tap
 * 
 * Flow:
 * 1. User taps → record timestamp
 * 2. Check if previous tap was within 300ms
 *    - YES → Double tap detected → Toggle favorite, clear timeout
 *    - NO → Start timeout for single tap action
 * 3. After 300ms timeout → Execute single tap (navigate to detail)
 */

const DOUBLE_TAP_DELAY = 300; // milliseconds

interface ReelItemProps {
  product: Product;
  onSingleTap: (product: Product) => void;
  screenHeight: number;
}

const ReelItem: React.FC<ReelItemProps> = ({ product, onSingleTap, screenHeight }) => {
  const [imageError, setImageError] = useState(false);
  const { toggleFavorite, isFavorite } = useFavorites();
  
  // Refs for tap detection timing
  const lastTapRef = useRef<number>(0);
  const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Animation state for heart popup
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);
  const heartScale = useRef(new Animated.Value(0)).current;
  const heartOpacity = useRef(new Animated.Value(0)).current;

  // Format price in INR
  const formatPrice = (price: number): string => {
    return `₹${price.toLocaleString('en-IN')}`;
  };

  /**
   * Trigger heart animation when liking
   * - Heart appears small, scales up big, then fades out
   */
  const triggerHeartAnimation = () => {
    setShowHeartAnimation(true);
    heartScale.setValue(0.3);
    heartOpacity.setValue(1);
    
    Animated.sequence([
      // Scale up from small to big
      Animated.spring(heartScale, {
        toValue: 1.5,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
      // Fade out
      Animated.timing(heartOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowHeartAnimation(false);
      heartScale.setValue(0);
    });
  };

  /**
   * Handle tap with single/double tap detection
   * Uses timing logic to differentiate between tap types
   */
  const handleTap = () => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTapRef.current;

    if (timeSinceLastTap < DOUBLE_TAP_DELAY) {
      // DOUBLE TAP DETECTED
      // Clear the pending single tap timeout
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current);
        tapTimeoutRef.current = null;
      }
      
      // Toggle favorite
      const wasAdded = toggleFavorite(product);
      
      // Show heart animation only when adding to favorites
      if (wasAdded) {
        triggerHeartAnimation();
      }
      
      // Reset last tap
      lastTapRef.current = 0;
    } else {
      // POTENTIAL SINGLE TAP
      // Record this tap and wait to see if another tap follows
      lastTapRef.current = now;
      
      // Set timeout for single tap action
      tapTimeoutRef.current = setTimeout(() => {
        onSingleTap(product);
        tapTimeoutRef.current = null;
      }, DOUBLE_TAP_DELAY);
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const favorited = isFavorite(product.id);

  return (
    <TouchableWithoutFeedback onPress={handleTap}>
      <View style={[styles.container, { height: screenHeight }]}>
        {/* Full-screen product image */}
        <View style={styles.imageContainer}>
          {imageError ? (
            <View style={styles.fallbackImage}>
              <Text style={styles.fallbackEmoji}>🖼️</Text>
              <Text style={styles.fallbackText}>Image not available</Text>
            </View>
          ) : (
            <Image
              source={{ uri: product.imageUrl }}
              style={styles.image}
              onError={handleImageError}
              resizeMode="cover"
            />
          )}
        </View>

        {/* Overlay with product info */}
        <View style={styles.overlay}>
          {/* Favorite indicator */}
          {favorited && (
            <View style={styles.favoriteIndicator}>
              <Text style={styles.favoriteIcon}>❤️</Text>
            </View>
          )}

          {/* Product info at bottom */}
          <View style={styles.infoContainer}>
            <Text style={styles.title} numberOfLines={2}>
              {product.title}
            </Text>
            <Text style={styles.price}>{formatPrice(product.price)}</Text>
            <Text style={styles.seller} numberOfLines={1}>
              by {product.seller?.name || 'Unknown Seller'}
            </Text>
          </View>

          {/* Tap hints */}
          <View style={styles.hintContainer}>
            <Text style={styles.hintText}>Tap for details • Double-tap to ❤️</Text>
          </View>
        </View>

        {/* Heart animation overlay - appears on double tap when liking */}
        {showHeartAnimation && (
          <View style={styles.heartAnimationContainer} pointerEvents="none">
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
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    backgroundColor: theme.colors.background,
  },
  imageContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  image: {
    width: '100%',
    height: '100%',
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
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  favoriteIndicator: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(229, 9, 20, 0.3)',
  },
  favoriteIcon: {
    fontSize: 24,
  },
  infoContainer: {
    padding: 20,
    paddingBottom: 100, // Space for bottom tabs hint
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: 8,
    textShadowColor: theme.colors.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 8,
    textShadowColor: 'rgba(229, 9, 20, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  seller: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  hintContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  hintText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },
  heartAnimationContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartAnimationText: {
    fontSize: 120,
    color: theme.colors.primary,
    textShadowColor: 'rgba(229, 9, 20, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 30,
  },
});

export default ReelItem;
