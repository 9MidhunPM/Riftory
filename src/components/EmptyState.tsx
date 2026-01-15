import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import theme from '../theme';

interface EmptyStateProps {
  title: string;
  message: string;
  iconName?: keyof typeof Ionicons.glyphMap;
}

/**
 * EmptyState - Premium Stranger Things Dark Theme
 * Features stunning animations, gradients, and glow effects.
 */
const EmptyState: React.FC<EmptyStateProps> = ({ 
  title, 
  message, 
  iconName = 'cube-outline' 
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    // Entry animations
    Animated.parallel([
      Animated.spring(fadeAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous pulse glow
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.5,
          duration: 2000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
        },
      ]}
    >
      {/* Glow orb behind icon */}
      <Animated.View style={[styles.glowOrb, { opacity: pulseAnim }]} />
      
      {/* Icon container with gradient border */}
      <View style={styles.iconContainer}>
        <LinearGradient
          colors={['rgba(229, 9, 20, 0.3)', 'rgba(229, 9, 20, 0.1)', 'rgba(0, 0, 0, 0)']}
          style={styles.iconGradient}
        >
          <Ionicons name={iconName} size={64} color={theme.colors.primary} />
        </LinearGradient>
      </View>
      
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>

      {/* Bottom decorative line */}
      <LinearGradient
        colors={['transparent', theme.colors.primary, 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.decorLine}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    paddingTop: 80,
    position: 'relative',
  },
  glowOrb: {
    position: 'absolute',
    top: 60,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 50,
  },
  iconContainer: {
    marginBottom: 24,
    zIndex: 1,
  },
  iconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(229, 9, 20, 0.3)',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  message: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
  decorLine: {
    width: 100,
    height: 2,
    marginTop: 32,
    borderRadius: 1,
  },
});

export default EmptyState;
