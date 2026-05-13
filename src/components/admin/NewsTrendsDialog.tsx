import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface NewsTrend {
  id: string;
  title: string;
  description?: string;
  content?: string;
  image_url?: string;
  video_url?: string;
  product_id?: string;
  is_active: boolean;
}

interface NewsTrendsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newsTrend?: NewsTrend;
  onSuccess: () => void;
}

export function NewsTrendsDialog({ open, onOpenChange, newsTrend, onSuccess }: NewsTrendsDialogProps) {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<{ id: string; name: string }[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    image_url: '',
    video_url: '',
    product_id: '',
    is_active: true,
  });
  const { toast } = useToast();

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (newsTrend) {
      setFormData({
        title: newsTrend.title,
        description: newsTrend.description || '',
        content: newsTrend.content || '',
        image_url: newsTrend.image_url || '',
        video_url: newsTrend.video_url || '',
        product_id: newsTrend.product_id || '',
        is_active: newsTrend.is_active,
      });
    } else {
      setFormData({
        title: '',
        description: '',
        content: '',
        image_url: '',
        video_url: '',
        product_id: '',
        is_active: true,
      });
    }
  }, [newsTrend]);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const newsData = {
        title: formData.title,
        description: formData.description || null,
        content: formData.content || null,
        image_url: formData.image_url || null,
        video_url: formData.video_url || null,
        product_id: formData.product_id || null,
        is_active: formData.is_active,
      };

      if (newsTrend) {
        const { error } = await supabase
          .from('news_trends')
          .update(newsData)
          .eq('id', newsTrend.id);

        if (error) throw error;

        toast({
          title: "Atualizado com sucesso",
          description: "A notícia/tendência foi atualizada",
        });
      } else {
        const { error } = await supabase
          .from('news_trends')
          .insert([newsData]);

        if (error) throw error;

        toast({
          title: "Criado com sucesso",
          description: "A notícia/tendência foi criada",
        });
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving news/trend:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a notícia/tendência",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {newsTrend ? 'Editar Notícia/Tendência' : 'Nova Notícia/Tendência'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição Breve</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Conteúdo Completo</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url">URL da Imagem</Label>
            <Input
              id="image_url"
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              placeholder="https://exemplo.com/imagem.jpg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="video_url">URL do Vídeo</Label>
            <Input
              id="video_url"
              type="url"
              value={formData.video_url}
              onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
              placeholder="https://youtube.com/watch?v=..."
            />
            <p className="text-xs text-muted-foreground">
              Suporta YouTube, Vimeo e outros vídeos embarcados
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="product_id">Produto Relacionado (Opcional)</Label>
            <Select
              value={formData.product_id || undefined}
              onValueChange={(value) => setFormData({ ...formData, product_id: value === 'none' ? '' : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecionar produto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum produto</SelectItem>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
            <Label htmlFor="is_active">Ativo/Publicado</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
