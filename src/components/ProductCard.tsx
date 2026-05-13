import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Star, Eye, Zap, BarChart2, Check } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { useCompare } from "@/hooks/useCompare";

interface Product {
  id: string;
  name: string;
  price: number;
  original_price?: number;
  image_url: string;
  rating?: number;
  reviews_count?: number;
  badge?: string;
  in_stock: boolean;
  stock_quantity?: number;
}

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  const [addedFeedback, setAddedFeedback] = useState(false);

  const isWishlisted = isInWishlist(product.id);
  const inCompare = isInCompare(product.id);

  const handleCompareToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inCompare) {
      removeFromCompare(product.id);
    } else {
      addToCompare(product.id);
    }
  };

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isWishlisted ? await removeFromWishlist(product.id) : await addToWishlist(product.id);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product.id);
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 1500);
  };

  const discount =
    product.original_price && product.original_price > product.price
      ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
      : 0;

  const lowStock = product.stock_quantity != null && product.stock_quantity > 0 && product.stock_quantity <= 5;

  return (
    <article className="group relative flex flex-col bg-card rounded-2xl border border-border hover:border-primary/40 hover:shadow-xl transition-all duration-300 overflow-hidden">

      {/* ── Image area ── */}
      <Link to={`/produto/${product.id}`} className="relative block overflow-hidden bg-muted/30">
        <div className="aspect-square p-4 sm:p-5">
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
          />
        </div>

        {/* Hover overlay with quick actions */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
          <Link
            to={`/produto/${product.id}`}
            onClick={(e) => e.stopPropagation()}
            className="w-9 h-9 rounded-full bg-background shadow-md flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all -translate-y-2 group-hover:translate-y-0 duration-300"
          >
            <Eye className="w-4 h-4" />
          </Link>
          <button
            onClick={handleAddToCart}
            disabled={!product.in_stock}
            className="w-9 h-9 rounded-full bg-background shadow-md flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all -translate-y-2 group-hover:translate-y-0 duration-500 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Zap className="w-4 h-4" />
          </button>
          <button
            onClick={handleCompareToggle}
            title={inCompare ? 'Remover da comparação' : 'Comparar'}
            className={`w-9 h-9 rounded-full shadow-md flex items-center justify-center transition-all -translate-y-2 group-hover:translate-y-0 duration-700 ${
              inCompare
                ? 'bg-primary text-primary-foreground'
                : 'bg-background hover:bg-primary hover:text-primary-foreground'
            }`}
          >
            {inCompare ? <Check className="w-4 h-4" /> : <BarChart2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {discount > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-sm">
              -{discount}%
            </span>
          )}
          {product.badge && (
            <span className="bg-violet-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
              {product.badge}
            </span>
          )}
          {!product.in_stock && (
            <span className="bg-gray-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
              Esgotado
            </span>
          )}
          {lowStock && product.in_stock && (
            <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
              Últimas {product.stock_quantity}!
            </span>
          )}
        </div>

        {/* Wishlist button */}
        <button
          onClick={toggleWishlist}
          className={`absolute top-2 right-2 z-10 w-8 h-8 rounded-full flex items-center justify-center shadow-md border transition-all duration-200 ${
            isWishlisted
              ? "bg-red-50 border-red-200 opacity-100"
              : "bg-background border-border opacity-0 group-hover:opacity-100 hover:border-red-200 hover:bg-red-50"
          }`}
          aria-label="Favoritos"
        >
          <Heart className={`w-3.5 h-3.5 ${isWishlisted ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
        </button>
      </Link>

      {/* ── Info area ── */}
      <div className="flex flex-col flex-1 p-3 gap-2">

        {/* Rating */}
        <div className="flex items-center gap-1 h-4">
          {typeof product.rating === "number" && product.rating > 0 ? (
            <>
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-3 h-3 ${i < Math.round(product.rating!) ? "fill-amber-400 text-amber-400" : "fill-muted text-muted"}`} />
                ))}
              </div>
              <span className="text-[11px] text-muted-foreground font-medium">
                {product.rating.toFixed(1)}
                {product.reviews_count ? <span> ({product.reviews_count})</span> : null}
              </span>
            </>
          ) : (
            <span className="text-[11px] text-muted-foreground/50">Sem avaliações</span>
          )}
        </div>

        {/* Name */}
        <Link to={`/produto/${product.id}`} className="flex-1">
          <h3 className="text-sm font-semibold text-foreground line-clamp-2 leading-snug hover:text-primary transition-colors min-h-[2.5rem]">
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <div className="mt-auto space-y-0.5">
          {product.original_price && product.original_price > product.price && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground line-through">
                {product.original_price.toLocaleString("pt-AO", { maximumFractionDigits: 0 })} Kz
              </span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded-full">
                Poupa {(product.original_price - product.price).toLocaleString("pt-AO", { maximumFractionDigits: 0 })} Kz
              </span>
            </div>
          )}
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black text-foreground leading-none">
              {product.price.toLocaleString("pt-AO", { maximumFractionDigits: 0 })}
            </span>
            <span className="text-xs font-semibold text-muted-foreground">Kz</span>
          </div>
        </div>

        {/* Add to cart button */}
        <button
          onClick={handleAddToCart}
          disabled={!product.in_stock}
          className={`w-full h-9 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition-all duration-200 mt-1 ${
            !product.in_stock
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : addedFeedback
              ? "bg-emerald-500 text-white scale-[0.98]"
              : "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md active:scale-[0.97]"
          }`}
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          {!product.in_stock ? "Indisponível" : addedFeedback ? "Adicionado ✓" : "Adicionar ao Carrinho"}
        </button>
      </div>
    </article>
  );
};
