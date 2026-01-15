import AsyncStorage from '@react-native-async-storage/async-storage';

const PROFILE_KEY = '@riftory_seller_profile';

/**
 * Default seller profile for anonymous users
 */
export const DEFAULT_SELLER_PROFILE: SellerProfile = {
  name: 'Anonymous User',
  email: undefined,
  contactNumber: undefined,
  address: undefined,
  upiId: undefined,
  qrImageUrl: undefined,
};

/**
 * Seller profile data stored locally
 */
export interface SellerProfile {
  name: string;
  email?: string;
  contactNumber?: string;
  address?: string;
  upiId?: string;
  qrImageUrl?: string;
}

/**
 * Check if profile is still in default/unedited state
 */
export const isProfileDefault = async (): Promise<boolean> => {
  try {
    const data = await AsyncStorage.getItem(PROFILE_KEY);
    if (!data) return true;
    
    const profile = JSON.parse(data) as SellerProfile;
    // Profile is default if name is empty or is "Anonymous User"
    return !profile.name || profile.name.trim() === '' || profile.name === 'Anonymous User';
  } catch (error) {
    console.error('[ProfileStorage] Error checking if profile is default:', error);
    return true;
  }
};

/**
 * Get seller profile from AsyncStorage
 * Returns default profile if none is saved
 */
export const getSellerProfile = async (): Promise<SellerProfile | null> => {
  try {
    const data = await AsyncStorage.getItem(PROFILE_KEY);
    if (data) {
      return JSON.parse(data) as SellerProfile;
    }
    return null;
  } catch (error) {
    console.error('[ProfileStorage] Error getting profile:', error);
    return null;
  }
};

/**
 * Save seller profile to AsyncStorage
 */
export const saveSellerProfile = async (profile: SellerProfile): Promise<void> => {
  try {
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (error) {
    console.error('[ProfileStorage] Error saving profile:', error);
    throw error;
  }
};

/**
 * Clear seller profile from AsyncStorage
 */
export const clearSellerProfile = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(PROFILE_KEY);
  } catch (error) {
    console.error('[ProfileStorage] Error clearing profile:', error);
    throw error;
  }
};
