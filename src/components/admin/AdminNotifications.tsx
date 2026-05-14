import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Send, Bell, Users, User, Megaphone, Zap, Tag, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createNotification, broadcastNotification } from '@/lib/notifications';

const TEMPLATES = [
  { id: 'promo',   icon: Tag,       label: 'Promoção',   title: '🔥 Oferta especial para si!',    message: 'Aproveite os descontos exclusivos de hoje. Aceda agora e poupe na sua próxima compra na Sinkera.' },
  { id: 'news',    icon: Megaphone, label: 'Novidade',   title: '✨ Novidade na Sinkera!',          message: 'Temos novos produtos no nosso catálogo. Venha descobrir o que há de novo!' },
  { id: 'system',  icon: Zap,       label: 'Sistema',    title: 'Informação importante',           message: 'A plataforma esteve em manutenção programada. Tudo está a funcionar normalmente.' },
  { id: 'custom',  icon: Info,      label: 'Personalizada', title: '',                            message: '' },
];

interface Profile { id: string; full_name: string; email: string; }

export function AdminNotifications() {
  const [tab, setTab]             = useState('send');
  const [target, setTarget]       = useState<'all' | 'user'>('all');
  const [template, setTemplate]   = useState('promo');
  const [title, setTitle]         = useState(TEMPLATES[0].title);
  const [message, setMessage]     = useState(TEMPLATES[0].message);
  const [link, setLink]           = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [users, setUsers]         = useState<Profile[]>([]);
  const [history, setHistory]     = useState<any[]>([]);
  const [sending, setSending]     = useState(false);
  const { toast } = useToast();

  useEffect(() => { loadUsers(); loadHistory(); }, []);

  const loadUsers = async () => {
    const { data } = await supabase.from('profiles').select('id, full_name, email').order('full_name');
    setUsers(data || []);
  };

  const loadHistory = async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*, profile:profiles(full_name, email)')
      .order('created_at', { ascending: false })
      .limit(50);
    setHistory(data || []);
  };

  const applyTemplate = (tId: string) => {
    setTemplate(tId);
    const t = TEMPLATES.find(t => t.id === tId);
    if (t) { setTitle(t.title); setMessage(t.message); }
  };

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      toast({ title: 'Preencha o título e a mensagem', variant: 'destructive' });
      return;
    }
    if (target === 'user' && !selectedUser) {
      toast({ title: 'Selecione um utilizador', variant: 'destructive' });
      return;
    }
    setSending(true);
    try {
      if (target === 'all') {
        const { data: count, error } = await broadcastNotification({ title, message, type: template, link: link || undefined });
        if (error) throw error;
        toast({ title: 'Notificação enviada', description: `Enviada para ${count} utilizadores.` });
      } else {
        const { error } = await createNotification({ userId: selectedUser!.id, title, message, type: template, link: link || undefined });
        if (error) throw error;
        toast({ title: 'Notificação enviada', description: `Enviada para ${selectedUser!.full_name || selectedUser!.email}.` });
      }
      await loadHistory();
      // Reset
      setTitle(''); setMessage(''); setLink(''); setSelectedUser(null); setUserSearch('');
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message ?? 'Não foi possível enviar', variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  const filteredUsers = users.filter(u =>
    u.full_name?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearch.toLowerCase())
  ).slice(0, 8);

  return (
    <Tabs value={tab} onValueChange={setTab}>
      <TabsList className="mb-6">
        <TabsTrigger value="send" className="gap-1.5"><Send className="w-3.5 h-3.5" /> Enviar</TabsTrigger>
        <TabsTrigger value="history" className="gap-1.5"><Bell className="w-3.5 h-3.5" /> Histórico</TabsTrigger>
      </TabsList>

      {/* ── SEND ── */}
      <TabsContent value="send">
        <div className="grid lg:grid-cols-2 gap-6">

          {/* Form */}
          <Card>
            <CardHeader><CardTitle className="text-base">Nova Notificação</CardTitle></CardHeader>
            <CardContent className="space-y-5">

              {/* Templates */}
              <div className="space-y-2">
                <Label className="text-xs">Modelo</Label>
                <div className="grid grid-cols-2 gap-2">
                  {TEMPLATES.map(({ id, icon: Icon, label }) => (
                    <button
                      key={id}
                      onClick={() => applyTemplate(id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
                        template === id
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-border hover:border-primary/40 text-muted-foreground'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 flex-shrink-0" /> {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target */}
              <div className="space-y-2">
                <Label className="text-xs">Destinatário</Label>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setTarget('all'); setSelectedUser(null); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border text-sm font-medium transition-all ${
                      target === 'all' ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground hover:border-primary/40'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" /> Todos
                  </button>
                  <button
                    onClick={() => setTarget('user')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border text-sm font-medium transition-all ${
                      target === 'user' ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground hover:border-primary/40'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" /> Específico
                  </button>
                </div>

                {target === 'user' && (
                  <div className="space-y-2 mt-2">
                    <Input
                      placeholder="Pesquisar por nome ou email..."
                      value={userSearch}
                      onChange={e => setUserSearch(e.target.value)}
                      className="rounded-xl text-sm"
                    />
                    {userSearch && (
                      <div className="border border-border rounded-xl overflow-hidden divide-y divide-border">
                        {filteredUsers.length === 0 ? (
                          <p className="text-xs text-muted-foreground px-3 py-2">Nenhum utilizador encontrado</p>
                        ) : filteredUsers.map(u => (
                          <button
                            key={u.id}
                            onClick={() => { setSelectedUser(u); setUserSearch(''); }}
                            className="w-full text-left px-3 py-2 hover:bg-muted transition-colors text-sm"
                          >
                            <span className="font-medium">{u.full_name || '—'}</span>
                            <span className="text-muted-foreground ml-2 text-xs">{u.email}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    {selectedUser && (
                      <div className="flex items-center gap-2 px-3 py-2 bg-primary/5 border border-primary/20 rounded-xl text-sm">
                        <User className="w-3.5 h-3.5 text-primary" />
                        <span className="font-medium">{selectedUser.full_name || selectedUser.email}</span>
                        <button onClick={() => setSelectedUser(null)} className="ml-auto text-muted-foreground hover:text-destructive text-xs">✕</button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <Label className="text-xs">Título</Label>
                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Título da notificação" className="rounded-xl text-sm" />
              </div>

              {/* Message */}
              <div className="space-y-1.5">
                <Label className="text-xs">Mensagem</Label>
                <Textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Corpo da notificação..." rows={3} className="rounded-xl text-sm resize-none" />
              </div>

              {/* Link */}
              <div className="space-y-1.5">
                <Label className="text-xs">Link (opcional)</Label>
                <Input value={link} onChange={e => setLink(e.target.value)} placeholder="/produtos ou URL externo" className="rounded-xl text-sm" />
              </div>

              <Button
                className="w-full gap-2"
                variant="vibrant"
                onClick={handleSend}
                disabled={sending}
              >
                <Send className="w-4 h-4" />
                {sending ? 'A enviar...' : target === 'all' ? 'Enviar para Todos' : 'Enviar para Utilizador'}
              </Button>
            </CardContent>
          </Card>

          {/* Preview */}
          <div className="space-y-4">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Pré-visualização</p>
            <div className="border border-border rounded-2xl p-4 bg-card shadow-sm max-w-sm">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <Bell className="w-4 h-4 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground line-clamp-1">{title || 'Título da notificação'}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{message || 'Corpo da mensagem...'}</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-1.5">agora</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-700 dark:text-amber-400 space-y-1">
              <p className="font-bold">Notas</p>
              <p>• "Todos" insere uma notificação para cada utilizador registado</p>
              <p>• As notificações aparecem no sino (🔔) no topo da loja em tempo real</p>
              <p>• As notificações de estado de pedido são enviadas automaticamente</p>
            </div>
          </div>
        </div>
      </TabsContent>

      {/* ── HISTORY ── */}
      <TabsContent value="history">
        <Card>
          <CardHeader><CardTitle className="text-base">Histórico de Notificações ({history.length})</CardTitle></CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <p className="text-center py-10 text-muted-foreground text-sm">Sem notificações enviadas.</p>
            ) : (
              <div className="space-y-2">
                {history.map(n => (
                  <div key={n.id} className="flex items-start gap-3 p-3 rounded-xl border border-border hover:bg-muted/30 transition-colors">
                    <Bell className={`w-4 h-4 mt-0.5 flex-shrink-0 ${n.read ? 'text-muted-foreground' : 'text-primary'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold line-clamp-1">{n.title}</p>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">{n.type}</Badge>
                        {!n.read && <Badge className="text-[10px] px-1.5 py-0 bg-primary">Nova</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{n.message}</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1">
                        {n.profile?.full_name || n.profile?.email || n.user_id.slice(0, 8)} · {new Date(n.created_at).toLocaleString('pt-PT')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
