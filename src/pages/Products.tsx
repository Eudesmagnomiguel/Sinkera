import { useState, useEffect } from "react";
import * as React from "react";
import { SEO } from "@/components/SEO";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { ProductGrid } from "@/components/ProductGrid";
import { Footer } from "@/components/Footer";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Grid, List, Loader2, SlidersHorizontal, X, ChevronDown, Package } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import promoBannerBF from "@/assets/promo-black-friday.jpg";
import promoBannerFlash from "@/assets/promo-flash-sale.jpg";
import promoBannerShip from "@/assets/promo-free-shipping.jpg";

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevância" },
  { value: "price-asc", label: "Menor Preço" },
  { value: "price-desc", label: "Maior Preço" },
  { value: "rating", label: "Melhor Avaliação" },
  { value: "newest", label: "Mais Recentes" },
  { value: "popular", label: "Mais Populares" },
  { value: "name-asc", label: "Nome: A-Z" },
  { value: "name-desc", label: "Nome: Z-A" },
];

const Products = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const categoryParam = searchParams.get("category") || "all";
  const searchParam = searchParams.get("search") || "";
  const { products, loading, error: productsError } = useProducts();
  const { categories } = useCategories();

  const [searchQuery, setSearchQuery] = useState(searchParam);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [priceRange, setPriceRange] = useState([0, 5000000]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("relevance");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  React.useEffect(() => { setSelectedCategory(categoryParam); }, [categoryParam]);
  React.useEffect(() => { if (searchParam) setSearchQuery(searchParam); }, [searchParam]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    let matchesCategory = true;
    if (selectedCategory === "all") matchesCategory = true;
    else if (selectedCategory === "promocoes") matchesCategory = product.is_special_offer === true;
    else if (selectedCategory === "destaques") matchesCategory = product.is_featured === true;
    else if (selectedCategory === "mais-vendidos") matchesCategory = product.is_bestseller === true;
    else if (selectedCategory === "tendencias") matchesCategory = product.is_trending === true;
    else {
      const cat = categories.find(c => c.slug === selectedCategory);
      matchesCategory = cat ? product.category_id === cat.id : product.category_id === selectedCategory;
    }
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(product.brand_id || "");
    return matchesSearch && matchesCategory && matchesPrice && matchesBrand;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-asc": return a.price - b.price;
      case "price-desc": return b.price - a.price;
      case "rating": return (b.rating || 0) - (a.rating || 0);
      case "name-asc": return a.name.localeCompare(b.name);
      case "name-desc": return b.name.localeCompare(a.name);
      case "newest": return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      case "popular": return (b.reviews_count || 0) - (a.reviews_count || 0);
      default: return 0;
    }
  });

  const getCategoryName = () => {
    if (selectedCategory === "all") return "Todos os Produtos";
    if (selectedCategory === "promocoes") return "Promoções";
    if (selectedCategory === "destaques") return "Destaques";
    if (selectedCategory === "mais-vendidos") return "Mais Vendidos";
    if (selectedCategory === "tendencias") return "Tendências";
    const cat = categories.find(c => c.slug === selectedCategory) || categories.find(c => c.id === selectedCategory);
    return cat?.name || "Todos os Produtos";
  };

  const activeFiltersCount =
    (selectedCategory !== "all" ? 1 : 0) +
    (priceRange[0] !== 0 || priceRange[1] !== 5000000 ? 1 : 0) +
    selectedBrands.length;

  const clearAllFilters = () => {
    setSelectedCategory("all");
    setPriceRange([0, 5000000]);
    setSelectedBrands([]);
  };

  const sidebarEl = (
    <Sidebar
      selectedCategory={selectedCategory}
      setSelectedCategory={(c) => { setSelectedCategory(c); setMobileFiltersOpen(false); }}
      priceRange={priceRange}
      setPriceRange={setPriceRange}
      selectedBrands={selectedBrands}
      setSelectedBrands={setSelectedBrands}
    />
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <div className="container mx-auto px-4 py-8 mt-20">
          <div className="flex gap-6">
            <div className="hidden lg:block w-[280px] flex-shrink-0">
              <div className="h-[600px] rounded-2xl bg-muted animate-pulse" />
            </div>
            <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-[3/4] rounded-2xl bg-muted animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (productsError) {
    return (
      <div className="min-h-screen bg-background">
        <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <div className="container mx-auto px-4 py-20 mt-20 text-center">
          <Package className="w-12 h-12 mx-auto text-destructive mb-4" />
          <h2 className="text-xl font-bold mb-2">Erro ao carregar produtos</h2>
          <p className="text-muted-foreground text-sm bg-muted rounded-lg px-4 py-2 inline-block font-mono">{productsError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Produtos" description="Explore o catálogo completo de tecnologia e electrónica Sinkera." />
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <div className="container mx-auto px-4 pt-6 pb-12 mt-20">
        {/* Page heading */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <span>Início</span>
            <span>/</span>
            <span className="text-foreground font-medium">{getCategoryName()}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold">{getCategoryName()}</h1>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          {/* Mobile filter trigger */}
          <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="lg:hidden gap-2 relative">
                <SlidersHorizontal className="w-4 h-4" />
                Filtros
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[320px] p-0 overflow-y-auto">
              <SheetHeader className="px-4 pt-4 pb-2">
                <SheetTitle>Filtros</SheetTitle>
              </SheetHeader>
              {sidebarEl}
            </SheetContent>
          </Sheet>

          {/* Result count */}
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Package className="w-4 h-4" />
            <span><strong className="text-foreground">{sortedProducts.length}</strong> produtos</span>
          </div>

          {/* Active filter chips */}
          {activeFiltersCount > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              {selectedCategory !== "all" && (
                <Badge variant="secondary" className="gap-1 pr-1">
                  {getCategoryName()}
                  <button onClick={() => setSelectedCategory("all")} className="hover:text-destructive ml-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {(priceRange[0] !== 0 || priceRange[1] !== 5000000) && (
                <Badge variant="secondary" className="gap-1 pr-1">
                  {priceRange[0].toLocaleString()}–{priceRange[1].toLocaleString()} Kz
                  <button onClick={() => setPriceRange([0, 5000000])} className="hover:text-destructive ml-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              <button
                onClick={clearAllFilters}
                className="text-xs text-muted-foreground hover:text-destructive underline underline-offset-2"
              >
                Limpar tudo
              </button>
            </div>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* View mode toggle */}
          <div className="hidden sm:flex items-center gap-1 bg-muted rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition-all ${viewMode === "grid" ? "bg-background shadow-sm" : "hover:bg-background/60"}`}
              title="Grade"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-md transition-all ${viewMode === "list" ? "bg-background shadow-sm" : "hover:bg-background/60"}`}
              title="Lista"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-auto gap-2 min-w-[160px]">
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              <SelectValue placeholder="Ordenar" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Promos banner — shown only on "promocoes" category */}
        {selectedCategory === "promocoes" && (
          <div className="mb-8 space-y-3">
            {/* Hero promo banner */}
            <div className="relative rounded-2xl overflow-hidden shadow-lg group cursor-pointer h-[180px] sm:h-[220px]">
              <img
                src={promoBannerBF}
                alt="Promoções Sinkera"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-center px-7">
                <span className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] text-orange-400 mb-2">
                  Campanha Especial
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight drop-shadow-md mb-1">
                  Descontos até 70%
                </h2>
                <p className="text-sm text-white/70 mb-4">Stock limitado — aproveita enquanto há</p>
                <div className="inline-flex w-fit">
                  <span className="bg-orange-500 hover:bg-orange-400 transition-colors text-white text-xs font-bold px-4 py-2 rounded-full cursor-pointer">
                    Ver todas as ofertas →
                  </span>
                </div>
              </div>
            </div>

            {/* Two secondary banners */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="relative rounded-2xl overflow-hidden h-[100px] group cursor-pointer shadow">
                <img
                  src={promoBannerFlash}
                  alt="Flash Sale"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/10" />
                <div className="absolute inset-0 flex items-center px-5 gap-3">
                  <div className="w-9 h-9 rounded-full bg-orange-500/90 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-lg font-black">⚡</span>
                  </div>
                  <div>
                    <p className="text-white font-extrabold text-sm leading-tight">Flash Sale</p>
                    <p className="text-white/70 text-xs">Oferta por tempo limitado</p>
                  </div>
                </div>
              </div>
              <div className="relative rounded-2xl overflow-hidden h-[100px] group cursor-pointer shadow">
                <img
                  src={promoBannerShip}
                  alt="Envio Grátis"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/10" />
                <div className="absolute inset-0 flex items-center px-5 gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-500/90 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-lg">🚚</span>
                  </div>
                  <div>
                    <p className="text-white font-extrabold text-sm leading-tight">Envio Grátis</p>
                    <p className="text-white/70 text-xs">Acima de 10.000 Kz</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Layout */}
        <div className="flex gap-6">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-[270px] flex-shrink-0 self-start sticky top-24">
            {sidebarEl}
          </aside>

          {/* Grid */}
          <main className="flex-1 min-w-0">
            <ProductGrid products={sortedProducts} viewMode={viewMode} />
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Products;
