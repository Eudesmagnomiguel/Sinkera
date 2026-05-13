import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
}

export function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const [form, setForm] = useState({ name: '', slug: '', description: '', image_url: '' });

  useEffect(() => { load(); }, []);

  const load = async () => {
    const { data } = await supabase.from('categories').select('*').order('name');
    setCategories(data || []);
    setLoading(false);
  };

  const openAdd = () => {
    setSelected(null);
    setForm({ name: '', slug: '', description: '', image_url: '' });
    setDialogOpen(true);
  };

  const openEdit = (cat: Category) => {
    setSelected(cat);
    setForm({ name: cat.name, slug: cat.slug, description: cat.description || '', image_url: cat.image_url || '' });
    setDialogOpen(true);
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {
        name: form.name,
        slug: form.slug || generateSlug(form.name),
        description: form.description || null,
        image_url: form.image_url || null,
      };

      if (selected) {
        const { error } = await supabase.from('categories').update(data).eq('id', selected.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('categories').insert([data]);
        if (error) throw error;
      }

      toast({ title: selected ? 'Categoria atualizada' : 'Categoria criada' });
      setDialogOpen(false);
      load();
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminar esta categoria?')) return;
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) {
      toast({ title: 'Erro', description: 'Não foi possível eliminar. Pode ter produtos associados.', variant: 'destructive' });
    } else {
      toast({ title: 'Categoria eliminada' });
      load();
    }
  };

  if (loading) return <div>A carregar...</div>;

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Categorias ({categories.length})</CardTitle>
          <Button variant="vibrant" className="gap-2" onClick={openAdd}>
            <Plus className="w-4 h-4" /> Adicionar Categoria
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Imagem</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell>
                    {cat.image_url ? (
                      <img src={cat.image_url} alt={cat.name} className="w-10 h-10 rounded object-cover" />
                    ) : <div className="w-10 h-10 rounded bg-muted" />}
                  </TableCell>
                  <TableCell className="font-medium">{cat.name}</TableCell>
                  <TableCell className="text-muted-foreground">{cat.slug}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{cat.description || '-'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="icon" variant="outline" onClick={() => openEdit(cat)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="destructive" onClick={() => handleDelete(cat.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selected ? 'Editar Categoria' : 'Nova Categoria'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: generateSlug(e.target.value) })} required />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
            </div>
            <div className="space-y-2">
              <Label>URL da Imagem</Label>
              <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={saving}>{saving ? 'Salvando...' : selected ? 'Atualizar' : 'Criar'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
