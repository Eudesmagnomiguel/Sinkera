import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Edit, Upload, Play, Eye, EyeOff, Video, ImageIcon, ExternalLink, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ShortVideo {
  id: string;
  title: string;
  price: number;
  original_price: number | null;
  badge: string | null;
  video_url: string | null;
  thumbnail_url: string;
  product_link: string | null;
  position: number;
  is_active: boolean;
}

const emptyForm = {
  title: "",
  price: 0,
  original_price: "",
  badge: "",
  video_url: "",
  thumbnail_url: "",
  product_link: "",
  is_active: true,
};

export function AdminVideos() {
  const [videos, setVideos] = useState<ShortVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<number>(1);
  const [selected, setSelected] = useState<ShortVideo | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("short_videos")
      .select("*")
      .order("position", { ascending: true });
    setVideos((data as ShortVideo[]) || []);
    setLoading(false);
  };

  const nextPosition = videos.length > 0 ? Math.max(...videos.map((v) => v.position)) + 1 : 1;

  const openAdd = () => {
    setEditingSlot(nextPosition);
    setSelected(null);
    setForm({ ...emptyForm });
    setOpen(true);
  };

  const openEdit = (v: ShortVideo) => {
    setEditingSlot(v.position);
    setSelected(v);
    setForm({
      title: v.title,
      price: v.price,
      original_price: v.original_price != null ? String(v.original_price) : "",
      badge: v.badge || "",
      video_url: v.video_url || "",
      thumbnail_url: v.thumbnail_url,
      product_link: v.product_link || "",
      is_active: v.is_active,
    });
    setOpen(true);
  };

  const handleDelete = async (v: ShortVideo) => {
    if (!confirm(`Eliminar "${v.title}"?`)) return;
    await supabase.from("short_videos").delete().eq("id", v.id);
    toast({ title: "Vídeo eliminado" });
    load();
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `short-videos/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("product-images").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (error) throw error;
      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      setForm((f) => ({ ...f, thumbnail_url: data.publicUrl }));
      toast({ title: "Thumbnail carregada" });
    } catch (err: any) {
      toast({ title: "Erro no upload", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.thumbnail_url) {
      toast({ title: "Thumbnail obrigatória", variant: "destructive" });
      return;
    }
    if (!form.title.trim()) {
      toast({ title: "Título obrigatório", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        price: Number(form.price) || 0,
        original_price: form.original_price ? Number(form.original_price) : null,
        badge: form.badge || null,
        video_url: form.video_url || null,
        thumbnail_url: form.thumbnail_url,
        product_link: form.product_link || null,
        position: editingSlot,
        is_active: form.is_active,
      };
      if (selected) {
        const { error } = await supabase.from("short_videos").update(payload).eq("id", selected.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("short_videos").insert([payload]);
        if (error) throw error;
      }
      toast({ title: selected ? "Vídeo atualizado" : "Vídeo adicionado" });
      setOpen(false);
      load();
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (v: ShortVideo) => {
    await supabase.from("short_videos").update({ is_active: !v.is_active }).eq("id", v.id);
    load();
  };

  const badgeColor = (badge: string | null) => {
    if (!badge) return "";
    if (badge.includes("OFF")) return "bg-red-500";
    if (badge === "Novo") return "bg-green-500";
    if (badge === "Vendido") return "bg-gray-500";
    return "bg-orange-500";
  };

  if (loading) return <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Video className="w-5 h-5 text-primary" />
              <CardTitle>Vídeos em Destaque</CardTitle>
              <Badge variant="outline">{videos.filter(v => v.is_active).length} ativos</Badge>
            </div>
            <Button className="gap-2" onClick={openAdd}>
              <Plus className="w-4 h-4" /> Adicionar
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Gere os cards de vídeo / shorts exibidos na página inicial.
          </p>
        </CardHeader>
        <CardContent>
          {videos.length === 0 && (
            <p className="text-center text-muted-foreground py-8">Nenhum vídeo. Clica em "Adicionar".</p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {videos.map((v) => (
              <div key={v.id} className="group relative rounded-2xl overflow-hidden border-2 border-dashed border-muted hover:border-primary/50 transition-all duration-200 bg-muted/20">
                {/* Thumbnail */}
                <div className="relative aspect-[9/16] bg-black">
                  <img
                    src={v.thumbnail_url}
                    alt={v.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  {v.video_url && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <Play className="w-5 h-5 text-white fill-white" />
                      </div>
                    </div>
                  )}
                  {v.badge && (
                    <span className={`absolute top-2 right-2 text-white text-xs font-bold px-2 py-0.5 rounded-full ${badgeColor(v.badge)}`}>
                      {v.badge}
                    </span>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white font-semibold text-sm leading-tight truncate">{v.title}</p>
                    <p className="text-white/90 text-xs mt-0.5">{v.price.toLocaleString()} Kz</p>
                  </div>
                </div>

                {/* Actions bar */}
                <div className="p-3 space-y-2 bg-background">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${v.is_active ? "bg-green-500" : "bg-gray-400"}`} />
                      <span className="text-xs text-muted-foreground">{v.is_active ? "Ativo" : "Oculto"}</span>
                    </div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => toggleActive(v)}>
                        {v.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(v)}>
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(v)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    {v.video_url ? (
                      <><Video className="w-3 h-3" /> Com vídeo</>
                    ) : (
                      <><ImageIcon className="w-3 h-3" /> Só imagem</>
                    )}
                    {v.product_link && <><ExternalLink className="w-3 h-3 ml-1" /> Link</>}
                  </div>
                </div>

                {/* Position badge */}
                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  #{v.position}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Video className="w-4 h-4" />
              {selected ? `Editar Card #${editingSlot}` : `Novo Card — Slot #${editingSlot}`}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Thumbnail */}
            <div className="space-y-2">
              <Label>Thumbnail / Imagem de Capa *</Label>
              <div className="flex items-center gap-2">
                <label className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2 px-3 py-2 border rounded-md text-sm hover:bg-muted/50 transition-colors">
                    <Upload className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{uploading ? "A enviar..." : "Carregar imagem"}</span>
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={handleThumbnailUpload} disabled={uploading} />
                </label>
              </div>
              {form.thumbnail_url && (
                <div className="relative rounded-xl overflow-hidden bg-black h-48">
                  <img src={form.thumbnail_url} alt="preview" className="w-full h-full object-cover opacity-90" />
                </div>
              )}
              <Input
                placeholder="Ou cole URL da imagem (https://...)"
                value={form.thumbnail_url}
                onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })}
              />
            </div>

            {/* Video URL */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Video className="w-4 h-4" />
                URL do Vídeo
                <Badge variant="outline" className="text-xs">Opcional</Badge>
              </Label>
              <Input
                placeholder="https://... (YouTube, link direto .mp4, etc.)"
                value={form.video_url}
                onChange={(e) => setForm({ ...form, video_url: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Deixa vazio para mostrar apenas a imagem com ícone de play.</p>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label>Título do Produto *</Label>
              <Input
                placeholder="Ex: Fones Bluetooth Pro"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>

            {/* Price */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Preço (Kz) *</Label>
                <Input
                  type="number"
                  placeholder="95000"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Preço Original (Kz)</Label>
                <Input
                  type="number"
                  placeholder="120000"
                  value={form.original_price}
                  onChange={(e) => setForm({ ...form, original_price: e.target.value })}
                />
              </div>
            </div>

            {/* Badge + Product Link */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Badge</Label>
                <Input
                  placeholder="Ex: 50% OFF, Novo, Vendido"
                  value={form.badge}
                  onChange={(e) => setForm({ ...form, badge: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Link do Produto</Label>
                <Input
                  placeholder="/produto/id"
                  value={form.product_link}
                  onChange={(e) => setForm({ ...form, product_link: e.target.value })}
                />
              </div>
            </div>

            {/* Active toggle */}
            <div className="flex items-center gap-3 py-1">
              <Switch
                checked={form.is_active}
                onCheckedChange={(v) => setForm({ ...form, is_active: v })}
              />
              <Label>Visível na homepage</Label>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving || uploading} className="gap-2">
                {saving ? "A guardar..." : selected ? "Atualizar" : "Adicionar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
