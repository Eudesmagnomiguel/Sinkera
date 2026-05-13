import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Eye, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";

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
}

interface ProductListItemProps {
  product: Product;
}

export const ProductListItem = ({ product }: ProductListItemProps) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { addToCart } = useCart();

  const discount = product.original_price 
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  const handleAddToCart = () => {
    addToCart(product.id);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden">
      <div className="flex p-4 gap-4">
        {/* Image */}
        <Link to={`/produto/${product.id}`} className="relative w-32 h-32 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
          />
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.badge && (
              <Badge className="bg-red-500 text-white text-xs font-medium px-1 py-0.5">
                {product.badge}
              </Badge>
            )}
            {discount > 0 && (
              <Badge className="bg-green-500 text-white text-xs font-medium px-1 py-0.5">
                -{discount}%
              </Badge>
            )}
          </div>
        </Link>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <button
              onClick={() => setIsWishlisted(!isWishlisted)}
              className={`p-1 rounded-full transition-colors ${
                isWishlisted 
                  ? 'text-red-500' 
                  : 'text-gray-400 hover:text-red-500'
              }`}
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
            </button>
          </div>

          <Link to={`/produto/${product.id}`}>
            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-primary transition-colors">
              {product.name}
            </h3>
          </Link>

          {/* Rating */}
          {product.rating && (
            <div className="flex items-center gap-1 mb-3">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      i < Math.floor(product.rating!)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500">
                {product.rating} ({product.reviews_count || 0} avaliações)
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-gray-900">
                  {product.price.toLocaleString('pt-AO', { maximumFractionDigits: 0 })} Kz
                 </span>
                 {product.original_price && (
                   <span className="text-sm text-gray-500 line-through">
                     {product.original_price.toLocaleString('pt-AO', { maximumFractionDigits: 0 })} Kz
                   </span>
                 )}
               </div>
               <div className="text-xs text-green-600 font-medium">
                 12x de {(product.price / 12).toLocaleString('pt-AO', { maximumFractionDigits: 0 })} Kz sem juros
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link to={`/produto/${product.id}`}>
                <Button size="sm" variant="outline">
                  <Eye className="w-4 h-4" />
                </Button>
              </Link>
              <Button 
                size="sm" 
                variant="vibrant"
                disabled={!product.in_stock}
                onClick={handleAddToCart}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                {product.in_stock ? 'Comprar' : 'Esgotado'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
