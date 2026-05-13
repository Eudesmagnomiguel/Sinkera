import { useState, useEffect, FormEvent } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { SearchX, Search as SearchIcon, ChevronRight, SlidersHorizontal } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  original_price?: number;
  image_url: string;
  rating?: number;
  reviews_count?: number;
  badge?: string;
  in_stock: boolean;
  stock_quantity?: number;
  category?: string | null;
  description?: string | null;
  created_at?: string;
}

const PRICE_QUICK = [
  { label: '0 – 50 000 Kz',    min: 0,      max: 50000   },
  { label: '50 – 200 000 Kz',  min: 50000,  max: 200000  },
  { label: '200 – 500 000 Kz', min: 200000, max: 500000  },
  { label: '500 000 Kz +',     min: 500000, max: Infinity },
];

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevância'    },
  { value: 'price-asc', label: 'Preço: menor'  },
  { value: 'price-desc', label: 'Preço: maior' },
  { value: 'newest',    label: 'Mais recente'  },
];

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const q = searchParams.get('q') || '';

  const [searchQuery, setSearchQuery] = useState(q); // for Header prop
  const [inputValue, setInputValue]   = useState(q); // controlled search bar

  const [products,   setProducts]   = useState<Product[]>([]);
  const [loading,    setLoading]    = useState(false);
  const [categories, setCategories] = useState<string[]>([]);

  // Filters
  const [minPrice,    setMinPrice]    = useState('');
  const [maxPrice,    setMaxPrice]    = useState('');
  const [selCategory, setSelCategory] = useState('all');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy,      setSortBy]      = useState('relevance');

  // Mobile sidebar toggle
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch products when q changes
  useEffect(() => {
    setInputValue(q);
    setSearchQuery(q);
    if (!q.trim()) { setProducts([]); setLoading(false); return; }
    fetchProducts(q);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const fetchProducts = async (query: string) => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from('products')
        .select('*')
        .ilike('name', `%${query}%`);
      if (error) throw error;
      const rows = (data || []) as Product[];
      // Collect distinct categories
      const cats = [...new Set(rows.map((p: Product) => p.category).filter(Boolean))] as string[];
      setCategories(cats);
      setProducts(rows);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    setSearchParams({ q: trimmed });
  };

  // Apply filters + sort
  const filtered = products
    .filter(p => {
      const mn = minPrice ? Number(minPrice) : 0;
      const mx = maxPrice ? Number(maxPrice) : Infinity;
      if (p.price < mn || p.price > mx) return false;
      if (selCategory !== 'all' && p.category !== selCategory) return false;
      if (inStockOnly && !p.in_stock) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc')  return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'newest')
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      return 0; // relevance = original order
    });

  const applyQuickPrice = (min: number, max: number) => {
    setMinPrice(String(min));
    setMaxPrice(max === Infinity ? '' : String(max));
  };

  const clearFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    setSelCategory('all');
    setInStockOnly(false);
    setSortBy('relevance');
  };

  // ── Sidebar component ───────────────────────────────────────────────────
  const Sidebar = () => (
    <aside className="space-y-6">
      {/* Price range */}
      <div>
        <p className="text-sm font-bold mb-3">Preço</p>
        <div className="flex gap-2 mb-3">
          <div className="flex-1">
            <Label className="text-xs text-muted-foreground">Min (Kz)</Label>
            <Input
              type="number"
              value={minPrice}
              onChange={e => setMinPrice(e.target.value)}
              placeholder="0"
              className="h-8 text-sm mt-0.5"
            />
          </div>
          <div className="flex-1">
            <Label className="text-xs text-muted-foreground">Max (Kz)</Label>
            <Input
              type="number"
              value={maxPrice}
              onChange={e => setMaxPrice(e.target.value)}
              placeholder="Sem limite"
              className="h-8 text-sm mt-0.5"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          {PRICE_QUICK.map(qp => (
            <button
              key={qp.label}
              onClick={() => applyQuickPrice(qp.min, qp.max)}
              className="w-full text-left text-sm px-3 py-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              {qp.label}
            </button>
          ))}
        </div>
      </div>

      {/* Category */}
      {categories.length > 0 && (
        <div>
          <p className="text-sm font-bold mb-3">Categoria</p>
          <div className="space-y-1">
            <button
              onClick={() => setSelCategory('all')}
              className={`w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors ${
                selCategory === 'all' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              Todas
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelCategory(cat)}
                className={`w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors ${
                  selCategory === cat ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* In stock */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="in-stock"
          checked={inStockOnly}
          onChange={e => setInStockOnly(e.target.checked)}
          className="w-4 h-4 accent-primary"
        />
        <Label htmlFor="in-stock" className="text-sm cursor-pointer">Apenas em stock</Label>
      </div>

      {/* Clear */}
      <Button variant="outline" size="sm" className="w-full" onClick={clearFilters}>
        Limpar filtros
      </Button>
    </aside>
  );

  return (
    <div className="min-h-screen bg-background">
      <SEO title={q ? `Pesquisa: ${q}` : 'Pesquisa'} />
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <main className="container mx-auto px-4 py-6 mt-20">

        {/* ── Breadcrumb ── */}
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-5 flex-wrap">
          <button onClick={() => navigate('/')} className="hover:text-foreground transition-colors">Início</button>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="hover:text-foreground transition-colors">Pesquisa</span>
          {q && (
            <>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-foreground font-medium truncate max-w-[200px]">{q}</span>
            </>
          )}
        </nav>

        {/* ── Search bar ── */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-6 max-w-2xl">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder="Pesquisar produtos…"
              className="pl-9 h-11"
            />
          </div>
          <Button type="submit" className="h-11 px-6 font-bold gap-2">
            <SearchIcon className="w-4 h-4" />
            Pesquisar
          </Button>
        </form>

        {/* ── Result count + sort ── */}
        {q && (
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <p className="text-sm text-muted-foreground">
              {loading ? 'A pesquisar…' : (
                <><span className="font-bold text-foreground">{filtered.length}</span> resultado{filtered.length !== 1 ? 's' : ''} para <span className="font-bold text-foreground">"{q}"</span></>
              )}
            </p>
            <div className="flex items-center gap-2">
              {/* Mobile filter toggle */}
              <Button
                variant="outline"
                size="sm"
                className="lg:hidden gap-1.5"
                onClick={() => setSidebarOpen(v => !v)}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filtros
              </Button>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-44 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map(o => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <div className="flex gap-6">
          {/* ── Desktop sidebar ── */}
          {q && (
            <div className="hidden lg:block w-56 flex-shrink-0">
              <Sidebar />
            </div>
          )}

          {/* ── Mobile sidebar ── */}
          {sidebarOpen && q && (
            <div className="lg:hidden fixed inset-0 z-50 flex">
              <div className="w-72 bg-card border-r border-border h-full overflow-y-auto p-5 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <p className="font-bold">Filtros</p>
                  <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                    <SearchX className="w-4 h-4" />
                  </Button>
                </div>
                <Sidebar />
              </div>
              <div className="flex-1 bg-black/40" onClick={() => setSidebarOpen(false)} />
            </div>
          )}

          {/* ── Main content ── */}
          <div className="flex-1 min-w-0">
            {!q ? (
              <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-4">
                <SearchIcon className="w-16 h-16 opacity-20" />
                <p className="text-lg font-semibold">Digite algo para pesquisar</p>
              </div>
            ) : loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="aspect-[3/4] rounded-2xl bg-muted animate-pulse" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-4">
                <SearchX className="w-16 h-16 opacity-20" />
                <p className="text-lg font-semibold">Nenhum resultado encontrado</p>
                <p className="text-sm text-center max-w-xs">
                  Tenta pesquisar com outros termos ou{' '}
                  <button onClick={clearFilters} className="text-primary hover:underline">
                    limpar os filtros
                  </button>
                  .
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {filtered.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
