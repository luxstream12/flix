import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WATCHLIST_STORAGE_KEY = '@flixbr:watchlist';
const USER_ID_KEY = '@flixbr:userId';

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWatchlist();
  }, []);

  const getUserId = async () => {
    const userId = await AsyncStorage.getItem(USER_ID_KEY);
    return userId || 'guest';
  };

  const loadWatchlist = async () => {
    setLoading(true);
    try {
      const userId = await getUserId();
      
      if (userId !== 'guest') {
        // Carregar do Supabase
        const { data } = await supabase
          .from('user_watchlist')
          .select('content_id')
          .eq('user_id', userId);
        
        if (data) {
          const ids = data.map(item => item.content_id);
          setWatchlist(ids);
          // Sincronizar com AsyncStorage
          await AsyncStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(ids));
        }
      } else {
        // Carregar do AsyncStorage (guest)
        const stored = await AsyncStorage.getItem(WATCHLIST_STORAGE_KEY);
        if (stored) {
          setWatchlist(JSON.parse(stored));
        }
      }
    } catch (error) {
      console.error('Error loading watchlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const isInWatchlist = useCallback((contentId: string) => {
    return watchlist.includes(contentId);
  }, [watchlist]);

  const addToWatchlist = useCallback(async (contentId: string) => {
    if (watchlist.includes(contentId)) return;
    
    const newWatchlist = [...watchlist, contentId];
    setWatchlist(newWatchlist);
    
    try {
      const userId = await getUserId();
      
      if (userId !== 'guest') {
        // Salvar no Supabase
        await supabase
          .from('user_watchlist')
          .insert({ user_id: userId, content_id: contentId });
      }
      
      // Salvar no AsyncStorage
      await AsyncStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(newWatchlist));
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      // Reverter em caso de erro
      setWatchlist(watchlist);
    }
  }, [watchlist]);

  const removeFromWatchlist = useCallback(async (contentId: string) => {
    const newWatchlist = watchlist.filter(id => id !== contentId);
    setWatchlist(newWatchlist);
    
    try {
      const userId = await getUserId();
      
      if (userId !== 'guest') {
        // Remover do Supabase
        await supabase
          .from('user_watchlist')
          .delete()
          .eq('user_id', userId)
          .eq('content_id', contentId);
      }
      
      // Salvar no AsyncStorage
      await AsyncStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(newWatchlist));
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      // Reverter em caso de erro
      setWatchlist(watchlist);
    }
  }, [watchlist]);

  const toggleWatchlist = useCallback(async (contentId: string) => {
    if (isInWatchlist(contentId)) {
      await removeFromWatchlist(contentId);
    } else {
      await addToWatchlist(contentId);
    }
  }, [isInWatchlist, addToWatchlist, removeFromWatchlist]);

  return {
    watchlist,
    loading,
    isInWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    toggleWatchlist,
    refreshWatchlist: loadWatchlist,
  };
}
