import { ArrowRight, ShieldCheck, Truck, Award, Headphones } from "lucide-react";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useNavigate } from "react-router-dom";

const heroProducts = [
  {
    label: "Smartphones",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=300&fit=crop",
    badge: "Novo",
    badgeColor: "bg-blue-600",
  },
  {
    label: "Laptops",
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&h=300&fit=crop",
    badge: "-20%",
    badgeColor: "bg-red-600",
  },
  {
    label: "Headphones",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop",
    badge: "Top",
    badgeColor: "bg-orange-600",
  },
  {
    label: "Smart TV",
    image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=300&h=300&fit=crop",
    badge: "-15%",
    badgeColor: "bg-red-600",
  },
];

const trustItems = [
  { icon: Truck, text: "Entrega em Angola" },
  { icon: ShieldCheck, text: "Garantia Oficial" },
  { icon: Award, text: "Produtos Originais" },
  { icon: Headphones, text: "Suporte 24/7" },
];

export const HeroSection = () => {
  const navigate = useNavigate();
  const contentRef = useRef<HTMLDivElement>(null);
  const productsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from(".hero-eyebrow", { y: 20, opacity: 0, duration: 0.6 })
        .from(".hero-title", { y: 30, opacity: 0, duration: 0.7, stagger: 0.1 }, "-=0.3")
        .from(".hero-desc", { y: 20, opacity: 0, duration: 0.6 }, "-=0.4")
        .from(".hero-cta", { y: 20, opacity: 0, duration: 0.5, stagger: 0.1 }, "-=0.3")
        .from(".hero-trust-item", { y: 15, opacity: 0, duration: 0.4, stagger: 0.07 }, "-=0.2")
        .from(".hero-product-card", { scale: 0.9, opacity: 0, duration: 0.5, stagger: 0.08 }, 0.2);
    });

    return () => ctx.revert();
  }, []);

  return (
    <section className="relative bg-gradient-to-br from-[hsl(221,90%,11%)] via-[hsl(221,83%,22%)] to-[hsl(221,83%,36%)] text-white overflow-hidden">

      <div className="container mx-auto px-4 py-10 lg:py-16 relative z-10">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* Left: Content */}
          <div ref={contentRef} className="space-y-6">

            {/* Title */}
            <h1 className="space-y-1">
              <span className="hero-title block text-4xl sm:text-5xl lg:text-[62px] font-black leading-[1.05] tracking-tight text-white">
                Tecnologia Premium
              </span>
              <span className="hero-title block text-4xl sm:text-5xl lg:text-[62px] font-black leading-[1.05] tracking-tight text-[hsl(var(--cta-orange))]">
                ao Melhor Preço
              </span>
              <span className="hero-title block text-xl sm:text-2xl font-normal leading-tight text-white/55 mt-2">
                Entrega em toda Angola
              </span>
            </h1>

            {/* Description */}
            <p className="hero-desc text-base lg:text-lg text-white/65 max-w-xl leading-relaxed font-light">
              Smartphones, computadores, TVs e gadgets de marcas originais com garantia
              oficial. Os melhores preços do mercado e suporte dedicado.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => navigate("/produtos")}
                className="hero-cta inline-flex items-center gap-2 bg-[hsl(var(--cta-orange))] hover:bg-[hsl(var(--cta-orange-hover))] text-white font-bold px-7 py-3.5 rounded-xl transition-colors text-base shadow-lg shadow-black/30"
              >
                Ver Todos os Produtos
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate("/produtos?category=promocoes")}
                className="hero-cta inline-flex items-center gap-2 border border-white/30 hover:border-white/60 hover:bg-white/8 text-white font-medium px-7 py-3.5 rounded-xl transition-colors text-base"
              >
                Ver Promoções
              </button>
            </div>

            {/* Trust Signals */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-2">
              {trustItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.text} className="hero-trust-item flex items-center gap-1.5 text-[13px] text-white/60">
                    <Icon className="w-3.5 h-3.5 text-[hsl(var(--cta-orange))] flex-shrink-0" />
                    <span>{item.text}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Product Showcase Grid */}
          <div ref={productsRef} className="grid grid-cols-2 gap-3 sm:gap-4">
            {heroProducts.map((product, i) => (
              <button
                key={i}
                onClick={() => navigate("/produtos")}
                className="hero-product-card group relative bg-white/8 hover:bg-white/14 border border-white/12 hover:border-white/28 rounded-2xl p-3 sm:p-4 transition-all duration-300 text-left overflow-hidden"
              >
                {/* Badge */}
                <span className={`absolute top-2 left-2 ${product.badgeColor} text-white text-[10px] font-bold px-1.5 py-0.5 rounded z-10`}>
                  {product.badge}
                </span>

                {/* Image */}
                <div className="aspect-square mb-2 overflow-hidden rounded-xl bg-white/5 flex items-center justify-center">
                  <img
                    src={product.image}
                    alt={product.label}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Label */}
                <div className="text-white text-xs sm:text-sm font-semibold tracking-tight">
                  {product.label}
                </div>
                <div className="text-white/45 text-xs mt-0.5">
                  Ver produtos →
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
