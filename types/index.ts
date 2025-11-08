export interface Movie {
  id: string;
  title: string;
  description: string;
  category: string;
  categoryId?: string; // Add category ID field
  keywords: string[];
  coverUrl: string;
  bannerUrl?: string;
  videoUrl: string;
  year: number;
  duration: number; // in minutes
  rating: number; // 0-10
  isNew?: boolean;
  inBanner?: boolean;
  addedDate: Date;
  isSeries?: boolean;
}

export interface Series extends Omit<Movie, 'duration' | 'videoUrl'> {
  isSeries: true;
  seasons: Season[];
  episodes?: Episode[];
}

export interface Season {
  id: string;
  seasonNumber: number;
  episodes: Episode[];
}

export interface Episode {
  id: string;
  title: string;
  episodeNumber: number;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  duration: number; // in minutes
}

export interface Category {
  id: string;
  name: string;
  keywords: string[];
}

export interface WatchProgress {
  contentId: string;
  episodeId?: string;
  progress: number; // 0-1
  lastWatched: Date;
  duration: number;
}

export interface UserProfile {
  id: string;
  name: string;
  avatarUrl: string;
  watchlist: string[];
  continueWatching: WatchProgress[];
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: Date;
  isRead: boolean;
}

export type Content = Movie | Series;
