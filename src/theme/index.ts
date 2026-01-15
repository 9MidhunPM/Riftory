/**
 * Stranger Things Dark Theme
 * 
 * A mysterious, atmospheric dark theme inspired by Stranger Things.
 * Features deep blacks, neon red accents, and subtle glowing effects.
 */

export const theme = {
  // Core Colors
  colors: {
    // Backgrounds
    background: '#0a0a0a',        // Deep black
    backgroundSecondary: '#121212', // Slightly lighter black
    backgroundTertiary: '#1a1a1a',  // Card backgrounds
    surface: '#1e1e1e',           // Elevated surfaces
    
    // Primary - Stranger Things Red
    primary: '#e50914',           // Netflix/ST red
    primaryDark: '#b20710',       // Darker red
    primaryLight: '#ff4444',      // Lighter red for glows
    
    // Accent Colors
    accent: '#ff6b6b',            // Coral accent
    accentBlue: '#4ecdc4',        // Teal accent
    accentPurple: '#9b59b6',      // Purple for mystery
    accentGold: '#f1c40f',        // Gold for special items
    
    // Text Colors
    textPrimary: '#ffffff',       // Pure white
    textSecondary: '#b3b3b3',     // Muted white
    textTertiary: '#666666',      // Dim text
    textMuted: '#444444',         // Very dim text
    
    // UI Elements
    border: '#2a2a2a',            // Subtle borders
    borderLight: '#3a3a3a',       // Lighter borders
    divider: '#1f1f1f',           // Dividers
    
    // Status Colors
    success: '#2ecc71',           // Green
    warning: '#f39c12',           // Orange
    error: '#e74c3c',             // Red
    info: '#3498db',              // Blue
    
    // Special Effects
    glow: 'rgba(229, 9, 20, 0.3)', // Red glow
    glowStrong: 'rgba(229, 9, 20, 0.6)', // Strong red glow
    overlay: 'rgba(0, 0, 0, 0.7)', // Dark overlay
    shimmer: 'rgba(255, 255, 255, 0.05)', // Subtle shimmer
  },

  // Typography
  typography: {
    fontSizes: {
      xs: 10,
      sm: 12,
      md: 14,
      lg: 16,
      xl: 18,
      xxl: 22,
      xxxl: 28,
      hero: 36,
    },
    fontWeights: {
      light: '300' as const,
      regular: '400' as const,
      medium: '500' as const,
      semiBold: '600' as const,
      bold: '700' as const,
      extraBold: '800' as const,
    },
  },

  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },

  // Border Radius
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    round: 9999,
  },

  // Shadows (with red glow effect)
  shadows: {
    sm: {
      shadowColor: '#e50914',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: '#e50914',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#e50914',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.25,
      shadowRadius: 12,
      elevation: 6,
    },
    glow: {
      shadowColor: '#e50914',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 20,
      elevation: 8,
    },
  },

  // Animation Durations
  animation: {
    fast: 150,
    normal: 300,
    slow: 500,
    verySlow: 800,
  },
};

// Common styles that can be reused across components
export const commonStyles = {
  // Glowing border effect
  glowBorder: {
    borderWidth: 1,
    borderColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },

  // Card style with dark theme
  card: {
    backgroundColor: theme.colors.backgroundTertiary,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.md,
  },

  // Text glow effect (for headings)
  textGlow: {
    textShadowColor: theme.colors.primaryLight,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
};

export default theme;
