import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    image_url: string;
    in_stock: boolean;
  };
}

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadCart();
    } else {
      setItems([]);
    }
  }, [user]);

  const loadCart = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('cart')
        .select(`
          id,
          product_id,
          quantity,
          product:products (
            id,
            name,
            price,
            image_url,
            in_stock
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      setItems(data as any || []);
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId: string, quantity: number = 1) => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para adicionar produtos ao carrinho",
        variant: "destructive",
      });
      return;
    }

    try {
      const existingItem = items.find(item => item.product_id === productId);

      if (existingItem) {
        await updateQuantity(existingItem.id, existingItem.quantity + quantity);
        return;
      }

      // upsert — evita erro de unique constraint se o item já existir na BD
      const { data: upserted, error } = await supabase
        .from('cart')
        .upsert(
          { user_id: user.id, product_id: productId, quantity },
          { onConflict: 'user_id,product_id', ignoreDuplicates: false }
        )
        .select('id, quantity')
        .single();

      if (error) throw error;

      await loadCart();
      toast({
        title: "Produto adicionado",
        description: "O produto foi adicionado ao carrinho.",
      });
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Erro",
        description: error?.message ?? "Não foi possível adicionar o produto ao carrinho",
        variant: "destructive",
      });
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    try {
      const { error } = await supabase
        .from('cart')
        .delete()
        .eq('id', cartItemId);

      if (error) throw error;
      
      await loadCart();
      toast({
        title: "Produto removido",
        description: "O produto foi removido do carrinho",
      });
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o produto",
        variant: "destructive",
      });
    }
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    if (quantity < 1) {
      await removeFromCart(cartItemId);
      return;
    }

    try {
      const { error } = await supabase
        .from('cart')
        .update({ quantity })
        .eq('id', cartItemId);

      if (error) throw error;
      
      await loadCart();
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a quantidade",
        variant: "destructive",
      });
    }
  };

  const clearCart = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('cart')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
      
      setItems([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const total = items.reduce((sum, item) => {
    return sum + (item.product.price * item.quantity);
  }, 0);

  return (
    <CartContext.Provider value={{ items, loading, addToCart, removeFromCart, updateQuantity, clearCart, total }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
