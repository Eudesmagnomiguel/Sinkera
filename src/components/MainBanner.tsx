import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useBanners } from "@/hooks/useBanners";

export const MainBanner = () => {
  const { banners, loading } = useBanners();
  const [index,   setIndex]   = useState(0);
  const [dir,     setDir]     = useState<'next' | 'prev'>('next');
  const [sliding, setSliding] = useState(false);

  const goTo = useCallback((next: number, direction: 'next' | 'prev') => {
    if (sliding || next === index) return;
    setDir(direction);
    setSliding(true);
    setTimeout(() => { setIndex(next); setSliding(false); }, 440);
  }, [sliding, index]);

  const prev = useCallback(() => goTo((index - 1 + banners.length) % banners.length, 'prev'), [goTo, index, banners.length]);
  const next = useCallback(() => goTo((index + 1) % banners.length, 'next'),            [goTo, index, banners.length]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const id = setInterval(next, 6000);
    return () => clearInterval(id);
  }, [banners.length, index, sliding]);

  if (loading) return <div className="h-[320px] md:h-[460px] rounded-xl bg-muted animate-pulse" />;
  if (banners.length === 0) return null;

  return (
    <section>
      <div className="relative overflow-hidden rounded-xl h-[280px] sm:h-[360px] md:h-[420px] lg:h-[460px] group shadow-md select-none">

        {banners.map((b, i) => {
          const isActive  = i === index;
          const isIncoming = i === (dir === 'next' ? (index + 1) % banners.length : (index - 1 + banners.length) % banners.length);

          let translate = dir === 'next' ? 'translate-x-full' : '-translate-x-full';
          if (isActive)    translate = sliding ? translate : 'translate-x-0';
          if (isIncoming && sliding) translate = 'translate-x-0';
          if (isActive && !sliding)  translate = 'translate-x-0';

          return (
            <div
              key={b.id}
              className={`absolute inset-0 transition-transform duration-[440ms] ease-in-out ${translate}`}
            >
              <img src={b.image_url} alt={b.title} className="absolute inset-0 w-full h-full object-cover" draggable={false} />
              <div className="absolute inset-0 bg-gradient-to-r from-gray-950/88 via-gray-900/55 to-transparent" />
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                   style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

              <div className="relative h-full flex items-center px-6 sm:px-10 md:px-14">
                <div className="max-w-lg space-y-4 text-white">
                  {b.subtitle && (
                    <p className="text-[10px] font-bold tracking-[0.3em] uppercase" style={{ color: 'hsl(22 100% 55%)' }}>
                      {b.subtitle}
                    </p>
                  )}
                  <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[52px] font-black leading-[1.08] tracking-tight">
                    {b.title.split('\n').map((line, j) => <span key={j} className="block">{line}</span>)}
                  </h2>
                  {b.description && (
                    <p className="text-sm md:text-base text-white/55 max-w-sm leading-relaxed font-light">{b.description}</p>
                  )}
                  {b.cta_label && b.cta_link && (
                    <div className="pt-1">
                      <Link
                        to={b.cta_link}
                        className="inline-flex items-center gap-2 font-bold px-7 py-3.5 rounded-xl text-sm text-white shadow-lg shadow-black/30 transition-colors"
                        style={{ background: 'hsl(22 100% 46%)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'hsl(22 100% 40%)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'hsl(22 100% 46%)'}
                      >
                        {b.cta_label} <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Arrows */}
        {banners.length > 1 && (
          <>
            <button onClick={prev} aria-label="Anterior"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/25 backdrop-blur-sm hover:bg-black/50 text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 z-10">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={next} aria-label="Próximo"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/25 backdrop-blur-sm hover:bg-black/50 text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 z-10">
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Dots */}
        {banners.length > 1 && (
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {banners.map((_, i) => (
              <button key={i} onClick={() => goTo(i, i > index ? 'next' : 'prev')} aria-label={`Slide ${i + 1}`}
                className="rounded-full transition-all duration-300"
                style={{ width: i === index ? 28 : 8, height: 8, background: i === index ? 'hsl(22 100% 46%)' : 'rgba(255,255,255,0.35)' }} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
