import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Navigate, Link } from 'react-router-dom';
import {
  User, Mail, Phone, Save, MapPin, ShoppingBag,
  Heart, ChevronRight, Edit2, ShieldCheck, LogOut, Camera, Loader2,
} from 'lucide-react';
import { profileSchema } from '@/lib/validations';
import { z } from 'zod';
import { AddressBook } from '@/components/AddressBook';

type Tab = 'profile' | 'addresses';

const TABS = [
  { id: 'profile' as Tab, label: 'Dados Pessoais', icon: User },
  { id: 'addresses' as Tab, label: 'Endereços', icon: MapPin },
];

const Profile = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const { user, loading: authLoading, signOut } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [formData, setFormData] = useState({ full_name: '', email: '', phone: '', avatar_url: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [orderCount, setOrderCount] = useState(0);

  useEffect(() => {
    if (user) {
      loadProfile();
      supabase.from('orders').select('id', { count: 'exact' }).eq('user_id', user.id)
        .then(({ count }) => setOrderCount(count || 0));
    }
  }, [user]);

  const loadProfile = async () => {
    const { data } = await supabase.from('profiles').select('*').eq('id', user?.id).maybeSingle();
    if (data) setFormData({
      full_name: data.full_name || '',
      email: data.email || '',
      phone: data.phone || '',
      avatar_url: (data as any).avatar_url || '',
    });
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${user?.id}-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('avatars').upload(path, file, { cacheControl: '3600', upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      const avatarUrl = data.publicUrl;
      await supabase.from('profiles').update({ avatar_url: avatarUrl } as any).eq('id', user?.id);
      setFormData(f => ({ ...f, avatar_url: avatarUrl }));
      toast({ title: 'Foto atualizada' });
    } catch (err: any) {
      toast({ title: 'Erro no upload', description: err.message, variant: 'destructive' });
    } finally {
      setUploadingAvatar(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      const validated = profileSchema.parse({ full_name: formData.full_name, phone: formData.phone });
      const { error } = await supabase.from('profiles')
        .update({ full_name: validated.full_name, phone: validated.phone || null })
        .eq('id', user?.id);
      if (error) throw error;
      toast({ title: 'Perfil atualizado', description: 'Informações guardadas com sucesso.' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fe: Record<string, string> = {};
        error.issues.forEach(e => { if (e.path[0]) fe[e.path[0].toString()] = e.message; });
        setErrors(fe);
      } else {
        toast({ title: 'Erro', description: 'Não foi possível atualizar o perfil.', variant: 'destructive' });
      }
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" />;

  const initials = formData.full_name
    ? formData.full_name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : user.email?.charAt(0).toUpperCase() ?? '?';

  return (
    <div className="min-h-screen bg-muted/30 dark:bg-background">
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <main className="container mx-auto px-4 py-8 mt-20 max-w-4xl">

        {/* Hero card */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <label className="relative w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 cursor-pointer group/avatar">
            {formData.avatar_url ? (
              <img src={formData.avatar_url} alt="Foto de perfil" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                <span className="text-2xl font-black text-primary">{initials}</span>
              </div>
            )}
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-1 opacity-0 group-hover/avatar:opacity-100 transition-opacity">
              {uploadingAvatar
                ? <Loader2 className="w-5 h-5 text-white animate-spin" />
                : <Camera className="w-5 h-5 text-white" />}
              <span className="text-[9px] text-white font-bold">Alterar</span>
            </div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
              disabled={uploadingAvatar}
            />
          </label>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-black text-foreground truncate">{formData.full_name || 'Utilizador'}</h1>
            <p className="text-sm text-muted-foreground">{formData.email}</p>
            {formData.phone && <p className="text-xs text-muted-foreground mt-0.5">{formData.phone}</p>}
          </div>
          {/* Quick stats */}
          <div className="flex gap-3 w-full sm:w-auto">
            <Link to="/pedidos" className="flex-1 sm:flex-none flex flex-col items-center gap-0.5 bg-muted/60 rounded-xl px-4 py-3 hover:bg-muted transition-colors">
              <span className="text-lg font-black text-foreground">{orderCount}</span>
              <span className="text-[10px] text-muted-foreground font-medium">Encomendas</span>
            </Link>
            <Link to="/favoritos" className="flex-1 sm:flex-none flex flex-col items-center gap-0.5 bg-muted/60 rounded-xl px-4 py-3 hover:bg-muted transition-colors">
              <Heart className="w-5 h-5 text-red-400" />
              <span className="text-[10px] text-muted-foreground font-medium">Favoritos</span>
            </Link>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6 items-start">

          {/* Sidebar nav */}
          <div className="lg:col-span-1 space-y-1.5">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left ${
                  activeTab === id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1">{label}</span>
                {activeTab !== id && <ChevronRight className="w-3.5 h-3.5 opacity-40" />}
              </button>
            ))}
            <div className="pt-1 border-t border-border">
              <Link
                to="/pedidos"
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="flex-1">Minhas Encomendas</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-40" />
              </Link>
              <Link
                to="/favoritos"
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
              >
                <Heart className="w-4 h-4" />
                <span className="flex-1">Favoritos</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-40" />
              </Link>
              <button
                onClick={signOut}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
              >
                <LogOut className="w-4 h-4" />
                Terminar Sessão
              </button>
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-3">

            {/* Personal data */}
            {activeTab === 'profile' && (
              <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Edit2 className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-bold text-foreground">Informações Pessoais</h2>
                    <p className="text-xs text-muted-foreground">Atualize os seus dados de conta</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">

                  {/* Avatar upload */}
                  <div className="flex flex-col items-center gap-3 py-2">
                    <div className="relative group/av">
                      <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-border bg-primary/10 flex items-center justify-center">
                        {formData.avatar_url ? (
                          <img src={formData.avatar_url} alt="Foto de perfil" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-3xl font-black text-primary">{initials}</span>
                        )}
                      </div>
                      {/* Overlay */}
                      <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover/av:opacity-100 transition-opacity cursor-pointer">
                        {uploadingAvatar
                          ? <Loader2 className="w-6 h-6 text-white animate-spin" />
                          : <Camera className="w-6 h-6 text-white" />}
                      </div>
                      <label className="absolute inset-0 rounded-full cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarUpload}
                          disabled={uploadingAvatar}
                        />
                      </label>
                    </div>
                    <div className="text-center">
                      <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary cursor-pointer hover:underline">
                        <Camera className="w-3.5 h-3.5" />
                        {uploadingAvatar ? 'A carregar...' : 'Alterar foto de perfil'}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarUpload}
                          disabled={uploadingAvatar}
                        />
                      </label>
                      <p className="text-[11px] text-muted-foreground mt-0.5">JPG, PNG ou WEBP · máx 5 MB</p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-1.5 text-sm">
                      <User className="w-3.5 h-3.5" /> Nome Completo
                    </Label>
                    <Input
                      value={formData.full_name}
                      onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                      placeholder="O seu nome completo"
                      maxLength={100}
                      className={`rounded-xl ${errors.full_name ? 'border-destructive' : ''}`}
                    />
                    {errors.full_name && <p className="text-xs text-destructive">{errors.full_name}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-1.5 text-sm">
                      <Mail className="w-3.5 h-3.5" /> Email
                    </Label>
                    <Input value={formData.email} disabled className="rounded-xl bg-muted/50 opacity-60" />
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> O email não pode ser alterado
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-1.5 text-sm">
                      <Phone className="w-3.5 h-3.5" /> Telefone
                    </Label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+244 9xx xxx xxx"
                      maxLength={20}
                      className={`rounded-xl ${errors.phone ? 'border-destructive' : ''}`}
                    />
                    {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                  </div>

                  <Button type="submit" disabled={loading} className="w-full rounded-xl gap-2" variant="vibrant">
                    <Save className="w-4 h-4" />
                    {loading ? 'A guardar...' : 'Guardar Alterações'}
                  </Button>
                </form>
              </div>
            )}

            {/* Addresses */}
            {activeTab === 'addresses' && (
              <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-bold text-foreground">Os Meus Endereços</h2>
                    <p className="text-xs text-muted-foreground">Endereços de entrega guardados na sua conta</p>
                  </div>
                </div>
                <AddressBook />
              </div>
            )}

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
