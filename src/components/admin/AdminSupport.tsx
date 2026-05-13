import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Wrench, Search, RefreshCw, Eye, Clock, CheckCircle2, XCircle,
  AlertTriangle, Phone, Mail, MapPin, Calendar, Smartphone,
  Filter, MessageSquare,
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────
interface SupportRequest {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  phone: string;
  device_type: string;
  brand_model: string | null;
  problem_description: string;
  urgency: 'normal' | 'urgente' | 'critico';
  province: string | null;
  address: string | null;
  preferred_date: string | null;
  status: 'pendente' | 'em_analise' | 'agendado' | 'em_progresso' | 'resolvido' | 'cancelado';
  technician_notes: string | null;
  created_at: string;
  updated_at: string;
}

// ── Badge helpers ──────────────────────────────────────────────────────────
const URGENCY_STYLES: Record<string, string> = {
  normal:  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800',
  urgente: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800',
  critico: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800',
};

const URGENCY_LABELS: Record<string, string> = {
  normal:  'Normal',
  urgente: 'Urgente',
  critico: 'Crítico',
};

const STATUS_STYLES: Record<string, string> = {
  pendente:     'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700',
  em_analise:   'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800',
  agendado:     'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 border border-violet-200 dark:border-violet-800',
  em_progresso: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800',
  resolvido:    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800',
  cancelado:    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800',
};

const STATUS_LABELS: Record<string, string> = {
  pendente:     'Pendente',
  em_analise:   'Em Análise',
  agendado:     'Agendado',
  em_progresso: 'Em Progresso',
  resolvido:    'Resolvido',
  cancelado:    'Cancelado',
};

function UrgencyBadge({ urgency }: { urgency: string }) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${URGENCY_STYLES[urgency] || URGENCY_STYLES.normal}`}>
      <AlertTriangle className="w-3 h-3" />
      {URGENCY_LABELS[urgency] || urgency}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const icon = status === 'resolvido'
    ? <CheckCircle2 className="w-3 h-3" />
    : status === 'cancelado'
    ? <XCircle className="w-3 h-3" />
    : <Clock className="w-3 h-3" />;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[status] || STATUS_STYLES.pendente}`}>
      {icon}
      {STATUS_LABELS[status] || status}
    </span>
  );
}

// ── Stat card ──────────────────────────────────────────────────────────────
function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={`bg-card border border-border rounded-2xl p-4 flex flex-col gap-1 shadow-sm ${color}`}>
      <span className="text-2xl font-black text-foreground">{value}</span>
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────
export function AdminSupport() {
  const { toast } = useToast();
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterUrgency, setFilterUrgency] = useState<string>('all');
  const [selected, setSelected] = useState<SupportRequest | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [editStatus, setEditStatus] = useState<string>('pendente');

  useEffect(() => { loadRequests(); }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from('tech_support_requests')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setRequests(data || []);
    } catch {
      toast({ title: 'Erro', description: 'Não foi possível carregar os pedidos de suporte.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const openDialog = (req: SupportRequest) => {
    setSelected(req);
    setEditNotes(req.technician_notes || '');
    setEditStatus(req.status);
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const { error } = await (supabase as any)
        .from('tech_support_requests')
        .update({ status: editStatus, technician_notes: editNotes, updated_at: new Date().toISOString() })
        .eq('id', selected.id);
      if (error) throw error;
      toast({ title: 'Guardado', description: 'Pedido atualizado com sucesso.' });
      setRequests(prev => prev.map(r => r.id === selected.id
        ? { ...r, status: editStatus as SupportRequest['status'], technician_notes: editNotes }
        : r
      ));
      setSelected(null);
    } catch {
      toast({ title: 'Erro', description: 'Não foi possível guardar as alterações.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  // ── Stats ──────────────────────────────────────────────────────────────
  const total       = requests.length;
  const pendente    = requests.filter(r => r.status === 'pendente').length;
  const emProgresso = requests.filter(r => r.status === 'em_progresso').length;
  const resolvido   = requests.filter(r => r.status === 'resolvido').length;

  // ── Filtered list ──────────────────────────────────────────────────────
  const filtered = requests.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = !q || r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q);
    const matchStatus  = filterStatus  === 'all' || r.status  === filterStatus;
    const matchUrgency = filterUrgency === 'all' || r.urgency === filterUrgency;
    return matchSearch && matchStatus && matchUrgency;
  });

  const fmt = (d: string) => new Date(d).toLocaleDateString('pt-AO', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="space-y-6">

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total"       value={total}       color="" />
        <StatCard label="Pendentes"   value={pendente}    color="" />
        <StatCard label="Em Progresso" value={emProgresso} color="" />
        <StatCard label="Resolvidos"  value={resolvido}   color="" />
      </div>

      {/* ── Toolbar ── */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Pesquisar por nome ou email…"
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os estados</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="em_analise">Em Análise</SelectItem>
              <SelectItem value="agendado">Agendado</SelectItem>
              <SelectItem value="em_progresso">Em Progresso</SelectItem>
              <SelectItem value="resolvido">Resolvido</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterUrgency} onValueChange={setFilterUrgency}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Urgência" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas urgências</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="urgente">Urgente</SelectItem>
              <SelectItem value="critico">Crítico</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button variant="outline" size="icon" onClick={loadRequests} title="Atualizar">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* ── Cards grid ── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
          <Wrench className="w-12 h-12 opacity-30" />
          <p className="font-semibold">Nenhum pedido encontrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(req => (
            <div
              key={req.id}
              className="bg-card border border-border rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-primary/30 transition-all space-y-3 cursor-pointer"
              onClick={() => openDialog(req)}
            >
              {/* Header badges */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <UrgencyBadge urgency={req.urgency} />
                <StatusBadge status={req.status} />
              </div>

              {/* Name */}
              <div>
                <p className="font-bold text-foreground truncate">{req.name}</p>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                  <Mail className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{req.email}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                  <Phone className="w-3 h-3 flex-shrink-0" />
                  <span>{req.phone}</span>
                </div>
              </div>

              {/* Device */}
              <div className="flex items-center gap-1.5 text-sm">
                <Smartphone className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                <span className="font-medium text-foreground">{req.device_type}</span>
                {req.brand_model && <span className="text-muted-foreground">· {req.brand_model}</span>}
              </div>

              {/* Footer info */}
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border">
                <div className="flex items-center gap-1">
                  {req.province && (
                    <>
                      <MapPin className="w-3 h-3" />
                      <span>{req.province}</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {req.preferred_date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(req.preferred_date).toLocaleDateString('pt-AO', { day: '2-digit', month: 'short' })}
                    </span>
                  )}
                  <span>{fmt(req.created_at)}</span>
                </div>
              </div>

              {/* View button */}
              <Button variant="outline" size="sm" className="w-full gap-1.5" onClick={e => { e.stopPropagation(); openDialog(req); }}>
                <Eye className="w-3.5 h-3.5" />
                Ver detalhes
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* ── Detail Dialog ── */}
      <Dialog open={!!selected} onOpenChange={open => !open && setSelected(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-primary" />
              Pedido de Suporte
            </DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="space-y-4 mt-2">
              {/* Badges */}
              <div className="flex gap-2 flex-wrap">
                <UrgencyBadge urgency={selected.urgency} />
                <StatusBadge status={selected.status} />
              </div>

              {/* Contact */}
              <div className="bg-muted/40 rounded-xl p-4 space-y-2">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Contacto</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Nome</p>
                    <p className="font-semibold">{selected.name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Telefone</p>
                    <p className="font-semibold flex items-center gap-1"><Phone className="w-3 h-3" />{selected.phone}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground text-xs">Email</p>
                    <p className="font-semibold flex items-center gap-1"><Mail className="w-3 h-3" />{selected.email}</p>
                  </div>
                  {selected.province && (
                    <div>
                      <p className="text-muted-foreground text-xs">Província</p>
                      <p className="font-semibold flex items-center gap-1"><MapPin className="w-3 h-3" />{selected.province}</p>
                    </div>
                  )}
                  {selected.address && (
                    <div>
                      <p className="text-muted-foreground text-xs">Endereço</p>
                      <p className="font-semibold">{selected.address}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Device */}
              <div className="bg-muted/40 rounded-xl p-4 space-y-2">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Dispositivo</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Tipo</p>
                    <p className="font-semibold flex items-center gap-1"><Smartphone className="w-3 h-3" />{selected.device_type}</p>
                  </div>
                  {selected.brand_model && (
                    <div>
                      <p className="text-muted-foreground text-xs">Marca / Modelo</p>
                      <p className="font-semibold">{selected.brand_model}</p>
                    </div>
                  )}
                  {selected.preferred_date && (
                    <div>
                      <p className="text-muted-foreground text-xs">Data preferida</p>
                      <p className="font-semibold flex items-center gap-1"><Calendar className="w-3 h-3" />{fmt(selected.preferred_date)}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-muted-foreground text-xs">Registado em</p>
                    <p className="font-semibold">{fmt(selected.created_at)}</p>
                  </div>
                </div>
              </div>

              {/* Problem */}
              <div className="space-y-1">
                <Label className="flex items-center gap-1.5 text-sm font-semibold">
                  <MessageSquare className="w-3.5 h-3.5" />
                  Descrição do problema
                </Label>
                <p className="text-sm text-foreground bg-muted/40 rounded-xl p-3 leading-relaxed">
                  {selected.problem_description}
                </p>
              </div>

              {/* Technician notes */}
              <div className="space-y-1.5">
                <Label htmlFor="tech-notes" className="text-sm font-semibold">Notas do técnico</Label>
                <Textarea
                  id="tech-notes"
                  value={editNotes}
                  onChange={e => setEditNotes(e.target.value)}
                  placeholder="Adicionar notas internas sobre este pedido…"
                  rows={4}
                />
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">Estado</Label>
                <Select value={editStatus} onValueChange={setEditStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="em_analise">Em Análise</SelectItem>
                    <SelectItem value="agendado">Agendado</SelectItem>
                    <SelectItem value="em_progresso">Em Progresso</SelectItem>
                    <SelectItem value="resolvido">Resolvido</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button onClick={handleSave} disabled={saving} className="flex-1 gap-2">
                  {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Guardar
                </Button>
                <Button variant="outline" onClick={() => setSelected(null)} className="flex-1">
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
