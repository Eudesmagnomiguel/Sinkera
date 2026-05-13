import { useState } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Minus, Plus, Trash2, ShoppingBag, ChevronRight, ShieldCheck,
  Truck, RotateCcw, Tag, Gift, ArrowLeft, Package, Sparkles, Heart,
} from 'lucide-react';

interface Coupon {
  id: string;
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  expires_at?: string | null;
  min_order_amount?: number | null;
  max_uses?: number | null;
  uses_count?: number | null;
}

const TRUST_BADGES = [
  { icon: ShieldCheck, label: "Compra Segura", desc: "Pagamento encriptado" },
  { icon: Truck, label: "Envio Grátis", desc: "Em todas as encomendas" },
  { icon: RotateCcw, label: "Devoluções", desc: "30 dias sem custo" },
];

export default function Cart() {
  const { user, loading: authLoading } = useAuth();
  const { items, loading, removeFromCart, updateQuantity, total } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [activeCoupon, setActiveCoupon] = useState<Coupon | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [applyingPromo, setApplyingPromo] = useState(false);

  const [giftCardCode, setGiftCardCode] = useState('');
  const [giftCardApplied, setGiftCardApplied] = useState(false);
  const [giftCardDiscount, setGiftCardDiscount] = useState(0);
  const [giftCardId, setGiftCardId] = useState<string | null>(null);
  const [applyingGiftCard, setApplyingGiftCard] = useState(false);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">A carregar carrinho...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  const handleRemove = async (id: string) => {
    setRemovingId(id);
    await removeFromCart(id);
    setRemovingId(null);
  };

  const applyPromo = async () => {
    if (!promoCode.trim()) return;
    setApplyingPromo(true);
    try {
      const { data: coupon, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', promoCode.trim().toUpperCase())
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;

      if (!coupon) {
        toast({ title: 'Cupão inválido ou inactivo', variant: 'destructive' });
        return;
      }

      if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
        toast({ title: 'Cupão expirado', variant: 'destructive' });
        return;
      }

      if (coupon.min_order_amount != null && total < coupon.min_order_amount) {
        toast({
          title: `Mínimo de ${coupon.min_order_amount.toLocaleString('pt-AO', { maximumFractionDigits: 0 })} Kz necessário`,
          variant: 'destructive',
        });
        return;
      }

      if (coupon.max_uses != null && (coupon.uses_count ?? 0) >= coupon.max_uses) {
        toast({ title: 'Cupão esgotado', variant: 'destructive' });
        return;
      }

      setActiveCoupon(coupon as Coupon);
      setPromoApplied(true);
      toast({ title: 'Cupão aplicado com sucesso!' });
    } catch (err) {
      console.error(err);
      toast({ title: 'Erro ao validar cupão', variant: 'destructive' });
    } finally {
      setApplyingPromo(false);
    }
  };

  const removePromo = () => {
    setPromoApplied(false);
    setActiveCoupon(null);
    setPromoCode('');
  };

  const applyGiftCard = async () => {
    if (!giftCardCode.trim()) return;
    setApplyingGiftCard(true);
    try {
      const { data: gc, error } = await supabase
        .from('gift_cards' as any)
        .select('*')
        .eq('code', giftCardCode.trim().toUpperCase())
        .eq('is_active', true)
        .maybeSingle();
      if (error) throw error;
      if (!gc) { toast({ title: 'Gift Card inválido ou inactivo', variant: 'destructive' }); return; }
      if (gc.expires_at && new Date(gc.expires_at) < new Date()) { toast({ title: 'Gift Card expirado', variant: 'destructive' }); return; }
      if (gc.remaining_value <= 0) { toast({ title: 'Gift Card sem saldo', variant: 'destructive' }); return; }
      setGiftCardId(gc.id);
      setGiftCardDiscount(Math.min(gc.remaining_value, total));
      setGiftCardApplied(true);
      toast({ title: `Gift Card aplicado! Saldo: ${gc.remaining_value.toLocaleString('pt-AO', { maximumFractionDigits: 0 })} Kz` });
    } catch { toast({ title: 'Erro ao validar Gift Card', variant: 'destructive' }); }
    finally { setApplyingGiftCard(false); }
  };

  const removeGiftCard = () => {
    setGiftCardApplied(false);
    setGiftCardDiscount(0);
    setGiftCardId(null);
    setGiftCardCode('');
  };

  const computeDiscount = (): number => {
    if (!promoApplied || !activeCoupon) return 0;
    if (activeCoupon.type === 'percent') return Math.round(total * activeCoupon.value / 100);
    if (activeCoupon.type === 'fixed') return Math.min(activeCoupon.value, total);
    return 0;
  };

  const discount = computeDiscount();
  const finalTotal = Math.max(0, total - discount - (giftCardApplied ? giftCardDiscount : 0));
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="min-h-screen bg-muted/30 dark:bg-background">
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <main className="container mx-auto px-4 py-6 mt-20 max-w-6xl">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground transition-colors">Início</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground font-medium">Carrinho</span>
        </nav>

        {/* Title */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground">Carrinho de Compras</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {itemCount} {itemCount === 1 ? 'artigo' : 'artigos'} no carrinho
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/produtos')} className="gap-1.5 text-muted-foreground hidden sm:flex">
            <ArrowLeft className="w-4 h-4" />
            Continuar a comprar
          </Button>
        </div>

        {/* Empty state */}
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
              <ShoppingBag className="w-12 h-12 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-bold mb-2">O seu carrinho está vazio</h2>
            <p className="text-muted-foreground mb-6 max-w-xs">
              Adicione produtos incríveis para começar a sua experiência de compras.
            </p>
            <Button onClick={() => navigate('/produtos')} variant="vibrant" size="lg" className="gap-2 px-8">
              <Sparkles className="w-4 h-4" />
              Explorar Produtos
            </Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6 items-start">

            {/* Cart items */}
            <div className="lg:col-span-2 space-y-3">

              {/* Select all row */}
              <div className="flex items-center justify-between bg-card border border-border rounded-2xl px-4 py-3">
                <span className="text-sm font-semibold text-foreground">
                  {itemCount} {itemCount === 1 ? 'artigo selecionado' : 'artigos selecionados'}
                </span>
                <button
                  onClick={() => items.forEach(i => handleRemove(i.id))}
                  className="text-xs text-destructive hover:text-destructive/80 font-medium transition-colors"
                >
                  Remover tudo
                </button>
              </div>

              {items.map((item) => {
                const subtotal = item.product.price * item.quantity;
                const isRemoving = removingId === item.id;

                return (
                  <div
                    key={item.id}
                    className={`bg-card border border-border rounded-2xl overflow-hidden transition-all duration-300 ${isRemoving ? 'opacity-40 scale-[0.98]' : 'opacity-100'}`}
                  >
                    <div className="p-4 sm:p-5 flex gap-4">
                      {/* Product image */}
                      <Link to={`/produto/${item.product.id}`} className="flex-shrink-0 group">
                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-muted border border-border">
                          <img
                            src={item.product.image_url}
                            alt={item.product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      </Link>

                      {/* Info */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <Link to={`/produto/${item.product.id}`}>
                            <h3 className="font-semibold text-foreground text-sm sm:text-base leading-snug hover:text-primary transition-colors line-clamp-2">
                              {item.product.name}
                            </h3>
                          </Link>
                          {item.product.category && (
                            <span className="inline-block mt-1 text-[11px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                              {item.product.category}
                            </span>
                          )}
                          <div className="flex items-baseline gap-2 mt-2">
                            <span className="text-lg sm:text-xl font-black text-foreground">
                              {item.product.price.toLocaleString('pt-AO', { maximumFractionDigits: 0 })} Kz
                            </span>
                            {item.product.original_price && item.product.original_price > item.product.price && (
                              <span className="text-xs text-muted-foreground line-through">
                                {item.product.original_price.toLocaleString('pt-AO', { maximumFractionDigits: 0 })} Kz
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Controls row */}
                        <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                          {/* Quantity */}
                          <div className="flex items-center bg-muted rounded-xl overflow-hidden border border-border">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="w-8 h-8 flex items-center justify-center hover:bg-muted-foreground/10 disabled:opacity-30 transition-colors"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-10 text-center text-sm font-bold select-none">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center hover:bg-muted-foreground/10 transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Subtotal + actions */}
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-primary hidden sm:block">
                              {subtotal.toLocaleString('pt-AO', { maximumFractionDigits: 0 })} Kz
                            </span>
                            <button
                              onClick={() => handleRemove(item.id)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                              title="Remover"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <button
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-colors"
                              title="Guardar nos favoritos"
                            >
                              <Heart className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Subtotal mobile footer */}
                    <div className="sm:hidden border-t border-border px-4 py-2.5 flex items-center justify-between bg-muted/40">
                      <span className="text-xs text-muted-foreground">Subtotal</span>
                      <span className="text-sm font-bold text-primary">
                        {subtotal.toLocaleString('pt-AO', { maximumFractionDigits: 0 })} Kz
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Continue shopping (mobile) */}
              <Button
                variant="outline"
                className="w-full sm:hidden gap-2"
                onClick={() => navigate('/produtos')}
              >
                <ArrowLeft className="w-4 h-4" />
                Continuar a Comprar
              </Button>
            </div>

            {/* Order summary */}
            <div className="lg:col-span-1 space-y-4">

              {/* Promo code */}
              <div className="bg-card border border-border rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-bold">Código Promocional</h3>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    placeholder="Ex: SINKERA10"
                    disabled={promoApplied}
                    className="flex-1 text-sm px-3 py-2 rounded-xl border border-border bg-muted/40 focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
                  />
                  <Button
                    size="sm"
                    variant={promoApplied ? "outline" : "default"}
                    onClick={() => {
                      if (promoApplied) { removePromo(); }
                      else { applyPromo(); }
                    }}
                    disabled={applyingPromo}
                    className="px-4 rounded-xl"
                  >
                    {applyingPromo ? 'A validar...' : promoApplied ? 'Remover' : 'Aplicar'}
                  </Button>
                </div>
                {promoApplied && activeCoupon && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1">
                    <Gift className="w-3.5 h-3.5" />
                    {activeCoupon.type === 'percent'
                      ? `Desconto de ${activeCoupon.value}% aplicado!`
                      : `Desconto de ${activeCoupon.value.toLocaleString('pt-AO', { maximumFractionDigits: 0 })} Kz aplicado!`}
                  </p>
                )}
              </div>

              {/* Gift Card */}
              <div className="bg-card border border-border rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Gift className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-bold">Gift Card</h3>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={giftCardCode}
                    onChange={(e) => setGiftCardCode(e.target.value.toUpperCase())}
                    placeholder="Ex: GC-ABCD1234"
                    disabled={giftCardApplied}
                    className="flex-1 text-sm px-3 py-2 rounded-xl border border-border bg-muted/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 disabled:opacity-50"
                  />
                  <Button
                    size="sm"
                    variant={giftCardApplied ? "outline" : "default"}
                    onClick={() => { if (giftCardApplied) removeGiftCard(); else applyGiftCard(); }}
                    disabled={applyingGiftCard}
                    className="px-4 rounded-xl"
                  >
                    {applyingGiftCard ? 'A validar...' : giftCardApplied ? 'Remover' : 'Aplicar'}
                  </Button>
                </div>
                {giftCardApplied && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1">
                    <Gift className="w-3.5 h-3.5" />
                    Gift Card aplicado: -{giftCardDiscount.toLocaleString('pt-AO', { maximumFractionDigits: 0 })} Kz
                  </p>
                )}
              </div>

              {/* Summary card */}
              <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
                <h2 className="text-lg font-black">Resumo da Encomenda</h2>

                <div className="space-y-2.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal ({itemCount} artigos)</span>
                    <span className="font-semibold">{total.toLocaleString('pt-AO', { maximumFractionDigits: 0 })} Kz</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-emerald-500" /> Envio
                    </span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">Grátis</span>
                  </div>
                  {promoApplied && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-primary" /> Desconto
                      </span>
                      <span className="font-semibold text-primary">-{discount.toLocaleString('pt-AO', { maximumFractionDigits: 0 })} Kz</span>
                    </div>
                  )}
                  {giftCardApplied && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <Gift className="w-3.5 h-3.5 text-emerald-600" /> Gift Card
                      </span>
                      <span className="font-semibold text-emerald-600">-{giftCardDiscount.toLocaleString('pt-AO', { maximumFractionDigits: 0 })} Kz</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-dashed border-border pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-base">Total</span>
                    <div className="text-right">
                      <p className="text-2xl font-black text-foreground">
                        {finalTotal.toLocaleString('pt-AO', { maximumFractionDigits: 0 })} Kz
                      </p>
                      {promoApplied && (
                        <p className="text-xs text-muted-foreground line-through">
                          {total.toLocaleString('pt-AO', { maximumFractionDigits: 0 })} Kz
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full h-12 text-base font-bold rounded-xl gap-2"
                  variant="vibrant"
                  onClick={() => navigate('/checkout')}
                >
                  <Package className="w-5 h-5" />
                  Finalizar Compra
                </Button>

                <Button
                  className="w-full rounded-xl"
                  variant="outline"
                  onClick={() => navigate('/produtos')}
                >
                  Continuar a Comprar
                </Button>

                {/* Trust badges */}
                <div className="pt-2 grid grid-cols-3 gap-2 border-t border-border">
                  {TRUST_BADGES.map(({ icon: Icon, label, desc }) => (
                    <div key={label} className="flex flex-col items-center text-center gap-1">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <p className="text-[10px] font-bold leading-tight">{label}</p>
                      <p className="text-[9px] text-muted-foreground leading-tight hidden sm:block">{desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
