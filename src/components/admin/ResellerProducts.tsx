import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Clock, CheckCircle2, XCircle } from 'lucide-react';
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

const STATUS_CONFIG = {
  pending:  { label: 'Aguarda aprovação', icon: Clock,         variant: 'outline'     as const, className: 'border-orange-400 text-orange-600 dark:text-orange-400' },
  approved: { label: 'Aprovado',          icon: CheckCircle2,  variant: 'default'     as const, className: 'bg-emerald-600 hover:bg-emerald-600 text-white' },
  rejected: { label: 'Rejeitado',         icon: XCircle,       variant: 'destructive' as const, className: '' },
};

export function ResellerProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => { loadProducts(); }, []);

  const loadProducts = async () => {
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
    if (!confirm('Tem certeza que deseja eliminar este produto?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      toast({ title: 'Erro', description: 'Não foi possível eliminar o produto', variant: 'destructive' });
    } else {
      await loadProducts();
      toast({ title: 'Produto eliminado' });
    }
  };

  const pending  = products.filter(p => p.status === 'pending').length;
  const approved = products.filter(p => p.status === 'approved').length;
  const rejected = products.filter(p => p.status === 'rejected').length;

  if (loading) return <div className="text-muted-foreground text-sm p-4">A carregar...</div>;

  return (
    <>
      {/* Summary chips */}
      {products.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {pending > 0 && (
            <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800">
              <Clock className="w-3.5 h-3.5" /> {pending} a aguardar aprovação
            </div>
          )}
          {approved > 0 && (
            <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5" /> {approved} aprovado{approved > 1 ? 's' : ''}
            </div>
          )}
          {rejected > 0 && (
            <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">
              <XCircle className="w-3.5 h-3.5" /> {rejected} rejeitado{rejected > 1 ? 's' : ''}
            </div>
          )}
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Meus Produtos</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">Os produtos submetidos ficam em revisão até o admin aprovar.</p>
          </div>
          <Button variant="vibrant" className="gap-2" onClick={() => { setSelectedProduct(undefined); setDialogOpen(true); }}>
            <Plus className="w-4 h-4" /> Adicionar Produto
          </Button>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              Ainda não tens produtos cadastrados.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Imagem</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Curadoria</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => {
                  const cfg = STATUS_CONFIG[product.status ?? 'pending'];
                  const Icon = cfg.icon;
                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-border bg-muted flex-shrink-0">
                          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium max-w-[200px] truncate">{product.name}</TableCell>
                      <TableCell>{product.category?.name || '—'}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        {product.price.toLocaleString('pt-AO', { maximumFractionDigits: 0 })} Kz
                      </TableCell>
                      <TableCell>{product.stock_quantity}</TableCell>
                      <TableCell>
                        <Badge variant={cfg.variant} className={`gap-1 text-xs ${cfg.className}`}>
                          <Icon className="w-3 h-3" />
                          {cfg.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="icon" variant="outline" onClick={() => { setSelectedProduct(product); setDialogOpen(true); }}
                            disabled={product.status === 'approved'} title={product.status === 'approved' ? 'Produto aprovado — contacte o admin para editar' : 'Editar'}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="destructive" onClick={() => handleDelete(product.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ProductDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        product={selectedProduct}
        onSuccess={loadProducts}
        isReseller={true}
      />
    </>
  );
}
