import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MovieCard } from '../components/ui/MovieCard';
import { useWatchlist } from '../hooks/useWatchlist';
import { useContent } from '../contexts/ContentContext';
import { colors, spacing, typography, borderRadius } from '../constants/theme';
import { Content } from '../types';

export default function DetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const { getContentById, content: allContent } = useContent();

  const [similar, setSimilar] = useState<Content[]>([]);
  const content = getContentById(id);

  useEffect(() => {
    if (content) {
      // Find similar content based on keywords and category
      const similarContent = allContent
        .filter(item => {
          if (item.id === content.id) return false;
          
          // Match by category or keywords
          const sameCategory = item.categoryId === content.categoryId;
          const sharedKeywords = content.keywords.some(k => item.keywords.includes(k));
          
          return sameCategory || sharedKeywords;
        })
        .slice(0, 9);
      
      setSimilar(similarContent);
    }
  }, [content, allContent]);

  if (!content) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={[styles.container, styles.centerContent]}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.textSecondary} />
          <Text style={styles.errorText}>Conteúdo não encontrado</Text>
          <TouchableOpacity style={styles.backToHomeButton} onPress={() => router.back()}>
            <Text style={styles.backToHomeText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  }

  const inList = isInWatchlist(content.id);

  const handleWatch = () => {
    if (!content.videoUrl) {
      alert('Link de vídeo não disponível');
      return;
    }
    
    router.push({
      pathname: '/player',
      params: { 
        id: content.id,
        url: content.videoUrl,
      },
    });
  };

  const handleSimilarPress = (itemId: string) => {
    router.push({
      pathname: '/details',
      params: { id: itemId },
    });
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.bannerContainer}>
            <Image
              source={{ uri: content.bannerUrl || content.coverUrl }}
              style={styles.banner}
              contentFit="cover"
            />
            <LinearGradient
              colors={['transparent', colors.background]}
              style={styles.gradient}
            />
            
            <TouchableOpacity
              style={[styles.backButton, { top: insets.top + 10 }]}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text style={styles.title}>{content.title}</Text>
            
            <View style={styles.meta}>
              {content.year && (
                <>
                  <Text style={styles.metaText}>{content.year}</Text>
                  <View style={styles.dot} />
                </>
              )}
              {content.type === 'movie' && content.duration && (
                <>
                  <Text style={styles.metaText}>{content.duration} min</Text>
                  <View style={styles.dot} />
                </>
              )}
              {content.rating && (
                <View style={styles.rating}>
                  <Ionicons name="star" size={16} color={colors.warning} />
                  <Text style={styles.ratingText}>{content.rating.toFixed(1)}</Text>
                </View>
              )}
            </View>

            <View style={styles.buttons}>
              <TouchableOpacity style={styles.playButton} onPress={handleWatch}>
                <Ionicons name="play" size={24} color={colors.background} />
                <Text style={styles.playButtonText}>Assistir</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.listButton, inList && styles.listButtonActive]}
                onPress={() => toggleWatchlist(content.id)}
              >
                <Ionicons
                  name={inList ? 'checkmark' : 'add'}
                  size={24}
                  color={colors.textPrimary}
                />
                <Text style={styles.listButtonText}>Minha Lista</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>SINOPSE</Text>
              <Text style={styles.description}>{content.description}</Text>
            </View>

            {content.keywords.length > 0 && (
              <View style={styles.keywords}>
                {content.keywords.map((keyword, index) => (
                  <View key={index} style={styles.keyword}>
                    <Text style={styles.keywordText}>{keyword}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.divider} />

            {similar.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Títulos Semelhantes</Text>
                <View style={styles.similarGrid}>
                  {similar.map((item) => (
                    <View key={item.id} style={styles.similarItem}>
                      <MovieCard
                        content={item}
                        onPress={() => handleSimilarPress(item.id)}
                        width={110}
                        showTitle
                      />
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.lg,
  },
  scrollView: {
    flex: 1,
  },
  bannerContainer: {
    width: '100%',
    height: 400,
    position: 'relative',
  },
  banner: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
  },
  backButton: {
    position: 'absolute',
    left: spacing.base,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: spacing.base,
  },
  title: {
    fontSize: typography.hero,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  metaText: {
    fontSize: typography.base,
    color: colors.textSecondary,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.textSecondary,
    marginHorizontal: spacing.sm,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  ratingText: {
    fontSize: typography.base,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  buttons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
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
  },
  playButtonText: {
    fontSize: typography.lg,
    fontWeight: typography.weights.bold,
    color: colors.background,
  },
  listButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.sm,
    gap: spacing.sm,
  },
  listButtonActive: {
    backgroundColor: colors.primary,
  },
  listButtonText: {
    fontSize: typography.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.base,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    letterSpacing: 1,
  },
  description: {
    fontSize: typography.base,
    color: colors.textSecondary,
    lineHeight: typography.base * 1.5,
  },
  keywords: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  keyword: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  keywordText: {
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: spacing.xl,
  },
  similarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
  },
  similarItem: {
    width: '33.333%',
    paddingHorizontal: spacing.xs,
    marginBottom: spacing.md,
  },
  errorText: {
    fontSize: typography.lg,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  backToHomeButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.sm,
  },
  backToHomeText: {
    fontSize: typography.base,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
});
