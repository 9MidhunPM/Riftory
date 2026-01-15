import { useFocusEffect } from '@react-navigation/native';
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
import { getSellerProfile, saveSellerProfile, SellerProfile } from '../services/profileStorage';
import theme from '../theme';

/**
 * Edit Profile Screen (Profile Tab)
 * 
 * Allows users to set their seller profile information:
 * - Name (required)
 * - Email
 * - Contact Number
 * - Address
 * 
 * This info is used when creating product listings.
 * Now shown directly as a tab instead of nested in settings.
 */
const EditProfileScreen: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<SellerProfile>({
    name: '',
    email: '',
    contactNumber: '',
    address: '',
    upiId: '',
    qrImageUrl: '',
  });

  // Load existing profile when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [])
  );

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const savedProfile = await getSellerProfile();
      if (savedProfile) {
        setProfile(savedProfile);
      }
    } catch (error) {
      console.error('[EditProfile] Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = useCallback((field: keyof SellerProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  }, []);

  const handlePickQRImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Gallery permission is needed to select QR image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      try {
        const base64 = await readAsStringAsync(result.assets[0].uri, { encoding: EncodingType.Base64 });
        const dataUri = `data:image/jpeg;base64,${base64}`;
        setProfile(prev => ({ ...prev, qrImageUrl: dataUri }));
      } catch (error) {
        console.error('[EditProfile] Error reading QR image:', error);
        Alert.alert('Error', 'Failed to load QR image.');
      }
    }
  };

  const handleRemoveQRImage = () => {
    setProfile(prev => ({ ...prev, qrImageUrl: undefined }));
  };

  const validateProfile = (): boolean => {
    if (!profile.name.trim()) {
      Alert.alert('Validation Error', 'Please enter your name.');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateProfile()) return;

    setIsSaving(true);
    try {
      await saveSellerProfile({
        name: profile.name.trim(),
        email: profile.email?.trim() || undefined,
        contactNumber: profile.contactNumber?.trim() || undefined,
        address: profile.address?.trim() || undefined,
        upiId: profile.upiId?.trim() || undefined,
        qrImageUrl: profile.qrImageUrl || undefined,
      });
      
      Alert.alert('Success', 'Profile saved successfully!');
    } catch (error) {
      console.error('[EditProfile] Save error:', error);
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerSpacer} />
          <Text style={styles.headerTitle}>My Profile</Text>
          <TouchableOpacity
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isSaving}
          >
            <Text style={styles.saveButtonText}>{isSaving ? '...' : 'Save'}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Profile Icon */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>👤</Text>
            </View>
            <Text style={styles.avatarHint}>Seller Profile</Text>
          </View>

          {/* Name Field (Required) */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Name <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.textInput}
              value={profile.name}
              onChangeText={(text) => handleInputChange('name', text)}
              placeholder="Enter your name"
              placeholderTextColor="#999"
              autoCapitalize="words"
            />
            <Text style={styles.inputHint}>This will appear on your product listings</Text>
          </View>

          {/* Email Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.textInput}
              value={profile.email}
              onChangeText={(text) => handleInputChange('email', text)}
              placeholder="your@email.com"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Contact Number Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Contact Number</Text>
            <TextInput
              style={styles.textInput}
              value={profile.contactNumber}
              onChangeText={(text) => handleInputChange('contactNumber', text)}
              placeholder="+91 XXXXX XXXXX"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
            />
          </View>

          {/* Address Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Address</Text>
            <TextInput
              style={[styles.textInput, styles.textInputMultiline]}
              value={profile.address}
              onChangeText={(text) => handleInputChange('address', text)}
              placeholder="Enter your address"
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Payment Section Header */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>💳 Payment Details (Optional)</Text>
            <Text style={styles.sectionSubtitle}>
              Add your UPI details so buyers can pay you directly
            </Text>
          </View>

          {/* UPI ID Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>UPI ID</Text>
            <TextInput
              style={styles.textInput}
              value={profile.upiId}
              onChangeText={(text) => handleInputChange('upiId', text)}
              placeholder="yourname@upi"
              placeholderTextColor="#999"
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <Text style={styles.inputHint}>e.g., name@paytm, number@ybl</Text>
          </View>

          {/* QR Code Image */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Payment QR Code</Text>
            {profile.qrImageUrl ? (
              <View style={styles.qrImageContainer}>
                <Image source={{ uri: profile.qrImageUrl }} style={styles.qrImage} />
                <TouchableOpacity style={styles.removeQrButton} onPress={handleRemoveQRImage}>
                  <Text style={styles.removeQrText}>✕ Remove</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.qrPickerButton} onPress={handlePickQRImage}>
                <Text style={styles.qrPickerIcon}>📱</Text>
                <Text style={styles.qrPickerText}>Add QR Code Image</Text>
                <Text style={styles.qrPickerHint}>Tap to select from gallery</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Info Note */}
          <View style={styles.infoBox}>
            <Text style={styles.infoIcon}>ℹ️</Text>
            <Text style={styles.infoText}>
              This information will be shown to buyers when they view your product listings.
              Only your name is required.
            </Text>
          </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerSpacer: {
    width: 60,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  saveButtonDisabled: {
    backgroundColor: theme.colors.textTertiary,
    shadowOpacity: 0,
  },
  saveButtonText: {
    color: theme.colors.textPrimary,
    fontWeight: '600',
    fontSize: 14,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  avatarText: {
    fontSize: 48,
  },
  avatarHint: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  required: {
    color: theme.colors.primary,
  },
  textInput: {
    backgroundColor: theme.colors.backgroundTertiary,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: theme.colors.textPrimary,
  },
  textInputMultiline: {
    minHeight: 100,
    paddingTop: 14,
  },
  inputHint: {
    fontSize: 12,
    color: theme.colors.textTertiary,
    marginTop: 4,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(229, 9, 20, 0.1)',
    borderRadius: 10,
    padding: 14,
    marginTop: 10,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  infoIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  sectionHeader: {
    marginTop: 10,
    marginBottom: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  qrImageContainer: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: theme.colors.backgroundTertiary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  qrImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  removeQrButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(229, 9, 20, 0.2)',
    borderRadius: 8,
  },
  removeQrText: {
    color: theme.colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  qrPickerButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    backgroundColor: theme.colors.backgroundTertiary,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
  },
  qrPickerIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  qrPickerText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  qrPickerHint: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
});

export default EditProfileScreen;
