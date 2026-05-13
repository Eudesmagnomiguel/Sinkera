import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  Wrench, CheckCircle2, ArrowRight, Clock, Shield, Star,
  Smartphone, Monitor, Tv, Headphones, Printer, Wifi,
  ChevronRight, Phone, Mail, MapPin, Zap, AlertTriangle, Info,
} from "lucide-react";
import { Link } from "react-router-dom";

const DEVICE_TYPES = [
  { id: "computador", label: "Computador / Portátil", icon: Monitor },
  { id: "smartphone", label: "Smartphone / Tablet", icon: Smartphone },
  { id: "televisao", label: "Televisão / Monitor", icon: Tv },
  { id: "audio", label: "Áudio / Headphones", icon: Headphones },
  { id: "impressora", label: "Impressora / Scanner", icon: Printer },
  { id: "rede", label: "Redes / Internet", icon: Wifi },
  { id: "outro", label: "Outro Equipamento", icon: Wrench },
];

const URGENCY_OPTIONS = [
  { id: "normal", label: "Normal", desc: "Resposta em 2–3 dias úteis", icon: Info, color: "border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800 text-blue-700 dark:text-blue-300" },
  { id: "urgente", label: "Urgente", desc: "Resposta em 24 horas", icon: AlertTriangle, color: "border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800 text-orange-700 dark:text-orange-300" },
  { id: "critico", label: "Crítico", desc: "Resposta imediata", icon: Zap, color: "border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800 text-red-700 dark:text-red-300" },
];

const PROVINCES = [
  "Luanda","Benguela","Huíla","Huambo","Malanje","Cabinda","Uíge",
  "Kwanza Norte","Kwanza Sul","Bié","Moxico","Cunene","Namibe",
  "Cuando Cubango","Lunda Norte","Lunda Sul","Zaire","Bengo",
];

const STEPS = ["Equipamento", "Problema", "Contacto", "Confirmação"];

const HOW_IT_WORKS = [
  { icon: "1", title: "Preenche o formulário", desc: "Descreve o problema e o teu equipamento em menos de 2 minutos." },
  { icon: "2", title: "Análise técnica", desc: "A nossa equipa analisa o pedido e entra em contacto em até 24h." },
  { icon: "3", title: "Agendamento", desc: "Escolhemos juntos a melhor data e forma de assistência." },
  { icon: "4", title: "Resolução", desc: "O técnico resolve o problema com garantia de qualidade." },
];

export default function TechSupport() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [ticketId, setTicketId] = useState("");

  const [form, setForm] = useState({
    name: user?.user_metadata?.full_name || "",
    email: user?.email || "",
    phone: "",
    device_type: "",
    brand_model: "",
    problem_description: "",
    urgency: "normal",
    province: "",
    address: "",
    preferred_date: "",
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const canNext = () => {
    if (step === 0) return !!form.device_type;
    if (step === 1) return form.problem_description.trim().length >= 20;
    if (step === 2) return form.name.trim() && form.email.trim() && form.phone.trim();
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        user_id: user?.id || null,
        name: form.name,
        email: form.email,
        phone: form.phone,
        device_type: form.device_type,
        brand_model: form.brand_model || null,
        problem_description: form.problem_description,
        urgency: form.urgency,
        province: form.province || null,
        address: form.address || null,
        preferred_date: form.preferred_date || null,
      };
      const { data, error } = await supabase.from("tech_support_requests").insert([payload]).select("id").single();
      if (error) throw error;
      setTicketId((data as any).id?.slice(0, 8).toUpperCase() || "XXXXX");
      setSuccess(true);
    } catch (err: any) {
      toast({ title: "Erro ao enviar pedido", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background">
        <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <main className="container mx-auto px-4 py-16 mt-20 max-w-lg text-center">
          <div className="w-24 h-24 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
          </div>
          <h1 className="text-3xl font-extrabold mb-2">Pedido recebido!</h1>
          <p className="text-muted-foreground mb-2">O teu pedido de assistência técnica foi registado com sucesso.</p>
          <div className="inline-flex items-center gap-2 bg-muted rounded-xl px-4 py-2 mb-6">
            <span className="text-sm text-muted-foreground">Nº do pedido:</span>
            <span className="font-mono font-bold text-primary">#{ticketId}</span>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5 text-left space-y-3 mb-8">
            <p className="font-semibold text-sm">O que acontece a seguir?</p>
            <div className="space-y-2">
              {["A nossa equipa vai analisar o teu pedido.", "Entraremos em contacto em até 24 horas.", "Receberás confirmação por email."].map((t, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">{i + 1}</span>
                  {t}
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => { setSuccess(false); setStep(0); setForm({ name: user?.user_metadata?.full_name || "", email: user?.email || "", phone: "", device_type: "", brand_model: "", problem_description: "", urgency: "normal", province: "", address: "", preferred_date: "" }); }}>
              Novo Pedido
            </Button>
            <Link to="/" className="flex-1">
              <Button className="w-full">Voltar ao Início</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <main className="mt-20">
        {/* Hero */}
        <div className="bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 text-white py-12">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="flex items-center gap-2 text-blue-200 text-sm mb-4">
              <Link to="/" className="hover:text-white transition-colors">Início</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span>Assistência Técnica</span>
            </div>
            <div className="flex items-start gap-5">
              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0 border border-white/20">
                <Wrench className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold mb-2">Assistência Técnica</h1>
                <p className="text-blue-200 max-w-xl">
                  Técnicos certificados ao teu serviço. Diagnóstico, reparação e manutenção de equipamentos eletrónicos em Angola.
                </p>
              </div>
            </div>
            {/* Trust badges */}
            <div className="flex items-center gap-6 mt-8 flex-wrap">
              {[
                { icon: Shield, label: "Garantia de serviço" },
                { icon: Clock, label: "Resposta em 24h" },
                { icon: Star, label: "Técnicos certificados" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-sm text-blue-100">
                  <Icon className="w-4 h-4 text-blue-300" />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="border-b border-border bg-muted/30">
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {HOW_IT_WORKS.map((s, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {s.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{s.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="container mx-auto px-4 py-10 max-w-2xl">
          {/* Step indicator */}
          <div className="flex items-center mb-8">
            {STEPS.map((s, i) => (
              <div key={i} className="flex items-center flex-1 last:flex-none">
                <div className={`flex items-center gap-2 ${i <= step ? "text-primary" : "text-muted-foreground"}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                    i < step ? "bg-primary border-primary text-primary-foreground" :
                    i === step ? "border-primary text-primary" : "border-muted-foreground/30"
                  }`}>
                    {i < step ? "✓" : i + 1}
                  </div>
                  <span className="text-xs font-semibold hidden sm:block">{s}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-px mx-2 ${i < step ? "bg-primary" : "bg-border"}`} />
                )}
              </div>
            ))}
          </div>

          <div className="bg-card rounded-3xl border border-border shadow-sm p-6 md:p-8">

            {/* Step 0 — Device type */}
            {step === 0 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold mb-1">Qual é o equipamento?</h2>
                  <p className="text-muted-foreground text-sm">Seleciona o tipo de dispositivo que precisa de assistência.</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {DEVICE_TYPES.map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => set("device_type", id)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all text-center ${
                        form.device_type === id
                          ? "border-primary bg-primary/5 shadow-sm scale-[1.02]"
                          : "border-border hover:border-primary/40 hover:bg-muted/40"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${form.device_type === id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-semibold leading-tight">{label}</span>
                    </button>
                  ))}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="brand_model">Marca / Modelo (opcional)</Label>
                  <Input
                    id="brand_model"
                    placeholder="Ex: Samsung Galaxy S21, Dell Inspiron 15..."
                    value={form.brand_model}
                    onChange={(e) => set("brand_model", e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Step 1 — Problem */}
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold mb-1">Qual é o problema?</h2>
                  <p className="text-muted-foreground text-sm">Descreve o que está a acontecer com o equipamento.</p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="desc">Descrição do Problema *</Label>
                  <Textarea
                    id="desc"
                    placeholder="Ex: O ecrã ficou partido após uma queda. O computador não liga. O telemóvel aquece em excesso e desliga sozinho..."
                    rows={5}
                    value={form.problem_description}
                    onChange={(e) => set("problem_description", e.target.value)}
                    className="resize-none"
                  />
                  <p className={`text-xs ${form.problem_description.length < 20 ? "text-muted-foreground" : "text-emerald-600"}`}>
                    {form.problem_description.length}/20 caracteres mínimos
                  </p>
                </div>
                <div>
                  <Label className="mb-2 block">Urgência</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {URGENCY_OPTIONS.map(({ id, label, desc, icon: Icon, color }) => (
                      <button
                        key={id}
                        onClick={() => set("urgency", id)}
                        className={`text-left p-3 rounded-xl border-2 transition-all ${
                          form.urgency === id ? color + " scale-[1.02] shadow-sm" : "border-border hover:border-primary/40"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <Icon className="w-4 h-4" />
                          <span className="font-semibold text-sm">{label}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Data preferida</Label>
                    <Input
                      type="date"
                      value={form.preferred_date}
                      onChange={(e) => set("preferred_date", e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Província</Label>
                    <select
                      value={form.province}
                      onChange={(e) => set("province", e.target.value)}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Seleciona a província</option>
                      {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2 — Contact */}
            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold mb-1">Os teus contactos</h2>
                  <p className="text-muted-foreground text-sm">Para podermos entrar em contacto e agendar a assistência.</p>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Nome completo *</Label>
                    <Input id="name" placeholder="João Silva" value={form.name} onChange={(e) => set("name", e.target.value)} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone">Telefone / WhatsApp *</Label>
                    <Input id="phone" placeholder="+244 9XX XXX XXX" value={form.phone} onChange={(e) => set("phone", e.target.value)} required />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" placeholder="joao@exemplo.ao" value={form.email} onChange={(e) => set("email", e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="address">Morada / Referência de localização</Label>
                  <Input id="address" placeholder="Ex: Rua X, Bairro Y, Luanda" value={form.address} onChange={(e) => set("address", e.target.value)} />
                </div>
              </div>
            )}

            {/* Step 3 — Confirmation */}
            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold mb-1">Confirma o pedido</h2>
                  <p className="text-muted-foreground text-sm">Verifica os dados antes de enviar.</p>
                </div>
                <div className="space-y-2 rounded-2xl bg-muted/40 border border-border overflow-hidden">
                  {[
                    { label: "Equipamento", value: DEVICE_TYPES.find(d => d.id === form.device_type)?.label },
                    { label: "Marca/Modelo", value: form.brand_model || "—" },
                    { label: "Problema", value: form.problem_description },
                    { label: "Urgência", value: URGENCY_OPTIONS.find(u => u.id === form.urgency)?.label },
                    { label: "Data preferida", value: form.preferred_date || "Flexível" },
                    { label: "Província", value: form.province || "—" },
                    { label: "Nome", value: form.name },
                    { label: "Telefone", value: form.phone },
                    { label: "Email", value: form.email },
                  ].map((r, i) => (
                    <div key={i} className={`flex gap-3 px-4 py-2.5 text-sm ${i % 2 === 1 ? "bg-muted/40" : ""}`}>
                      <span className="w-28 flex-shrink-0 text-muted-foreground font-medium">{r.label}</span>
                      <span className="font-semibold break-words">{r.value}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Ao submeter, aceitas os nossos Termos de Serviço. Os teus dados são tratados de forma confidencial.
                </p>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex gap-3 mt-6">
              {step > 0 && (
                <Button variant="outline" onClick={() => setStep((s) => s - 1)} className="flex-1">
                  ← Anterior
                </Button>
              )}
              {step < 3 ? (
                <Button
                  onClick={() => setStep((s) => s + 1)}
                  disabled={!canNext()}
                  className="flex-1 gap-2"
                >
                  Seguinte <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 border-0 text-white hover:opacity-90"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {submitting ? "A enviar..." : "Confirmar e Enviar"}
                </Button>
              )}
            </div>
          </div>

          {/* Contact alternatives */}
          <div className="mt-6 grid sm:grid-cols-3 gap-3">
            {[
              { icon: Phone, label: "Telefone", value: "+244 900 000 000" },
              { icon: Mail, label: "Email", value: "suporte@sinkera.ao" },
              { icon: MapPin, label: "Loja física", value: "Luanda, Angola" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">{label}</p>
                  <p className="text-xs font-semibold">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
