import React, { useCallback, useRef, useState } from 'react';
import {
    Dimensions,
    FlatList,
    Image,
    StyleSheet,
    Text,
    View,
    ViewToken,
} from 'react-native';
import theme from '../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ImageItem {
  url: string;
  publicId?: string;
}

interface ImageCarouselProps {
  images: ImageItem[];
  fallbackUrl?: string;
  height?: number;
  showIndicators?: boolean;
}

/**
 * ImageCarousel - Swipeable image gallery component
 * 
 * Features:
 * - Horizontal swipe to navigate between images
 * - Pagination dots indicator
 * - Fallback image on error
 * - Snap-to-image scrolling
 */
const ImageCarousel: React.FC<ImageCarouselProps> = ({
  images,
  fallbackUrl = 'https://via.placeholder.com/400',
  height = SCREEN_WIDTH, // Default to square aspect ratio
  showIndicators = true,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [erroredImages, setErroredImages] = useState<Set<number>>(new Set());
  const flatListRef = useRef<FlatList>(null);

  // Get the list of images to display
  const imageList = images.length > 0 
    ? images 
    : [{ url: fallbackUrl }];

  // Handle image load error
  const handleImageError = (index: number) => {
    setErroredImages(prev => new Set(prev).add(index));
  };

  // Track visible item
  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  // Render each image
  const renderImage = useCallback(({ item, index }: { item: ImageItem; index: number }) => {
    const hasError = erroredImages.has(index);
    
    return (
      <View style={[styles.imageContainer, { width: SCREEN_WIDTH, height }]}>
        {hasError ? (
          <View style={[styles.fallbackContainer, { height }]}>
            <Text style={styles.fallbackEmoji}>🖼️</Text>
            <Text style={styles.fallbackText}>Image not available</Text>
          </View>
        ) : (
          <Image
            source={{ uri: item.url }}
            style={[styles.image, { height }]}
            resizeMode="cover"
            onError={() => handleImageError(index)}
          />
        )}
      </View>
    );
  }, [erroredImages, height]);

  // Key extractor
  const keyExtractor = useCallback((item: ImageItem, index: number) => 
    `${item.url}-${index}`, []);

  // Get item layout for optimized scrolling
  const getItemLayout = useCallback((_: any, index: number) => ({
    length: SCREEN_WIDTH,
    offset: SCREEN_WIDTH * index,
    index,
  }), []);

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={imageList}
        renderItem={renderImage}
        keyExtractor={keyExtractor}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={getItemLayout}
        bounces={false}
        decelerationRate="fast"
      />
      
      {/* Pagination Indicators */}
      {showIndicators && imageList.length > 1 && (
        <View style={styles.indicatorContainer}>
          {imageList.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                index === currentIndex && styles.indicatorActive,
              ]}
            />
          ))}
        </View>
      )}

      {/* Image Counter */}
      {imageList.length > 1 && (
        <View style={styles.counterContainer}>
          <Text style={styles.counterText}>
            {currentIndex + 1}/{imageList.length}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  imageContainer: {
    backgroundColor: theme.colors.backgroundSecondary,
  },
  image: {
    width: '100%',
  },
  fallbackContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.backgroundSecondary,
  },
  fallbackEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  fallbackText: {
    fontSize: 14,
    color: theme.colors.textTertiary,
  },
  indicatorContainer: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  indicatorActive: {
    backgroundColor: theme.colors.primary,
    width: 10,
    height: 10,
    borderRadius: 5,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  counterContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  counterText: {
    color: theme.colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
});

export default ImageCarousel;
