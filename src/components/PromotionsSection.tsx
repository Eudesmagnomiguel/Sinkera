import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

interface PromoBanner {
  id: string;
  title: string;
  description: string | null;
  badge: string | null;
  badge_color: string;
  bg_color: string;
  image_url: string | null;
  cta_label: string;
  cta_link: string;
  position: number;
}

// Fallback while DB not seeded
const FALLBACK: PromoBanner[] = [
  { id: '1', title: 'Envio Grátis',     description: 'Em compras acima de 50.000 Kz',     badge: 'Sem Limite',     badge_color: '#2563EB', bg_color: '#1B4FD8', image_url: null, cta_label: 'Comprar Agora',     cta_link: '/produtos', position: 0 },
  { id: '2', title: 'Até 50% OFF',      description: 'Em electrodomésticos e smartphones', badge: 'Tempo Limitado', badge_color: '#DC2626', bg_color: '#111827', image_url: null, cta_label: 'Ver Promoções',     cta_link: '/produtos', position: 1 },
  { id: '3', title: 'Oferta Relâmpago', description: 'Desconto de 30% — válido hoje',       badge: 'Hoje Só',        badge_color: '#EA580C', bg_color: '#431407', image_url: null, cta_label: 'Aproveitar Oferta', cta_link: '/produtos', position: 2 },
];

export const PromotionsSection = () => {
  const [banners, setBanners] = useState<PromoBanner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (supabase as any)
      .from('promo_banners')
      .select('*')
      .eq('is_active', true)
      .order('position')
      .then(({ data }: { data: PromoBanner[] | null }) => {
        setBanners(data && data.length > 0 ? data : FALLBACK);
        setLoading(false);
      })
      .catch(() => {
        setBanners(FALLBACK);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <section className="py-10">
        <div className="h-8 w-56 bg-muted rounded-lg animate-pulse mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="aspect-[4/3] rounded-xl bg-muted animate-pulse" />)}
        </div>
      </section>
    );
  }

  return (
    <section className="py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-foreground">
            Promoções <span className="text-red-600">Ativas</span>
          </h2>
          <p className="text-gray-500 dark:text-muted-foreground text-sm mt-1">Ofertas por tempo limitado — não perca</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {banners.map((promo) => (
          <Link
            key={promo.id}
            to={promo.cta_link || '/produtos'}
            className="relative overflow-hidden rounded-xl group cursor-pointer shadow-sm hover:shadow-lg transition-shadow duration-300 block"
          >
            <div className="aspect-[4/3] relative overflow-hidden">
              {/* Background colour */}
              <div className="absolute inset-0" style={{ backgroundColor: promo.bg_color }} />

              {/* Background image if set */}
              {promo.image_url && (
                <img
                  src={promo.image_url}
                  alt={promo.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              )}

              {/* Gradient overlay for readability */}
              <div
                className="absolute inset-0"
                style={{ background: `linear-gradient(to right, ${promo.bg_color}f0 0%, ${promo.bg_color}99 55%, transparent 100%)` }}
              />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-between p-5">
                <div>
                  {promo.badge && (
                    <span
                      className="text-white text-xs font-bold px-2.5 py-1 rounded uppercase tracking-wider"
                      style={{ backgroundColor: promo.badge_color }}
                    >
                      {promo.badge}
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-white text-xl sm:text-2xl font-bold leading-tight mb-1 drop-shadow">
                    {promo.title}
                  </h3>
                  {promo.description && (
                    <p className="text-white/85 text-sm mb-4 drop-shadow">{promo.description}</p>
                  )}
                  <button className="inline-flex items-center gap-2 bg-white text-gray-900 font-bold text-sm px-4 py-2.5 rounded-md hover:bg-gray-100 transition-colors group/btn shadow-md">
                    {promo.cta_label || 'Ver Promoções'}
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5" />
                  </button>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};
