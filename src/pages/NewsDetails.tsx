import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Calendar, ArrowLeft, Tag } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { News } from '@/hooks/useNews';

const NewsDetails = () => {
  const { id } = useParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [news, setNews] = useState<News | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNews();
  }, [id]);

  const loadNews = async () => {
    if (!id) return;
    
    try {
      const { data, error } = await supabase
        .from('news_trends')
        .select('*, product:products(id, name)')
        .eq('id', id)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      setNews(data as News);
    } catch (error) {
      console.error('Error loading news:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-PT', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center h-[50vh]">
            <div className="text-center">Carregando...</div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!news) {
    return (
      <div className="min-h-screen bg-background">
        <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Notícia não encontrada</h2>
            <Link to="/">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para a página inicial
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      
      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </Link>

        {/* Article */}
        <article className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
              {news.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(news.published_at)}</span>
              </div>
              
              {news.product && (
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  <Link 
                    to={`/produto/${news.product_id}`}
                    className="text-primary hover:underline"
                  >
                    {news.product.name}
                  </Link>
                </div>
              )}
            </div>

            {news.description && (
              <p className="text-lg text-muted-foreground leading-relaxed">
                {news.description}
              </p>
            )}
          </div>

          {/* Featured Image */}
          {news.image_url && (
            <div className="mb-8 rounded-lg overflow-hidden">
              <img
                src={news.image_url}
                alt={news.title}
                className="w-full h-auto object-cover"
              />
            </div>
          )}

          {/* Video */}
          {news.video_url && (
            <div className="mb-8 rounded-lg overflow-hidden aspect-video">
              <iframe
                src={news.video_url}
                className="w-full h-full"
                allowFullScreen
                title={news.title}
              />
            </div>
          )}

          {/* Content */}
          {news.content && (
            <div className="prose prose-lg max-w-none">
              <div 
                className="text-foreground leading-relaxed whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: news.content }}
              />
            </div>
          )}

          {/* Related Product CTA */}
          {news.product && news.product_id && (
            <div className="mt-12 p-6 bg-muted rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Produto Relacionado</h3>
              <p className="text-muted-foreground mb-4">
                Conheça mais sobre {news.product.name}
              </p>
              <Link to={`/produto/${news.product_id}`}>
                <Button>Ver Produto</Button>
              </Link>
            </div>
          )}
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default NewsDetails;
