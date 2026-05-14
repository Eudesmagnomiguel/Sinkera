import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import {
  ShoppingBag, TrendingUp, Wallet, Package,
  Clock, Truck, CheckCircle2, XCircle, Loader2,
  Medal, ArrowUpRight,
} from 'lucide-react';

const COMMISSION_RATE = 0.10;

interface OrderSummary {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
  customerName: string;
}

interface RankEntry { seller_id: string; revenue: number; name: string; }

const STATUS_CFG: Record<string, { label: string; icon: React.ElementType; dot: string }> = {
  pending:    { label: 'Pendente',         icon: Clock,        dot: 'bg-amber-400'   },
  processing: { label: 'Em Processamento', icon: Loader2,      dot: 'bg-blue-400'    },
  shipped:    { label: 'Enviado',          icon: Truck,        dot: 'bg-violet-400'  },
  completed:  { label: 'Entregue',         icon: CheckCircle2, dot: 'bg-emerald-400' },
  cancelled:  { label: 'Cancelado',        icon: XCircle,      dot: 'bg-red-400'     },
};

const fmtKz = (n: number) => n.toLocaleString('pt-AO', { maximumFractionDigits: 0 }) + ' Kz';

// ── Thin section divider ──────────────────────────────────────────────────────
function Eyebrow({ label }: { label: string }) {
  return (
    <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground mb-3">
      {label}
    </p>
  );
}

export function ResellerDashboard() {
  const { user } = useAuth();
  const [loading, setLoading]       = useState(true);
  const [productCount, setPC]       = useState(0);
  const [orders, setOrders]         = useState<OrderSummary[]>([]);
  const [ranking, setRanking]       = useState<RankEntry[]>([]);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    await Promise.all([loadProducts(), loadOrders(), loadRanking()]);
    setLoading(false);
  };

  const loadProducts = async () => {
    const { count } = await supabase
      .from('products').select('id', { count: 'exact', head: true }).eq('seller_id', user?.id);
    setPC(count || 0);
  };

  const loadOrders = async () => {
    const { data: items } = await supabase
      .from('order_items').select('order_id, products!inner(seller_id)').eq('products.seller_id', user?.id);
    const ids = [...new Set((items || []).map((i: any) => i.order_id))];
    if (!ids.length) return;

    const { data: ods } = await supabase
      .from('orders').select('id, status, total_amount, created_at, user_id').in('id', ids)
      .order('created_at', { ascending: false });
    if (!ods?.length) return;

    const { data: profs } = await supabase
      .from('profiles').select('id, full_name').in('id', ods.map(o => o.user_id));

    setOrders(ods.map(o => ({
      id: o.id, status: o.status, total_amount: o.total_amount, created_at: o.created_at,
      customerName: profs?.find(p => p.id === o.user_id)?.full_name || 'Cliente',
    })));
  };

  const loadRanking = async () => {
    const { data } = await supabase
      .from('order_items').select('price, quantity, products!inner(seller_id)') as any;
    if (!data?.length) return;

    const map: Record<string, number> = {};
    for (const item of data) {
      const sid = item.products?.seller_id;
      if (!sid) continue;
      map[sid] = (map[sid] || 0) + item.price * item.quantity;
    }
    const { data: profs } = await supabase
      .from('profiles').select('id, full_name').in('id', Object.keys(map));
    setRanking(
      Object.entries(map)
        .map(([seller_id, revenue]) => ({ seller_id, revenue, name: profs?.find(p => p.id === seller_id)?.full_name || 'Parceiro' }))
        .sort((a, b) => b.revenue - a.revenue).slice(0, 5)
    );
  };

  const totalRevenue = orders.reduce((s, o) => s + o.total_amount, 0);
  const commission   = totalRevenue * COMMISSION_RATE;
  const byStatus     = orders.reduce<Record<string, number>>((acc, o) => { acc[o.status] = (acc[o.status] || 0) + 1; return acc; }, {});
  const myRank       = ranking.findIndex(r => r.seller_id === user?.id) + 1;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const KPIS = [
    { label: 'Produtos Activos',  value: productCount,                              icon: Package,     accent: 'text-primary'            },
    { label: 'Total de Pedidos',  value: orders.length,                             icon: ShoppingBag, accent: 'text-violet-600 dark:text-violet-400' },
    { label: 'Volume de Vendas',  value: fmtKz(totalRevenue),                       icon: TrendingUp,  accent: 'text-emerald-600 dark:text-emerald-400' },
    { label: 'Comissão (10%)',    value: fmtKz(commission),                         icon: Wallet,      accent: 'text-[hsl(22_100%_46%)]', highlight: true },
  ];

  return (
    <div className="space-y-8">

      {/* ── KPIs ── */}
      <div>
        <Eyebrow label="Resumo" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {KPIS.map(({ label, value, icon: Icon, accent, highlight }) => (
            <div
              key={label}
              className={`rounded-2xl border p-5 space-y-3 transition-all ${
                highlight
                  ? 'border-[hsl(22_100%_46%)/30%] bg-[hsl(22_100%_46%)/4%]'
                  : 'border-border bg-card hover:border-border/60'
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {label}
                </p>
                <Icon className={`w-3.5 h-3.5 ${accent}`} />
              </div>
              <p className={`text-2xl font-black tracking-tight leading-none ${accent}`}>
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">

        {/* ── Status breakdown ── */}
        <div>
          <Eyebrow label="Rastreio de Entregas" />
          <div className="rounded-2xl border border-border bg-card divide-y divide-border overflow-hidden">
            {Object.entries(STATUS_CFG).map(([key, { label, icon: Icon, dot }]) => {
              const count = byStatus[key] || 0;
              const pct   = orders.length ? Math.round((count / orders.length) * 100) : 0;
              return (
                <div key={key} className="flex items-center gap-3 px-5 py-3.5">
                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`} />
                  <span className="text-sm text-foreground flex-1">{label}</span>
                  <div className="w-20 h-1 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary/60 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-muted-foreground w-6 text-right tabular-nums">{count}</span>
                </div>
              );
            })}
            {orders.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">Sem pedidos ainda</p>
            )}
          </div>
        </div>

        {/* ── Ranking ── */}
        <div>
          <Eyebrow label="Ranking de Parceiros" />
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            {ranking.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Sem dados de vendas ainda</p>
            ) : (
              <div className="divide-y divide-border">
                {ranking.map((entry, i) => {
                  const isMe   = entry.seller_id === user?.id;
                  const medals = ['text-amber-400', 'text-zinc-400', 'text-amber-600'];
                  return (
                    <div
                      key={entry.seller_id}
                      className={`flex items-center gap-4 px-5 py-3.5 transition-colors ${
                        isMe ? 'bg-primary/5' : 'hover:bg-muted/30'
                      }`}
                    >
                      <div className="w-5 text-center flex-shrink-0">
                        {i < 3
                          ? <Medal className={`w-4 h-4 mx-auto ${medals[i]}`} />
                          : <span className="text-[11px] font-bold text-muted-foreground">#{i + 1}</span>
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${isMe ? 'text-primary' : 'text-foreground'}`}>
                          {isMe ? '· Você' : entry.name}
                        </p>
                        <p className="text-xs text-muted-foreground tabular-nums">{fmtKz(entry.revenue)}</p>
                      </div>
                      {isMe && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-primary/30 text-primary bg-primary/5">
                          #{myRank}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Recent orders ── */}
      <div>
        <Eyebrow label="Pedidos Recentes" />
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          {orders.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-10">Sem pedidos ainda</p>
          ) : (
            <div className="divide-y divide-border">
              {orders.slice(0, 8).map(o => {
                const cfg = STATUS_CFG[o.status] ?? { label: o.status, dot: 'bg-muted-foreground', icon: Clock };
                return (
                  <div key={o.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/20 transition-colors">
                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{o.customerName}</p>
                      <p className="text-xs text-muted-foreground">
                        {cfg.label} · {new Date(o.created_at).toLocaleDateString('pt-AO')}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-foreground tabular-nums">{fmtKz(o.total_amount)}</p>
                      <p className="text-[11px] text-[hsl(22_100%_46%)] font-semibold tabular-nums">
                        +{fmtKz(o.total_amount * COMMISSION_RATE)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
