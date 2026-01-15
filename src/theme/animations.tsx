/**
 * Animated Components for Stranger Things Theme
 * 
 * Reusable animated wrappers and components for smooth transitions.
 */

import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Easing,
    StyleSheet,
    TouchableOpacity,
    TouchableOpacityProps,
    View,
    ViewStyle,
} from 'react-native';
import theme from './index';

/**
 * Fade In View - Animates children with a fade-in effect
 */
interface FadeInViewProps {
  children: React.ReactNode;
  duration?: number;
  delay?: number;
  style?: ViewStyle;
}

export const FadeInView: React.FC<FadeInViewProps> = ({
  children,
  duration = 500,
  delay = 0,
  style,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration,
      delay,
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic),
    }).start();
  }, []);

  return (
    <Animated.View style={[style, { opacity: fadeAnim }]}>
      {children}
    </Animated.View>
  );
};

/**
 * Slide In View - Animates children sliding in from bottom
 */
interface SlideInViewProps {
  children: React.ReactNode;
  duration?: number;
  delay?: number;
  fromY?: number;
  style?: ViewStyle;
}

export const SlideInView: React.FC<SlideInViewProps> = ({
  children,
  duration = 500,
  delay = 0,
  fromY = 50,
  style,
}) => {
  const slideAnim = useRef(new Animated.Value(fromY)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration,
        delay,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.5)),
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

/**
 * Scale In View - Animates with scale effect
 */
interface ScaleInViewProps {
  children: React.ReactNode;
  duration?: number;
  delay?: number;
  style?: ViewStyle;
}

export const ScaleInView: React.FC<ScaleInViewProps> = ({
  children,
  duration = 400,
  delay = 0,
  style,
}) => {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 100,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

/**
 * Pulse View - Continuous pulsing animation (for emphasis)
 */
interface PulseViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
}

export const PulseView: React.FC<PulseViewProps> = ({
  children,
  style,
  intensity = 0.05,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1 + intensity,
          duration: 1500,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={[style, { transform: [{ scale: pulseAnim }] }]}>
      {children}
    </Animated.View>
  );
};

/**
 * Animated Pressable - TouchableOpacity with scale animation
 */
interface AnimatedPressableProps extends TouchableOpacityProps {
  children: React.ReactNode;
  scaleValue?: number;
}

export const AnimatedPressable: React.FC<AnimatedPressableProps> = ({
  children,
  scaleValue = 0.96,
  style,
  onPressIn,
  onPressOut,
  ...props
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = (e: any) => {
    Animated.spring(scaleAnim, {
      toValue: scaleValue,
      friction: 5,
      tension: 300,
      useNativeDriver: true,
    }).start();
    onPressIn?.(e);
  };

  const handlePressOut = (e: any) => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 300,
      useNativeDriver: true,
    }).start();
    onPressOut?.(e);
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      {...props}
    >
      <Animated.View style={[style, { transform: [{ scale: scaleAnim }] }]}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
};

/**
 * Glow View - View with animated glowing shadow
 * Note: Uses separate views to avoid mixing native/JS driver animations
 */
interface GlowViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
  glowColor?: string;
}

export const GlowView: React.FC<GlowViewProps> = ({
  children,
  style,
  glowColor = theme.colors.primary,
}) => {
  const glowAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 0.8,
          duration: 2000,
          useNativeDriver: false,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(glowAnim, {
          toValue: 0.3,
          duration: 2000,
          useNativeDriver: false,
          easing: Easing.inOut(Easing.ease),
        }),
      ])
    ).start();

    return () => {
      glowAnim.stopAnimation();
    };
  }, []);

  return (
    <Animated.View
      style={{
        shadowColor: glowColor,
        shadowOpacity: glowAnim,
        shadowRadius: 15,
        shadowOffset: { width: 0, height: 0 },
      }}
    >
      <View style={style}>
        {children}
      </View>
    </Animated.View>
  );
};

/**
 * Staggered List Item - For animating list items with stagger effect
 */
interface StaggeredItemProps {
  children: React.ReactNode;
  index: number;
  style?: ViewStyle;
}

export const StaggeredItem: React.FC<StaggeredItemProps> = ({
  children,
  index,
  style,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    const delay = index * 80; // 80ms stagger between items

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

/**
 * Shimmer Loading Placeholder
 */
interface ShimmerProps {
  width: number | string;
  height: number;
  borderRadius?: number;
}

export const Shimmer: React.FC<ShimmerProps> = ({
  width,
  height,
  borderRadius = 8,
}) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
        easing: Easing.linear,
      })
    ).start();
  }, []);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });

  return (
    <View
      style={[
        styles.shimmerContainer,
        { width: width as any, height, borderRadius },
      ]}
    >
      <Animated.View
        style={[
          styles.shimmerGradient,
          { transform: [{ translateX }] },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  shimmerContainer: {
    backgroundColor: theme.colors.backgroundTertiary,
    overflow: 'hidden',
  },
  shimmerGradient: {
    width: 200,
    height: '100%',
    backgroundColor: theme.colors.shimmer,
  },
});
