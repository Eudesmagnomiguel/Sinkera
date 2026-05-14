import { useState } from 'react';
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

const HIGHLIGHTS = [
  'Produtos originais com garantia oficial',
  'Entrega em todo o território nacional',
  'Parceiros em 18 províncias de Angola',
];

export default function Auth() {
  const { user, isAdmin, isReseller, signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode]             = useState<'login' | 'signup'>('login');
  const [loading, setLoading]       = useState(false);
  const [showPass, setShowPass]     = useState(false);
  const [showPass2, setShowPass2]   = useState(false);
  const [error, setError]           = useState('');

  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [fullName, setFullName]     = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  // Redirect if already logged in — respect role
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

        {/* Background image overlay */}
        <div className="absolute inset-0 opacity-20"
             style={{
               backgroundImage: 'url(https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=1400&q=80&fit=crop)',
               backgroundSize: 'cover',
               backgroundPosition: 'center',
             }} />
        <div className="absolute inset-0"
             style={{ background: 'linear-gradient(135deg, hsl(222 47% 5%) 0%, hsl(221 83% 12% / 0.85) 100%)' }} />

        {/* Decorative grid lines */}
        <div className="absolute inset-0 opacity-[0.04]"
             style={{
               backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
               backgroundSize: '60px 60px',
             }} />

        <div className="relative z-10 flex flex-col h-full px-14 py-12">
          {/* Logo */}
          <img src={sinkeraLogoWhite} alt="Sinkera" className="h-5 w-auto opacity-85" />

          {/* Main content */}
          <div className="flex-1 flex flex-col justify-center max-w-md">
            <div className="space-y-6">
              <div className="space-y-3">
                <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-white/35">
                  Nova Era Digital
                </p>
                <h1 className="text-4xl font-black text-white leading-[1.08] tracking-tight">
                  A melhor loja<br />tech de Angola.
                </h1>
              </div>
              <p className="text-white/45 text-sm leading-relaxed max-w-xs">
                Smartphones, laptops, electrodomésticos e muito mais — com entrega rápida em todo o país.
              </p>
              <div className="space-y-2.5 pt-2">
                {HIGHLIGHTS.map((h) => (
                  <div key={h} className="flex items-center gap-3">
                    <div className="w-1 h-1 rounded-full flex-shrink-0"
                         style={{ background: 'hsl(22 100% 46%)' }} />
                    <p className="text-xs text-white/50">{h}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom tagline */}
          <p className="text-[10px] text-white/20 tracking-widest uppercase">
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
              className="h-6 w-auto invert dark:invert-0 dark:opacity-85"
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
          <div className="flex gap-0 mb-8 border border-border rounded-xl overflow-hidden p-1 bg-muted/40">
            {(['login', 'signup'] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); }}
                className="flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200"
                style={{
                  background: mode === m ? 'hsl(var(--background))' : 'transparent',
                  color: mode === m ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))',
                  boxShadow: mode === m ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
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
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
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
                  <button
                    type="button"
                    onClick={() => setShowPass2(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
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
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> A processar...</>
              ) : (
                <>{mode === 'login' ? 'Entrar' : 'Criar Conta'} <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          {/* Footer links */}
          <div className="mt-8 pt-6 border-t border-border text-center text-xs text-muted-foreground">
            Ao continuar, aceitas os nossos{' '}
            <a href="/termos" className="underline hover:text-foreground transition-colors">Termos</a>
            {' '}e{' '}
            <a href="/privacidade" className="underline hover:text-foreground transition-colors">Política de Privacidade</a>
            .
          </div>
        </div>
      </div>
    </div>
  );
}
