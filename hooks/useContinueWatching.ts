import { useState, useEffect, useCallback } from 'react';
import { WatchProgress } from '../types';
import * as StorageService from '../services/storage';

export function useContinueWatching() {
  const [continueWatching, setContinueWatching] = useState<WatchProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContinueWatching();
  }, []);

  const loadContinueWatching = async () => {
    setLoading(true);
    const data = await StorageService.getContinueWatching();
    setContinueWatching(data);
    setLoading(false);
  };

  const updateProgress = useCallback(async (
    contentId: string,
    progress: number,
    duration: number,
    episodeId?: string
  ) => {
    const watchProgress: WatchProgress = {
      contentId,
      episodeId,
      progress,
      duration,
      lastWatched: new Date(),
    };
    
    await StorageService.updateWatchProgress(watchProgress);
    await loadContinueWatching();
  }, []);

  const getProgress = useCallback((contentId: string, episodeId?: string) => {
    return continueWatching.find(
      p => p.contentId === contentId && 
      (episodeId ? p.episodeId === episodeId : !p.episodeId)
    );
  }, [continueWatching]);

  return {
    continueWatching,
    loading,
    updateProgress,
    getProgress,
    refreshContinueWatching: loadContinueWatching,
  };
}
