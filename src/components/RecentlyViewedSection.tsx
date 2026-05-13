import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ProductCard } from '@/components/ProductCard';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';

interface Product {
  id: string;
  name: string;
  price: number;
  original_price?: number;
  image_url: string;
  rating?: number;
  reviews_count?: number;
  badge?: string;
  in_stock: boolean;
  stock_quantity?: number;
}

export function RecentlyViewedSection() {
  const { productIds } = useRecentlyViewed();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (productIds.length === 0) {
      setProducts([]);
      return;
    }
    const ids = productIds.slice(0, 8);
    setLoading(true);
    (supabase as any)
      .from('products')
      .select('*')
      .in('id', ids)
      .then(({ data }: { data: Product[] | null }) => {
        if (data) {
          // Restore the "most recent first" order from productIds
          const ordered = ids
            .map(id => data.find(p => p.id === id))
            .filter((p): p is Product => !!p);
          setProducts(ordered);
        }
      })
      .finally(() => setLoading(false));
  }, [productIds]);

  if (!loading && products.length === 0) return null;

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-5">
          <Clock className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground">Vistos Recentemente</h2>
        </div>

        {loading ? (
          <div className="flex gap-4 overflow-x-auto pb-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="min-w-[200px] w-[200px] h-72 rounded-2xl bg-muted animate-pulse flex-shrink-0" />
            ))}
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
            {products.map(product => (
              <div key={product.id} className="min-w-[200px] w-[200px] flex-shrink-0">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
