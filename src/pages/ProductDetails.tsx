import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Heart, ShoppingCart, Star, Shield, RefreshCw, ChevronRight,
  Package, Share2, Minus, Plus, Check, MessageSquare,
  ChevronLeft, Truck,
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

function ProductSkeleton({ searchQuery, setSearchQuery }: any) {
  return (
    <div className="min-h-screen bg-white dark:bg-background">
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <div className="container mx-auto px-4 py-10 mt-20">
        <div className="grid lg:grid-cols-2 gap-12 animate-pulse">
          <div className="space-y-3">
            <div className="aspect-square rounded-2xl bg-gray-100 dark:bg-muted" />
            <div className="grid grid-cols-4 gap-2">
              {[...Array(4)].map((_, i) => <div key={i} className="aspect-square rounded-xl bg-gray-100 dark:bg-muted" />)}
            </div>
          </div>
          <div className="space-y-5 pt-2">
            <div className="h-3 w-20 rounded bg-gray-100 dark:bg-muted" />
            <div className="h-8 w-3/4 rounded bg-gray-100 dark:bg-muted" />
            <div className="h-4 w-full rounded bg-gray-100 dark:bg-muted" />
            <div className="h-4 w-2/3 rounded bg-gray-100 dark:bg-muted" />
            <div className="h-px w-full bg-gray-100 dark:bg-muted mt-4" />
            <div className="h-12 w-48 rounded bg-gray-100 dark:bg-muted" />
            <div className="h-13 rounded-2xl bg-gray-100 dark:bg-muted mt-6" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Stars({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const cls = size === "md" ? "w-4.5 h-4.5" : "w-3.5 h-3.5";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`${cls} ${s <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-gray-200 dark:text-muted-foreground/20"}`} />
      ))}
    </div>
  );
}

function SpecRow({ label, value, alt }: { label: string; value: string; alt?: boolean }) {
  return (
    <div className={`flex items-start py-3.5 px-6 gap-6 ${alt ? "bg-gray-50/60 dark:bg-muted/20" : ""}`}>
      <span className="w-44 flex-shrink-0 text-sm text-gray-400 dark:text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold text-gray-900 dark:text-foreground flex-1">{value}</span>
    </div>
  );
}

const WaPath = "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z";

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

  const handleShare = async () => {
    const shareData = {
      title: product?.name ?? 'Produto Sinkera',
      text: `${product?.name} — ${product?.price.toLocaleString('pt-AO')} Kz na Sinkera`,
      url: window.location.href,
    };
    if (navigator.share && navigator.canShare?.(shareData)) {
      try { await navigator.share(shareData); } catch { /* cancelado pelo utilizador */ }
    } else {
      await navigator.clipboard?.writeText(window.location.href);
      toast({ title: "Link copiado!", description: "Partilha com quem precisar." });
    }
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

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    setZoomPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  if (loading) return <ProductSkeleton searchQuery={searchQuery} setSearchQuery={setSearchQuery} />;
  if (!product) {
    return (
      <div className="min-h-screen bg-white dark:bg-background">
        <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <Package className="w-14 h-14 text-gray-300" />
          <h1 className="text-xl font-bold text-gray-700 dark:text-foreground">Produto não encontrado</h1>
          <Link to="/produtos"><Button variant="outline" className="rounded-xl">Ver todos os produtos</Button></Link>
        </div>
        <Footer />
      </div>
    );
  }

  const images = product.images && product.images.length > 0 ? product.images : [product.image_url];
  const discountPct = product.original_price ? Math.round(((product.original_price - product.price) / product.original_price) * 100) : 0;
  const inStock = product.in_stock !== false;
  const stockQty = product.stock_quantity ?? null;
  const specifications = (product.specifications as Record<string, string>) || {};
  const descriptionSnippet = product.description ? product.description.slice(0, 160) + (product.description.length > 160 ? "…" : "") : null;

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
      const gbMatch = product.name.match(/(\d+)\s*GB/i);
      const productGB = gbMatch ? parseInt(gbMatch[1]) : null;
      const isHighEnd = /ultra|pro max|pro\+|fold/i.test(product.name);

      const storageOptions = isHighEnd
        ? [
            { label: '256GB', available: true,  default: productGB === 256 || !productGB },
            { label: '512GB', available: true,  default: productGB === 512 },
            { label: '1TB',   available: false, default: false },
          ]
        : [
            { label: '64GB',  available: true,  default: productGB === 64 },
            { label: '128GB', available: true,  default: productGB === 128 || !productGB },
            { label: '256GB', available: true,  default: productGB === 256 },
            { label: '512GB', available: false, default: productGB === 512 },
          ];

      return [
        { name: 'Armazenamento', variants: storageOptions },
        { name: 'Cor', variants: [
          { label: 'Preto',  available: true,  default: true },
          { label: 'Creme',  available: true,  default: false },
          { label: 'Verde',  available: true,  default: false },
          { label: 'Lavanda',available: false, default: false },
        ]},
      ];
    }
    if (catNameLower.includes('informática') || catNameLower.includes('informatica') || catNameLower.includes('laptop') || catNameLower.includes('computador')) {
      return [
        { name: 'RAM', variants: [{ label: '8GB', available: true, default: true }, { label: '16GB', available: true, default: false }, { label: '32GB', available: false, default: false }] },
        { name: 'Armazenamento', variants: [{ label: '256GB SSD', available: true, default: true }, { label: '512GB SSD', available: true, default: false }, { label: '1TB SSD', available: true, default: false }] },
      ];
    }
    return [];
  })();

  return (
    <div className="min-h-screen bg-white dark:bg-background">
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <main className="container mx-auto px-4 pt-8 pb-10 mt-20">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-xs text-gray-400 mb-10 flex-wrap">
          <button onClick={() => navigate("/")} className="hover:text-gray-600 dark:hover:text-foreground transition-colors">Início</button>
          <ChevronRight className="w-3 h-3" />
          <button onClick={() => navigate("/produtos")} className="hover:text-gray-600 dark:hover:text-foreground transition-colors">Produtos</button>
          {category && (
            <>
              <ChevronRight className="w-3 h-3" />
              <button onClick={() => navigate(`/produtos?category=${category.slug || category.id}`)} className="hover:text-gray-600 dark:hover:text-foreground transition-colors">{category.name}</button>
            </>
          )}
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-700 dark:text-foreground font-medium line-clamp-1 max-w-[200px]">{product.name}</span>
        </nav>

        {/* ── Main grid ── */}
        <div className="grid lg:grid-cols-2 gap-12 xl:gap-20 mb-24">

          {/* ── LEFT: Gallery ── */}
          <div className="lg:sticky lg:top-24 self-start space-y-3">

            {/* Main image */}
            <div
              ref={imgRef}
              onMouseEnter={() => setZoomed(true)}
              onMouseLeave={() => setZoomed(false)}
              onMouseMove={handleMouseMove}
              className="relative aspect-square bg-gray-50 dark:bg-card rounded-2xl overflow-hidden cursor-zoom-in shadow-sm"
            >
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-contain p-10 transition-transform duration-300"
                style={zoomed ? { transform: "scale(2.2)", transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` } : {}}
              />
              <button
                onClick={handleWishlistToggle}
                className={`absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center shadow transition-all ${
                  isWishlisted ? "bg-red-50 dark:bg-red-950/40" : "bg-white/90 dark:bg-card/90 hover:bg-white"
                }`}
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
              </button>
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImage((i) => (i - 1 + images.length) % images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 dark:bg-card/90 flex items-center justify-center shadow hover:bg-white dark:hover:bg-card transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-500" />
                  </button>
                  <button
                    onClick={() => setSelectedImage((i) => (i + 1) % images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 dark:bg-card/90 flex items-center justify-center shadow hover:bg-white dark:hover:bg-card transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  </button>
                  <span className="absolute bottom-4 right-4 bg-black/35 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm">
                    {selectedImage + 1} / {images.length}
                  </span>
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
                    className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all bg-gray-50 dark:bg-card ${
                      selectedImage === i
                        ? "border-blue-700 opacity-100"
                        : "border-transparent hover:border-gray-200 dark:hover:border-border opacity-50 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt={`Vista ${i + 1}`} className="w-full h-full object-contain p-1.5" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── RIGHT: Product info ── */}
          <div className="flex flex-col gap-7 pt-1">

            {/* Brand + Title */}
            <div className="space-y-3">
              {brand && (
                <p className="text-[10px] font-bold text-gray-400 tracking-[0.3em] uppercase">{brand.name}</p>
              )}
              <h1 className="text-[24px] md:text-[30px] font-black leading-[1.1] text-gray-900 dark:text-foreground tracking-tight">
                {product.name}
              </h1>
              {descriptionSnippet && (
                <p className="text-sm text-gray-500 dark:text-muted-foreground leading-relaxed">
                  {descriptionSnippet}
                </p>
              )}
            </div>

            {/* Price */}
            <div className="py-5 border-t border-b border-gray-100 dark:border-border space-y-2">
              <span className="text-[42px] font-black text-gray-900 dark:text-foreground leading-none tracking-tight">
                {product.price.toLocaleString("pt-AO")}
                <span className="text-lg font-medium text-gray-400 ml-1.5">Kz</span>
              </span>
              {product.original_price && product.original_price > product.price && (
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-gray-400 line-through">{product.original_price.toLocaleString("pt-AO")} Kz</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold tracking-tight">
                    Poupas {(product.original_price - product.price).toLocaleString("pt-AO")} Kz
                  </span>
                </div>
              )}
            </div>

            {/* Stock */}
            <div className="flex items-center gap-2.5 flex-wrap -mt-2">
              <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${
                inStock
                  ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                  : "bg-red-50 dark:bg-red-950/40 text-red-600 border border-red-200"
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${inStock ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
                {inStock ? "Em stock" : "Esgotado"}
              </span>
              {stockQty != null && stockQty <= 20 && inStock && (
                <span className="text-xs font-bold text-orange-600">
                  ⚡ Apenas {stockQty} restantes
                </span>
              )}
            </div>

            {/* Variants */}
            {demoVariants.length > 0 && (
              <ProductVariants groups={demoVariants} onSelectionChange={() => {}} />
            )}

            {/* Quantity + CTAs */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-muted-foreground">Quantidade</span>
                <div className="flex items-center rounded-xl border border-gray-200 dark:border-border overflow-hidden bg-white dark:bg-card">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="w-10 h-9 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-muted transition-colors disabled:opacity-30 text-gray-500"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-10 text-center font-black text-sm border-x border-gray-200 dark:border-border h-9 flex items-center justify-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    disabled={!!stockQty && quantity >= stockQty}
                    className="w-10 h-9 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-muted transition-colors disabled:opacity-30 text-gray-500"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <button
                onClick={handleBuyNow}
                disabled={!inStock}
                className="w-full h-[54px] disabled:opacity-40 text-white font-semibold tracking-[0.14em] uppercase text-[13px] rounded-xl transition-colors duration-200 active:scale-[0.99] btn-cta"
              >
                Comprar Agora
              </button>

              <div className="flex gap-2.5">
                <button
                  onClick={handleAddToCart}
                  disabled={!inStock}
                  className="flex-1 h-11 flex items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-border text-[12px] font-semibold tracking-[0.1em] uppercase text-gray-600 dark:text-muted-foreground hover:border-blue-600 hover:text-blue-700 active:scale-[0.99] transition-all disabled:opacity-40 bg-white dark:bg-card"
                >
                  {addedToCart
                    ? <><Check className="w-3.5 h-3.5 text-emerald-500" /> Adicionado</>
                    : <><ShoppingCart className="w-3.5 h-3.5" /> Carrinho</>
                  }
                </button>

                <button
                  onClick={handleWhatsApp}
                  disabled={!inStock}
                  className="flex-1 h-11 flex items-center justify-center gap-2 rounded-xl text-[12px] font-semibold tracking-[0.1em] uppercase text-white active:scale-[0.99] transition-all disabled:opacity-40"
                  style={{ background: '#25D366' }}
                >
                  <svg viewBox="0 0 24 24" fill="white" style={{ width: 15, height: 15, flexShrink: 0 }}>
                    <path d={WaPath} />
                  </svg>
                  WhatsApp
                </button>
              </div>
            </div>

            {/* Trust grid */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: Shield,   color: "text-blue-500",    bg: "bg-blue-50 dark:bg-blue-950/30",    label: "Garantia",  sub: "12 meses" },
                { icon: RefreshCw,color: "text-violet-500",  bg: "bg-violet-50 dark:bg-violet-950/30",label: "Troca",     sub: "30 dias" },
                { icon: Truck,    color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/30",label: "Entrega",  sub: "Luanda" },
              ].map(({ icon: Icon, color, bg, label, sub }) => (
                <div key={label} className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border border-gray-100 dark:border-border ${bg}`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                  <span className="text-[11px] font-bold text-gray-700 dark:text-foreground">{label}</span>
                  <span className="text-[10px] text-gray-400">{sub}</span>
                </div>
              ))}
            </div>

            {/* Wishlist · Share */}
            <div className="flex items-center gap-4 pt-1">
              <button
                onClick={handleWishlistToggle}
                className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${isWishlisted ? "text-red-500" : "text-gray-400 hover:text-red-500"}`}
              >
                <Heart className={`w-3.5 h-3.5 ${isWishlisted ? "fill-red-500" : ""}`} />
                {isWishlisted ? "Guardado nos favoritos" : "Guardar nos favoritos"}
              </button>
              <span className="text-gray-200 dark:text-border text-xs">·</span>
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-gray-700 dark:hover:text-foreground transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                Partilhar
              </button>
            </div>

          </div>
        </div>

        {/* ── Tabs ── */}
        <Tabs defaultValue="specs" className="mb-24">
          <TabsList className="h-auto p-0 bg-transparent border-b border-gray-100 dark:border-border rounded-none w-full justify-start gap-0 overflow-x-auto">
            {[
              { value: "specs", label: "Especificações" },
              { value: "description", label: "Descrição" },
              { value: "similar", label: "Similares" },
              { value: "reviews", label: `Avaliações (${reviews.length})`, id: "reviews-tab" },
            ].map(({ value, label, id }) => (
              <TabsTrigger
                key={value}
                value={value}
                id={id}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-foreground data-[state=active]:bg-transparent px-5 py-3.5 text-sm font-semibold flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-foreground transition-colors tracking-tight"
              >
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Specifications */}
          <TabsContent value="specs" className="mt-8">
            <div className="rounded-2xl border border-gray-100 dark:border-border overflow-hidden">
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
          </TabsContent>

          {/* Description */}
          <TabsContent value="description" className="mt-8">
            <div className="max-w-3xl">
              {product.description ? (
                <p className="text-base leading-8 text-gray-600 dark:text-muted-foreground whitespace-pre-line">
                  {product.description}
                </p>
              ) : (
                <p className="text-gray-400 py-10">Descrição detalhada não disponível.</p>
              )}
            </div>
          </TabsContent>

          {/* Similar */}
          <TabsContent value="similar" className="mt-8">
            {similarProducts.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {similarProducts.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            ) : (
              <p className="text-gray-400 py-16 text-center">Nenhum produto similar encontrado.</p>
            )}
          </TabsContent>

          {/* Reviews */}
          <TabsContent value="reviews" className="mt-8">
            <div className="max-w-3xl">
              <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
                <div>
                  <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-foreground">Avaliações</h3>
                  <div className="flex items-center gap-2.5">
                    <Stars rating={product.rating || 0} size="md" />
                    <span className="text-2xl font-black text-gray-900 dark:text-foreground">{(product.rating || 0).toFixed(1)}</span>
                    <span className="text-gray-400 text-sm">de 5 · {product.reviews_count || 0}</span>
                  </div>
                </div>
                {user && !userReview && !showReviewForm && (
                  <Button
                    onClick={() => setShowReviewForm(true)}
                    className="gap-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-sm"
                  >
                    <Star className="w-3.5 h-3.5" />
                    Escrever Avaliação
                  </Button>
                )}
              </div>

              {showReviewForm && (
                <div className="mb-8 p-6 bg-gray-50 dark:bg-muted/40 rounded-2xl border border-gray-100 dark:border-border">
                  <h4 className="font-semibold mb-4 text-gray-900 dark:text-foreground text-sm">
                    {editingReview ? "Editar Avaliação" : "Nova Avaliação"}
                  </h4>
                  <ReviewForm
                    onSubmit={handleReviewSubmit}
                    initialRating={editingReview && userReview ? userReview.rating : 0}
                    initialTitle={editingReview && userReview ? userReview.title : ""}
                    initialComment={editingReview && userReview ? userReview.comment : ""}
                    isEditing={editingReview}
                  />
                  <Button variant="outline" size="sm" className="mt-3 rounded-xl text-xs"
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
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/98 dark:bg-background/98 backdrop-blur-md border-t border-gray-100 dark:border-border px-4 py-3 flex gap-2 shadow-lg">
        <button
          onClick={handleBuyNow}
          disabled={!inStock}
          className="flex-1 h-11 text-white text-[11px] font-semibold tracking-[0.14em] uppercase rounded-xl transition-colors disabled:opacity-40 btn-cta"
        >
          Comprar
        </button>
        <Button
          onClick={handleAddToCart}
          disabled={!inStock}
          variant="outline"
          className="h-11 px-4 text-sm font-bold gap-1.5 border rounded-xl"
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          {addedToCart ? <Check className="w-3 h-3 text-emerald-500" /> : null}
        </Button>
        <button
          onClick={handleWhatsApp}
          disabled={!inStock}
          className="h-11 px-4 flex items-center justify-center rounded-xl disabled:opacity-50"
          style={{ background: '#25D366' }}
        >
          <svg viewBox="0 0 24 24" style={{ width: 17, height: 17, fill: 'white' }}>
            <path d={WaPath} />
          </svg>
        </button>
      </div>

      <div className="h-20 lg:hidden" />
      <Footer />
    </div>
  );
}
