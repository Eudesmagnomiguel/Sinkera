import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Product {
  id: string;
  name: string;
  price: number;
  original_price?: number;
  image_url: string;
  images?: string[];
  category_id?: string;
  brand_id?: string;
  rating?: number;
  reviews_count?: number;
  badge?: string;
  in_stock: boolean;
  description?: string;
  is_featured?: boolean;
  is_bestseller?: boolean;
  is_special_offer?: boolean;
  is_trending?: boolean;
  stock_quantity?: number;
  specifications?: Record<string, any>;
  created_at?: string;
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setError(null);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        setError(error.message);
        setProducts([]);
        return;
      }
      setProducts((data || []) as Product[]);
    } catch (err: any) {
      setError(err.message ?? 'Erro desconhecido');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  return { products, loading, error };
}
