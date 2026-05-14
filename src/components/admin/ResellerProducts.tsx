import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2, Clock, CheckCircle2, XCircle, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ProductDialog } from './ProductDialog';
import { useAuth } from '@/hooks/useAuth';

interface Product {
  id: string;
  name: string;
  price: number;
  original_price?: number;
  description?: string;
  image_url: string;
  in_stock: boolean;
  stock_quantity: number;
  category_id?: string;
  brand_id?: string;
  status: 'pending' | 'approved' | 'rejected';
  seller_id?: string;
  category: { name: string } | null;
  brand: { name: string } | null;
}

const STATUS_CFG = {
  pending:  { label: 'Em revisão',  icon: Clock,        style: 'border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30'    },
  approved: { label: 'Aprovado',   icon: CheckCircle2, style: 'border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30' },
  rejected: { label: 'Rejeitado',  icon: XCircle,      style: 'border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30'                 },
};

const fmtKz = (n: number) => n.toLocaleString('pt-AO', { maximumFractionDigits: 0 }) + ' Kz';

export function ResellerProducts() {
  const [products, setProducts]       = useState<Product[]>([]);
  const [loading, setLoading]         = useState(true);
  const [dialogOpen, setDialogOpen]   = useState(false);
  const [selected, setSelected]       = useState<Product | undefined>();
  const { toast } = useToast();
  const { user }  = useAuth();

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(name), brand:brands(name)')
        .eq('seller_id', user?.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setProducts(data as any || []);
    } catch {
      toast({ title: 'Erro', description: 'Não foi possível carregar os produtos', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminar este produto?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      toast({ title: 'Erro', description: 'Não foi possível eliminar', variant: 'destructive' });
    } else {
      await load();
      toast({ title: 'Produto eliminado' });
    }
  };

  const pending  = products.filter(p => p.status === 'pending').length;
  const approved = products.filter(p => p.status === 'approved').length;
  const rejected = products.filter(p => p.status === 'rejected').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-6">
        <div className="space-y-1">
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground">
            Catálogo
          </p>
          <h2 className="text-xl font-black text-foreground tracking-tight">Meus Produtos</h2>
          <p className="text-xs text-muted-foreground">
            Os produtos ficam em revisão até o admin aprovar.
          </p>
        </div>
        <Button
          variant="vibrant"
          className="gap-2 rounded-xl h-9 text-xs font-bold tracking-wide"
          onClick={() => { setSelected(undefined); setDialogOpen(true); }}
        >
          <Plus className="w-3.5 h-3.5" /> Novo Produto
        </Button>
      </div>

      {/* ── Status summary ── */}
      {products.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {[
            { count: pending,  label: 'em revisão', style: 'border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400'     },
            { count: approved, label: 'aprovado',   style: 'border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400' },
            { count: rejected, label: 'rejeitado',  style: 'border-red-300 dark:border-red-700 text-red-600 dark:text-red-400'              },
          ].filter(s => s.count > 0).map(s => (
            <span key={s.label}
                  className={`text-[11px] font-bold px-3 py-1.5 rounded-full border ${s.style}`}>
              {s.count} {s.label}{s.count > 1 ? 's' : ''}
            </span>
          ))}
        </div>
      )}

      {/* ── Empty state ── */}
      {products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-20 flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
            <Package className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">Nenhum produto ainda</p>
            <p className="text-xs text-muted-foreground">Adiciona o teu primeiro produto para começar a vender.</p>
          </div>
          <Button
            variant="vibrant"
            size="sm"
            className="gap-1.5 rounded-xl text-xs"
            onClick={() => { setSelected(undefined); setDialogOpen(true); }}
          >
            <Plus className="w-3.5 h-3.5" /> Adicionar Produto
          </Button>
        </div>
      ) : (

        /* ── Product list ── */
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[2.5rem_1fr_auto_auto_auto_auto] gap-4 items-center px-5 py-2.5 border-b border-border bg-muted/30">
            <span />
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Produto</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hidden sm:block">Categoria</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Preço</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hidden md:block">Estado</span>
            <span />
          </div>

          <div className="divide-y divide-border">
            {products.map(product => {
              const cfg = STATUS_CFG[product.status ?? 'pending'];
              const Icon = cfg.icon;
              return (
                <div key={product.id}
                     className="grid grid-cols-[2.5rem_1fr_auto_auto_auto_auto] gap-4 items-center px-5 py-3.5 hover:bg-muted/20 transition-colors">

                  {/* Image */}
                  <div className="w-10 h-10 rounded-xl overflow-hidden border border-border bg-muted flex-shrink-0">
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                  </div>

                  {/* Name + stock */}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Stock: {product.stock_quantity}
                    </p>
                  </div>

                  {/* Category */}
                  <span className="hidden sm:block text-xs text-muted-foreground whitespace-nowrap">
                    {product.category?.name || '—'}
                  </span>

                  {/* Price */}
                  <span className="text-sm font-bold text-foreground tabular-nums whitespace-nowrap">
                    {fmtKz(product.price)}
                  </span>

                  {/* Status */}
                  <span className={`hidden md:flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border whitespace-nowrap ${cfg.style}`}>
                    <Icon className="w-3 h-3" /> {cfg.label}
                  </span>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 justify-end">
                    <button
                      onClick={() => { setSelected(product); setDialogOpen(true); }}
                      disabled={product.status === 'approved'}
                      title={product.status === 'approved' ? 'Contacte o admin para editar' : 'Editar'}
                      className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-destructive hover:border-destructive/40 hover:bg-destructive/5 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <ProductDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        product={selected}
        onSuccess={load}
        isReseller={true}
      />
    </>
  );
}
