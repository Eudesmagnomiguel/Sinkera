import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Star, TrendingUp, Flame, Gift, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ProductDialog } from './ProductDialog';

interface Product {
  id: string;
  name: string;
  price: number;
  original_price?: number;
  description?: string;
  image_url: string;
  in_stock: boolean;
  stock_quantity: number;
  category_id?: string;
  brand_id?: string;
  is_featured: boolean;
  is_bestseller: boolean;
  is_special_offer: boolean;
  is_trending: boolean;
  category: { name: string } | null;
  brand: { name: string } | null;
}

export function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined);
  const { toast } = useToast();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(name),
          brand:brands(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data as any || []);
    } catch (error) {
      console.error('Error loading products:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os produtos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedProduct(undefined);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja eliminar este produto?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await loadProducts();
      toast({
        title: "Produto eliminado",
        description: "O produto foi eliminado com sucesso",
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Erro",
        description: "Não foi possível eliminar o produto",
        variant: "destructive",
      });
    }
  };

  const lowStockProducts = products.filter(p => p.stock_quantity <= 10 && p.stock_quantity > 0);
  const outOfStockProducts = products.filter(p => p.stock_quantity <= 0 || !p.in_stock);

  if (loading) {
    return <div>A carregar...</div>;
  }

  return (
    <>
      {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
        <div className="flex flex-wrap gap-3 mb-4">
          {outOfStockProducts.length > 0 && (
            <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm font-medium px-4 py-2.5 rounded-xl">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              {outOfStockProducts.length} produto{outOfStockProducts.length > 1 ? 's' : ''} esgotado{outOfStockProducts.length > 1 ? 's' : ''}
            </div>
          )}
          {lowStockProducts.length > 0 && (
            <div className="flex items-center gap-2 bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300 text-sm font-medium px-4 py-2.5 rounded-xl">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              {lowStockProducts.length} produto{lowStockProducts.length > 1 ? 's' : ''} com stock baixo (≤10)
            </div>
          )}
        </div>
      )}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Produtos</CardTitle>
          <Button variant="vibrant" className="gap-2" onClick={handleAdd}>
            <Plus className="w-4 h-4" />
            Adicionar Produto
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Marca</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Especial</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.category?.name || '-'}</TableCell>
                  <TableCell>{product.brand?.name || '-'}</TableCell>
                  <TableCell>
                    {product.price.toLocaleString('pt-AO', { maximumFractionDigits: 0 })} Kz
                  </TableCell>
                  <TableCell>
                    <span className={`font-semibold ${product.stock_quantity <= 0 ? 'text-red-600' : product.stock_quantity <= 10 ? 'text-orange-500' : 'text-foreground'}`}>
                      {product.stock_quantity}
                      {product.stock_quantity <= 10 && product.stock_quantity > 0 && <AlertTriangle className="w-3.5 h-3.5 inline ml-1" />}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {product.is_featured && <Flame className="w-4 h-4 text-orange-500" />}
                      {product.is_bestseller && <Star className="w-4 h-4 text-yellow-500" />}
                      {product.is_special_offer && <Gift className="w-4 h-4 text-pink-500" />}
                      {product.is_trending && <TrendingUp className="w-4 h-4 text-blue-500" />}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.in_stock ? "default" : "destructive"}>
                      {product.in_stock ? 'Em Stock' : 'Esgotado'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="icon" variant="outline" onClick={() => handleEdit(product)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="destructive"
                        onClick={() => handleDelete(product.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ProductDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen}
        product={selectedProduct}
        onSuccess={loadProducts}
      />
    </>
  );
}
