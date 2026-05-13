import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2, Upload, Eye, EyeOff } from "lucide-react";
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

const empty = {
  title: "",
  subtitle: "",
  description: "",
  cta_label: "",
  cta_link: "",
  image_url: "",
  position: 0,
  is_active: true,
};

export function AdminBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Banner | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("banners").select("*").order("position", { ascending: true });
    setBanners((data as Banner[]) || []);
    setLoading(false);
  };

  const openAdd = () => {
    setSelected(null);
    setForm({ ...empty, position: banners.length });
    setOpen(true);
  };

  const openEdit = (b: Banner) => {
    setSelected(b);
    setForm({
      title: b.title,
      subtitle: b.subtitle || "",
      description: b.description || "",
      cta_label: b.cta_label || "",
      cta_link: b.cta_link || "",
      image_url: b.image_url,
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
      const ext = file.name.split(".").pop();
      const path = `banners/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("product-images").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (error) throw error;
      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      setForm((f) => ({ ...f, image_url: data.publicUrl }));
      toast({ title: "Imagem carregada" });
    } catch (err: any) {
      toast({ title: "Erro no upload", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.image_url) {
      toast({ title: "Imagem obrigatória", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        subtitle: form.subtitle || null,
        description: form.description || null,
        cta_label: form.cta_label || null,
        cta_link: form.cta_link || null,
        image_url: form.image_url,
        position: Number(form.position) || 0,
        is_active: form.is_active,
      };
      if (selected) {
        const { error } = await supabase.from("banners").update(payload).eq("id", selected.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("banners").insert([payload]);
        if (error) throw error;
      }
      toast({ title: selected ? "Banner atualizado" : "Banner criado" });
      setOpen(false);
      load();
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Eliminar este banner?")) return;
    const { error } = await supabase.from("banners").delete().eq("id", id);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Banner eliminado" });
      load();
    }
  };

  const toggleActive = async (b: Banner) => {
    await supabase.from("banners").update({ is_active: !b.is_active }).eq("id", b.id);
    load();
  };

  if (loading) return <div>A carregar...</div>;

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Banners da Homepage ({banners.length})</CardTitle>
          <Button variant="vibrant" className="gap-2" onClick={openAdd}>
            <Plus className="w-4 h-4" /> Adicionar Banner
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Imagem</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Posição</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {banners.map((b) => (
                <TableRow key={b.id}>
                  <TableCell>
                    <img src={b.image_url} alt={b.title} className="w-20 h-12 rounded object-cover" />
                  </TableCell>
                  <TableCell className="font-medium">{b.title}</TableCell>
                  <TableCell>{b.position}</TableCell>
                  <TableCell>
                    <button
                      onClick={() => toggleActive(b)}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${
                        b.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {b.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {b.is_active ? "Ativo" : "Oculto"}
                    </button>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="icon" variant="outline" onClick={() => openEdit(b)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="destructive" onClick={() => handleDelete(b.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {banners.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    Nenhum banner. Clica em "Adicionar Banner" para criar o primeiro.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selected ? "Editar Banner" : "Novo Banner"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Imagem *</Label>
              <div className="flex items-center gap-3">
                <Input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} />
                {uploading && <span className="text-xs text-muted-foreground">A enviar...</span>}
              </div>
              {form.image_url && (
                <img src={form.image_url} alt="preview" className="mt-2 w-full max-h-48 object-cover rounded-lg border" />
              )}
              <Input
                placeholder="Ou cola URL da imagem"
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Título *</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Subtítulo</Label>
                <Input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Texto do Botão</Label>
                <Input
                  placeholder="Ex: Ver promoções"
                  value={form.cta_label}
                  onChange={(e) => setForm({ ...form, cta_label: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Link do Botão</Label>
                <Input
                  placeholder="Ex: /produtos"
                  value={form.cta_link}
                  onChange={(e) => setForm({ ...form, cta_link: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 items-end">
              <div className="space-y-2">
                <Label>Posição (ordem)</Label>
                <Input
                  type="number"
                  value={form.position}
                  onChange={(e) => setForm({ ...form, position: Number(e.target.value) })}
                />
              </div>
              <div className="flex items-center gap-3 pb-2">
                <Switch
                  checked={form.is_active}
                  onCheckedChange={(v) => setForm({ ...form, is_active: v })}
                />
                <Label>Ativo (visível na homepage)</Label>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving || uploading}>
                {saving ? "A guardar..." : selected ? "Atualizar" : "Criar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
