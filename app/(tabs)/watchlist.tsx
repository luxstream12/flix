import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { MovieCard } from '../../components/ui/MovieCard';
import { useWatchlist } from '../../hooks/useWatchlist';
import { useContent } from '../../contexts/ContentContext';
import { colors, spacing, typography } from '../../constants/theme';
import { Content } from '../../types';

export default function WatchlistScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { watchlist, loading, refreshWatchlist } = useWatchlist();
  const { content } = useContent();

  useFocusEffect(
    React.useCallback(() => {
      refreshWatchlist();
    }, [])
  );

  const watchlistContent: Content[] = watchlist
    .map(id => content.find(c => c.id === id))
    .filter((item): item is Content => item !== undefined);

  const handleCardPress = (id: string) => {
    router.push({
      pathname: '/details',
      params: { id },
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Minha Lista</Text>
        <Text style={styles.subtitle}>
          {watchlistContent.length} {watchlistContent.length === 1 ? 'item' : 'itens'}
        </Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {watchlistContent.length > 0 ? (
          <FlatList
            data={watchlistContent}
            keyExtractor={(item) => item.id}
            numColumns={3}
            scrollEnabled={false}
            contentContainerStyle={styles.grid}
            renderItem={({ item }) => (
              <View style={styles.gridItem}>
                <MovieCard
                  content={item}
                  onPress={() => handleCardPress(item.id)}
                  width={110}
                  showTitle
                />
              </View>
            )}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Sua lista está vazia</Text>
            <Text style={styles.emptySubtext}>
              Adicione filmes e séries para assistir mais tarde
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.lg,
  },
  title: {
    fontSize: typography.hero,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.base,
    color: colors.textSecondary,
  },
  content: {
    flex: 1,
  },
  grid: {
    paddingHorizontal: spacing.base,
  },
  gridItem: {
    flex: 1 / 3,
    paddingRight: spacing.sm,
    marginBottom: spacing.md,
  },
  emptyState: {
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: typography.xxl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: typography.base,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
