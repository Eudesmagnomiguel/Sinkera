import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, Loader2 } from 'lucide-react';

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: any;
  onSuccess: () => void;
  isReseller?: boolean;
}

export function ProductDialog({ open, onOpenChange, product, onSuccess, isReseller }: ProductDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: '', description: '', price: '', original_price: '', image_url: '',
    category_id: '', brand_id: '', stock_quantity: '', in_stock: true,
    is_featured: false, is_bestseller: false, is_special_offer: false, is_trending: false,
  });

  useEffect(() => { loadCategoriesAndBrands(); }, []);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '', description: product.description || '',
        price: product.price?.toString() || '', original_price: product.original_price?.toString() || '',
        image_url: product.image_url || '', category_id: product.category_id || '',
        brand_id: product.brand_id || '', stock_quantity: product.stock_quantity?.toString() || '',
        in_stock: product.in_stock ?? true, is_featured: product.is_featured ?? false,
        is_bestseller: product.is_bestseller ?? false, is_special_offer: product.is_special_offer ?? false,
        is_trending: product.is_trending ?? false,
      });
    } else {
      setFormData({
        name: '', description: '', price: '', original_price: '', image_url: '',
        category_id: '', brand_id: '', stock_quantity: '', in_stock: true,
        is_featured: false, is_bestseller: false, is_special_offer: false, is_trending: false,
      });
    }
  }, [product]);

  const loadCategoriesAndBrands = async () => {
    const [categoriesRes, brandsRes] = await Promise.all([
      supabase.from('categories').select('id, name').order('name'),
      supabase.from('brands').select('id, name').order('name')
    ]);
    if (categoriesRes.data) setCategories(categoriesRes.data);
    if (brandsRes.data) setBrands(brandsRes.data);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({ title: 'Erro', description: 'Por favor selecione uma imagem', variant: 'destructive' });
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, image_url: publicUrl }));
      toast({ title: 'Imagem carregada com sucesso' });
    } catch (error: any) {
      toast({ title: 'Erro no upload', description: error.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const productData: any = {
        name: formData.name, description: formData.description || null,
        price: parseFloat(formData.price),
        original_price: formData.original_price ? parseFloat(formData.original_price) : null,
        image_url: formData.image_url, category_id: formData.category_id || null,
        brand_id: formData.brand_id || null, stock_quantity: parseInt(formData.stock_quantity) || 0,
        in_stock: formData.in_stock, is_featured: formData.is_featured,
        is_bestseller: formData.is_bestseller, is_special_offer: formData.is_special_offer,
        is_trending: formData.is_trending,
      };

      if (isReseller && !product && user) productData.seller_id = user.id;

      let error;
      if (product) {
        const res = await supabase.from('products').update(productData).eq('id', product.id);
        error = res.error;
      } else {
        const res = await supabase.from('products').insert([productData]);
        error = res.error;
      }

      if (error) throw error;

      toast({
        title: product ? "Produto atualizado" : "Produto criado",
        description: product ? "O produto foi atualizado com sucesso" : "O produto foi criado com sucesso",
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving product:', error);
      toast({ title: "Erro", description: "Não foi possível salvar o produto", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? 'Editar Produto' : 'Adicionar Produto'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Produto *</Label>
            <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Preço (Kz) *</Label>
              <Input type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Preço Original (Kz)</Label>
              <Input type="number" step="0.01" value={formData.original_price} onChange={(e) => setFormData({ ...formData, original_price: e.target.value })} />
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Imagem do Produto *</Label>
            <div className="flex gap-3 items-start">
              <div className="flex-1 space-y-2">
                <Input
                  placeholder="URL da imagem ou faça upload"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  required
                />
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="gap-2">
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {uploading ? 'Enviando...' : 'Upload de Imagem'}
                </Button>
              </div>
              {formData.image_url && (
                <div className="relative">
                  <img src={formData.image_url} alt="Preview" className="w-20 h-20 object-cover rounded border" />
                  <button type="button" onClick={() => setFormData({ ...formData, image_url: '' })} className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={formData.category_id || undefined} onValueChange={(value) => setFormData({ ...formData, category_id: value })}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent className="max-h-[300px] overflow-y-auto">
                  {categories.filter(c => c.id && String(c.id).trim() !== '').map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Marca</Label>
              <Select value={formData.brand_id || undefined} onValueChange={(value) => setFormData({ ...formData, brand_id: value })}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent className="max-h-[300px] overflow-y-auto">
                  {brands.filter(b => b.id && String(b.id).trim() !== '').map((brand) => (
                    <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Quantidade em Stock *</Label>
            <Input type="number" value={formData.stock_quantity} onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })} required />
          </div>

          <div className="space-y-4 border-t pt-4">
            <h4 className="font-semibold">Categorias Especiais</h4>
            {[
              { key: 'in_stock', label: 'Em Stock' },
              { key: 'is_featured', label: '🔥 Produto em Destaque' },
              { key: 'is_bestseller', label: '⭐ Mais Vendido' },
              { key: 'is_special_offer', label: '💎 Oferta Especial' },
              { key: 'is_trending', label: '📰 Notícias & Tendências' },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between">
                <Label>{label}</Label>
                <Switch checked={(formData as any)[key]} onCheckedChange={(checked) => setFormData({ ...formData, [key]: checked })} />
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Salvando...' : product ? 'Atualizar' : 'Criar'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
