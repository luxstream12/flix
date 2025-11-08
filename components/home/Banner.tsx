import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, { 
  FadeIn, 
  FadeOut,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Content } from '../../types';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';

interface BannerProps {
  content: Content[];
}

export function Banner({ content }: BannerProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [dimensions, setDimensions] = useState({ width: 375, height: 667 });
  const router = useRouter();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const updateDimensions = () => {
      const { width, height } = Dimensions.get('window');
      setDimensions({ width: Math.max(1, width), height: Math.max(1, height) });
    };
    
    updateDimensions();
    const subscription = Dimensions.addEventListener('change', updateDimensions);
    
    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    if (content.length <= 1) return;

    intervalRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % content.length);
    }, 10000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [content.length]);

  const handleWatch = () => {
    const activeItem = content[activeIndex];
    router.push({
      pathname: '/player',
      params: { 
        id: activeItem.id,
        url: activeItem.videoUrl,
      },
    });
  };

  const handleInfo = () => {
    router.push({
      pathname: '/details',
      params: { id: content[activeIndex].id },
    });
  };

  if (content.length === 0) return null;

  const activeContent = content[activeIndex];
  const bannerHeight = Math.max(1, dimensions.width * 0.75);

  return (
    <View style={[styles.container, { height: bannerHeight, marginTop: 80 }]}>
      <Animated.View
        key={activeIndex}
        entering={FadeIn.duration(800)}
        exiting={FadeOut.duration(800)}
        style={StyleSheet.absoluteFill}
      >
        <Image
          source={{ uri: activeContent.bannerUrl || activeContent.coverUrl }}
          style={styles.image}
          contentFit="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.8)', colors.background]}
          locations={[0, 0.5, 0.8, 1]}
          style={styles.gradient}
        />
      </Animated.View>

      <View style={styles.content}>
        <Animated.Text 
          key={`title-${activeIndex}`}
          entering={FadeIn.delay(200).duration(600)}
          style={styles.title} 
          numberOfLines={2}
        >
          {activeContent.title}
        </Animated.Text>
        
        {activeContent.description && (
          <Animated.Text
            key={`desc-${activeIndex}`}
            entering={FadeIn.delay(400).duration(600)}
            style={styles.description}
            numberOfLines={3}
          >
            {activeContent.description}
          </Animated.Text>
        )}
        
        <Animated.View 
          entering={FadeIn.delay(600).duration(600)}
          style={styles.buttons}
        >
          <TouchableOpacity style={styles.playButton} onPress={handleWatch}>
            <Ionicons name="play" size={24} color={colors.background} />
            <Text style={styles.playText}>Assistir</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.infoButton} onPress={handleInfo}>
            <Ionicons name="information-circle-outline" size={24} color={colors.textPrimary} />
            <Text style={styles.infoText}>Informações</Text>
          </TouchableOpacity>
        </Animated.View>

        {content.length > 1 && (
          <View style={styles.indicators}>
            {content.map((_, index) => (
              <Indicator
                key={index}
                isActive={index === activeIndex}
                index={index}
                activeIndex={activeIndex}
              />
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

function Indicator({ isActive, index, activeIndex }: { isActive: boolean; index: number; activeIndex: number }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (isActive) {
      progress.value = 0;
      progress.value = withTiming(1, {
        duration: 10000,
        easing: Easing.linear,
      });
    } else {
      progress.value = index < activeIndex ? 1 : 0;
    }
  }, [isActive, index, activeIndex]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: `${progress.value * 100}%`,
    };
  });

  return (
    <View style={styles.indicator}>
      <Animated.View style={[styles.indicatorFill, animatedStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '80%',
  },
  content: {
    position: 'absolute',
    bottom: spacing.xl,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.base,
  },
  title: {
    fontSize: typography.hero,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  description: {
    fontSize: typography.base,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
    lineHeight: typography.base * 1.4,
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  buttons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  playButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.textPrimary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.sm,
    gap: spacing.sm,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  playText: {
    fontSize: typography.lg,
    fontWeight: typography.weights.bold,
    color: colors.background,
  },
  infoButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.sm,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  infoText: {
    fontSize: typography.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.xl,
  },
  indicator: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 1,
    overflow: 'hidden',
  },
  indicatorFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 1,
  },
});
