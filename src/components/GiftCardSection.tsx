import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Gift, Star, Sparkles, Check, ArrowRight, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CARDS = [
  {
    id: 1,
    value: 20000,
    label: "Starter",
    icon: Gift,
    gradient: "from-violet-500 via-purple-500 to-indigo-600",
    glowColor: "shadow-violet-500/30",
    ring: "ring-violet-200 dark:ring-violet-800",
    popular: false,
    perks: ["Válido por 12 meses", "Entrega instantânea", "Personalizável"],
    emoji: "🎁",
  },
  {
    id: 2,
    value: 50000,
    label: "Popular",
    icon: Star,
    gradient: "from-pink-500 via-rose-500 to-orange-500",
    glowColor: "shadow-pink-500/40",
    ring: "ring-pink-400 dark:ring-pink-600",
    popular: true,
    perks: ["Válido por 12 meses", "Entrega instantânea", "Personalizável", "Desconto exclusivo"],
    emoji: "⭐",
  },
  {
    id: 3,
    value: 100000,
    label: "Premium",
    icon: Heart,
    gradient: "from-blue-500 via-cyan-500 to-teal-500",
    glowColor: "shadow-blue-500/30",
    ring: "ring-blue-200 dark:ring-blue-800",
    popular: false,
    perks: ["Válido por 18 meses", "Entrega instantânea", "Personalizável", "Embalagem especial"],
    emoji: "💎",
  },
];

export const GiftCardSection = () => {
  const [selected, setSelected] = useState<number | null>(null);
  const { toast } = useToast();

  const handleBuy = (card: typeof CARDS[0]) => {
    toast({
      title: `Cartão de ${card.value.toLocaleString()} Kz`,
      description: "Funcionalidade de compra em breve disponível.",
    });
  };

  return (
    <section className="py-14 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-background to-pink-50 dark:from-violet-950/20 dark:via-background dark:to-pink-950/20 pointer-events-none" />

      <div className="relative">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wide mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Cartão Presente
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-3">
            O presente perfeito
            <span className="block bg-gradient-to-r from-violet-600 to-pink-500 bg-clip-text text-transparent">
              para quem você ama
            </span>
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Ofereça a liberdade de escolher. Envio digital instantâneo, válido em toda a loja Sinkera.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
          {CARDS.map((card) => {
            const isSelected = selected === card.id;
            return (
              <div
                key={card.id}
                onClick={() => setSelected(isSelected ? null : card.id)}
                className={`relative group cursor-pointer rounded-3xl overflow-hidden transition-all duration-300 ${
                  card.popular ? `ring-2 ${card.ring} shadow-xl ${card.glowColor}` : "hover:shadow-xl"
                } ${isSelected ? `ring-2 ${card.ring} scale-[1.02] shadow-xl ${card.glowColor}` : "hover:scale-[1.01]"}`}
              >
                {/* Popular badge */}
                {card.popular && (
                  <div className="absolute top-4 right-4 z-20">
                    <span className="bg-white/20 backdrop-blur-sm text-white text-[10px] font-extrabold px-3 py-1 rounded-full border border-white/30">
                      MAIS POPULAR
                    </span>
                  </div>
                )}

                {/* Gradient card face */}
                <div className={`relative h-44 bg-gradient-to-br ${card.gradient} flex flex-col items-center justify-center overflow-hidden`}>
                  {/* Decorative circles */}
                  <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/10" />
                  <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-black/10" />
                  <div className="absolute top-4 left-4 w-8 h-8 rounded-full bg-white/15" />

                  <span className="text-5xl mb-2 drop-shadow-lg relative z-10">{card.emoji}</span>
                  <p className="text-white/80 text-sm font-semibold uppercase tracking-widest relative z-10">
                    {card.label}
                  </p>
                  <p className="text-white text-3xl font-black mt-1 relative z-10 drop-shadow">
                    {card.value.toLocaleString()} Kz
                  </p>

                  {/* Sinkera watermark */}
                  <div className="absolute bottom-3 right-4 text-white/20 text-xs font-bold uppercase tracking-widest">
                    SINKERA
                  </div>
                </div>

                {/* Card content */}
                <div className="bg-card p-5 space-y-4 border-x border-b border-border rounded-b-3xl">
                  <ul className="space-y-2">
                    {card.perks.map((p) => (
                      <li key={p} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                          <Check className="w-2.5 h-2.5 text-emerald-600" />
                        </span>
                        {p}
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={(e) => { e.stopPropagation(); handleBuy(card); }}
                    className={`w-full h-11 rounded-2xl font-bold gap-2 bg-gradient-to-r ${card.gradient} border-0 text-white hover:opacity-90 shadow-md transition-all`}
                  >
                    Comprar Cartão
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom note */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          O cartão presente é enviado por e-mail imediatamente após o pagamento. Válido em todos os produtos da loja.
        </p>
      </div>
    </section>
  );
};
