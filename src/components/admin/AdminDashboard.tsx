import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, ShoppingCart, Package, Users, DollarSign, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

interface Stats {
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalUsers: number;
  recentOrders: number;
  lowStockProducts: number;
}

interface LowStockProduct {
  id: string;
  name: string;
  image_url: string;
  stock_quantity: number;
  category_id: string | null;
  categoryName?: string;
}

interface OrderByDay {
  date: string;
  count: number;
  revenue: number;
}

interface StatusCount {
  name: string;
  value: number;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];
const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendente',
  confirmed: 'Confirmado',
  shipped: 'Enviado',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
};

export function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0, pendingOrders: 0, totalRevenue: 0,
    totalProducts: 0, totalUsers: 0, recentOrders: 0, lowStockProducts: 0,
  });
  const [ordersByDay, setOrdersByDay] = useState<OrderByDay[]>([]);
  const [statusCounts, setStatusCounts] = useState<StatusCount[]>([]);
  const [revenueByDay, setRevenueByDay] = useState<OrderByDay[]>([]);
  const [lowStockItems, setLowStockItems] = useState<LowStockProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadStats(); }, []);

  const loadStats = async () => {
    try {
      const [ordersData, productsData, usersData, lowStockData] = await Promise.all([
        supabase.from('orders').select('total_amount, status, created_at'),
        supabase.from('products').select('id', { count: 'exact' }),
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('products').select('id', { count: 'exact' }).lte('stock_quantity', 5).eq('in_stock', true),
      ]);

      const orders = ordersData.data || [];
      const now = new Date();
      const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      setStats({
        totalOrders: orders.length,
        pendingOrders: orders.filter(o => o.status === 'pending').length,
        totalRevenue: orders.reduce((sum, o) => sum + Number(o.total_amount), 0),
        totalProducts: productsData.count || 0,
        totalUsers: usersData.count || 0,
        recentOrders: orders.filter(o => new Date(o.created_at) > last7Days).length,
        lowStockProducts: lowStockData.count || 0,
      });

      // Orders by day (last 30 days)
      const dayMap: Record<string, { count: number; revenue: number }> = {};
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const key = d.toISOString().slice(5, 10);
        dayMap[key] = { count: 0, revenue: 0 };
      }
      orders.filter(o => new Date(o.created_at) > last30Days).forEach(o => {
        const key = new Date(o.created_at).toISOString().slice(5, 10);
        if (dayMap[key]) {
          dayMap[key].count++;
          dayMap[key].revenue += Number(o.total_amount);
        }
      });
      const days = Object.entries(dayMap).map(([date, v]) => ({ date, ...v }));
      setOrdersByDay(days);
      setRevenueByDay(days);

      // Status distribution
      const sMap: Record<string, number> = {};
      orders.forEach(o => { sMap[o.status] = (sMap[o.status] || 0) + 1; });
      setStatusCounts(Object.entries(sMap).map(([name, value]) => ({ name: STATUS_LABELS[name] || name, value })));

      // Low stock products detail
      const { data: lowProds } = await supabase
        .from('products')
        .select('id, name, image_url, stock_quantity, category_id')
        .lte('stock_quantity', 5)
        .eq('in_stock', true)
        .order('stock_quantity', { ascending: true })
        .limit(10);

      if (lowProds && lowProds.length > 0) {
        const catIds = [...new Set(lowProds.map((p: any) => p.category_id).filter(Boolean))];
        const catMap: Record<string, string> = {};
        if (catIds.length > 0) {
          const { data: cats } = await supabase.from('categories').select('id, name').in('id', catIds);
          (cats || []).forEach((c: any) => { catMap[c.id] = c.name; });
        }
        setLowStockItems((lowProds as any[]).map((p) => ({
          ...p,
          categoryName: p.category_id ? catMap[p.category_id] || '—' : '—',
        })));
      } else {
        setLowStockItems([]);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>A carregar estatísticas...</div>;

  const statCards = [
    { title: 'Receita Total', value: `${stats.totalRevenue.toLocaleString('pt-AO', { maximumFractionDigits: 0 })} Kz`, icon: DollarSign, color: 'text-green-600', bgColor: 'bg-green-100' },
    { title: 'Total de Pedidos', value: stats.totalOrders.toString(), icon: ShoppingCart, color: 'text-blue-600', bgColor: 'bg-blue-100' },
    { title: 'Pedidos Pendentes', value: stats.pendingOrders.toString(), icon: TrendingUp, color: 'text-orange-600', bgColor: 'bg-orange-100' },
    { title: 'Produtos', value: stats.totalProducts.toString(), icon: Package, color: 'text-purple-600', bgColor: 'bg-purple-100' },
    { title: 'Utilizadores', value: stats.totalUsers.toString(), icon: Users, color: 'text-indigo-600', bgColor: 'bg-indigo-100' },
    { title: 'Stock Baixo', value: stats.lowStockProducts.toString(), icon: AlertTriangle, color: 'text-red-600', bgColor: 'bg-red-100' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Visão Geral</h2>
        <p className="text-muted-foreground">Estatísticas principais da loja</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`${stat.bgColor} p-2 rounded-lg`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Orders Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pedidos (últimos 30 dias)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={ordersByDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={4} />
                <YAxis allowDecimals={false} />
                <Tooltip formatter={(v: number) => [v, 'Pedidos']} />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Receita (últimos 30 dias)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={revenueByDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={4} />
                <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => [`${v.toLocaleString('pt-AO')} Kz`, 'Receita']} />
                <Line type="monotone" dataKey="revenue" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        {statusCounts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Estado dos Pedidos</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={statusCounts} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {statusCounts.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Low Stock Alert Section */}
      <Card className="border-amber-200 dark:border-amber-800">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            Produtos com Stock Baixo
            {lowStockItems.length > 0 && (
              <span className="ml-auto text-xs font-bold bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 px-2.5 py-1 rounded-full">
                {lowStockItems.length} produto{lowStockItems.length !== 1 ? 's' : ''}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {lowStockItems.length === 0 ? (
            <div className="flex items-center gap-3 py-4 px-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center flex-shrink-0">
                <span className="text-emerald-600 text-lg">✓</span>
              </div>
              <div>
                <p className="font-semibold text-emerald-700 dark:text-emerald-400">Tudo em ordem</p>
                <p className="text-sm text-emerald-600/70 dark:text-emerald-500/70">Nenhum produto com stock crítico no momento.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {lowStockItems.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-4 p-3 rounded-xl border border-border hover:bg-muted/30 transition-colors"
                >
                  {/* Thumbnail */}
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted border border-border flex-shrink-0">
                    <img
                      src={p.image_url}
                      alt={p.name}
                      className="w-full h-full object-contain p-1"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground line-clamp-1">{p.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{p.categoryName}</p>
                  </div>

                  {/* Stock badge */}
                  <div className="flex-shrink-0 text-right">
                    <span
                      className={`text-sm font-black px-3 py-1 rounded-full ${
                        p.stock_quantity <= 2
                          ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                      }`}
                    >
                      {p.stock_quantity} un.
                    </span>
                  </div>

                  {/* Action */}
                  <a
                    href="/admin?tab=products"
                    className="flex-shrink-0 text-xs font-semibold text-primary hover:underline whitespace-nowrap"
                  >
                    Gerir Stock
                  </a>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
