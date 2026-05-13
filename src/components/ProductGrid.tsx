import { ProductCard } from "./ProductCard";
import { ProductListItem } from "./ProductListItem";
import { PackageSearch } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

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

interface ProductGridProps {
  products: Product[];
  viewMode: "grid" | "list";
}

export const ProductGrid = ({ products, viewMode }: ProductGridProps) => {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-5">
          <PackageSearch className="w-10 h-10 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-bold mb-2">Nenhum produto encontrado</h3>
        <p className="text-muted-foreground text-sm max-w-xs mb-6">
          Tenta ajustar os filtros ou experimenta uma pesquisa diferente.
        </p>
        <Link to="/produtos">
          <Button variant="outline" size="sm">Ver todos os produtos</Button>
        </Link>
      </div>
    );
  }

  if (viewMode === "list") {
    return (
      <div className="space-y-3">
        {products.map((product) => (
          <ProductListItem key={product.id} product={product} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
