import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { EncodingType, readAsStringAsync } from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import React, { useCallback, useState } from 'react';
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createProduct } from '../services/api';
import { DEFAULT_SELLER_PROFILE, getSellerProfile, isProfileDefault } from '../services/profileStorage';
import theme from '../theme';
import { HomeStackParamList } from '../types';

type AddProductScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList, 'AddProduct'>;

interface ProductFormData {
  title: string;
  price: string;
  description: string;
  category: string;
}

const CATEGORIES = [
  'Electronics',
  'Fashion',
  'Home & Garden',
  'Sports',
  'Books',
  'Art & Crafts',
  'Vintage',
  'Other',
];

/**
 * AddProductScreen
 * 
 * Allows users to add a new product with:
 * - Product images (from camera or gallery)
 * - Title, price, description
 * - Category selection
 */
const AddProductScreen: React.FC = () => {
  const navigation = useNavigation<AddProductScreenNavigationProp>();
  const [images, setImages] = useState<string[]>([]);
  const [formData, setFormData] = useState<ProductFormData>({
    title: '',
    price: '',
    description: '',
    category: '',
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [hasCheckedProfile, setHasCheckedProfile] = useState(false);

  // Check if profile is set up when screen is focused
  useFocusEffect(
    useCallback(() => {
      checkProfileSetup();
    }, [])
  );

  const checkProfileSetup = async () => {
    if (hasCheckedProfile) return;
    
    const isDefault = await isProfileDefault();
    if (isDefault) {
      Alert.alert(
        'Set Up Your Profile',
        'Before creating a listing, we recommend setting up your seller profile. This helps buyers contact you and builds trust.',
        [
          {
            text: 'Set Up Now',
            onPress: () => {
              // Navigate to Profile tab
              navigation.getParent()?.navigate('Profile');
            },
          },
          {
            text: 'Continue Anonymously',
            style: 'cancel',
            onPress: () => setHasCheckedProfile(true),
          },
        ]
      );
    } else {
      setHasCheckedProfile(true);
    }
  };
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Request camera permissions and take photo
  const handleTakePhoto = async () => {
    try {
      // Request camera permission
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Camera permission is needed to take photos.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImages((prev) => [...prev, result.assets[0].uri]);
      }
    } catch (error) {
      console.error('[AddProduct] Camera error:', error);
      Alert.alert('Error', 'Failed to open camera. Please try again.');
    }
  };

  // Pick image from gallery
  const handlePickImage = async () => {
    try {
      // Request media library permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Gallery permission is needed to select photos.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImages((prev) => [...prev, result.assets[0].uri]);
      }
    } catch (error) {
      console.error('[AddProduct] Gallery error:', error);
      Alert.alert('Error', 'Failed to open gallery. Please try again.');
    }
  };

  // Remove image
  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Show image options
  const handleAddImage = () => {
    Alert.alert(
      'Add Photo',
      'Choose how you want to add a photo',
      [
        { text: 'Take Photo', onPress: handleTakePhoto },
        { text: 'Choose from Gallery', onPress: handlePickImage },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  // Update form field
  const updateField = (field: keyof ProductFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Validate form
  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      Alert.alert('Validation Error', 'Please enter a product title.');
      return false;
    }
    if (!formData.price.trim() || isNaN(Number(formData.price))) {
      Alert.alert('Validation Error', 'Please enter a valid price.');
      return false;
    }
    if (!formData.description.trim()) {
      Alert.alert('Validation Error', 'Please enter a product description.');
      return false;
    }
    if (!selectedCategory) {
      Alert.alert('Validation Error', 'Please select a category.');
      return false;
    }
    if (images.length === 0) {
      Alert.alert('Validation Error', 'Please add at least one photo.');
      return false;
    }
    return true;
  };

  // Submit form
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Convert images to base64
      const base64Images: string[] = [];
      for (const uri of images) {
        const base64 = await readAsStringAsync(uri, {
          encoding: EncodingType.Base64,
        });
        // Add data URI prefix
        base64Images.push(`data:image/jpeg;base64,${base64}`);
      }

      // Get seller profile if saved, otherwise use default
      const sellerProfile = await getSellerProfile() || DEFAULT_SELLER_PROFILE;

      // Create product via API with seller info
      await createProduct({
        title: formData.title.trim(),
        price: parseFloat(formData.price),
        description: formData.description.trim(),
        category: selectedCategory,
        images: base64Images,
        seller: {
          name: sellerProfile.name,
          email: sellerProfile.email,
          contactNumber: sellerProfile.contactNumber,
          address: sellerProfile.address,
          upiId: sellerProfile.upiId,
          qrImageUrl: sellerProfile.qrImageUrl,
        },
      });

      setIsSubmitting(false);
      Alert.alert(
        'Success!',
        'Your product has been listed successfully.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('[AddProduct] Submit error:', error);
      setIsSubmitting(false);
      Alert.alert(
        'Error',
        'Failed to list your product. Please check your connection and try again.'
      );
    }
  };

  // Handle back
  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Product</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Image Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Photos</Text>
            <Text style={styles.sectionSubtitle}>
              Add up to 5 photos of your product
            </Text>

            <View style={styles.imagesContainer}>
              {/* Display selected images */}
              {images.map((uri, index) => (
                <View key={index} style={styles.imageWrapper}>
                  <Image source={{ uri }} style={styles.selectedImage} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => handleRemoveImage(index)}
                  >
                    <Text style={styles.removeImageText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}

              {/* Add image button */}
              {images.length < 5 && (
                <TouchableOpacity
                  style={styles.addImageButton}
                  onPress={handleAddImage}
                  activeOpacity={0.7}
                >
                  <Text style={styles.addImageIcon}>📷</Text>
                  <Text style={styles.addImageText}>Add Photo</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Product Details Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Product Details</Text>

            {/* Title */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Title *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter product title"
                placeholderTextColor={theme.colors.textMuted}
                value={formData.title}
                onChangeText={(text) => updateField('title', text)}
                maxLength={100}
              />
            </View>

            {/* Price */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Price (₹) *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter price"
                placeholderTextColor={theme.colors.textMuted}
                value={formData.price}
                onChangeText={(text) => updateField('price', text)}
                keyboardType="numeric"
                maxLength={10}
              />
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description *</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Describe your product..."
                placeholderTextColor={theme.colors.textMuted}
                value={formData.description}
                onChangeText={(text) => updateField('description', text)}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                maxLength={500}
              />
              <Text style={styles.charCount}>
                {formData.description.length}/500
              </Text>
            </View>
          </View>

          {/* Category Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Category *</Text>
            <View style={styles.categoriesContainer}>
              {CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryChip,
                    selectedCategory === category && styles.categoryChipSelected,
                  ]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      selectedCategory === category && styles.categoryChipTextSelected,
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Listing Product...' : 'List Product'}
            </Text>
          </TouchableOpacity>

          {/* Bottom spacing */}
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.backgroundSecondary,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: theme.colors.textPrimary,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: theme.colors.textMuted,
    marginBottom: 16,
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  imageWrapper: {
    position: 'relative',
  },
  selectedImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: theme.colors.backgroundTertiary,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 5,
  },
  removeImageText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(229, 9, 20, 0.08)',
  },
  addImageIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  addImageText: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: theme.colors.backgroundTertiary,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: theme.colors.textPrimary,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 14,
  },
  charCount: {
    textAlign: 'right',
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 12,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: theme.colors.backgroundTertiary,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  categoryChipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 5,
  },
  categoryChipText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  categoryChipTextSelected: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  submitButtonDisabled: {
    backgroundColor: 'rgba(229, 9, 20, 0.4)',
    shadowOpacity: 0.3,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  bottomSpacer: {
    height: 40,
  },
});

export default AddProductScreen;
