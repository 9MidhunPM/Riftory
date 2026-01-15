import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { StyleSheet } from 'react-native';
import FavoritesScreen from '../screens/FavoritesScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import theme from '../theme';
import { FavoritesStackParamList } from '../types';

/**
 * Favorites Stack Navigator
 * 
 * Allows navigation within the Favorites tab:
 * - FavoritesMain: Shows user's favorite products
 * - ProductDetail: View product details
 */
const Stack = createNativeStackNavigator<FavoritesStackParamList>();

const FavoritesStack: React.FC = () => {
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
        name="FavoritesMain"
        component={FavoritesScreen}
        options={{
          title: 'Favorites',
        }}
      />
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={({ route }) => ({
          title: route.params?.product?.title || 'Product Details',
          headerShown: true,
          headerBackTitle: 'Back',
          animation: 'slide_from_right',
        })}
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
    fontWeight: '600',
  },
});

export default FavoritesStack;
