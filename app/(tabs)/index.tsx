import React, { useState, useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, View, ActivityIndicator, Text, Modal, TouchableOpacity, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/layout/Header';
import { Banner } from '../../components/home/Banner';
import { CategoryRow } from '../../components/ui/CategoryRow';
import { useContinueWatching } from '../../hooks/useContinueWatching';
import { useContent } from '../../contexts/ContentContext';
import { supabase } from '../../services/supabaseClient';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';
import { Content } from '../../types';

interface Category {
  id: string;
  name: string;
  display_order: number;
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { continueWatching } = useContinueWatching();
  const router = useRouter();
  const { content, bannerContent, loading } = useContent();
  const [categories, setCategories] = useState<Category[]>([]);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('display_order');
    if (data) {
      setCategories(data);
    }
  };
  
  // Get continue watching content
  const continueWatchingContent: Content[] = continueWatching
    .map(progress => content.find(m => m.id === progress.contentId))
    .filter((item): item is Content => item !== undefined)
    .slice(0, 10);

  const handleProfilePress = () => {
    setShowProfileModal(true);
  };

  const handleProfileOption = (option: string) => {
    setShowProfileModal(false);
    if (option === 'profile') {
      router.push('/(tabs)/profile');
    } else if (option === 'admin') {
      router.push('/admin/login');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Carregando conteúdo...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header onProfilePress={handleProfilePress} scrollY={scrollY} />
      
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 80 }
        ]}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        {bannerContent.length > 0 && <Banner content={bannerContent} />}
        
        {continueWatchingContent.length > 0 && (
          <CategoryRow
            title="Continuar Assistindo"
            content={continueWatchingContent}
          />
        )}
        
        {categories.map((category) => {
          // Match by category ID
          const categoryContent = content.filter(c => c.categoryId === category.id);
          if (categoryContent.length === 0) return null;
          
          // Shuffle content
          const shuffled = [...categoryContent].sort(() => Math.random() - 0.5);
          
          return (
            <CategoryRow
              key={category.id}
              title={category.name}
              content={shuffled}
              onSeeAll={() => {
                router.push({
                  pathname: '/category/[id]',
                  params: { id: category.id },
                });
              }}
            />
          );
        })}
        
        {content.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhum conteúdo disponível</Text>
          </View>
        )}
        
        <View style={styles.bottomSpacer} />
      </Animated.ScrollView>

      <Modal
        visible={showProfileModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowProfileModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1}
          onPress={() => setShowProfileModal(false)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>Opções</Text>
            
            <TouchableOpacity 
              style={styles.modalOption}
              onPress={() => handleProfileOption('profile')}
            >
              <Ionicons name="person" size={24} color={colors.textPrimary} />
              <Text style={styles.modalOptionText}>Meu Perfil</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.modalOption}
              onPress={() => handleProfileOption('admin')}
            >
              <Ionicons name="shield" size={24} color={colors.textPrimary} />
              <Text style={styles.modalOptionText}>Acesso Admin</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.modalCancel}
              onPress={() => setShowProfileModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
  loadingText: {
    color: colors.textSecondary,
    fontSize: typography.base,
    marginTop: spacing.md,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 0,
  },
  emptyContainer: {
    padding: spacing.xxxl,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: typography.lg,
  },
  bottomSpacer: {
    height: spacing.xl,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: typography.xxl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.base,
    backgroundColor: colors.background,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  modalOptionText: {
    fontSize: typography.lg,
    color: colors.textPrimary,
    fontWeight: typography.weights.medium,
  },
  modalCancel: {
    padding: spacing.base,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  modalCancelText: {
    fontSize: typography.base,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
});
