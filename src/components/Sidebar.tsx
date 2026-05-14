import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { useCategories } from "@/hooks/useCategories";
import { useBrands } from "@/hooks/useBrands";
import { ChevronDown, ChevronUp, Search, X } from "lucide-react";

interface SidebarProps {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  priceRange: number[];
  setPriceRange: (range: number[]) => void;
  selectedBrands: string[];
  setSelectedBrands: (brands: string[]) => void;
}

const SPECIAL_CATEGORIES = [
  { slug: "all",           name: "Todos os Produtos" },
  { slug: "destaques",     name: "Em Destaque"       },
  { slug: "mais-vendidos", name: "Mais Vendidos"     },
  { slug: "tendencias",    name: "Tendências"        },
  { slug: "promocoes",     name: "Promoções"         },
];

const PRICE_PRESETS = [
  { label: "Até 100k",    min: 0,       max: 100000  },
  { label: "100k – 500k", min: 100000,  max: 500000  },
  { label: "500k – 1.5M", min: 500000,  max: 1500000 },
  { label: "Acima 1.5M",  min: 1500000, max: 5000000 },
];

function SectionBlock({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-gray-100 dark:border-border">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-3.5 group"
      >
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 group-hover:text-gray-700 dark:group-hover:text-muted-foreground transition-colors">
          {title}
        </span>
        {open
          ? <ChevronUp className="w-3 h-3 text-gray-300 dark:text-muted-foreground/50" />
          : <ChevronDown className="w-3 h-3 text-gray-300 dark:text-muted-foreground/50" />
        }
      </button>
      {open && <div className="pb-4">{children}</div>}
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
  const [categorySearch, setCategorySearch] = useState("");

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

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(categorySearch.toLowerCase())
  );
  const displayedBrands = showAllBrands ? brands : brands.slice(0, 6);

  return (
    <div className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-2xl overflow-hidden">

      {/* ── Cabeçalho + Colecções ── */}
      <div
        style={{
          background: "linear-gradient(160deg, hsl(221,90%,9%) 0%, hsl(221,83%,17%) 55%, hsl(221,72%,26%) 100%)",
        }}
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-5 py-4">
          <span className="text-[11px] font-black tracking-[0.25em] uppercase text-white">
            Filtros
          </span>
          {hasActiveFilters && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1 text-[10px] font-semibold text-white/40 hover:text-white transition-colors"
            >
              <X className="w-3 h-3" />
              Limpar
            </button>
          )}
        </div>

        {/* Colecções */}
        <div className="mt-1">
          {SPECIAL_CATEGORIES.map(({ slug, name }, i) => {
            const active = isActive(slug);
            return (
              <button
                key={slug}
                onClick={() => setSelectedCategory(slug)}
                className={`w-full flex items-center justify-between px-5 py-3 group transition-all duration-150 border-t ${
                  i === 0 ? "border-white/[0.08]" : "border-white/[0.06]"
                } ${active ? "bg-white/10" : "hover:bg-white/[0.06]"}`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-[2px] rounded-full flex-shrink-0 transition-all duration-200 ${
                    active ? "h-5 bg-white" : "h-3 bg-white/25 group-hover:bg-white/50"
                  }`} />
                  <span className={`text-[13px] leading-tight transition-colors duration-150 ${
                    active ? "font-bold text-white" : "font-medium text-white/65 group-hover:text-white"
                  }`}>
                    {name}
                  </span>
                </div>
                {active && <span className="w-1.5 h-1.5 rounded-full bg-white/60 flex-shrink-0" />}
              </button>
            );
          })}
          <div className="h-4" />
        </div>
      </div>

      {/* ── Categorias reais ── */}
      {!categoriesLoading && categories.length > 0 && (
        <SectionBlock title="Categorias">
          <div className="px-5 pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300 dark:text-muted-foreground/50" />
              <input
                type="text"
                placeholder="Pesquisar categoria..."
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                className="w-full h-8 pl-8 pr-3 text-xs rounded-lg border border-gray-100 dark:border-border bg-gray-50 dark:bg-muted/30 text-gray-700 dark:text-foreground placeholder:text-gray-300 dark:placeholder:text-muted-foreground/50 focus:outline-none focus:border-blue-300 dark:focus:border-blue-700 transition-colors"
              />
            </div>
          </div>
          <div className="space-y-0.5">
            {filteredCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.slug)}
                className="w-full text-left flex items-start justify-between gap-3 px-5 py-2 group"
              >
                <div className="flex items-start gap-2.5 flex-1 min-w-0">
                  <span className={`mt-[7px] w-1 h-1 rounded-full flex-shrink-0 transition-all duration-150 ${
                    isActive(cat.slug) ? "bg-blue-700" : "bg-transparent group-hover:bg-gray-300 dark:group-hover:bg-muted-foreground/40"
                  }`} />
                  <span className={`text-sm leading-tight truncate transition-colors duration-150 ${
                    isActive(cat.slug)
                      ? "font-bold text-blue-700 dark:text-blue-400"
                      : "font-medium text-gray-600 dark:text-muted-foreground group-hover:text-gray-900 dark:group-hover:text-foreground"
                  }`}>
                    {cat.name}
                  </span>
                </div>
                {cat.count != null && (
                  <span className="text-[10px] font-medium text-gray-300 dark:text-muted-foreground/40 mt-1 flex-shrink-0">
                    {cat.count}
                  </span>
                )}
              </button>
            ))}
            {filteredCategories.length === 0 && (
              <p className="px-5 py-3 text-xs text-gray-400">Nenhuma categoria encontrada.</p>
            )}
          </div>
        </SectionBlock>
      )}

      {/* ── Faixa de Preço ── */}
      <SectionBlock title="Faixa de Preço">
        <div className="px-5 space-y-4">
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            max={5000000}
            min={0}
            step={10000}
            className="w-full"
          />
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-muted-foreground font-medium">
            <span>{(priceRange[0] / 1000).toFixed(0)}k Kz</span>
            <span className="text-gray-300 dark:text-border">—</span>
            <span>
              {priceRange[1] >= 1000000
                ? `${(priceRange[1] / 1000000).toFixed(1)}M`
                : `${(priceRange[1] / 1000).toFixed(0)}k`} Kz
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {PRICE_PRESETS.map((r) => {
              const active = priceRange[0] === r.min && priceRange[1] === r.max;
              return (
                <button
                  key={r.label}
                  onClick={() => setPriceRange([r.min, r.max])}
                  className={`text-[11px] px-2 py-2 rounded-lg font-semibold transition-all ${
                    active
                      ? "bg-blue-700 text-white"
                      : "bg-gray-50 dark:bg-muted/40 text-gray-500 dark:text-muted-foreground hover:bg-gray-100 dark:hover:bg-muted hover:text-gray-700 dark:hover:text-foreground"
                  }`}
                >
                  {r.label}
                </button>
              );
            })}
          </div>
        </div>
      </SectionBlock>

      {/* ── Marcas ── */}
      {!brandsLoading && brands.length > 0 && (
        <SectionBlock title="Marcas" defaultOpen={brands.length <= 8}>
          <div className="px-5 space-y-1">
            {displayedBrands.map((brand) => (
              <label
                key={brand.id}
                className="flex items-center gap-3 py-1.5 cursor-pointer group"
              >
                <Checkbox
                  id={`brand-${brand.id}`}
                  checked={selectedBrands.includes(brand.id)}
                  onCheckedChange={(c) => handleBrandChange(brand.id, !!c)}
                  className="data-[state=checked]:bg-blue-700 data-[state=checked]:border-blue-700 border-gray-200 dark:border-border rounded"
                />
                <span className="flex-1 text-sm text-gray-600 dark:text-muted-foreground group-hover:text-gray-900 dark:group-hover:text-foreground transition-colors truncate">
                  {brand.name}
                </span>
                {brand.count != null && (
                  <span className="text-[10px] text-gray-300 dark:text-muted-foreground/50 font-medium">
                    {brand.count}
                  </span>
                )}
              </label>
            ))}
          </div>
          {brands.length > 6 && (
            <button
              onClick={() => setShowAllBrands((v) => !v)}
              className="mt-2 mx-5 text-[11px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
            >
              {showAllBrands
                ? <><ChevronUp className="w-3 h-3" /> Ver menos</>
                : <><ChevronDown className="w-3 h-3" /> Ver todas ({brands.length})</>
              }
            </button>
          )}
        </SectionBlock>
      )}
    </div>
  );
};
