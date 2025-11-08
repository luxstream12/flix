import { useState, useEffect, useCallback } from 'react';
import { UserProfile } from '../types';
import * as StorageService from '../services/storage';

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    const data = await StorageService.getUserProfile();
    setProfile(data);
    setLoading(false);
  };

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!profile) return;
    const updated = { ...profile, ...updates };
    await StorageService.saveUserProfile(updated);
    setProfile(updated);
  }, [profile]);

  const updateName = useCallback((name: string) => {
    updateProfile({ name });
  }, [updateProfile]);

  const updateAvatar = useCallback((avatarUrl: string) => {
    updateProfile({ avatarUrl });
  }, [updateProfile]);

  return {
    profile,
    loading,
    updateName,
    updateAvatar,
    refreshProfile: loadProfile,
  };
}
