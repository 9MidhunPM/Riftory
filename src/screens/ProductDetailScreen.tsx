import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import * as Linking from 'expo-linking';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ImageCarousel from '../components/ImageCarousel';
import { addFavorite, checkIsFavorite, removeFavorite } from '../services/api';
import theme from '../theme';
import { HomeStackParamList, Seller } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Props type for ProductDetail screen
// Data is passed via navigation params from HomeScreen
type ProductDetailProps = NativeStackScreenProps<HomeStackParamList, 'ProductDetail'>;

/**
 * ProductDetail Screen
 * 
 * Displays full product information when a product is tapped from the Home screen.
 * 
 * DATA FLOW:
 * 1. User taps ProductCard on HomeScreen
 * 2. HomeScreen navigates to ProductDetail with the full product object as params
 * 3. ProductDetail receives the product via route.params
 * 4. No refetch needed - data comes directly from navigation params
 */
const ProductDetailScreen: React.FC<ProductDetailProps> = ({ route }) => {
  const { product } = route.params;
  const [isFavorited, setIsFavorited] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const favoriteScale = useState(new Animated.Value(1))[0];
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const priceGlowAnim = useRef(new Animated.Value(0.5)).current;

  // Get product ID (handle both _id and id fields)
  const productId = (product as any)?._id || product?.id || '';

  useEffect(() => {
    // Entry animations
    Animated.parallel([
      Animated.spring(fadeAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Price glow pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(priceGlowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(priceGlowAnim, {
          toValue: 0.5,
          duration: 2000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  // Log navigation focus events and check favorite status
  useFocusEffect(
    useCallback(() => {
      checkFavoriteStatus();
      return () => {};
    }, [product?.title])
  );

  // Check if product is favorited
  const checkFavoriteStatus = async () => {
    if (!productId) return;
    try {
      const isFav = await checkIsFavorite(productId);
      setIsFavorited(isFav);
    } catch (error) {
      console.error('[ProductDetail] Error checking favorite status:', error);
    }
  };

  // Toggle favorite with animation
  const handleToggleFavorite = async () => {
    if (isTogglingFavorite || !productId) return;

    setIsTogglingFavorite(true);
    
    // Pulse animation
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

    try {
      if (isFavorited) {
        await removeFavorite(productId);
        setIsFavorited(false);
      } else {
        await addFavorite(productId);
        setIsFavorited(true);
      }
    } catch (error) {
      console.error('[ProductDetail] Error toggling favorite:', error);
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  // Format price in INR with proper formatting
  const formatPrice = (price: number | undefined | null): string => {
    if (price == null || isNaN(price)) return '₹0';
    return `₹${price.toLocaleString('en-IN')}`;
  };

  // Format date for display
  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  /**
   * Render seller contact info with null safety
   * Displays contact number and address if available
   */
  const renderSellerContact = (seller: Seller) => {
    const hasContactInfo = seller.contactNumber || seller.address;

    if (!hasContactInfo) {
      return (
        <Text style={styles.noContactInfo}>
          Contact information not available
        </Text>
      );
    }

    return (
      <View style={styles.contactContainer}>
        {seller.contactNumber && (
          <TouchableOpacity 
            style={styles.contactRow}
            activeOpacity={0.7}
          >
            <View style={styles.contactIconContainer}>
              <Ionicons name="call-outline" size={16} color={theme.colors.primary} />
            </View>
            <Text style={styles.contactText}>{seller.contactNumber}</Text>
          </TouchableOpacity>
        )}
        {seller.address && (
          <TouchableOpacity 
            style={styles.contactRow}
            activeOpacity={0.7}
          >
            <View style={styles.contactIconContainer}>
              <Ionicons name="location-outline" size={16} color={theme.colors.primary} />
            </View>
            <Text style={styles.contactText}>{seller.address}</Text>
          </TouchableOpacity>
        )}
        {seller.email && (
          <TouchableOpacity 
            style={styles.contactRow}
            activeOpacity={0.7}
          >
            <View style={styles.contactIconContainer}>
              <Ionicons name="mail-outline" size={16} color={theme.colors.primary} />
            </View>
            <Text style={styles.contactText}>{seller.email}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // Handle Buy button press
  const handleBuyPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowPaymentModal(true);
  };

  // Handle call seller
  const handleCallSeller = () => {
    if (product?.seller?.contactNumber) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Linking.openURL(`tel:${product.seller.contactNumber}`);
    }
  };

  // Handle email seller
  const handleEmailSeller = () => {
    if (product?.seller?.email) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Linking.openURL(`mailto:${product.seller.email}?subject=Inquiry about ${product.title}`);
    }
  };

  // Handle copy UPI
  const handleCopyUPI = () => {
    if (product?.seller?.upiId) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // Note: For actual clipboard, you'd need expo-clipboard
      // For now, just show the UPI ID
    }
  };

  // Null safety check for product
  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Product not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Product Images - Swipeable Carousel */}
        <View style={styles.imageWrapper}>
          <ImageCarousel
            images={product.images || []}
            fallbackUrl={product.imageUrl}
            height={SCREEN_WIDTH}
            showIndicators={true}
          />
          {/* Gradient overlay at bottom of image */}
          <LinearGradient
            colors={['transparent', theme.colors.background]}
            style={styles.imageGradient}
          />
        </View>

        {/* Product Info Section */}
        <Animated.View 
          style={[
            styles.infoSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          {/* Header Row - Category Badge and Favorite Button */}
          <View style={styles.infoHeaderRow}>
            {/* Category Badge (if available) */}
            {product.category ? (
              <LinearGradient
                colors={['rgba(229, 9, 20, 0.2)', 'rgba(229, 9, 20, 0.1)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.categoryBadge}
              >
                <Ionicons name="pricetag" size={12} color={theme.colors.primary} />
                <Text style={styles.categoryText}>{product.category}</Text>
              </LinearGradient>
            ) : (
              <View />
            )}
            
            {/* Favorite Button */}
            <TouchableOpacity
              style={styles.favoriteButton}
              onPress={handleToggleFavorite}
              disabled={isTogglingFavorite}
              activeOpacity={0.7}
            >
              <Animated.View style={{ transform: [{ scale: favoriteScale }] }}>
                <Ionicons 
                  name={isFavorited ? "heart" : "heart-outline"} 
                  size={24} 
                  color={isFavorited ? theme.colors.primary : theme.colors.textPrimary} 
                />
              </Animated.View>
            </TouchableOpacity>
          </View>

          {/* Product Title */}
          <Text style={styles.productTitle}>{product.title}</Text>

          {/* Product Price with glow */}
          <Animated.View style={[styles.priceContainer, { opacity: priceGlowAnim }]}>
            <Text style={styles.productPrice}>{formatPrice(product.price)}</Text>
          </Animated.View>

          {/* Product Description (if available) */}
          {product.description && (
            <View style={styles.descriptionContainer}>
              <View style={styles.sectionLabelRow}>
                <Ionicons name="document-text-outline" size={16} color={theme.colors.primary} />
                <Text style={styles.sectionLabel}>Description</Text>
              </View>
              <Text style={styles.descriptionText}>{product.description}</Text>
            </View>
          )}

          {/* Date Posted (if available) */}
          {product.createdAt && (
            <View style={styles.dateContainer}>
              <Ionicons name="calendar-outline" size={14} color={theme.colors.textSecondary} />
              <Text style={styles.dateLabel}>Posted on: </Text>
              <Text style={styles.dateText}>{formatDate(product.createdAt)}</Text>
            </View>
          )}
        </Animated.View>

        {/* Seller Details Section */}
        <Animated.View 
          style={[
            styles.sellerSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          <View style={styles.sectionLabelRow}>
            <Ionicons name="storefront-outline" size={16} color={theme.colors.primary} />
            <Text style={styles.sectionLabel}>Seller Information</Text>
          </View>
          
          <View style={styles.sellerCard}>
            {/* Seller Avatar & Name */}
            <View style={styles.sellerHeader}>
              <LinearGradient
                colors={[theme.colors.primary, '#b8070f']}
                style={styles.sellerAvatar}
              >
                <Ionicons name="person" size={24} color="#fff" />
              </LinearGradient>
              <View style={styles.sellerInfo}>
                <Text style={styles.sellerName}>
                  {product.seller?.name || 'Unknown Seller'}
                </Text>
                {product.seller?.rating != null && product.seller.rating > 0 && (
                  <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={14} color="#FFD700" />
                    <Text style={styles.ratingText}>
                      {product.seller.rating.toFixed(1)}
                    </Text>
                    {product.seller.totalSales != null && product.seller.totalSales > 0 && (
                      <Text style={styles.salesText}>
                        • {product.seller.totalSales} sales
                      </Text>
                    )}
                  </View>
                )}
              </View>
            </View>

            {/* Seller Contact Info */}
            <View style={styles.contactSection}>
              <Text style={styles.contactLabel}>Contact Details</Text>
              {product.seller ? (
                renderSellerContact(product.seller)
              ) : (
                <Text style={styles.noContactInfo}>
                  Seller information not available
                </Text>
              )}
            </View>
          </View>
        </Animated.View>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Fixed Buy Button */}
      <View style={styles.buyButtonContainer}>
        <TouchableOpacity
          style={styles.buyButton}
          onPress={handleBuyPress}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[theme.colors.primary, '#b8070f']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.buyButtonGradient}
          >
            <Ionicons name="cart" size={22} color="#fff" />
            <Text style={styles.buyButtonText}>Buy Now</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Payment Modal */}
      <Modal
        visible={showPaymentModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>💳 Payment & Contact</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowPaymentModal(false)}
              >
                <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {/* Product Summary */}
              <View style={styles.modalProductSummary}>
                <Text style={styles.modalProductTitle}>{product.title}</Text>
                <Text style={styles.modalProductPrice}>{formatPrice(product.price)}</Text>
              </View>

              {/* Seller Info */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Seller</Text>
                <Text style={styles.modalSellerName}>{product.seller?.name || 'Unknown Seller'}</Text>
              </View>

              {/* Contact Options */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Contact Seller</Text>
                
                {product.seller?.contactNumber && (
                  <TouchableOpacity style={styles.modalContactRow} onPress={handleCallSeller}>
                    <View style={styles.modalContactIcon}>
                      <Ionicons name="call" size={20} color={theme.colors.primary} />
                    </View>
                    <View style={styles.modalContactInfo}>
                      <Text style={styles.modalContactLabel}>Phone</Text>
                      <Text style={styles.modalContactValue}>{product.seller.contactNumber}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
                  </TouchableOpacity>
                )}

                {product.seller?.email && (
                  <TouchableOpacity style={styles.modalContactRow} onPress={handleEmailSeller}>
                    <View style={styles.modalContactIcon}>
                      <Ionicons name="mail" size={20} color={theme.colors.primary} />
                    </View>
                    <View style={styles.modalContactInfo}>
                      <Text style={styles.modalContactLabel}>Email</Text>
                      <Text style={styles.modalContactValue}>{product.seller.email}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
                  </TouchableOpacity>
                )}

                {product.seller?.address && (
                  <View style={styles.modalContactRow}>
                    <View style={styles.modalContactIcon}>
                      <Ionicons name="location" size={20} color={theme.colors.primary} />
                    </View>
                    <View style={styles.modalContactInfo}>
                      <Text style={styles.modalContactLabel}>Address</Text>
                      <Text style={styles.modalContactValue}>{product.seller.address}</Text>
                    </View>
                  </View>
                )}
              </View>

              {/* Payment Section */}
              {(product.seller?.upiId || product.seller?.qrImageUrl) && (
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>💰 Payment</Text>
                  
                  {product.seller?.upiId && (
                    <TouchableOpacity style={styles.upiContainer} onPress={handleCopyUPI}>
                      <Text style={styles.upiLabel}>UPI ID</Text>
                      <Text style={styles.upiValue}>{product.seller.upiId}</Text>
                      <Text style={styles.upiHint}>Tap to copy</Text>
                    </TouchableOpacity>
                  )}

                  {product.seller?.qrImageUrl && (
                    <View style={styles.qrContainer}>
                      <Text style={styles.qrLabel}>Scan to Pay</Text>
                      <Image
                        source={{ uri: product.seller.qrImageUrl }}
                        style={styles.qrImage}
                        resizeMode="contain"
                      />
                    </View>
                  )}
                </View>
              )}

              {/* No Payment Info */}
              {!product.seller?.upiId && !product.seller?.qrImageUrl && (
                <View style={styles.noPaymentInfo}>
                  <Text style={styles.noPaymentIcon}>💬</Text>
                  <Text style={styles.noPaymentText}>
                    Contact the seller directly to discuss payment options
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.textMuted,
  },
  // Image styles
  imageWrapper: {
    position: 'relative',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  fallbackImage: {
    width: '100%',
    height: '100%',
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
    color: theme.colors.textMuted,
  },
  // Info section styles
  infoSection: {
    backgroundColor: theme.colors.backgroundSecondary,
    padding: 20,
    marginBottom: 8,
    marginTop: -40,
    marginHorizontal: 12,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(229, 9, 20, 0.15)',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  infoHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(229, 9, 20, 0.3)',
    gap: 6,
  },
  categoryText: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  favoriteButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(229, 9, 20, 0.3)',
  },
  favoriteIcon: {
    fontSize: 24,
  },
  productTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginBottom: 12,
    letterSpacing: 0.3,
    lineHeight: 30,
  },
  priceContainer: {
    marginBottom: 16,
  },
  productPrice: {
    fontSize: 32,
    fontWeight: '800',
    color: theme.colors.primary,
    textShadowColor: 'rgba(229, 9, 20, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
    letterSpacing: 1,
  },
  descriptionContainer: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  descriptionText: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    lineHeight: 24,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    gap: 6,
  },
  dateLabel: {
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  dateText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  // Seller section styles
  sellerSection: {
    backgroundColor: theme.colors.backgroundSecondary,
    padding: 20,
    marginHorizontal: 12,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(229, 9, 20, 0.1)',
  },
  sellerCard: {
    backgroundColor: theme.colors.backgroundTertiary,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(229, 9, 20, 0.15)',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  sellerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sellerAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 6,
  },
  avatarEmoji: {
    fontSize: 24,
  },
  sellerInfo: {
    marginLeft: 14,
    flex: 1,
  },
  sellerName: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    letterSpacing: 0.3,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  ratingIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  ratingText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  salesText: {
    fontSize: 13,
    color: theme.colors.textMuted,
    marginLeft: 8,
  },
  contactSection: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  contactLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textMuted,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  contactContainer: {
    gap: 10,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(229, 9, 20, 0.1)',
    gap: 12,
  },
  contactIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(229, 9, 20, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  contactText: {
    fontSize: 15,
    color: theme.colors.textPrimary,
    flex: 1,
    fontWeight: '500',
  },
  noContactInfo: {
    fontSize: 14,
    color: theme.colors.textMuted,
    fontStyle: 'italic',
    paddingVertical: 8,
  },
  bottomSpacer: {
    height: 160,
  },
  // Buy Button styles
  buyButtonContainer: {
    position: 'absolute',
    bottom: 70,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 16,
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  buyButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  buyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  buyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalScroll: {
    padding: 20,
  },
  modalProductSummary: {
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  modalProductTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  modalProductPrice: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  modalSection: {
    marginBottom: 24,
  },
  modalSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  modalSellerName: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  modalContactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  modalContactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(229, 9, 20, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modalContactInfo: {
    flex: 1,
  },
  modalContactLabel: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginBottom: 2,
  },
  modalContactValue: {
    fontSize: 15,
    color: theme.colors.textPrimary,
    fontWeight: '500',
  },
  upiContainer: {
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  upiLabel: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  upiValue: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: 4,
  },
  upiHint: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  qrContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  qrLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  qrImage: {
    width: 220,
    height: 220,
    borderRadius: 12,
  },
  noPaymentInfo: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 16,
  },
  noPaymentIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  noPaymentText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default ProductDetailScreen;
