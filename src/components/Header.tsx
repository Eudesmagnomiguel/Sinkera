import { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { ShoppingCart, Heart, User, Menu, Search, ChevronDown, Laptop, Monitor, HardDrive, Smartphone, Tv, Home, Headphones, LogOut, Shield, Phone, MapPin, Tag, Sun, Moon, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CategoryDrawer } from "./CategoryDrawer";
import { Link, useNavigate } from "react-router-dom";
import sinkeraLogo from "@/assets/sinkera-logo.png";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { NotificationBell } from "./NotificationBell";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const Header = ({ searchQuery, setSearchQuery }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user, signOut, isAdmin } = useAuth();
  const { items } = useCart();
  const { theme, setTheme } = useTheme();

  // ── Autocomplete ──────────────────────────────────────────────────────────
  const [suggestions, setSuggestions] = useState<{
    products: { id: string; name: string; image_url: string }[];
    brands:   { id: string; name: string }[];
    categories: { id: string; name: string; slug: string }[];
  }>({ products: [], brands: [], categories: [] });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) { setSuggestions({ products: [], brands: [], categories: [] }); return; }
    const timer = setTimeout(async () => {
      const like = `%${q}%`;
      const [p, b, c] = await Promise.all([
        supabase.from('products').select('id, name, image_url').ilike('name', like).eq('in_stock', true).limit(5),
        supabase.from('brands').select('id, name').ilike('name', like).limit(3),
        supabase.from('categories').select('id, name, slug').ilike('name', like).limit(3),
      ]);
      setSuggestions({ products: p.data || [], brands: b.data || [], categories: c.data || [] });
      setShowSuggestions(true);
    }, 220);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target as Node))
        setShowSuggestions(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const hasSuggestions = suggestions.products.length + suggestions.brands.length + suggestions.categories.length > 0;

  const goTo = (path: string) => {
    setShowSuggestions(false);
    navigate(path);
  };

  const categorySubmenus = {
    informatica: {
      name: "Informática",
      icon: Laptop,
      image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=300&fit=crop",
      columns: [
        {
          title: "Computadores Desktops",
          items: ["StandAlone", "Mini PC", "All-In-One", "Monitor + PC", "Ver todos os produtos"]
        },
        {
          title: "Computadores Portáteis",
          items: ["Portáteis Gaming", "Portáteis Casa e Escritório", "Ver todos os produtos"]
        },
        {
          title: "Acessórios e Periféricos",
          items: ["Bases, Apoios e Tapetes", "Cabos e Adaptadores", "Dockstation", "Ferramentas", "Memórias RAM", "Microfones", "Ratos e Teclados", "Transformadores", "Ver todos os produtos"]
        },
        {
          title: "Armazenamento +",
          items: ["Impressão +", "Redes e Internet +", "Software +", "Monitores +"]
        }
      ]
    },
    escritorio: {
      name: "Escritório e Papelaria",
      icon: Monitor,
      image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop",
      columns: [
        {
          title: "Material de Escritório",
          items: ["Papel e Blocos", "Canetas e Lápis", "Organização", "Ver todos os produtos"]
        },
        {
          title: "Equipamentos",
          items: ["Impressoras", "Calculadoras", "Destruidoras", "Ver todos os produtos"]
        }
      ]
    },
    electrodomesticos: {
      name: "Electrodomésticos",
      icon: HardDrive,
      image: "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=400&h=300&fit=crop",
      columns: [
        {
          title: "Cozinha",
          items: ["Micro-ondas", "Frigoríficos", "Fogões", "Ver todos os produtos"]
        },
        {
          title: "Limpeza",
          items: ["Aspiradores", "Máquinas de Lavar", "Ver todos os produtos"]
        }
      ]
    },
    smartphones: {
      name: "Smartphones e Tablets",
      icon: Smartphone,
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop",
      columns: [
        {
          title: "Smartphones",
          items: ["iPhone", "Samsung", "Xiaomi", "Huawei", "Ver todos os produtos"]
        },
        {
          title: "Tablets",
          items: ["iPad", "Samsung Tablets", "Android Tablets", "Ver todos os produtos"]
        },
        {
          title: "Acessórios",
          items: ["Capas e Películas", "Carregadores", "Fones de Ouvido", "Ver todos os produtos"]
        }
      ]
    },
    "tv-audio": {
      name: "Imagem e Som",
      icon: Tv,
      image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=300&fit=crop",
      columns: [
        {
          title: "Televisões",
          items: ["Smart TV", "LED", "OLED", "4K e 8K", "Ver todos os produtos"]
        },
        {
          title: "Áudio",
          items: ["Colunas", "Headphones", "Soundbars", "Sistemas de Som", "Ver todos os produtos"]
        },
        {
          title: "Fotografia",
          items: ["Câmaras Digitais", "Lentes", "Tripés", "Ver todos os produtos"]
        }
      ]
    },
    acessorios: {
      name: "Acessórios",
      icon: Headphones,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop",
      columns: [
        {
          title: "Áudio",
          items: ["Fones de Ouvido", "Earbuds", "Headphones", "Ver todos os produtos"]
        },
        {
          title: "Carregamento",
          items: ["Carregadores", "Powerbanks", "Cabos", "Ver todos os produtos"]
        },
        {
          title: "Proteção",
          items: ["Capas", "Películas", "Bolsas", "Ver todos os produtos"]
        },
        {
          title: "Casa Inteligente",
          items: ["Câmaras e Segurança", "Lâmpadas Inteligentes", "Tomadas Inteligentes", "Assistentes de Voz", "Ver todos os produtos"]
        }
      ]
    },
    beleza: {
      name: "Beleza e Cuidado Pessoal",
      icon: Sparkles,
      image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=300&fit=crop",
      columns: [
        {
          title: "Cuidado da Pele",
          items: ["Cremes e Hidratantes", "Séruns e Óleos", "Máscaras Faciais", "Protetor Solar", "Ver todos os produtos"]
        },
        {
          title: "Cuidado do Cabelo",
          items: ["Shampoo e Condicionador", "Óleos Capilares", "Extensões", "Relaxantes", "Ver todos os produtos"]
        },
        {
          title: "Maquilhagem",
          items: ["Base e Corretor", "Batom e Gloss", "Rímel e Delineador", "Paletes de Sombras", "Ver todos os produtos"]
        },
        {
          title: "Higiene e Bem-estar",
          items: ["Perfumes", "Desodorizantes", "Aparelhos de Barbear", "Vitaminas e Suplementos", "Ver todos os produtos"]
        }
      ]
    }
  };

  const categories = [
    { id: "promocoes", name: "Promoções", hasSubmenu: false },
    { id: "informatica", name: "Informática", hasSubmenu: true },
    { id: "escritorio", name: "Escritório e Papelaria", hasSubmenu: true },
    { id: "electrodomesticos", name: "Electrodomésticos", hasSubmenu: true },
    { id: "smartphones", name: "Smartphones e Tablets", hasSubmenu: true },
    { id: "tv-audio", name: "Imagem e Som", hasSubmenu: true },
    { id: "acessorios", name: "Acessórios", hasSubmenu: true },
    { id: "beleza", name: "Beleza e Cuidado Pessoal", hasSubmenu: true },
  ];

  return (
    <>
      <CategoryDrawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen} />

      <header className="sticky top-0 z-50 bg-background shadow-[0_2px_8px_rgba(0,0,0,0.08)]">

        {/* Promotional Top Bar */}
        <div className="bg-[hsl(221_83%_26%)] text-white/80 text-[11px] py-1.5 hidden sm:block">
          <div className="container mx-auto px-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                Envio grátis em compras acima de 50.000 Kz
              </span>
              <span className="text-white/60">|</span>
              <span className="text-white/60">Garantia de 12 meses em todos os produtos</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 text-white/60">
                <Phone className="w-3 h-3" />
                +244 900 000 000
              </span>
              <span className="text-white/60">|</span>
              <span className="flex items-center gap-1 text-white/60">
                <MapPin className="w-3 h-3" />
                Luanda, Angola
              </span>
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className="border-b border-border bg-background">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center gap-3 md:gap-6">

              {/* Logo */}
              <Link to="/" className="flex items-center flex-shrink-0">
                <img src={sinkeraLogo} alt="Sinkera" className="h-9 sm:h-10 w-auto" />
              </Link>

              {/* Search Bar */}
              <div ref={searchWrapRef} className="hidden sm:block flex-1 min-w-0 relative">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setShowSuggestions(false);
                    if (searchQuery.trim()) navigate(`/produtos?search=${encodeURIComponent(searchQuery.trim())}`);
                  }}
                  className="flex h-11"
                >
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => hasSuggestions && setShowSuggestions(true)}
                    placeholder="Pesquisar produtos, marcas e categorias..."
                    autoComplete="off"
                    className="flex-1 min-w-0 px-4 py-2.5 text-sm border border-input border-r-0 rounded-l-xl focus:outline-none focus:border-primary focus:ring-0 bg-background text-foreground placeholder:text-muted-foreground/60"
                  />
                  <button
                    type="submit"
                    className="flex items-center justify-center px-5 bg-[hsl(var(--cta-orange))] hover:bg-[hsl(var(--cta-orange-hover))] text-white rounded-r-xl transition-colors flex-shrink-0"
                  >
                    <Search className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                </form>

                {/* Autocomplete dropdown */}
                {showSuggestions && hasSuggestions && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-2xl z-[200] overflow-hidden">

                    {suggestions.products.length > 0 && (
                      <div>
                        <p className="px-4 pt-3 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Produtos</p>
                        {suggestions.products.map(p => (
                          <button
                            key={p.id}
                            onMouseDown={() => goTo(`/produto/${p.id}`)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50 transition-colors text-left"
                          >
                            <div className="w-9 h-9 rounded-lg bg-muted border border-border overflow-hidden flex-shrink-0">
                              <img src={p.image_url} alt={p.name} className="w-full h-full object-contain p-1" />
                            </div>
                            <span className="text-sm text-foreground truncate">{p.name}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {suggestions.brands.length > 0 && (
                      <div className="border-t border-border/60">
                        <p className="px-4 pt-3 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Marcas</p>
                        <div className="flex flex-wrap gap-2 px-4 pb-3">
                          {suggestions.brands.map(b => (
                            <button
                              key={b.id}
                              onMouseDown={() => goTo(`/produtos?search=${encodeURIComponent(b.name)}`)}
                              className="text-xs font-semibold px-3 py-1.5 rounded-full border border-border hover:border-primary hover:text-primary transition-colors"
                            >
                              {b.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {suggestions.categories.length > 0 && (
                      <div className="border-t border-border/60">
                        <p className="px-4 pt-3 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Categorias</p>
                        <div className="flex flex-wrap gap-2 px-4 pb-3">
                          {suggestions.categories.map(c => (
                            <button
                              key={c.id}
                              onMouseDown={() => goTo(`/produtos?category=${c.slug || c.id}`)}
                              className="text-xs font-semibold px-3 py-1.5 rounded-full border border-border hover:border-primary hover:text-primary transition-colors"
                            >
                              {c.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="border-t border-border/60 px-4 py-2.5">
                      <button
                        onMouseDown={() => { setShowSuggestions(false); if (searchQuery.trim()) navigate(`/produtos?search=${encodeURIComponent(searchQuery.trim())}`); }}
                        className="text-xs text-muted-foreground hover:text-primary transition-colors"
                      >
                        Ver todos os resultados para <strong>"{searchQuery}"</strong>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 sm:gap-2 md:gap-3 flex-shrink-0 ml-auto sm:ml-0">

                {/* Account */}
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="hidden lg:flex flex-col items-start text-xs text-muted-foreground hover:text-primary transition-colors px-2 py-1 rounded hover:bg-muted/50 min-w-0">
                        <span>Olá, {user.email?.split('@')[0]}</span>
                        <span className="flex items-center gap-1 font-semibold text-foreground text-sm">
                          Minha Conta
                          <ChevronDown className="w-3 h-3" />
                        </span>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {isAdmin && (
                        <>
                          <DropdownMenuItem asChild>
                            <Link to="/admin" className="flex items-center">
                              <Shield className="h-4 w-4 mr-2" />
                              Administração
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </>
                      )}
                      <DropdownMenuItem asChild>
                        <Link to="/perfil">Perfil</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/pedidos">Meus Pedidos</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => signOut()} className="text-red-600">
                        <LogOut className="h-4 w-4 mr-2" />
                        Sair
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Link
                    to="/auth"
                    className="hidden lg:flex flex-col items-start text-xs text-muted-foreground hover:text-primary transition-colors px-2 py-1 rounded hover:bg-muted/50"
                  >
                    <span>Entrar ou</span>
                    <span className="flex items-center gap-1 font-semibold text-foreground text-sm">
                      <User className="w-3.5 h-3.5" />
                      Registar
                    </span>
                  </Link>
                )}

                {/* Wishlist */}
                <Link
                  to="/favoritos"
                  className="hidden sm:flex flex-col items-center text-muted-foreground hover:text-primary transition-colors p-2 rounded-lg hover:bg-muted/50"
                >
                  <Heart className="w-5 h-5" />
                  <span className="text-[10px] hidden md:block mt-0.5">Favoritos</span>
                </Link>

                {/* Notifications */}
                {user && <NotificationBell />}

                {/* Dark mode toggle */}
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-muted transition-colors text-muted-foreground"
                  title={theme === "dark" ? "Modo claro" : "Modo noturno"}
                >
                  {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>

                {/* Cart */}
                <Link
                  to="/carrinho"
                  className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-3 sm:px-4 py-2 rounded-xl transition-colors"
                >
                  <div className="relative">
                    <ShoppingCart className="w-5 h-5" />
                    {items.length > 0 && (
                      <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
                        {items.length}
                      </span>
                    )}
                  </div>
                  <div className="hidden lg:block">
                    <div className="text-[10px] text-white/60 leading-tight">Carrinho</div>
                    <div className="text-sm font-semibold leading-tight">
                      {items.length > 0 ? `${items.length} item${items.length > 1 ? 's' : ''}` : 'Vazio'}
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Category Navigation Bar */}
        <div className="bg-[hsl(221_83%_20%)] border-b border-[hsl(221_83%_14%)]">
          <div className="container mx-auto px-4">
            <nav className="flex items-center overflow-x-auto lg:overflow-visible scrollbar-hide">

              {/* All Categories Button */}
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="flex items-center gap-2 px-4 py-3 bg-[hsl(var(--cta-orange))] hover:bg-[hsl(var(--cta-orange-hover))] text-white font-semibold text-sm whitespace-nowrap transition-colors flex-shrink-0"
              >
                <Menu className="w-4 h-4" />
                <span className="hidden md:inline">Todas as Categorias</span>
                <span className="md:hidden">Menu</span>
              </button>

              {/* Desktop Category Links */}
              <div className="hidden lg:flex items-center flex-1 relative">
                {categories.map((category, index) => (
                  <div
                    key={category.id}
                    className="relative"
                    onMouseEnter={() => category.hasSubmenu && setActiveSubmenu(category.id)}
                    onMouseLeave={() => setActiveSubmenu(null)}
                  >
                    <button
                      onClick={() => navigate(`/produtos?category=${category.id}`)}
                      className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors text-white/90 hover:text-white hover:bg-white/10 ${
                        category.id === 'promocoes' ? 'text-orange-300 hover:text-orange-200' : ''
                      }`}
                    >
                      {category.name}
                    </button>

                    {/* Submenu Dropdown */}
                    {category.hasSubmenu && activeSubmenu === category.id && categorySubmenus[category.id as keyof typeof categorySubmenus] && (
                      <div
                        className={`absolute top-full w-[800px] bg-card shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-border rounded-b-lg z-[100] p-8 mt-0 ${
                          index >= 4 ? 'right-0' : 'left-0'
                        }`}
                        onMouseEnter={() => setActiveSubmenu(category.id)}
                        onMouseLeave={() => setActiveSubmenu(null)}
                      >
                        <div className="flex gap-8">
                          {/* Category Header */}
                          <div className="w-56 border-r border-border/40 pr-8">
                            {(() => {
                              const submenu = categorySubmenus[category.id as keyof typeof categorySubmenus];
                              const Icon = submenu.icon;
                              return (
                                <>
                                  <div className="flex items-center gap-3 mb-4">
                                    <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center">
                                      <Icon className="w-5 h-5 text-primary" />
                                    </div>
                                    <h3 className="text-lg font-bold text-foreground">{submenu.name}</h3>
                                  </div>
                                  <img
                                    src={submenu.image}
                                    alt={submenu.name}
                                    className="w-full h-40 object-cover rounded-lg border border-border/40"
                                  />
                                  <button
                                    onClick={() => navigate(`/produtos?category=${category.id}`)}
                                    className="mt-3 w-full text-center text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                                  >
                                    Ver todos →
                                  </button>
                                </>
                              );
                            })()}
                          </div>

                          {/* Submenu Columns */}
                          <div className="flex-1 grid grid-cols-3 gap-6">
                            {categorySubmenus[category.id as keyof typeof categorySubmenus].columns.map((column, idx) => (
                              <div key={idx}>
                                <h4 className="font-bold text-foreground mb-3 text-sm border-b border-border/40 pb-2">
                                  {column.title}
                                </h4>
                                <ul className="space-y-1.5">
                                  {column.items.map((item, itemIdx) => (
                                    <li key={itemIdx}>
                                      <a
                                        href="#"
                                        className={`text-sm transition-colors block ${
                                          item.startsWith('Ver todos')
                                            ? 'text-primary font-semibold hover:text-primary/80'
                                            : 'text-muted-foreground hover:text-primary'
                                        }`}
                                      >
                                        {item}
                                      </a>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Mobile: show some categories */}
              <div className="flex lg:hidden items-center">
                {categories.slice(0, 4).map((category) => (
                  <button
                    key={category.id}
                    onClick={() => navigate(`/produtos?category=${category.id}`)}
                    className="px-3 py-3 text-xs font-medium whitespace-nowrap transition-colors text-white/90 hover:text-white hover:bg-white/10"
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </nav>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-border bg-background shadow-lg">
            <nav className="container mx-auto px-4 py-4">
              <div className="space-y-1">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => {
                      navigate(`/produtos?category=${category.id}`);
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-3 text-sm text-foreground hover:bg-primary/5 hover:text-primary rounded-lg transition-colors font-medium"
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </nav>
          </div>
        )}
      </header>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </>
  );
};
