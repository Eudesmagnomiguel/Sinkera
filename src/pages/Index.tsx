import { useState } from "react";
import { SEO } from "@/components/SEO";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { CategoriesSection } from "@/components/CategoriesSection";
import { ProductSection } from "@/components/ProductSection";
import { PromoBanner } from "@/components/PromoBanner";
import { PromotionsSection } from "@/components/PromotionsSection";
import { GiftCardSection } from "@/components/GiftCardSection";
import { ShortVideosSection } from "@/components/ShortVideosSection";
import { BrandsSection } from "@/components/BrandsSection";
import { FeaturesBar } from "@/components/FeaturesBar";
import { NewsSection } from "@/components/NewsSection";
import { PartnerFormSection } from "@/components/PartnerFormSection";
import { Footer } from "@/components/Footer";
import { useProducts } from "@/hooks/useProducts";
import { HighlightSplit } from "@/components/HighlightSplit";
import { MainBanner } from "@/components/MainBanner";
import { FlashSaleSection } from "@/components/FlashSaleSection";
import { RecentlyViewedSection } from "@/components/RecentlyViewedSection";

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
      <div className="min-h-screen bg-gray-50">
        <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center text-gray-500">A carregar produtos...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
          eyebrow="Curadoria Sinkera"
          title="Produtos em destaque"
          description="Selecionados pela nossa equipa para entregar a melhor relação design, performance e preço."
          products={destaques}
          viewAllLink="/produtos"
        />

        {/* Highlight split — áudio premium */}
        <HighlightSplit
          eyebrow="Áudio · Performance"
          title="Som que se sente. Design que impressiona."
          description="Headphones e colunas com acústica de estúdio, cancelamento ativo e bateria de longa duração — feitos para quem leva o som a sério."
          ctaLabel="Ver áudio premium"
          ctaHref="/produtos?category=headphones"
          image="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900&h=900&fit=crop"
          accent="cyan"
        />

        {/* Best Selling */}
        {bestSelling.length > 0 && (
          <ProductSection 
            eyebrow="Top sellers"
            title="Os mais escolhidos da semana"
            description="O que os clientes Sinkera estão levando agora — atualizado em tempo real."
            products={bestSelling}
            viewAllLink="/produtos"
          />
        )}

        {/* Brands */}
        <BrandsSection />

        {/* Ofertas Especiais */}
        {ofertas.length > 0 && (
          <ProductSection 
            eyebrow="Promoções relâmpago"
            title="Ofertas especiais — por tempo limitado"
            description="Descontos reais em produtos selecionados. Stock limitado, leva enquanto há."
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

        {/* Notícias & Tendências */}
        {trending.length > 0 && (
          <ProductSection 
            eyebrow="Trending agora"
            title="O que está em alta"
            description="Lançamentos, gadgets virais e tudo o que o mundo tech está a falar."
            products={trending}
            viewAllLink="/produtos"
          />
        )}

        {/* Gift Card Section */}
        <GiftCardSection />

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

      {/* News Section */}
      <NewsSection />

      {/* Partner / Reseller Form */}
      <div className="container mx-auto px-4">
        <PartnerFormSection />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
