import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Category {
  id: string;
  name: string;
  slug: string;
  count: number;
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      // Load all categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name, slug');

      if (categoriesError) throw categoriesError;

      // Load product counts for each category
      const categoriesWithCount = await Promise.all(
        (categoriesData || []).map(async (category) => {
          const { count } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', category.id)
            .eq('in_stock', true);

          return {
            ...category,
            count: count || 0,
          };
        })
      );

      // Get total products count
      const { count: totalCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('in_stock', true);

      // Add "All Products" category
      const allCategories = [
        { id: 'all', name: 'Todos os Produtos', slug: 'all', count: totalCount || 0 },
        ...categoriesWithCount,
      ];

      setCategories(allCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  return { categories, loading };
}
