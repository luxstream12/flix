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

interface Keyword {
  id: string;
  name: string;
  created_at: string;
}

export default function KeywordsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { admin } = useAuth();

  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [newKeywordName, setNewKeywordName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [keywordToDelete, setKeywordToDelete] = useState<Keyword | null>(null);

  useEffect(() => {
    loadKeywords();
  }, []);

  const loadKeywords = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('keywords')
      .select('*')
      .order('name');
    
    if (data) {
      setKeywords(data);
    }
    setLoading(false);
  };

  const showAlert = (title: string, message: string, onOk?: () => void) => {
    if (Platform.OS === 'web') {
      setSuccessModalVisible(true);
    } else {
      Alert.alert(title, message, onOk ? [{ text: 'OK', onPress: onOk }] : undefined);
    }
  };

  const handleAddKeyword = async () => {
    if (!newKeywordName.trim()) {
      setError('Digite um nome para a palavra-chave');
      return;
    }

    setLoading(true);
    setError('');

    const { error: insertError } = await supabase.from('keywords').insert({
      name: newKeywordName.trim(),
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    setNewKeywordName('');
    showAlert('Sucesso', 'Palavra-chave criada com sucesso!');
    loadKeywords();
  };

  const handleDeleteKeyword = (keyword: Keyword) => {
    setKeywordToDelete(keyword);
    if (Platform.OS === 'web') {
      setDeleteModalVisible(true);
    } else {
      Alert.alert(
        'Confirmar Exclusão',
        `Tem certeza que deseja deletar a palavra-chave "${keyword.name}"?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Deletar', onPress: () => confirmDelete(keyword.id), style: 'destructive' },
        ]
      );
    }
  };

  const confirmDelete = async (keywordId: string) => {
    const { error: deleteError } = await supabase
      .from('keywords')
      .delete()
      .eq('id', keywordId);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setDeleteModalVisible(false);
    setKeywordToDelete(null);
    loadKeywords();
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
          <Text style={styles.title}>Gerenciar Palavras-chave</Text>
        </View>

        <View style={styles.addSection}>
          <View style={styles.inputContainer}>
            <Ionicons name="pricetag-outline" size={20} color={colors.textSecondary} />
            <TextInput
              style={styles.input}
              placeholder="Nome da nova palavra-chave"
              placeholderTextColor={colors.textSecondary}
              value={newKeywordName}
              onChangeText={setNewKeywordName}
            />
          </View>
          <TouchableOpacity
            style={[styles.addButton, loading && styles.addButtonDisabled]}
            onPress={handleAddKeyword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.textPrimary} />
            ) : (
              <Ionicons name="add" size={24} color={colors.textPrimary} />
            )}
          </TouchableOpacity>
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={20} color={colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <ScrollView
          style={styles.content}
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.keywordsGrid}>
            {keywords.map((keyword) => (
              <View key={keyword.id} style={styles.keywordChip}>
                <Text style={styles.keywordName}>{keyword.name}</Text>
                <TouchableOpacity
                  style={styles.deleteChipButton}
                  onPress={() => handleDeleteKeyword(keyword)}
                >
                  <Ionicons name="close" size={16} color={colors.error} />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {keywords.length === 0 && !loading && (
            <View style={styles.emptyContainer}>
              <Ionicons name="pricetags-outline" size={64} color={colors.textSecondary} />
              <Text style={styles.emptyText}>Nenhuma palavra-chave criada ainda</Text>
            </View>
          )}
        </ScrollView>

        {/* Modal de sucesso para Web */}
        {Platform.OS === 'web' && (
          <Modal visible={successModalVisible} transparent animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Ionicons name="checkmark-circle" size={64} color={colors.success} />
                <Text style={styles.modalTitle}>Sucesso!</Text>
                <Text style={styles.modalMessage}>Palavra-chave criada com sucesso!</Text>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => setSuccessModalVisible(false)}
                >
                  <Text style={styles.modalButtonText}>OK</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}

        {/* Modal de confirmação de deleção para Web */}
        {Platform.OS === 'web' && keywordToDelete && (
          <Modal visible={deleteModalVisible} transparent animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Ionicons name="warning" size={64} color={colors.warning} />
                <Text style={styles.modalTitle}>Confirmar Exclusão</Text>
                <Text style={styles.modalMessage}>
                  Tem certeza que deseja deletar a palavra-chave "{keywordToDelete.name}"?
                </Text>
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalButtonCancel]}
                    onPress={() => {
                      setDeleteModalVisible(false);
                      setKeywordToDelete(null);
                    }}
                  >
                    <Text style={styles.modalButtonTextCancel}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalButtonConfirm]}
                    onPress={() => confirmDelete(keywordToDelete.id)}
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
  addSection: {
    flexDirection: 'row',
    paddingHorizontal: spacing.base,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.base,
    height: 56,
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: typography.base,
    marginLeft: spacing.md,
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonDisabled: {
    opacity: 0.6,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.sm,
    marginHorizontal: spacing.base,
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
  content: {
    flex: 1,
    paddingHorizontal: spacing.base,
  },
  keywordsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  keywordChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingLeft: spacing.base,
    paddingRight: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  keywordName: {
    fontSize: typography.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  deleteChipButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
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
