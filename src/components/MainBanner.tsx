import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useBanners } from "@/hooks/useBanners";

export const MainBanner = () => {
  const { banners, loading } = useBanners();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % banners.length);
    }, 6000);
    return () => clearInterval(id);
  }, [banners.length]);

  if (loading) return (
    <div className="h-[320px] md:h-[420px] rounded-xl bg-gray-100 animate-pulse" />
  );

  if (banners.length === 0) {
    return (
      <section>
        <div className="relative overflow-hidden rounded-xl h-[280px] md:h-[380px] bg-gradient-to-r from-blue-800 via-blue-700 to-blue-900 flex items-center">
          <div className="px-8 md:px-16 text-white">
            <div className="inline-block bg-orange-600 text-white text-xs font-bold px-3 py-1.5 rounded-full mb-4 uppercase tracking-wider">
              Espaço Publicitário
            </div>
            <h2 className="text-2xl md:text-4xl font-bold mb-3">
              Adicione banners no painel Admin
            </h2>
            <p className="text-blue-200 text-sm md:text-base">
              Gerencie os seus banners em Admin → Banners
            </p>
          </div>
        </div>
      </section>
    );
  }

  const prev = () => setIndex((i) => (i - 1 + banners.length) % banners.length);
  const next = () => setIndex((i) => (i + 1) % banners.length);

  return (
    <section>
      <div className="relative overflow-hidden rounded-xl h-[280px] sm:h-[360px] md:h-[420px] lg:h-[460px] group shadow-md">

        {/* Slides */}
        {banners.map((b, i) => (
          <div
            key={b.id}
            className={`absolute inset-0 transition-opacity duration-700 ${
              i === index ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <img
              src={b.image_url}
              alt={b.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Dark overlay for readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-gray-950/85 via-gray-900/55 to-transparent" />

            {/* Content */}
            <div className="relative h-full flex items-center px-6 sm:px-10 md:px-14">
              <div className="max-w-lg space-y-4 text-white">
                {b.subtitle && (
                  <div className="inline-block bg-orange-600 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                    {b.subtitle}
                  </div>
                )}
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                  {b.title}
                </h2>
                {b.description && (
                  <p className="text-sm md:text-base text-gray-200 max-w-sm leading-relaxed">
                    {b.description}
                  </p>
                )}
                {b.cta_label && b.cta_link && (
                  <Link
                    to={b.cta_link}
                    className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-3 rounded-md transition-colors text-sm md:text-base shadow-lg"
                  >
                    {b.cta_label}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Navigation Arrows */}
        {banners.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Anterior"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm hover:bg-white/40 text-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={next}
              aria-label="Próximo"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm hover:bg-white/40 text-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
              {banners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  aria-label={`Slide ${i + 1}`}
                  className={`rounded-full transition-all ${
                    i === index
                      ? "w-6 h-2 bg-white"
                      : "w-2 h-2 bg-white/50 hover:bg-white/80"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};
