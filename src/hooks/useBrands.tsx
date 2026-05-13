import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Brand {
  id: string;
  name: string;
  slug: string;
  count: number;
}

export function useBrands() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = async () => {
    try {
      // Load all brands
      const { data: brandsData, error: brandsError } = await supabase
        .from('brands')
        .select('id, name, slug');

      if (brandsError) throw brandsError;

      // Load product counts for each brand
      const brandsWithCount = await Promise.all(
        (brandsData || []).map(async (brand) => {
          const { count } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('brand_id', brand.id)
            .eq('in_stock', true);

          return {
            ...brand,
            count: count || 0,
          };
        })
      );

      setBrands(brandsWithCount);
    } catch (error) {
      console.error('Error loading brands:', error);
    } finally {
      setLoading(false);
    }
  };

  return { brands, loading };
}
