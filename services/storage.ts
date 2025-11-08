import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, WatchProgress, Notification } from '../types';

const STORAGE_KEYS = {
  USER_PROFILE: '@netflix_user_profile',
  WATCHLIST: '@netflix_watchlist',
  CONTINUE_WATCHING: '@netflix_continue_watching',
  NOTIFICATIONS: '@netflix_notifications',
  SEARCH_HISTORY: '@netflix_search_history',
};

// User Profile
export async function getUserProfile(): Promise<UserProfile | null> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (!data) {
      // Create default profile
      const defaultProfile: UserProfile = {
        id: '1',
        name: 'Usuário',
        avatarUrl: 'https://i.pravatar.cc/150?img=1',
        watchlist: [],
        continueWatching: [],
      };
      await saveUserProfile(defaultProfile);
      return defaultProfile;
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  } catch (error) {
    console.error('Error saving user profile:', error);
  }
}

// Watchlist
export async function getWatchlist(): Promise<string[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.WATCHLIST);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting watchlist:', error);
    return [];
  }
}

export async function addToWatchlist(contentId: string): Promise<void> {
  try {
    const watchlist = await getWatchlist();
    if (!watchlist.includes(contentId)) {
      watchlist.push(contentId);
      await AsyncStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(watchlist));
    }
  } catch (error) {
    console.error('Error adding to watchlist:', error);
  }
}

export async function removeFromWatchlist(contentId: string): Promise<void> {
  try {
    const watchlist = await getWatchlist();
    const filtered = watchlist.filter(id => id !== contentId);
    await AsyncStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error removing from watchlist:', error);
  }
}

// Continue Watching
export async function getContinueWatching(): Promise<WatchProgress[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.CONTINUE_WATCHING);
    if (!data) return [];
    const progress: WatchProgress[] = JSON.parse(data);
    // Convert date strings back to Date objects
    return progress.map(p => ({
      ...p,
      lastWatched: new Date(p.lastWatched),
    }));
  } catch (error) {
    console.error('Error getting continue watching:', error);
    return [];
  }
}

export async function updateWatchProgress(progress: WatchProgress): Promise<void> {
  try {
    const continueWatching = await getContinueWatching();
    const existingIndex = continueWatching.findIndex(
      p => p.contentId === progress.contentId && p.episodeId === progress.episodeId
    );
    
    if (existingIndex >= 0) {
      continueWatching[existingIndex] = progress;
    } else {
      continueWatching.unshift(progress);
    }
    
    // Keep only last 20 items
    const limited = continueWatching.slice(0, 20);
    await AsyncStorage.setItem(STORAGE_KEYS.CONTINUE_WATCHING, JSON.stringify(limited));
  } catch (error) {
    console.error('Error updating watch progress:', error);
  }
}

// Notifications
export async function getNotifications(): Promise<Notification[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (!data) return [];
    const notifications: Notification[] = JSON.parse(data);
    return notifications.map(n => ({
      ...n,
      date: new Date(n.date),
    }));
  } catch (error) {
    console.error('Error getting notifications:', error);
    return [];
  }
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
  try {
    const notifications = await getNotifications();
    const updated = notifications.map(n =>
      n.id === notificationId ? { ...n, isRead: true } : n
    );
    await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
}

export async function markAllNotificationsAsRead(): Promise<void> {
  try {
    const notifications = await getNotifications();
    const updated = notifications.map(n => ({ ...n, isRead: true }));
    await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
  }
}

// Search History
export async function getSearchHistory(): Promise<string[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting search history:', error);
    return [];
  }
}

export async function addToSearchHistory(contentId: string): Promise<void> {
  try {
    const history = await getSearchHistory();
    const filtered = history.filter(id => id !== contentId);
    filtered.unshift(contentId);
    const limited = filtered.slice(0, 10);
    await AsyncStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify(limited));
  } catch (error) {
    console.error('Error adding to search history:', error);
  }
}
