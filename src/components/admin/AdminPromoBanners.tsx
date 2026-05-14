import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Upload, Eye, EyeOff, Palette } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PromoBanner {
  id: string;
  title: string;
  description: string | null;
  badge: string | null;
  badge_color: string;
  bg_color: string;
  image_url: string | null;
  cta_label: string;
  cta_link: string;
  position: number;
  is_active: boolean;
}

const EMPTY = {
  title: '',
  description: '',
  badge: '',
  badge_color: '#dc2626',
  bg_color: '#1B4FD8',
  image_url: '',
  cta_label: 'Ver Promoções',
  cta_link: '/produtos',
  position: 0,
  is_active: true,
};

export function AdminPromoBanners() {
  const { toast } = useToast();
  const [banners, setBanners] = useState<PromoBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<PromoBanner | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const { data } = await (supabase as any).from('promo_banners').select('*').order('position');
    setBanners(data || []);
    setLoading(false);
  };

  const openAdd = () => {
    setSelected(null);
    setForm({ ...EMPTY, position: banners.length });
    setOpen(true);
  };

  const openEdit = (b: PromoBanner) => {
    setSelected(b);
    setForm({
      title: b.title,
      description: b.description || '',
      badge: b.badge || '',
      badge_color: b.badge_color,
      bg_color: b.bg_color,
      image_url: b.image_url || '',
      cta_label: b.cta_label,
      cta_link: b.cta_link,
      position: b.position,
      is_active: b.is_active,
    });
    setOpen(true);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `promo-banners/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('product-images').upload(path, file, { cacheControl: '3600', upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from('product-images').getPublicUrl(path);
      setForm(f => ({ ...f, image_url: data.publicUrl }));
      toast({ title: 'Imagem carregada' });
    } catch (err: any) {
      toast({ title: 'Erro no upload', description: err.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast({ title: 'Título obrigatório', variant: 'destructive' }); return; }
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        description: form.description || null,
        badge: form.badge || null,
        badge_color: form.badge_color,
        bg_color: form.bg_color,
        image_url: form.image_url || null,
        cta_label: form.cta_label,
        cta_link: form.cta_link,
        position: Number(form.position),
        is_active: form.is_active,
      };
      if (selected) {
        const { error } = await (supabase as any).from('promo_banners').update(payload).eq('id', selected.id);
        if (error) throw error;
      } else {
        const { error } = await (supabase as any).from('promo_banners').insert(payload);
        if (error) throw error;
      }
      toast({ title: selected ? 'Banner actualizado' : 'Banner criado' });
      setOpen(false);
      load();
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminar este banner?')) return;
    await (supabase as any).from('promo_banners').delete().eq('id', id);
    toast({ title: 'Banner eliminado' });
    load();
  };

  const toggleActive = async (b: PromoBanner) => {
    await (supabase as any).from('promo_banners').update({ is_active: !b.is_active }).eq('id', b.id);
    load();
  };

  if (loading) return <div>A carregar...</div>;

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Banners de Promoção ({banners.length})</CardTitle>
          <Button className="gap-2" onClick={openAdd}>
            <Plus className="w-4 h-4" /> Adicionar Banner
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {banners.length === 0 && (
              <p className="text-center text-muted-foreground py-8">Nenhum banner. Clica em "Adicionar Banner".</p>
            )}
            {banners.map((b) => (
              <div key={b.id} className="flex items-center gap-4 p-3 rounded-xl border border-border bg-card">
                {/* Preview */}
                <div
                  className="w-24 h-14 rounded-lg flex-shrink-0 flex items-center justify-center text-white text-xs font-bold overflow-hidden relative"
                  style={{ background: b.bg_color }}
                >
                  {b.image_url && (
                    <img src={b.image_url} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" />
                  )}
                  <span className="relative z-10 px-1 text-center line-clamp-2">{b.title}</span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{b.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">Cor de fundo:</span>
                    <span className="w-4 h-4 rounded border border-border flex-shrink-0" style={{ background: b.bg_color }} />
                    <span className="text-xs font-mono text-muted-foreground">{b.bg_color}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => toggleActive(b)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${
                      b.is_active ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700' : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {b.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    {b.is_active ? 'Ativo' : 'Oculto'}
                  </button>
                  <Button size="icon" variant="outline" onClick={() => openEdit(b)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="destructive" onClick={() => handleDelete(b.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selected ? 'Editar Banner Promoção' : 'Novo Banner Promoção'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-1">
            {/* Preview */}
            <div
              className="w-full h-24 rounded-xl flex items-center justify-center text-white font-bold text-lg relative overflow-hidden"
              style={{ background: form.bg_color }}
            >
              {form.image_url && (
                <img src={form.image_url} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" />
              )}
              <span className="relative z-10 px-4 text-center">{form.title || 'Pré-visualização'}</span>
            </div>

            {/* Cor de fundo — destaque */}
            <div className="bg-muted/40 border border-border rounded-xl p-4 space-y-2">
              <Label className="flex items-center gap-2 text-sm font-bold">
                <Palette className="w-4 h-4 text-primary" /> Cor de Fundo do Banner
              </Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={form.bg_color}
                  onChange={e => setForm(f => ({ ...f, bg_color: e.target.value }))}
                  className="w-12 h-10 rounded-lg border border-border cursor-pointer bg-transparent"
                />
                <Input
                  value={form.bg_color}
                  onChange={e => setForm(f => ({ ...f, bg_color: e.target.value }))}
                  placeholder="#1B4FD8"
                  className="font-mono flex-1"
                  maxLength={7}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Título *</Label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Ex: Até 50% OFF" />
            </div>

            <div className="space-y-1.5">
              <Label>Descrição</Label>
              <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Ex: Em smartphones e TV" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Etiqueta (badge)</Label>
                <Input value={form.badge} onChange={e => setForm(f => ({ ...f, badge: e.target.value }))} placeholder="Ex: Hoje Só" />
              </div>
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5">Cor da etiqueta</Label>
                <div className="flex items-center gap-2">
                  <input type="color" value={form.badge_color} onChange={e => setForm(f => ({ ...f, badge_color: e.target.value }))} className="w-10 h-9 rounded border border-border cursor-pointer bg-transparent flex-shrink-0" />
                  <Input value={form.badge_color} onChange={e => setForm(f => ({ ...f, badge_color: e.target.value }))} className="font-mono" maxLength={7} />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Imagem de fundo (opcional)</Label>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg border border-border cursor-pointer hover:bg-muted/80 transition-colors text-sm">
                  <Upload className="w-4 h-4" />
                  {uploading ? 'A enviar...' : 'Carregar imagem'}
                  <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
                </label>
                {form.image_url && <span className="text-xs text-emerald-600 font-medium">✓ Imagem carregada</span>}
              </div>
              {form.image_url && <Input value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} placeholder="URL da imagem" className="mt-1" />}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Texto do botão</Label>
                <Input value={form.cta_label} onChange={e => setForm(f => ({ ...f, cta_label: e.target.value }))} placeholder="Ver Promoções" />
              </div>
              <div className="space-y-1.5">
                <Label>Link do botão</Label>
                <Input value={form.cta_link} onChange={e => setForm(f => ({ ...f, cta_link: e.target.value }))} placeholder="/produtos" />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1.5 flex-1">
                <Label>Posição (ordem)</Label>
                <Input type="number" value={form.position} onChange={e => setForm(f => ({ ...f, position: Number(e.target.value) }))} className="w-24" />
              </div>
              <div className="flex items-center gap-2 pt-5">
                <Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} />
                <Label>Ativo</Label>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving || uploading}>
              {saving ? 'A guardar...' : selected ? 'Actualizar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
