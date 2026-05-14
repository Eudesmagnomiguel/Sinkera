import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, XCircle, Clock, User, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PendingProduct {
  id: string;
  name: string;
  description?: string;
  price: number;
  original_price?: number;
  image_url: string;
  stock_quantity: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  seller_id?: string;
  category: { name: string } | null;
  brand: { name: string } | null;
  seller_profile?: { full_name: string; email: string } | null;
}

export function AdminCuration() {
  const [products, setProducts] = useState<PendingProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => { loadProducts(); }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(name), brand:brands(name)')
        .not('seller_id', 'is', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const items = data as any[] || [];

      // Load seller profiles
      const sellerIds = [...new Set(items.map((p: any) => p.seller_id).filter(Boolean))];
      let profiles: Record<string, any> = {};
      if (sellerIds.length > 0) {
        const { data: prof } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', sellerIds);
        (prof || []).forEach((p: any) => { profiles[p.id] = p; });
      }

      setProducts(items.map((p: any) => ({ ...p, seller_profile: profiles[p.seller_id] ?? null })));
    } catch {
      toast({ title: 'Erro', description: 'Não foi possível carregar os produtos', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const setStatus = async (id: string, status: 'approved' | 'rejected') => {
    setProcessing(id);
    const { error } = await supabase.from('products').update({ status }).eq('id', id);
    setProcessing(null);
    if (error) {
      toast({ title: 'Erro', description: 'Não foi possível actualizar o estado', variant: 'destructive' });
    } else {
      toast({
        title: status === 'approved' ? 'Produto aprovado' : 'Produto rejeitado',
        description: status === 'approved' ? 'Já está visível na loja.' : 'O parceiro foi notificado.',
      });
      await loadProducts();
    }
  };

  const pending  = products.filter(p => p.status === 'pending');
  const approved = products.filter(p => p.status === 'approved');
  const rejected = products.filter(p => p.status === 'rejected');

  if (loading) return <div className="text-muted-foreground text-sm p-4">A carregar...</div>;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Pendentes',  count: pending.length,  icon: Clock,        color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950/30' },
          { label: 'Aprovados',  count: approved.length, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
          { label: 'Rejeitados', count: rejected.length, icon: XCircle,      color: 'text-red-500',    bg: 'bg-red-50 dark:bg-red-950/30' },
        ].map(({ label, count, icon: Icon, color, bg }) => (
          <div key={label} className={`flex items-center gap-3 px-4 py-3 rounded-xl border border-border ${bg}`}>
            <Icon className={`w-5 h-5 ${color}`} />
            <div>
              <p className="text-2xl font-black text-foreground leading-none">{count}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending" className="gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Pendentes
            {pending.length > 0 && (
              <span className="ml-1 bg-orange-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">{pending.length}</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved"><CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />Aprovados</TabsTrigger>
          <TabsTrigger value="rejected"><XCircle className="w-3.5 h-3.5 mr-1.5" />Rejeitados</TabsTrigger>
        </TabsList>

        {(['pending', 'approved', 'rejected'] as const).map(tab => (
          <TabsContent key={tab} value={tab} className="mt-4">
            {(tab === 'pending' ? pending : tab === 'approved' ? approved : rejected).length === 0 ? (
              <div className="text-center py-16 text-muted-foreground text-sm flex flex-col items-center gap-2">
                <Package className="w-8 h-8 opacity-30" />
                Sem produtos {tab === 'pending' ? 'pendentes' : tab === 'approved' ? 'aprovados' : 'rejeitados'}.
              </div>
            ) : (
              <div className="grid gap-3">
                {(tab === 'pending' ? pending : tab === 'approved' ? approved : rejected).map(product => (
                  <Card key={product.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex gap-4 p-4">
                        {/* Imagem */}
                        <div className="w-20 h-20 rounded-xl overflow-hidden border border-border bg-muted flex-shrink-0">
                          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3 flex-wrap">
                            <div>
                              <p className="font-bold text-foreground truncate">{product.name}</p>
                              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                {product.category && (
                                  <span className="text-[11px] text-muted-foreground">{product.category.name}</span>
                                )}
                                {product.brand && (
                                  <span className="text-[11px] text-muted-foreground">· {product.brand.name}</span>
                                )}
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="font-black text-foreground text-lg leading-none">
                                {product.price.toLocaleString('pt-AO', { maximumFractionDigits: 0 })} Kz
                              </p>
                              {product.original_price && (
                                <p className="text-xs text-muted-foreground line-through mt-0.5">
                                  {product.original_price.toLocaleString('pt-AO', { maximumFractionDigits: 0 })} Kz
                                </p>
                              )}
                            </div>
                          </div>

                          {product.description && (
                            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{product.description}</p>
                          )}

                          <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                            {/* Parceiro */}
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <User className="w-3.5 h-3.5" />
                              {product.seller_profile?.full_name || product.seller_profile?.email || 'Parceiro desconhecido'}
                            </div>

                            {/* Acções */}
                            {tab === 'pending' && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="gap-1.5 h-8 text-xs"
                                  disabled={processing === product.id}
                                  onClick={() => setStatus(product.id, 'rejected')}
                                >
                                  <XCircle className="w-3.5 h-3.5" /> Rejeitar
                                </Button>
                                <Button
                                  size="sm"
                                  className="gap-1.5 h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                                  disabled={processing === product.id}
                                  onClick={() => setStatus(product.id, 'approved')}
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Aprovar
                                </Button>
                              </div>
                            )}
                            {tab === 'approved' && (
                              <Button
                                size="sm"
                                variant="destructive"
                                className="gap-1.5 h-8 text-xs"
                                disabled={processing === product.id}
                                onClick={() => setStatus(product.id, 'rejected')}
                              >
                                <XCircle className="w-3.5 h-3.5" /> Revogar
                              </Button>
                            )}
                            {tab === 'rejected' && (
                              <Button
                                size="sm"
                                className="gap-1.5 h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                                disabled={processing === product.id}
                                onClick={() => setStatus(product.id, 'approved')}
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" /> Aprovar
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
