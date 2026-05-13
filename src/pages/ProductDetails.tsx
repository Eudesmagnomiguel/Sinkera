import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Heart, ShoppingCart, Star, Truck, Shield, RefreshCw, ChevronRight,
  Package, Share2, Minus, Plus, Check, Zap, Info, MessageSquare,
  ChevronLeft, ChevronUp, Award, MapPin, Clock,
} from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { ProductVariants, VariantGroup } from "@/components/ProductVariants";
import { ReviewForm } from "@/components/ReviewForm";
import { ReviewsList } from "@/components/ReviewsList";
import { ProductReviews } from "@/components/ProductReviews";
import { toast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { useReviews } from "@/hooks/useReviews";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/hooks/useProducts";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";

/* ────────────────────────────────────────────────────── */
/* Skeleton loader                                        */
/* ────────────────────────────────────────────────────── */
function ProductSkeleton({ searchQuery, setSearchQuery }: any) {
  return (
    <div className="min-h-screen bg-background">
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <div className="container mx-auto px-4 py-8 mt-20">
        <div className="grid lg:grid-cols-2 gap-10 animate-pulse">
          <div className="space-y-3">
            <div className="aspect-square rounded-3xl bg-muted" />
            <div className="grid grid-cols-4 gap-2">
              {[...Array(4)].map((_, i) => <div key={i} className="aspect-square rounded-xl bg-muted" />)}
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-5 w-32 rounded bg-muted" />
            <div className="h-8 w-3/4 rounded bg-muted" />
            <div className="h-5 w-24 rounded bg-muted" />
            <div className="h-12 w-40 rounded bg-muted" />
            <div className="h-4 w-full rounded bg-muted" />
            <div className="h-4 w-5/6 rounded bg-muted" />
            <div className="h-12 rounded-full bg-muted mt-4" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────── */
/* Star row helper                                        */
/* ────────────────────────────────────────────────────── */
function Stars({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const cls = size === "md" ? "w-5 h-5" : "w-4 h-4";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`${cls} ${s <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
        />
      ))}
    </div>
  );
}

/* ────────────────────────────────────────────────────── */
/* Spec row                                               */
/* ────────────────────────────────────────────────────── */
function SpecRow({ label, value, alt }: { label: string; value: string; alt?: boolean }) {
  return (
    <div className={`flex items-start py-3 px-4 gap-4 ${alt ? "bg-muted/40" : ""}`}>
      <span className="w-40 flex-shrink-0 text-sm text-muted-foreground font-medium">{label}</span>
      <span className="text-sm font-semibold text-foreground flex-1">{value}</span>
    </div>
  );
}

/* ────────────────────────────────────────────────────── */
/* Main component                                         */
/* ────────────────────────────────────────────────────── */
export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [zoomed, setZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const imgRef = useRef<HTMLDivElement>(null);

  const { user } = useAuth();
  const { addToCart } = useCart();
  const { addProduct: addRecentlyViewed } = useRecentlyViewed();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { reviews, loading: reviewsLoading, userReview, addReview, updateReview, deleteReview } = useReviews(id);

  const [product, setProduct] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [brand, setBrand] = useState<any>(null);
  const [category, setCategory] = useState<any>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const isWishlisted = id ? isInWishlist(id) : false;

  /* ── data fetching ── */
  useEffect(() => { loadProduct(); }, [id]);

  const loadProduct = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.from("products").select("*").eq("id", id).single();
      if (error) throw error;
      setProduct(data as Product);
      addRecentlyViewed(id);

      if (data?.brand_id) {
        const { data: b } = await supabase.from("brands").select("name").eq("id", data.brand_id).single();
        setBrand(b);
      }
      if (data?.category_id) {
        const { data: c } = await supabase.from("categories").select("name").eq("id", data.category_id).single();
        setCategory(c);
        const { data: sim } = await supabase.from("products").select("*").eq("category_id", data.category_id).neq("id", id).limit(4);
        setSimilarProducts((sim || []) as Product[]);
      }
    } catch {
      // not found
    } finally {
      setLoading(false);
    }
  };

  /* ── handlers ── */
  const handleWishlistToggle = async () => {
    if (!id) return;
    isWishlisted ? await removeFromWishlist(id) : await addToWishlist(id);
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product.id, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyNow = () => {
    if (!product) return;
    addToCart(product.id, quantity);
    navigate("/carrinho");
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    toast({ title: "Link copiado!", description: "Partilha com quem precisar." });
  };

  const handleWhatsApp = () => {
    if (!product) return;
    const msg = `Olá! Tenho interesse neste produto:\n*${product.name}*\nPreço: ${product.price.toLocaleString('pt-AO')} Kz\n${window.location.href}`;
    window.open(`https://wa.me/+244900000000?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleReviewSubmit = async (rating: number, title?: string, comment?: string) => {
    if (editingReview && userReview) {
      await updateReview(userReview.id, rating, title, comment);
      setEditingReview(false);
    } else {
      await addReview(rating, title, comment);
    }
    setShowReviewForm(false);
  };

  /* ── image zoom on hover ── */
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  /* ── loading / not found ── */
  if (loading) return <ProductSkeleton searchQuery={searchQuery} setSearchQuery={setSearchQuery} />;
  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <Package className="w-16 h-16 text-muted-foreground" />
          <h1 className="text-2xl font-bold">Produto não encontrado</h1>
          <Link to="/produtos"><Button variant="outline">Ver todos os produtos</Button></Link>
        </div>
        <Footer />
      </div>
    );
  }

  /* ── derived data ── */
  const images = product.images && product.images.length > 0 ? product.images : [product.image_url];
  const discountPct = product.original_price ? Math.round(((product.original_price - product.price) / product.original_price) * 100) : 0;
  const inStock = product.in_stock !== false;
  const stockQty = product.stock_quantity ?? null;
  const specifications = (product.specifications as Record<string, string>) || {};

  const specs = [
    { label: "Marca", value: brand?.name || "—" },
    { label: "Categoria", value: category?.name || "—" },
    { label: "Disponibilidade", value: inStock ? "Em Stock" : "Esgotado" },
    ...(stockQty != null ? [{ label: "Quantidade disponível", value: `${stockQty} unidades` }] : []),
    ...Object.entries(specifications).map(([k, v]) => ({ label: k, value: String(v) })),
  ];

  const catNameLower = (category?.name || '').toLowerCase();
  const demoVariants: VariantGroup[] = (() => {
    if (catNameLower.includes('smartphone') || catNameLower.includes('telemóvel') || catNameLower.includes('telemovel') || catNameLower.includes('telefone')) {
      return [
        {
          name: 'Armazenamento',
          variants: [
            { label: '64GB', available: true },
            { label: '128GB', available: true },
            { label: '256GB', available: true },
            { label: '512GB', available: false },
          ],
        },
        {
          name: 'Cor',
          variants: [
            { label: 'Preto', available: true },
            { label: 'Branco', available: true },
            { label: 'Azul', available: true },
            { label: 'Dourado', available: false },
          ],
        },
      ];
    }
    if (catNameLower.includes('informática') || catNameLower.includes('informatica') || catNameLower.includes('laptop') || catNameLower.includes('computador')) {
      return [
        {
          name: 'RAM',
          variants: [
            { label: '8GB', available: true },
            { label: '16GB', available: true },
            { label: '32GB', available: false },
          ],
        },
        {
          name: 'Armazenamento',
          variants: [
            { label: '256GB SSD', available: true },
            { label: '512GB SSD', available: true },
            { label: '1TB SSD', available: true },
          ],
        },
      ];
    }
    return [];
  })();

  return (
    <div className="min-h-screen bg-white dark:bg-background">
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <main className="container mx-auto px-4 py-8 mt-20">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-gray-400 mb-8 flex-wrap">
          <button onClick={() => navigate("/")} className="hover:text-gray-700 dark:hover:text-foreground transition-colors">Início</button>
          <ChevronRight className="w-3.5 h-3.5" />
          <button onClick={() => navigate("/produtos")} className="hover:text-gray-700 dark:hover:text-foreground transition-colors">Produtos</button>
          {category && <>
            <ChevronRight className="w-3.5 h-3.5" />
            <button onClick={() => navigate(`/produtos?category=${category.slug || category.id}`)} className="hover:text-gray-700 dark:hover:text-foreground transition-colors">{category.name}</button>
          </>}
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-gray-800 dark:text-foreground font-medium line-clamp-1 max-w-[220px]">{product.name}</span>
        </nav>

        {/* ── Main grid ── */}
        <div className="grid lg:grid-cols-2 gap-10 xl:gap-16 mb-20">

          {/* ── LEFT: Gallery – sticky ── */}
          <div className="lg:sticky lg:top-24 self-start space-y-3">

            {/* Main image */}
            <div
              ref={imgRef}
              onMouseEnter={() => setZoomed(true)}
              onMouseLeave={() => setZoomed(false)}
              onMouseMove={handleMouseMove}
              className="relative aspect-square bg-gray-50 dark:bg-card rounded-3xl overflow-hidden cursor-zoom-in border border-gray-100 dark:border-border"
            >
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-contain p-10 transition-transform duration-300"
                style={zoomed ? { transform: "scale(2)", transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` } : {}}
              />
              {discountPct > 0 && (
                <div className="absolute top-4 left-4">
                  <span className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow">
                    -{discountPct}%
                  </span>
                </div>
              )}
              <button
                onClick={handleWishlistToggle}
                className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-all border ${
                  isWishlisted
                    ? "bg-red-50 border-red-200 dark:bg-red-950/40 dark:border-red-800"
                    : "bg-white/90 dark:bg-card/90 border-gray-100 dark:border-border hover:border-red-200"
                }`}
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
              </button>
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImage((i) => (i - 1 + images.length) % images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 dark:bg-card/90 border border-gray-100 dark:border-border flex items-center justify-center shadow-md hover:bg-white dark:hover:bg-card transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => setSelectedImage((i) => (i + 1) % images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 dark:bg-card/90 border border-gray-100 dark:border-border flex items-center justify-center shadow-md hover:bg-white dark:hover:bg-card transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 text-gray-600 dark:text-muted-foreground" />
                  </button>
                  <div className="absolute bottom-4 right-4 bg-black/40 text-white text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm">
                    {selectedImage + 1} / {images.length}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`flex-shrink-0 w-[70px] h-[70px] rounded-2xl overflow-hidden border-2 transition-all bg-gray-50 dark:bg-card ${
                      selectedImage === i
                        ? "border-blue-700 shadow-md opacity-100"
                        : "border-transparent hover:border-gray-200 dark:hover:border-border opacity-55 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt={`Vista ${i + 1}`} className="w-full h-full object-contain p-1.5" />
                  </button>
                ))}
              </div>
            )}

            {/* Trust strip */}
            <div className="flex items-center justify-around py-3 px-4 bg-gray-50 dark:bg-muted/30 rounded-2xl border border-gray-100 dark:border-border">
              {[
                { icon: Shield, label: "Garantia 12m", color: "text-blue-600" },
                { icon: Truck, label: "Entrega Grátis", color: "text-emerald-600" },
                { icon: RefreshCw, label: "Devolução 30d", color: "text-violet-600" },
              ].map(({ icon: Icon, label, color }) => (
                <div key={label} className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-muted-foreground">
                  <Icon className={`w-3.5 h-3.5 ${color}`} />
                  <span className="font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: Product info ── */}
          <div className="space-y-5">

            {/* Brand + badges */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {brand && (
                <span className="text-xs font-bold text-blue-700 tracking-widest uppercase">
                  {brand.name}
                </span>
              )}
              {product.is_bestseller && (
                <Badge className="bg-amber-50 text-amber-600 border border-amber-200 gap-1 text-[11px] font-semibold">
                  <Award className="w-3 h-3" /> Mais Vendido
                </Badge>
              )}
              {product.is_featured && (
                <Badge className="bg-violet-50 text-violet-700 border border-violet-200 text-[11px] font-semibold">Destaque</Badge>
              )}
              {product.badge && (
                <Badge variant="destructive" className="text-[11px]">{product.badge}</Badge>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-[28px] font-bold leading-snug text-gray-900 dark:text-foreground">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <Stars rating={product.rating || 0} size="sm" />
              <span className="text-sm font-bold text-gray-800 dark:text-foreground">{(product.rating || 0).toFixed(1)}</span>
              <span className="text-gray-400 text-sm">({product.reviews_count || 0} avaliações)</span>
              <button
                onClick={() => document.getElementById("reviews-tab")?.click()}
                className="text-sm text-blue-700 hover:underline"
              >
                Ver todas
              </button>
            </div>

            <hr className="border-gray-100 dark:border-border" />

            {/* Price */}
            <div className="space-y-1.5">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-[38px] font-black text-gray-900 dark:text-foreground leading-none tracking-tight">
                  {product.price.toLocaleString("pt-AO")}
                  <span className="text-2xl font-bold text-gray-400 ml-1.5">Kz</span>
                </span>
                {product.original_price && (
                  <span className="text-lg text-gray-400 line-through">
                    {product.original_price.toLocaleString("pt-AO")} Kz
                  </span>
                )}
                {discountPct > 0 && (
                  <span className="text-sm font-bold text-red-500 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900 px-2.5 py-0.5 rounded-full">
                    Poupa {discountPct}%
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-400">
                💳 12× de{" "}
                <span className="font-semibold text-gray-700 dark:text-foreground">
                  {(product.price / 12).toLocaleString("pt-AO", { maximumFractionDigits: 0 })} Kz
                </span>{" "}
                sem juros
              </p>
            </div>

            {/* Stock + delivery */}
            <div className="flex items-center gap-3 text-sm flex-wrap">
              <span className={`flex items-center gap-1.5 font-semibold ${inStock ? "text-emerald-600" : "text-red-500"}`}>
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${inStock ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
                {inStock ? "Em stock" : "Esgotado"}
              </span>
              {stockQty != null && stockQty <= 20 && inStock && (
                <span className="text-orange-500 font-medium">— apenas {stockQty} restantes</span>
              )}
              <span className="text-gray-200 dark:text-border">|</span>
              <span className="text-gray-400 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5" />
                Entrega 1–2 dias úteis
              </span>
            </div>

            <hr className="border-gray-100 dark:border-border" />

            {/* Variants */}
            {demoVariants.length > 0 && (
              <ProductVariants groups={demoVariants} onSelectionChange={() => {}} />
            )}

            {/* Quantity */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-500 dark:text-muted-foreground w-24 flex-shrink-0">Quantidade</span>
              <div className="flex items-center rounded-2xl border border-gray-200 dark:border-border overflow-hidden bg-white dark:bg-card">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-muted transition-colors disabled:opacity-30"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-12 text-center font-bold text-base border-x border-gray-200 dark:border-border py-2.5">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  disabled={!!stockQty && quantity >= stockQty}
                  className="px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-muted transition-colors disabled:opacity-30"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-2.5 pt-1">
              {/* Primary row: Comprar Agora + Adicionar ao Carrinho */}
              <div className="flex gap-2.5">
                <Button
                  onClick={handleBuyNow}
                  disabled={!inStock}
                  className="flex-1 h-11 text-sm font-bold rounded-xl bg-blue-700 hover:bg-blue-800 text-white shadow-md hover:shadow-blue-700/25 active:scale-[0.99] transition-all gap-1.5 border-0"
                >
                  <Zap className="w-4 h-4 flex-shrink-0" />
                  Comprar Agora
                </Button>
                <Button
                  onClick={handleAddToCart}
                  disabled={!inStock}
                  variant="outline"
                  className="flex-1 h-11 text-sm font-semibold rounded-xl border-2 border-gray-200 dark:border-border hover:border-blue-700 hover:text-blue-700 active:scale-[0.99] transition-all gap-1.5"
                >
                  {addedToCart ? (
                    <><Check className="w-4 h-4 text-emerald-500 flex-shrink-0" /> Adicionado!</>
                  ) : (
                    <><ShoppingCart className="w-4 h-4 flex-shrink-0" /> Carrinho</>
                  )}
                </Button>
              </div>
              {/* Secondary: WhatsApp full width */}
              <Button
                onClick={handleWhatsApp}
                disabled={!inStock}
                className="w-full h-10 text-sm font-semibold rounded-xl bg-[#25D366] hover:bg-[#1ebe5b] text-white active:scale-[0.99] transition-all gap-2 border-0"
              >
                <MessageSquare className="w-4 h-4 flex-shrink-0" />
                Comprar via WhatsApp
              </Button>
            </div>

            {/* Wishlist + Share */}
            <div className="flex items-center gap-4 pt-0.5">
              <button
                onClick={handleWishlistToggle}
                className={`flex items-center gap-1.5 text-sm transition-colors ${
                  isWishlisted ? "text-red-500 font-semibold" : "text-gray-400 hover:text-red-500"
                }`}
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? "fill-red-500" : ""}`} />
                {isWishlisted ? "Guardado" : "Lista de Desejos"}
              </button>
              <span className="text-gray-200 dark:text-border">|</span>
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 dark:hover:text-foreground transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Partilhar
              </button>
            </div>

            {/* Delivery detail box */}
            <div className="bg-gray-50 dark:bg-muted/20 rounded-2xl p-4 border border-gray-100 dark:border-border space-y-2.5">
              <div className="flex items-center gap-2.5 text-sm">
                <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span className="text-gray-700 dark:text-foreground font-medium">Entrega em Luanda e todo o país</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm">
                <Clock className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span className="text-gray-700 dark:text-foreground font-medium">Recebe em 1–2 dias úteis</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <Tabs defaultValue="specs" className="mb-20">
          <TabsList className="h-auto p-0 bg-transparent border-b border-gray-100 dark:border-border rounded-none w-full justify-start gap-0 overflow-x-auto">
            {[
              { value: "specs", label: "Especificações", icon: Info },
              { value: "description", label: "Descrição", icon: Package },
              { value: "similar", label: "Similares", icon: ChevronUp },
              { value: "reviews", label: `Avaliações (${reviews.length})`, icon: MessageSquare, id: "reviews-tab" },
            ].map(({ value, label, icon: Icon, id }) => (
              <TabsTrigger
                key={value}
                value={value}
                id={id}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-700 data-[state=active]:text-blue-700 data-[state=active]:bg-transparent px-6 py-3.5 text-sm font-semibold gap-1.5 flex-shrink-0 text-gray-400 hover:text-gray-700 dark:hover:text-foreground transition-colors"
              >
                <Icon className="w-4 h-4" />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Specifications */}
          <TabsContent value="specs" className="mt-8">
            <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 dark:border-border bg-gray-50 dark:bg-muted/20">
                <h3 className="font-bold text-gray-900 dark:text-foreground">Especificações Técnicas</h3>
              </div>
              {specs.length > 0 ? (
                <div className="divide-y divide-gray-50 dark:divide-border">
                  {specs.map((s, i) => (
                    <SpecRow key={s.label} label={s.label} value={s.value} alt={i % 2 === 1} />
                  ))}
                </div>
              ) : (
                <p className="px-6 py-12 text-center text-gray-400 text-sm">
                  Especificações não disponíveis para este produto.
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              {[
                { icon: Shield, title: "Garantia 12 meses", desc: "Proteção total contra defeitos de fabrico.", bgColor: "bg-blue-50 dark:bg-blue-950/20", borderColor: "border-blue-100 dark:border-blue-900", iconBg: "bg-blue-100 dark:bg-blue-900/50", iconColor: "text-blue-600" },
                { icon: Truck, title: "Entrega Grátis", desc: "Em todo o território nacional. Rápida e segura.", bgColor: "bg-emerald-50 dark:bg-emerald-950/20", borderColor: "border-emerald-100 dark:border-emerald-900", iconBg: "bg-emerald-100 dark:bg-emerald-900/50", iconColor: "text-emerald-600" },
                { icon: RefreshCw, title: "Devolução 30 dias", desc: "Muda de ideias? Devolvemos sem complicações.", bgColor: "bg-violet-50 dark:bg-violet-950/20", borderColor: "border-violet-100 dark:border-violet-900", iconBg: "bg-violet-100 dark:bg-violet-900/50", iconColor: "text-violet-600" },
              ].map(({ icon: Icon, title, desc, bgColor, borderColor, iconBg, iconColor }) => (
                <div key={title} className={`flex items-start gap-3 p-5 rounded-2xl ${bgColor} border ${borderColor}`}>
                  <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-4 h-4 ${iconColor}`} />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-900 dark:text-foreground">{title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Description */}
          <TabsContent value="description" className="mt-8">
            <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border p-8">
              {product.description ? (
                <p className="text-base leading-8 text-gray-700 dark:text-foreground whitespace-pre-line max-w-3xl">
                  {product.description}
                </p>
              ) : (
                <p className="text-gray-400 text-center py-10">Descrição detalhada não disponível.</p>
              )}
            </div>
          </TabsContent>

          {/* Similar */}
          <TabsContent value="similar" className="mt-8">
            {similarProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {similarProducts.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            ) : (
              <p className="text-center text-gray-400 py-16">Nenhum produto similar encontrado.</p>
            )}
          </TabsContent>

          {/* Reviews */}
          <TabsContent value="reviews" className="mt-8">
            <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border p-8">
              <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
                <div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-foreground">Avaliações de Clientes</h3>
                  <div className="flex items-center gap-3">
                    <Stars rating={product.rating || 0} size="md" />
                    <span className="text-3xl font-black text-gray-900 dark:text-foreground">{(product.rating || 0).toFixed(1)}</span>
                    <span className="text-gray-400 text-sm">de 5 · {product.reviews_count || 0} avaliações</span>
                  </div>
                </div>
                {user && !userReview && !showReviewForm && (
                  <Button
                    onClick={() => setShowReviewForm(true)}
                    className="gap-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl"
                  >
                    <Star className="w-4 h-4" />
                    Escrever Avaliação
                  </Button>
                )}
              </div>

              {showReviewForm && (
                <div className="mb-8 p-6 bg-gray-50 dark:bg-muted/40 rounded-2xl border border-gray-100 dark:border-border">
                  <h4 className="font-semibold mb-4 text-gray-900 dark:text-foreground">
                    {editingReview ? "Editar Avaliação" : "Nova Avaliação"}
                  </h4>
                  <ReviewForm
                    onSubmit={handleReviewSubmit}
                    initialRating={editingReview && userReview ? userReview.rating : 0}
                    initialTitle={editingReview && userReview ? userReview.title : ""}
                    initialComment={editingReview && userReview ? userReview.comment : ""}
                    isEditing={editingReview}
                  />
                  <Button variant="outline" size="sm" className="mt-3 rounded-xl"
                    onClick={() => { setShowReviewForm(false); setEditingReview(false); }}>
                    Cancelar
                  </Button>
                </div>
              )}

              {reviewsLoading ? (
                <div className="space-y-3">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="h-20 rounded-xl bg-gray-100 dark:bg-muted animate-pulse" />
                  ))}
                </div>
              ) : (
                <ReviewsList
                  reviews={reviews}
                  currentUserId={user?.id}
                  onEdit={() => { setEditingReview(true); setShowReviewForm(true); }}
                  onDelete={() => userReview && deleteReview(userReview.id)}
                />
              )}
            </div>
            <div className="mt-6">
              <ProductReviews productId={product.id} />
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Sticky mobile buy bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/95 dark:bg-background/95 backdrop-blur-md border-t border-gray-100 dark:border-border px-4 py-3 flex gap-2 shadow-lg">
        <Button
          onClick={handleBuyNow}
          disabled={!inStock}
          className="flex-1 h-12 font-bold gap-1.5 bg-blue-700 hover:bg-blue-800 border-0 text-white rounded-xl"
        >
          <Zap className="w-4 h-4" /> Comprar Agora
        </Button>
        <Button
          onClick={handleAddToCart}
          disabled={!inStock}
          variant="outline"
          className="flex-1 h-12 font-bold gap-1.5 border-2 rounded-xl"
        >
          <ShoppingCart className="w-4 h-4" />
          {addedToCart ? "Adicionado ✓" : "Carrinho"}
        </Button>
      </div>

      <div className="h-20 lg:hidden" />
      <Footer />
    </div>
  );
}
