import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Store,
  Handshake,
  Wrench,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Users,
  TrendingUp,
  Shield,
} from "lucide-react";

type ApplicationType = "revendedor" | "parceiro" | "prestador";

const TYPES = [
  {
    id: "revendedor" as ApplicationType,
    icon: Store,
    title: "Revendedor",
    description: "Vende produtos Sinkera na tua loja ou online com descontos exclusivos.",
    color: "from-violet-500 to-purple-600",
    bg: "from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30",
    border: "border-violet-200 dark:border-violet-800",
    iconBg: "bg-violet-100 dark:bg-violet-900/50",
    iconColor: "text-violet-600 dark:text-violet-400",
    benefits: ["Descontos de 15–30%", "Suporte dedicado", "Acesso antecipado"],
  },
  {
    id: "parceiro" as ApplicationType,
    icon: Handshake,
    title: "Parceiro Estratégico",
    description: "Integra os produtos e serviços Sinkera no teu negócio com condições especiais.",
    color: "from-blue-500 to-cyan-600",
    bg: "from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30",
    border: "border-blue-200 dark:border-blue-800",
    iconBg: "bg-blue-100 dark:bg-blue-900/50",
    iconColor: "text-blue-600 dark:text-blue-400",
    benefits: ["Co-marketing", "Revenue sharing", "Badge oficial"],
  },
  {
    id: "prestador" as ApplicationType,
    icon: Wrench,
    title: "Prestador de Serviço",
    description: "Presta serviços de instalação, manutenção ou suporte técnico na tua região.",
    color: "from-emerald-500 to-green-600",
    bg: "from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30",
    border: "border-emerald-200 dark:border-emerald-800",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/50",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    benefits: ["Certificação técnica", "Leads exclusivos", "Kit de ferramentas"],
  },
];

const PROVINCES = [
  "Luanda", "Benguela", "Huíla", "Huambo", "Malanje", "Cabinda",
  "Uíge", "Kwanza Norte", "Kwanza Sul", "Bié", "Moxico", "Cunene",
  "Namibe", "Cuando Cubango", "Lunda Norte", "Lunda Sul", "Zaire",
  "Bengo", "Kuando Kubango",
];

const STATS = [
  { icon: Users, value: "500+", label: "Parceiros ativos" },
  { icon: TrendingUp, value: "18 províncias", label: "Cobertura nacional" },
  { icon: Shield, value: "5 anos", label: "De confiança" },
];

export const PartnerFormSection = () => {
  const [selected, setSelected] = useState<ApplicationType | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", province: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const selectedType = TYPES.find((t) => t.id === selected);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setSubmitting(true);
    try {
      const { error } = await (supabase as any).from("partner_applications").insert([{
        type: selected,
        name: form.name,
        email: form.email,
        phone: form.phone,
        company: form.company || null,
        province: form.province || null,
        message: form.message || null,
      }]);
      if (error) throw error;
      setSuccess(true);
    } catch (err: any) {
      toast({ title: "Erro ao enviar", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-16 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-blue-500/5 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary uppercase tracking-wide">Programa de Parceria</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-3">
            Faz parte da <span className="bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">rede Sinkera</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Seja como revendedor, parceiro estratégico ou prestador de serviço — temos uma oportunidade para o teu perfil.
          </p>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 mt-8 flex-wrap">
            {STATS.map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-sm leading-none">{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {success ? (
          <div className="max-w-lg mx-auto text-center py-16 px-8 bg-card rounded-3xl border border-border shadow-lg">
            <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Candidatura enviada!</h3>
            <p className="text-muted-foreground mb-6">
              A nossa equipa vai analisar o teu pedido e entrar em contacto em até <strong>48 horas</strong>.
            </p>
            <Button variant="outline" onClick={() => { setSuccess(false); setSelected(null); setForm({ name: "", email: "", phone: "", company: "", province: "", message: "" }); }}>
              Enviar outra candidatura
            </Button>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            {/* Type selector */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {TYPES.map((type) => {
                const Icon = type.icon;
                const active = selected === type.id;
                return (
                  <button
                    key={type.id}
                    onClick={() => setSelected(type.id)}
                    className={`text-left p-5 rounded-2xl border-2 transition-all duration-200 ${
                      active
                        ? `bg-gradient-to-br ${type.bg} ${type.border} shadow-md scale-[1.02]`
                        : "bg-card border-border hover:border-primary/40 hover:shadow-sm"
                    }`}
                  >
                    <div className={`w-11 h-11 rounded-xl ${type.iconBg} flex items-center justify-center mb-3`}>
                      <Icon className={`w-5 h-5 ${type.iconColor}`} />
                    </div>
                    <h3 className="font-bold mb-1">{type.title}</h3>
                    <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{type.description}</p>
                    <ul className="space-y-1">
                      {type.benefits.map((b) => (
                        <li key={b} className="flex items-center gap-1.5 text-xs">
                          <CheckCircle2 className={`w-3 h-3 ${active ? type.iconColor : "text-muted-foreground"}`} />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </button>
                );
              })}
            </div>

            {/* Form */}
            {selected && (
              <div className={`bg-gradient-to-br ${selectedType?.bg} border ${selectedType?.border} rounded-3xl p-6 md:p-8`}>
                <div className="flex items-center gap-2 mb-6">
                  {selectedType && (
                    <div className={`w-8 h-8 rounded-lg ${selectedType.iconBg} flex items-center justify-center`}>
                      <selectedType.icon className={`w-4 h-4 ${selectedType.iconColor}`} />
                    </div>
                  )}
                  <h3 className="font-bold text-lg">Candidatura: {selectedType?.title}</h3>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="name">Nome completo *</Label>
                      <Input
                        id="name"
                        placeholder="João Silva"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required
                        className="bg-background"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="joao@empresa.ao"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        required
                        className="bg-background"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="phone">Telefone/WhatsApp *</Label>
                      <Input
                        id="phone"
                        placeholder="+244 9XX XXX XXX"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        required
                        className="bg-background"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="company">
                        {selected === "prestador" ? "Especialidade/Serviço" : "Empresa/Loja"}
                      </Label>
                      <Input
                        id="company"
                        placeholder={selected === "prestador" ? "Ex: Instalação de redes" : "Ex: TechStore Luanda"}
                        value={form.company}
                        onChange={(e) => setForm({ ...form, company: e.target.value })}
                        className="bg-background"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="province">Província</Label>
                    <select
                      id="province"
                      value={form.province}
                      onChange={(e) => setForm({ ...form, province: e.target.value })}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Seleciona a província</option>
                      {PROVINCES.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="message">Mensagem / Motivação</Label>
                    <Textarea
                      id="message"
                      placeholder="Conta-nos um pouco sobre o teu negócio e como pretendes trabalhar com a Sinkera..."
                      rows={3}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="bg-background resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting}
                    className={`w-full h-12 text-base font-bold gap-2 bg-gradient-to-r ${selectedType?.color} border-0 text-white hover:opacity-90 shadow-lg`}
                  >
                    {submitting ? "A enviar candidatura..." : "Enviar Candidatura"}
                    {!submitting && <ArrowRight className="w-4 h-4" />}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    Ao submeter, aceitas os termos de parceria Sinkera. Resposta em até 48h.
                  </p>
                </form>
              </div>
            )}

            {!selected && (
              <p className="text-center text-muted-foreground text-sm">
                Seleciona um tipo de parceria acima para continuar.
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
