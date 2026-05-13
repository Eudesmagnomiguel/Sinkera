import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, BarChart2 } from 'lucide-react';
import { useCompare } from '@/hooks/useCompare';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

interface ProductThumb {
  id: string;
  name: string;
  image_url: string;
}

export function CompareBar() {
  const { compareIds, removeFromCompare, clearCompare } = useCompare();
  const navigate = useNavigate();
  const [products, setProducts] = useState<ProductThumb[]>([]);

  useEffect(() => {
    if (compareIds.length === 0) {
      setProducts([]);
      return;
    }
    supabase
      .from('products')
      .select('id, name, image_url')
      .in('id', compareIds)
      .then(({ data }) => setProducts((data || []) as ProductThumb[]));
  }, [compareIds]);

  if (compareIds.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-background/95 backdrop-blur-md border-t border-border shadow-2xl">
      <div className="container mx-auto px-4 py-3 flex items-center gap-4 flex-wrap">
        {/* Thumbnails */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {products.map((p) => (
            <div key={p.id} className="relative flex-shrink-0 group">
              <div className="w-12 h-12 rounded-xl overflow-hidden border border-border bg-muted">
                <img
                  src={p.image_url}
                  alt={p.name}
                  className="w-full h-full object-contain p-1"
                />
              </div>
              <button
                onClick={() => removeFromCompare(p.id)}
                className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
                aria-label={`Remover ${p.name}`}
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          ))}

          {/* Empty slots */}
          {Array.from({ length: 3 - products.length }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="w-12 h-12 rounded-xl border-2 border-dashed border-border bg-muted/30 flex items-center justify-center flex-shrink-0"
            >
              <span className="text-xs text-muted-foreground font-bold">+</span>
            </div>
          ))}

          <div className="hidden sm:block ml-1">
            <p className="text-xs font-semibold text-foreground">
              {compareIds.length} produto{compareIds.length !== 1 ? 's' : ''} para comparar
            </p>
            <button
              onClick={clearCompare}
              className="text-[11px] text-muted-foreground hover:text-destructive transition-colors"
            >
              Limpar
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={clearCompare}
            className="text-xs text-muted-foreground hover:text-destructive transition-colors sm:hidden"
          >
            Limpar
          </button>
          <Button
            onClick={() => navigate('/comparar')}
            className="gap-2 font-bold rounded-xl"
            size="sm"
            disabled={compareIds.length < 2}
          >
            <BarChart2 className="w-4 h-4" />
            Comparar ({compareIds.length})
          </Button>
        </div>
      </div>
    </div>
  );
}
