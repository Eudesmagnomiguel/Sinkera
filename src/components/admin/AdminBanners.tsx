import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit2, Trash2, Upload, Eye, EyeOff, Image as ImageIcon, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  cta_label: string | null;
  cta_link: string | null;
  image_url: string;
  position: number;
  is_active: boolean;
}

const empty = { title: "", subtitle: "", description: "", cta_label: "", cta_link: "", image_url: "", position: 0, is_active: true };

export function AdminBanners() {
  const [banners,   setBanners]   = useState<Banner[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [open,      setOpen]      = useState(false);
  const [selected,  setSelected]  = useState<Banner | null>(null);
  const [form,      setForm]      = useState(empty);
  const [saving,    setSaving]    = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("banners").select("*").order("position", { ascending: true });
    setBanners((data as Banner[]) || []);
    setLoading(false);
  };

  const openAdd = () => { setSelected(null); setForm({ ...empty, position: banners.length }); setOpen(true); };
  const openEdit = (b: Banner) => {
    setSelected(b);
    setForm({ title: b.title, subtitle: b.subtitle || "", description: b.description || "", cta_label: b.cta_label || "", cta_link: b.cta_link || "", image_url: b.image_url, position: b.position, is_active: b.is_active });
    setOpen(true);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext  = file.name.split(".").pop();
      const path = `banners/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("product-images").upload(path, file, { cacheControl: "3600", upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      setForm(f => ({ ...f, image_url: data.publicUrl }));
      toast({ title: "Imagem carregada" });
    } catch (err: any) {
      toast({ title: "Erro no upload", description: err.message, variant: "destructive" });
    } finally { setUploading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.image_url) { toast({ title: "Imagem obrigatória", variant: "destructive" }); return; }
    setSaving(true);
    try {
      const payload = { title: form.title, subtitle: form.subtitle || null, description: form.description || null, cta_label: form.cta_label || null, cta_link: form.cta_link || null, image_url: form.image_url, position: Number(form.position) || 0, is_active: form.is_active };
      if (selected) {
        const { error } = await supabase.from("banners").update(payload).eq("id", selected.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("banners").insert([payload]);
        if (error) throw error;
      }
      toast({ title: selected ? "Banner actualizado" : "Banner criado" });
      setOpen(false); load();
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Eliminar este banner?")) return;
    const { error } = await supabase.from("banners").delete().eq("id", id);
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else { toast({ title: "Banner eliminado" }); load(); }
  };

  const toggleActive = async (b: Banner) => {
    await supabase.from("banners").update({ is_active: !b.is_active }).eq("id", b.id);
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
          <h2 className="text-xl font-black text-foreground tracking-tight">Banners</h2>
          <p className="text-xs text-muted-foreground">{banners.length} banner{banners.length !== 1 ? 's' : ''} configurado{banners.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 h-9 px-4 rounded-xl text-xs font-bold tracking-wide text-white transition-all"
          style={{ background: 'hsl(22 100% 46%)' }}
          onMouseEnter={e => e.currentTarget.style.background = 'hsl(22 100% 40%)'}
          onMouseLeave={e => e.currentTarget.style.background = 'hsl(22 100% 46%)'}
        >
          <Plus className="w-3.5 h-3.5" /> Novo Banner
        </button>
      </div>

      {/* Empty state */}
      {banners.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-20 flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
            <ImageIcon className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">Nenhum banner ainda</p>
            <p className="text-xs text-muted-foreground">Adiciona o primeiro banner para aparecer na homepage.</p>
          </div>
          <button onClick={openAdd} className="flex items-center gap-1.5 h-8 px-4 rounded-xl text-xs font-bold text-white" style={{ background: 'hsl(22 100% 46%)' }}>
            <Plus className="w-3.5 h-3.5" /> Adicionar Banner
          </button>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[5rem_1fr_auto_auto_auto] gap-4 items-center px-5 py-2.5 border-b border-border bg-muted/30">
            {['Imagem', 'Título', 'Pos.', 'Estado', ''].map((h, i) => (
              <span key={i} className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{h}</span>
            ))}
          </div>

          <div className="divide-y divide-border">
            {banners.map(b => (
              <div key={b.id} className="grid grid-cols-[5rem_1fr_auto_auto_auto] gap-4 items-center px-5 py-3.5 hover:bg-muted/20 transition-colors">
                {/* Thumbnail */}
                <div className="w-20 h-12 rounded-lg overflow-hidden border border-border bg-muted">
                  <img src={b.image_url} alt={b.title} className="w-full h-full object-cover" />
                </div>

                {/* Title */}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{b.title}</p>
                  {b.subtitle && <p className="text-xs text-muted-foreground truncate">{b.subtitle}</p>}
                </div>

                {/* Position */}
                <span className="text-xs text-muted-foreground tabular-nums">{b.position}</span>

                {/* Active toggle */}
                <button
                  onClick={() => toggleActive(b)}
                  className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-all ${
                    b.is_active
                      ? 'border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30'
                      : 'border-border text-muted-foreground'
                  }`}
                >
                  {b.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  {b.is_active ? 'Ativo' : 'Oculto'}
                </button>

                {/* Actions */}
                <div className="flex items-center gap-1.5">
                  <button onClick={() => openEdit(b)} className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(b.id)} className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-destructive hover:border-destructive/40 hover:bg-destructive/5 transition-all">
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
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Banners</p>
                <h3 className="text-lg font-black text-foreground">{selected ? 'Editar Banner' : 'Novo Banner'}</h3>
              </div>
              <button onClick={() => setOpen(false)} className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-all">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
              {/* Image upload */}
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Imagem *</Label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="flex items-center gap-2 h-9 px-4 rounded-xl border border-border text-xs font-semibold text-foreground hover:bg-muted transition-all">
                    {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    {uploading ? 'A enviar…' : 'Carregar imagem'}
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
                </label>
                {form.image_url && (
                  <div className="relative rounded-xl overflow-hidden border border-border h-40">
                    <img src={form.image_url} alt="preview" className="w-full h-full object-cover" />
                  </div>
                )}
                <Input placeholder="Ou cola URL da imagem" value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} className="rounded-xl text-sm h-9" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Título *</Label>
                  <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required className="rounded-xl h-9" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Subtítulo</Label>
                  <Input value={form.subtitle} onChange={e => setForm({ ...form, subtitle: e.target.value })} className="rounded-xl h-9" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Descrição</Label>
                <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} className="rounded-xl text-sm resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Texto do Botão</Label>
                  <Input placeholder="Ex: Ver promoções" value={form.cta_label} onChange={e => setForm({ ...form, cta_label: e.target.value })} className="rounded-xl h-9" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Link do Botão</Label>
                  <Input placeholder="Ex: /produtos" value={form.cta_link} onChange={e => setForm({ ...form, cta_link: e.target.value })} className="rounded-xl h-9" />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Posição (ordem)</Label>
                  <Input type="number" value={form.position} onChange={e => setForm({ ...form, position: Number(e.target.value) })} className="rounded-xl h-9 w-24" />
                </div>
                <div className="flex items-center gap-2.5">
                  <Switch checked={form.is_active} onCheckedChange={v => setForm({ ...form, is_active: v })} />
                  <Label className="text-sm text-muted-foreground">Visível na homepage</Label>
                </div>
              </div>

              <div className="flex gap-3 pt-2 border-t border-border">
                <button type="button" onClick={() => setOpen(false)} className="flex-1 h-10 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-muted transition-all">Cancelar</button>
                <button type="submit" disabled={saving || uploading} className="flex-1 h-10 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-60"
                        style={{ background: 'hsl(22 100% 46%)' }}>
                  {saving ? 'A guardar…' : selected ? 'Actualizar' : 'Criar Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
