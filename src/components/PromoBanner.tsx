import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

interface PromoBannerProps {
  title: string;
  subtitle?: string;
  description: string;
  price?: string;
  image: string;
  variant?: "dark" | "light" | "blue";
  reverse?: boolean;
}

export const PromoBanner = ({
  title,
  subtitle,
  description,
  price,
  image,
  variant = "dark",
  reverse = false,
}: PromoBannerProps) => {
  const ref = useScrollReveal<HTMLDivElement>({ selector: ".reveal-promo", stagger: 0.1, y: 40 });

  const variantClasses = {
    dark: "bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white",
    light: "bg-gradient-to-br from-slate-50 via-white to-slate-100 text-foreground",
    blue: "bg-gradient-to-br from-blue-700 via-blue-600 to-violet-700 text-white",
  };
  const isLight = variant === "light";

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden rounded-[2rem] shadow-[0_30px_80px_-20px_hsl(220_60%_30%/0.3)] ${variantClasses[variant]}`}
    >
      {/* Decorative orbs */}
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-gradient-to-br from-cyan-400/30 to-violet-500/30 blur-3xl" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-gradient-to-br from-violet-400/20 to-blue-500/20 blur-3xl" />
      <div className="absolute inset-0 grid-pattern opacity-20" />

      <div className="container relative mx-auto px-8 lg:px-16 py-20">
        <div className={`grid lg:grid-cols-2 gap-12 items-center ${reverse ? "lg:grid-flow-col-dense" : ""}`}>
          {/* Content */}
          <div className={`space-y-6 ${reverse ? "lg:col-start-2" : ""}`}>
            {subtitle && (
              <p className={`reveal-promo font-mono-accent text-xs uppercase tracking-[0.25em] ${isLight ? "text-violet-600" : "text-cyan-300"}`}>
                {subtitle}
              </p>
            )}
            <h2 className="reveal-promo font-display text-4xl lg:text-6xl font-bold leading-[1.05]">
              {title}
            </h2>
            <p className={`reveal-promo text-lg max-w-md leading-relaxed ${isLight ? "text-muted-foreground" : "text-white/75"}`}>
              {description}
            </p>
            {price && (
              <div className="reveal-promo space-y-1">
                <p className={`text-xs font-mono-accent uppercase tracking-wider ${isLight ? "text-muted-foreground" : "text-white/60"}`}>
                  A partir de
                </p>
                <p className="font-display text-4xl font-bold">{price}</p>
              </div>
            )}
            <div className="reveal-promo">
              <Button
                size="lg"
                className={`group rounded-full px-8 py-6 text-base font-semibold transition-all ${
                  isLight
                    ? "bg-foreground text-background hover:bg-foreground/90"
                    : "bg-white text-slate-900 hover:bg-white/90"
                }`}
              >
                Comprar agora
                <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </div>

          {/* Image */}
          <div className={`reveal-promo relative h-80 lg:h-96 ${reverse ? "lg:col-start-1 lg:row-start-1" : ""}`}>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3/4 h-3/4 rounded-full bg-white/10 blur-2xl" />
            </div>
            <img
              src={image}
              alt={title}
              className="relative h-full w-full object-contain drop-shadow-[0_25px_45px_rgba(0,0,0,0.4)] animate-float-slow"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
