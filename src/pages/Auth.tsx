import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import sinkeraLogoWhite from '@/assets/sinkera-logo-white.png';

async function getRoleDestination(userId: string): Promise<string> {
  const { data } = await supabase.from('user_roles').select('role').eq('user_id', userId);
  const roles = (data || []).map((r: any) => r.role);
  if (roles.includes('admin') || roles.includes('reseller')) return '/admin';
  return '/';
}

// ── News ticker (left panel) ─────────────────────────────────────────────────
const FALLBACK_NEWS = [
  { title: 'Nova coleção Samsung Galaxy S25 já disponível na Sinkera', category: 'Smartphones',     date: 'Maio 2025' },
  { title: 'Entrega express em Luanda em menos de 24 horas',           category: 'Logística',       date: 'Maio 2025' },
  { title: 'Programa de parceiros alargado a 18 províncias',           category: 'Parceiros',       date: 'Abr 2025'  },
  { title: 'Promoções de até 40% em electrodomésticos este mês',       category: 'Promoções',       date: 'Abr 2025'  },
  { title: 'Novos produtos de beleza e cuidado pessoal disponíveis',   category: 'Beleza',          date: 'Mar 2025'  },
];

interface NewsItem { title: string; category: string; date: string; }

function NewsTicker() {
  const [items, setItems]     = useState<NewsItem[]>(FALLBACK_NEWS);
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    supabase
      .from('news_articles' as any)
      .select('title, category, created_at')
      .order('created_at', { ascending: false })
      .limit(6)
      .then(({ data }: any) => {
        if (data && data.length > 0) {
          setItems(data.map((n: any) => ({
            title:    n.title,
            category: n.category || 'Novidade',
            date:     new Date(n.created_at).toLocaleDateString('pt-AO', { month: 'short', year: 'numeric' }),
          })));
        }
      });
  }, []);

  useEffect(() => {
    if (items.length <= 1) return;
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => { setCurrent(c => (c + 1) % items.length); setVisible(true); }, 350);
    }, 4500);
    return () => clearInterval(id);
  }, [items.length]);

  const item = items[current];

  return (
    <div className="space-y-4">
      <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-white/30">
        Últimas Notícias
      </p>

      {/* Animated item */}
      <div style={{ minHeight: 80, transition: 'opacity 0.35s ease', opacity: visible ? 1 : 0 }}>
        <p className="text-[10px] font-black tracking-[0.18em] uppercase mb-2"
           style={{ color: 'hsl(22 100% 55%)' }}>
          {item.category}
        </p>
        <p className="text-white/80 text-sm font-semibold leading-snug">
          {item.title}
        </p>
        <p className="text-white/25 text-[11px] mt-2 tabular-nums">{item.date}</p>
      </div>

      {/* Progress dots */}
      <div className="flex gap-1.5 items-center">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setVisible(false);
              setTimeout(() => { setCurrent(i); setVisible(true); }, 200);
            }}
            className="rounded-full transition-all duration-300 focus:outline-none"
            style={{
              width:      i === current ? 18 : 5,
              height:     5,
              background: i === current ? 'hsl(22 100% 46%)' : 'rgba(255,255,255,0.18)',
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Auth() {
  const { user, isAdmin, isReseller, signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode]               = useState<'login' | 'signup'>('login');
  const [loading, setLoading]         = useState(false);
  const [showPass, setShowPass]       = useState(false);
  const [showPass2, setShowPass2]     = useState(false);
  const [error, setError]             = useState('');

  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [fullName, setFullName]       = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  if (user) {
    if (isAdmin || isReseller) return <Navigate to="/admin" replace />;
    return <Navigate to="/" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: err } = await signIn(email, password);
    if (!err) {
      const { data: { user: u } } = await supabase.auth.getUser();
      const dest = u ? await getRoleDestination(u.id) : '/';
      navigate(dest, { replace: true });
    } else {
      setError('Email ou senha incorrectos. Tente novamente.');
    }
    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPass) { setError('As senhas não coincidem.'); return; }
    if (password.length < 6)      { setError('A senha deve ter pelo menos 6 caracteres.'); return; }
    setLoading(true);
    const { error: err, session } = await signUp(email, password, fullName);
    if (!err) {
      if (session) {
        navigate('/', { replace: true });
      } else {
        const { error: le } = await signIn(email, password);
        if (!le) navigate('/', { replace: true });
      }
    } else {
      setError('Não foi possível criar a conta. Tente novamente.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">

      {/* ── Left panel (brand) ── */}
      <div className="hidden lg:flex lg:w-[55%] relative flex-col"
           style={{ background: 'hsl(222 47% 5%)' }}>

        {/* Background image */}
        <div className="absolute inset-0 opacity-20"
             style={{
               backgroundImage: 'url(https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=1400&q=80&fit=crop)',
               backgroundSize: 'cover',
               backgroundPosition: 'center',
             }} />
        <div className="absolute inset-0"
             style={{ background: 'linear-gradient(135deg, hsl(222 47% 5%) 0%, hsl(221 83% 12% / 0.85) 100%)' }} />

        {/* Grid texture */}
        <div className="absolute inset-0 opacity-[0.04]"
             style={{
               backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
               backgroundSize: '60px 60px',
             }} />

        <div className="relative z-10 flex flex-col h-full px-14 py-12">

          {/* Main content */}
          <div className="flex-1 flex flex-col justify-center max-w-md space-y-10">

            {/* Brand headline */}
            <div className="space-y-4">
              <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-white/35">
                Nova Era Digital
              </p>
              <h1 className="text-4xl font-black text-white leading-[1.08] tracking-tight">
                A melhor loja<br />tech de Angola.
              </h1>
              <p className="text-white/40 text-sm leading-relaxed max-w-xs">
                Smartphones, laptops, electrodomésticos e muito mais. Entrega rápida em todo o país.
              </p>
            </div>

            {/* Thin divider */}
            <div className="h-px w-12" style={{ background: 'rgba(255,255,255,0.12)' }} />

            {/* News ticker */}
            <NewsTicker />

          </div>

          {/* Bottom tagline */}
          <p className="text-[10px] text-white/18 tracking-widest uppercase">
            Sinkera © 2025 · Luanda, Angola
          </p>
        </div>
      </div>

      {/* ── Right panel (form) ── */}
      <div className="flex-1 flex flex-col bg-background">
        <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-20 py-12 max-w-xl w-full mx-auto">

          {/* Logo + Heading */}
          <div className="space-y-4 mb-10">
            <img
              src={sinkeraLogoWhite}
              alt="Sinkera"
              className="h-10 w-auto"
              style={{ filter: 'brightness(0) saturate(100%) invert(38%) sepia(93%) saturate(763%) hue-rotate(195deg) brightness(101%) contrast(101%)' }}
            />
            <div className="space-y-1.5">
              <h2 className="text-2xl font-black text-foreground tracking-tight">
                {mode === 'login' ? 'Bem-vindo de volta' : 'Criar conta gratuita'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {mode === 'login'
                  ? 'Inicia sessão para continuar as tuas compras.'
                  : 'Regista-te e começa a comprar na Sinkera.'}
              </p>
            </div>
          </div>

          {/* Mode toggle */}
          <div className="flex mb-8 border border-border rounded-xl overflow-hidden p-1 bg-muted/40">
            {(['login', 'signup'] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); }}
                className="flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200"
                style={{
                  background: mode === m ? 'hsl(var(--background))' : 'transparent',
                  color:      mode === m ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))',
                  boxShadow:  mode === m ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                {m === 'login' ? 'Entrar' : 'Registar'}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive font-medium">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={mode === 'login' ? handleLogin : handleSignup} className="space-y-4">

            {mode === 'signup' && (
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Nome Completo
                </Label>
                <Input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Seu nome"
                  required
                  className="h-12 rounded-xl border-border/80 focus:border-primary bg-background"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Email
              </Label>
              <Input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                autoComplete="email"
                className="h-12 rounded-xl border-border/80 focus:border-primary bg-background"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Senha
              </Label>
              <div className="relative">
                <Input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  className="h-12 rounded-xl border-border/80 focus:border-primary bg-background pr-11"
                />
                <button type="button" onClick={() => setShowPass(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === 'signup' && (
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Confirmar Senha
                </Label>
                <div className="relative">
                  <Input
                    type={showPass2 ? 'text' : 'password'}
                    value={confirmPass}
                    onChange={e => setConfirmPass(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="h-12 rounded-xl border-border/80 focus:border-primary bg-background pr-11"
                  />
                  <button type="button" onClick={() => setShowPass2(v => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {showPass2 ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl flex items-center justify-center gap-2 text-sm font-bold tracking-wide transition-all mt-2 disabled:opacity-60"
              style={{ background: 'hsl(22 100% 46%)', color: 'white', letterSpacing: '0.05em' }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = 'hsl(22 100% 40%)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'hsl(22 100% 46%)'; }}
            >
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> A processar...</>
                : <>{mode === 'login' ? 'Entrar' : 'Criar Conta'} <ArrowRight className="w-4 h-4" /></>
              }
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-border text-center text-xs text-muted-foreground">
            Ao continuar, aceitas os nossos{' '}
            <a href="/termos" className="underline hover:text-foreground transition-colors">Termos</a>
            {' '}e{' '}
            <a href="/privacidade" className="underline hover:text-foreground transition-colors">Política de Privacidade</a>.
          </div>
        </div>
      </div>
    </div>
  );
}
