import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { MovieCard } from './MovieCard';
import { Content } from '../../types';
import { colors, spacing, typography } from '../../constants/theme';

interface CategoryRowProps {
  title: string;
  content: Content[];
  onSeeAll?: () => void;
}

export function CategoryRow({ title, content, onSeeAll }: CategoryRowProps) {
  const router = useRouter();

  const handleCardPress = (item: Content) => {
    router.push({
      pathname: '/details',
      params: { id: item.id },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {onSeeAll && (
          <TouchableOpacity style={styles.seeAllButton} onPress={onSeeAll}>
            <Text style={styles.seeAllText}>VER TUDO</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {content.map((item) => (
          <MovieCard
            key={item.id}
            content={item}
            onPress={() => handleCardPress(item)}
            width={130}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.base,
  },
  title: {
    fontSize: typography.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: typography.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
    marginRight: spacing.xs,
  },
  scrollContent: {
    paddingHorizontal: spacing.base,
  },
});
