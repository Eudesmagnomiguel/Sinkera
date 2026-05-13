import React from "react";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { CartProvider } from "@/hooks/useCart";
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
import { CompareBar } from "./components/CompareBar";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider>
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <CompareBar />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/produtos" element={<Products />} />
              <Route path="/produto/:id" element={<ProductDetails />} />
              <Route path="/noticias" element={<News />} />
              <Route path="/news/:id" element={<NewsDetails />} />
              <Route path="/perfil" element={<Profile />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/carrinho" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/pedidos" element={<MyOrders />} />
              <Route path="/favoritos" element={<Wishlist />} />
              <Route path="/assistencia" element={<TechSupport />} />
              <Route path="/pesquisa" element={<Search />} />
              <Route path="/comparar" element={<Compare />} />
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
