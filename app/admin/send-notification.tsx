import React, { useState } from 'react';
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

export default function SendNotificationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { admin } = useAuth();

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'general' | 'update' | 'promotion'>('general');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  const showAlert = (title: string, message: string, onOk?: () => void) => {
    if (Platform.OS === 'web') {
      setSuccessModalVisible(true);
    } else {
      Alert.alert(title, message, onOk ? [{ text: 'OK', onPress: onOk }] : undefined);
    }
  };

  const handleSendNotification = async () => {
    if (!title.trim() || !message.trim()) {
      setError('Preencha todos os campos');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Criar notificação
      const { data: notification, error: notifError } = await supabase
        .from('notifications')
        .insert({
          title: title.trim(),
          message: message.trim(),
          type,
        })
        .select()
        .single();

      if (notifError) throw notifError;

      // Buscar todos os usuários
      const { data: users, error: usersError } = await supabase
        .from('user_profiles')
        .select('id');

      if (usersError) throw usersError;

      // Criar associação notification-user para cada usuário
      if (users && users.length > 0 && notification) {
        const userNotifications = users.map(user => ({
          user_id: user.id,
          notification_id: notification.id,
          is_read: false,
        }));

        const { error: insertError } = await supabase
          .from('user_notifications')
          .insert(userNotifications);

        if (insertError) throw insertError;
      }

      setTitle('');
      setMessage('');
      setType('general');
      setLoading(false);

      showAlert(
        'Sucesso',
        `Notificação enviada para ${users?.length || 0} usuário(s)!`,
        () => router.back()
      );
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Erro ao enviar notificação');
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
          <Text style={styles.title}>Enviar Notificação</Text>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.form}>
            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={20} color={colors.info} />
              <Text style={styles.infoText}>
                A notificação será enviada para todos os usuários do aplicativo
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tipo de Notificação</Text>
              <View style={styles.typeSelector}>
                <TouchableOpacity
                  style={[styles.typeButton, type === 'general' && styles.typeButtonActive]}
                  onPress={() => setType('general')}
                >
                  <Ionicons
                    name="notifications"
                    size={20}
                    color={type === 'general' ? colors.textPrimary : colors.textSecondary}
                  />
                  <Text style={[styles.typeText, type === 'general' && styles.typeTextActive]}>
                    Geral
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeButton, type === 'update' && styles.typeButtonActive]}
                  onPress={() => setType('update')}
                >
                  <Ionicons
                    name="rocket"
                    size={20}
                    color={type === 'update' ? colors.textPrimary : colors.textSecondary}
                  />
                  <Text style={[styles.typeText, type === 'update' && styles.typeTextActive]}>
                    Atualização
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeButton, type === 'promotion' && styles.typeButtonActive]}
                  onPress={() => setType('promotion')}
                >
                  <Ionicons
                    name="gift"
                    size={20}
                    color={type === 'promotion' ? colors.textPrimary : colors.textSecondary}
                  />
                  <Text style={[styles.typeText, type === 'promotion' && styles.typeTextActive]}>
                    Promoção
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Título *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Novo conteúdo disponível"
                placeholderTextColor={colors.textSecondary}
                value={title}
                onChangeText={setTitle}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mensagem *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Escreva sua mensagem aqui..."
                placeholderTextColor={colors.textSecondary}
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={6}
              />
            </View>

            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={20} color={colors.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={[styles.sendButton, loading && styles.sendButtonDisabled]}
              onPress={handleSendNotification}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.textPrimary} />
              ) : (
                <>
                  <Ionicons name="send" size={20} color={colors.textPrimary} />
                  <Text style={styles.sendButtonText}>Enviar Notificação</Text>
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
                <Text style={styles.modalTitle}>Enviado!</Text>
                <Text style={styles.modalMessage}>Notificação enviada com sucesso!</Text>
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
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    padding: spacing.base,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xl,
    borderLeftWidth: 4,
    borderLeftColor: colors.info,
  },
  infoText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: typography.sm,
    marginLeft: spacing.md,
    lineHeight: typography.sm * 1.5,
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
    minHeight: 120,
    textAlignVertical: 'top',
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
  sendButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    height: 56,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonText: {
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
