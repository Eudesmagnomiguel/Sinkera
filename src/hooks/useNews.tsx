import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface News {
  id: string;
  title: string;
  description?: string;
  content?: string;
  image_url?: string;
  video_url?: string;
  product_id?: string;
  is_active: boolean;
  published_at: string;
  product?: {
    name: string;
  };
}

export function useNews() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      const { data, error } = await supabase
        .from('news_trends')
        .select('*, product:products(name)')
        .eq('is_active', true)
        .order('published_at', { ascending: false });

      if (error) throw error;
      setNews((data || []) as News[]);
    } catch (error) {
      console.error('Error loading news:', error);
    } finally {
      setLoading(false);
    }
  };

  return { news, loading, refetch: loadNews };
}
