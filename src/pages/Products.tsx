import { useState, useEffect } from "react";
import * as React from "react";
import { SEO } from "@/components/SEO";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { ProductGrid } from "@/components/ProductGrid";
import { Footer } from "@/components/Footer";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
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
          <div className="mb-8">
            {/* Hero promo banner */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl group cursor-pointer h-[240px] sm:h-[300px]">
              {/* Imagem */}
              <img
                src={promoBannerBF}
                alt="Promoções Sinkera"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />

              {/* Overlay em camadas */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/10" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

              {/* Linha decorativa laranja no topo */}
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-orange-500 via-orange-400 to-transparent" />

              {/* Conteúdo */}
              <div className="absolute inset-0 flex flex-col justify-center px-8 sm:px-10">
                <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.28em] text-orange-400 mb-3">
                  <span className="w-4 h-px bg-orange-400" />
                  Campanha Especial
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-white leading-[1.1] tracking-tight mb-2 drop-shadow-lg">
                  Descontos<br className="sm:hidden" /> até <span className="text-orange-400">70%</span>
                </h2>
                <p className="text-[13px] sm:text-sm text-white/60 mb-6 max-w-xs leading-relaxed">
                  Stock limitado — aproveita enquanto há
                </p>
                <div className="inline-flex w-fit">
                  <Link
                    to="/produtos?category=promocoes"
                    className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 transition-colors text-white text-[11px] font-black uppercase tracking-[0.15em] px-5 py-2.5 rounded-sm"
                  >
                    Ver todas as ofertas
                    <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1 duration-200"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </Link>
                </div>
              </div>

              {/* Canto inferior direito — badge */}
              <div className="absolute bottom-5 right-6 text-right hidden sm:block">
                <p className="text-[9px] font-black uppercase tracking-[0.25em] text-white/25">Sinkera</p>
                <p className="text-[9px] font-bold text-white/20">Promoções Ativas</p>
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
