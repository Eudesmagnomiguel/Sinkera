import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2, Upload, X, ImageIcon, ToggleLeft, ToggleRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  is_featured?: boolean | null;
}

const generateSlug = (name: string) =>
  name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export function AdminBrands() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<Brand | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string>('');
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const [form, setForm] = useState({ name: '', slug: '', logo_url: '', is_featured: false });

  useEffect(() => { load(); }, []);

  const load = async () => {
    const { data } = await (supabase as any).from('brands').select('*').order('name');
    setBrands(data || []);
    setLoading(false);
  };

  const openAdd = () => {
    setSelected(null);
    setForm({ name: '', slug: '', logo_url: '', is_featured: false });
    setPreview('');
    setDialogOpen(true);
  };

  const openEdit = (brand: Brand) => {
    setSelected(brand);
    setForm({
      name: brand.name,
      slug: brand.slug,
      logo_url: brand.logo_url || '',
      is_featured: brand.is_featured ?? false,
    });
    setPreview(brand.logo_url || '');
    setDialogOpen(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Ficheiro inválido', description: 'Selecione uma imagem.', variant: 'destructive' });
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `brands/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: upErr } = await supabase.storage.from('product-images').upload(path, file, { upsert: true });
      if (upErr) throw upErr;

      const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(path);
      const url = urlData.publicUrl;
      setForm((f) => ({ ...f, logo_url: url }));
      setPreview(url);
      toast({ title: 'Imagem carregada com sucesso' });
    } catch (err: any) {
      toast({ title: 'Erro ao carregar imagem', description: err.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const clearImage = () => {
    setForm((f) => ({ ...f, logo_url: '' }));
    setPreview('');
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim() || generateSlug(form.name),
        logo_url: form.logo_url || null,
        is_featured: form.is_featured,
      };

      if (selected) {
        const { error } = await (supabase as any).from('brands').update(payload).eq('id', selected.id);
        if (error) throw error;
      } else {
        const { error } = await (supabase as any).from('brands').insert([payload]);
        if (error) throw error;
      }

      toast({ title: selected ? 'Marca atualizada' : 'Marca criada com sucesso' });
      setDialogOpen(false);
      load();
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminar esta marca?')) return;
    const { error } = await (supabase as any).from('brands').delete().eq('id', id);
    if (error) {
      toast({ title: 'Erro', description: 'Não foi possível eliminar. Pode ter produtos associados.', variant: 'destructive' });
    } else {
      toast({ title: 'Marca eliminada' });
      load();
    }
  };

  const toggleFeatured = async (brand: Brand) => {
    await (supabase as any).from('brands').update({ is_featured: !brand.is_featured }).eq('id', brand.id);
    load();
  };

  if (loading) return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-pulse">
      {[...Array(8)].map((_, i) => <div key={i} className="h-24 rounded-xl bg-muted" />)}
    </div>
  );

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Marcas</CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">{brands.length} marcas registadas</p>
          </div>
          <Button variant="vibrant" className="gap-2" onClick={openAdd}>
            <Plus className="w-4 h-4" /> Adicionar Marca
          </Button>
        </CardHeader>
        <CardContent>
          {brands.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ImageIcon className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="font-medium">Nenhuma marca adicionada</p>
              <p className="text-sm">Clique em "Adicionar Marca" para começar.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
              {brands.map((brand) => (
                <div
                  key={brand.id}
                  className="relative group rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-md transition-all overflow-hidden"
                >
                  {/* Logo area */}
                  <div className="aspect-square flex items-center justify-center p-4 bg-muted/40">
                    {brand.logo_url ? (
                      <img
                        src={brand.logo_url}
                        alt={brand.name}
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-muted-foreground">
                        <ImageIcon className="w-8 h-8 opacity-30" />
                        <span className="text-xs font-bold opacity-60">{brand.name}</span>
                      </div>
                    )}
                  </div>

                  {/* Name + featured badge */}
                  <div className="px-3 py-2 border-t border-border">
                    <p className="text-sm font-semibold truncate">{brand.name}</p>
                    <div className="flex items-center justify-between mt-1">
                      <button
                        onClick={() => toggleFeatured(brand)}
                        className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground hover:text-primary transition-colors"
                        title="Destaque na homepage"
                      >
                        {brand.is_featured
                          ? <ToggleRight className="w-4 h-4 text-primary" />
                          : <ToggleLeft className="w-4 h-4" />}
                        {brand.is_featured ? 'Destaque' : 'Oculto'}
                      </button>
                    </div>
                  </div>

                  {/* Hover actions */}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEdit(brand)}
                      className="w-7 h-7 rounded-lg bg-background/90 border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors shadow-sm"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(brand.id)}
                      className="w-7 h-7 rounded-lg bg-background/90 border border-border flex items-center justify-center hover:bg-destructive hover:text-white transition-colors shadow-sm"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit / Add dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selected ? 'Editar Marca' : 'Nova Marca'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Logo upload */}
            <div className="space-y-2">
              <Label>Logo da Marca</Label>
              <div
                onClick={() => !uploading && fileRef.current?.click()}
                className="relative flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 hover:bg-muted/40 transition-all min-h-[140px] bg-muted/20"
              >
                {preview ? (
                  <>
                    <img src={preview} alt="preview" className="max-h-28 max-w-full object-contain p-2 rounded-lg" />
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); clearImage(); }}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-destructive text-white flex items-center justify-center hover:bg-destructive/80"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </>
                ) : uploading ? (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm">A carregar...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground p-4">
                    <Upload className="w-8 h-8 opacity-40" />
                    <p className="text-sm font-medium">Clique para carregar imagem</p>
                    <p className="text-xs opacity-60">PNG, JPG, SVG, WEBP</p>
                  </div>
                )}
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </div>

              {/* Or URL input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <span className="text-xs text-muted-foreground">URL</span>
                </div>
                <Input
                  value={form.logo_url}
                  onChange={(e) => { setForm((f) => ({ ...f, logo_url: e.target.value })); setPreview(e.target.value); }}
                  placeholder="ou cole um URL de imagem..."
                  className="pl-10 text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Nome da Marca *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: generateSlug(e.target.value) }))}
                placeholder="Ex: Apple, Samsung..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Slug (URL amigável)</Label>
              <Input
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                placeholder="apple, samsung..."
              />
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, is_featured: !f.is_featured }))}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {form.is_featured
                  ? <ToggleRight className="w-5 h-5 text-primary" />
                  : <ToggleLeft className="w-5 h-5" />}
                Mostrar em destaque na homepage
              </button>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={saving || uploading} variant="vibrant">
                {saving ? 'A guardar...' : selected ? 'Atualizar' : 'Criar Marca'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
