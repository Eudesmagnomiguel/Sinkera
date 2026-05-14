import { ArrowRight } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { Link } from "react-router-dom";

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

interface ProductSectionProps {
  title: string;
  products: Product[];
  viewAllLink?: string;
  eyebrow?: string;
  description?: string;
  icon?: React.ElementType;
}

export const ProductSection = ({
  title,
  products,
  viewAllLink,
  eyebrow,
  description,
  icon: Icon,
}: ProductSectionProps) => {
  return (
    <section className="py-8">
      {/* Header */}
      <div className="flex items-end justify-between mb-5 gap-4">
        <div>
          {eyebrow && (
            <div className="flex items-center gap-1.5 mb-1.5">
              {Icon && <Icon className="w-3.5 h-3.5 text-muted-foreground/60" />}
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
                {eyebrow}
              </span>
            </div>
          )}
          <h2 className="text-xl sm:text-2xl font-bold text-foreground leading-tight">
            {title}
          </h2>
          {description && (
            <p className="text-sm text-muted-foreground mt-1 max-w-xl">{description}</p>
          )}
        </div>

        {viewAllLink && (
          <Link
            to={viewAllLink === "#" ? "/produtos" : viewAllLink}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 group"
          >
            Ver todos
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
        {products.slice(0, 10).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};
