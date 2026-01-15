import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import theme from '../theme';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onPress?: (product: Product) => void;
  onFavoritePress?: (product: Product) => void;
  index?: number;
  isFavorite?: boolean;
  isCreepy?: boolean;
}

/**
 * ProductCard - Premium Stranger Things Dark Theme
 * Stunning animated card with gradients, glow effects, and premium styling.
 */
const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onPress, 
  onFavoritePress,
  index = 0,
  isFavorite = false,
  isCreepy = false,
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const heartAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const delay = index * 100;
    
    // Entry animation
    Animated.parallel([
      Animated.spring(fadeAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        delay,
        useNativeDriver: true,
      }),
    ]).start();

    // Subtle glow pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 0.6,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.3,
          duration: 2000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  // Format price in INR with styling
  const formatPrice = (price: number): string => {
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const handlePress = () => {
    if (onPress) {
      onPress(product);
    }
  };

  const handleFavoritePress = () => {
    // Heart bounce animation
    Animated.sequence([
      Animated.spring(heartAnim, {
        toValue: 1.3,
        tension: 300,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.spring(heartAnim, {
        toValue: 1,
        tension: 300,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();

    if (onFavoritePress) {
      onFavoritePress(product);
    }
  };

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      friction: 5,
      tension: 400,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 400,
      useNativeDriver: true,
    }).start();
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  return (
    <Animated.View
      style={[
        styles.cardWrapper,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim },
            ...(isCreepy ? [{ rotate: '-1deg' }] : []),
          ],
        },
      ]}
    >
      {/* Glow effect behind card */}
      <Animated.View style={[styles.cardGlow, { opacity: glowAnim, backgroundColor: isCreepy ? '#ff1350' : undefined }]} />
      
      <TouchableOpacity
        style={styles.card}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        {/* Image Container with Gradient Overlay */}
        <View style={styles.imageContainer}>
          {imageError ? (
            <View style={styles.fallbackImage}>
              <LinearGradient
                  colors={isCreepy ? ['rgba(255,19,80,0.18)', 'transparent'] : ['rgba(229, 9, 20, 0.1)', 'transparent']}
                style={StyleSheet.absoluteFillObject}
              />
              <Ionicons name="cube-outline" size={40} color={theme.colors.textTertiary} />
              <Text style={styles.fallbackText}>No Image</Text>
            </View>
          ) : (
            <>
              <Image
                source={{ uri: product.imageUrl }}
                style={styles.image}
                onError={handleImageError}
                onLoad={handleImageLoad}
                resizeMode="cover"
              />
              {/* Top gradient for favorite button visibility */}
              <LinearGradient
                colors={['rgba(0, 0, 0, 0.5)', 'transparent']}
                style={styles.topGradient}
              />
              {/* Bottom gradient for text visibility */}
              <LinearGradient
                colors={['transparent', 'rgba(0, 0, 0, 0.7)']}
                style={styles.bottomGradient}
              />
            </>
          )}

          {/* Favorite Button */}
          <TouchableOpacity 
            style={styles.favoriteButton}
            onPress={handleFavoritePress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Animated.View style={{ transform: [{ scale: heartAnim }] }}>
              <Ionicons 
                name={isFavorite ? "heart" : "heart-outline"} 
                size={22} 
                  color={isFavorite ? (isCreepy ? '#ff3155' : theme.colors.primary) : '#fff'} 
              />
            </Animated.View>
          </TouchableOpacity>

          {/* Image count badge (if multiple images) */}
          {product.images && product.images.length > 1 && (
            <View style={styles.imageBadge}>
              <Ionicons name="images-outline" size={12} color="#fff" />
              <Text style={styles.imageBadgeText}>{product.images.length}</Text>
            </View>
          )}
        </View>

        {/* Info Container */}
        <View style={[styles.infoContainer, isCreepy ? { backgroundColor: 'transparent' } : undefined]}>
          <Text style={styles.title} numberOfLines={2}>
            {product.title}
          </Text>
          
          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatPrice(product.price)}</Text>
          </View>

          <View style={styles.sellerRow}>
            <View style={styles.sellerAvatar}>
              <Ionicons name="person" size={10} color={theme.colors.textTertiary} />
            </View>
            <Text style={styles.seller} numberOfLines={1}>
              {product.seller.name}
            </Text>
          </View>
        </View>

        {/* Bottom accent line */}
        <LinearGradient
          colors={isCreepy ? ['#8b001f', '#ff1f55', '#8b001f'] : [theme.colors.primary, theme.colors.accent, theme.colors.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.bottomAccent}
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    flex: 1,
    margin: 6,
    position: 'relative',
  },
  cardGlow: {
    position: 'absolute',
    top: 5,
    left: 5,
    right: 5,
    bottom: 5,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg + 5,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 8,
  },
  card: {
    backgroundColor: theme.colors.backgroundTertiary,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(229, 9, 20, 0.2)',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: theme.colors.backgroundSecondary,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 50,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  fallbackImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.backgroundSecondary,
  },
  fallbackText: {
    color: theme.colors.textTertiary,
    fontSize: 11,
    marginTop: 6,
    fontWeight: '500',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  imageBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  imageBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  infoContainer: {
    padding: 12,
    paddingTop: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 6,
    letterSpacing: 0.2,
    lineHeight: 18,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  price: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.primary,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(229, 9, 20, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sellerAvatar: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: theme.colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  seller: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    flex: 1,
    fontWeight: '500',
  },
  bottomAccent: {
    height: 2,
    width: '100%',
  },
});

export default ProductCard;
