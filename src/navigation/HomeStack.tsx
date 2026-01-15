import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { StyleSheet } from 'react-native';
import { AddProductScreen, ForYouScreen, HomeScreen } from '../screens';
import AddUpsideDownProductScreen from '../screens/AddUpsideDownProductScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import UpsideDownReelsScreen from '../screens/UpsideDownReelsScreen';
import UpsideDownScreen from '../screens/UpsideDownScreen';
import theme from '../theme';
import { HomeStackParamList } from '../types';

/**
 * Home Stack Navigator
 * 
 * WHY STACK INSIDE TAB:
 * - The Home tab needs to show ProductList, Reels, and ProductDetail screens
 * - Stack navigation allows push/pop navigation within the tab
 * - User can tap a product → view details → press back → return to list
 * - This pattern keeps the bottom tabs visible while navigating within a tab
 * 
 * NAVIGATION FLOW:
 * BottomTabs
 *   └── HomeTab (this stack)
 *         ├── ProductList (HomeScreen) - Initial screen
 *         ├── Reels - Full-screen product browsing (hides tabs)
 *         └── ProductDetail - Pushed when product is tapped
 */
const Stack = createNativeStackNavigator<HomeStackParamList>();

const HomeStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: styles.header,
        headerTitleStyle: styles.headerTitle,
        headerTintColor: theme.colors.textPrimary,
      }}
    >
      {/* Main product listing screen */}
      <Stack.Screen
        name="ProductList"
        component={HomeScreen}
        options={{
          headerShown: false,
        }}
      />
      
      {/* For You screen - full-screen product discovery */}
      <Stack.Screen
        name="Reels"
        component={ForYouScreen}
        options={{
          title: 'For You',
          headerShown: false, // Full-screen experience
          animation: 'slide_from_bottom', // Slide up like reels
        }}
      />
      
      {/* Product detail screen - receives product data via params */}
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={({ route }) => ({
          // Dynamic title based on product
          title: route.params?.product?.title || 'Product Details',
          headerBackTitle: 'Back',
        })}
      />
      
      {/* Add Product screen - for listing new products */}
      <Stack.Screen
        name="AddProduct"
        component={AddProductScreen}
        options={{
          title: 'Add Product',
          headerShown: false, // Custom header in screen
          animation: 'slide_from_right',
        }}
      />
      {/* Upside Down - experimental/creepy listings */}
      <Stack.Screen
        name="UpsideDown"
        component={UpsideDownScreen}
        options={{
          title: 'Upside Down',
          headerShown: false,
          animation: 'slide_from_bottom',
        }}
      />
      
      {/* Add Upside Down Product - for listing cursed items */}
      <Stack.Screen
        name="AddUpsideDownProduct"
        component={AddUpsideDownProductScreen}
        options={{
          title: 'Add Cursed Item',
          headerShown: false,
          animation: 'slide_from_right',
        }}
      />
      
      {/* Upside Down Reels - fullscreen forbidden reels */}
      <Stack.Screen
        name="UpsideDownReels"
        component={UpsideDownReelsScreen}
        options={{
          title: 'Forbidden Reels',
          headerShown: false,
          animation: 'slide_from_bottom',
        }}
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: theme.colors.backgroundSecondary,
    elevation: 0,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
});

export default HomeStack;
