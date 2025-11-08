import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';

export default function AdminDashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { admin, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  const menuItems = [
    {
      id: '1',
      title: 'Adicionar Conteúdo',
      icon: 'add-circle' as const,
      route: '/admin/add-content',
      description: 'Filmes, séries e episódios',
    },
    {
      id: '2',
      title: 'Gerenciar Conteúdo',
      icon: 'create' as const,
      route: '/admin/manage-content',
      description: 'Editar ou deletar',
    },
    {
      id: '3',
      title: 'Gerenciar Categorias',
      icon: 'grid' as const,
      route: '/admin/categories',
      description: 'Criar e editar categorias',
    },
    {
      id: '4',
      title: 'Gerenciar Palavras-chave',
      icon: 'pricetags' as const,
      route: '/admin/keywords',
      description: 'Gerenciar tags e palavras-chave',
    },
    {
      id: '5',
      title: 'Enviar Notificação',
      icon: 'notifications' as const,
      route: '/admin/send-notification',
      description: 'Enviar avisos para usuários',
    },
  ];

  if (admin?.isPrimary) {
    menuItems.push(
      {
        id: '6',
        title: 'Criar Novo Admin',
        icon: 'person-add' as const,
        route: '/admin/create-admin',
        description: 'Adicionar novo administrador',
      },
      {
        id: '7',
        title: 'Lista de Admins',
        icon: 'people' as const,
        route: '/admin/list-admins',
        description: 'Visualizar e gerenciar admins',
      }
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Dashboard Admin</Text>
            <Text style={styles.subtitle}>Olá, {admin?.username}</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
          showsVerticalScrollIndicator={false}
        >
          {admin?.isPrimary && (
            <View style={styles.badge}>
              <Ionicons name="shield-checkmark" size={16} color={colors.primary} />
              <Text style={styles.badgeText}>Administrador Principal</Text>
            </View>
          )}

          <View style={styles.menuGrid}>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuCard}
                onPress={() => router.push(item.route as any)}
              >
                <View style={styles.menuIcon}>
                  <Ionicons name={item.icon} size={32} color={colors.primary} />
                </View>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuDescription}>{item.description}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.statsContainer}>
            <Text style={styles.statsTitle}>Estatísticas Rápidas</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Ionicons name="film-outline" size={32} color={colors.primary} />
                <Text style={styles.statNumber}>--</Text>
                <Text style={styles.statLabel}>Total de Conteúdos</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="people-outline" size={32} color={colors.primary} />
                <Text style={styles.statNumber}>--</Text>
                <Text style={styles.statLabel}>Usuários Ativos</Text>
              </View>
            </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.lg,
  },
  title: {
    fontSize: typography.hero,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: typography.base,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  logoutButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    marginBottom: spacing.xl,
  },
  badgeText: {
    color: colors.primary,
    fontSize: typography.sm,
    fontWeight: typography.weights.semibold,
    marginLeft: spacing.xs,
  },
  menuGrid: {
    paddingHorizontal: spacing.base,
    marginBottom: spacing.xl,
  },
  menuCard: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  menuIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  menuTitle: {
    fontSize: typography.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  menuDescription: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    lineHeight: typography.sm * 1.4,
  },
  statsContainer: {
    paddingHorizontal: spacing.base,
  },
  statsTitle: {
    fontSize: typography.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: typography.hero,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginVertical: spacing.sm,
  },
  statLabel: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
