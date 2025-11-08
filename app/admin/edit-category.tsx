import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Platform, Modal } from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../../services/supabaseClient';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';

export default function EditCategoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  
  const [name, setName] = useState('');
  const [displayOrder, setDisplayOrder] = useState('0');
  const [loading, setLoading] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    onOk?: () => void;
  }>({ visible: false, title: '', message: '' });

  useEffect(() => {
    if (id) {
      loadCategory();
    }
  }, [id]);

  const showAlert = (title: string, message: string, onOk?: () => void) => {
    if (Platform.OS === 'web') {
      setAlertConfig({ visible: true, title, message, onOk });
    } else {
      Alert.alert(title, message, onOk ? [{ text: 'OK', onPress: onOk }] : undefined);
    }
  };

  const loadCategory = async () => {
    if (!id) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      showAlert('Erro', error.message);
    } else if (data) {
      setName(data.name);
      setDisplayOrder(data.display_order.toString());
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      showAlert('Atenção', 'Digite o nome da categoria');
      return;
    }

    setLoading(true);
    
    const categoryData = {
      name: name.trim(),
      display_order: parseInt(displayOrder) || 0,
    };

    let error;
    if (id) {
      // Update existing category
      const result = await supabase
        .from('categories')
        .update(categoryData)
        .eq('id', id);
      error = result.error;
    } else {
      // Create new category
      const result = await supabase
        .from('categories')
        .insert(categoryData);
      error = result.error;
    }

    setLoading(false);

    if (error) {
      showAlert('Erro', error.message);
    } else {
      showAlert(
        'Sucesso',
        id ? 'Categoria atualizada com sucesso' : 'Categoria criada com sucesso',
        () => router.back()
      );
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    const confirmDelete = () => {
      performDelete();
    };

    if (Platform.OS === 'web') {
      setAlertConfig({
        visible: true,
        title: 'Confirmar',
        message: 'Tem certeza que deseja excluir esta categoria?',
        onOk: confirmDelete,
      });
    } else {
      Alert.alert(
        'Confirmar',
        'Tem certeza que deseja excluir esta categoria?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Excluir', style: 'destructive', onPress: confirmDelete },
        ]
      );
    }
  };

  const performDelete = async () => {
    setLoading(true);
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    setLoading(false);

    if (error) {
      showAlert('Erro', error.message);
    } else {
      showAlert('Sucesso', 'Categoria excluída com sucesso', () => router.back());
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>{id ? 'Editar Categoria' : 'Nova Categoria'}</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            <Text style={styles.label}>Nome da Categoria</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Ex: Ação, Comédia, Drama..."
              placeholderTextColor={colors.textSecondary}
            />

            <Text style={styles.label}>Ordem de Exibição</Text>
            <TextInput
              style={styles.input}
              value={displayOrder}
              onChangeText={setDisplayOrder}
              placeholder="0"
              placeholderTextColor={colors.textSecondary}
              keyboardType="number-pad"
            />

            <TouchableOpacity
              style={[styles.saveButton, loading && styles.disabledButton]}
              onPress={handleSave}
              disabled={loading}
            >
              <Text style={styles.saveButtonText}>
                {loading ? 'Salvando...' : 'Salvar Categoria'}
              </Text>
            </TouchableOpacity>

            {id && (
              <TouchableOpacity
                style={[styles.deleteButton, loading && styles.disabledButton]}
                onPress={handleDelete}
                disabled={loading}
              >
                <Ionicons name="trash" size={20} color={colors.textPrimary} />
                <Text style={styles.deleteButtonText}>Excluir Categoria</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>

        {Platform.OS === 'web' && (
          <Modal visible={alertConfig.visible} transparent animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>{alertConfig.title}</Text>
                <Text style={styles.modalMessage}>{alertConfig.message}</Text>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => {
                    alertConfig.onOk?.();
                    setAlertConfig(prev => ({ ...prev, visible: false }));
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
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  form: {
    padding: spacing.base,
  },
  label: {
    fontSize: typography.base,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    marginTop: spacing.base,
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
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.base,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  saveButtonText: {
    fontSize: typography.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  deleteButton: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    paddingVertical: spacing.base,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.danger,
    gap: spacing.sm,
  },
  deleteButtonText: {
    fontSize: typography.lg,
    fontWeight: typography.weights.bold,
    color: colors.danger,
  },
  disabledButton: {
    opacity: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.surface,
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    minWidth: 280,
    maxWidth: '90%',
  },
  modalTitle: {
    fontSize: typography.xl,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.md,
    color: colors.textPrimary,
  },
  modalMessage: {
    fontSize: typography.base,
    marginBottom: spacing.xl,
    color: colors.textSecondary,
  },
  modalButton: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
  },
  modalButtonText: {
    color: colors.textPrimary,
    fontWeight: typography.weights.bold,
    fontSize: typography.base,
  },
});
