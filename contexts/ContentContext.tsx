import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../services/supabaseClient';
import { contentService } from '../services/contentService';
import { Content } from '../types';

interface ContentContextType {
  content: Content[];
  bannerContent: Content[];
  newContent: Content[];
  loading: boolean;
  refreshContent: () => Promise<void>;
  getContentById: (id: string) => Content | undefined;
  getContentByCategory: (categoryId: string) => Content[];
  searchContent: (query: string) => Promise<Content[]>;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<Content[]>([]);
  const [bannerContent, setBannerContent] = useState<Content[]>([]);
  const [newContent, setNewContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
    
    // Subscribe to real-time changes
    const subscription = supabase
      .channel('content_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'content' },
        () => {
          loadContent();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadContent = async () => {
    setLoading(true);
    try {
      const [allContent, banner, newItems] = await Promise.all([
        contentService.getAllContent(),
        contentService.getBannerContent(),
        contentService.getNewContent(),
      ]);

      if (allContent.data) setContent(allContent.data);
      if (banner.data) setBannerContent(banner.data);
      if (newItems.data) setNewContent(newItems.data);
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoading(false);
    }
  };

  const getContentById = (id: string) => {
    return content.find(c => c.id === id);
  };

  const getContentByCategory = (categoryId: string) => {
    // Match by category ID
    return content.filter(c => c.categoryId === categoryId);
  };

  const searchContent = async (query: string) => {
    const { data } = await contentService.searchContent(query);
    return data || [];
  };

  return (
    <ContentContext.Provider
      value={{
        content,
        bannerContent,
        newContent,
        loading,
        refreshContent: loadContent,
        getContentById,
        getContentByCategory,
        searchContent,
      }}
    >
      {children}
    </ContentContext.Provider>
  );
}

export function useContent() {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error('useContent must be used within ContentProvider');
  }
  return context;
}
