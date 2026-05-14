import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import sinkeraLogoWhite from '@/assets/sinkera-logo-white.png';
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
import { AdminNotifications } from '@/components/admin/AdminNotifications';
import { ResellerProducts } from '@/components/admin/ResellerProducts';
import { ResellerOrders } from '@/components/admin/ResellerOrders';
import { ResellerDashboard } from '@/components/admin/ResellerDashboard';
import {
  LayoutDashboard, Package, ShoppingCart, Users, Newspaper, Tags,
  Award, Image as ImageIcon, Video, Handshake, Menu, X, ChevronRight,
  LogOut, Bell, Wrench, Tag, Megaphone, ClipboardCheck, Send, Sun, Moon,
} from 'lucide-react';

// ── Palette ──────────────────────────────────────────────────────────────────
const BG_SIDEBAR  = 'hsl(222 47% 4%)';
const BG_MAIN     = 'hsl(222 47% 7%)';
const BORDER      = 'rgba(255,255,255,0.07)';
const ORANGE      = 'hsl(22 100% 46%)';

// ── Types ─────────────────────────────────────────────────────────────────────
type AdminSection =
  | 'dashboard' | 'orders' | 'products' | 'categories' | 'brands'
  | 'banners' | 'promobanners' | 'videos' | 'news' | 'users'
  | 'partners' | 'support' | 'coupons' | 'curation' | 'notifications';

type ResellerSection = 'dashboard' | 'products' | 'orders';

interface NavItem { id: AdminSection; label: string; icon: React.ElementType; badge?: number; }

// ── Nav config ────────────────────────────────────────────────────────────────
const ADMIN_NAV: NavItem[] = [
  { id: 'dashboard',     label: 'Dashboard',          icon: LayoutDashboard },
  { id: 'orders',        label: 'Pedidos',             icon: ShoppingCart    },
  { id: 'products',      label: 'Produtos',            icon: Package         },
  { id: 'categories',    label: 'Categorias',          icon: Tags            },
  { id: 'brands',        label: 'Marcas',              icon: Award           },
  { id: 'banners',       label: 'Banners',             icon: ImageIcon       },
  { id: 'promobanners',  label: 'Banners Promo',       icon: Megaphone       },
  { id: 'videos',        label: 'Vídeos',              icon: Video           },
  { id: 'news',          label: 'Notícias',            icon: Newspaper       },
  { id: 'users',         label: 'Utilizadores',        icon: Users           },
  { id: 'partners',      label: 'Parceiros',           icon: Handshake       },
  { id: 'curation',      label: 'Curadoria',           icon: ClipboardCheck  },
  { id: 'notifications', label: 'Notificações',        icon: Send            },
  { id: 'support',       label: 'Suporte',             icon: Wrench          },
  { id: 'coupons',       label: 'Cupões',              icon: Tag             },
];

const RESELLER_NAV = [
  { id: 'dashboard' as ResellerSection, label: 'Dashboard',     icon: LayoutDashboard },
  { id: 'products'  as ResellerSection, label: 'Meus Produtos', icon: Package         },
  { id: 'orders'    as ResellerSection, label: 'Pedidos',       icon: ShoppingCart    },
];

// ── Nav group label ───────────────────────────────────────────────────────────
function NavGroup({ label }: { label: string }) {
  return (
    <p className="px-4 pt-5 pb-1.5 text-[9px] font-bold tracking-[0.25em] uppercase"
       style={{ color: 'rgba(255,255,255,0.22)' }}>
      {label}
    </p>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Admin() {
  const { user, isAdmin, isReseller, signOut, loading: authLoading } = useAuth();
  const [adminSection,    setAdminSection]    = useState<AdminSection>('dashboard');
  const [resellerSection, setResellerSection] = useState<ResellerSection>('dashboard');
  const [sidebarOpen,     setSidebarOpen]     = useState(false);
  const [pendingPartners, setPendingPartners] = useState(0);
  const [pendingCuration, setPendingCuration] = useState(0);
  const [darkMode,        setDarkMode]        = useState(() => localStorage.getItem('admin_theme') !== 'light');

  const toggleTheme = () => {
    setDarkMode(d => {
      const next = !d;
      localStorage.setItem('admin_theme', next ? 'dark' : 'light');
      return next;
    });
  };

  useEffect(() => {
    if (!isAdmin) return;
    (supabase as any)
      .from('partner_applications').select('id', { count: 'exact' }).eq('status', 'pending')
      .then(({ count }: any) => setPendingPartners(count || 0));
    (supabase as any)
      .from('products').select('id', { count: 'exact' }).eq('status', 'pending')
      .then(({ count }: any) => setPendingCuration(count || 0));
  }, [isAdmin]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: BG_MAIN }}>
        <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
             style={{ borderColor: `${ORANGE} transparent transparent transparent` }} />
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

  // ── Sidebar ───────────────────────────────────────────────────────────────
  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <aside className="flex flex-col h-full" style={{ background: BG_SIDEBAR }}>

      {/* Logo block */}
      <div className="px-6 py-6 flex items-center justify-between"
           style={{ borderBottom: `1px solid ${BORDER}` }}>
        <div className="space-y-2">
          <img src={sinkeraLogoWhite} alt="Sinkera" className="h-6 w-auto opacity-90" />
          <p className="text-[9px] font-bold tracking-[0.28em] uppercase"
             style={{ color: ORANGE }}>
            {isAdmin ? 'Administração' : 'Parceiro'}
          </p>
        </div>
        {mobile && (
          <button onClick={() => setSidebarOpen(false)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                  style={{ color: 'rgba(255,255,255,0.4)' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'white'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}>
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2 px-3">
        {isAdmin ? (
          <>
            <NavGroup label="Gestão" />
            {navItems.slice(0, 5).map(item => (
              <AdminNavBtn key={item.id} item={item} current={adminSection} onClick={goTo} />
            ))}
            <NavGroup label="Conteúdo" />
            {navItems.slice(5, 9).map(item => (
              <AdminNavBtn key={item.id} item={item} current={adminSection} onClick={goTo} />
            ))}
            <NavGroup label="Comunidade" />
            {navItems.slice(9).map(item => (
              <AdminNavBtn key={item.id} item={item} current={adminSection} onClick={goTo} />
            ))}
          </>
        ) : (
          <>
            <NavGroup label="Menu" />
            {RESELLER_NAV.map(({ id, label, icon: Icon }) => {
              const active = resellerSection === id;
              return (
                <button
                  key={id}
                  onClick={() => { setResellerSection(id); setSidebarOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all relative"
                  style={{
                    color:      active ? 'white' : 'rgba(255,255,255,0.45)',
                    background: active ? 'rgba(255,255,255,0.06)' : 'transparent',
                    borderLeft: active ? `2px solid ${ORANGE}` : '2px solid transparent',
                    borderRadius: 8,
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.color = 'rgba(255,255,255,0.75)'; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; }}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {label}
                </button>
              );
            })}
          </>
        )}
      </nav>

      {/* User footer */}
      <div className="p-4" style={{ borderTop: `1px solid ${BORDER}` }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
               style={{ background: 'rgba(255,255,255,0.08)', border: `1px solid ${BORDER}` }}>
            <span className="text-xs font-bold" style={{ color: ORANGE }}>
              {user.email?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate" style={{ color: 'rgba(255,255,255,0.75)' }}>
              {user.email}
            </p>
            <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
              {isAdmin ? 'Administrador' : 'Revendedor'}
            </p>
          </div>
          <button
            onClick={signOut}
            title="Sair"
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors flex-shrink-0"
            style={{ color: 'rgba(255,255,255,0.3)' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.3)'; e.currentTarget.style.background = 'transparent'; }}
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
      case 'dashboard':     return <><PageHeader title="Dashboard"             sub="Visão geral da loja e métricas em tempo real" /><AdminDashboard /></>;
      case 'orders':        return <><PageHeader title="Pedidos"               sub="Gerir e acompanhar todas as encomendas" /><AdminOrders /></>;
      case 'products':      return <><PageHeader title="Produtos"              sub="Catálogo completo — adicionar, editar e remover produtos" /><AdminProducts /></>;
      case 'categories':    return <><PageHeader title="Categorias"            sub="Organizar produtos por categorias" /><AdminCategories /></>;
      case 'brands':        return <><PageHeader title="Marcas"                sub="Gerir marcas e logos em destaque" /><AdminBrands /></>;
      case 'banners':       return <><PageHeader title="Banners"               sub="Imagens promocionais da página inicial" /><AdminBanners /></>;
      case 'promobanners':  return <><PageHeader title="Banners de Promoção"   sub="Banners da secção Promoções Ativas — cor de fundo editável" /><AdminPromoBanners /></>;
      case 'videos':        return <><PageHeader title="Vídeos em Destaque"    sub="Os 4 slots de vídeo na página inicial" /><AdminVideos /></>;
      case 'news':          return <><PageHeader title="Notícias & Tendências" sub="Artigos e conteúdo editorial" /><AdminNewsTrends /></>;
      case 'users':         return <><PageHeader title="Utilizadores"          sub="Gerir contas, roles e permissões" /><AdminUsers /></>;
      case 'partners':      return <AdminPartners />;
      case 'curation':      return <><PageHeader title="Curadoria"             sub="Aprovar ou rejeitar produtos submetidos pelos parceiros" /><AdminCuration /></>;
      case 'notifications': return <><PageHeader title="Notificações"          sub="Enviar notificações in-app para clientes e parceiros" /><AdminNotifications /></>;
      case 'support':       return <><PageHeader title="Suporte Técnico"       sub="Gerir pedidos de assistência técnica" /><AdminSupport /></>;
      case 'coupons':       return <><PageHeader title="Cupões"                sub="Criar e gerir cupões de desconto" /><AdminCoupons /></>;
      default:              return null;
    }
  };

  const currentLabel = isAdmin
    ? navItems.find(n => n.id === adminSection)?.label
    : RESELLER_NAV.find(n => n.id === resellerSection)?.label;

  return (
    <div className={`${darkMode ? 'dark' : ''} min-h-screen flex bg-background`} style={{ background: darkMode ? BG_MAIN : undefined }}>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-col w-60 h-screen sticky top-0 flex-shrink-0">
        <SidebarContent />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-60 h-full shadow-2xl">
            <SidebarContent mobile />
          </div>
          <div className="flex-1 bg-black/60" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar */}
        <header className="sticky top-0 z-40 h-14 px-4 sm:px-6 flex items-center justify-between gap-4"
                style={{ background: BG_SIDEBAR, borderBottom: `1px solid ${BORDER}` }}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              style={{ color: 'rgba(255,255,255,0.5)' }}
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-sm"
                 style={{ color: 'rgba(255,255,255,0.35)' }}>
              <span className="font-semibold" style={{ color: 'rgba(255,255,255,0.6)' }}>
                {isAdmin ? 'Admin' : 'Parceiro'}
              </span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span style={{ color: 'rgba(255,255,255,0.85)' }}>{currentLabel}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && pendingPartners > 0 && (
              <button
                onClick={() => goTo('partners')}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.25)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(245,158,11,0.2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(245,158,11,0.12)'}
              >
                <Bell className="w-3.5 h-3.5" />
                {pendingPartners} pendente{pendingPartners !== 1 ? 's' : ''}
              </button>
            )}

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              title={darkMode ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
              style={{ color: 'rgba(255,255,255,0.45)', border: `1px solid ${BORDER}` }}
              onMouseEnter={e => { e.currentTarget.style.color = 'white'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; e.currentTarget.style.background = 'transparent'; }}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {isAdmin ? renderAdminContent() : (
            <>
              {resellerSection === 'dashboard' && <ResellerDashboard />}
              {resellerSection === 'products'  && <ResellerProducts />}
              {resellerSection === 'orders'    && <ResellerOrders />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

// ── AdminNavBtn ───────────────────────────────────────────────────────────────
function AdminNavBtn({ item, current, onClick }: {
  item: NavItem;
  current: AdminSection;
  onClick: (id: AdminSection) => void;
}) {
  const { id, label, icon: Icon, badge } = item;
  const active = current === id;

  return (
    <button
      onClick={() => onClick(id)}
      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all"
      style={{
        color:        active ? 'white' : 'rgba(255,255,255,0.42)',
        background:   active ? 'rgba(255,255,255,0.06)' : 'transparent',
        borderLeft:   active ? `2px solid ${ORANGE}` : '2px solid transparent',
        borderRadius: 8,
      }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.color = 'rgba(255,255,255,0.72)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; } }}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.color = 'rgba(255,255,255,0.42)'; e.currentTarget.style.background = 'transparent'; } }}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      <span className="flex-1 text-left">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
              style={{ background: active ? 'rgba(255,255,255,0.15)' : ORANGE, color: 'white' }}>
          {badge}
        </span>
      )}
    </button>
  );
}

// ── PageHeader ────────────────────────────────────────────────────────────────
function PageHeader({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="mb-8">
      <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-muted-foreground mb-1">
        Sinkera Admin
      </p>
      <h1 className="text-2xl font-black text-foreground tracking-tight">{title}</h1>
      <p className="text-sm text-muted-foreground mt-0.5">{sub}</p>
    </div>
  );
}
