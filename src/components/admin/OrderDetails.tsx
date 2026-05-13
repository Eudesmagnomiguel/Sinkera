import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Package, MapPin, CreditCard, Calendar, Truck } from 'lucide-react';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    name: string;
    image_url: string;
  };
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

export function OrderDetails({ orderId, open, onOpenChange, onClose, onStatusUpdate, onUpdate, isReseller }: OrderDetailsProps) {
  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const isOpen = open ?? true;
  const handleOpenChange = (value: boolean) => {
    if (onOpenChange) {
      onOpenChange(value);
    } else if (onClose && !value) {
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen && orderId) {
      loadOrderDetails();
    }
  }, [orderId, isOpen]);

  const loadOrderDetails = async () => {
    try {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select(`
          *,
          profile:profiles(full_name, email, phone)
        `)
        .eq('id', orderId)
        .single();

      if (orderError) throw orderError;

      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select(`
          id,
          quantity,
          price,
          product:products(name, image_url)
        `)
        .eq('order_id', orderId);

      if (itemsError) throw itemsError;

      setOrder(orderData);
      setItems(itemsData as any || []);
    } catch (error) {
      console.error('Error loading order details:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os detalhes do pedido',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      setOrder({ ...order, status: newStatus });
      toast({
        title: 'Estado atualizado',
        description: 'O estado do pedido foi atualizado com sucesso',
      });
      onStatusUpdate?.();
      onUpdate?.();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o estado',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: { variant: 'secondary', label: 'Pendente', color: 'text-yellow-600' },
      processing: { variant: 'default', label: 'Em Processamento', color: 'text-blue-600' },
      shipped: { variant: 'outline', label: 'Enviado', color: 'text-purple-600' },
      completed: { variant: 'outline', label: 'Concluído', color: 'text-green-600' },
      cancelled: { variant: 'destructive', label: 'Cancelado', color: 'text-red-600' },
    };
    return variants[status] || variants.pending;
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-3xl">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!order) return null;

  const statusInfo = getStatusBadge(order.status);
  const address = order.shipping_address || {};

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Pedido #{order.id.slice(0, 8).toUpperCase()}</span>
            <Badge variant={statusInfo.variant} className={statusInfo.color}>
              {statusInfo.label}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Update - Only show for admins */}
          {!isReseller && (
            <>
              <div className="flex items-center gap-3">
                <Truck className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Estado do Pedido:</span>
                <Select value={order.status} onValueChange={updateStatus}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="processing">Em Processamento</SelectItem>
                    <SelectItem value="shipped">Enviado</SelectItem>
                    <SelectItem value="completed">Concluído</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Separator />
            </>
          )}

          {/* Order Info */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium mb-1">Endereço de Entrega</p>
                  <p className="text-sm text-muted-foreground">
                    {address.fullName}<br />
                    {address.phone}<br />
                    {address.address}<br />
                    {address.city}, {address.province}
                    {address.postalCode && ` - ${address.postalCode}`}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium mb-1">Método de Pagamento</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {order.payment_method.replace('_', ' ')}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium mb-1">Data do Pedido</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.created_at).toLocaleString('pt-PT')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium mb-1">Cliente</p>
                  <p className="text-sm text-muted-foreground">
                    {order.profile?.full_name}<br />
                    {order.profile?.email}
                    {order.profile?.phone && <><br />{order.profile.phone}</>}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Order Items */}
          <div>
            <h3 className="font-semibold mb-4">Itens do Pedido</h3>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-3 bg-accent/50 rounded-lg">
                  <img
                    src={item.product.image_url}
                    alt={item.product.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Quantidade: {item.quantity} × {item.price.toLocaleString('pt-AO', { maximumFractionDigits: 0 })} Kz
                    </p>
                  </div>
                  <p className="font-semibold">
                    {(item.price * item.quantity).toLocaleString('pt-AO', { maximumFractionDigits: 0 })} Kz
                  </p>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Total */}
          <div className="flex justify-between items-center text-lg font-bold">
            <span>Total</span>
            <span className="text-2xl">
              {order.total_amount.toLocaleString('pt-AO', { maximumFractionDigits: 0 })} Kz
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
