import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, TrendingUp, Wallet, ShoppingBag, Search, Clock, Truck, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { OrderDetails } from './OrderDetails';
import { useAuth } from '@/hooks/useAuth';

const COMMISSION_RATE = 0.10;

interface Order {
  id: string;
  status: string;
  total_amount: number;
  payment_method: string;
  created_at: string;
  profile: { full_name: string; email: string };
}

const STATUS_CFG: Record<string, { label: string; dot: string }> = {
  pending:    { label: 'Pendente',         dot: 'bg-amber-400'   },
  processing: { label: 'Em Processamento', dot: 'bg-blue-400'    },
  shipped:    { label: 'Enviado',          dot: 'bg-violet-400'  },
  completed:  { label: 'Entregue',         dot: 'bg-emerald-400' },
  cancelled:  { label: 'Cancelado',        dot: 'bg-red-400'     },
};

const PAY_LABELS: Record<string, string> = {
  multicaixa:       'Multicaixa Express',
  bank_transfer:    'Transferência Bancária',
  cash_on_delivery: 'Pagamento na Entrega',
};

const fmtKz = (n: number) => n.toLocaleString('pt-AO', { maximumFractionDigits: 0 }) + ' Kz';
const fmtDate = (s: string) => new Date(s).toLocaleDateString('pt-AO', { day: '2-digit', month: 'short', year: 'numeric' });

export function ResellerOrders() {
  const [orders, setOrders]           = useState<Order[]>([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [selectedId, setSelectedId]   = useState<string | null>(null);
  const { toast }  = useToast();
  const { user }   = useAuth();

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const { data: items } = await supabase
        .from('order_items')
        .select('order_id, products!inner(seller_id)')
        .eq('products.seller_id', user?.id);

      const ids = [...new Set((items || []).map((i: any) => i.order_id))];
      if (!ids.length) { setOrders([]); setLoading(false); return; }

      const { data: ods } = await supabase
        .from('orders').select('*').in('id', ids).order('created_at', { ascending: false });

      const uids = (ods || []).map(o => o.user_id);
      const { data: profs } = await supabase.from('profiles').select('id, full_name, email').in('id', uids);

      setOrders((ods || []).map(o => ({
        ...o,
        profile: profs?.find(p => p.id === o.user_id) || { full_name: 'N/A', email: 'N/A' },
      })) as Order[]);
    } catch {
      toast({ title: 'Erro', description: 'Não foi possível carregar pedidos', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const filtered = orders.filter(o =>
    o.id.toLowerCase().includes(search.toLowerCase()) ||
    o.profile.full_name.toLowerCase().includes(search.toLowerCase()) ||
    o.profile.email.toLowerCase().includes(search.toLowerCase()) ||
    STATUS_CFG[o.status]?.label.toLowerCase().includes(search.toLowerCase())
  );

  const totalSales      = orders.reduce((s, o) => s + o.total_amount, 0);
  const totalCommission = totalSales * COMMISSION_RATE;
  const delivered       = orders.filter(o => o.status === 'completed').length;

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
      <div className="mb-6 space-y-1">
        <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground">Vendas</p>
        <h2 className="text-xl font-black text-foreground tracking-tight">Pedidos</h2>
      </div>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Total de Pedidos', value: orders.length, accent: 'text-primary', icon: ShoppingBag },
          { label: 'Volume de Vendas', value: fmtKz(totalSales), accent: 'text-emerald-600 dark:text-emerald-400', icon: TrendingUp },
          { label: 'Comissão (10%)',   value: fmtKz(totalCommission), accent: 'text-[hsl(22_100%_46%)]', icon: Wallet, highlight: true },
        ].map(({ label, value, accent, icon: Icon, highlight }) => (
          <div key={label}
               className={`rounded-2xl border p-4 space-y-3 ${
                 highlight ? 'border-[hsl(22_100%_46%)/25%] bg-[hsl(22_100%_46%)/4%]' : 'border-border bg-card'
               }`}>
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
              <Icon className={`w-3.5 h-3.5 ${accent}`} />
            </div>
            <p className={`text-2xl font-black tracking-tight ${accent}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* ── Search ── */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Pesquisar por cliente, estado ou ID..."
          className="pl-9 rounded-xl text-sm h-9"
        />
      </div>

      {/* ── Orders list ── */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center">
          <p className="text-sm text-muted-foreground">
            {search ? 'Nenhum pedido encontrado.' : 'Ainda não há pedidos dos teus produtos.'}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">

          {/* Table header */}
          <div className="hidden md:grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-4 items-center px-5 py-2.5 border-b border-border bg-muted/30">
            {['Cliente', 'Total', 'Comissão', 'Pagamento', 'Data', ''].map((h, i) => (
              <span key={i} className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{h}</span>
            ))}
          </div>

          <div className="divide-y divide-border">
            {filtered.map(order => {
              const cfg = STATUS_CFG[order.status] ?? { label: order.status, dot: 'bg-muted-foreground' };
              return (
                <div key={order.id}
                     className="flex md:grid md:grid-cols-[1fr_auto_auto_auto_auto_auto] gap-4 items-center px-5 py-3.5 hover:bg-muted/20 transition-colors">

                  {/* Customer */}
                  <div className="flex-1 md:flex-none min-w-0">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
                      <p className="text-sm font-semibold text-foreground truncate">
                        {order.profile.full_name || order.profile.email}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground pl-3.5">
                      #{order.id.slice(0, 8).toUpperCase()} · {cfg.label}
                    </p>
                  </div>

                  {/* Total */}
                  <span className="hidden md:block text-sm font-bold text-foreground tabular-nums whitespace-nowrap">
                    {fmtKz(order.total_amount)}
                  </span>

                  {/* Commission */}
                  <span className="hidden md:block text-sm font-bold text-[hsl(22_100%_46%)] tabular-nums whitespace-nowrap">
                    +{fmtKz(order.total_amount * COMMISSION_RATE)}
                  </span>

                  {/* Payment */}
                  <span className="hidden md:block text-xs text-muted-foreground whitespace-nowrap">
                    {PAY_LABELS[order.payment_method] ?? order.payment_method}
                  </span>

                  {/* Date */}
                  <span className="hidden md:block text-xs text-muted-foreground whitespace-nowrap">
                    {fmtDate(order.created_at)}
                  </span>

                  {/* Action */}
                  <button
                    onClick={() => setSelectedId(order.id)}
                    className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all ml-auto md:ml-0"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {selectedId && (
        <OrderDetails
          orderId={selectedId}
          onClose={() => setSelectedId(null)}
          onUpdate={load}
          isReseller={true}
        />
      )}
    </>
  );
}
