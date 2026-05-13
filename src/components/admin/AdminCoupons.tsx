import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tag, Plus, Copy, Check, ToggleLeft, ToggleRight, Trash2,
  Percent, Banknote, RefreshCw, Calendar, Gift, CreditCard,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GiftCard {
  id: string;
  code: string;
  value: number;
  remaining_value: number;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

function generateGiftCardCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return 'GC-' + Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

// ── Types ──────────────────────────────────────────────────────────────────
interface Coupon {
  id: string;
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  min_order_amount: number | null;
  max_uses: number | null;
  uses_count: number;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

const EMPTY_FORM = {
  code: '',
  type: 'percent' as 'percent' | 'fixed',
  value: '',
  min_order_amount: '',
  max_uses: '',
  expires_at: '',
  is_active: true,
};

// ── Component ──────────────────────────────────────────────────────────────
export function AdminCoupons() {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });

  // Gift Cards state
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [gcLoading, setGcLoading] = useState(true);
  const [gcDialogOpen, setGcDialogOpen] = useState(false);
  const [gcValue, setGcValue] = useState('');
  const [gcExpires, setGcExpires] = useState('');
  const [gcSaving, setGcSaving] = useState(false);
  const [gcCopiedId, setGcCopiedId] = useState<string | null>(null);

  useEffect(() => { load(); loadGiftCards(); }, []);

  const load = async () => {
    setLoading(true);
    const { data } = await (supabase as any).from('coupons').select('*').order('created_at', { ascending: false });
    setCoupons(data || []);
    setLoading(false);
  };

  const loadGiftCards = async () => {
    setGcLoading(true);
    const { data } = await (supabase as any).from('gift_cards').select('*').order('created_at', { ascending: false });
    setGiftCards(data || []);
    setGcLoading(false);
  };

  const handleGenerateGiftCard = async () => {
    if (!gcValue || Number(gcValue) <= 0) {
      toast({ title: 'Insere um valor válido', variant: 'destructive' });
      return;
    }
    setGcSaving(true);
    try {
      const code = generateGiftCardCode();
      const { error } = await (supabase as any).from('gift_cards').insert({
        code,
        value: Number(gcValue),
        remaining_value: Number(gcValue),
        is_active: true,
        expires_at: gcExpires ? new Date(gcExpires).toISOString() : null,
      });
      if (error) throw error;
      toast({ title: `Gift Card ${code} criado!` });
      setGcDialogOpen(false);
      setGcValue('');
      setGcExpires('');
      loadGiftCards();
    } catch (err: any) {
      toast({ title: 'Erro ao criar Gift Card', description: err?.message, variant: 'destructive' });
    } finally {
      setGcSaving(false);
    }
  };

  const handleGcToggle = async (gc: GiftCard) => {
    await (supabase as any).from('gift_cards').update({ is_active: !gc.is_active }).eq('id', gc.id);
    loadGiftCards();
    toast({ title: gc.is_active ? 'Gift Card desativado' : 'Gift Card ativado' });
  };

  const handleGcCopy = (gc: GiftCard) => {
    navigator.clipboard?.writeText(gc.code);
    setGcCopiedId(gc.id);
    setTimeout(() => setGcCopiedId(null), 1500);
    toast({ title: 'Código copiado!' });
  };

  const handleGcDelete = async (id: string) => {
    if (!confirm('Eliminar este Gift Card?')) return;
    await (supabase as any).from('gift_cards').delete().eq('id', id);
    loadGiftCards();
    toast({ title: 'Gift Card eliminado' });
  };

  const openAdd = () => {
    setForm({ ...EMPTY_FORM });
    setDialogOpen(true);
  };

  const handleCodeChange = (val: string) => {
    setForm((f) => ({ ...f, code: val.toUpperCase() }));
  };

  const handleSave = async () => {
    if (!form.code.trim() || !form.value) {
      toast({ title: 'Preenche o código e o valor', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const payload: Record<string, any> = {
        code: form.code.trim().toUpperCase(),
        type: form.type,
        value: Number(form.value),
        is_active: form.is_active,
        min_order_amount: form.min_order_amount ? Number(form.min_order_amount) : null,
        max_uses: form.max_uses ? Number(form.max_uses) : null,
        expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
      };
      const { error } = await (supabase as any).from('coupons').insert(payload);
      if (error) throw error;
      toast({ title: 'Cupão criado!' });
      setDialogOpen(false);
      load();
    } catch (err: any) {
      toast({ title: 'Erro ao criar cupão', description: err?.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (coupon: Coupon) => {
    await (supabase as any).from('coupons').update({ is_active: !coupon.is_active }).eq('id', coupon.id);
    load();
    toast({ title: coupon.is_active ? 'Cupão desativado' : 'Cupão ativado' });
  };

  const handleCopy = (coupon: Coupon) => {
    navigator.clipboard?.writeText(coupon.code);
    setCopiedId(coupon.id);
    setTimeout(() => setCopiedId(null), 1500);
    toast({ title: 'Código copiado!' });
  };

  const handleDelete = async (id: string) => {
    if (deletingId === id) {
      await (supabase as any).from('coupons').delete().eq('id', id);
      setDeletingId(null);
      load();
      toast({ title: 'Cupão eliminado' });
    } else {
      setDeletingId(id);
      setTimeout(() => setDeletingId(null), 3000);
    }
  };

  // ── Stats ────────────────────────────────────────────────────────────────
  const totalActive = coupons.filter((c) => c.is_active).length;
  const totalUses = coupons.reduce((s, c) => s + c.uses_count, 0);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="coupons">
        <TabsList className="mb-4">
          <TabsTrigger value="coupons" className="gap-2"><Tag className="w-4 h-4" /> Cupões</TabsTrigger>
          <TabsTrigger value="giftcards" className="gap-2"><Gift className="w-4 h-4" /> Gift Cards</TabsTrigger>
        </TabsList>

        <TabsContent value="coupons" className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Tag className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">Cupões de Desconto</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={load} className="gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" /> Atualizar
          </Button>
          <Button onClick={openAdd} size="sm" className="gap-1.5">
            <Plus className="w-3.5 h-3.5" /> Novo Cupão
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total', value: coupons.length, icon: Tag, color: 'text-blue-500' },
          { label: 'Ativos', value: totalActive, icon: ToggleRight, color: 'text-emerald-500' },
          { label: 'Utilizações', value: totalUses, icon: Percent, color: 'text-violet-500' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3">
            <Icon className={`w-5 h-5 ${color}`} />
            <div>
              <p className="text-2xl font-black text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />)}
        </div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Tag className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Nenhum cupão criado ainda</p>
          <p className="text-sm mt-1">Cria o primeiro cupão de desconto.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {coupons.map((coupon) => (
            <div
              key={coupon.id}
              className={`flex items-center gap-3 p-4 rounded-2xl border bg-card transition-colors ${
                coupon.is_active ? 'border-border' : 'border-border/50 opacity-60'
              }`}
            >
              {/* Code */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-bold text-sm bg-muted px-2.5 py-1 rounded-lg text-foreground">
                    {coupon.code}
                  </span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    coupon.type === 'percent'
                      ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300'
                      : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                  }`}>
                    {coupon.type === 'percent' ? (
                      <span className="flex items-center gap-0.5"><Percent className="w-3 h-3 inline" /> {coupon.value}%</span>
                    ) : (
                      <span className="flex items-center gap-0.5"><Banknote className="w-3 h-3 inline" /> {coupon.value.toLocaleString('pt-AO')} Kz</span>
                    )}
                  </span>
                  {!coupon.is_active && (
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Inativo</span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  {coupon.min_order_amount && (
                    <span className="text-xs text-muted-foreground">
                      Mín. {coupon.min_order_amount.toLocaleString('pt-AO')} Kz
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {coupon.uses_count}{coupon.max_uses ? `/${coupon.max_uses}` : ''} utilizações
                  </span>
                  {coupon.expires_at && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(coupon.expires_at).toLocaleDateString('pt-PT')}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                {/* Copy */}
                <button
                  onClick={() => handleCopy(coupon)}
                  className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                  title="Copiar código"
                >
                  {copiedId === coupon.id ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                {/* Toggle */}
                <button
                  onClick={() => handleToggle(coupon)}
                  className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
                  title={coupon.is_active ? 'Desativar' : 'Ativar'}
                >
                  {coupon.is_active ? (
                    <ToggleRight className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <ToggleLeft className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>
                {/* Delete */}
                <button
                  onClick={() => handleDelete(coupon.id)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                    deletingId === coupon.id
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-600'
                      : 'hover:bg-muted text-muted-foreground hover:text-destructive'
                  }`}
                  title={deletingId === coupon.id ? 'Clica novamente para confirmar' : 'Eliminar'}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

        </TabsContent>

        {/* ── Gift Cards Tab ── */}
        <TabsContent value="giftcards" className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground">Gift Cards</h2>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={loadGiftCards} className="gap-1.5">
                <RefreshCw className="w-3.5 h-3.5" /> Atualizar
              </Button>
              <Button onClick={() => setGcDialogOpen(true)} size="sm" className="gap-1.5">
                <Plus className="w-3.5 h-3.5" /> Gerar Gift Card
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Total', value: giftCards.length, color: 'text-blue-500' },
              { label: 'Ativos', value: giftCards.filter(g => g.is_active).length, color: 'text-emerald-500' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3">
                <CreditCard className={`w-5 h-5 ${color}`} />
                <div>
                  <p className="text-2xl font-black">{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              </div>
            ))}
          </div>

          {gcLoading ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />)}</div>
          ) : giftCards.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Gift className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Nenhum Gift Card criado ainda</p>
            </div>
          ) : (
            <div className="space-y-3">
              {giftCards.map((gc) => (
                <div key={gc.id} className={`flex items-center gap-3 p-4 rounded-2xl border bg-card ${gc.is_active ? 'border-border' : 'border-border/50 opacity-60'}`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-sm bg-muted px-2.5 py-1 rounded-lg">{gc.code}</span>
                      <span className="text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                        {gc.remaining_value.toLocaleString('pt-AO')} Kz restantes
                      </span>
                      {!gc.is_active && <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Inativo</span>}
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      <span className="text-xs text-muted-foreground">Valor original: {gc.value.toLocaleString('pt-AO')} Kz</span>
                      {gc.expires_at && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />{new Date(gc.expires_at).toLocaleDateString('pt-PT')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => handleGcCopy(gc)} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors" title="Copiar código">
                      {gcCopiedId === gc.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button onClick={() => handleGcToggle(gc)} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors" title={gc.is_active ? 'Desativar' : 'Ativar'}>
                      {gc.is_active ? <ToggleRight className="w-5 h-5 text-emerald-500" /> : <ToggleLeft className="w-5 h-5 text-muted-foreground" />}
                    </button>
                    <button onClick={() => handleGcDelete(gc.id)} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Gift Card generate dialog */}
      <Dialog open={gcDialogOpen} onOpenChange={setGcDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Gift className="w-4 h-4" /> Gerar Gift Card</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Valor (Kz) *</Label>
              <Input type="number" min={1} value={gcValue} onChange={e => setGcValue(e.target.value)} placeholder="ex: 10000" />
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Data de expiração</Label>
              <Input type="datetime-local" value={gcExpires} onChange={e => setGcExpires(e.target.value)} />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setGcDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleGenerateGiftCard} disabled={gcSaving}>
              {gcSaving ? 'A gerar…' : 'Gerar Gift Card'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create coupon dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tag className="w-4 h-4" /> Novo Cupão
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Code */}
            <div className="space-y-1.5">
              <Label>Código *</Label>
              <Input
                value={form.code}
                onChange={(e) => handleCodeChange(e.target.value)}
                placeholder="EX: DESCONTO20"
                className="font-mono uppercase"
              />
            </div>

            {/* Type */}
            <div className="space-y-1.5">
              <Label>Tipo *</Label>
              <div className="flex gap-2">
                {(['percent', 'fixed'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, type: t }))}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                      form.type === t
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-border hover:bg-muted'
                    }`}
                  >
                    {t === 'percent' ? <Percent className="w-4 h-4" /> : <Banknote className="w-4 h-4" />}
                    {t === 'percent' ? 'Percentagem' : 'Valor fixo (Kz)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Value */}
            <div className="space-y-1.5">
              <Label>Valor * {form.type === 'percent' ? '(%)' : '(Kz)'}</Label>
              <Input
                type="number"
                min={0}
                value={form.value}
                onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                placeholder={form.type === 'percent' ? '20' : '5000'}
              />
            </div>

            {/* Min order */}
            <div className="space-y-1.5">
              <Label>Valor mínimo de encomenda (Kz)</Label>
              <Input
                type="number"
                min={0}
                value={form.min_order_amount}
                onChange={(e) => setForm((f) => ({ ...f, min_order_amount: e.target.value }))}
                placeholder="Opcional"
              />
            </div>

            {/* Max uses */}
            <div className="space-y-1.5">
              <Label>Máximo de utilizações</Label>
              <Input
                type="number"
                min={1}
                value={form.max_uses}
                onChange={(e) => setForm((f) => ({ ...f, max_uses: e.target.value }))}
                placeholder="Ilimitado"
              />
            </div>

            {/* Expires at */}
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Data de expiração
              </Label>
              <Input
                type="datetime-local"
                value={form.expires_at}
                onChange={(e) => setForm((f) => ({ ...f, expires_at: e.target.value }))}
              />
            </div>

            {/* Active toggle */}
            <div className="flex items-center justify-between py-1">
              <Label>Ativo</Label>
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, is_active: !f.is_active }))}
                className="flex items-center gap-2 text-sm"
              >
                {form.is_active ? (
                  <ToggleRight className="w-6 h-6 text-emerald-500" />
                ) : (
                  <ToggleLeft className="w-6 h-6 text-muted-foreground" />
                )}
                <span className={form.is_active ? 'text-emerald-600' : 'text-muted-foreground'}>
                  {form.is_active ? 'Ativo' : 'Inativo'}
                </span>
              </button>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'A guardar…' : 'Criar Cupão'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
