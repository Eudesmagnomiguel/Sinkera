import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title?: string;
  comment?: string;
  verified_purchase: boolean;
  helpful_count: number;
  created_at: string;
  profiles?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

export function useReviews(productId?: string) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [userReview, setUserReview] = useState<Review | null>(null);

  useEffect(() => {
    if (productId) {
      loadReviews();
    }
  }, [productId, user]);

  const loadReviews = async () => {
    if (!productId) return;
    
    try {
      const { data: reviewsData, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Load profiles separately
      if (reviewsData && reviewsData.length > 0) {
        const userIds = [...new Set(reviewsData.map(r => r.user_id))];
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', userIds);

        const profilesMap = new Map(
          (profilesData || []).map(p => [p.id, p])
        );

        const enrichedReviews = reviewsData.map(review => ({
          ...review,
          profiles: profilesMap.get(review.user_id) || null,
        })) as Review[];

        setReviews(enrichedReviews);
        
        if (user) {
          const userReviewData = enrichedReviews.find(r => r.user_id === user.id);
          setUserReview(userReviewData || null);
        }
      } else {
        setReviews([]);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const addReview = async (rating: number, title?: string, comment?: string) => {
    if (!user) {
      toast.error('Por favor, faça login para avaliar');
      return;
    }

    if (!productId) return;

    try {
      const { error } = await supabase
        .from('reviews')
        .insert({
          product_id: productId,
          user_id: user.id,
          rating,
          title,
          comment,
        });

      if (error) throw error;
      
      await loadReviews();
      toast.success('Avaliação enviada com sucesso!');
    } catch (error: any) {
      if (error.message.includes('violates')) {
        toast.error('Você precisa comprar este produto para avaliá-lo');
      } else {
        toast.error('Erro ao enviar avaliação');
      }
      console.error('Error adding review:', error);
    }
  };

  const updateReview = async (reviewId: string, rating: number, title?: string, comment?: string) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ rating, title, comment })
        .eq('id', reviewId);

      if (error) throw error;
      
      await loadReviews();
      toast.success('Avaliação atualizada!');
    } catch (error) {
      toast.error('Erro ao atualizar avaliação');
      console.error('Error updating review:', error);
    }
  };

  const deleteReview = async (reviewId: string) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;
      
      await loadReviews();
      toast.success('Avaliação removida');
    } catch (error) {
      toast.error('Erro ao remover avaliação');
      console.error('Error deleting review:', error);
    }
  };

  return {
    reviews,
    loading,
    userReview,
    addReview,
    updateReview,
    deleteReview,
  };
}
