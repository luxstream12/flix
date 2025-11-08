import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MovieCard } from '../../components/ui/MovieCard';
import { useContent } from '../../contexts/ContentContext';
import { supabase } from '../../services/supabaseClient';
import { colors, spacing, typography } from '../../constants/theme';

export default function CategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { getContentByCategory } = useContent();
  
  const [categoryName, setCategoryName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategory();
  }, [id]);

  const loadCategory = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('categories')
      .select('name')
      .eq('id', id)
      .single();
    
    if (data) {
      setCategoryName(data.name);
    }
    setLoading(false);
  };
  
  const content = getContentByCategory(id);
  
  // Shuffle content
  const shuffledContent = [...content].sort(() => Math.random() - 0.5);

  const handleCardPress = (contentId: string) => {
    router.push({
      pathname: '/details',
      params: { id: contentId },
    });
  };

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={[styles.container, { paddingTop: insets.top }, styles.centerContent]}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </>
    );
  }

  if (!categoryName) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={[styles.container, { paddingTop: insets.top }, styles.centerContent]}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.textSecondary} />
          <Text style={styles.errorText}>Categoria não encontrada</Text>
          <TouchableOpacity style={styles.backToHomeButton} onPress={() => router.back()}>
            <Text style={styles.backToHomeText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>{categoryName}</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.subtitle}>
            {shuffledContent.length} {shuffledContent.length === 1 ? 'título' : 'títulos'}
          </Text>

          {shuffledContent.length > 0 ? (
            <FlatList
              data={shuffledContent}
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
              <Text style={styles.emptyText}>Nenhum conteúdo nesta categoria</Text>
            </View>
          )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: typography.xxl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  subtitle: {
    fontSize: typography.base,
    color: colors.textSecondary,
    paddingHorizontal: spacing.base,
    marginBottom: spacing.lg,
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
  errorText: {
    fontSize: typography.lg,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  backToHomeButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: spacing.sm,
  },
  backToHomeText: {
    fontSize: typography.base,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
});
