import { supabase } from './supabaseClient';

export const userService = {
  async getUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  async createOrUpdateProfile(userId: string, name: string, avatarUrl?: string) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert({
          id: userId,
          name,
          avatar_url: avatarUrl,
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  async getWatchlist(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_watchlist')
        .select('content_id')
        .eq('user_id', userId);

      if (error) throw error;
      return { data: data?.map(item => item.content_id) || [], error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  async addToWatchlist(userId: string, contentId: string) {
    try {
      const { error } = await supabase
        .from('user_watchlist')
        .insert({ user_id: userId, content_id: contentId });

      if (error) throw error;
      return { data: true, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  async removeFromWatchlist(userId: string, contentId: string) {
    try {
      const { error } = await supabase
        .from('user_watchlist')
        .delete()
        .eq('user_id', userId)
        .eq('content_id', contentId);

      if (error) throw error;
      return { data: true, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  async getUserProgress(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .order('last_watched', { ascending: false });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  async updateProgress(
    userId: string,
    contentId: string,
    progressSeconds: number,
    durationSeconds: number,
    episodeId?: string
  ) {
    try {
      const { error } = await supabase
        .from('user_progress')
        .upsert({
          user_id: userId,
          content_id: contentId,
          episode_id: episodeId || null,
          progress_seconds: progressSeconds,
          duration_seconds: durationSeconds,
          last_watched: new Date().toISOString(),
        });

      if (error) throw error;
      return { data: true, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },
};
