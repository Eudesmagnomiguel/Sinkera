import { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import {
  Package, Clock, CheckCircle2, XCircle, Truck, RefreshCw,
  ChevronRight, ShoppingBag, MapPin, CreditCard, ChevronDown, ChevronUp, Printer, FileText,
} from 'lucide-react';
import { printFinalInvoice } from '@/lib/invoice';

interface OrderItem {
  quantity: number;
  price: number;
  product: { name: string; image_url: string };
}

interface Order {
  id: string;
  status: string;
  total_amount: number;
  payment_method: string;
  shipping_address: any;
  created_at: string;
  order_items: OrderItem[];
}

const STATUS_META: Record<string, { label: string; icon: React.ElementType; color: string; bg: string; border: string; step: number }> = {
  pending:    { label: 'Pendente',         icon: Clock,        color: 'text-amber-600  dark:text-amber-400',  bg: 'bg-amber-50  dark:bg-amber-950/30',  border: 'border-amber-200  dark:border-amber-800', step: 0 },
  confirmed:  { label: 'Confirmado',       icon: CheckCircle2, color: 'text-blue-600   dark:text-blue-400',   bg: 'bg-blue-50   dark:bg-blue-950/30',   border: 'border-blue-200   dark:border-blue-800',  step: 1 },
  shipped:    { label: 'Em Transporte',    icon: Truck,        color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-950/30', border: 'border-violet-200 dark:border-violet-800', step: 2 },
  delivered:  { label: 'Entregue',         icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-200 dark:border-emerald-800', step: 3 },
  cancelled:  { label: 'Cancelado',        icon: XCircle,      color: 'text-red-600    dark:text-red-400',    bg: 'bg-red-50    dark:bg-red-950/30',    border: 'border-red-200    dark:border-red-800',    step: -1 },
};

const TRACK_STEPS = [
  { key: 'pending',   label: 'Pedido recebido',    icon: Package },
  { key: 'confirmed', label: 'A preparar',         icon: RefreshCw },
  { key: 'shipped',   label: 'Em transporte',      icon: Truck },
  { key: 'delivered', label: 'Entregue',           icon: CheckCircle2 },
];

const PAYMENT_LABELS: Record<string, string> = {
  multicaixa: 'Multicaixa Express',
  bank_transfer: 'Transferência Bancária',
  cash_on_delivery: 'Pagamento na Entrega',
};

const fmtKz = (n: number) => n.toLocaleString('pt-AO', { maximumFractionDigits: 0 }) + ' Kz';
const fmtDate = (d: string) => new Date(d).toLocaleDateString('pt-PT', { day: 'numeric', month: 'short', year: 'numeric' });

export default function MyOrders() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => { if (user) load(); }, [user]);

  const load = async () => {
    const { data } = await supabase
      .from('orders')
      .select(`id, status, total_amount, payment_method, shipping_address, created_at,
        order_items(quantity, price, product:products(name, image_url))`)
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });
    setOrders(data as any || []);
    setLoading(false);
  };

  const printReceipt = (order: Order) => {
    const win = window.open('', '_blank');
    if (!win) return;
    const shortId = order.id.split('-')[0].toUpperCase();
    const addr = order.shipping_address;
    const itemRows = order.order_items.map((item) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;">${item.product.name}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;">${item.price.toLocaleString('pt-AO', { maximumFractionDigits: 0 })} Kz</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;font-weight:600;">${(item.price * item.quantity).toLocaleString('pt-AO', { maximumFractionDigits: 0 })} Kz</td>
      </tr>`).join('');

    win.document.write(`<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8" />
  <title>Recibo #${shortId}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #111; background: #fff; padding: 40px; font-size: 14px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; padding-bottom: 20px; border-bottom: 2px solid #111; }
    .logo { font-size: 28px; font-weight: 900; letter-spacing: -1px; color: #111; }
    .logo span { color: #7c3aed; }
    .receipt-info { text-align: right; }
    .receipt-info h2 { font-size: 20px; font-weight: 800; margin-bottom: 4px; }
    .receipt-info p { color: #555; font-size: 13px; }
    .section { margin-bottom: 24px; }
    .section-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #888; margin-bottom: 8px; }
    .address-box { background: #f9f9f9; border-radius: 8px; padding: 14px 16px; font-size: 13px; line-height: 1.6; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
    thead th { background: #111; color: #fff; padding: 10px 12px; text-align: left; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.4px; }
    thead th:last-child, thead th:nth-child(3), thead th:nth-child(2) { text-align: right; }
    thead th:nth-child(2) { text-align: center; }
    tbody tr:hover { background: #f5f5f5; }
    .total-row { display: flex; justify-content: flex-end; }
    .total-box { background: #f0ebff; border-radius: 10px; padding: 14px 20px; min-width: 240px; }
    .total-box .line { display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 13px; color: #555; }
    .total-box .grand { display: flex; justify-content: space-between; font-size: 18px; font-weight: 900; color: #111; border-top: 1px solid #d8d0f0; padding-top: 10px; margin-top: 4px; }
    .payment-section { margin-top: 24px; padding-top: 16px; border-top: 1px solid #eee; display: flex; justify-content: space-between; }
    .payment-method { font-size: 13px; color: #555; }
    .payment-method strong { color: #111; font-size: 14px; }
    .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #aaa; padding-top: 20px; border-top: 1px solid #eee; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">SINKE<span>RA</span></div>
    <div class="receipt-info">
      <h2>Recibo de Encomenda</h2>
      <p>#${shortId}</p>
      <p>${fmtDate(order.created_at)}</p>
    </div>
  </div>

  ${addr ? `
  <div class="section">
    <div class="section-title">Morada de Entrega</div>
    <div class="address-box">
      <strong>${addr.fullName || ''}</strong><br/>
      ${addr.address || ''}<br/>
      ${addr.city || ''}${addr.city && addr.province ? ', ' : ''}${addr.province || ''}${addr.phone ? '<br/>Tel: ' + addr.phone : ''}
    </div>
  </div>` : ''}

  <div class="section">
    <div class="section-title">Artigos Encomendados</div>
    <table>
      <thead>
        <tr>
          <th>Produto</th>
          <th style="text-align:center;">Qtd</th>
          <th style="text-align:right;">Preço Unit.</th>
          <th style="text-align:right;">Subtotal</th>
        </tr>
      </thead>
      <tbody>${itemRows}</tbody>
    </table>
  </div>

  <div class="total-row">
    <div class="total-box">
      <div class="line"><span>Subtotal</span><span>${order.order_items.reduce((s, i) => s + i.price * i.quantity, 0).toLocaleString('pt-AO', { maximumFractionDigits: 0 })} Kz</span></div>
      <div class="line"><span>Entrega</span><span>Grátis</span></div>
      <div class="grand"><span>Total</span><span>${order.total_amount.toLocaleString('pt-AO', { maximumFractionDigits: 0 })} Kz</span></div>
    </div>
  </div>

  <div class="payment-section">
    <div class="payment-method">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.4px;color:#aaa;margin-bottom:3px;">Método de Pagamento</div>
      <strong>${PAYMENT_LABELS[order.payment_method] ?? order.payment_method}</strong>
    </div>
    <div style="font-size:11px;color:#aaa;text-align:right;">Estado: <strong style="color:#059669;">${STATUS_META[order.status]?.label ?? order.status}</strong></div>
  </div>

  <div class="footer">
    Obrigado pela sua compra na Sinkera &bull; www.sinkera.ao &bull; suporte@sinkera.ao
  </div>
</body>
</html>`);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 400);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  const FILTER_TABS = [
    { id: 'all', label: 'Todos', count: orders.length },
    { id: 'pending', label: 'Pendentes', count: orders.filter(o => o.status === 'pending').length },
    { id: 'shipped', label: 'Em Transporte', count: orders.filter(o => o.status === 'shipped').length },
    { id: 'delivered', label: 'Entregues', count: orders.filter(o => o.status === 'delivered').length },
  ];

  const visible = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  return (
    <div className="min-h-screen bg-muted/30 dark:bg-background">
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <main className="container mx-auto px-4 py-8 mt-20 max-w-3xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-foreground">Minhas Encomendas</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{orders.length} encomenda{orders.length !== 1 ? 's' : ''} no total</p>
          </div>
          <Link to="/produtos">
            <Button variant="outline" size="sm" className="gap-1.5 rounded-xl">
              <ShoppingBag className="w-3.5 h-3.5" /> Comprar mais
            </Button>
          </Link>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-5 no-scrollbar">
          {FILTER_TABS.map(({ id, label, count }) => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                filter === id
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card border-border text-muted-foreground hover:border-primary/30 hover:text-foreground'
              }`}
            >
              {label}
              {count > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  filter === id ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>{count}</span>
              )}
            </button>
          ))}
        </div>

        {/* Empty */}
        {visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-5">
              <Package className="w-10 h-10 text-muted-foreground/40" />
            </div>
            <h2 className="text-lg font-bold mb-1">
              {filter === 'all' ? 'Nenhuma encomenda' : 'Sem encomendas neste estado'}
            </h2>
            <p className="text-sm text-muted-foreground mb-5">
              {filter === 'all' ? 'As suas compras aparecerão aqui.' : 'Experimente outro filtro.'}
            </p>
            {filter === 'all' && (
              <Link to="/produtos">
                <Button variant="vibrant" className="gap-2 px-8">
                  <ShoppingBag className="w-4 h-4" /> Explorar Produtos
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {visible.map((order) => {
              const meta = STATUS_META[order.status] ?? STATUS_META.pending;
              const StatusIcon = meta.icon;
              const isOpen = expanded === order.id;
              const shortId = order.id.split('-')[0].toUpperCase();
              const addr = order.shipping_address;
              const isCancelled = order.status === 'cancelled';

              return (
                <div key={order.id} className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/20 hover:shadow-sm transition-all">

                  {/* Header row */}
                  <div
                    className="flex items-center gap-3 px-5 py-4 cursor-pointer select-none"
                    onClick={() => setExpanded(isOpen ? null : order.id)}
                  >
                    {/* Status icon */}
                    <div className={`w-10 h-10 rounded-xl ${meta.bg} flex items-center justify-center flex-shrink-0`}>
                      <StatusIcon className={`w-5 h-5 ${meta.color}`} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-black text-foreground">#{shortId}</span>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${meta.color} ${meta.bg} ${meta.border}`}>
                          {meta.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                        <span>{fmtDate(order.created_at)}</span>
                        <span>·</span>
                        <span>{order.order_items.reduce((s, i) => s + i.quantity, 0)} artigo{order.order_items.reduce((s, i) => s + i.quantity, 0) !== 1 ? 's' : ''}</span>
                      </div>
                    </div>

                    {/* Total + toggle */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="font-black text-foreground text-sm">{fmtKz(order.total_amount)}</span>
                      {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </div>

                  {/* Expanded content */}
                  {isOpen && (
                    <div className="border-t border-border">

                      {/* Tracking bar */}
                      {!isCancelled && (
                        <div className="px-5 py-4 bg-muted/30">
                          <div className="flex items-center gap-0">
                            {TRACK_STEPS.map((s, i) => {
                              const currentStep = meta.step;
                              const done = i <= currentStep;
                              const active = i === currentStep;
                              const StepIcon = s.icon;
                              return (
                                <div key={s.key} className="flex items-center flex-1 last:flex-none">
                                  <div className="flex flex-col items-center gap-1">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                                      done ? 'bg-primary text-primary-foreground' : 'bg-muted border border-border text-muted-foreground'
                                    } ${active ? 'ring-2 ring-primary/30' : ''}`}>
                                      <StepIcon className="w-3.5 h-3.5" />
                                    </div>
                                    <span className={`text-[9px] font-semibold text-center leading-tight max-w-[50px] ${done ? 'text-primary' : 'text-muted-foreground'}`}>
                                      {s.label}
                                    </span>
                                  </div>
                                  {i < TRACK_STEPS.length - 1 && (
                                    <div className={`flex-1 h-0.5 mx-1 rounded-full mb-4 ${i < currentStep ? 'bg-primary' : 'bg-border'}`} />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Products */}
                      <div className="divide-y divide-border">
                        {order.order_items.map((item, idx) => (
                          <div key={idx} className="flex gap-3 px-5 py-3">
                            <div className="w-14 h-14 rounded-xl overflow-hidden bg-muted flex-shrink-0 border border-border">
                              <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-foreground line-clamp-2 leading-snug">{item.product.name}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">Qtd: {item.quantity}</p>
                            </div>
                            <p className="text-sm font-bold text-foreground flex-shrink-0">
                              {fmtKz(item.price * item.quantity)}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Footer: delivery + payment */}
                      <div className="px-5 py-4 border-t border-border bg-muted/20 grid sm:grid-cols-2 gap-4">
                        {addr && (
                          <div>
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground mb-1.5">
                              <MapPin className="w-3.5 h-3.5" /> Entrega
                            </div>
                            <p className="text-xs text-foreground font-semibold">{addr.fullName}</p>
                            <p className="text-xs text-muted-foreground">{addr.address}</p>
                            <p className="text-xs text-muted-foreground">{addr.city}, {addr.province}</p>
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground mb-1.5">
                            <CreditCard className="w-3.5 h-3.5" /> Pagamento
                          </div>
                          <p className="text-xs text-foreground font-semibold">
                            {PAYMENT_LABELS[order.payment_method] ?? order.payment_method}
                          </p>
                          <p className="text-sm font-black text-foreground mt-1">{fmtKz(order.total_amount)}</p>
                          <div className="flex gap-2 mt-3 flex-wrap">
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1.5 rounded-xl text-xs"
                              onClick={() => printReceipt(order)}
                            >
                              <Printer className="w-3.5 h-3.5" />
                              Imprimir Recibo
                            </Button>
                            {(order.status === 'confirmed' || order.status === 'shipped' || order.status === 'delivered') && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1.5 rounded-xl text-xs border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                                onClick={() => printFinalInvoice({
                                  orderId: order.id,
                                  createdAt: order.created_at,
                                  status: order.status,
                                  items: order.order_items.map(i => ({
                                    name: i.product.name,
                                    price: i.price,
                                    quantity: i.quantity,
                                  })),
                                  totalAmount: order.total_amount,
                                  paymentMethod: order.payment_method,
                                  shippingAddress: order.shipping_address,
                                })}
                              >
                                <FileText className="w-3.5 h-3.5" />
                                Ver Factura Final
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
