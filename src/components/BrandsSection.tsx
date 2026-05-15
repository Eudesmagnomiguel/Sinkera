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

const SLUG_TO_DOMAIN: Record<string, string> = {
  'apple': 'apple.com',
  'samsung': 'samsung.com',
  'sony': 'sony.com',
  'lg': 'lg.com',
  'huawei': 'huawei.com',
  'xiaomi': 'mi.com',
  'mi': 'mi.com',
  'dell': 'dell.com',
  'hp': 'hp.com',
  'lenovo': 'lenovo.com',
  'asus': 'asus.com',
  'acer': 'acer.com',
  'microsoft': 'microsoft.com',
  'google': 'google.com',
  'canon': 'canon.com',
  'philips': 'philips.com',
  'panasonic': 'panasonic.com',
  'jbl': 'jbl.com',
  'bose': 'bose.com',
  'nintendo': 'nintendo.com',
  'playstation': 'playstation.com',
  'xbox': 'xbox.com',
  'oppo': 'oppo.com',
  'oneplus': 'oneplus.com',
  'realme': 'realme.com',
  'tecno': 'tecno-mobile.com',
  'infinix': 'infinixmobility.com',
  'itel': 'itel-mobile.com',
  'toshiba': 'toshiba.com',
  'hisense': 'hisense.com',
  'tcl': 'tcl.com',
  'haier': 'haier.com',
  'epson': 'epson.com',
  'logitech': 'logitech.com',
  'intel': 'intel.com',
  'amd': 'amd.com',
  'nvidia': 'nvidia.com',
  'anker': 'anker.com',
  'tp-link': 'tp-link.com',
  'tplink': 'tp-link.com',
};

function getBrandLogo(brand: Brand): string | null {
  if (brand.logo_url) return brand.logo_url;
  const domain = SLUG_TO_DOMAIN[brand.slug.toLowerCase()];
  return domain ? `https://logo.clearbit.com/${domain}` : null;
}

export const BrandsSection = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (supabase as any)
      .from('brands')
      .select('id, name, slug, logo_url, is_featured')
      .order('name')
      .then(({ data }: { data: Brand[] | null }) => {
        setBrands(data && data.length > 0 ? data : FALLBACK);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <section className="py-8">
        <div className="h-7 w-48 bg-muted rounded-lg animate-pulse mb-5" />
        <div className="flex gap-3 overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-28 h-16 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  // Duplicate for seamless infinite loop
  const track = [...brands, ...brands, ...brands];

  return (
    <section className="py-8">
      <style>{`
        @keyframes brands-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        .brands-track {
          animation: brands-scroll ${Math.max(brands.length * 3, 18)}s linear infinite;
        }
        .brands-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* Header */}
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
          Ver todas <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Marquee */}
      <div className="overflow-hidden relative">
        {/* Fade edges */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 z-10 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 z-10 bg-gradient-to-l from-background to-transparent" />

        <div className="brands-track flex gap-3 w-max">
          {track.map((brand, idx) => (
            <Link
              key={`${brand.id}-${idx}`}
              to={`/produtos?brand=${brand.slug}`}
              className="group flex-shrink-0 flex flex-col items-center justify-center gap-2 px-5 py-3 bg-card border border-border rounded-xl hover:border-primary/40 hover:shadow-md transition-all duration-200 min-w-[100px]"
            >
              {getBrandLogo(brand) ? (
                <img
                  src={getBrandLogo(brand)!}
                  alt={brand.name}
                  className="h-8 w-auto max-w-[72px] object-contain group-hover:scale-110 transition-transform duration-200"
                  onError={(e) => {
                    const img = e.currentTarget as HTMLImageElement;
                    img.style.display = 'none';
                    const span = img.nextElementSibling as HTMLElement;
                    if (span) span.style.display = 'block';
                  }}
                />
              ) : null}
              <span
                className="text-sm font-black text-foreground/70 group-hover:text-primary transition-colors text-center leading-tight"
                style={{ display: getBrandLogo(brand) ? 'none' : 'block' }}
              >
                {brand.name}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium group-hover:text-primary transition-colors">
                {brand.name}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile link */}
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
