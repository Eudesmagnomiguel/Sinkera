import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp, ShoppingCart, Package, Users, Wallet, AlertTriangle, Download } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from 'recharts';

const ORANGE = 'hsl(22 100% 46%)';
const CHART_COLORS = [ORANGE, '#6366f1', '#22d3ee', '#a3e635', '#f59e0b'];

interface Stats {
  totalOrders: number; pendingOrders: number; totalRevenue: number;
  totalProducts: number; totalUsers: number; lowStockProducts: number;
}
interface LowStockProduct { id: string; name: string; image_url: string; stock_quantity: number; categoryName?: string; }
interface OrderByDay { date: string; count: number; revenue: number; }
interface StatusCount { name: string; value: number; }

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendente', processing: 'Em Processo', shipped: 'Enviado',
  completed: 'Entregue', cancelled: 'Cancelado',
};

function Eyebrow({ label }: { label: string }) {
  return (
    <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-muted-foreground mb-3">{label}</p>
  );
}

const fmtKz = (n: number) => `${(n / 1000).toFixed(0)}k Kz`;

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2 shadow-lg text-xs">
      <p className="text-muted-foreground mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="font-bold" style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

export function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ totalOrders: 0, pendingOrders: 0, totalRevenue: 0, totalProducts: 0, totalUsers: 0, lowStockProducts: 0 });
  const [ordersByDay, setOrdersByDay]   = useState<OrderByDay[]>([]);
  const [statusCounts, setStatusCounts] = useState<StatusCount[]>([]);
  const [lowStockItems, setLowStockItems] = useState<LowStockProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadStats(); }, []);

  const loadStats = async () => {
    try {
      const [ordersRes, productsRes, usersRes, lowStockRes] = await Promise.all([
        supabase.from('orders').select('total_amount, status, created_at'),
        supabase.from('products').select('id', { count: 'exact' }),
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('products').select('id', { count: 'exact' }).lte('stock_quantity', 5).eq('in_stock', true),
      ]);

      const orders = ordersRes.data || [];
      const now = new Date();
      const last30 = new Date(now.getTime() - 30 * 86400000);

      setStats({
        totalOrders: orders.length,
        pendingOrders: orders.filter(o => o.status === 'pending').length,
        totalRevenue: orders.reduce((s, o) => s + Number(o.total_amount), 0),
        totalProducts: productsRes.count || 0,
        totalUsers: usersRes.count || 0,
        lowStockProducts: lowStockRes.count || 0,
      });

      const dayMap: Record<string, { count: number; revenue: number }> = {};
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 86400000);
        dayMap[d.toISOString().slice(5, 10)] = { count: 0, revenue: 0 };
      }
      orders.filter(o => new Date(o.created_at) > last30).forEach(o => {
        const key = new Date(o.created_at).toISOString().slice(5, 10);
        if (dayMap[key]) { dayMap[key].count++; dayMap[key].revenue += Number(o.total_amount); }
      });
      setOrdersByDay(Object.entries(dayMap).map(([date, v]) => ({ date, ...v })));

      const sMap: Record<string, number> = {};
      orders.forEach(o => { sMap[o.status] = (sMap[o.status] || 0) + 1; });
      setStatusCounts(Object.entries(sMap).map(([name, value]) => ({ name: STATUS_LABELS[name] || name, value })));

      const { data: lowProds } = await supabase
        .from('products').select('id, name, image_url, stock_quantity, category_id')
        .lte('stock_quantity', 5).eq('in_stock', true).order('stock_quantity', { ascending: true }).limit(10);

      if (lowProds?.length) {
        const catIds = [...new Set(lowProds.map((p: any) => p.category_id).filter(Boolean))];
        const catMap: Record<string, string> = {};
        if (catIds.length) {
          const { data: cats } = await supabase.from('categories').select('id, name').in('id', catIds);
          (cats || []).forEach((c: any) => { catMap[c.id] = c.name; });
        }
        setLowStockItems((lowProds as any[]).map(p => ({ ...p, categoryName: p.category_id ? catMap[p.category_id] || '—' : '—' })));
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const exportLowStock = () => {
    const rows = [['Nome', 'Stock', 'Categoria'],
      ...lowStockItems.map(p => [p.name, String(p.stock_quantity), p.categoryName || '—'])];
    const csv = rows.map(r => r.map(v => `"${v.replace(/"/g, '""')}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    a.download = 'stock_baixo.csv'; a.click();
  };

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: `${ORANGE} transparent transparent transparent` }} />
    </div>
  );

  const KPIS = [
    { label: 'Receita Total',    value: `${stats.totalRevenue.toLocaleString('pt-AO', { maximumFractionDigits: 0 })} Kz`, icon: Wallet,       accent: 'text-emerald-400' },
    { label: 'Total Pedidos',    value: stats.totalOrders,    icon: ShoppingCart, accent: 'text-[hsl(22_100%_46%)]', highlight: true },
    { label: 'Pendentes',        value: stats.pendingOrders,  icon: TrendingUp,   accent: 'text-amber-400'  },
    { label: 'Produtos',         value: stats.totalProducts,  icon: Package,      accent: 'text-violet-400' },
    { label: 'Utilizadores',     value: stats.totalUsers,     icon: Users,        accent: 'text-sky-400'    },
    { label: 'Stock Baixo',      value: stats.lowStockProducts, icon: AlertTriangle, accent: 'text-red-400', warn: stats.lowStockProducts > 0 },
  ];

  const axisStyle = { fill: 'rgba(255,255,255,0.3)', fontSize: 10 };
  const gridStyle = { stroke: 'rgba(255,255,255,0.06)' };

  return (
    <div className="space-y-8">

      {/* KPIs */}
      <div>
        <Eyebrow label="Resumo Geral" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {KPIS.map(({ label, value, icon: Icon, accent, highlight, warn }) => (
            <div key={label} className={`rounded-2xl border p-4 space-y-3 transition-all ${
              highlight ? 'border-[hsl(22_100%_46%)/30%] bg-[hsl(22_100%_46%)/5%]'
              : warn    ? 'border-red-500/20 bg-red-500/5'
              : 'border-border bg-card'
            }`}>
              <div className="flex items-center justify-between">
                <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
                <Icon className={`w-3.5 h-3.5 ${accent}`} />
              </div>
              <p className={`text-xl font-black tracking-tight leading-none ${accent}`}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* Orders bar chart */}
        <div>
          <Eyebrow label="Pedidos — últimos 30 dias" />
          <div className="rounded-2xl border border-border bg-card p-5">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={ordersByDay} barSize={6}>
                <CartesianGrid strokeDasharray="2 4" {...gridStyle} vertical={false} />
                <XAxis dataKey="date" tick={axisStyle} interval={6} axisLine={false} tickLine={false} />
                <YAxis tick={axisStyle} allowDecimals={false} axisLine={false} tickLine={false} width={24} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                <Bar dataKey="count" name="Pedidos" fill={ORANGE} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue line chart */}
        <div>
          <Eyebrow label="Receita — últimos 30 dias" />
          <div className="rounded-2xl border border-border bg-card p-5">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={ordersByDay}>
                <CartesianGrid strokeDasharray="2 4" {...gridStyle} vertical={false} />
                <XAxis dataKey="date" tick={axisStyle} interval={6} axisLine={false} tickLine={false} />
                <YAxis tick={axisStyle} tickFormatter={v => `${(v/1000).toFixed(0)}k`} axisLine={false} tickLine={false} width={36} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />
                <Line type="monotone" dataKey="revenue" name="Receita (Kz)" stroke="#22d3ee" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Status pie + Low stock */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* Status pie */}
        {statusCounts.length > 0 && (
          <div>
            <Eyebrow label="Distribuição de Estados" />
            <div className="rounded-2xl border border-border bg-card p-5">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={statusCounts} cx="50%" cy="50%" outerRadius={72} innerRadius={36} dataKey="value" paddingAngle={3}>
                    {statusCounts.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2 justify-center">
                {statusCounts.map((s, i) => (
                  <div key={s.name} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                    <span className="text-[11px] text-muted-foreground">{s.name} <span className="font-semibold text-foreground">{s.value}</span></span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Low stock */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <Eyebrow label="Alertas de Stock Baixo" />
            {lowStockItems.length > 0 && (
              <button
                onClick={exportLowStock}
                className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
              >
                <Download className="w-3 h-3" /> CSV
              </button>
            )}
          </div>
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            {lowStockItems.length === 0 ? (
              <div className="flex items-center gap-3 p-5">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-emerald-400 text-sm font-black">✓</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Tudo em ordem</p>
                  <p className="text-xs text-muted-foreground">Nenhum produto com stock crítico.</p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {lowStockItems.map(p => (
                  <div key={p.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/20 transition-colors">
                    <div className="w-9 h-9 rounded-xl overflow-hidden border border-border bg-muted flex-shrink-0">
                      <img src={p.image_url} alt={p.name} className="w-full h-full object-contain p-1" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.categoryName}</p>
                    </div>
                    <span className={`text-xs font-black px-2.5 py-1 rounded-full flex-shrink-0 ${
                      p.stock_quantity <= 2
                        ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {p.stock_quantity} un.
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
