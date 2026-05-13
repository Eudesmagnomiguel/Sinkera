import { Tag, Clock, Zap, ArrowRight } from "lucide-react";
import promoFreeShipping from "@/assets/promo-free-shipping.jpg";
import promoBlackFriday from "@/assets/promo-black-friday.jpg";
import promoFlashSale from "@/assets/promo-flash-sale.jpg";

export const PromotionsSection = () => {
  const promotions = [
    {
      id: 1,
      title: "Envio Grátis",
      description: "Em compras acima de 50.000 Kz",
      cta: "Comprar Agora",
      badge: "Sem Limite",
      badgeColor: "bg-blue-600",
      image: promoFreeShipping,
      accent: "#1B4FD8",
      overlay: "from-blue-900/90 via-blue-800/60",
    },
    {
      id: 2,
      title: "Até 50% OFF",
      description: "Em electrodomésticos e smartphones",
      cta: "Ver Promoções",
      badge: "Tempo Limitado",
      badgeColor: "bg-red-600",
      image: promoBlackFriday,
      accent: "#DC2626",
      overlay: "from-gray-950/90 via-gray-900/60",
    },
    {
      id: 3,
      title: "Oferta Relâmpago",
      description: "Desconto de 30% — válido hoje",
      cta: "Aproveitar Oferta",
      badge: "Hoje Só",
      badgeColor: "bg-orange-600",
      image: promoFlashSale,
      accent: "#EA580C",
      overlay: "from-orange-950/90 via-orange-900/60",
    },
  ];

  return (
    <section className="py-10">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Promoções <span className="text-red-600">Ativas</span>
          </h2>
          <p className="text-gray-500 text-sm mt-1">Ofertas por tempo limitado — não perca</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {promotions.map((promo) => (
          <div
            key={promo.id}
            className="relative overflow-hidden rounded-xl group cursor-pointer shadow-sm hover:shadow-lg transition-shadow duration-300"
          >
            {/* Background Image */}
            <div className="aspect-[4/3] relative overflow-hidden">
              <img
                src={promo.image}
                alt={promo.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {/* Gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-r ${promo.overlay} to-transparent`} />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-between p-5">
                {/* Badge */}
                <div>
                  <span className={`${promo.badgeColor} text-white text-xs font-bold px-2.5 py-1 rounded uppercase tracking-wider`}>
                    {promo.badge}
                  </span>
                </div>

                {/* Text */}
                <div>
                  <h3 className="text-white text-xl sm:text-2xl font-bold leading-tight mb-1">
                    {promo.title}
                  </h3>
                  <p className="text-white/80 text-sm mb-4">{promo.description}</p>

                  <button className="inline-flex items-center gap-2 bg-white text-gray-900 font-bold text-sm px-4 py-2.5 rounded-md hover:bg-gray-100 transition-colors group/btn">
                    {promo.cta}
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
