import {
  Smartphone, Camera, Laptop, Headphones, Gamepad2, Watch,
  ChevronLeft, ChevronRight, Tablet, Tv, Printer, Speaker,
  Keyboard, Mouse, Cable, Battery, HardDrive, Monitor, ShoppingBag
} from "lucide-react";
import { useRef } from "react";
import { useCategories } from "@/hooks/useCategories";
import { useNavigate } from "react-router-dom";

export const CategoriesSection = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { categories: dbCategories, loading } = useCategories();
  const navigate = useNavigate();

  const iconMap: Record<string, any> = {
    "eletronicos": Laptop,
    "moda": ShoppingBag,
    "casa-decoracao": Monitor,
    "esportes": Gamepad2,
    "beleza": Watch,
    "livros": Tablet,
    "smartphones": Smartphone,
    "tablets": Tablet,
    "computadores": Laptop,
    "televisores": Tv,
    "consolas": Gamepad2,
    "acessorios-tech": Cable,
    "impressoras": Printer,
    "armazenamento": HardDrive,
    "rede": Cable,
    "drones": Camera,
    "fotografia": Camera,
    "smartwatches": Watch,
    "headphones": Headphones,
    "colunas": Speaker,
    "carregadores": Battery,
    "projetores": Monitor,
    "gaming": Gamepad2,
    "escritorio": Keyboard,
  };

  const imageMap: Record<string, string> = {
    "eletronicos": "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=300&h=300&fit=crop",
    "moda": "https://images.unsplash.com/photo-1445205170230-053b83016050?w=300&h=300&fit=crop",
    "casa-decoracao": "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=300&h=300&fit=crop",
    "esportes": "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=300&h=300&fit=crop",
    "smartphones": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=300&fit=crop",
    "tablets": "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=300&h=300&fit=crop",
    "computadores": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&h=300&fit=crop",
    "televisores": "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=300&h=300&fit=crop",
    "consolas": "https://images.unsplash.com/photo-1486401899868-0e435ed85128?w=300&h=300&fit=crop",
    "acessorios-tech": "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=300&h=300&fit=crop",
    "impressoras": "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=300&h=300&fit=crop",
    "armazenamento": "https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=300&h=300&fit=crop",
    "rede": "https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=300&h=300&fit=crop",
    "drones": "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=300&h=300&fit=crop",
    "fotografia": "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=300&h=300&fit=crop",
    "smartwatches": "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=300&h=300&fit=crop",
    "headphones": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop",
    "colunas": "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300&h=300&fit=crop",
    "carregadores": "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=300&h=300&fit=crop",
    "projetores": "https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?w=300&h=300&fit=crop",
    "gaming": "https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=300&h=300&fit=crop",
    "escritorio": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=300&h=300&fit=crop",
  };

  const handleCategoryClick = (categoryId: string) => {
    navigate(`/produtos?category=${categoryId}`);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -280 : 280,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="py-10">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Comprar por <span className="text-blue-700">Categoria</span>
          </h2>
          <p className="text-gray-500 text-sm mt-1">Encontre exatamente o que procura</p>
        </div>
        <button
          onClick={() => navigate("/produtos")}
          className="hidden sm:flex items-center gap-1 text-blue-700 hover:text-blue-900 text-sm font-semibold transition-colors"
        >
          Ver todos
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Scroll Container */}
      <div className="relative group">
        {/* Left Arrow */}
        <button
          onClick={() => scroll('left')}
          className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white border border-gray-200 rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 hover:border-blue-300 transition-all opacity-0 group-hover:opacity-100"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>

        {/* Right Arrow */}
        <button
          onClick={() => scroll('right')}
          className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white border border-gray-200 rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 hover:border-blue-300 transition-all opacity-0 group-hover:opacity-100"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>

        {/* Categories Row */}
        <div
          ref={scrollContainerRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth pb-2 snap-x"
        >
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-[120px] sm:w-[140px] snap-start">
                <div className="aspect-square bg-gray-100 rounded-xl animate-pulse mb-2" />
                <div className="h-3 bg-gray-100 rounded animate-pulse mx-2" />
              </div>
            ))
          ) : (
            dbCategories
              .filter(cat => cat.id !== 'all')
              .map((category) => {
                const Icon = iconMap[category.slug] || ShoppingBag;
                const image = imageMap[category.slug] || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop";

                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category.id)}
                    className="flex-shrink-0 w-[120px] sm:w-[140px] snap-start group/cat text-center"
                  >
                    {/* Image */}
                    <div className="category-card aspect-square mb-2 overflow-hidden">
                      <img
                        src={image}
                        alt={category.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover/cat:scale-105"
                      />
                    </div>

                    {/* Label */}
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-800 group-hover/cat:text-blue-700 transition-colors leading-tight px-1">
                      {category.name}
                    </h3>
                    {category.count > 0 && (
                      <span className="text-[10px] text-gray-400 mt-0.5 block">
                        {category.count} produtos
                      </span>
                    )}
                  </button>
                );
              })
          )}
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
};
