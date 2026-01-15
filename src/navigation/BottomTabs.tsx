import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import EditProfileScreen from '../screens/EditProfileScreen';
import theme from '../theme';
import { RootTabParamList } from '../types';
import FavoritesStack from './FavoritesStack';
import HomeStack from './HomeStack';
import MyListingsStack from './MyListingsStack';

/**
 * Bottom Tab Navigator - Premium Stranger Things Dark Theme
 * 
 * Features animated tab icons with gradient backgrounds and glow effects.
 */
const Tab = createBottomTabNavigator<RootTabParamList>();

// Icon name mapping
type IconName = keyof typeof Ionicons.glyphMap;

const getIconName = (routeName: string, focused: boolean): IconName => {
  switch (routeName) {
    case 'HomeTab':
      return focused ? 'home' : 'home-outline';
    case 'MyListings':
      return focused ? 'cube' : 'cube-outline';
    case 'Favorites':
      return focused ? 'heart' : 'heart-outline';
    case 'Profile':
      return focused ? 'person' : 'person-outline';
    default:
      return 'apps-outline';
  }
};

// Premium Animated Tab Icon with scale effect and glow
const TabIcon: React.FC<{ name: string; focused: boolean; color: string }> = ({ 
  name, 
  focused, 
  color 
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: focused ? 1.15 : 1,
      friction: 5,
      tension: 300,
      useNativeDriver: true,
    }).start();
  }, [focused]);

  return (
    <View style={styles.iconWrapper}>
      <Animated.View
        style={[
          styles.iconContainer,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Ionicons 
          name={getIconName(name, focused)} 
          size={24} 
          color={color} 
        />
      </Animated.View>
    </View>
  );
};

// Simple Tab Bar Background
const TabBarBackground: React.FC = () => (
  <View style={styles.tabBarBackgroundContainer}>
    <View style={styles.topLine} />
    <View style={styles.tabBarBackground} />
  </View>
);

const BottomTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color }) => (
          <TabIcon name={route.name} focused={focused} color={color} />
        ),
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        headerStyle: styles.header,
        headerTitleStyle: styles.headerTitle,
        tabBarBackground: () => <TabBarBackground />,
      })}
    >
      {/* Home Tab - Uses Stack Navigator for product list/detail navigation */}
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{
          title: 'Home',
          // Hide tab header because HomeStack has its own headers
          headerShown: false,
        }}
      />
      
      {/* My Listings - Uses Stack Navigator for navigation to product details */}
      <Tab.Screen
        name="MyListings"
        component={MyListingsStack}
        options={{
          title: 'My Listings',
          headerShown: false,
        }}
      />
      
      {/* Favorites - Uses Stack Navigator for navigation to product details */}
      <Tab.Screen
        name="Favorites"
        component={FavoritesStack}
        options={{
          title: 'Favorites',
          headerShown: false,
        }}
      />
      
      {/* Profile - Direct EditProfile screen */}
      <Tab.Screen
        name="Profile"
        component={EditProfileScreen}
        options={{
          title: 'Profile',
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    paddingTop: 12,
    paddingBottom: 20,
    height: 80,
    position: 'absolute',
    elevation: 0,
  },
  tabBarBackgroundContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  topLine: {
    height: 1,
    width: '100%',
    backgroundColor: theme.colors.border,
  },
  tabBarBackground: {
    flex: 1,
    backgroundColor: 'rgba(10, 10, 10, 0.98)',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
    letterSpacing: 0.3,
  },
  header: {
    backgroundColor: theme.colors.background,
    elevation: 0,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 36,
    position: 'relative',
  },
  iconGlow: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'transparent',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  iconBackground: {
    width: 44,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(229, 9, 20, 0.4)',
  },
  iconBackgroundInactive: {
    width: 44,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default BottomTabs;
