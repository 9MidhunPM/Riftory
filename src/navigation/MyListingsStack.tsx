import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { StyleSheet } from 'react-native';
import MyListingsScreen from '../screens/MyListingsScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import theme from '../theme';
import { MyListingsStackParamList } from '../types';

/**
 * My Listings Stack Navigator
 * 
 * Allows navigation within the My Listings tab:
 * - MyListingsMain: Shows user's product listings
 * - ProductDetail: View product details
 */
const Stack = createNativeStackNavigator<MyListingsStackParamList>();

const MyListingsStack: React.FC = () => {
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
        name="MyListingsMain"
        component={MyListingsScreen}
        options={{
          title: 'My Listings',
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
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default MyListingsStack;
