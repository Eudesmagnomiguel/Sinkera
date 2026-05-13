import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Loader2, ShoppingCart } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useWishlist } from "@/hooks/useWishlist";
import { useCart } from "@/hooks/useCart";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/hooks/useProducts";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export default function Wishlist() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { items, loading: wishlistLoading, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (items.length > 0) {
      loadProducts();
    } else {
      setProducts([]);
      setLoadingProducts(false);
    }
  }, [items]);

  const loadProducts = async () => {
    try {
      const productIds = items.map(item => item.product_id);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .in('id', productIds);

      if (error) throw error;
      setProducts((data || []) as Product[]);
    } catch (error) {
      console.error('Error loading wishlist products:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleAddToCart = async (productId: string) => {
    await addToCart(productId);
  };

  const handleRemove = async (productId: string) => {
    await removeFromWishlist(productId);
  };

  if (authLoading || wishlistLoading || loadingProducts) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header searchQuery="" setSearchQuery={() => {}} />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Heart className="h-8 w-8 text-primary" />
            Meus Favoritos
          </h1>
          <p className="text-muted-foreground">
            {products.length} {products.length === 1 ? 'produto' : 'produtos'} na sua lista de desejos
          </p>
        </div>

        {products.length === 0 ? (
          <Card className="p-12 text-center">
            <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-semibold mb-2">Sua lista está vazia</h2>
            <p className="text-muted-foreground mb-6">
              Adicione produtos aos favoritos para salvá-los aqui
            </p>
            <Button onClick={() => navigate("/produtos")}>
              Explorar Produtos
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden group">
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {!product.in_stock && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="text-white font-semibold">Esgotado</span>
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <h3 
                    className="font-semibold mb-2 line-clamp-2 cursor-pointer hover:text-primary transition-colors"
                    onClick={() => navigate(`/produto/${product.id}`)}
                  >
                    {product.name}
                  </h3>
                  
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-2xl font-bold text-primary">
                      {product.price.toLocaleString('pt-AO')} Kz
                    </span>
                    {product.original_price && (
                      <span className="text-sm text-muted-foreground line-through">
                        {product.original_price.toLocaleString('pt-AO')} Kz
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleAddToCart(product.id)}
                      disabled={!product.in_stock}
                      className="flex-1"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Adicionar
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleRemove(product.id)}
                    >
                      <Heart className="h-4 w-4 fill-current" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
