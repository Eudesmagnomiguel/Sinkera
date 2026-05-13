import { useState, useEffect, useRef } from 'react';
import { Zap, Clock, ShoppingCart, Flame } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/hooks/useCart';

// ── Types ──────────────────────────────────────────────────────────────────
interface SaleProduct {
  id: string;
  name: string;
  price: number;
  original_price: number | null;
  image_url: string;
  badge: string | null;
  discount_percent?: number | null;
}

// ── Countdown helpers ──────────────────────────────────────────────────────
function getMidnightEnd(): Date {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

function getTimeLeft(end: Date) {
  const diff = Math.max(0, end.getTime() - Date.now());
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const s = Math.floor((diff % 60_000) / 1_000);
  return { h, m, s };
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

// ── CountdownBox ───────────────────────────────────────────────────────────
function CountdownBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-black/80 dark:bg-black/60 text-white font-mono font-black text-2xl sm:text-3xl w-14 sm:w-16 h-14 sm:h-16 rounded-xl flex items-center justify-center shadow-inner">
        {pad(value)}
      </div>
      <span className="text-[10px] uppercase tracking-widest text-red-200 mt-1">{label}</span>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export function FlashSaleSection() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<SaleProduct[]>([]);
  const [loaded, setLoaded] = useState(false);
  const endRef = useRef<Date>(getMidnightEnd());
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(endRef.current));
  const [addedId, setAddedId] = useState<string | null>(null);

  // Fetch products
  useEffect(() => {
    (async () => {
      const { data } = await (supabase as any)
        .from('products')
        .select('id, name, price, original_price, image_url, badge, discount_percent')
        .or('badge.eq.Flash Sale,discount_percent.gt.0')
        .order('discount_percent', { ascending: false })
        .limit(4);
      setProducts(data || []);
      setLoaded(true);
    })();
  }, []);

  // Countdown
  useEffect(() => {
    const tick = setInterval(() => {
      setTimeLeft(getTimeLeft(endRef.current));
    }, 1000);
    return () => clearInterval(tick);
  }, []);

  const handleAdd = async (productId: string) => {
    await addToCart(productId, 1);
    setAddedId(productId);
    setTimeout(() => setAddedId(null), 1800);
  };

  if (loaded && products.length === 0) return null;

  return (
    <section className="rounded-3xl overflow-hidden bg-gradient-to-br from-red-600 via-red-500 to-orange-500 dark:from-red-800 dark:via-red-700 dark:to-orange-700 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-5 pt-5 pb-4 sm:px-8 sm:pt-6">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-yellow-300 fill-yellow-300" />
              <span className="font-black text-xl text-white tracking-tight uppercase">Flash Sale</span>
            </div>
            <p className="text-xs text-red-100 font-medium">Descontos por tempo limitado</p>
          </div>
        </div>

        {/* Countdown */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-red-100 text-xs font-medium mr-1">
            <Clock className="w-3.5 h-3.5" />
            Termina em
          </div>
          <div className="flex items-center gap-1.5">
            <CountdownBox value={timeLeft.h} label="horas" />
            <span className="text-white font-black text-2xl pb-4">:</span>
            <CountdownBox value={timeLeft.m} label="min" />
            <span className="text-white font-black text-2xl pb-4">:</span>
            <CountdownBox value={timeLeft.s} label="seg" />
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="px-4 pb-5 sm:px-6 sm:pb-6">
        {!loaded ? (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex-shrink-0 w-44 h-60 rounded-2xl bg-white/10 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 overflow-x-auto sm:overflow-visible">
            {products.map((p) => {
              const discount = p.original_price
                ? Math.round(((p.original_price - p.price) / p.original_price) * 100)
                : (p.discount_percent ?? 0);
              const isAdded = addedId === p.id;

              return (
                <div
                  key={p.id}
                  className="flex-shrink-0 bg-white dark:bg-card rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow group"
                >
                  {/* Image */}
                  <div className="relative aspect-square bg-gray-50 dark:bg-muted overflow-hidden">
                    <img
                      src={p.image_url}
                      alt={p.name}
                      className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                    />
                    {discount > 0 && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow">
                        -{discount}%
                      </div>
                    )}
                  </div>
                  {/* Info */}
                  <div className="p-3 space-y-1.5">
                    <p className="text-xs font-semibold text-foreground line-clamp-2 leading-tight">{p.name}</p>
                    <div>
                      <p className="text-base font-black text-foreground">
                        {p.price.toLocaleString('pt-AO')} Kz
                      </p>
                      {p.original_price && (
                        <p className="text-xs text-muted-foreground line-through">
                          {p.original_price.toLocaleString('pt-AO')} Kz
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleAdd(p.id)}
                      className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
                        isAdded
                          ? 'bg-emerald-500 text-white'
                          : 'bg-red-500 hover:bg-red-600 text-white'
                      }`}
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      {isAdded ? 'Adicionado ✓' : 'Adicionar'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
