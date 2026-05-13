import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface WishlistItem {
  id: string;
  product_id: string;
  created_at: string;
}

export function useWishlist() {
  const { user } = useAuth();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadWishlist();
    } else {
      setItems([]);
      setLoading(false);
    }
  }, [user]);

  const loadWishlist = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('wishlist')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setItems((data || []) as WishlistItem[]);
    } catch (error) {
      console.error('Error loading wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (productId: string) => {
    if (!user) {
      toast.error('Por favor, faça login para adicionar aos favoritos');
      return;
    }

    try {
      const { error } = await supabase
        .from('wishlist')
        .insert({ user_id: user.id, product_id: productId });

      if (error) throw error;
      
      await loadWishlist();
      toast.success('Produto adicionado aos favoritos!');
    } catch (error: any) {
      if (error.code === '23505') {
        toast.info('Produto já está nos favoritos');
      } else {
        toast.error('Erro ao adicionar aos favoritos');
        console.error('Error adding to wishlist:', error);
      }
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) throw error;
      
      await loadWishlist();
      toast.success('Produto removido dos favoritos');
    } catch (error) {
      toast.error('Erro ao remover dos favoritos');
      console.error('Error removing from wishlist:', error);
    }
  };

  const isInWishlist = (productId: string) => {
    return items.some(item => item.product_id === productId);
  };

  return {
    items,
    loading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
  };
}
