import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  Modal,
  TextInput,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabaseClient';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';

interface Content {
  id: string;
  title: string;
  type: 'movie' | 'series';
  cover_url: string;
  year: number;
  rating: number;
}

interface Episode {
  id: string;
  title: string;
  season_number: number;
  episode_number: number;
  thumbnail_url: string;
  content_id: string;
  series_title?: string;
}

export default function ManageContentScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { admin } = useAuth();

  const [contentList, setContentList] = useState<Content[]>([]);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'movies' | 'series' | 'episodes'>('movies');
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadContent();
  }, [selectedTab]);

  const loadContent = async () => {
    setLoading(true);
    
    if (selectedTab === 'episodes') {
      // Carregar episódios com nome da série
      const { data } = await supabase
        .from('episodes')
        .select(`
          *,
          content:content_id (
            title
          )
        `)
        .order('season_number')
        .order('episode_number');
      
      if (data) {
        const episodesWithSeries = data.map(ep => ({
          ...ep,
          series_title: (ep.content as any)?.title || 'Série desconhecida',
        }));
        setEpisodes(episodesWithSeries);
      }
    } else {
      const { data } = await supabase
        .from('content')
        .select('id, title, type, cover_url, year, rating')
        .eq('type', selectedTab === 'movies' ? 'movie' : 'series')
        .order('title');
      
      if (data) {
        setContentList(data);
      }
    }
    
    setLoading(false);
  };

  const handleEdit = (item: Content | Episode) => {
    if (selectedTab === 'episodes') {
      router.push({
        pathname: '/admin/edit-episode',
        params: { id: item.id },
      });
    } else {
      router.push({
        pathname: '/admin/edit-content',
        params: { id: item.id },
      });
    }
  };

  const handleDelete = (item: Content | Episode) => {
    setItemToDelete(item);
    if (Platform.OS === 'web') {
      setDeleteModalVisible(true);
    } else {
      Alert.alert(
        'Confirmar Exclusão',
        `Tem certeza que deseja deletar "${item.title}"?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Deletar', onPress: () => confirmDelete(item), style: 'destructive' },
        ]
      );
    }
  };

  const confirmDelete = async (item: Content | Episode) => {
    const table = selectedTab === 'episodes' ? 'episodes' : 'content';
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', item.id);

    if (error) {
      Alert.alert('Erro', error.message);
      return;
    }

    setDeleteModalVisible(false);
    setItemToDelete(null);
    loadContent();
  };

  const filteredContent = selectedTab === 'episodes'
    ? episodes.filter(ep =>
        ep.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ep.series_title?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : contentList.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      );

  if (!admin) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={[styles.container, { paddingTop: insets.top }]}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.title}>Acesso Negado</Text>
          </View>
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
          <Text style={styles.title}>Gerenciar Conteúdo</Text>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'movies' && styles.tabActive]}
            onPress={() => setSelectedTab('movies')}
          >
            <Ionicons
              name="film"
              size={20}
              color={selectedTab === 'movies' ? colors.textPrimary : colors.textSecondary}
            />
            <Text style={[styles.tabText, selectedTab === 'movies' && styles.tabTextActive]}>
              Filmes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'series' && styles.tabActive]}
            onPress={() => setSelectedTab('series')}
          >
            <Ionicons
              name="tv"
              size={20}
              color={selectedTab === 'series' ? colors.textPrimary : colors.textSecondary}
            />
            <Text style={[styles.tabText, selectedTab === 'series' && styles.tabTextActive]}>
              Séries
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'episodes' && styles.tabActive]}
            onPress={() => setSelectedTab('episodes')}
          >
            <Ionicons
              name="play-circle"
              size={20}
              color={selectedTab === 'episodes' ? colors.textPrimary : colors.textSecondary}
            />
            <Text style={[styles.tabText, selectedTab === 'episodes' && styles.tabTextActive]}>
              Episódios
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <ScrollView
            style={styles.content}
            contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
            showsVerticalScrollIndicator={false}
          >
            {selectedTab === 'episodes' ? (
              episodes.filter(ep =>
                ep.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                ep.series_title?.toLowerCase().includes(searchQuery.toLowerCase())
              ).length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="play-circle-outline" size={64} color={colors.textSecondary} />
                  <Text style={styles.emptyText}>Nenhum episódio encontrado</Text>
                </View>
              ) : (
                filteredContent.map((ep: any) => (
                  <View key={ep.id} style={styles.contentCard}>
                    <Image
                      source={{ uri: ep.thumbnail_url }}
                      style={styles.episodeThumbnail}
                      contentFit="cover"
                    />
                    <View style={styles.contentInfo}>
                      <Text style={styles.contentTitle}>{ep.title}</Text>
                      <Text style={styles.contentSubtitle}>
                        {ep.series_title} - T{ep.season_number}E{ep.episode_number}
                      </Text>
                    </View>
                    <View style={styles.actions}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleEdit(ep)}
                      >
                        <Ionicons name="pencil" size={20} color={colors.info} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleDelete(ep)}
                      >
                        <Ionicons name="trash" size={20} color={colors.error} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )
            ) : (
              filteredContent.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons
                    name={selectedTab === 'movies' ? 'film-outline' : 'tv-outline'}
                    size={64}
                    color={colors.textSecondary}
                  />
                  <Text style={styles.emptyText}>
                    Nenhum {selectedTab === 'movies' ? 'filme' : 'série'} encontrado
                  </Text>
                </View>
              ) : (
                filteredContent.map((item: any) => (
                  <View key={item.id} style={styles.contentCard}>
                    <Image
                      source={{ uri: item.cover_url }}
                      style={styles.contentCover}
                      contentFit="cover"
                    />
                    <View style={styles.contentInfo}>
                      <Text style={styles.contentTitle}>{item.title}</Text>
                      <Text style={styles.contentSubtitle}>
                        {item.year} • ⭐ {item.rating}
                      </Text>
                    </View>
                    <View style={styles.actions}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleEdit(item)}
                      >
                        <Ionicons name="pencil" size={20} color={colors.info} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleDelete(item)}
                      >
                        <Ionicons name="trash" size={20} color={colors.error} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )
            )}
          </ScrollView>
        )}

        {/* Modal de confirmação de deleção para Web */}
        {Platform.OS === 'web' && itemToDelete && (
          <Modal visible={deleteModalVisible} transparent animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Ionicons name="warning" size={64} color={colors.warning} />
                <Text style={styles.modalTitle}>Confirmar Exclusão</Text>
                <Text style={styles.modalMessage}>
                  Tem certeza que deseja deletar "{itemToDelete.title}"?
                </Text>
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalButtonCancel]}
                    onPress={() => {
                      setDeleteModalVisible(false);
                      setItemToDelete(null);
                    }}
                  >
                    <Text style={styles.modalButtonTextCancel}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalButtonConfirm]}
                    onPress={() => confirmDelete(itemToDelete)}
                  >
                    <Text style={styles.modalButtonText}>Deletar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.lg,
  },
  backButton: {
    marginRight: spacing.base,
  },
  title: {
    fontSize: typography.xxl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.base,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    fontWeight: typography.weights.semibold,
  },
  tabTextActive: {
    color: colors.textPrimary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.base,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.base,
    borderRadius: borderRadius.md,
    height: 48,
  },
  searchInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: typography.base,
    marginLeft: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.base,
  },
  contentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  contentCover: {
    width: 60,
    height: 90,
    borderRadius: borderRadius.sm,
    marginRight: spacing.md,
  },
  episodeThumbnail: {
    width: 100,
    height: 60,
    borderRadius: borderRadius.sm,
    marginRight: spacing.md,
  },
  contentInfo: {
    flex: 1,
  },
  contentTitle: {
    fontSize: typography.base,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  contentSubtitle: {
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyText: {
    fontSize: typography.lg,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.surface,
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    minWidth: 300,
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: typography.xxl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  modalMessage: {
    fontSize: typography.base,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  modalButton: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalButtonConfirm: {
    backgroundColor: colors.error,
  },
  modalButtonText: {
    color: colors.textPrimary,
    fontSize: typography.base,
    fontWeight: typography.weights.bold,
  },
  modalButtonTextCancel: {
    color: colors.textSecondary,
    fontSize: typography.base,
    fontWeight: typography.weights.bold,
  },
});
