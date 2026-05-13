import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  is_featured?: boolean | null;
}

const FALLBACK: Brand[] = [
  { id: '1', name: 'Apple',   slug: 'apple',   logo_url: null },
  { id: '2', name: 'Sony',    slug: 'sony',    logo_url: null },
  { id: '3', name: 'Samsung', slug: 'samsung', logo_url: null },
  { id: '4', name: 'Canon',   slug: 'canon',   logo_url: null },
  { id: '5', name: 'Dell',    slug: 'dell',    logo_url: null },
  { id: '6', name: 'Asus',    slug: 'asus',    logo_url: null },
  { id: '7', name: 'LG',      slug: 'lg',      logo_url: null },
  { id: '8', name: 'Huawei',  slug: 'huawei',  logo_url: null },
];

export const BrandsSection = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (supabase as any)
      .from('brands')
      .select('id, name, slug, logo_url, is_featured')
      .order('name')
      .then(({ data }: { data: Brand[] | null }) => {
        const list = data && data.length > 0 ? data : FALLBACK;
        setBrands(list.filter((b) => b.is_featured !== false));
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <section className="py-8">
        <div className="flex items-center justify-between mb-5">
          <div className="h-7 w-48 bg-muted rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 sm:gap-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-square rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Marcas</p>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">
            Marcas em <span className="text-primary">Destaque</span>
          </h2>
        </div>
        <Link
          to="/produtos"
          className="hidden sm:flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
        >
          Ver todas as marcas <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 sm:gap-3">
        {brands.map((brand) => (
          <Link
            key={brand.id}
            to={`/produtos?brand=${brand.slug}`}
            className="group flex flex-col items-center justify-center gap-2 p-3 sm:p-4 bg-card dark:bg-card border border-border rounded-xl hover:border-primary/40 hover:shadow-md transition-all duration-200"
          >
            {brand.logo_url ? (
              <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center">
                <img
                  src={brand.logo_url}
                  alt={brand.name}
                  className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-200"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                    const span = document.createElement('span');
                    span.className = 'text-xs font-bold text-muted-foreground';
                    span.textContent = brand.name;
                    e.currentTarget.parentElement?.appendChild(span);
                  }}
                />
              </div>
            ) : (
              <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center">
                <span className="text-xs sm:text-sm font-black text-foreground/70 group-hover:text-primary transition-colors text-center leading-tight">
                  {brand.name}
                </span>
              </div>
            )}
            <span className="text-[10px] sm:text-xs text-muted-foreground font-medium group-hover:text-primary transition-colors truncate w-full text-center">
              {brand.name}
            </span>
          </Link>
        ))}
      </div>

      {/* Mobile "ver todas" */}
      <div className="mt-4 sm:hidden">
        <Link
          to="/produtos"
          className="flex items-center justify-center gap-1 text-sm font-semibold text-primary border border-primary/30 rounded-xl py-2.5"
        >
          Ver todas as marcas <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
};
