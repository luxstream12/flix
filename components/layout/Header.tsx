import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUserProfile } from '../../hooks/useUserProfile';
import { colors, spacing, typography } from '../../constants/theme';

interface HeaderProps {
  onProfilePress?: () => void;
  scrollY?: Animated.Value;
}

export function Header({ onProfilePress, scrollY }: HeaderProps) {
  const insets = useSafeAreaInsets();
  const { profile } = useUserProfile();
  const [opacity] = useState(new Animated.Value(0));

  useEffect(() => {
    if (scrollY) {
      const listener = scrollY.addListener(({ value }) => {
        const newOpacity = Math.min(value / 200, 1);
        opacity.setValue(newOpacity);
      });
      
      return () => scrollY.removeListener(listener);
    }
  }, [scrollY]);

  const backgroundColor = opacity.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(0, 0, 0, 0)', colors.background],
  });

  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          paddingTop: insets.top + spacing.md,
          backgroundColor,
        }
      ]}
    >
      <Text style={styles.logo}>Obaflix</Text>
      <TouchableOpacity 
        style={styles.profileButton}
        onPress={onProfilePress}
      >
        {profile?.avatarUrl ? (
          <Image
            source={{ uri: profile.avatarUrl }}
            style={styles.avatar}
            contentFit="cover"
          />
        ) : (
          <Ionicons name="person-circle" size={36} color={colors.textPrimary} />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.md,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  logo: {
    fontSize: typography.hero,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    letterSpacing: -1,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  profileButton: {
    padding: spacing.xs,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: colors.primary,
  },
});
