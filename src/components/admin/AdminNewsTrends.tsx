import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Video, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { NewsTrendsDialog } from './NewsTrendsDialog';
import { format } from 'date-fns';

interface NewsTrend {
  id: string;
  title: string;
  description?: string;
  content?: string;
  image_url?: string;
  video_url?: string;
  product_id?: string;
  is_active: boolean;
  published_at: string;
  product?: { name: string } | null;
}

export function AdminNewsTrends() {
  const [newsTrends, setNewsTrends] = useState<NewsTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState<NewsTrend | undefined>(undefined);
  const { toast } = useToast();

  useEffect(() => {
    loadNewsTrends();
  }, []);

  const loadNewsTrends = async () => {
    try {
      const { data, error } = await supabase
        .from('news_trends')
        .select(`
          *,
          product:products(name)
        `)
        .order('published_at', { ascending: false });

      if (error) throw error;
      setNewsTrends(data as any || []);
    } catch (error) {
      console.error('Error loading news/trends:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as notícias/tendências",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (news: NewsTrend) => {
    setSelectedNews(news);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedNews(undefined);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja eliminar esta notícia/tendência?')) return;

    try {
      const { error } = await supabase
        .from('news_trends')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await loadNewsTrends();
      toast({
        title: "Eliminado com sucesso",
        description: "A notícia/tendência foi eliminada",
      });
    } catch (error) {
      console.error('Error deleting news/trend:', error);
      toast({
        title: "Erro",
        description: "Não foi possível eliminar a notícia/tendência",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div>A carregar...</div>;
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Notícias & Tendências</CardTitle>
          <Button variant="vibrant" className="gap-2" onClick={handleAdd}>
            <Plus className="w-4 h-4" />
            Adicionar Notícia/Tendência
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Mídia</TableHead>
                <TableHead>Publicado em</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {newsTrends.map((news) => (
                <TableRow key={news.id}>
                  <TableCell className="font-medium max-w-xs truncate">
                    {news.title}
                  </TableCell>
                  <TableCell>{news.product?.name || '-'}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {news.image_url && (
                        <div className="flex items-center gap-1" title="Tem imagem">
                          <ImageIcon className="w-4 h-4 text-blue-500" />
                        </div>
                      )}
                      {news.video_url && (
                        <div className="flex items-center gap-1" title="Tem vídeo">
                          <Video className="w-4 h-4 text-red-500" />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(new Date(news.published_at), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell>
                    <Badge variant={news.is_active ? "default" : "secondary"}>
                      {news.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="icon" variant="outline" onClick={() => handleEdit(news)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="destructive"
                        onClick={() => handleDelete(news.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {newsTrends.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Nenhuma notícia/tendência cadastrada
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <NewsTrendsDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen}
        newsTrend={selectedNews}
        onSuccess={loadNewsTrends}
      />
    </>
  );
}
