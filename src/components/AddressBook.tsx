import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  MapPin, Plus, Edit2, Trash2, Star, Home, Briefcase,
  CheckCircle2, RefreshCw,
} from 'lucide-react';

export interface Address {
  id: string;
  user_id: string;
  label: string;
  full_name: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  notes: string | null;
  is_default: boolean;
  created_at: string;
}

const PROVINCES = [
  'Luanda','Benguela','Huambo','Bié','Moxico','Huíla','Namibe','Cunene',
  'Cuando Cubango','Lunda Norte','Lunda Sul','Malanje','Uíge','Zaire',
  'Cabinda','Cuanza Norte','Cuanza Sul','Bengo',
];

const LABEL_ICONS: Record<string, React.ElementType> = {
  'Casa': Home,
  'Trabalho': Briefcase,
};

const LABEL_PRESETS = ['Casa', 'Trabalho', 'Outro'];

const EMPTY_FORM = {
  label: 'Casa', full_name: '', phone: '', address: '', city: '', province: '', notes: '', is_default: false,
};

interface AddressBookProps {
  /** Selection mode: clicking an address calls onSelect instead of editing */
  selectable?: boolean;
  selectedId?: string;
  onSelect?: (addr: Address) => void;
  onAddressesChange?: (addresses: Address[]) => void;
}

export function AddressBook({ selectable, selectedId, onSelect, onAddressesChange }: AddressBookProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [customLabel, setCustomLabel] = useState(false);

  useEffect(() => { if (user) load(); }, [user]);

  const load = async () => {
    if (!user) return;
    const { data } = await (supabase as any)
      .from('delivery_addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: true });
    const list = data || [];
    setAddresses(list);
    onAddressesChange?.(list);
    setLoading(false);
  };

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setCustomLabel(false);
    setDialogOpen(true);
  };

  const openEdit = (addr: Address) => {
    setEditing(addr);
    setForm({
      label: addr.label,
      full_name: addr.full_name,
      phone: addr.phone,
      address: addr.address,
      city: addr.city,
      province: addr.province,
      notes: addr.notes || '',
      is_default: addr.is_default,
    });
    setCustomLabel(!LABEL_PRESETS.includes(addr.label));
    setDialogOpen(true);
  };

  const setDefault = async (id: string) => {
    if (!user) return;
    // Unset all defaults first
    await (supabase as any)
      .from('delivery_addresses')
      .update({ is_default: false })
      .eq('user_id', user.id);
    await (supabase as any)
      .from('delivery_addresses')
      .update({ is_default: true })
      .eq('id', id);
    load();
    toast({ title: 'Endereço predefinido atualizado' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminar este endereço?')) return;
    await (supabase as any).from('delivery_addresses').delete().eq('id', id);
    toast({ title: 'Endereço eliminado' });
    load();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      const payload = { ...form, notes: form.notes || null, user_id: user.id };

      if (form.is_default) {
        // Unset all other defaults first
        await (supabase as any)
          .from('delivery_addresses')
          .update({ is_default: false })
          .eq('user_id', user.id);
      }

      if (editing) {
        const { error } = await (supabase as any)
          .from('delivery_addresses').update(payload).eq('id', editing.id);
        if (error) throw error;
      } else {
        const { error } = await (supabase as any)
          .from('delivery_addresses').insert([payload]);
        if (error) throw error;
      }

      toast({ title: editing ? 'Endereço atualizado' : 'Endereço guardado com sucesso' });
      setDialogOpen(false);
      load();
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="h-20 rounded-2xl bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  const LabelIcon = (label: string) => {
    const Icon = LABEL_ICONS[label] ?? MapPin;
    return <Icon className="w-4 h-4" />;
  };

  return (
    <div className="space-y-3">
      {addresses.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-border rounded-2xl text-muted-foreground">
          <MapPin className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm font-medium">Nenhum endereço guardado</p>
          <p className="text-xs mt-0.5">Adicione um endereço de entrega</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {addresses.map((addr) => {
            const isSelected = selectable && selectedId === addr.id;
            return (
              <div
                key={addr.id}
                onClick={() => selectable && onSelect?.(addr)}
                className={`relative rounded-2xl border p-4 transition-all ${
                  selectable ? 'cursor-pointer' : ''
                } ${
                  isSelected
                    ? 'border-primary bg-primary/5 dark:bg-primary/10'
                    : 'border-border bg-card hover:border-primary/30 hover:shadow-sm'
                }`}
              >
                {/* Default badge */}
                {addr.is_default && (
                  <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                    Predefinido
                  </span>
                )}

                {/* Selected check */}
                {isSelected && (
                  <div className="absolute top-3 right-3">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                    {LabelIcon(addr.label)}
                  </div>
                  <div className="flex-1 min-w-0 pr-16">
                    <p className="text-sm font-bold text-foreground">{addr.label} — {addr.full_name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{addr.address}</p>
                    <p className="text-xs text-muted-foreground">{addr.city}, {addr.province}</p>
                    <p className="text-xs text-muted-foreground">{addr.phone}</p>
                    {addr.notes && <p className="text-xs text-muted-foreground/70 italic mt-0.5">{addr.notes}</p>}
                  </div>
                </div>

                {!selectable && (
                  <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-border">
                    {!addr.is_default && (
                      <button
                        onClick={() => setDefault(addr.id)}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-amber-500 transition-colors font-medium"
                      >
                        <Star className="w-3.5 h-3.5" /> Predefinir
                      </button>
                    )}
                    <div className="flex-1" />
                    <button
                      onClick={() => openEdit(addr)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(addr.id)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <button
        onClick={openAdd}
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border-2 border-dashed border-border text-sm font-semibold text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-all"
      >
        <Plus className="w-4 h-4" /> Adicionar novo endereço
      </button>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              {editing ? 'Editar Endereço' : 'Novo Endereço'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4">
            {/* Label */}
            <div className="space-y-1.5">
              <Label>Identificação *</Label>
              <div className="flex gap-2 flex-wrap">
                {LABEL_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => { setForm(f => ({ ...f, label: preset })); setCustomLabel(false); }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      form.label === preset && !customLabel
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-muted border-border text-muted-foreground hover:border-primary/40'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => { setCustomLabel(true); setForm(f => ({ ...f, label: '' })); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    customLabel
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-muted border-border text-muted-foreground hover:border-primary/40'
                  }`}
                >
                  Personalizar
                </button>
              </div>
              {customLabel && (
                <Input
                  value={form.label}
                  onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                  placeholder="Ex: Escritório, Armazém..."
                  className="rounded-xl mt-1.5"
                  autoFocus
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Nome Completo *</Label>
                <Input
                  value={form.full_name}
                  onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                  placeholder="Nome do receptor"
                  className="rounded-xl"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Telefone *</Label>
                <Input
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="+244 9xx xxx xxx"
                  className="rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Endereço *</Label>
              <Input
                value={form.address}
                onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                placeholder="Rua, número, bairro"
                className="rounded-xl"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Cidade *</Label>
                <Input
                  value={form.city}
                  onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                  placeholder="Ex: Luanda"
                  className="rounded-xl"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Província *</Label>
                <select
                  value={form.province}
                  onChange={e => setForm(f => ({ ...f, province: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  required
                >
                  <option value="">Selecionar...</option>
                  {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Referência / Instruções (opcional)</Label>
              <Input
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Portão azul, ligar antes..."
                className="rounded-xl"
              />
            </div>

            {/* Default toggle */}
            <button
              type="button"
              onClick={() => setForm(f => ({ ...f, is_default: !f.is_default }))}
              className="flex items-center gap-2.5 w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <div className={`w-10 h-5 rounded-full transition-colors flex items-center px-0.5 ${form.is_default ? 'bg-primary' : 'bg-muted-foreground/30'}`}>
                <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${form.is_default ? 'translate-x-5' : 'translate-x-0'}`} />
              </div>
              Definir como endereço predefinido
            </button>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={saving} variant="vibrant">
                {saving ? <><RefreshCw className="w-3.5 h-3.5 animate-spin mr-1.5" /> A guardar...</> : 'Guardar Endereço'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
