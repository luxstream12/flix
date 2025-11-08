import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  Modal,
} from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../../services/supabaseClient';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';

interface Category {
  id: string;
  name: string;
}

export default function EditContentScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'movie' | 'series'>('movie');
  const [categoryId, setCategoryId] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [year, setYear] = useState('');
  const [duration, setDuration] = useState('');
  const [rating, setRating] = useState('');
  const [inBanner, setInBanner] = useState(false);
  const [keywords, setKeywords] = useState('');

  const [successModalVisible, setSuccessModalVisible] = useState(false);

  useEffect(() => {
    loadCategories();
    loadContent();
  }, [id]);

  const loadCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    if (data) setCategories(data);
  };

  const loadContent = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('content')
      .select(`
        *,
        keywords:content_keywords(keyword:keywords(name))
      `)
      .eq('id', id)
      .single();

    if (error) {
      Alert.alert('Erro', error.message);
      router.back();
      return;
    }

    if (data) {
      setTitle(data.title);
      setDescription(data.description || '');
      setType(data.type);
      setCategoryId(data.category_id);
      setCoverUrl(data.cover_url);
      setBannerUrl(data.banner_url || '');
      setVideoUrl(data.video_url || '');
      setYear(data.year?.toString() || '');
      setDuration(data.duration?.toString() || '');
      setRating(data.rating?.toString() || '');
      setInBanner(data.in_banner);
      
      const keywordNames = data.keywords?.map((k: any) => k.keyword.name).join(', ') || '';
      setKeywords(keywordNames);
    }

    setLoading(false);
  };

  const handleSave = async () => {
    if (!title.trim() || !categoryId || !coverUrl.trim()) {
      Alert.alert('Erro', 'Preencha os campos obrigatórios: título, categoria e capa');
      return;
    }

    setSaving(true);

    try {
      // Atualizar conteúdo
      const { error } = await supabase
        .from('content')
        .update({
          title: title.trim(),
          description: description.trim(),
          category_id: categoryId,
          cover_url: coverUrl.trim(),
          banner_url: bannerUrl.trim() || null,
          video_url: videoUrl.trim() || null,
          year: year ? parseInt(year) : null,
          duration: duration ? parseInt(duration) : null,
          rating: rating ? parseFloat(rating) : null,
          in_banner: inBanner,
        })
        .eq('id', id);

      if (error) throw error;

      // Atualizar palavras-chave
      if (keywords.trim()) {
        // Remover associações antigas
        await supabase
          .from('content_keywords')
          .delete()
          .eq('content_id', id);

        // Adicionar novas
        const keywordList = keywords.split(',').map(k => k.trim()).filter(k => k);
        
        for (const keyword of keywordList) {
          // Criar keyword se não existir
          const { data: existingKeyword } = await supabase
            .from('keywords')
            .select('id')
            .eq('name', keyword)
            .single();

          let keywordId = existingKeyword?.id;

          if (!keywordId) {
            const { data: newKeyword } = await supabase
              .from('keywords')
              .insert({ name: keyword })
              .select('id')
              .single();
            keywordId = newKeyword?.id;
          }

          if (keywordId) {
            await supabase
              .from('content_keywords')
              .insert({ content_id: id, keyword_id: keywordId });
          }
        }
      }

      if (Platform.OS === 'web') {
        setSuccessModalVisible(true);
        setTimeout(() => {
          setSuccessModalVisible(false);
          router.back();
        }, 1500);
      } else {
        Alert.alert('Sucesso', 'Conteúdo atualizado!', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      }
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={[styles.container, { paddingTop: insets.top }, styles.loadingContainer]}>
          <ActivityIndicator size="large" color={colors.primary} />
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
          <Text style={styles.title}>Editar {type === 'movie' ? 'Filme' : 'Série'}</Text>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.form}>
            <Text style={styles.label}>Título *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Nome do conteúdo"
              placeholderTextColor={colors.textSecondary}
            />

            <Text style={styles.label}>Descrição</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Sinopse do conteúdo"
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
            />

            <Text style={styles.label}>Categoria *</Text>
            <View style={styles.pickerContainer}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.pickerItem, categoryId === cat.id && styles.pickerItemActive]}
                  onPress={() => setCategoryId(cat.id)}
                >
                  <Text style={[styles.pickerText, categoryId === cat.id && styles.pickerTextActive]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>URL da Capa *</Text>
            <TextInput
              style={styles.input}
              value={coverUrl}
              onChangeText={setCoverUrl}
              placeholder="https://..."
              placeholderTextColor={colors.textSecondary}
            />

            <Text style={styles.label}>URL do Banner</Text>
            <TextInput
              style={styles.input}
              value={bannerUrl}
              onChangeText={setBannerUrl}
              placeholder="https://..."
              placeholderTextColor={colors.textSecondary}
            />

            <Text style={styles.label}>URL do Vídeo</Text>
            <TextInput
              style={styles.input}
              value={videoUrl}
              onChangeText={setVideoUrl}
              placeholder="https://drive.google.com/..."
              placeholderTextColor={colors.textSecondary}
            />

            <Text style={styles.label}>Ano</Text>
            <TextInput
              style={styles.input}
              value={year}
              onChangeText={setYear}
              placeholder="2024"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
            />

            <Text style={styles.label}>Duração (minutos)</Text>
            <TextInput
              style={styles.input}
              value={duration}
              onChangeText={setDuration}
              placeholder="120"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
            />

            <Text style={styles.label}>Avaliação (0-10)</Text>
            <TextInput
              style={styles.input}
              value={rating}
              onChangeText={setRating}
              placeholder="8.5"
              placeholderTextColor={colors.textSecondary}
              keyboardType="decimal-pad"
            />

            <Text style={styles.label}>Palavras-chave (separadas por vírgula)</Text>
            <TextInput
              style={styles.input}
              value={keywords}
              onChangeText={setKeywords}
              placeholder="ação, aventura, heróis"
              placeholderTextColor={colors.textSecondary}
            />

            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setInBanner(!inBanner)}
            >
              <Ionicons
                name={inBanner ? 'checkbox' : 'square-outline'}
                size={24}
                color={inBanner ? colors.primary : colors.textSecondary}
              />
              <Text style={styles.checkboxLabel}>Adicionar ao Banner</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color={colors.textPrimary} />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={24} color={colors.textPrimary} />
                <Text style={styles.saveButtonText}>Salvar Alterações</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>

        {/* Modal de sucesso para Web */}
        {Platform.OS === 'web' && (
          <Modal visible={successModalVisible} transparent animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Ionicons name="checkmark-circle" size={64} color={colors.success} />
                <Text style={styles.modalTitle}>Conteúdo Atualizado!</Text>
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
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
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
  content: {
    flex: 1,
  },
  form: {
    paddingHorizontal: spacing.base,
  },
  label: {
    fontSize: typography.base,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    fontSize: typography.base,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  pickerItem: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pickerItemActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pickerText: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  pickerTextActive: {
    color: colors.textPrimary,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  checkboxLabel: {
    fontSize: typography.base,
    color: colors.textPrimary,
    marginLeft: spacing.sm,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    marginHorizontal: spacing.base,
    marginVertical: spacing.xl,
    paddingVertical: spacing.base,
    borderRadius: borderRadius.sm,
    gap: spacing.sm,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: typography.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.surface,
    padding: spacing.xxxl,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    minWidth: 280,
  },
  modalTitle: {
    fontSize: typography.xxl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginTop: spacing.lg,
  },
});
