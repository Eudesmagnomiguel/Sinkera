import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  Search, Store, Handshake, Wrench, CheckCircle2, XCircle, Clock,
  Eye, Plus, Phone, Mail, MapPin, Building2, Calendar, Filter,
  UserCheck, RefreshCw, ChevronDown, MessageSquare,
} from 'lucide-react';

interface Application {
  id: string;
  type: 'revendedor' | 'parceiro' | 'prestador';
  name: string;
  email: string;
  phone: string;
  company: string | null;
  province: string | null;
  message: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

const TYPE_META = {
  revendedor: { label: 'Revendedor', icon: Store, color: 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800' },
  parceiro: { label: 'Parceiro Estratégico', icon: Handshake, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800' },
  prestador: { label: 'Prestador de Serviço', icon: Wrench, color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' },
};

const STATUS_META = {
  pending: { label: 'Pendente', icon: Clock, cls: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800' },
  approved: { label: 'Aprovado', icon: CheckCircle2, cls: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' },
  rejected: { label: 'Rejeitado', icon: XCircle, cls: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800' },
};

const PROVINCES = ['Luanda','Benguela','Huambo','Bié','Moxico','Huíla','Namibe','Cunene','Cuando Cubango','Lunda Norte','Lunda Sul','Malanje','Uíge','Zaire','Cabinda','Cuanza Norte','Cuanza Sul','Bengo'];

export function AdminPartners() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selected, setSelected] = useState<Application | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);
  const { toast } = useToast();

  const [newForm, setNewForm] = useState({
    type: 'revendedor' as Application['type'],
    name: '', email: '', phone: '', company: '', province: '', message: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const { data } = await (supabase as any)
      .from('partner_applications')
      .select('*')
      .order('created_at', { ascending: false });
    setApps(data || []);
    setLoading(false);
  };

  const filtered = apps.filter((a) => {
    const q = search.toLowerCase();
    const matchSearch = !q || a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q) || (a.company || '').toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || a.status === statusFilter;
    const matchType = typeFilter === 'all' || a.type === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  const counts = {
    all: apps.length,
    pending: apps.filter(a => a.status === 'pending').length,
    approved: apps.filter(a => a.status === 'approved').length,
    rejected: apps.filter(a => a.status === 'rejected').length,
  };

  const approve = async (app: Application) => {
    setProcessing(app.id);
    try {
      // Update application status
      const { error: appErr } = await (supabase as any)
        .from('partner_applications')
        .update({ status: 'approved' })
        .eq('id', app.id);
      if (appErr) throw appErr;

      // Find user by email in profiles
      const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('id')
        .eq('email', app.email)
        .maybeSingle();

      if (profile?.id) {
        // Check if role already exists
        const { data: existing } = await supabase
          .from('user_roles')
          .select('id')
          .eq('user_id', profile.id)
          .eq('role', 'reseller')
          .maybeSingle();

        if (!existing) {
          const { error: roleErr } = await supabase
            .from('user_roles')
            .insert([{ user_id: profile.id, role: 'reseller' }]);
          if (roleErr) throw roleErr;
        }
        toast({ title: '✓ Aprovado', description: `${app.name} agora tem acesso à área de revendedor.` });
      } else {
        toast({
          title: '✓ Candidatura aprovada',
          description: 'Utilizador não encontrado no sistema — acesso será atribuído quando criar conta.',
        });
      }

      load();
      if (selected?.id === app.id) setSelected({ ...selected, status: 'approved' });
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    } finally {
      setProcessing(null);
    }
  };

  const reject = async (app: Application) => {
    if (!confirm(`Rejeitar candidatura de ${app.name}?`)) return;
    setProcessing(app.id);
    try {
      await (supabase as any)
        .from('partner_applications')
        .update({ status: 'rejected' })
        .eq('id', app.id);
      toast({ title: 'Candidatura rejeitada' });
      load();
      if (selected?.id === app.id) setSelected({ ...selected, status: 'rejected' });
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    } finally {
      setProcessing(null);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await (supabase as any).from('partner_applications').insert([{
        ...newForm,
        company: newForm.company || null,
        province: newForm.province || null,
        message: newForm.message || null,
        status: 'pending',
      }]);
      if (error) throw error;
      toast({ title: 'Candidatura registada com sucesso' });
      setAddOpen(false);
      setNewForm({ type: 'revendedor', name: '', email: '', phone: '', company: '', province: '', message: '' });
      load();
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-black text-foreground">Parceiros & Revendedores</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Gerir candidaturas e atribuir acesso à área de vendas</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load} className="gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" /> Atualizar
          </Button>
          <Button variant="vibrant" size="sm" onClick={() => setAddOpen(true)} className="gap-1.5">
            <Plus className="w-4 h-4" /> Registar Parceiro
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', count: counts.all, icon: Building2, color: 'text-foreground', bg: 'bg-muted/60' },
          { label: 'Pendentes', count: counts.pending, icon: Clock, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30' },
          { label: 'Aprovados', count: counts.approved, icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
          { label: 'Rejeitados', count: counts.rejected, icon: XCircle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950/30' },
        ].map(({ label, count, icon: Icon, color, bg }) => (
          <div key={label} className={`${bg} rounded-2xl p-4 border border-border`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</span>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className={`text-2xl font-black ${color}`}>{count}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Pesquisar por nome, email ou empresa..." className="pl-9 rounded-xl" />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="all">Todos os estados</option>
          <option value="pending">Pendentes</option>
          <option value="approved">Aprovados</option>
          <option value="rejected">Rejeitados</option>
        </select>
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="all">Todos os tipos</option>
          <option value="revendedor">Revendedor</option>
          <option value="parceiro">Parceiro Estratégico</option>
          <option value="prestador">Prestador de Serviço</option>
        </select>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Building2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-semibold">Nenhuma candidatura encontrada</p>
          <p className="text-sm mt-1">Ajuste os filtros ou adicione manualmente.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((app) => {
            const type = TYPE_META[app.type];
            const status = STATUS_META[app.status];
            const TypeIcon = type.icon;
            const StatusIcon = status.icon;
            const isProcessing = processing === app.id;

            return (
              <div
                key={app.id}
                className="bg-card border border-border rounded-2xl p-4 sm:p-5 hover:border-primary/30 hover:shadow-sm transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                    <TypeIcon className="w-5 h-5 text-muted-foreground" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-bold text-foreground">{app.name}</span>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${type.color}`}>
                        {type.label}
                      </span>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${status.cls}`}>
                        <StatusIcon className="w-3 h-3" /> {status.label}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {app.email}</span>
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {app.phone}</span>
                      {app.company && <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {app.company}</span>}
                      {app.province && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {app.province}</span>}
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(app.created_at).toLocaleDateString('pt-PT')}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelected(app)}
                      className="gap-1.5 rounded-xl h-8 px-3"
                    >
                      <Eye className="w-3.5 h-3.5" /> Ver
                    </Button>
                    {app.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => approve(app)}
                          disabled={isProcessing}
                          className="gap-1.5 rounded-xl h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          {isProcessing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <UserCheck className="w-3.5 h-3.5" />}
                          Aprovar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => reject(app)}
                          disabled={isProcessing}
                          className="gap-1.5 rounded-xl h-8 px-3"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Rejeitar
                        </Button>
                      </>
                    )}
                    {app.status === 'approved' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => reject(app)}
                        disabled={isProcessing}
                        className="gap-1.5 rounded-xl h-8 px-3 text-destructive border-destructive/30 hover:bg-destructive/10"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Revogar
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail dialog */}
      {selected && (
        <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {(() => { const T = TYPE_META[selected.type]; return <T.icon className="w-5 h-5" />; })()}
                Candidatura — {selected.name}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${TYPE_META[selected.type].color}`}>
                  {TYPE_META[selected.type].label}
                </span>
                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${STATUS_META[selected.status].cls}`}>
                  {STATUS_META[selected.status].label}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { label: 'Nome', value: selected.name, icon: Building2 },
                  { label: 'Email', value: selected.email, icon: Mail },
                  { label: 'Telefone', value: selected.phone, icon: Phone },
                  { label: 'Empresa / Especialidade', value: selected.company || '—', icon: Building2 },
                  { label: 'Província', value: selected.province || '—', icon: MapPin },
                  { label: 'Data', value: new Date(selected.created_at).toLocaleDateString('pt-PT'), icon: Calendar },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="bg-muted/40 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                      <Icon className="w-3.5 h-3.5" /> {label}
                    </div>
                    <p className="font-semibold text-foreground truncate">{value}</p>
                  </div>
                ))}
              </div>

              {selected.message && (
                <div className="bg-muted/40 rounded-xl p-4">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                    <MessageSquare className="w-3.5 h-3.5" /> Mensagem
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">{selected.message}</p>
                </div>
              )}
            </div>

            <DialogFooter className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setSelected(null)}>Fechar</Button>
              {selected.status === 'pending' && (
                <>
                  <Button
                    onClick={() => { approve(selected); setSelected(null); }}
                    disabled={!!processing}
                    className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <UserCheck className="w-4 h-4" /> Aprovar e Dar Acesso
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => { reject(selected); setSelected(null); }}
                    disabled={!!processing}
                    className="gap-1.5"
                  >
                    <XCircle className="w-4 h-4" /> Rejeitar
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Add manually dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Registar Novo Parceiro</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-3">
            <div className="space-y-1.5">
              <Label>Tipo *</Label>
              <select
                value={newForm.type}
                onChange={e => setNewForm(f => ({ ...f, type: e.target.value as Application['type'] }))}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="revendedor">Revendedor</option>
                <option value="parceiro">Parceiro Estratégico</option>
                <option value="prestador">Prestador de Serviço</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Nome Completo *</Label>
                <Input value={newForm.name} onChange={e => setNewForm(f => ({ ...f, name: e.target.value }))} required placeholder="João Silva" />
              </div>
              <div className="space-y-1.5">
                <Label>Telefone *</Label>
                <Input value={newForm.phone} onChange={e => setNewForm(f => ({ ...f, phone: e.target.value }))} required placeholder="+244 9xx xxx xxx" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Email *</Label>
              <Input type="email" value={newForm.email} onChange={e => setNewForm(f => ({ ...f, email: e.target.value }))} required placeholder="email@empresa.ao" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Empresa / Especialidade</Label>
                <Input value={newForm.company} onChange={e => setNewForm(f => ({ ...f, company: e.target.value }))} placeholder="Nome da empresa" />
              </div>
              <div className="space-y-1.5">
                <Label>Província</Label>
                <select
                  value={newForm.province}
                  onChange={e => setNewForm(f => ({ ...f, province: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="">Selecionar...</option>
                  {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Observações</Label>
              <Textarea value={newForm.message} onChange={e => setNewForm(f => ({ ...f, message: e.target.value }))} placeholder="Notas adicionais..." rows={3} />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={saving} variant="vibrant">
                {saving ? 'A registar...' : 'Registar Candidatura'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
