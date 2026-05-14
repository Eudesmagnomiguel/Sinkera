import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import {
  Smartphone, Monitor, Tv, Sparkles, Headphones, Watch,
  Home, ShoppingBag, ArrowRight, Check,
} from 'lucide-react';
import sinkeraLogoWhite from '@/assets/sinkera-logo-white.png';

const CATEGORIES = [
  { id: 'smartphones',       label: 'Smartphones',        icon: Smartphone },
  { id: 'informatica',       label: 'Computadores',        icon: Monitor    },
  { id: 'electrodomesticos', label: 'Electrodomésticos',   icon: Tv         },
  { id: 'beleza',            label: 'Beleza & Cuidado',    icon: Sparkles   },
  { id: 'audio',             label: 'Áudio & Headphones',  icon: Headphones },
  { id: 'smartwatches',      label: 'Smartwatches',        icon: Watch      },
  { id: 'casa-inteligente',  label: 'Casa Inteligente',    icon: Home       },
  { id: 'acessorios',        label: 'Acessórios',          icon: ShoppingBag},
];

const BUDGETS = [
  { id: 'low',   label: 'Menos de 50 000 Kz',   sub: 'Boas escolhas diárias'        },
  { id: 'mid',   label: '50 000 – 200 000 Kz',  sub: 'Qualidade e custo-benefício'  },
  { id: 'high',  label: '200 000 – 500 000 Kz', sub: 'Premium e performance'        },
  { id: 'ultra', label: 'Acima de 500 000 Kz',  sub: 'Topo de gama'                 },
];

interface Props { onComplete: () => void; }

export function OnboardingModal({ onComplete }: Props) {
  const { user } = useAuth();
  const [step, setStep]                       = useState(1);
  const [selectedCats, setSelectedCats]       = useState<string[]>([]);
  const [selectedBudget, setSelectedBudget]   = useState('');
  const [saving, setSaving]                   = useState(false);

  const toggle = (id: string) =>
    setSelectedCats(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);

  const persist = async (opts: { skip?: boolean } = {}) => {
    setSaving(true);
    try {
      if (user) {
        await supabase.from('profiles').update({
          interests: opts.skip ? {} : { categories: selectedCats, budget: selectedBudget },
          onboarding_completed: true,
        } as any).eq('id', user.id);
      }
    } catch { /* silently ignore — modal closes regardless */ }
    setSaving(false);
    onComplete();
  };

  const STEPS = 2;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
         style={{ background: 'rgba(6,10,22,0.85)', backdropFilter: 'blur(12px)' }}>

      <div className="relative w-full max-w-md overflow-hidden rounded-3xl"
           style={{ background: 'hsl(222 47% 7%)', boxShadow: '0 40px 80px -12px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)' }}>

        {/* Top stripe */}
        <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)' }} />

        <div className="px-8 pt-8 pb-8 space-y-7">

          {/* Logo + step indicator */}
          <div className="flex items-center justify-between">
            <img src={sinkeraLogoWhite} alt="Sinkera" className="h-6 opacity-90" />
            <div className="flex items-center gap-1.5">
              {Array.from({ length: STEPS }, (_, i) => (
                <div key={i} className="rounded-full transition-all duration-300"
                     style={{
                       width: i + 1 === step ? 20 : 6,
                       height: 6,
                       background: i + 1 <= step ? 'hsl(221 83% 55%)' : 'rgba(255,255,255,0.15)',
                     }} />
              ))}
            </div>
          </div>

          {/* ── Step 1: Categories ── */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/35">
                  Passo 1 · Interesses
                </p>
                <h2 className="text-2xl font-black text-white leading-tight tracking-tight">
                  O que queres<br />comprar?
                </h2>
                <p className="text-sm text-white/45 leading-relaxed">
                  Seleciona as categorias que te interessam.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map(({ id, label, icon: Icon }) => {
                  const active = selectedCats.includes(id);
                  return (
                    <button
                      key={id}
                      onClick={() => toggle(id)}
                      className="group flex items-center gap-3 px-4 py-3 rounded-2xl border text-left transition-all duration-200"
                      style={{
                        borderColor: active ? 'hsl(221 83% 55%)' : 'rgba(255,255,255,0.08)',
                        background: active ? 'hsla(221,83%,55%,0.12)' : 'rgba(255,255,255,0.03)',
                      }}
                    >
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-200"
                           style={{ background: active ? 'hsla(221,83%,55%,0.25)' : 'rgba(255,255,255,0.07)' }}>
                        <Icon className="w-3.5 h-3.5"
                              style={{ color: active ? 'hsl(221 83% 72%)' : 'rgba(255,255,255,0.45)' }} />
                      </div>
                      <span className="text-xs font-semibold leading-tight transition-colors duration-200"
                            style={{ color: active ? 'white' : 'rgba(255,255,255,0.55)' }}>
                        {label}
                      </span>
                      {active && (
                        <Check className="w-3 h-3 ml-auto flex-shrink-0"
                               style={{ color: 'hsl(221 83% 65%)' }} />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-1">
                <button onClick={() => persist({ skip: true })} disabled={saving}
                        className="text-xs text-white/30 hover:text-white/60 transition-colors">
                  Saltar por agora
                </button>
                <button
                  disabled={selectedCats.length === 0}
                  onClick={() => setStep(2)}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{
                    background: 'hsl(22 100% 46%)',
                    color: 'white',
                    letterSpacing: '0.05em',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'hsl(22 100% 40%)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'hsl(22 100% 46%)')}
                >
                  Continuar <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ── Step 2: Budget ── */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/35">
                  Passo 2 · Orçamento
                </p>
                <h2 className="text-2xl font-black text-white leading-tight tracking-tight">
                  Qual é o teu<br />orçamento?
                </h2>
                <p className="text-sm text-white/45 leading-relaxed">
                  Mostramos-te produtos na tua gama de preços.
                </p>
              </div>

              <div className="space-y-2">
                {BUDGETS.map(({ id, label, sub }) => {
                  const active = selectedBudget === id;
                  return (
                    <button
                      key={id}
                      onClick={() => setSelectedBudget(id)}
                      className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl border text-left transition-all duration-200"
                      style={{
                        borderColor: active ? 'hsl(221 83% 55%)' : 'rgba(255,255,255,0.08)',
                        background: active ? 'hsla(221,83%,55%,0.12)' : 'rgba(255,255,255,0.03)',
                      }}
                    >
                      <div className="w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all duration-200"
                           style={{
                             borderColor: active ? 'hsl(221 83% 55%)' : 'rgba(255,255,255,0.25)',
                             background: active ? 'hsl(221 83% 55%)' : 'transparent',
                           }}>
                        {active && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold"
                           style={{ color: active ? 'white' : 'rgba(255,255,255,0.7)' }}>
                          {label}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                          {sub}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-1">
                <button onClick={() => setStep(1)} className="text-xs text-white/30 hover:text-white/60 transition-colors">
                  Voltar
                </button>
                <button
                  disabled={!selectedBudget || saving}
                  onClick={() => persist()}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{ background: 'hsl(22 100% 46%)', color: 'white', letterSpacing: '0.05em' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'hsl(22 100% 40%)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'hsl(22 100% 46%)')}
                >
                  {saving ? 'A guardar...' : <>Começar <ArrowRight className="w-3.5 h-3.5" /></>}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom stripe */}
        <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)' }} />
      </div>
    </div>
  );
}
