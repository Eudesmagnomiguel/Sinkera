import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ReviewFormProps {
  onSubmit: (rating: number, title?: string, comment?: string) => void;
  initialRating?: number;
  initialTitle?: string;
  initialComment?: string;
  isEditing?: boolean;
}

export const ReviewForm = ({
  onSubmit,
  initialRating = 0,
  initialTitle = "",
  initialComment = "",
  isEditing = false,
}: ReviewFormProps) => {
  const [rating, setRating] = useState(initialRating);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [title, setTitle] = useState(initialTitle);
  const [comment, setComment] = useState(initialComment);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating > 0) {
      onSubmit(rating, title, comment);
      if (!isEditing) {
        setRating(0);
        setTitle("");
        setComment("");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Sua Avaliação *</Label>
        <div className="flex gap-1 mt-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`h-8 w-8 ${
                  star <= (hoveredRating || rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="title">Título da Avaliação</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Resuma sua experiência"
          maxLength={100}
        />
      </div>

      <div>
        <Label htmlFor="comment">Comentário</Label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Conte mais sobre sua experiência com este produto"
          rows={4}
          maxLength={500}
        />
      </div>

      <Button type="submit" disabled={rating === 0}>
        {isEditing ? "Atualizar Avaliação" : "Enviar Avaliação"}
      </Button>
    </form>
  );
};
