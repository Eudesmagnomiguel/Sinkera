import { Calendar, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNews } from "@/hooks/useNews";

export const NewsSection = () => {
  const { news, loading } = useNews();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-PT', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading || news.length === 0) return null;

  return (
    <section className="py-12 bg-gray-50 dark:bg-muted/20 border-t border-gray-100 dark:border-border">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <p className="text-[11px] font-bold text-gray-400 tracking-[0.2em] uppercase mb-1.5">Tecnologia & Mercado</p>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-foreground tracking-tight">
              Notícias & Tendências
            </h2>
          </div>
          {news.length > 0 && (
            <Link to="/noticias">
              <Button variant="outline" className="hidden md:flex items-center gap-2 rounded-xl text-sm">
                Ver Todas
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          )}
        </div>

        {news.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {news.slice(0, 4).map((item) => (
                <Link key={item.id} to={`/news/${item.id}`}>
                  <Card className="group cursor-pointer overflow-hidden hover:shadow-md transition-all duration-200 h-full border border-gray-200 dark:border-border hover:border-blue-200 rounded-2xl">
                    <div className="relative overflow-hidden">
                      <img
                        src={item.image_url || "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=250&fit=crop"}
                        alt={item.title}
                        className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {item.product && (
                        <div className="absolute top-2 left-2">
                          <span className="bg-blue-700 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                            {item.product.name}
                          </span>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mb-2">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(item.published_at)}</span>
                      </div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-foreground mb-1.5 line-clamp-2 group-hover:text-blue-700 transition-colors">
                        {item.title}
                      </h3>
                      {item.description && (
                        <p className="text-xs text-gray-500 line-clamp-2 mb-3">{item.description}</p>
                      )}
                      <span className="text-xs font-semibold text-blue-700 flex items-center gap-1 group-hover:gap-2 transition-all">
                        Ler mais <ArrowRight className="w-3 h-3" />
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            <div className="mt-6 text-center md:hidden">
              <Link to="/noticias">
                <Button variant="outline" className="w-full sm:w-auto text-sm rounded-xl">
                  Ver Todas as Notícias
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
};
