import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getSellerProfile, SellerProfile } from '../services/profileStorage';
import theme from '../theme';
import { SettingsStackParamList } from '../types';

type SettingsNavigationProp = NativeStackNavigationProp<SettingsStackParamList, 'SettingsMain'>;

/**
 * Settings Screen
 * 
 * Full-height from top (no tab header)
 * 
 * Minimal settings with:
 * - Profile info (from saved profile or default)
 * - Basic menu items (no payment methods)
 * - Logout button (non-functional placeholder)
 */
const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<SettingsNavigationProp>();
  const [profile, setProfile] = useState<SellerProfile | null>(null);

  // Load profile when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadProfile();
      return () => {};
    }, [])
  );

  const loadProfile = async () => {
    const savedProfile = await getSellerProfile();
    setProfile(savedProfile);
  };

  // Minimal menu items - NO payment methods
  const menuItems = [
    { id: '1', label: 'Edit Profile', icon: '👤' },
    { id: '2', label: 'Notifications', icon: '🔔' },
    { id: '3', label: 'Address Book', icon: '📍' },
    { id: '4', label: 'Help & Support', icon: '❓' },
    { id: '5', label: 'About', icon: 'ℹ️' },
  ];

  const handleMenuPress = (label: string) => {
    if (label === 'Edit Profile') {
      navigation.navigate('EditProfile');
    }
  };

  const handleLogout = () => {
    // Non-functional placeholder - future implementation
  };

  return (
    // Full height from top - using 'top' edge for SafeAreaView
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.content}>
        {/* Profile Section - from saved profile or default */}
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>👤</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{profile?.name || 'Set up your profile'}</Text>
            <Text style={styles.profileEmail}>{profile?.email || 'Tap Edit Profile to get started'}</Text>
          </View>
        </View>

        {/* Menu List */}
        <View style={styles.menuList}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => handleMenuPress(item.label)}
              activeOpacity={0.7}
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Text style={styles.logoutIcon}>🚪</Text>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textMuted,
    marginBottom: 24,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.backgroundSecondary,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 5,
  },
  avatarText: {
    fontSize: 28,
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  profileEmail: {
    fontSize: 14,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  menuList: {
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.textPrimary,
  },
  menuArrow: {
    fontSize: 20,
    color: theme.colors.textMuted,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(229, 9, 20, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  logoutIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
  },
});

export default SettingsScreen;
