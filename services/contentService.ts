import { supabase } from './supabaseClient';
import { Content } from '../types';

export const contentService = {
  async getAllContent() {
    try {
      const { data, error } = await supabase
        .from('content')
        .select(`
          *,
          category:categories(id, name),
          keywords:content_keywords(keyword:keywords(id, name))
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform data to match Content type
      const transformedData = data?.map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description || '',
        type: item.type as 'movie' | 'series',
        category: item.category?.name || '',
        categoryId: item.category_id, // Add category ID
        coverUrl: item.cover_url,
        bannerUrl: item.banner_url,
        videoUrl: item.video_url,
        year: item.year,
        duration: item.duration,
        rating: item.rating,
        keywords: item.keywords?.map((k: any) => k.keyword.name) || [],
        isNew: item.is_new,
        inBanner: item.in_banner,
        isSeries: item.type === 'series',
        addedDate: new Date(item.created_at),
      })) || [];

      return { data: transformedData as Content[], error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  async getContentById(id: string) {
    try {
      const { data, error } = await supabase
        .from('content')
        .select(`
          *,
          category:categories(id, name),
          keywords:content_keywords(keyword:keywords(id, name)),
          episodes(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      const transformed = {
        id: data.id,
        title: data.title,
        description: data.description || '',
        type: data.type as 'movie' | 'series',
        category: data.category?.name || '',
        categoryId: data.category_id,
        coverUrl: data.cover_url,
        bannerUrl: data.banner_url,
        videoUrl: data.video_url,
        year: data.year,
        duration: data.duration,
        rating: data.rating,
        keywords: data.keywords?.map((k: any) => k.keyword.name) || [],
        isNew: data.is_new,
        inBanner: data.in_banner,
        episodes: data.episodes || [],
        isSeries: data.type === 'series',
        addedDate: new Date(data.created_at),
      };

      return { data: transformed as Content, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  async getBannerContent() {
    try {
      const { data, error } = await supabase
        .from('content')
        .select(`
          *,
          category:categories(id, name),
          keywords:content_keywords(keyword:keywords(id, name))
        `)
        .eq('in_banner', true)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      const transformedData = data?.map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description || '',
        type: item.type as 'movie' | 'series',
        category: item.category?.name || '',
        categoryId: item.category_id,
        coverUrl: item.cover_url,
        bannerUrl: item.banner_url,
        videoUrl: item.video_url,
        year: item.year,
        duration: item.duration,
        rating: item.rating,
        keywords: item.keywords?.map((k: any) => k.keyword.name) || [],
        isNew: item.is_new,
        inBanner: item.in_banner,
        isSeries: item.type === 'series',
        addedDate: new Date(item.created_at),
      })) || [];

      return { data: transformedData as Content[], error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  async getNewContent() {
    try {
      const { data, error } = await supabase
        .from('content')
        .select(`
          *,
          category:categories(id, name),
          keywords:content_keywords(keyword:keywords(id, name))
        `)
        .eq('is_new', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedData = data?.map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description || '',
        type: item.type as 'movie' | 'series',
        category: item.category?.name || '',
        categoryId: item.category_id,
        coverUrl: item.cover_url,
        bannerUrl: item.banner_url,
        videoUrl: item.video_url,
        year: item.year,
        duration: item.duration,
        rating: item.rating,
        keywords: item.keywords?.map((k: any) => k.keyword.name) || [],
        isNew: item.is_new,
        inBanner: item.in_banner,
        isSeries: item.type === 'series',
        addedDate: new Date(item.created_at),
      })) || [];

      return { data: transformedData as Content[], error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  async getContentByCategory(categoryId: string) {
    try {
      const { data, error } = await supabase
        .from('content')
        .select(`
          *,
          category:categories(id, name),
          keywords:content_keywords(keyword:keywords(id, name))
        `)
        .eq('category_id', categoryId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedData = data?.map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description || '',
        type: item.type as 'movie' | 'series',
        category: item.category?.name || '',
        categoryId: item.category_id,
        coverUrl: item.cover_url,
        bannerUrl: item.banner_url,
        videoUrl: item.video_url,
        year: item.year,
        duration: item.duration,
        rating: item.rating,
        keywords: item.keywords?.map((k: any) => k.keyword.name) || [],
        isNew: item.is_new,
        inBanner: item.in_banner,
        isSeries: item.type === 'series',
        addedDate: new Date(item.created_at),
      })) || [];

      return { data: transformedData as Content[], error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  async searchContent(query: string) {
    try {
      const { data, error } = await supabase
        .from('content')
        .select(`
          *,
          category:categories(id, name),
          keywords:content_keywords(keyword:keywords(id, name))
        `)
        .ilike('title', `%${query}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedData = data?.map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description || '',
        type: item.type as 'movie' | 'series',
        category: item.category?.name || '',
        categoryId: item.category_id,
        coverUrl: item.cover_url,
        bannerUrl: item.banner_url,
        videoUrl: item.video_url,
        year: item.year,
        duration: item.duration,
        rating: item.rating,
        keywords: item.keywords?.map((k: any) => k.keyword.name) || [],
        isNew: item.is_new,
        inBanner: item.in_banner,
        isSeries: item.type === 'series',
        addedDate: new Date(item.created_at),
      })) || [];

      return { data: transformedData as Content[], error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  async addContent(content: Partial<Content>) {
    try {
      const { data, error } = await supabase
        .from('content')
        .insert({
          title: content.title,
          description: content.description,
          type: content.type,
          category_id: content.categoryId || content.category,
          cover_url: content.coverUrl,
          banner_url: content.bannerUrl,
          video_url: content.videoUrl,
          year: content.year,
          duration: content.duration,
          rating: content.rating,
          in_banner: content.inBanner || false,
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  async updateContent(id: string, updates: Partial<Content>) {
    try {
      const { data, error } = await supabase
        .from('content')
        .update({
          title: updates.title,
          description: updates.description,
          cover_url: updates.coverUrl,
          banner_url: updates.bannerUrl,
          video_url: updates.videoUrl,
          year: updates.year,
          duration: updates.duration,
          rating: updates.rating,
          in_banner: updates.inBanner,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  async deleteContent(id: string) {
    try {
      const { error } = await supabase
        .from('content')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { data: true, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },
};
