import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCategories } from "@/hooks/useCategories";
import { useBrands } from "@/hooks/useBrands";
import {
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  Tag,
  Award,
  RotateCcw,
  Flame,
  Star,
  TrendingUp,
  Percent,
} from "lucide-react";

interface SidebarProps {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  priceRange: number[];
  setPriceRange: (range: number[]) => void;
  selectedBrands: string[];
  setSelectedBrands: (brands: string[]) => void;
}

const SPECIAL_CATEGORIES = [
  { id: "all", slug: "all", name: "Todos os Produtos", icon: LayoutGrid, count: null },
  { id: "destaques", slug: "destaques", name: "Destaques", icon: Star, count: null },
  { id: "mais-vendidos", slug: "mais-vendidos", name: "Mais Vendidos", icon: Flame, count: null },
  { id: "tendencias", slug: "tendencias", name: "Tendências", icon: TrendingUp, count: null },
  { id: "promocoes", slug: "promocoes", name: "Promoções", icon: Percent, count: null },
];

function Section({
  title,
  icon: Icon,
  children,
  defaultOpen = true,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <Icon className="w-4 h-4 text-primary" />
          <span className="font-semibold text-sm">{title}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

export const Sidebar = ({
  selectedCategory,
  setSelectedCategory,
  priceRange,
  setPriceRange,
  selectedBrands,
  setSelectedBrands,
}: SidebarProps) => {
  const { categories, loading: categoriesLoading } = useCategories();
  const { brands, loading: brandsLoading } = useBrands();
  const [showAllBrands, setShowAllBrands] = useState(false);

  const handleBrandChange = (brandId: string, checked: boolean) => {
    setSelectedBrands(
      checked ? [...selectedBrands, brandId] : selectedBrands.filter((id) => id !== brandId)
    );
  };

  const isActive = (slug: string) => selectedCategory === slug;

  const hasActiveFilters =
    selectedCategory !== "all" ||
    priceRange[0] !== 0 ||
    priceRange[1] !== 5000000 ||
    selectedBrands.length > 0;

  const clearAll = () => {
    setSelectedCategory("all");
    setPriceRange([0, 5000000]);
    setSelectedBrands([]);
  };

  const displayedBrands = showAllBrands ? brands : brands.slice(0, 6);

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
        <span className="font-bold text-sm">Filtros</span>
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Limpar tudo
          </button>
        )}
      </div>

      {/* Categories */}
      <Section title="Categorias" icon={LayoutGrid}>
        <div className="space-y-0.5 -mx-1">
          {SPECIAL_CATEGORIES.map(({ slug, name, icon: Icon }) => (
            <button
              key={slug}
              onClick={() => setSelectedCategory(slug)}
              className={`w-full text-left px-3 py-2.5 rounded-xl transition-all duration-150 flex items-center gap-2.5 text-sm ${
                isActive(slug)
                  ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                  : "hover:bg-muted text-foreground"
              }`}
            >
              <Icon className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="flex-1">{name}</span>
            </button>
          ))}

          {!categoriesLoading && categories.length > 0 && (
            <div className="pt-2 mt-1 border-t border-border/60">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-3 pb-1.5">
                Por Categoria
              </p>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`w-full text-left px-3 py-2 rounded-xl transition-all duration-150 flex items-center justify-between gap-2 text-sm ${
                    isActive(cat.slug)
                      ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                      : "hover:bg-muted text-foreground"
                  }`}
                >
                  <span className="flex-1 truncate">{cat.name}</span>
                  {cat.count != null && (
                    <span className={`text-[11px] px-1.5 py-0.5 rounded-md font-medium ${
                      isActive(cat.slug) ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}>
                      {cat.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </Section>

      {/* Price Range */}
      <Section title="Faixa de Preço" icon={Tag}>
        <div className="space-y-4">
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            max={5000000}
            min={0}
            step={10000}
            className="w-full"
          />
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-muted rounded-lg px-3 py-2 text-center">
              <p className="text-[10px] text-muted-foreground mb-0.5">Mín</p>
              <p className="text-sm font-bold">{(priceRange[0] / 1000).toFixed(0)}k Kz</p>
            </div>
            <div className="w-4 h-px bg-border flex-shrink-0" />
            <div className="flex-1 bg-muted rounded-lg px-3 py-2 text-center">
              <p className="text-[10px] text-muted-foreground mb-0.5">Máx</p>
              <p className="text-sm font-bold">
                {priceRange[1] >= 1000000
                  ? `${(priceRange[1] / 1000000).toFixed(1)}M`
                  : `${(priceRange[1] / 1000).toFixed(0)}k`} Kz
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {[
              { label: "Até 100k", min: 0, max: 100000 },
              { label: "100k–500k", min: 100000, max: 500000 },
              { label: "500k–1.5M", min: 500000, max: 1500000 },
              { label: "Acima 1.5M", min: 1500000, max: 5000000 },
            ].map((r) => (
              <button
                key={r.label}
                onClick={() => setPriceRange([r.min, r.max])}
                className={`text-xs px-2 py-2 rounded-lg font-medium transition-all ${
                  priceRange[0] === r.min && priceRange[1] === r.max
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </Section>

      {/* Brands */}
      {!brandsLoading && brands.length > 0 && (
        <Section title="Marcas" icon={Award} defaultOpen={brands.length <= 8}>
          <div className="space-y-1">
            {displayedBrands.map((brand) => (
              <label
                key={brand.id}
                className="flex items-center gap-2.5 py-1.5 px-1 rounded-lg hover:bg-muted cursor-pointer group transition-colors"
              >
                <Checkbox
                  id={`brand-${brand.id}`}
                  checked={selectedBrands.includes(brand.id)}
                  onCheckedChange={(c) => handleBrandChange(brand.id, !!c)}
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <span className="flex-1 text-sm group-hover:text-foreground transition-colors truncate">
                  {brand.name}
                </span>
                {brand.count != null && (
                  <span className="text-[11px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-md">
                    {brand.count}
                  </span>
                )}
              </label>
            ))}
          </div>
          {brands.length > 6 && (
            <button
              onClick={() => setShowAllBrands((v) => !v)}
              className="mt-2 w-full text-xs text-primary hover:text-primary/80 font-medium flex items-center justify-center gap-1 py-1.5"
            >
              {showAllBrands ? (
                <><ChevronUp className="w-3 h-3" /> Ver menos</>
              ) : (
                <><ChevronDown className="w-3 h-3" /> Ver todas ({brands.length})</>
              )}
            </button>
          )}
        </Section>
      )}
    </div>
  );
};
