import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import theme from '../theme';

interface GradientHeaderProps {
  title: string;
  subtitle?: string;
  showSearch?: boolean;
  onSearchPress?: () => void;
  onSearch?: (query: string) => void;
  searchValue?: string;
  onSearchChange?: (text: string) => void;
  rightAction?: {
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
  };
}

/**
 * GradientHeader - A stunning header with gradient background and glow effects
 */
const GradientHeader: React.FC<GradientHeaderProps> = ({
  title,
  subtitle,
  showSearch = false,
  onSearchPress,
  onSearch,
  searchValue,
  onSearchChange,
  rightAction,
}) => {
  const glowAnim = useRef(new Animated.Value(0.3)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Title fade in
    Animated.spring(titleAnim, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();

    // Subtle glow pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 0.6,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.3,
          duration: 2000,
          useNativeDriver: false,
        }),
      ])
    ).start();

    return () => {
      glowAnim.stopAnimation();
    };
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1a0a0a', '#0a0a0a', '#0a0a0a']}
        style={styles.gradient}
      >
        {/* Decorative glow orbs */}
        <Animated.View style={[styles.glowOrb, styles.glowOrb1, { opacity: glowAnim }]} />
        <Animated.View style={[styles.glowOrb, styles.glowOrb2, { opacity: glowAnim }]} />

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Animated.View style={{ opacity: titleAnim, transform: [{ scale: titleAnim }] }}>
              <Text style={styles.title}>{title}</Text>
              {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            </Animated.View>

            {rightAction && (
              <TouchableOpacity style={styles.actionButton} onPress={rightAction.onPress}>
                <Ionicons name={rightAction.icon} size={24} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            )}
          </View>

          {showSearch && (
            <TouchableOpacity 
              style={styles.searchContainer} 
              onPress={onSearchPress}
              activeOpacity={0.8}
            >
              <Ionicons name="search" size={20} color={theme.colors.textMuted} />
              {onSearchChange || onSearch ? (
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search products..."
                  placeholderTextColor={theme.colors.textMuted}
                  value={searchValue}
                  onChangeText={(text) => {
                    onSearchChange?.(text);
                    onSearch?.(text);
                  }}
                />
              ) : (
                <Text style={styles.searchPlaceholder}>Search products...</Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Bottom gradient line */}
        <LinearGradient
          colors={['transparent', theme.colors.primary, 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.bottomLine}
        />
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  gradient: {
    paddingTop: 8,
    paddingBottom: 16,
    paddingHorizontal: 20,
    position: 'relative',
  },
  glowOrb: {
    position: 'absolute',
    borderRadius: 100,
    backgroundColor: theme.colors.primary,
  },
  glowOrb1: {
    width: 150,
    height: 150,
    top: -80,
    left: -40,
    opacity: 0.15,
  },
  glowOrb2: {
    width: 100,
    height: 100,
    top: -30,
    right: -20,
    opacity: 0.1,
  },
  content: {
    zIndex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    letterSpacing: -0.5,
    textShadowColor: theme.colors.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 4,
    letterSpacing: 0.5,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.textPrimary,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.textMuted,
  },
  bottomLine: {
    height: 1,
    position: 'absolute',
    bottom: 0,
    left: 20,
    right: 20,
    opacity: 0.5,
  },
});

export default GradientHeader;
