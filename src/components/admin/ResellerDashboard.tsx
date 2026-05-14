import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import {
  ShoppingBag, TrendingUp, Wallet, Package, Trophy, Clock,
  Truck, CheckCircle2, XCircle, Loader2, BarChart3, Medal,
} from 'lucide-react';

const COMMISSION_RATE = 0.10;

interface OrderSummary {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
  customerName: string;
}

interface RankEntry {
  seller_id: string;
  revenue: number;
  name: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending:    { label: 'Pendente',          color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950/40',  icon: Clock },
  processing: { label: 'Em Processamento',  color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40',       icon: Loader2 },
  shipped:    { label: 'Enviado',           color: 'text-violet-600 bg-violet-50 dark:bg-violet-950/40', icon: Truck },
  delivered:  { label: 'Entregue',          color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40', icon: CheckCircle2 },
  cancelled:  { label: 'Cancelado',         color: 'text-red-600 bg-red-50 dark:bg-red-950/40',          icon: XCircle },
};

export function ResellerDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [productCount, setProductCount] = useState(0);
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [ranking, setRanking] = useState<RankEntry[]>([]);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    await Promise.all([loadProducts(), loadOrders(), loadRanking()]);
    setLoading(false);
  };

  const loadProducts = async () => {
    const { count } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('seller_id', user?.id);
    setProductCount(count || 0);
  };

  const loadOrders = async () => {
    const { data: items } = await supabase
      .from('order_items')
      .select('order_id, products!inner(seller_id)')
      .eq('products.seller_id', user?.id);

    const ids = [...new Set((items || []).map((i: any) => i.order_id))];
    if (!ids.length) return;

    const { data: ordersData } = await supabase
      .from('orders')
      .select('id, status, total_amount, created_at, user_id')
      .in('id', ids)
      .order('created_at', { ascending: false });

    if (!ordersData?.length) return;

    const userIds = ordersData.map((o) => o.user_id);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', userIds);

    setOrders(
      ordersData.map((o) => ({
        id: o.id,
        status: o.status,
        total_amount: o.total_amount,
        created_at: o.created_at,
        customerName: profiles?.find((p) => p.id === o.user_id)?.full_name || 'Cliente',
      }))
    );
  };

  const loadRanking = async () => {
    const { data } = await supabase
      .from('order_items')
      .select('price, quantity, products!inner(seller_id)') as any;

    if (!data?.length) return;

    const map: Record<string, number> = {};
    for (const item of data) {
      const sid = item.products?.seller_id;
      if (!sid) continue;
      map[sid] = (map[sid] || 0) + item.price * item.quantity;
    }

    const { data: profs } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', Object.keys(map));

    const entries: RankEntry[] = Object.entries(map)
      .map(([seller_id, revenue]) => ({
        seller_id,
        revenue,
        name: profs?.find((p) => p.id === seller_id)?.full_name || 'Parceiro',
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    setRanking(entries);
  };

  const totalRevenue = orders.reduce((s, o) => s + o.total_amount, 0);
  const commission = totalRevenue * COMMISSION_RATE;
  const byStatus = orders.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});
  const myRank = ranking.findIndex((r) => r.seller_id === user?.id) + 1;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Produtos', value: productCount, icon: Package, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40' },
          { label: 'Pedidos', value: orders.length, icon: ShoppingBag, color: 'text-violet-600 bg-violet-50 dark:bg-violet-950/40' },
          { label: 'Volume de Vendas', value: `${totalRevenue.toLocaleString('pt-AO', { maximumFractionDigits: 0 })} Kz`, icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40' },
          { label: 'Comissão (10%)', value: `${commission.toLocaleString('pt-AO', { maximumFractionDigits: 0 })} Kz`, icon: Wallet, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40', highlight: true },
        ].map(({ label, value, icon: Icon, color, highlight }) => (
          <Card key={label} className={highlight ? 'border-amber-200 dark:border-amber-800' : ''}>
            <CardContent className="flex items-center gap-3 pt-5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground truncate">{label}</p>
                <p className={`text-lg font-black truncate ${highlight ? 'text-amber-600' : ''}`}>{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Delivery status breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Truck className="w-4 h-4 text-primary" /> Rastreio de Entregas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.keys(STATUS_CONFIG).map((key) => {
              const cfg = STATUS_CONFIG[key];
              const count = byStatus[key] || 0;
              const pct = orders.length ? Math.round((count / orders.length) * 100) : 0;
              const Icon = cfg.icon;
              return (
                <div key={key} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{cfg.label}</span>
                      <span className="text-xs text-muted-foreground">{count} pedidos</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary/60 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
            {orders.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">Sem pedidos ainda</p>
            )}
          </CardContent>
        </Card>

        {/* Sales ranking */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="w-4 h-4 text-primary" /> Ranking de Parceiros
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {ranking.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">Sem dados de vendas ainda</p>
            )}
            {ranking.map((entry, i) => {
              const isMe = entry.seller_id === user?.id;
              const medal = i === 0 ? 'text-yellow-500' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-amber-600' : 'text-muted-foreground';
              return (
                <div
                  key={entry.seller_id}
                  className={`flex items-center gap-3 p-2 rounded-xl transition-colors ${isMe ? 'bg-primary/5 border border-primary/20' : 'hover:bg-muted/40'}`}
                >
                  <div className="w-7 h-7 flex items-center justify-center flex-shrink-0">
                    {i < 3 ? <Medal className={`w-5 h-5 ${medal}`} /> : <span className="text-xs font-bold text-muted-foreground">#{i + 1}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${isMe ? 'text-primary' : ''}`}>
                      {isMe ? 'Você' : entry.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{entry.revenue.toLocaleString('pt-AO', { maximumFractionDigits: 0 })} Kz em vendas</p>
                  </div>
                  {isMe && <Badge variant="outline" className="text-primary border-primary/30 text-xs">#{myRank}</Badge>}
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Recent orders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShoppingBag className="w-4 h-4 text-primary" /> Pedidos Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">Sem pedidos ainda</p>
          ) : (
            <div className="space-y-2">
              {orders.slice(0, 8).map((o) => {
                const cfg = STATUS_CONFIG[o.status] || { label: o.status, color: '', icon: Clock };
                const Icon = cfg.icon;
                return (
                  <div key={o.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/40 transition-colors">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.color}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{o.customerName}</p>
                      <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString('pt-AO')}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold">{o.total_amount.toLocaleString('pt-AO', { maximumFractionDigits: 0 })} Kz</p>
                      <p className="text-xs text-amber-600 font-medium">{(o.total_amount * COMMISSION_RATE).toLocaleString('pt-AO', { maximumFractionDigits: 0 })} Kz comissão</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
