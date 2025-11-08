import React from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MovieCard } from '../../components/ui/MovieCard';
import { useContent } from '../../contexts/ContentContext';
import { colors, spacing, typography } from '../../constants/theme';

export default function NewScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { newContent } = useContent();

  const handleCardPress = (id: string) => {
    router.push({
      pathname: '/details',
      params: { id },
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Novidades</Text>
        <Text style={styles.subtitle}>
          Últimos {newContent.length} conteúdos adicionados
        </Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        <FlatList
          data={newContent}
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

        {newContent.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Nenhum conteúdo novo nos últimos 2 dias</Text>
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
    alignItems: 'center',
  },
  emptyText: {
    fontSize: typography.lg,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
