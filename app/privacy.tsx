import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography, borderRadius } from '../constants/theme';

export default function PrivacyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Privacidade</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Coleta de Dados</Text>
            <Text style={styles.text}>
              Este aplicativo armazena informações localmente no seu dispositivo, incluindo:
            </Text>
            <View style={styles.list}>
              <Text style={styles.listItem}>• Perfil do usuário (nome e foto)</Text>
              <Text style={styles.listItem}>• Lista de conteúdos favoritos</Text>
              <Text style={styles.listItem}>• Histórico de visualização</Text>
              <Text style={styles.listItem}>• Progresso de reprodução</Text>
              <Text style={styles.listItem}>• Histórico de pesquisas</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Armazenamento Local</Text>
            <Text style={styles.text}>
              Todos os dados são armazenados localmente no seu dispositivo usando AsyncStorage. 
              Nenhuma informação é enviada para servidores externos nesta versão do aplicativo.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Seus Direitos</Text>
            <Text style={styles.text}>Você tem o direito de:</Text>
            <View style={styles.list}>
              <Text style={styles.listItem}>• Acessar seus dados a qualquer momento</Text>
              <Text style={styles.listItem}>• Modificar suas informações de perfil</Text>
              <Text style={styles.listItem}>• Excluir seu histórico e progresso</Text>
              <Text style={styles.listItem}>• Limpar todos os dados do aplicativo</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Gerenciar Dados</Text>
            
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="trash-outline" size={24} color={colors.textPrimary} />
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Limpar Histórico</Text>
                <Text style={styles.actionText}>Remove histórico de pesquisa e visualização</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="refresh-outline" size={24} color={colors.textPrimary} />
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Redefinir Progresso</Text>
                <Text style={styles.actionText}>Remove todo progresso de reprodução</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionButton, styles.dangerButton]}>
              <Ionicons name="alert-circle-outline" size={24} color={colors.error} />
              <View style={styles.actionContent}>
                <Text style={[styles.actionTitle, styles.dangerText]}>Excluir Todos os Dados</Text>
                <Text style={styles.actionText}>Remove permanentemente todas as informações</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contato</Text>
            <Text style={styles.text}>
              Para dúvidas sobre privacidade, entre em contato:
            </Text>
            <Text style={styles.contactText}>privacidade@flixbr.com</Text>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Última atualização: {new Date().toLocaleDateString('pt-BR')}
            </Text>
          </View>
        </ScrollView>
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
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: spacing.base,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  text: {
    fontSize: typography.base,
    color: colors.textSecondary,
    lineHeight: typography.base * 1.6,
    marginBottom: spacing.md,
  },
  list: {
    marginLeft: spacing.base,
  },
  listItem: {
    fontSize: typography.base,
    color: colors.textSecondary,
    lineHeight: typography.base * 1.8,
  },
  contactText: {
    fontSize: typography.base,
    color: colors.primary,
    fontWeight: typography.weights.semibold,
    marginTop: spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.base,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  dangerButton: {
    borderWidth: 1,
    borderColor: colors.error,
  },
  actionContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  actionTitle: {
    fontSize: typography.base,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs / 2,
  },
  dangerText: {
    color: colors.error,
  },
  actionText: {
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
  footer: {
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.xl,
    alignItems: 'center',
  },
  footerText: {
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
});
