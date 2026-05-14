import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Eye, Zap, BarChart2, Check, ShoppingCart } from "lucide-react";
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

export const ProductCard = ({ product }: { product: Product }) => {
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  const [added, setAdded] = useState(false);

  const wishlisted = isInWishlist(product.id);
  const compared   = isInCompare(product.id);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    wishlisted ? removeFromWishlist(product.id) : addToWishlist(product.id);
  };

  const toggleCompare = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    compared ? removeFromCompare(product.id) : addToCompare(product.id);
  };

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!product.in_stock) return;
    addToCart(product.id);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const lowStock = product.stock_quantity != null
    && product.stock_quantity > 0
    && product.stock_quantity <= 5;

  return (
    <article className="product-card group relative flex flex-col bg-card">

      {/* ── Imagem ── */}
      <Link to={`/produto/${product.id}`} className="relative block overflow-hidden bg-muted/30">
        <div className="aspect-square p-4 sm:p-5 flex items-center justify-center">
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-[1.05]"
          />
        </div>

        {/* Overlay de esgotado */}
        {!product.in_stock && (
          <div className="absolute inset-0 bg-background/70 flex items-end justify-center pb-4 pointer-events-none">
            <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground bg-background/90 px-3 py-1 rounded-full border border-border">
              Esgotado
            </span>
          </div>
        )}

        {/* Acções rápidas — centro, fade no hover */}
        <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
          <Link
            to={`/produto/${product.id}`}
            onClick={(e) => e.stopPropagation()}
            className="w-9 h-9 rounded-full bg-card shadow-md border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-150"
            title="Ver produto"
          >
            <Eye className="w-4 h-4" />
          </Link>
          <button
            onClick={handleAdd}
            disabled={!product.in_stock}
            className="w-9 h-9 rounded-full bg-card shadow-md border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Compra rápida"
          >
            <Zap className="w-4 h-4" />
          </button>
          <button
            onClick={toggleCompare}
            title={compared ? "Remover da comparação" : "Comparar"}
            className={`w-9 h-9 rounded-full shadow-md border flex items-center justify-center transition-all duration-150 ${
              compared
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-border hover:bg-primary hover:text-primary-foreground hover:border-primary"
            }`}
          >
            {compared ? <Check className="w-4 h-4" /> : <BarChart2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Badges — canto superior esquerdo */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-20 pointer-events-none">
          {product.badge && (
            <span className="badge-new">{product.badge}</span>
          )}
          {lowStock && product.in_stock && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500 text-white">
              Últimas {product.stock_quantity}
            </span>
          )}
        </div>

        {/* Favorito — canto superior direito */}
        <button
          onClick={toggleWishlist}
          aria-label="Adicionar aos favoritos"
          className={`absolute top-2 right-2 z-20 w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-200 ${
            wishlisted
              ? "bg-red-50 border-red-200 opacity-100 dark:bg-red-950/40 dark:border-red-800"
              : "bg-card border-border opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:border-red-200"
          }`}
        >
          <Heart className={`w-3.5 h-3.5 transition-colors ${wishlisted ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
        </button>
      </Link>

      {/* ── Informação ── */}
      <div className="flex flex-col flex-1 p-3 gap-2">

        {/* Nome */}
        <Link to={`/produto/${product.id}`} className="flex-1">
          <h3 className="text-[13px] font-semibold text-foreground line-clamp-2 leading-snug hover:text-primary transition-colors duration-150">
            {product.name}
          </h3>
        </Link>

        {/* Preço */}
        <div className="space-y-0.5 mt-auto">
          {product.original_price && product.original_price > product.price && (
            <span className="price-original text-xs">
              {product.original_price.toLocaleString("pt-AO", { maximumFractionDigits: 0 })} Kz
            </span>
          )}
          <div className="flex items-baseline gap-1">
            <span className="text-[19px] font-bold text-primary leading-none">
              {product.price.toLocaleString("pt-AO", { maximumFractionDigits: 0 })}
            </span>
            <span className="text-[11px] font-medium text-muted-foreground">Kz</span>
          </div>
        </div>

        {/* Botão Adicionar */}
        <button
          onClick={handleAdd}
          disabled={!product.in_stock}
          className={`w-full h-9 rounded-md text-[13px] font-semibold flex items-center justify-center gap-1.5 transition-all duration-150 active:scale-[0.98] ${
            !product.in_stock
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : added
              ? "bg-[hsl(143_70%_33%)] text-white"
              : "btn-cta"
          }`}
        >
          {!product.in_stock ? (
            "Indisponível"
          ) : added ? (
            <><Check className="w-3.5 h-3.5" /> Adicionado</>
          ) : (
            <><ShoppingCart className="w-3.5 h-3.5" /> Adicionar ao Carrinho</>
          )}
        </button>
      </div>
    </article>
  );
};
