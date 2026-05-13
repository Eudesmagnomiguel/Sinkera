import { Star, ThumbsUp, MoreVertical } from "lucide-react";
import { Review } from "@/hooks/useReviews";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface ReviewsListProps {
  reviews: Review[];
  currentUserId?: string;
  onEdit?: (review: Review) => void;
  onDelete?: (reviewId: string) => void;
}

export const ReviewsList = ({ reviews, currentUserId, onEdit, onDelete }: ReviewsListProps) => {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Seja o primeiro a avaliar este produto
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review.id} className="border-b pb-6 last:border-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex gap-3 flex-1">
              <Avatar>
                <AvatarImage src={review.profiles?.avatar_url || undefined} />
                <AvatarFallback>
                  {review.profiles?.full_name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold">
                    {review.profiles?.full_name || "Utilizador"}
                  </p>
                  {review.verified_purchase && (
                    <Badge variant="secondary" className="text-xs">
                      Compra Verificada
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= review.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(review.created_at), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </span>
                </div>

                {review.title && (
                  <h4 className="font-semibold mb-2">{review.title}</h4>
                )}
                
                {review.comment && (
                  <p className="text-sm text-muted-foreground mb-3">
                    {review.comment}
                  </p>
                )}

                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <ThumbsUp className="h-4 w-4" />
                    <span>Útil ({review.helpful_count})</span>
                  </button>
                </div>
              </div>
            </div>

            {currentUserId === review.user_id && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onEdit && (
                    <DropdownMenuItem onClick={() => onEdit(review)}>
                      Editar
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem
                      onClick={() => onDelete(review.id)}
                      className="text-destructive"
                    >
                      Excluir
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
