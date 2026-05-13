import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Star, TrendingUp, Flame, Gift } from 'lucide-react';
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

  if (loading) {
    return <div>A carregar...</div>;
  }

  return (
    <>
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
                  <TableCell>{product.stock_quantity}</TableCell>
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
