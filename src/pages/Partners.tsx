import { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  TrendingUp, ShieldCheck, Headphones, Truck,
  CheckCircle2, Store, Handshake, Wrench, ChevronRight,
} from 'lucide-react';

type PartnerType = 'revendedor' | 'parceiro' | 'prestador';

const PARTNER_TYPES = [
  {
    id: 'revendedor' as PartnerType,
    label: 'Revendedor',
    description: 'Venda os nossos produtos na sua loja física ou online e ganhe comissões atractivas.',
    icon: Store,
  },
  {
    id: 'parceiro' as PartnerType,
    label: 'Parceiro Comercial',
    description: 'Colaboração estratégica para empresas que querem crescer com a Sinkera.',
    icon: Handshake,
  },
  {
    id: 'prestador' as PartnerType,
    label: 'Prestador de Serviços',
    description: 'Ofereça assistência técnica e suporte aos nossos clientes em Angola.',
    icon: Wrench,
  },
];

const BENEFITS = [
  { icon: TrendingUp, title: 'Comissões atractivas', desc: 'Ganhe até 15% por venda realizada através da nossa plataforma.' },
  { icon: ShieldCheck, title: 'Suporte dedicado', desc: 'Acesso a uma equipa de apoio exclusiva para parceiros.' },
  { icon: Truck, title: 'Logística simplificada', desc: 'A Sinkera trata do armazenamento e entrega dos produtos.' },
  { icon: Headphones, title: 'Formação incluída', desc: 'Acesso a materiais de formação e certificações de produto.' },
];

const PROVINCES = [
  'Luanda', 'Benguela', 'Huambo', 'Huíla', 'Cabinda', 'Malanje',
  'Uíge', 'Kwanza Norte', 'Kwanza Sul', 'Bié', 'Moxico', 'Lunda Norte',
  'Lunda Sul', 'Cunene', 'Namibe', 'Cuando Cubango', 'Zaire', 'Bengo',
];

const Partners = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<PartnerType>('revendedor');
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    province: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone) {
      toast({ title: 'Campos obrigatórios', description: 'Preencha nome, email e telefone.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from('partner_applications').insert({
        type: selectedType,
        name: form.name,
        email: form.email,
        phone: form.phone,
        company: form.company || null,
        province: form.province || null,
        message: form.message || null,
      });
      if (error) throw error;
      setSubmitted(true);
    } catch (err: any) {
      toast({ title: 'Erro ao enviar', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[hsl(221,90%,11%)] via-[hsl(221,83%,22%)] to-[hsl(221,83%,36%)] text-white py-16 mt-0">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/50 mb-4">Sinkera · Programa de Parceria</p>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-[1.05] mb-4">
            Cresça connosco.<br />
            <span className="text-[hsl(var(--cta-orange))]">Juntos somos mais.</span>
          </h1>
          <p className="text-white/60 text-base sm:text-lg font-light max-w-2xl mx-auto">
            Junte-se à rede de parceiros Sinkera e aceda a produtos originais, comissões competitivas e suporte dedicado em toda Angola.
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-14 border-b border-border">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Vantagens</span>
          </div>
          <h2 className="text-2xl font-black text-foreground mb-8">Porquê ser parceiro Sinkera?</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {BENEFITS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="p-5 rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-md transition-all duration-300 group">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                  <Icon className="w-4.5 h-4.5 text-primary" style={{ width: 18, height: 18 }} />
                </div>
                <h3 className="font-bold text-foreground text-sm mb-1.5">{title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application form */}
      <section className="py-14">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Candidatura</span>
          </div>
          <h2 className="text-2xl font-black text-foreground mb-8">Submeta a sua candidatura</h2>

          {submitted ? (
            <div className="flex flex-col items-center gap-4 py-12 text-center">
              <div className="w-14 h-14 rounded-full bg-green-50 dark:bg-green-950/30 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 text-green-500" />
              </div>
              <h3 className="text-xl font-black text-foreground">Candidatura recebida!</h3>
              <p className="text-muted-foreground max-w-sm">
                Obrigado pelo seu interesse. A nossa equipa irá analisar a sua candidatura e contactará em breve.
              </p>
              <Button variant="outline" className="mt-2 rounded-xl" onClick={() => setSubmitted(false)}>
                Submeter outra candidatura
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Partner type selector */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Tipo de parceria</Label>
                <div className="grid gap-3">
                  {PARTNER_TYPES.map(({ id, label, description, icon: Icon }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setSelectedType(id)}
                      className={`flex items-start gap-4 p-4 rounded-xl border text-left transition-all duration-200 ${
                        selectedType === id
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-border hover:border-primary/40 bg-card'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                        selectedType === id ? 'bg-primary/15' : 'bg-muted'
                      }`}>
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-foreground">{label}</span>
                          {selectedType === id && (
                            <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">Selecionado</span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Personal info */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-sm">Nome completo <span className="text-destructive">*</span></Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="O seu nome"
                    className="rounded-xl"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm">Email <span className="text-destructive">*</span></Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="email@exemplo.com"
                    className="rounded-xl"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-sm">Telefone <span className="text-destructive">*</span></Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="+244 9xx xxx xxx"
                    className="rounded-xl"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="company" className="text-sm">Empresa / Loja</Label>
                  <Input
                    id="company"
                    value={form.company}
                    onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                    placeholder="Nome da empresa (opcional)"
                    className="rounded-xl"
                  />
                </div>
              </div>

              {/* Province */}
              <div className="space-y-1.5">
                <Label htmlFor="province" className="text-sm">Província</Label>
                <select
                  id="province"
                  value={form.province}
                  onChange={e => setForm(f => ({ ...f, province: e.target.value }))}
                  className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                >
                  <option value="">Selecione a província</option>
                  {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              {/* Message */}
              <div className="space-y-1.5">
                <Label htmlFor="message" className="text-sm">Mensagem</Label>
                <Textarea
                  id="message"
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  placeholder="Conte-nos um pouco sobre o seu negócio e o que espera desta parceria..."
                  rows={4}
                  className="rounded-xl resize-none"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl font-bold text-sm gap-2"
                variant="vibrant"
              >
                {loading ? 'A enviar...' : 'Enviar Candidatura'}
                {!loading && <ChevronRight className="w-4 h-4" />}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Ao submeter, aceita os nossos termos e política de privacidade.
              </p>
            </form>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Partners;
