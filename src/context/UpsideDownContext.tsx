import React, { createContext, ReactNode, useCallback, useContext, useState } from 'react';

/**
 * Upside Down Context
 * 
 * Global state for "Upside Down Mode" - a dark/alternative theme
 * that transforms the app experience:
 * 
 * NORMAL MODE:
 * - Warm, slightly eerie aesthetic
 * - Artisan/craft products
 * - Readable, inviting UI
 * 
 * UPSIDE DOWN MODE:
 * - Dark, blood-tinted aesthetic
 * - Black market/cursed items
 * - Dangerous, mysterious UI
 * - Warning indicators for cursed items
 * 
 * Mode persists during session and affects:
 * - Product data displayed
 * - Color scheme and overlays
 * - Copy/text tone
 * - Heart animation colors
 */

interface UpsideDownContextType {
  isUpsideDown: boolean;
  toggleMode: () => void;
  setUpsideDown: (value: boolean) => void;
}

const UpsideDownContext = createContext<UpsideDownContextType | undefined>(undefined);

interface UpsideDownProviderProps {
  children: ReactNode;
}

export const UpsideDownProvider: React.FC<UpsideDownProviderProps> = ({ children }) => {
  const [isUpsideDown, setIsUpsideDown] = useState(false);

  const toggleMode = useCallback(() => {
    setIsUpsideDown((prev) => !prev);
  }, []);

  const setUpsideDown = useCallback((value: boolean) => {
    setIsUpsideDown(value);
  }, []);

  return (
    <UpsideDownContext.Provider
      value={{
        isUpsideDown,
        toggleMode,
        setUpsideDown,
      }}
    >
      {children}
    </UpsideDownContext.Provider>
  );
};

// Custom hook for using upside down context
export const useUpsideDown = (): UpsideDownContextType => {
  const context = useContext(UpsideDownContext);
  if (!context) {
    throw new Error('useUpsideDown must be used within an UpsideDownProvider');
  }
  return context;
};
