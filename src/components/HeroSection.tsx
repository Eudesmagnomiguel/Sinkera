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
    <section className="relative bg-gradient-to-br from-[#0f2671] via-[#1545b8] to-[#1a3d8f] text-white overflow-hidden">
      {/* Subtle pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="container mx-auto px-4 py-10 lg:py-16 relative z-10">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* Left: Content */}
          <div ref={contentRef} className="space-y-6">

            {/* Eyebrow */}
            <div className="hero-eyebrow inline-flex items-center gap-2 bg-orange-600 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-300 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-200" />
              </span>
              Ofertas Especiais · Sinkera 2026
            </div>

            {/* Title */}
            <h1 className="space-y-1">
              <span className="hero-title block text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-white">
                Tecnologia Premium
              </span>
              <span className="hero-title block text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-orange-400">
                ao Melhor Preço
              </span>
              <span className="hero-title block text-xl sm:text-2xl lg:text-3xl font-medium leading-tight text-blue-200 mt-1">
                Entrega em todo Angola
              </span>
            </h1>

            {/* Description */}
            <p className="hero-desc text-base lg:text-lg text-blue-100 max-w-xl leading-relaxed">
              Smartphones, computadores, TVs e gadgets de marcas originais com garantia
              oficial. Os melhores preços do mercado e suporte dedicado.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => navigate("/produtos")}
                className="hero-cta inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-bold px-7 py-3.5 rounded-md transition-colors text-base shadow-lg shadow-orange-900/30"
              >
                Ver Todos os Produtos
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate("/produtos?category=promocoes")}
                className="hero-cta inline-flex items-center gap-2 border-2 border-white/40 hover:border-white text-white font-semibold px-7 py-3.5 rounded-md transition-colors text-base"
              >
                Ver Promoções
              </button>
            </div>

            {/* Trust Signals */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/20">
              {trustItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.text} className="hero-trust-item flex items-center gap-2 text-sm text-blue-100">
                    <Icon className="w-4 h-4 text-orange-400 flex-shrink-0" />
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
                className="hero-product-card group relative bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 rounded-xl p-3 sm:p-4 transition-all duration-200 text-left overflow-hidden"
              >
                {/* Badge */}
                <span className={`absolute top-2 left-2 ${product.badgeColor} text-white text-[10px] font-bold px-1.5 py-0.5 rounded z-10`}>
                  {product.badge}
                </span>

                {/* Image */}
                <div className="aspect-square mb-2 overflow-hidden rounded-lg bg-white/5 flex items-center justify-center">
                  <img
                    src={product.image}
                    alt={product.label}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Label */}
                <div className="text-white text-xs sm:text-sm font-semibold">
                  {product.label}
                </div>
                <div className="text-blue-300 text-xs mt-0.5">
                  Ver produtos →
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Stats Bar */}
        <div className="mt-10 pt-8 border-t border-white/20 grid grid-cols-3 gap-4 max-w-lg">
          {[
            { value: "10.000+", label: "Produtos" },
            { value: "24/7", label: "Suporte" },
            { value: "48h", label: "Entrega" },
          ].map((stat) => (
            <div key={stat.label} className="text-center sm:text-left">
              <div className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</div>
              <div className="text-sm text-blue-300">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
