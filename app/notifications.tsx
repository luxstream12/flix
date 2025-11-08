import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as StorageService from '../services/storage';
import { Notification } from '../types';
import { colors, spacing, typography, borderRadius } from '../constants/theme';

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    const data = await StorageService.getNotifications();
    setNotifications(data);
  };

  const handleMarkAsRead = async (id: string) => {
    await StorageService.markNotificationAsRead(id);
    await loadNotifications();
  };

  const handleMarkAllAsRead = async () => {
    await StorageService.markAllNotificationsAsRead();
    await loadNotifications();
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Notificações</Text>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={handleMarkAllAsRead} style={styles.markAllButton}>
              <Text style={styles.markAllText}>Marcar todas</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
          showsVerticalScrollIndicator={false}
        >
          {notifications.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="notifications-off-outline" size={80} color={colors.textSecondary} />
              <Text style={styles.emptyText}>Nenhuma notificação</Text>
              <Text style={styles.emptySubtext}>
                Você receberá notificações sobre novos conteúdos e atualizações aqui
              </Text>
            </View>
          ) : (
            notifications.map((notification) => (
              <TouchableOpacity
                key={notification.id}
                style={[styles.notificationCard, !notification.isRead && styles.unread]}
                onPress={() => handleMarkAsRead(notification.id)}
              >
                <View style={styles.notificationIcon}>
                  <Ionicons
                    name={notification.type === 'new_content' ? 'film' : 'information-circle'}
                    size={24}
                    color={notification.isRead ? colors.textSecondary : colors.primary}
                  />
                </View>
                <View style={styles.notificationContent}>
                  <Text style={[styles.notificationTitle, !notification.isRead && styles.boldText]}>
                    {notification.title}
                  </Text>
                  <Text style={styles.notificationMessage}>{notification.message}</Text>
                  <Text style={styles.notificationDate}>
                    {notification.date.toLocaleDateString('pt-BR')} às{' '}
                    {notification.date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
                {!notification.isRead && <View style={styles.unreadDot} />}
              </TouchableOpacity>
            ))
          )}
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
  markAllButton: {
    padding: spacing.sm,
  },
  markAllText: {
    fontSize: typography.sm,
    color: colors.primary,
    fontWeight: typography.weights.semibold,
  },
  content: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
  },
  emptyText: {
    fontSize: typography.xxl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    fontSize: typography.base,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.base,
    marginHorizontal: spacing.base,
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
  },
  unread: {
    backgroundColor: colors.surfaceLight,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: typography.base,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  boldText: {
    fontWeight: typography.weights.bold,
  },
  notificationMessage: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    lineHeight: typography.sm * 1.4,
  },
  notificationDate: {
    fontSize: typography.xs,
    color: colors.textSecondary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginLeft: spacing.sm,
    marginTop: spacing.sm,
  },
});
