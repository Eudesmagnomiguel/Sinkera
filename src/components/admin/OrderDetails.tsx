import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Package, MapPin, CreditCard, Calendar, Truck, Save } from 'lucide-react';
import { notifyOrderStatus } from '@/lib/notifications';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: { name: string; image_url: string };
}

interface OrderDetailsProps {
  orderId: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
  onStatusUpdate?: () => void;
  onUpdate?: () => void;
  isReseller?: boolean;
}

const STATUS_CONFIG: Record<string, { variant: any; label: string; color: string }> = {
  pending:    { variant: 'secondary',   label: 'Pendente',            color: 'text-yellow-600' },
  processing: { variant: 'default',     label: 'Em Processamento',    color: 'text-blue-600'   },
  shipped:    { variant: 'outline',     label: 'Enviado',             color: 'text-purple-600' },
  completed:  { variant: 'outline',     label: 'Concluído',           color: 'text-green-600'  },
  cancelled:  { variant: 'destructive', label: 'Cancelado',           color: 'text-red-600'    },
};

// Resellers can only advance to shipped
const RESELLER_STATUSES = ['shipped'];
const ADMIN_STATUSES    = ['pending', 'processing', 'shipped', 'completed', 'cancelled'];

export function OrderDetails({
  orderId, open, onOpenChange, onClose, onStatusUpdate, onUpdate, isReseller,
}: OrderDetailsProps) {
  const [order, setOrder]           = useState<any>(null);
  const [items, setItems]           = useState<OrderItem[]>([]);
  const [loading, setLoading]       = useState(true);
  const [trackingCode, setTracking] = useState('');
  const [trackingNotes, setNotes]   = useState('');
  const [savingTrack, setSaving]    = useState(false);
  const { toast } = useToast();

  const isOpen = open ?? true;
  const handleOpenChange = (v: boolean) => {
    if (onOpenChange) onOpenChange(v);
    else if (onClose && !v) onClose();
  };

  useEffect(() => {
    if (isOpen && orderId) loadOrderDetails();
  }, [orderId, isOpen]);

  const loadOrderDetails = async () => {
    setLoading(true);
    try {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*, profile:profiles(full_name, email, phone)')
        .eq('id', orderId)
        .single();
      if (orderError) throw orderError;

      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select('id, quantity, price, product:products(name, image_url)')
        .eq('order_id', orderId);
      if (itemsError) throw itemsError;

      setOrder(orderData);
      setTracking(orderData.tracking_code ?? '');
      setNotes(orderData.tracking_notes ?? '');
      setItems(itemsData as any || []);
    } catch {
      toast({ title: 'Erro', description: 'Não foi possível carregar os detalhes do pedido', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    try {
      const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
      if (error) throw error;
      setOrder((o: any) => ({ ...o, status: newStatus }));
      // Auto-notify customer
      await notifyOrderStatus(order.user_id, newStatus);
      toast({ title: 'Estado atualizado', description: `Pedido marcado como "${STATUS_CONFIG[newStatus]?.label ?? newStatus}". Cliente notificado.` });
      onStatusUpdate?.();
      onUpdate?.();
    } catch {
      toast({ title: 'Erro', description: 'Não foi possível atualizar o estado', variant: 'destructive' });
    }
  };

  const saveTracking = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ tracking_code: trackingCode || null, tracking_notes: trackingNotes || null })
        .eq('id', orderId);
      if (error) throw error;
      toast({ title: 'Tracking guardado' });
      onUpdate?.();
    } catch {
      toast({ title: 'Erro', description: 'Não foi possível guardar o tracking', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-3xl">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!order) return null;

  const statusInfo = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
  const address = order.shipping_address || {};
  const availableStatuses = isReseller ? RESELLER_STATUSES : ADMIN_STATUSES;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Pedido #{order.id.slice(0, 8).toUpperCase()}</span>
            <Badge variant={statusInfo.variant} className={statusInfo.color}>{statusInfo.label}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">

          {/* ── Status update ── */}
          {!isReseller ? (
            <>
              <div className="flex items-center gap-3 flex-wrap">
                <Truck className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium text-sm">Estado:</span>
                <Select value={order.status} onValueChange={updateStatus}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ADMIN_STATUSES.map(s => (
                      <SelectItem key={s} value={s}>{STATUS_CONFIG[s]?.label ?? s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-xs text-muted-foreground">O cliente é notificado automaticamente.</span>
              </div>
              <Separator />
            </>
          ) : (
            /* Reseller: can only mark as shipped */
            order.status === 'processing' && (
              <>
                <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-800">
                  <Truck className="h-5 w-5 text-blue-500 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-blue-700 dark:text-blue-400">Pronto para enviar?</p>
                    <p className="text-xs text-muted-foreground">Marque como Enviado após despachar o produto.</p>
                  </div>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
                    onClick={() => updateStatus('shipped')}>
                    <Truck className="w-3.5 h-3.5" /> Marcar Enviado
                  </Button>
                </div>
                <Separator />
              </>
            )
          )}

          {/* ── Tracking ── */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Truck className="w-4 h-4 text-muted-foreground" /> Rastreamento / Tracking
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Código de Rastreamento</Label>
                <Input
                  value={trackingCode}
                  onChange={e => setTracking(e.target.value)}
                  placeholder="Ex: AO123456789"
                  className="rounded-xl text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Notas de Entrega</Label>
                <Input
                  value={trackingNotes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Ex: Entregue ao porteiro"
                  className="rounded-xl text-sm"
                />
              </div>
            </div>
            <Button size="sm" variant="outline" className="gap-1.5 rounded-xl" onClick={saveTracking} disabled={savingTrack}>
              <Save className="w-3.5 h-3.5" /> {savingTrack ? 'A guardar...' : 'Guardar Tracking'}
            </Button>
          </div>

          <Separator />

          {/* ── Order info ── */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium mb-1 text-sm">Endereço de Entrega</p>
                  <p className="text-sm text-muted-foreground">
                    {address.fullName}<br />{address.phone}<br />
                    {address.address}<br />{address.city}, {address.province}
                    {address.postalCode && ` - ${address.postalCode}`}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium mb-1 text-sm">Método de Pagamento</p>
                  <p className="text-sm text-muted-foreground capitalize">{order.payment_method.replace('_', ' ')}</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium mb-1 text-sm">Data do Pedido</p>
                  <p className="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleString('pt-PT')}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium mb-1 text-sm">Cliente</p>
                  <p className="text-sm text-muted-foreground">
                    {order.profile?.full_name}<br />{order.profile?.email}
                    {order.profile?.phone && <><br />{order.profile.phone}</>}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* ── Items ── */}
          <div>
            <h3 className="font-semibold mb-4 text-sm">Itens do Pedido</h3>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-3 bg-accent/50 rounded-lg">
                  <img src={item.product.image_url} alt={item.product.name} className="w-16 h-16 object-cover rounded" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.quantity} × {item.price.toLocaleString('pt-AO', { maximumFractionDigits: 0 })} Kz
                    </p>
                  </div>
                  <p className="font-semibold text-sm">
                    {(item.price * item.quantity).toLocaleString('pt-AO', { maximumFractionDigits: 0 })} Kz
                  </p>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="flex justify-between items-center text-lg font-bold">
            <span>Total</span>
            <span className="text-2xl">{order.total_amount.toLocaleString('pt-AO', { maximumFractionDigits: 0 })} Kz</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
