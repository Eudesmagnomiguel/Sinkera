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

const FALLBACK: PromoBanner[] = [
  { id: '1', title: 'Envio Grátis',     description: 'Em compras acima de 50.000 Kz',     badge: 'Sem Limite',     badge_color: '#2563EB', bg_color: '#0d1117', image_url: null, cta_label: 'Comprar Agora',     cta_link: '/produtos', position: 0 },
  { id: '2', title: 'Até 50% OFF',      description: 'Em electrodomésticos e smartphones', badge: 'Tempo Limitado', badge_color: '#DC2626', bg_color: '#0d1117', image_url: null, cta_label: 'Ver Promoções',     cta_link: '/produtos', position: 1 },
  { id: '3', title: 'Oferta Relâmpago', description: 'Desconto de 30% — válido hoje',       badge: 'Hoje Só',        badge_color: '#EA580C', bg_color: '#0d1117', image_url: null, cta_label: 'Aproveitar Oferta', cta_link: '/produtos', position: 2 },
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
        <div className="h-8 w-48 bg-muted rounded animate-pulse mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[1, 2, 3].map(i => <div key={i} className="aspect-[3/4] bg-muted animate-pulse" />)}
        </div>
      </section>
    );
  }

  return (
    <section className="py-10">

      {/* Cabeçalho */}
      <div className="flex items-end justify-between mb-8 gap-4">
        <div>
          <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-muted-foreground mb-1.5">
            Ofertas
          </p>
          <h2 className="text-2xl sm:text-3xl font-black text-foreground leading-tight tracking-tight">
            Promoções Ativas
          </h2>
        </div>
        <Link
          to="/produtos"
          className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap group"
        >
          Ver todas
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {/* Grid de cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {banners.map((promo, idx) => (
          <Link
            key={promo.id}
            to={promo.cta_link || '/produtos'}
            className="relative overflow-hidden group block"
            style={{ background: "#0d1117" }}
          >
            {/* Imagem de fundo */}
            {promo.image_url && (
              <img
                src={promo.image_url}
                alt={promo.title}
                className="absolute inset-0 w-full h-full object-cover opacity-40 transition-all duration-700 group-hover:opacity-50 group-hover:scale-[1.03]"
              />
            )}

            {/* Overlay gradiente da plataforma */}
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(160deg, hsl(221,90%,9%) 0%, hsl(221,83%,14%)aa 50%, transparent 100%)",
              }}
            />

            {/* Borda fina no hover */}
            <div className="absolute inset-0 border border-white/0 group-hover:border-white/10 transition-all duration-300" />

            {/* Linha superior decorativa */}
            <div
              className="absolute top-0 left-0 right-0 h-[1px]"
              style={{ background: "linear-gradient(90deg, hsl(var(--cta-orange)), transparent)" }}
            />

            {/* Conteúdo */}
            <div className="relative flex flex-col p-6 min-h-[210px]">

              {/* Topo: badge + número */}
              <div className="flex items-start justify-between mb-4">
                {promo.badge ? (
                  <span
                    className="text-[9px] font-black tracking-[0.22em] uppercase px-2.5 py-1 text-white"
                    style={{ backgroundColor: promo.badge_color }}
                  >
                    {promo.badge}
                  </span>
                ) : <span />}
                <span className="text-[11px] font-mono text-white/15">
                  {String(idx + 1).padStart(2, "0")}
                </span>
              </div>

              {/* Título + descrição — logo após o badge */}
              <h3 className="text-white text-xl font-black leading-tight tracking-tight mb-1.5">
                {promo.title}
              </h3>
              {promo.description && (
                <p className="text-white/50 text-[13px] leading-relaxed mb-0">
                  {promo.description}
                </p>
              )}

              {/* CTA empurrado para o fundo */}
              <div className="mt-auto pt-5">
                <span className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.15em] uppercase text-white/60 group-hover:text-white transition-colors duration-200">
                  {promo.cta_label || 'Ver Promoções'}
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1 duration-200" />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};
