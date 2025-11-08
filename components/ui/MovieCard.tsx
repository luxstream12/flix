import React from 'react';
import { TouchableOpacity, StyleSheet, View, Text } from 'react-native';
import { Image } from 'expo-image';
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Content } from '../../types';
import { colors, spacing, borderRadius, typography } from '../../constants/theme';

interface MovieCardProps {
  content: Content;
  onPress: () => void;
  width?: number;
  showTitle?: boolean;
}

export function MovieCard({ content, onPress, width = 120, showTitle = false }: MovieCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const height = width * 1.5;

  return (
    <Animated.View entering={FadeIn} style={[styles.container, { width }]}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Animated.View style={animatedStyle}>
          <Image
            source={{ uri: content.coverUrl }}
            style={[styles.image, { width, height }]}
            contentFit="cover"
            transition={300}
          />
          {content.isNew && (
            <View style={styles.newBadge}>
              <Text style={styles.newText}>NOVO</Text>
            </View>
          )}
        </Animated.View>
        {showTitle && (
          <Text style={styles.title} numberOfLines={2}>
            {content.title}
          </Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginRight: spacing.md,
  },
  image: {
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surface,
  },
  newBadge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  newText: {
    color: colors.textPrimary,
    fontSize: typography.xs,
    fontWeight: typography.weights.bold,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.sm,
    marginTop: spacing.xs,
    fontWeight: typography.weights.medium,
  },
});
