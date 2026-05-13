import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ChevronRight, X, ShoppingCart, BarChart2 } from 'lucide-react';
import { useCompare } from '@/hooks/useCompare';
import { useCart } from '@/hooks/useCart';
import { supabase } from '@/integrations/supabase/client';

interface CompareProduct {
  id: string;
  name: string;
  price: number;
  original_price?: number;
  image_url: string;
  description?: string;
  in_stock: boolean;
  stock_quantity?: number;
  category?: string;
  brand?: string;
}

const ROWS: { label: string; key: keyof CompareProduct | 'price_fmt' | 'stock_fmt' }[] = [
  { label: 'Preço', key: 'price_fmt' },
  { label: 'Categoria', key: 'category' },
  { label: 'Marca', key: 'brand' },
  { label: 'Stock', key: 'stock_fmt' },
  { label: 'Descrição', key: 'description' },
];

export default function Compare() {
  const { compareIds, removeFromCompare } = useCompare();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<CompareProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (compareIds.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }
    loadProducts();
  }, [compareIds]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const { data: prods } = await supabase
        .from('products')
        .select('id, name, price, original_price, image_url, description, in_stock, stock_quantity, category_id, brand_id')
        .in('id', compareIds);

      if (!prods) { setProducts([]); return; }

      const categoryIds = [...new Set(prods.map((p) => p.category_id).filter(Boolean))];
      const brandIds = [...new Set(prods.map((p) => p.brand_id).filter(Boolean))];

      const [catData, brandData] = await Promise.all([
        categoryIds.length > 0
          ? supabase.from('categories').select('id, name').in('id', categoryIds)
          : Promise.resolve({ data: [] }),
        brandIds.length > 0
          ? supabase.from('brands').select('id, name').in('id', brandIds)
          : Promise.resolve({ data: [] }),
      ]);

      const catMap: Record<string, string> = {};
      (catData.data || []).forEach((c: any) => { catMap[c.id] = c.name; });
      const brandMap: Record<string, string> = {};
      (brandData.data || []).forEach((b: any) => { brandMap[b.id] = b.name; });

      const mapped: CompareProduct[] = prods.map((p: any) => ({
        ...p,
        category: p.category_id ? catMap[p.category_id] || '—' : '—',
        brand: p.brand_id ? brandMap[p.brand_id] || '—' : '—',
      }));

      // preserve compareIds order
      const ordered = compareIds
        .map((id) => mapped.find((p) => p.id === id))
        .filter(Boolean) as CompareProduct[];

      setProducts(ordered);
    } finally {
      setLoading(false);
    }
  };

  const fmtKz = (n: number) =>
    n.toLocaleString('pt-AO', { maximumFractionDigits: 0 }) + ' Kz';

  const getCellValue = (product: CompareProduct, key: string): string => {
    if (key === 'price_fmt') return fmtKz(product.price);
    if (key === 'stock_fmt')
      return product.in_stock
        ? product.stock_quantity != null
          ? `${product.stock_quantity} unidades`
          : 'Em stock'
        : 'Esgotado';
    return String((product as any)[key] ?? '—') || '—';
  };

  return (
    <div className="min-h-screen bg-background">
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <main className="container mx-auto px-4 py-8 mt-20 max-w-6xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground transition-colors">Início</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground font-medium">Comparar Produtos</span>
        </nav>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <BarChart2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground">Comparar Produtos</h1>
            <p className="text-sm text-muted-foreground">Compare lado a lado e escolha o melhor</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : compareIds.length < 2 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-5">
              <BarChart2 className="w-10 h-10 text-muted-foreground/40" />
            </div>
            <h2 className="text-xl font-bold mb-2">Adicione pelo menos 2 produtos para comparar</h2>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Navegue pelos produtos e clique no ícone de comparar para adicionar à comparação.
            </p>
            <Link to="/produtos">
              <Button className="gap-2 px-8">
                <ShoppingCart className="w-4 h-4" />
                Explorar Produtos
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border shadow-sm">
            <table className="w-full min-w-[600px] border-collapse">
              {/* Product header row */}
              <thead>
                <tr className="border-b border-border">
                  <th className="w-36 bg-muted/40 p-4 text-left text-sm font-semibold text-muted-foreground">
                    Atributo
                  </th>
                  {products.map((p) => (
                    <th key={p.id} className="bg-card p-4 min-w-[200px]">
                      <div className="flex flex-col items-center gap-3">
                        {/* Remove button */}
                        <button
                          onClick={() => removeFromCompare(p.id)}
                          className="self-end w-6 h-6 rounded-full bg-muted hover:bg-destructive hover:text-destructive-foreground flex items-center justify-center transition-colors"
                          aria-label="Remover"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        {/* Image */}
                        <div className="w-24 h-24 rounded-xl overflow-hidden bg-muted border border-border">
                          <img
                            src={p.image_url}
                            alt={p.name}
                            className="w-full h-full object-contain p-2"
                          />
                        </div>
                        {/* Name */}
                        <Link
                          to={`/produto/${p.id}`}
                          className="text-sm font-bold text-foreground hover:text-primary transition-colors text-center line-clamp-2 leading-snug"
                        >
                          {p.name}
                        </Link>
                        {/* Price */}
                        <span className="text-lg font-black text-foreground">
                          {fmtKz(p.price)}
                        </span>
                        {/* Add to cart */}
                        <Button
                          size="sm"
                          disabled={!p.in_stock}
                          onClick={() => addToCart(p.id)}
                          className="w-full gap-1.5 rounded-xl text-xs font-bold"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          {p.in_stock ? 'Adicionar ao Carrinho' : 'Esgotado'}
                        </Button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Attribute rows */}
              <tbody>
                {ROWS.map((row, rowIdx) => (
                  <tr
                    key={row.key}
                    className={`border-b border-border last:border-0 ${rowIdx % 2 === 0 ? 'bg-muted/20' : 'bg-card'}`}
                  >
                    <td className="p-4 text-sm font-semibold text-muted-foreground bg-muted/40 border-r border-border">
                      {row.label}
                    </td>
                    {products.map((p) => (
                      <td key={p.id} className="p-4 text-sm text-foreground text-center align-top">
                        {row.key === 'stock_fmt' ? (
                          <span
                            className={`inline-block font-semibold ${
                              p.in_stock ? 'text-emerald-600' : 'text-red-500'
                            }`}
                          >
                            {getCellValue(p, row.key)}
                          </span>
                        ) : row.key === 'description' ? (
                          <span className="text-xs text-muted-foreground line-clamp-3 text-left">
                            {getCellValue(p, row.key)}
                          </span>
                        ) : (
                          getCellValue(p, row.key)
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
