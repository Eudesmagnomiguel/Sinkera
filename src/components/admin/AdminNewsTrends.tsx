import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit2, Trash2, Eye, EyeOff, Newspaper, Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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

const empty = { title: '', description: '', content: '', image_url: '', video_url: '', product_id: '', is_active: true };

export function AdminNewsTrends() {
  const [items,     setItems]     = useState<NewsTrend[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [open,      setOpen]      = useState(false);
  const [selected,  setSelected]  = useState<NewsTrend | null>(null);
  const [form,      setForm]      = useState(empty);
  const [saving,    setSaving]    = useState(false);
  const [uploading, setUploading] = useState(false);
  const [products,  setProducts]  = useState<{ id: string; name: string }[]>([]);
  const { toast } = useToast();

  useEffect(() => { load(); loadProducts(); }, []);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('news_trends')
      .select('*, product:products(name)')
      .order('published_at', { ascending: false });
    setItems((data as NewsTrend[]) || []);
    setLoading(false);
  };

  const loadProducts = async () => {
    const { data } = await supabase.from('products').select('id, name').order('name');
    setProducts(data || []);
  };

  const openAdd = () => {
    setSelected(null);
    setForm(empty);
    setOpen(true);
  };

  const openEdit = (item: NewsTrend) => {
    setSelected(item);
    setForm({
      title: item.title,
      description: item.description || '',
      content: item.content || '',
      image_url: item.image_url || '',
      video_url: item.video_url || '',
      product_id: item.product_id || '',
      is_active: item.is_active,
    });
    setOpen(true);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext  = file.name.split('.').pop();
      const path = `news/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from('product-images').upload(path, file, { cacheControl: '3600', upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from('product-images').getPublicUrl(path);
      setForm(f => ({ ...f, image_url: data.publicUrl }));
      toast({ title: 'Imagem carregada' });
    } catch (err: any) {
      toast({ title: 'Erro no upload', description: err.message, variant: 'destructive' });
    } finally { setUploading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { toast({ title: 'Título obrigatório', variant: 'destructive' }); return; }
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        description: form.description || null,
        content: form.content || null,
        image_url: form.image_url || null,
        video_url: form.video_url || null,
        product_id: form.product_id || null,
        is_active: form.is_active,
      };
      if (selected) {
        const { error } = await supabase.from('news_trends').update(payload).eq('id', selected.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('news_trends').insert([payload]);
        if (error) throw error;
      }
      toast({ title: selected ? 'Notícia actualizada' : 'Notícia criada' });
      setOpen(false); load();
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminar esta notícia?')) return;
    const { error } = await supabase.from('news_trends').delete().eq('id', id);
    if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Notícia eliminada' }); load(); }
  };

  const toggleActive = async (item: NewsTrend) => {
    await supabase.from('news_trends').update({ is_active: !item.is_active }).eq('id', item.id);
    load();
  };

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'hsl(22 100% 46%) transparent transparent transparent' }} />
    </div>
  );

  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="space-y-1">
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground">Homepage</p>
          <h2 className="text-xl font-black text-foreground tracking-tight">Notícias & Tendências</h2>
          <p className="text-xs text-muted-foreground">{items.length} artigo{items.length !== 1 ? 's' : ''} publicado{items.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 h-9 px-4 rounded-xl text-xs font-bold tracking-wide text-white transition-all"
          style={{ background: 'hsl(22 100% 46%)' }}
          onMouseEnter={e => e.currentTarget.style.background = 'hsl(22 100% 40%)'}
          onMouseLeave={e => e.currentTarget.style.background = 'hsl(22 100% 46%)'}
        >
          <Plus className="w-3.5 h-3.5" /> Nova Notícia
        </button>
      </div>

      {/* Empty state */}
      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-20 flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
            <Newspaper className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">Nenhuma notícia ainda</p>
            <p className="text-xs text-muted-foreground">Adiciona o primeiro artigo para aparecer na homepage.</p>
          </div>
          <button onClick={openAdd} className="flex items-center gap-1.5 h-8 px-4 rounded-xl text-xs font-bold text-white" style={{ background: 'hsl(22 100% 46%)' }}>
            <Plus className="w-3.5 h-3.5" /> Adicionar Notícia
          </button>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[5rem_1fr_auto_auto_auto] gap-4 items-center px-5 py-2.5 border-b border-border bg-muted/30">
            {['Imagem', 'Título', 'Data', 'Estado', ''].map((h, i) => (
              <span key={i} className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{h}</span>
            ))}
          </div>

          <div className="divide-y divide-border">
            {items.map(item => (
              <div key={item.id} className="grid grid-cols-[5rem_1fr_auto_auto_auto] gap-4 items-center px-5 py-3.5 hover:bg-muted/20 transition-colors">
                {/* Thumbnail */}
                <div className="w-20 h-12 rounded-lg overflow-hidden border border-border bg-muted flex items-center justify-center">
                  {item.image_url
                    ? <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                    : <Newspaper className="w-4 h-4 text-muted-foreground/40" />
                  }
                </div>

                {/* Title */}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{item.title}</p>
                  {item.description && <p className="text-xs text-muted-foreground truncate">{item.description}</p>}
                </div>

                {/* Date */}
                <span className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                  {format(new Date(item.published_at), 'dd/MM/yyyy')}
                </span>

                {/* Active toggle */}
                <button
                  onClick={() => toggleActive(item)}
                  className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-all ${
                    item.is_active
                      ? 'border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30'
                      : 'border-border text-muted-foreground'
                  }`}
                >
                  {item.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  {item.is_active ? 'Ativo' : 'Oculto'}
                </button>

                {/* Actions */}
                <div className="flex items-center gap-1.5">
                  <button onClick={() => openEdit(item)} className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-destructive hover:border-destructive/40 hover:bg-destructive/5 transition-all">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dialog */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-5 border-b border-border flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Notícias</p>
                <h3 className="text-lg font-black text-foreground">{selected ? 'Editar Notícia' : 'Nova Notícia'}</h3>
              </div>
              <button onClick={() => setOpen(false)} className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-all">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">

              {/* Image */}
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Imagem de Capa</Label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="flex items-center gap-2 h-9 px-4 rounded-xl border border-border text-xs font-semibold text-foreground hover:bg-muted transition-all">
                    {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    {uploading ? 'A enviar…' : 'Carregar imagem'}
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
                </label>
                {form.image_url && (
                  <div className="relative rounded-xl overflow-hidden border border-border h-36">
                    <img src={form.image_url} alt="preview" className="w-full h-full object-cover" />
                  </div>
                )}
                <Input placeholder="Ou cola URL da imagem" value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} className="rounded-xl text-sm h-9" />
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Título *</Label>
                <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required className="rounded-xl h-9" />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Descrição Breve</Label>
                <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} className="rounded-xl text-sm resize-none" />
              </div>

              {/* Content */}
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Conteúdo Completo</Label>
                <Textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={4} className="rounded-xl text-sm resize-none" />
              </div>

              {/* Video URL */}
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">URL do Vídeo (Opcional)</Label>
                <Input placeholder="https://youtube.com/watch?v=..." value={form.video_url} onChange={e => setForm({ ...form, video_url: e.target.value })} className="rounded-xl h-9" />
              </div>

              {/* Product */}
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Produto Relacionado (Opcional)</Label>
                <select
                  value={form.product_id}
                  onChange={e => setForm({ ...form, product_id: e.target.value })}
                  className="w-full h-9 rounded-xl border border-border bg-background text-sm px-3 text-foreground focus:outline-none focus:ring-1 focus:ring-border"
                >
                  <option value="">Nenhum produto</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              {/* Active */}
              <div className="flex items-center gap-2.5">
                <Switch checked={form.is_active} onCheckedChange={v => setForm({ ...form, is_active: v })} />
                <Label className="text-sm text-muted-foreground">Visível na homepage</Label>
              </div>

              <div className="flex gap-3 pt-2 border-t border-border">
                <button type="button" onClick={() => setOpen(false)} className="flex-1 h-10 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-muted transition-all">Cancelar</button>
                <button type="submit" disabled={saving || uploading} className="flex-1 h-10 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-60"
                        style={{ background: 'hsl(22 100% 46%)' }}>
                  {saving ? 'A guardar…' : selected ? 'Actualizar' : 'Criar Notícia'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
