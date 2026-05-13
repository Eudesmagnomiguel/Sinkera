import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

// ── Types ──────────────────────────────────────────────────────────────────
interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title: string | null;
  body: string | null;
  verified_purchase: boolean;
  created_at: string;
  profiles: { full_name: string | null } | null;
}

// ── Star display component ─────────────────────────────────────────────────
function StarDisplay({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const cls = size === 'lg' ? 'w-7 h-7' : size === 'md' ? 'w-5 h-5' : 'w-4 h-4';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`${cls} ${s <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'}`}
        />
      ))}
    </div>
  );
}

// ── Interactive star picker ────────────────────────────────────────────────
function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(s)}
          className="focus:outline-none"
        >
          <Star
            className={`w-7 h-7 transition-colors ${
              s <= (hovered || value) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export function ProductReviews({ productId }: { productId: string }) {
  const { user } = useAuth();
  const { toast } = useToast();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  useEffect(() => {
    loadReviews();
  }, [productId]);

  const loadReviews = async () => {
    setLoading(true);
    const { data } = await (supabase as any)
      .from('product_reviews')
      .select('*, profiles(full_name)')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });
    setReviews(data || []);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (rating === 0) {
      toast({ title: 'Seleciona uma classificação', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await (supabase as any)
        .from('product_reviews')
        .upsert(
          {
            product_id: productId,
            user_id: user.id,
            rating,
            title: title.trim() || null,
            body: body.trim() || null,
          },
          { onConflict: 'product_id,user_id' }
        );
      if (error) throw error;
      toast({ title: 'Avaliação guardada!' });
      setShowForm(false);
      setRating(0);
      setTitle('');
      setBody('');
      loadReviews();
    } catch {
      toast({ title: 'Erro ao guardar avaliação', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Rating summary ─────────────────────────────────────────────────────
  const avg = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  const countFor = (n: number) => reviews.filter((r) => r.rating === n).length;

  // ── Loading skeleton ───────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 rounded-2xl bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      {reviews.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-6 p-5 bg-card border border-border rounded-2xl">
          {/* Average */}
          <div className="flex flex-col items-center justify-center min-w-[100px] gap-1">
            <span className="text-5xl font-black text-foreground">{avg.toFixed(1)}</span>
            <StarDisplay rating={avg} size="md" />
            <span className="text-xs text-muted-foreground mt-1">
              {reviews.length} avaliação{reviews.length !== 1 ? 'ões' : ''}
            </span>
          </div>
          {/* Distribution bars */}
          <div className="flex-1 space-y-1.5">
            {[5, 4, 3, 2, 1].map((n) => {
              const count = countFor(n);
              const pct = reviews.length ? Math.round((count / reviews.length) * 100) : 0;
              return (
                <div key={n} className="flex items-center gap-2 text-sm">
                  <span className="w-3 text-right text-muted-foreground">{n}</span>
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 flex-shrink-0" />
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-8 text-xs text-muted-foreground">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Write review button */}
      {user && !showForm && (
        <Button onClick={() => setShowForm(true)} className="gap-2" variant="outline">
          <Star className="w-4 h-4" />
          Escrever avaliação
        </Button>
      )}

      {/* Review form */}
      {showForm && user && (
        <form
          onSubmit={handleSubmit}
          className="p-5 bg-muted/40 dark:bg-muted/20 border border-border rounded-2xl space-y-4"
        >
          <h4 className="font-semibold text-base">A tua avaliação</h4>
          <div>
            <p className="text-sm text-muted-foreground mb-1.5">Classificação *</p>
            <StarPicker value={rating} onChange={setRating} />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">Título (opcional)</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Resumo da tua experiência"
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">Comentário (opcional)</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={3}
              placeholder="Conta mais sobre o produto..."
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'A guardar…' : 'Publicar avaliação'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setShowForm(false);
                setRating(0);
                setTitle('');
                setBody('');
              }}
            >
              Cancelar
            </Button>
          </div>
        </form>
      )}

      {/* Reviews list */}
      {reviews.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Star className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
          <p className="font-medium">Sem avaliações ainda</p>
          <p className="text-sm mt-1">Sê o primeiro a avaliar este produto.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="p-5 bg-card border border-border rounded-2xl space-y-2"
            >
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="space-y-1">
                  <StarDisplay rating={review.rating} />
                  {review.title && (
                    <p className="font-semibold text-foreground">{review.title}</p>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-medium text-foreground">
                    {review.profiles?.full_name || 'Utilizador verificado'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(review.created_at).toLocaleDateString('pt-PT')}
                  </p>
                </div>
              </div>
              {review.body && (
                <p className="text-sm text-muted-foreground leading-relaxed">{review.body}</p>
              )}
              {review.verified_purchase && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900 px-2.5 py-0.5 rounded-full">
                  ✓ Compra verificada
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
