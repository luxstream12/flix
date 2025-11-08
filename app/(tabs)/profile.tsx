import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useAuth } from '../../contexts/AuthContext';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';

const AVATAR_OPTIONS = [
  'https://wallpapers.com/images/hd/netflix-profile-pictures-1000-x-1000-qo9h82134t9nv0j0.jpg',
  'https://wallpapers.com/images/hd/netflix-profile-pictures-5yup5hd2i60x7ew3.jpg',
  'https://wallpapers.com/images/hd/netflix-profile-pictures-1000-x-1000-88wkdmjrorckekha.jpg',
  'https://wallpapers.com/images/featured/netflix-profile-pictures-w3lqr61qe57e9yt8.jpg',
  'https://i.pinimg.com/564x/a4/c6/5f/a4c65f709d4c0cb1b4329c12beb9cd78.jpg',
  'https://cdn.prod.website-files.com/64e275991a8eb7e3d600ed64/64ea46c2e764544da8d82d6f_download-2.png',
  'https://mir-s3-cdn-cf.behance.net/project_modules/disp/84c20033850498.56ba69ac290ea.png',
  'https://wallpapers.com/images/hd/netflix-profile-pictures-1000-x-1000-2fg93funipvqfs9i.jpg',
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { profile, updateName, updateAvatar } = useUserProfile();
  const { isAuthenticated } = useAuth();
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [tempName, setTempName] = useState('');

  const handleEditName = () => {
    setTempName(profile?.name || '');
    setIsEditingName(true);
  };

  const handleSaveName = () => {
    if (tempName.trim()) {
      updateName(tempName.trim());
    }
    setIsEditingName(false);
  };

  const handleSelectAvatar = (url: string) => {
    updateAvatar(url);
    setIsEditingAvatar(false);
  };

  const handleAdminAccess = () => {
    router.push('/admin/login');
  };

  if (!profile) return null;

  return (
    <ScrollView 
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Perfil</Text>
      </View>

      <View style={styles.profileSection}>
        <TouchableOpacity onPress={() => setIsEditingAvatar(!isEditingAvatar)}>
          <Animated.View entering={FadeIn} exiting={FadeOut}>
            <Image
              source={{ uri: profile.avatarUrl }}
              style={styles.avatar}
              contentFit="cover"
              transition={300}
            />
            <View style={styles.avatarEdit}>
              <Ionicons name="camera" size={20} color={colors.textPrimary} />
            </View>
          </Animated.View>
        </TouchableOpacity>

        {isEditingAvatar && (
          <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.avatarOptions}>
            <Text style={styles.avatarOptionsTitle}>Escolha uma foto</Text>
            <View style={styles.avatarGrid}>
              {AVATAR_OPTIONS.map((url) => (
                <TouchableOpacity
                  key={url}
                  onPress={() => handleSelectAvatar(url)}
                  style={styles.avatarOption}
                >
                  <Image
                    source={{ uri: url }}
                    style={styles.avatarOptionImage}
                    contentFit="cover"
                  />
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        )}

        <View style={styles.nameSection}>
          {!isEditingName ? (
            <>
              <Text style={styles.name}>{profile.name}</Text>
              <TouchableOpacity onPress={handleEditName} style={styles.editButton}>
                <Ionicons name="pencil" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.nameEditContainer}>
              <TextInput
                style={styles.nameInput}
                value={tempName}
                onChangeText={setTempName}
                placeholder="Digite seu nome"
                placeholderTextColor={colors.textSecondary}
                autoFocus
              />
              <TouchableOpacity onPress={handleSaveName} style={styles.saveButton}>
                <Text style={styles.saveButtonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Configurações</Text>
        
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/notifications')}>
          <Ionicons name="notifications-outline" size={24} color={colors.textPrimary} />
          <Text style={styles.menuText}>Notificações</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/downloads')}>
          <Ionicons name="download-outline" size={24} color={colors.textPrimary} />
          <Text style={styles.menuText}>Downloads</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/privacy')}>
          <Ionicons name="shield-outline" size={24} color={colors.textPrimary} />
          <Text style={styles.menuText}>Privacidade</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/help')}>
          <Ionicons name="help-circle-outline" size={24} color={colors.textPrimary} />
          <Text style={styles.menuText}>Ajuda</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        {isAuthenticated ? (
          <TouchableOpacity style={styles.adminButton} onPress={() => router.push('/admin/dashboard')}>
            <Ionicons name="shield-checkmark" size={20} color={colors.textPrimary} />
            <Text style={styles.adminButtonText}>Dashboard Admin</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.adminButton} onPress={handleAdminAccess}>
            <Ionicons name="shield-outline" size={20} color={colors.textPrimary} />
            <Text style={styles.adminButtonText}>Acesso Admin</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.lg,
  },
  title: {
    fontSize: typography.hero,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  avatarEdit: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarOptions: {
    marginTop: spacing.xl,
    width: '100%',
    paddingHorizontal: spacing.base,
  },
  avatarOptionsTitle: {
    fontSize: typography.lg,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.md,
  },
  avatarOption: {
    width: 80,
    height: 80,
  },
  avatarOptionImage: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    borderWidth: 2,
    borderColor: colors.border,
  },
  nameSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  name: {
    fontSize: typography.xxl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  editButton: {
    marginLeft: spacing.sm,
    padding: spacing.xs,
  },
  nameEditContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  nameInput: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    borderRadius: borderRadius.sm,
    fontSize: typography.lg,
    color: colors.textPrimary,
    minWidth: 200,
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    borderRadius: borderRadius.sm,
  },
  saveButtonText: {
    color: colors.textPrimary,
    fontSize: typography.base,
    fontWeight: typography.weights.semibold,
  },
  section: {
    paddingHorizontal: spacing.base,
    marginTop: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuText: {
    flex: 1,
    fontSize: typography.lg,
    color: colors.textPrimary,
    marginLeft: spacing.base,
  },
  adminButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    paddingVertical: spacing.base,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  adminButtonText: {
    fontSize: typography.lg,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginLeft: spacing.sm,
  },
});
