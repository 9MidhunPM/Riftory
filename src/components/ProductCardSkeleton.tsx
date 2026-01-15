import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import theme from '../theme';

interface ProductCardSkeletonProps {
  index?: number;
}

/**
 * ProductCardSkeleton - Beautiful shimmer loading skeleton
 */
const ProductCardSkeleton: React.FC<ProductCardSkeletonProps> = ({ index = 0 }) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Staggered fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      delay: index * 100,
      useNativeDriver: true,
    }).start();

    // Shimmer animation
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });

  const ShimmerOverlay = () => (
    <Animated.View
      style={[
        styles.shimmerOverlay,
        { transform: [{ translateX }] },
      ]}
    >
      <LinearGradient
        colors={[
          'transparent',
          'rgba(255, 255, 255, 0.05)',
          'rgba(255, 255, 255, 0.1)',
          'rgba(255, 255, 255, 0.05)',
          'transparent',
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.shimmerGradient}
      />
    </Animated.View>
  );

  return (
    <Animated.View style={[styles.cardWrapper, { opacity: fadeAnim }]}>
      <View style={styles.card}>
        {/* Image skeleton */}
        <View style={styles.imageSkeleton}>
          <ShimmerOverlay />
        </View>

        {/* Info skeleton */}
        <View style={styles.infoContainer}>
          <View style={styles.titleSkeleton}>
            <ShimmerOverlay />
          </View>
          <View style={styles.priceSkeleton}>
            <ShimmerOverlay />
          </View>
          <View style={styles.sellerSkeleton}>
            <ShimmerOverlay />
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

/**
 * ProductGridSkeleton - Grid of skeleton cards
 */
export const ProductGridSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <View style={styles.grid}>
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} index={i} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  cardWrapper: {
    width: '50%',
    padding: 6,
  },
  card: {
    backgroundColor: theme.colors.backgroundTertiary,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  imageSkeleton: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: theme.colors.backgroundSecondary,
    overflow: 'hidden',
  },
  infoContainer: {
    padding: 12,
    gap: 8,
  },
  titleSkeleton: {
    height: 16,
    borderRadius: 4,
    backgroundColor: theme.colors.backgroundSecondary,
    overflow: 'hidden',
    width: '90%',
  },
  priceSkeleton: {
    height: 20,
    borderRadius: 4,
    backgroundColor: theme.colors.backgroundSecondary,
    overflow: 'hidden',
    width: '50%',
  },
  sellerSkeleton: {
    height: 12,
    borderRadius: 4,
    backgroundColor: theme.colors.backgroundSecondary,
    overflow: 'hidden',
    width: '70%',
  },
  shimmerOverlay: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  shimmerGradient: {
    width: 200,
    height: '100%',
  },
});

export default ProductCardSkeleton;
