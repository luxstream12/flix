import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MovieCard } from '../../components/ui/MovieCard';
import { useRouter } from 'expo-router';
import { useContent } from '../../contexts/ContentContext';
import * as StorageService from '../../services/storage';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';
import { Content } from '../../types';

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { searchContent } = useContent();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Content[]>([]);
  const [searchHistory, setSearchHistory] = useState<Content[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    loadSearchHistory();
  }, []);

  const loadSearchHistory = async () => {
    const historyIds = await StorageService.getSearchHistory();
    const { content: allContent } = useContent();
    const historyContent = historyIds
      .map(id => allContent.find(c => c.id === id))
      .filter((item): item is Content => item !== undefined)
      .slice(0, 6);
    setSearchHistory(historyContent);
  };

  const handleSearch = async (text: string) => {
    setQuery(text);
    if (text.trim()) {
      setIsSearching(true);
      const searchResults = await searchContent(text);
      setResults(searchResults);
    } else {
      setIsSearching(false);
      setResults([]);
    }
  };

  const handleCardPress = async (item: Content) => {
    await StorageService.addToSearchHistory(item.id);
    await loadSearchHistory();
    router.push({
      pathname: '/details',
      params: { id: item.id },
    });
  };

  const popularSearches = ['Ação', 'Comédia', 'Drama', 'Terror', 'Animação'];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.input}
            placeholder="Buscar filmes e séries..."
            placeholderTextColor={colors.textSecondary}
            value={query}
            onChangeText={handleSearch}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {!isSearching ? (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Buscas Populares</Text>
              <View style={styles.tagsContainer}>
                {popularSearches.map((tag) => (
                  <TouchableOpacity
                    key={tag}
                    style={styles.tag}
                    onPress={() => handleSearch(tag)}
                  >
                    <Text style={styles.tagText}>{tag}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {searchHistory.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Pesquisas Recentes</Text>
                <FlatList
                  data={searchHistory}
                  keyExtractor={(item) => item.id}
                  numColumns={3}
                  scrollEnabled={false}
                  renderItem={({ item }) => (
                    <View style={styles.gridItem}>
                      <MovieCard
                        content={item}
                        onPress={() => handleCardPress(item)}
                        width={110}
                        showTitle
                      />
                    </View>
                  )}
                />
              </View>
            )}
          </>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {results.length} resultado{results.length !== 1 ? 's' : ''}
            </Text>
            {results.length > 0 ? (
              <FlatList
                data={results}
                keyExtractor={(item) => item.id}
                numColumns={3}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <View style={styles.gridItem}>
                    <MovieCard
                      content={item}
                      onPress={() => handleCardPress(item)}
                      width={110}
                      showTitle
                    />
                  </View>
                )}
              />
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>Nenhum resultado encontrado</Text>
              </View>
            )}
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
    paddingVertical: spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: typography.base,
    color: colors.textPrimary,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: spacing.base,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tag: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  tagText: {
    fontSize: typography.base,
    color: colors.textPrimary,
    fontWeight: typography.weights.medium,
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
