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
} from 'react-native';
import { useRouter, Stack, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { authService, AdminUser } from '../../services/authService';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';

export default function ListAdminsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { admin } = useAuth();

  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState<AdminUser | null>(null);

  useEffect(() => {
    loadAdmins();
  }, []);

  // Recarregar quando a tela ganhar foco
  useFocusEffect(
    React.useCallback(() => {
      loadAdmins();
    }, [])
  );

  const loadAdmins = async () => {
    setLoading(true);
    const { data } = await authService.listAdmins();
    if (data) {
      setAdmins(data);
    }
    setLoading(false);
  };

  const showAlert = (title: string, message: string, onConfirm?: () => void) => {
    if (Platform.OS === 'web') {
      // Para web, usar modal customizado
      if (onConfirm) {
        setDeleteModalVisible(true);
      }
    } else {
      if (onConfirm) {
        Alert.alert(title, message, [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Deletar', onPress: onConfirm, style: 'destructive' },
        ]);
      } else {
        Alert.alert(title, message);
      }
    }
  };

  const handleDeleteAdmin = (adminToDelete: AdminUser) => {
    if (adminToDelete.isPrimary) {
      showAlert('Erro', 'Não é possível deletar o administrador principal');
      return;
    }

    setAdminToDelete(adminToDelete);
    showAlert(
      'Confirmar Exclusão',
      `Tem certeza que deseja remover o administrador ${adminToDelete.username}?`,
      () => confirmDelete(adminToDelete.id)
    );
  };

  const confirmDelete = async (adminId: string) => {
    const { error } = await authService.deleteAdmin(adminId);

    if (error) {
      showAlert('Erro', error);
      return;
    }

    setDeleteModalVisible(false);
    setAdminToDelete(null);
    loadAdmins();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (!admin?.isPrimary) {
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
          <View style={styles.emptyContainer}>
            <Ionicons name="lock-closed" size={64} color={colors.error} />
            <Text style={styles.emptyText}>
              Apenas o administrador principal pode visualizar a lista de admins
            </Text>
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
          <Text style={styles.title}>Administradores</Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : admins.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyText}>Nenhum administrador encontrado</Text>
          </View>
        ) : (
          <ScrollView
            style={styles.content}
            contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
            showsVerticalScrollIndicator={false}
          >
            {admins.map((item) => (
              <View key={item.id} style={styles.adminCard}>
                <View style={styles.adminInfo}>
                  <View style={styles.adminIconContainer}>
                    <Ionicons
                      name={item.isPrimary ? 'shield-checkmark' : 'person'}
                      size={24}
                      color={item.isPrimary ? colors.primary : colors.textPrimary}
                    />
                  </View>
                  <View style={styles.adminDetails}>
                    <View style={styles.adminNameRow}>
                      <Text style={styles.adminName}>{item.username}</Text>
                      {item.isPrimary && (
                        <View style={styles.badge}>
                          <Text style={styles.badgeText}>Principal</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.adminEmail}>{item.email}</Text>
                    <Text style={styles.adminDate}>
                      Criado em: {formatDate(item.createdAt)}
                    </Text>
                  </View>
                </View>

                {!item.isPrimary && (
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteAdmin(item)}
                  >
                    <Ionicons name="trash-outline" size={20} color={colors.error} />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </ScrollView>
        )}

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/admin/create-admin')}
          >
            <Ionicons name="person-add" size={20} color={colors.textPrimary} />
            <Text style={styles.addButtonText}>Adicionar Novo Admin</Text>
          </TouchableOpacity>
        </View>

        {/* Modal de confirmação para Web */}
        {Platform.OS === 'web' && adminToDelete && (
          <Modal visible={deleteModalVisible} transparent animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Ionicons name="warning" size={64} color={colors.warning} />
                <Text style={styles.modalTitle}>Confirmar Exclusão</Text>
                <Text style={styles.modalMessage}>
                  Tem certeza que deseja remover o administrador {adminToDelete.username}?
                </Text>
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalButtonCancel]}
                    onPress={() => {
                      setDeleteModalVisible(false);
                      setAdminToDelete(null);
                    }}
                  >
                    <Text style={styles.modalButtonTextCancel}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalButtonConfirm]}
                    onPress={() => confirmDelete(adminToDelete.id)}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyText: {
    fontSize: typography.lg,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.base,
  },
  adminCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: spacing.base,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  adminInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  adminIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  adminDetails: {
    flex: 1,
  },
  adminNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  adminName: {
    fontSize: typography.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginRight: spacing.sm,
  },
  badge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  badgeText: {
    fontSize: typography.xs,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  adminEmail: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  adminDate: {
    fontSize: typography.xs,
    color: colors.textTertiary,
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    padding: spacing.base,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.base,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  addButtonText: {
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
