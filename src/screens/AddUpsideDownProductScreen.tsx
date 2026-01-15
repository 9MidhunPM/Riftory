import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { EncodingType, readAsStringAsync } from 'expo-file-system/legacy';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
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
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createProduct } from '../services/api';
import { DEFAULT_SELLER_PROFILE, getSellerProfile } from '../services/profileStorage';
import { HomeStackParamList } from '../types';

type NavigationProp = NativeStackNavigationProp<HomeStackParamList, 'AddUpsideDownProduct'>;

// Creepy purple color palette
const creepyColors = {
  background: '#0a0612',
  backgroundSecondary: '#120a1f',
  inputBg: '#1a0f2e',
  primary: '#9b30ff',
  accent: '#ff1493',
  text: '#e8d5ff',
  textMuted: '#6b4d8a',
  glow: '#bf5fff',
  border: '#3d1a5c',
};

const CATEGORIES = [
  'Forbidden Tech',
  'Dark Fashion',
  'Cursed Objects',
  'Occult',
  'Experiments',
  'Contraband',
  'Unknown Origin',
  'Other',
];

const AddUpsideDownProductScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [images, setImages] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useFocusEffect(
    useCallback(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }, [])
  );

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera permission is needed.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setImages((prev) => [...prev, result.assets[0].uri]);
    }
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Gallery permission is needed.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setImages((prev) => [...prev, result.assets[0].uri]);
    }
  };

  const handleAddImage = () => {
    Alert.alert('Add Photo', 'Choose how you want to add a photo', [
      { text: 'Take Photo', onPress: handleTakePhoto },
      { text: 'Choose from Gallery', onPress: handlePickImage },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleRemoveImage = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = (): boolean => {
    if (!title.trim()) {
      Alert.alert('Error', 'Enter a title for your cursed item.');
      return false;
    }
    if (!price.trim() || isNaN(Number(price))) {
      Alert.alert('Error', 'Enter a valid price.');
      return false;
    }
    if (!description.trim()) {
      Alert.alert('Error', 'Describe the darkness within.');
      return false;
    }
    if (!selectedCategory) {
      Alert.alert('Error', 'Select a category.');
      return false;
    }
    if (images.length === 0) {
      Alert.alert('Error', 'Add at least one photo.');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    try {
      const base64Images: string[] = [];
      for (const uri of images) {
        const base64 = await readAsStringAsync(uri, { encoding: EncodingType.Base64 });
        base64Images.push(`data:image/jpeg;base64,${base64}`);
      }

      const sellerProfile = (await getSellerProfile()) || DEFAULT_SELLER_PROFILE;

      await createProduct({
        title: title.trim(),
        price: parseFloat(price),
        description: description.trim(),
        category: selectedCategory,
        images: base64Images,
        isUpsideDown: true, // This is the key difference!
        seller: {
          name: sellerProfile.name || '???',
          email: sellerProfile.email,
          contactNumber: sellerProfile.contactNumber,
          address: sellerProfile.address,
          upiId: sellerProfile.upiId,
          qrImageUrl: sellerProfile.qrImageUrl,
        },
      });

      setIsSubmitting(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('✓ Listed in the Upside Down', 'Your cursed item awaits a buyer...', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      console.error('[AddUpsideDownProduct] Error:', error);
      console.error('[AddUpsideDownProduct] Error message:', error?.message);
      setIsSubmitting(false);
      const errorMsg = error?.message || 'Failed to list item. The void rejected it.';
      Alert.alert('Error', errorMsg);
    }
  };

  const handleGoBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
              <Ionicons name="chevron-back" size={28} color={creepyColors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>☠️ Add Cursed Item</Text>
            <View style={styles.headerSpacer} />
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Images Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📷 Evidence</Text>
              <Text style={styles.sectionSubtitle}>Capture the forbidden (up to 5)</Text>

              <View style={styles.imagesContainer}>
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

                {images.length < 5 && (
                  <TouchableOpacity style={styles.addImageButton} onPress={handleAddImage}>
                    <Ionicons name="camera" size={32} color={creepyColors.primary} />
                    <Text style={styles.addImageText}>Add</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Details Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📜 Details</Text>

              <Text style={styles.inputLabel}>Title *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="What is this cursed thing?"
                placeholderTextColor={creepyColors.textMuted}
                value={title}
                onChangeText={setTitle}
                maxLength={100}
              />

              <Text style={styles.inputLabel}>Price (₹) *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Name your price..."
                placeholderTextColor={creepyColors.textMuted}
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
              />

              <Text style={styles.inputLabel}>Description *</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Describe the darkness within..."
                placeholderTextColor={creepyColors.textMuted}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                maxLength={500}
              />

              <Text style={styles.inputLabel}>Category *</Text>
              <View style={styles.categoriesContainer}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryChip,
                      selectedCategory === cat && styles.categoryChipSelected,
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSelectedCategory(cat);
                    }}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        selectedCategory === cat && styles.categoryChipTextSelected,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={isSubmitting}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={isSubmitting ? ['#444', '#333'] : [creepyColors.primary, creepyColors.accent]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.submitButtonGradient}
              >
                <Text style={styles.submitButtonText}>
                  {isSubmitting ? 'Summoning...' : '☠️ Release to the Void'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
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
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: creepyColors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(155, 48, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '800',
    color: creepyColors.text,
    textAlign: 'center',
    textShadowColor: creepyColors.glow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: creepyColors.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: creepyColors.textMuted,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  imageWrapper: {
    width: 100,
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: creepyColors.primary,
  },
  selectedImage: {
    width: '100%',
    height: '100%',
  },
  removeImageButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: creepyColors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: creepyColors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: creepyColors.inputBg,
  },
  addImageText: {
    color: creepyColors.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: creepyColors.text,
    marginBottom: 8,
    marginTop: 12,
  },
  textInput: {
    backgroundColor: creepyColors.inputBg,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: creepyColors.text,
    borderWidth: 1,
    borderColor: creepyColors.border,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: creepyColors.inputBg,
    borderWidth: 1,
    borderColor: creepyColors.border,
  },
  categoryChipSelected: {
    backgroundColor: creepyColors.primary,
    borderColor: creepyColors.glow,
  },
  categoryChipText: {
    fontSize: 13,
    color: creepyColors.textMuted,
  },
  categoryChipTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  submitButton: {
    marginTop: 24,
    borderRadius: 25,
    overflow: 'hidden',
  },
  submitButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
});

export default AddUpsideDownProductScreen;
