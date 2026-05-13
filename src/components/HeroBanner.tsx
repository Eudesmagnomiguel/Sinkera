import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, Sparkles, Zap } from "lucide-react";
import { Link } from "react-router-dom";

gsap.registerPlugin(ScrollTrigger);

export const HeroBanner = () => {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rootRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".hb-reveal", {
        y: 30,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.1,
        scrollTrigger: { trigger: rootRef.current, start: "top 80%" },
      });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={rootRef} className="relative">
      <div className="relative overflow-hidden rounded-[2rem] border border-white/40 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 shadow-[0_30px_80px_-20px_hsl(240_60%_30%/0.45)]">
        {/* Aurora glows */}
        <div className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-cyan-400/30 blur-[110px]" />
        <div className="absolute -bottom-32 -right-32 w-[520px] h-[520px] rounded-full bg-violet-500/35 blur-[120px]" />
        <div className="absolute top-1/3 left-1/2 w-[360px] h-[360px] -translate-x-1/2 rounded-full bg-fuchsia-500/20 blur-[100px]" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(hsl(0 0% 100% / 0.08) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100% / 0.08) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />

        <div className="relative grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center px-6 md:px-12 lg:px-16 py-12 md:py-16 lg:py-20">
          {/* Content */}
          <div className="space-y-6 text-white">
            <div className="hb-reveal inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-4 py-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              <span className="font-mono-accent text-[11px] uppercase tracking-[0.25em] text-white/85">
                Edição limitada · Black Week
              </span>
            </div>

            <h2 className="hb-reveal font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.05]">
              Até <span className="bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-violet-300 bg-clip-text text-transparent">-40%</span> em tecnologia premium
            </h2>

            <p className="hb-reveal text-base md:text-lg text-white/75 max-w-xl leading-relaxed">
              Smartphones, áudio, wearables e gaming com descontos reais. Stock limitado, entrega rápida em todo o país.
            </p>

            <div className="hb-reveal flex flex-wrap items-center gap-3 pt-2">
              <Link
                to="/produtos?category=promocoes"
                className="group inline-flex items-center gap-2 rounded-full bg-white text-slate-900 px-7 py-3.5 font-semibold text-sm md:text-base shadow-lg hover:shadow-cyan-300/30 transition-all"
              >
                Ver promoções
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/produtos"
                className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 backdrop-blur-md text-white px-7 py-3.5 font-semibold text-sm md:text-base hover:bg-white/15 transition-all"
              >
                Explorar tudo
              </Link>
            </div>

            <div className="hb-reveal flex flex-wrap gap-6 pt-4 text-xs text-white/70">
              <div className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-cyan-300" />
                Entrega 24-48h
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-fuchsia-300" />
                Garantia oficial
              </div>
            </div>
          </div>

          {/* Visual */}
          <div className="hb-reveal relative h-64 md:h-80 lg:h-[420px] hidden md:block">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-full h-full">
                <div className="absolute inset-8 rounded-[2rem] border border-white/20 bg-white/5 backdrop-blur-xl rotate-[-6deg] shadow-2xl" />
                <div className="absolute inset-12 rounded-[2rem] border border-white/30 bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-xl rotate-[4deg] shadow-2xl flex items-center justify-center overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800&h=800&fit=crop"
                    alt="Promoções tech"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Floating price chip */}
                <div className="absolute top-4 right-4 rounded-2xl border border-white/30 bg-white/15 backdrop-blur-xl px-4 py-3 shadow-xl animate-float-slow">
                  <p className="font-mono-accent text-[10px] uppercase tracking-wider text-white/70">Desde</p>
                  <p className="font-display text-2xl font-bold text-white">29.900 Kz</p>
                </div>
                <div className="absolute bottom-6 left-2 rounded-2xl border border-white/30 bg-gradient-to-br from-cyan-400/30 to-violet-500/30 backdrop-blur-xl px-4 py-2 shadow-xl animate-float-slow" style={{ animationDelay: "1.5s" }}>
                  <p className="font-mono-accent text-[10px] uppercase tracking-wider text-white font-semibold">-40% OFF</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
