import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, TrendingUp, Tag, Flame, ArrowRight } from "lucide-react";
import { SEO } from "@/components/SEO";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { CategoriesSection } from "@/components/CategoriesSection";
import { ProductSection } from "@/components/ProductSection";
import { PromoBanner } from "@/components/PromoBanner";
import { PromotionsSection } from "@/components/PromotionsSection";
import { ShortVideosSection } from "@/components/ShortVideosSection";
import { BrandsSection } from "@/components/BrandsSection";
import { FeaturesBar } from "@/components/FeaturesBar";
import { NewsSection } from "@/components/NewsSection";
import { Footer } from "@/components/Footer";
import { useProducts } from "@/hooks/useProducts";
import { HighlightSplit } from "@/components/HighlightSplit";
import { MainBanner } from "@/components/MainBanner";
import { FlashSaleSection } from "@/components/FlashSaleSection";
import { RecentlyViewedSection } from "@/components/RecentlyViewedSection";

const PartnerBanner = () => {
  const navigate = useNavigate();
  return (
    <section className="bg-gradient-to-r from-[hsl(221,90%,11%)] via-[hsl(221,83%,18%)] to-[hsl(221,83%,28%)] text-white">
      <div className="container mx-auto px-4 py-14">
        <div className="flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="space-y-4 max-w-lg">
            <p className="text-[11px] font-bold tracking-[0.22em] uppercase text-white/40">Programa de Parceria</p>
            <h2 className="text-3xl md:text-4xl font-black leading-[1.1] tracking-tight">
              Faz parte da rede<br />
              <span className="text-[hsl(var(--cta-orange))]">Sinkera</span>
            </h2>
            <p className="text-white/55 text-sm leading-relaxed">
              Revendedor, parceiro estratégico ou prestador de serviço — temos uma oportunidade para o teu perfil em todas as províncias de Angola.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8 flex-shrink-0">
            <ul className="space-y-2.5">
              {["Descontos exclusivos até 30%", "Suporte e formação dedicados", "Cobertura em 18 províncias"].map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-white/65">
                  <span className="w-1 h-1 rounded-full bg-[hsl(var(--cta-orange))] flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <button
              onClick={() => navigate("/parceiros")}
              className="h-12 px-8 bg-[hsl(var(--cta-orange))] hover:bg-[hsl(var(--cta-orange-hover))] text-white font-semibold tracking-[0.12em] uppercase text-[12px] rounded-xl transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              Candidatar-se
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { products, loading } = useProducts();

  // Filter products for different sections based on special categories
  const featuredProducts = products.filter(p => p.is_featured).slice(0, 8);
  const bestSelling = products.filter(p => p.is_bestseller).slice(0, 8);
  const specialOffers = products.filter(p => p.is_special_offer).slice(0, 8);
  const trending = products.filter(p => p.is_trending).slice(0, 8);
  
  // Fallback to general products if no special categories are set
  const destaques = featuredProducts.length > 0 ? featuredProducts : products.slice(0, 8);
  const ofertas = specialOffers.length > 0 ? specialOffers : products.filter(p => p.original_price).slice(0, 8);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center text-gray-500">A carregar produtos...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO />
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      
      {/* Hero Section - Full Width */}
      <HeroSection />
      
      <main className="container mx-auto px-4 py-8 space-y-8 mt-8">

        {/* Banner principal (gerido no backoffice) */}
        <MainBanner />

        {/* Features Bar */}
        <FeaturesBar />

        {/* Categories */}
        <CategoriesSection />

        {/* Flash Sale */}
        <FlashSaleSection />

        {/* Produtos em Destaque */}
        <ProductSection
          eyebrow="Em Destaque"
          icon={Sparkles}
          title="Destaques"
          products={destaques}
          viewAllLink="/produtos"
        />

        {/* Highlight split — áudio premium */}
        <HighlightSplit
          eyebrow="Áudio · Performance"
          title="Som que se sente. Design que impressiona."
          description="Headphones e colunas com acústica de estúdio, cancelamento ativo e bateria de longa duração — feitos para quem leva o som a sério."
          ctaLabel="Áudio Premium"
          ctaHref="/produtos?category=headphones"
          image="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900&h=900&fit=crop"
          accent="cyan"
        />

        {/* Best Selling */}
        {bestSelling.length > 0 && (
          <ProductSection
            eyebrow="Mais Vendidos"
            icon={TrendingUp}
            title="Os mais escolhidos"
            products={bestSelling}
            viewAllLink="/produtos"
          />
        )}

        {/* Brands */}
        <BrandsSection />

        {/* Promoções */}
        {ofertas.length > 0 && (
          <ProductSection
            eyebrow="Promoções"
            icon={Tag}
            title="Ofertas por tempo limitado"
            products={ofertas}
            viewAllLink="/produtos?category=promocoes"
          />
        )}

        {/* Highlight split — mobile premium */}
        <HighlightSplit
          eyebrow="Mobile · Pro"
          title="O smartphone que acompanha o teu ritmo."
          description="Câmaras pro-grade, performance imbatível e bateria all-day. Os flagships mais desejados, com entrega rápida em Angola."
          ctaLabel="Ver smartphones"
          ctaHref="/produtos?category=smartphones"
          image="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=900&h=900&fit=crop"
          reverse
          accent="violet"
        />

        {/* Tendências */}
        {trending.length > 0 && (
          <ProductSection
            eyebrow="Tendências"
            icon={Flame}
            title="O que está em alta"
            products={trending}
            viewAllLink="/produtos"
          />
        )}

        {/* Short Videos Section */}
        <ShortVideosSection />

        {/* Highlight split — wearables */}
        <HighlightSplit
          eyebrow="Wearables · Lifestyle"
          title="Saúde, estilo e tecnologia no teu pulso."
          description="Smartwatches que acompanham cada batida — monitorização avançada, GPS preciso e designs que combinam com qualquer look."
          ctaLabel="Ver smartwatches"
          ctaHref="/produtos?category=smartwatches"
          image="https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=900&h=900&fit=crop"
          accent="rose"
        />

        {/* Recently Viewed */}
        <RecentlyViewedSection />
      </main>

      {/* Partner Banner */}
      <PartnerBanner />

      {/* News Section */}
      <NewsSection />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
