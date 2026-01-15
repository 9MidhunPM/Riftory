import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import theme from '../theme';

/**
 * Floating Action Button (FAB) - Premium Stranger Things Dark Theme
 * 
 * Features stunning gradient, glow effects, and smooth animations.
 */

interface FloatingActionButtonProps {
  onPress: () => void;
  label?: string;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onPress,
  label = 'For you',
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0.3)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entry animation
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      delay: 200,
      useNativeDriver: true,
    }).start();

    // Subtle pulsing glow effect
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 0.7,
          duration: 1500,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.3,
          duration: 1500,
          useNativeDriver: false,
        }),
      ])
    ).start();

    // Shimmer effect
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.92,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 100],
  });

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      {/* Outer view for glow animation (JS driver) */}
      <Animated.View
        style={[
          styles.fabGlow,
          {
            shadowOpacity: glowAnim,
          },
        ]}
      >
        {/* Inner view for scale animation (native driver) */}
        <Animated.View
          style={[
            styles.fabContainer,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={['rgba(229, 9, 20, 0.15)', 'rgba(10, 10, 10, 0.95)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fabContent}
          >
            {/* Shimmer overlay */}
            <Animated.View 
              style={[
                styles.shimmer,
                { transform: [{ translateX: shimmerTranslate }] }
              ]}
            >
              <LinearGradient
                colors={['transparent', 'rgba(255,255,255,0.1)', 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.shimmerGradient}
              />
            </Animated.View>

            {/* Icon */}
            <View style={styles.iconContainer}>
              <Ionicons name="sparkles" size={18} color={theme.colors.primary} />
            </View>
            
            {/* Label */}
            <Text style={styles.fabText}>{label}</Text>
          </LinearGradient>

          {/* Border gradient */}
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.accent, theme.colors.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.borderGradient}
          />
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fabGlow: {
    position: 'absolute',
    bottom: 95,
    left: 20,
    borderRadius: 28,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 20,
    elevation: 8,
  },
  fabContainer: {
    borderRadius: 28,
    overflow: 'hidden',
  },
  fabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 27,
    borderWidth: 1,
    borderColor: 'rgba(229, 9, 20, 0.4)',
    gap: 8,
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 60,
  },
  shimmerGradient: {
    flex: 1,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(229, 9, 20, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabText: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    letterSpacing: 0.3,
  },
  borderGradient: {
    height: 2,
    width: '100%',
  },
});

export default FloatingActionButton;
