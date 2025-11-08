import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  Modal,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabaseClient';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';

interface Category {
  id: string;
  name: string;
}

interface Series {
  id: string;
  title: string;
}

export default function AddContentScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { admin } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'movie' | 'series' | 'episode'>('movie');
  const [categoryId, setCategoryId] = useState('');
  const [keywords, setKeywords] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [year, setYear] = useState('');
  const [duration, setDuration] = useState('');
  const [rating, setRating] = useState('');
  const [inBanner, setInBanner] = useState(false);

  // Campos específicos para episódios
  const [seriesId, setSeriesId] = useState('');
  const [seasonNumber, setSeasonNumber] = useState('');
  const [episodeNumber, setEpisodeNumber] = useState('');
  const [episodeThumbnail, setEpisodeThumbnail] = useState('');

  const [categories, setCategories] = useState<Category[]>([]);
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  useEffect(() => {
    loadCategories();
    loadSeries();
  }, []);

  const loadCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('id, name')
      .order('display_order');
    
    if (data) {
      setCategories(data);
      if (data.length > 0) {
        setCategoryId(data[0].id);
      }
    }
  };

  const loadSeries = async () => {
    const { data } = await supabase
      .from('content')
      .select('id, title')
      .eq('type', 'series')
      .order('title');
    
    if (data) {
      setSeriesList(data);
      if (data.length > 0) {
        setSeriesId(data[0].id);
      }
    }
  };

  const showAlert = (title: string, message: string, onOk?: () => void) => {
    if (Platform.OS === 'web') {
      setSuccessModalVisible(true);
    } else {
      Alert.alert(title, message, onOk ? [{ text: 'OK', onPress: onOk }] : undefined);
    }
  };

  const handleSubmit = async () => {
    // Validações específicas para episódios
    if (type === 'episode') {
      if (!title.trim() || !description.trim() || !videoUrl.trim() || !episodeThumbnail.trim()) {
        setError('Preencha todos os campos obrigatórios');
        return;
      }
      if (!seriesId) {
        setError('Selecione uma série');
        return;
      }
      const season = parseInt(seasonNumber);
      const episode = parseInt(episodeNumber);
      if (isNaN(season) || season <= 0 || isNaN(episode) || episode <= 0) {
        setError('Temporada e episódio devem ser números válidos');
        return;
      }
      
      // Adicionar episódio
      const durationNum = parseInt(duration) || 0;
      
      setLoading(true);
      setError('');
      
      try {
        const { error: episodeError } = await supabase
          .from('episodes')
          .insert({
            content_id: seriesId,
            season_number: season,
            episode_number: episode,
            title: title.trim(),
            description: description.trim(),
            thumbnail_url: episodeThumbnail.trim(),
            video_url: videoUrl.trim(),
            duration: durationNum,
          });
        
        if (episodeError) throw episodeError;
        
        setLoading(false);
        showAlert(
          'Sucesso',
          'Episódio adicionado com sucesso!',
          () => router.back()
        );
        return;
      } catch (err: any) {
        setLoading(false);
        setError(err.message || 'Erro ao adicionar episódio');
        return;
      }
    }
    
    // Validações para filmes e séries
    if (!title.trim() || !description.trim() || !coverUrl.trim()) {
      setError('Preencha todos os campos obrigatórios');
      return;
    }

    if (type === 'movie' && !videoUrl.trim()) {
      setError('URL do vídeo é obrigatória para filmes');
      return;
    }

    const yearNum = parseInt(year);
    if (isNaN(yearNum) || yearNum < 1900 || yearNum > 2100) {
      setError('Ano inválido');
      return;
    }

    const durationNum = parseInt(duration);
    if (isNaN(durationNum) || durationNum <= 0) {
      setError('Duração inválida');
      return;
    }

    const ratingNum = parseFloat(rating);
    if (isNaN(ratingNum) || ratingNum < 0 || ratingNum > 10) {
      setError('Avaliação inválida (0-10)');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Inserir conteúdo
      const { data: contentData, error: contentError } = await supabase
        .from('content')
        .insert({
          title: title.trim(),
          description: description.trim(),
          type,
          category_id: categoryId,
          cover_url: coverUrl.trim(),
          banner_url: bannerUrl.trim() || null,
          video_url: type === 'movie' ? videoUrl.trim() : null,
          year: yearNum,
          duration: durationNum,
          rating: ratingNum,
          in_banner: inBanner,
          is_new: true,
        })
        .select()
        .single();

      if (contentError) throw contentError;

      // Processar palavras-chave
      if (keywords.trim() && contentData) {
        const keywordList = keywords
          .split(',')
          .map(k => k.trim())
          .filter(k => k.length > 0);

        for (const keywordName of keywordList) {
          // Buscar ou criar keyword
          let { data: existingKeyword } = await supabase
            .from('keywords')
            .select('id')
            .eq('name', keywordName)
            .single();

          let keywordId = existingKeyword?.id;

          if (!keywordId) {
            const { data: newKeyword } = await supabase
              .from('keywords')
              .insert({ name: keywordName })
              .select()
              .single();
            keywordId = newKeyword?.id;
          }

          if (keywordId) {
            await supabase
              .from('content_keywords')
              .insert({
                content_id: contentData.id,
                keyword_id: keywordId,
              });
          }
        }
      }

      setLoading(false);
      showAlert(
        'Sucesso',
        `${type === 'movie' ? 'Filme' : 'Série'} adicionado com sucesso!`,
        () => router.back()
      );
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Erro ao adicionar conteúdo');
    }
  };

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
          <Text style={styles.title}>Adicionar Conteúdo</Text>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.form}>
            {/* Tipo de Conteúdo */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tipo de Conteúdo</Text>
              <View style={styles.typeSelector}>
                <TouchableOpacity
                  style={[styles.typeButton, type === 'movie' && styles.typeButtonActive]}
                  onPress={() => setType('movie')}
                >
                  <Ionicons
                    name="film"
                    size={20}
                    color={type === 'movie' ? colors.textPrimary : colors.textSecondary}
                  />
                  <Text style={[styles.typeText, type === 'movie' && styles.typeTextActive]}>
                    Filme
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeButton, type === 'series' && styles.typeButtonActive]}
                  onPress={() => setType('series')}
                >
                  <Ionicons
                    name="tv"
                    size={20}
                    color={type === 'series' ? colors.textPrimary : colors.textSecondary}
                  />
                  <Text style={[styles.typeText, type === 'series' && styles.typeTextActive]}>
                    Série
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeButton, type === 'episode' && styles.typeButtonActive]}
                  onPress={() => setType('episode')}
                >
                  <Ionicons
                    name="play-circle"
                    size={20}
                    color={type === 'episode' ? colors.textPrimary : colors.textSecondary}
                  />
                  <Text style={[styles.typeText, type === 'episode' && styles.typeTextActive]}>
                    Episódio
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Campos específicos para EPISÓDIO */}
            {type === 'episode' && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Série *</Text>
                  {seriesList.length === 0 ? (
                    <View style={styles.infoBox}>
                      <Ionicons name="information-circle" size={20} color={colors.warning} />
                      <Text style={styles.infoText}>
                        Nenhuma série encontrada. Crie uma série primeiro antes de adicionar episódios.
                      </Text>
                    </View>
                  ) : (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <View style={styles.categorySelector}>
                        {seriesList.map((series) => (
                          <TouchableOpacity
                            key={series.id}
                            style={[
                              styles.categoryButton,
                              seriesId === series.id && styles.categoryButtonActive,
                            ]}
                            onPress={() => setSeriesId(series.id)}
                          >
                            <Text
                              style={[
                                styles.categoryText,
                                seriesId === series.id && styles.categoryTextActive,
                              ]}
                            >
                              {series.title}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </ScrollView>
                  )}
                </View>

                <View style={styles.row}>
                  <View style={[styles.inputGroup, styles.halfWidth]}>
                    <Text style={styles.label}>Temporada *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="1"
                      placeholderTextColor={colors.textSecondary}
                      value={seasonNumber}
                      onChangeText={setSeasonNumber}
                      keyboardType="numeric"
                    />
                  </View>

                  <View style={[styles.inputGroup, styles.halfWidth]}>
                    <Text style={styles.label}>Episódio *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="1"
                      placeholderTextColor={colors.textSecondary}
                      value={episodeNumber}
                      onChangeText={setEpisodeNumber}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Nome do Episódio *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ex: O Início"
                    placeholderTextColor={colors.textSecondary}
                    value={title}
                    onChangeText={setTitle}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Mini Resumo *</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Breve descrição do episódio"
                    placeholderTextColor={colors.textSecondary}
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={3}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>URL da Mini Capa *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="https://exemplo.com/thumbnail.jpg"
                    placeholderTextColor={colors.textSecondary}
                    value={episodeThumbnail}
                    onChangeText={setEpisodeThumbnail}
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Link de Streaming *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Link do Google Drive ou outro servidor"
                    placeholderTextColor={colors.textSecondary}
                    value={videoUrl}
                    onChangeText={setVideoUrl}
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Duração (minutos)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="45"
                    placeholderTextColor={colors.textSecondary}
                    value={duration}
                    onChangeText={setDuration}
                    keyboardType="numeric"
                  />
                </View>
              </>
            )}

            {/* Campos para FILME e SÉRIE */}
            {type !== 'episode' && (
              <>
                {/* Título */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Título *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Nome do filme/série"
                    placeholderTextColor={colors.textSecondary}
                    value={title}
                    onChangeText={setTitle}
                  />
                </View>

                {/* Descrição */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Descrição *</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Sinopse do conteúdo"
                    placeholderTextColor={colors.textSecondary}
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={4}
                  />
                </View>

                {/* Categoria */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Categoria *</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.categorySelector}>
                      {categories.map((cat) => (
                        <TouchableOpacity
                          key={cat.id}
                          style={[
                            styles.categoryButton,
                            categoryId === cat.id && styles.categoryButtonActive,
                          ]}
                          onPress={() => setCategoryId(cat.id)}
                        >
                          <Text
                            style={[
                              styles.categoryText,
                              categoryId === cat.id && styles.categoryTextActive,
                            ]}
                          >
                            {cat.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>

                {/* Palavras-chave */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Palavras-chave</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Separadas por vírgula: ação, suspense, etc"
                    placeholderTextColor={colors.textSecondary}
                    value={keywords}
                    onChangeText={setKeywords}
                  />
                </View>

                {/* URLs */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>URL da Capa *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="https://exemplo.com/capa.jpg"
                    placeholderTextColor={colors.textSecondary}
                    value={coverUrl}
                    onChangeText={setCoverUrl}
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>URL do Banner</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="https://exemplo.com/banner.jpg"
                    placeholderTextColor={colors.textSecondary}
                    value={bannerUrl}
                    onChangeText={setBannerUrl}
                    autoCapitalize="none"
                  />
                </View>

                {type === 'movie' && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>URL do Vídeo *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Link do Google Drive ou outro servidor"
                      placeholderTextColor={colors.textSecondary}
                      value={videoUrl}
                      onChangeText={setVideoUrl}
                      autoCapitalize="none"
                    />
                  </View>
                )}

                {/* Informações */}
                <View style={styles.row}>
                  <View style={[styles.inputGroup, styles.halfWidth]}>
                    <Text style={styles.label}>Ano *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="2024"
                      placeholderTextColor={colors.textSecondary}
                      value={year}
                      onChangeText={setYear}
                      keyboardType="numeric"
                    />
                  </View>

                  <View style={[styles.inputGroup, styles.halfWidth]}>
                    <Text style={styles.label}>Duração (min) *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="120"
                      placeholderTextColor={colors.textSecondary}
                      value={duration}
                      onChangeText={setDuration}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Avaliação (0-10) *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="8.5"
                    placeholderTextColor={colors.textSecondary}
                    value={rating}
                    onChangeText={setRating}
                    keyboardType="decimal-pad"
                  />
                </View>

                {/* Adicionar ao Banner */}
                <TouchableOpacity
                  style={styles.checkboxContainer}
                  onPress={() => setInBanner(!inBanner)}
                >
                  <View style={[styles.checkbox, inBanner && styles.checkboxActive]}>
                    {inBanner && <Ionicons name="checkmark" size={16} color={colors.textPrimary} />}
                  </View>
                  <Text style={styles.checkboxLabel}>Adicionar ao carrossel (banner)</Text>
                </TouchableOpacity>
              </>
            )}

            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={20} color={colors.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.textPrimary} />
              ) : (
                <>
                  <Ionicons name="add-circle" size={20} color={colors.textPrimary} />
                  <Text style={styles.submitButtonText}>
                    {type === 'episode' ? 'Adicionar Episódio' : 'Adicionar Conteúdo'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Modal de sucesso para Web */}
        {Platform.OS === 'web' && (
          <Modal visible={successModalVisible} transparent animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Ionicons name="checkmark-circle" size={64} color={colors.success} />
                <Text style={styles.modalTitle}>Sucesso!</Text>
                <Text style={styles.modalMessage}>
                  {type === 'movie' ? 'Filme' : type === 'series' ? 'Série' : 'Episódio'} adicionado com sucesso!
                </Text>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => {
                    setSuccessModalVisible(false);
                    router.back();
                  }}
                >
                  <Text style={styles.modalButtonText}>OK</Text>
                </TouchableOpacity>
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
  content: {
    flex: 1,
  },
  form: {
    paddingHorizontal: spacing.base,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.base,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    fontSize: typography.base,
    color: colors.textPrimary,
    minHeight: 48,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  typeSelector: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  typeButtonActive: {
    backgroundColor: colors.primary,
  },
  typeText: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    fontWeight: typography.weights.semibold,
  },
  typeTextActive: {
    color: colors.textPrimary,
  },
  categorySelector: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  categoryButton: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  categoryButtonActive: {
    backgroundColor: colors.primary,
  },
  categoryText: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    fontWeight: typography.weights.semibold,
  },
  categoryTextActive: {
    color: colors.textPrimary,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  halfWidth: {
    flex: 1,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.border,
    marginRight: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxLabel: {
    fontSize: typography.base,
    color: colors.textPrimary,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    padding: spacing.base,
    borderRadius: borderRadius.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  infoText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: typography.sm,
    marginLeft: spacing.md,
    lineHeight: typography.sm * 1.5,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  errorText: {
    flex: 1,
    color: colors.error,
    fontSize: typography.sm,
    marginLeft: spacing.sm,
  },
  submitButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    height: 56,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: colors.textPrimary,
    fontSize: typography.lg,
    fontWeight: typography.weights.bold,
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
  modalButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.sm,
  },
  modalButtonText: {
    color: colors.textPrimary,
    fontSize: typography.lg,
    fontWeight: typography.weights.bold,
  },
});
