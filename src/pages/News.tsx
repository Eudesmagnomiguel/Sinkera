import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, ArrowRight } from 'lucide-react';
import { useNews } from '@/hooks/useNews';

const News = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { news, loading } = useNews();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-PT', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
            Notícias & Tendências
          </h1>
          <p className="text-muted-foreground">
            Fique por dentro das últimas novidades em tecnologia
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">Carregando notícias...</div>
          </div>
        )}

        {/* Empty State */}
        {!loading && news.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              Nenhuma notícia disponível no momento.
            </p>
            <Link to="/">
              <Button>Voltar para a página inicial</Button>
            </Link>
          </div>
        )}

        {/* News Grid */}
        {!loading && news.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {news.map((item) => (
              <Link key={item.id} to={`/news/${item.id}`}>
                <Card className="group cursor-pointer overflow-hidden hover:shadow-lg transition-shadow h-full">
                  <div className="relative overflow-hidden">
                    <img
                      src={item.image_url || "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=250&fit=crop"}
                      alt={item.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {item.product && (
                      <div className="absolute top-3 left-3">
                        <span className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                          {item.product.name}
                        </span>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(item.published_at)}</span>
                    </div>
                    <h3 className="text-base font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                        {item.description}
                      </p>
                    )}
                    <Button variant="link" className="p-0 h-auto text-sm font-medium text-primary">
                      Ler mais
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default News;
