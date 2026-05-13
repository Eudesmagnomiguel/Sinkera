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
}

export const ProductSection = ({
  title,
  products,
  viewAllLink,
  eyebrow,
  description,
}: ProductSectionProps) => {
  return (
    <section className="py-10">
      {/* Section Header */}
      <div className="flex items-end justify-between mb-6 gap-4">
        <div>
          {eyebrow && (
            <span className="inline-block text-xs font-bold text-orange-600 uppercase tracking-wider mb-1.5 bg-orange-50 px-2.5 py-1 rounded">
              {eyebrow}
            </span>
          )}
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
            {title}
          </h2>
          {description && (
            <p className="text-sm text-gray-500 mt-1.5 max-w-xl">{description}</p>
          )}
        </div>

        {viewAllLink && (
          <Link
            to={viewAllLink === "#" ? "/produtos" : viewAllLink}
            className="flex items-center gap-1.5 text-blue-700 hover:text-blue-900 text-sm font-semibold transition-colors whitespace-nowrap flex-shrink-0 group"
          >
            Ver todos
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
        {products.slice(0, 10).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};
