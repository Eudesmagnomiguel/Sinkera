import { Truck, ShieldCheck, Headphones, Lock } from "lucide-react";

const FEATURES = [
  {
    icon: Truck,
    title: "Envio Grátis",
    description: "Acima de 50.000 Kz",
    accent: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/40",
    border: "border-blue-100 dark:border-blue-900/50",
  },
  {
    icon: ShieldCheck,
    title: "Garantia Oficial",
    description: "12 meses em todos",
    accent: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    border: "border-emerald-100 dark:border-emerald-900/50",
  },
  {
    icon: Headphones,
    title: "Suporte 24/7",
    description: "Sempre disponível",
    accent: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-50 dark:bg-violet-950/40",
    border: "border-violet-100 dark:border-violet-900/50",
  },
  {
    icon: Lock,
    title: "Pagamento Seguro",
    description: "Multicaixa Express · Transferência",
    accent: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/40",
    border: "border-amber-100 dark:border-amber-900/50",
  },
];

export const FeaturesBar = () => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 my-6">
    {FEATURES.map(({ icon: Icon, title, description, accent, bg, border }) => (
      <div
        key={title}
        className={`flex items-center gap-3 px-4 py-4 rounded-2xl border ${border} bg-card dark:bg-card hover:shadow-sm transition-shadow`}
      >
        <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-5 h-5 ${accent}`} />
        </div>
        <div>
          <p className="font-bold text-foreground text-sm leading-tight">{title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>
      </div>
    ))}
  </div>
);
