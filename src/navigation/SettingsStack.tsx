import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { StyleSheet } from 'react-native';
import EditProfileScreen from '../screens/EditProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import theme from '../theme';
import { SettingsStackParamList } from '../types';

/**
 * Settings Stack Navigator
 * 
 * Allows navigation within the Settings tab:
 * - SettingsMain: Main settings menu
 * - EditProfile: Edit seller profile information
 */
const Stack = createNativeStackNavigator<SettingsStackParamList>();

const SettingsStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: styles.header,
        headerTitleStyle: styles.headerTitle,
        headerTintColor: theme.colors.textPrimary,
        headerShown: false, // We use custom headers in screens
      }}
    >
      <Stack.Screen
        name="SettingsMain"
        component={SettingsScreen}
        options={{
          title: 'Settings',
        }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{
          title: 'Edit Profile',
          animation: 'slide_from_right',
        }}
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: theme.colors.backgroundSecondary,
  },
  headerTitle: {
    color: theme.colors.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SettingsStack;
