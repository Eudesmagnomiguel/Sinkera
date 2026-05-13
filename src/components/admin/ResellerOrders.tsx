import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { OrderDetails } from './OrderDetails';
import { useAuth } from '@/hooks/useAuth';

interface Order {
  id: string;
  status: string;
  total_amount: number;
  payment_method: string;
  created_at: string;
  profile: {
    full_name: string;
    email: string;
  };
}

export function ResellerOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      // Get orders that contain products from this reseller
      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select(`
          order_id,
          products!inner (
            seller_id
          )
        `)
        .eq('products.seller_id', user?.id);

      if (itemsError) throw itemsError;

      const orderIds = [...new Set(orderItems?.map(item => item.order_id) || [])];

      if (orderIds.length === 0) {
        setOrders([]);
        setLoading(false);
        return;
      }

      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .in('id', orderIds)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Get profiles for each order
      const userIds = ordersData?.map(order => order.user_id) || [];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds);

      const ordersWithProfiles = ordersData?.map(order => ({
        ...order,
        profile: profiles?.find(p => p.id === order.user_id) || { full_name: 'N/A', email: 'N/A' }
      })) || [];

      setOrders(ordersWithProfiles as Order[]);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os pedidos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order =>
    order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.profile.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.profile.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      pending: { variant: "secondary", label: "Pendente" },
      processing: { variant: "default", label: "Em Processamento" },
      shipped: { variant: "outline", label: "Enviado" },
      delivered: { variant: "default", label: "Entregue" },
      cancelled: { variant: "destructive", label: "Cancelado" }
    };
    const config = variants[status] || { variant: "secondary" as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return <div>A carregar...</div>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Pedidos dos Meus Produtos</CardTitle>
          <Input
            placeholder="Buscar pedidos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mt-4"
          />
        </CardHeader>
        <CardContent>
          {filteredOrders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? 'Nenhum pedido encontrado.' : 'Ainda não há pedidos dos seus produtos.'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID do Pedido</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Pagamento</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-sm">
                      {order.id.slice(0, 8)}...
                    </TableCell>
                    <TableCell>{order.profile.full_name}</TableCell>
                    <TableCell>{order.profile.email}</TableCell>
                    <TableCell>
                      {order.total_amount.toLocaleString('pt-AO', { maximumFractionDigits: 0 })} Kz
                    </TableCell>
                    <TableCell className="capitalize">{order.payment_method}</TableCell>
                    <TableCell>
                      {new Date(order.created_at).toLocaleDateString('pt-AO')}
                    </TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => setSelectedOrderId(order.id)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {selectedOrderId && (
        <OrderDetails
          orderId={selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
          onUpdate={loadOrders}
          isReseller={true}
        />
      )}
    </>
  );
}
