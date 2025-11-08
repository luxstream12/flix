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

export default function EditEpisodeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [seriesTitle, setSeriesTitle] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [season, setSeason] = useState('');
  const [episode, setEpisode] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [duration, setDuration] = useState('');

  const [successModalVisible, setSuccessModalVisible] = useState(false);

  useEffect(() => {
    loadEpisode();
  }, [id]);

  const loadEpisode = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('episodes')
      .select(`
        *,
        content:content_id(title)
      `)
      .eq('id', id)
      .single();

    if (error) {
      Alert.alert('Erro', error.message);
      router.back();
      return;
    }

    if (data) {
      setSeriesTitle((data.content as any)?.title || '');
      setTitle(data.title);
      setDescription(data.description || '');
      setSeason(data.season_number.toString());
      setEpisode(data.episode_number.toString());
      setThumbnailUrl(data.thumbnail_url || '');
      setVideoUrl(data.video_url);
      setDuration(data.duration?.toString() || '');
    }

    setLoading(false);
  };

  const handleSave = async () => {
    if (!title.trim() || !season || !episode || !videoUrl.trim()) {
      Alert.alert('Erro', 'Preencha os campos obrigatórios');
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase
        .from('episodes')
        .update({
          title: title.trim(),
          description: description.trim(),
          season_number: parseInt(season),
          episode_number: parseInt(episode),
          thumbnail_url: thumbnailUrl.trim() || null,
          video_url: videoUrl.trim(),
          duration: duration ? parseInt(duration) : null,
        })
        .eq('id', id);

      if (error) throw error;

      if (Platform.OS === 'web') {
        setSuccessModalVisible(true);
        setTimeout(() => {
          setSuccessModalVisible(false);
          router.back();
        }, 1500);
      } else {
        Alert.alert('Sucesso', 'Episódio atualizado!', [
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
          <Text style={styles.title}>Editar Episódio</Text>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.form}>
            <Text style={styles.label}>Série</Text>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              value={seriesTitle}
              editable={false}
            />

            <Text style={styles.label}>Título do Episódio *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Nome do episódio"
              placeholderTextColor={colors.textSecondary}
            />

            <Text style={styles.label}>Descrição</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Resumo do episódio"
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
            />

            <View style={styles.row}>
              <View style={styles.rowItem}>
                <Text style={styles.label}>Temporada *</Text>
                <TextInput
                  style={styles.input}
                  value={season}
                  onChangeText={setSeason}
                  placeholder="1"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.rowItem}>
                <Text style={styles.label}>Episódio *</Text>
                <TextInput
                  style={styles.input}
                  value={episode}
                  onChangeText={setEpisode}
                  placeholder="1"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <Text style={styles.label}>URL da Miniatura</Text>
            <TextInput
              style={styles.input}
              value={thumbnailUrl}
              onChangeText={setThumbnailUrl}
              placeholder="https://..."
              placeholderTextColor={colors.textSecondary}
            />

            <Text style={styles.label}>URL do Vídeo *</Text>
            <TextInput
              style={styles.input}
              value={videoUrl}
              onChangeText={setVideoUrl}
              placeholder="https://drive.google.com/..."
              placeholderTextColor={colors.textSecondary}
            />

            <Text style={styles.label}>Duração (minutos)</Text>
            <TextInput
              style={styles.input}
              value={duration}
              onChangeText={setDuration}
              placeholder="45"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
            />
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
                <Text style={styles.modalTitle}>Episódio Atualizado!</Text>
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
  inputDisabled: {
    opacity: 0.6,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  rowItem: {
    flex: 1,
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
