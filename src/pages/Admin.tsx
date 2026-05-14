import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { AdminProducts } from '@/components/admin/AdminProducts';
import { AdminOrders } from '@/components/admin/AdminOrders';
import { AdminUsers } from '@/components/admin/AdminUsers';
import { AdminNewsTrends } from '@/components/admin/AdminNewsTrends';
import { AdminCategories } from '@/components/admin/AdminCategories';
import { AdminBrands } from '@/components/admin/AdminBrands';
import { AdminBanners } from '@/components/admin/AdminBanners';
import { AdminVideos } from '@/components/admin/AdminVideos';
import { AdminPartners } from '@/components/admin/AdminPartners';
import { AdminSupport } from '@/components/admin/AdminSupport';
import { AdminCoupons } from '@/components/admin/AdminCoupons';
import { AdminPromoBanners } from '@/components/admin/AdminPromoBanners';
import { AdminCuration } from '@/components/admin/AdminCuration';
import { ResellerProducts } from '@/components/admin/ResellerProducts';
import { ResellerOrders } from '@/components/admin/ResellerOrders';
import { ResellerDashboard } from '@/components/admin/ResellerDashboard';
import {
  LayoutDashboard, Package, ShoppingCart, Users, Newspaper, Tags,
  Award, Image as ImageIcon, Video, Handshake, Menu, X, ChevronRight,
  LogOut, Settings, Bell, Wrench, Store, Tag, Megaphone, ClipboardCheck,
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────
type AdminSection =
  | 'dashboard' | 'orders' | 'products' | 'categories' | 'brands'
  | 'banners' | 'promobanners' | 'videos' | 'news' | 'users' | 'partners' | 'support' | 'coupons' | 'curation';

type ResellerSection = 'dashboard' | 'products' | 'orders';

interface NavItem {
  id: AdminSection;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

// ── Nav config ──────────────────────────────────────────────────────────────
const ADMIN_NAV: NavItem[] = [
  { id: 'dashboard',  label: 'Dashboard',      icon: LayoutDashboard },
  { id: 'orders',     label: 'Pedidos',         icon: ShoppingCart },
  { id: 'products',   label: 'Produtos',        icon: Package },
  { id: 'categories', label: 'Categorias',      icon: Tags },
  { id: 'brands',     label: 'Marcas',          icon: Award },
  { id: 'banners',      label: 'Banners',          icon: ImageIcon },
  { id: 'promobanners', label: 'Banners Promo',   icon: Megaphone },
  { id: 'videos',       label: 'Vídeos',           icon: Video },
  { id: 'news',       label: 'Notícias',        icon: Newspaper },
  { id: 'users',      label: 'Utilizadores',    icon: Users },
  { id: 'partners',   label: 'Parceiros',       icon: Handshake },
  { id: 'curation',   label: 'Curadoria',       icon: ClipboardCheck },
  { id: 'support',    label: 'Suporte',         icon: Wrench },
  { id: 'coupons',    label: 'Cupões',          icon: Tag },
];

const RESELLER_NAV = [
  { id: 'dashboard' as ResellerSection, label: 'Dashboard',     icon: LayoutDashboard },
  { id: 'products' as ResellerSection,  label: 'Meus Produtos', icon: Package },
  { id: 'orders' as ResellerSection,    label: 'Pedidos',       icon: ShoppingCart },
];

// ── Helpers ──────────────────────────────────────────────────────────────────
function SectionTitle({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-black text-foreground">{title}</h1>
      <p className="text-sm text-muted-foreground mt-0.5">{desc}</p>
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────────────
export default function Admin() {
  const { user, isAdmin, isReseller, signOut, loading: authLoading } = useAuth();
  const [adminSection, setAdminSection] = useState<AdminSection>('dashboard');
  const [resellerSection, setResellerSection] = useState<ResellerSection>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingPartners, setPendingPartners] = useState(0);
  const [pendingCuration, setPendingCuration] = useState(0);

  useEffect(() => {
    if (!isAdmin) return;
    (supabase as any)
      .from('partner_applications')
      .select('id', { count: 'exact' })
      .eq('status', 'pending')
      .then(({ count }: { count: number | null }) => setPendingPartners(count || 0));
    (supabase as any)
      .from('products')
      .select('id', { count: 'exact' })
      .eq('status', 'pending')
      .then(({ count }: { count: number | null }) => setPendingCuration(count || 0));
  }, [isAdmin]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || (!isAdmin && !isReseller)) return <Navigate to="/auth" replace />;

  const navItems: NavItem[] = ADMIN_NAV.map(item => {
    if (item.id === 'partners') return { ...item, badge: pendingPartners || undefined };
    if (item.id === 'curation') return { ...item, badge: pendingCuration || undefined };
    return item;
  });

  const goTo = (id: AdminSection) => {
    setAdminSection(id);
    setSidebarOpen(false);
    if (id === 'partners') setPendingPartners(0);
    if (id === 'curation') setPendingCuration(0);
  };

  // ── Sidebar component ─────────────────────────────────────────────────────
  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <aside className={`flex flex-col bg-card border-r border-border h-full ${mobile ? '' : 'w-64'}`}>
      {/* Logo */}
      <div className="px-5 py-5 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
            <Store className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-black text-foreground leading-tight">Sinkera</p>
            <p className="text-[10px] text-muted-foreground font-medium">
              {isAdmin ? 'Administração' : 'Revendedor'}
            </p>
          </div>
        </div>
        {mobile && (
          <button onClick={() => setSidebarOpen(false)} className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
        {isAdmin ? (
          <>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-2 py-1.5">Gestão</p>
            {navItems.slice(0, 5).map(({ id, label, icon: Icon, badge }) => (
              <NavBtn key={id} id={id} label={label} Icon={Icon} badge={badge} current={adminSection} onClick={goTo} />
            ))}
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-2 py-1.5 mt-2">Conteúdo</p>
            {navItems.slice(5, 9).map(({ id, label, icon: Icon, badge }) => (
              <NavBtn key={id} id={id} label={label} Icon={Icon} badge={badge} current={adminSection} onClick={goTo} />
            ))}
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-2 py-1.5 mt-2">Comunidade</p>
            {navItems.slice(9).map(({ id, label, icon: Icon, badge }) => (
              <NavBtn key={id} id={id} label={label} Icon={Icon} badge={badge} current={adminSection} onClick={goTo} />
            ))}
          </>
        ) : (
          RESELLER_NAV.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => { setResellerSection(id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                resellerSection === id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </button>
          ))
        )}
      </nav>

      {/* User footer */}
      <div className="border-t border-border p-3">
        <div className="flex items-center gap-2.5 px-2 py-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-primary">
              {user.email?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-foreground truncate">{user.email}</p>
            <p className="text-[10px] text-muted-foreground">{isAdmin ? 'Administrador' : 'Revendedor'}</p>
          </div>
          <button
            onClick={signOut}
            className="w-7 h-7 rounded-lg hover:bg-destructive/10 hover:text-destructive flex items-center justify-center text-muted-foreground transition-colors"
            title="Sair"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );

  // ── Content router ────────────────────────────────────────────────────────
  const renderAdminContent = () => {
    switch (adminSection) {
      case 'dashboard':  return <><SectionTitle title="Dashboard" desc="Visão geral da loja e métricas em tempo real" /><AdminDashboard /></>;
      case 'orders':     return <><SectionTitle title="Pedidos" desc="Gerir e acompanhar todas as encomendas" /><AdminOrders /></>;
      case 'products':   return <><SectionTitle title="Produtos" desc="Catálogo completo — adicionar, editar e remover produtos" /><AdminProducts /></>;
      case 'categories': return <><SectionTitle title="Categorias" desc="Organizar produtos por categorias" /><AdminCategories /></>;
      case 'brands':     return <><SectionTitle title="Marcas" desc="Gerir marcas e logos em destaque" /><AdminBrands /></>;
      case 'banners':      return <><SectionTitle title="Banners" desc="Imagens promocionais da página inicial" /><AdminBanners /></>;
      case 'promobanners': return <><SectionTitle title="Banners de Promoção" desc="Banners da secção Promoções Ativas — cor de fundo editável" /><AdminPromoBanners /></>;
      case 'videos':     return <><SectionTitle title="Vídeos em Destaque" desc="Os 4 slots de vídeo na página inicial" /><AdminVideos /></>;
      case 'news':       return <><SectionTitle title="Notícias & Tendências" desc="Artigos e conteúdo editorial" /><AdminNewsTrends /></>;
      case 'users':      return <><SectionTitle title="Utilizadores" desc="Gerir contas, roles e permissões" /><AdminUsers /></>;
      case 'partners':   return <AdminPartners />;
      case 'curation':   return <><SectionTitle title="Curadoria de Parceiros" desc="Aprovar ou rejeitar produtos submetidos pelos parceiros" /><AdminCuration /></>;
      case 'support':    return <><SectionTitle title="Suporte Técnico" desc="Gerir pedidos de assistência técnica" /><AdminSupport /></>;
      case 'coupons':    return <><SectionTitle title="Cupões" desc="Criar e gerir cupões de desconto" /><AdminCoupons /></>;
      default:           return null;
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 dark:bg-background flex">

      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-col w-64 h-screen sticky top-0 flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-64 h-full shadow-2xl">
            <Sidebar mobile />
          </div>
          <div className="flex-1 bg-black/50" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar */}
        <header className="sticky top-0 z-40 bg-card/80 backdrop-blur border-b border-border px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">
                {isAdmin ? 'Painel Admin' : 'Painel Revendedor'}
              </span>
              {isAdmin && (
                <>
                  <ChevronRight className="w-3.5 h-3.5" />
                  <span className="text-foreground">
                    {navItems.find(n => n.id === adminSection)?.label ?? ''}
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && pendingPartners > 0 && (
              <button
                onClick={() => goTo('partners')}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors"
              >
                <Bell className="w-3.5 h-3.5" />
                {pendingPartners} candidatura{pendingPartners !== 1 ? 's' : ''} pendente{pendingPartners !== 1 ? 's' : ''}
              </button>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6">
          {isAdmin ? renderAdminContent() : (
            <>
              {resellerSection === 'dashboard' && (
                <><SectionTitle title="Dashboard" desc="Visão geral das suas vendas e desempenho" /><ResellerDashboard /></>
              )}
              {resellerSection === 'products' && (
                <><SectionTitle title="Meus Produtos" desc="Gerir o seu catálogo de produtos" /><ResellerProducts /></>
              )}
              {resellerSection === 'orders' && (
                <><SectionTitle title="Pedidos" desc="Acompanhar e rastrear as suas encomendas" /><ResellerOrders /></>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

// ── NavBtn helper ──────────────────────────────────────────────────────────
function NavBtn({
  id, label, Icon, badge, current, onClick,
}: {
  id: AdminSection;
  label: string;
  Icon: React.ElementType;
  badge?: number;
  current: AdminSection;
  onClick: (id: AdminSection) => void;
}) {
  const active = current === id;
  return (
    <button
      onClick={() => onClick(id)}
      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
        active
          ? 'bg-primary text-primary-foreground shadow-sm'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      }`}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      <span className="flex-1 text-left">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${active ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-amber-500 text-white'}`}>
          {badge}
        </span>
      )}
    </button>
  );
}
