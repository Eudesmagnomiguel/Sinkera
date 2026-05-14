import React, { useEffect, useState } from "react";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { CartProvider } from "@/hooks/useCart";
import { supabase } from "@/integrations/supabase/client";
import { OnboardingModal } from "@/components/OnboardingModal";
import { CookieConsent } from "@/components/CookieConsent";
import Index from "./pages/Index";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import News from "./pages/News";
import NewsDetails from "./pages/NewsDetails";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import MyOrders from "./pages/MyOrders";
import Wishlist from "./pages/Wishlist";
import TechSupport from "./pages/TechSupport";
import Search from "./pages/Search";
import NotFound from "./pages/NotFound";
import Compare from "./pages/Compare";
import Partners from "./pages/Partners";
import Privacidade from "./pages/Privacidade";
import Termos from "./pages/Termos";
import { CompareBar } from "./components/CompareBar";

const queryClient = new QueryClient();

// Shows onboarding to new regular users only (not admin/reseller)
function OnboardingGate() {
  const { user, isAdmin, isReseller, loading } = useAuth();
  const location = useLocation();
  const [show, setShow] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user || isAdmin || isReseller) { setChecked(true); return; }
    if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/auth')) {
      setChecked(true); return;
    }
    supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data && !(data as any).onboarding_completed) setShow(true);
        setChecked(true);
      });
  }, [user?.id, loading, isAdmin, isReseller]);

  if (!show || !checked) return null;
  return <OnboardingModal onComplete={() => setShow(false)} />;
}

// Blocks admin/reseller from accessing the store — sends them to their panel
function StoreGuard({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, isReseller, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user && (isAdmin || isReseller)) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}

const App = () => (
  <ThemeProvider>
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <OnboardingGate />
            <CookieConsent />
            <CompareBar />
            <Routes>
              {/* ── Store (customers only) ── */}
              <Route path="/" element={<StoreGuard><Index /></StoreGuard>} />
              <Route path="/produtos" element={<StoreGuard><Products /></StoreGuard>} />
              <Route path="/produto/:id" element={<StoreGuard><ProductDetails /></StoreGuard>} />
              <Route path="/noticias" element={<StoreGuard><News /></StoreGuard>} />
              <Route path="/news/:id" element={<StoreGuard><NewsDetails /></StoreGuard>} />
              <Route path="/perfil" element={<StoreGuard><Profile /></StoreGuard>} />
              <Route path="/carrinho" element={<StoreGuard><Cart /></StoreGuard>} />
              <Route path="/checkout" element={<StoreGuard><Checkout /></StoreGuard>} />
              <Route path="/pedidos" element={<StoreGuard><MyOrders /></StoreGuard>} />
              <Route path="/favoritos" element={<StoreGuard><Wishlist /></StoreGuard>} />
              <Route path="/assistencia" element={<StoreGuard><TechSupport /></StoreGuard>} />
              <Route path="/pesquisa" element={<StoreGuard><Search /></StoreGuard>} />
              <Route path="/comparar" element={<StoreGuard><Compare /></StoreGuard>} />
              <Route path="/parceiros" element={<StoreGuard><Partners /></StoreGuard>} />

              {/* ── Legal (public) ── */}
              <Route path="/privacidade" element={<Privacidade />} />
              <Route path="/termos" element={<Termos />} />

              {/* ── Auth (redirects by role after login) ── */}
              <Route path="/auth" element={<Auth />} />

              {/* ── Admin / Reseller panel ── */}
              <Route path="/admin" element={<Admin />} />

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
  </ThemeProvider>
);

export default App;
