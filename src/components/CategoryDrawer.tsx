import { useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  Monitor, FileText, Tv, Shield, Smartphone, Zap, Speaker,
  Gamepad2, Heart, ShoppingCart, User, ChevronRight, Wrench,
  Package, Headphones, Search, Star, Flame, TrendingUp, Percent,
  X, Home, LogIn, LayoutGrid,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";

interface CategoryDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MAIN_CATEGORIES = [
  {
    id: "informatica", name: "Informática", icon: Monitor,
    color: "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400",
    desc: "PCs, portáteis, acessórios",
    img: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=80&h=80&fit=crop",
  },
  {
    id: "smartphones", name: "Smartphones e Tablets", icon: Smartphone,
    color: "bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400",
    desc: "iPhone, Samsung, Xiaomi...",
    img: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=80&h=80&fit=crop",
  },
  {
    id: "tv-audio", name: "Imagem e Som", icon: Tv,
    color: "bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400",
    desc: "Smart TV, colunas, headphones",
    img: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=80&h=80&fit=crop",
  },
  {
    id: "electrodomesticos", name: "Electrodomésticos", icon: Home,
    color: "bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400",
    desc: "Cozinha, limpeza, casa",
    img: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=80&h=80&fit=crop",
  },
  {
    id: "casa-inteligente", name: "Casa Inteligente", icon: Zap,
    color: "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-600 dark:text-yellow-400",
    desc: "Automação, câmaras, sensores",
    img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=80&h=80&fit=crop",
  },
  {
    id: "games", name: "Jogos e Consolas", icon: Gamepad2,
    color: "bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400",
    desc: "PlayStation, Xbox, Nintendo",
    img: "https://images.unsplash.com/photo-1593118247619-e2d6f056869e?w=80&h=80&fit=crop",
  },
  {
    id: "seguranca", name: "Segurança Electrónica", icon: Shield,
    color: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400",
    desc: "Câmaras, alarmes, controlo",
    img: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=80&h=80&fit=crop",
  },
  {
    id: "acessorios", name: "Acessórios", icon: Headphones,
    color: "bg-pink-100 dark:bg-pink-900/40 text-pink-600 dark:text-pink-400",
    desc: "Fones, capas, carregadores",
    img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=80&h=80&fit=crop",
  },
  {
    id: "escritorio", name: "Escritório e Papelaria", icon: FileText,
    color: "bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400",
    desc: "Impressoras, material, etc",
    img: "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=80&h=80&fit=crop",
  },
  {
    id: "energia", name: "Energia Solar", icon: Zap,
    color: "bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400",
    desc: "Painéis solares, baterias",
    img: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=80&h=80&fit=crop",
  },
];

const SPECIAL = [
  { id: "destaques",    name: "Destaques",     icon: Star,       iconColor: "text-amber-500",  bg: "bg-amber-50  dark:bg-amber-950/40",  border: "border-amber-200  dark:border-amber-800/50" },
  { id: "mais-vendidos", name: "Mais Vendidos", icon: Flame,      iconColor: "text-red-500",    bg: "bg-red-50    dark:bg-red-950/40",    border: "border-red-200    dark:border-red-800/50" },
  { id: "tendencias",   name: "Tendências",    icon: TrendingUp, iconColor: "text-blue-500",   bg: "bg-blue-50   dark:bg-blue-950/40",   border: "border-blue-200   dark:border-blue-800/50" },
  { id: "promocoes",    name: "Promoções",     icon: Percent,    iconColor: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-950/40", border: "border-violet-200 dark:border-violet-800/50" },
];

export const CategoryDrawer = ({ open, onOpenChange }: CategoryDrawerProps) => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items } = useCart();

  const filteredCategories = MAIN_CATEGORIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.desc.toLowerCase().includes(search.toLowerCase())
  );

  const go = (path: string) => {
    navigate(path);
    onOpenChange(false);
    setSearch("");
  };

  return (
    <Sheet open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) setSearch(""); }}>
      <SheetContent side="left" className="w-[340px] sm:w-[380px] p-0 flex flex-col overflow-hidden">

        {/* Header */}
        <div className="bg-primary px-5 pt-5 pb-4 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <LayoutGrid className="w-5 h-5 text-primary-foreground" />
              <h2 className="text-lg font-bold text-primary-foreground">Todos os Produtos</h2>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="w-8 h-8 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-primary-foreground" />
            </button>
          </div>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-foreground/60" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pesquisar categoria..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-primary-foreground/15 text-primary-foreground placeholder-primary-foreground/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-foreground/30"
            />
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">

          {/* Special categories */}
          {!search && (
            <div className="p-4 border-b border-border">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-3 px-1">
                Em Destaque
              </p>
              <div className="grid grid-cols-2 gap-2">
                {SPECIAL.map(({ id, name, icon: Icon, iconColor, bg, border }) => (
                  <button
                    key={id}
                    onClick={() => go(`/produtos?category=${id}`)}
                    className={`flex items-center gap-2.5 px-3 py-3 rounded-xl border ${bg} ${border} hover:brightness-95 dark:hover:brightness-110 active:scale-[0.97] transition-all duration-150 text-left`}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 ${iconColor}`} />
                    <span className="text-sm font-semibold text-foreground leading-tight">{name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Main categories */}
          <div className="p-4">
            {!search && (
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2.5 px-1">
                Categorias
              </p>
            )}
            <nav className="space-y-0.5">
              {filteredCategories.length > 0 ? filteredCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => go(`/produtos?category=${cat.id}`)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted transition-all group text-left"
                >
                  <div className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 border border-border">
                    <img
                      src={(cat as any).img}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        const t = e.currentTarget as HTMLImageElement;
                        t.style.display = "none";
                        const parent = t.parentElement;
                        if (parent) {
                          parent.classList.add(...cat.color.split(" "), "flex", "items-center", "justify-center");
                        }
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold group-hover:text-primary transition-colors truncate">{cat.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{cat.desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-0.5 flex-shrink-0" />
                </button>
              )) : (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Nenhuma categoria encontrada.
                </div>
              )}
            </nav>
          </div>

          {/* Services */}
          {!search && (
            <div className="px-4 pb-4 border-t border-border pt-4">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2.5 px-1">
                Serviços
              </p>
              <nav className="space-y-0.5">
                {[
                  { name: "Assistência Técnica", icon: Wrench, path: "/assistencia" },
                  { name: "Acompanhar Encomenda", icon: Package, path: "/pedidos" },
                  { name: "Suporte ao Cliente", icon: Headphones, path: "#" },
                ].map(({ name, icon: Icon, path }) => (
                  <button
                    key={name}
                    onClick={() => go(path)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted transition-colors group text-left"
                  >
                    <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="text-sm text-foreground group-hover:text-primary transition-colors">{name}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground ml-auto" />
                  </button>
                ))}
              </nav>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-border p-4 bg-muted/30">
          {user ? (
            <div className="flex gap-2">
              <button onClick={() => go("/favoritos")} className="flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl hover:bg-muted transition-colors">
                <Heart className="w-5 h-5 text-muted-foreground" />
                <span className="text-[11px] text-muted-foreground">Favoritos</span>
              </button>
              <button onClick={() => go("/carrinho")} className="flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl hover:bg-muted transition-colors relative">
                <div className="relative">
                  <ShoppingCart className="w-5 h-5 text-muted-foreground" />
                  {items.length > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center">
                      {items.length}
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-muted-foreground">Carrinho</span>
              </button>
              <button onClick={() => go("/pedidos")} className="flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl hover:bg-muted transition-colors">
                <Package className="w-5 h-5 text-muted-foreground" />
                <span className="text-[11px] text-muted-foreground">Pedidos</span>
              </button>
              <button onClick={() => go("/perfil")} className="flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl hover:bg-muted transition-colors">
                <User className="w-5 h-5 text-muted-foreground" />
                <span className="text-[11px] text-muted-foreground">Perfil</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => go("/auth")}
              className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Entrar / Criar Conta
            </button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
