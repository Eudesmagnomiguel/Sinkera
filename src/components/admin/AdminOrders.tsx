import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { OrderDetails } from './OrderDetails';
import { Eye, Search, Download } from 'lucide-react';

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

export function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Get unique user IDs
      const userIds = [...new Set(ordersData?.map(o => o.user_id))];
      
      // Fetch profiles for these users
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Combine orders with profiles
      const ordersWithProfiles = ordersData?.map(order => ({
        ...order,
        profile: profilesData?.find(p => p.id === order.user_id) || { full_name: '-', email: '-' }
      }));

      setOrders(ordersWithProfiles as any || []);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as encomendas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      order.id.toLowerCase().includes(searchLower) ||
      order.profile?.full_name?.toLowerCase().includes(searchLower) ||
      order.profile?.email?.toLowerCase().includes(searchLower) ||
      order.status.toLowerCase().includes(searchLower)
    );
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: { variant: 'secondary', label: 'Pendente' },
      processing: { variant: 'default', label: 'Em Processamento' },
      shipped: { variant: 'outline', label: 'Enviado' },
      completed: { variant: 'outline', label: 'Concluído' },
      cancelled: { variant: 'destructive', label: 'Cancelado' },
    };
    return variants[status] || variants.pending;
  };

  const exportCSV = () => {
    const escape = (val: string) => `"${String(val).replace(/"/g, '""')}"`;

    const headers = ['ID', 'Data', 'Estado', 'Total (Kz)', 'Pagamento', 'Cliente'];
    const rows = orders.map((order) => {
      const shippingAddress = (order as any).shipping_address;
      const clientName =
        shippingAddress?.fullName ||
        order.profile?.full_name ||
        '-';
      return [
        escape(`#${order.id.slice(0, 8).toUpperCase()}`),
        escape(new Date(order.created_at).toLocaleDateString('pt-PT')),
        escape(order.status),
        escape(String(order.total_amount)),
        escape(order.payment_method.replace('_', ' ')),
        escape(clientName),
      ].join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `encomendas-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div>A carregar...</div>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Gestão de Pedidos</CardTitle>
            <Button variant="outline" size="sm" onClick={exportCSV} className="gap-2">
              <Download className="h-4 w-4" />
              Exportar CSV
            </Button>
          </div>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Pesquisar por ID, cliente, email ou estado..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
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
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Nenhum pedido encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => {
                    const statusInfo = getStatusBadge(order.status);
                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-xs">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </TableCell>
                        <TableCell className="font-medium">
                          {order.profile?.full_name || '-'}
                        </TableCell>
                        <TableCell>{order.profile?.email || '-'}</TableCell>
                        <TableCell className="font-semibold">
                          {order.total_amount.toLocaleString('pt-AO', { maximumFractionDigits: 0 })} Kz
                        </TableCell>
                        <TableCell className="capitalize">
                          {order.payment_method.replace('_', ' ')}
                        </TableCell>
                        <TableCell>
                          {new Date(order.created_at).toLocaleDateString('pt-PT')}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusInfo.variant}>
                            {statusInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedOrderId(order.id)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Detalhes
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {selectedOrderId && (
        <OrderDetails
          orderId={selectedOrderId}
          open={!!selectedOrderId}
          onOpenChange={(open) => !open && setSelectedOrderId(null)}
          onStatusUpdate={loadOrders}
        />
      )}
    </>
  );
}
