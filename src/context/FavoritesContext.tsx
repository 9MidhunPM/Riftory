import React, { createContext, ReactNode, useCallback, useContext, useState } from 'react';
import { Product } from '../types';

/**
 * Favorites Context
 * 
 * Global state management for favorites using Context API.
 * Favorites persist during app runtime and are accessible from:
 * - Reels screen (double-tap to add/remove)
 * - Favorites tab (view all favorites)
 * 
 * Uses product ID for unique identification to prevent duplicates.
 */

interface FavoritesContextType {
  favorites: Product[];
  addToFavorites: (product: Product) => void;
  removeFromFavorites: (productId: string) => void;
  toggleFavorite: (product: Product) => boolean; // Returns true if added, false if removed
  isFavorite: (productId: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

interface FavoritesProviderProps {
  children: ReactNode;
}

export const FavoritesProvider: React.FC<FavoritesProviderProps> = ({ children }) => {
  const [favorites, setFavorites] = useState<Product[]>([]);

  // Add product to favorites (prevents duplicates using product ID)
  const addToFavorites = useCallback((product: Product) => {
    setFavorites((prev) => {
      if (prev.some((p) => p.id === product.id)) {
        return prev;
      }
      return [...prev, product];
    });
  }, []);

  // Remove product from favorites by ID
  const removeFromFavorites = useCallback((productId: string) => {
    setFavorites((prev) => prev.filter((p) => p.id !== productId));
  }, []);

  // Toggle favorite status - returns true if added, false if removed
  const toggleFavorite = useCallback((product: Product): boolean => {
    let wasAdded = false;
    setFavorites((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        wasAdded = false;
        return prev.filter((p) => p.id !== product.id);
      } else {
        wasAdded = true;
        return [...prev, product];
      }
    });
    return wasAdded;
  }, []);

  // Check if product is in favorites
  const isFavorite = useCallback((productId: string): boolean => {
    return favorites.some((p) => p.id === productId);
  }, [favorites]);

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addToFavorites,
        removeFromFavorites,
        toggleFavorite,
        isFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

// Custom hook for using favorites context
export const useFavorites = (): FavoritesContextType => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

export default FavoritesContext;
