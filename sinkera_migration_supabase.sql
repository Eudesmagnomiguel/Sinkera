-- =============================================================================
-- SINKERA PLATAFORMA — Migração Completa para Supabase
-- =============================================================================
-- Gerado em: 2026-05-05
-- Descrição: Script completo para criar toda a estrutura da base de dados
--            Sinkera numa nova instância Supabase.
--
-- INSTRUÇÕES:
--   1. No painel do Supabase, acede a SQL Editor
--   2. Cola este script completo e executa
--   3. O script é idempotente (usa IF NOT EXISTS onde possível)
-- =============================================================================


-- =============================================================================
-- EXTENSÕES NECESSÁRIAS
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA extensions;


-- =============================================================================
-- SECÇÃO 1: TIPOS PERSONALIZADOS (ENUMS)
-- =============================================================================

DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'user', 'reseller');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;


-- =============================================================================
-- SECÇÃO 2: FUNÇÕES AUXILIARES
-- =============================================================================

-- Função: atualizar coluna updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Função: verificar se um utilizador tem determinado papel
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$$;

-- Função: criar perfil e atribuir papel quando um novo utilizador se regista
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');

  RETURN NEW;
END;
$$;

-- Função: reduzir stock quando um item de encomenda é criado
CREATE OR REPLACE FUNCTION public.reduce_stock_on_order()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.products
  SET
    stock_quantity = GREATEST(0, COALESCE(stock_quantity, 0) - NEW.quantity),
    in_stock = CASE
      WHEN GREATEST(0, COALESCE(stock_quantity, 0) - NEW.quantity) > 0 THEN true
      ELSE false
    END
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$;

-- Função: atualizar rating do produto após avaliação
CREATE OR REPLACE FUNCTION public.update_product_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.products
  SET
    rating       = (SELECT AVG(rating)   FROM public.reviews WHERE product_id = NEW.product_id),
    reviews_count = (SELECT COUNT(*)      FROM public.reviews WHERE product_id = NEW.product_id)
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$;

-- Função: verificar se uma encomenda pertence a um utilizador (sem recursão RLS)
CREATE OR REPLACE FUNCTION public.order_belongs_to_user(p_order_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.orders
    WHERE id = p_order_id AND user_id = p_user_id
  );
$$;


-- =============================================================================
-- SECÇÃO 3: TABELAS PRINCIPAIS
-- =============================================================================

-- Tabela: profiles (perfis de utilizadores)
CREATE TABLE IF NOT EXISTS public.profiles (
  id         uuid NOT NULL,
  email      text NOT NULL,
  full_name  text,
  phone      text,
  avatar_url text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Tabela: user_roles (papéis dos utilizadores)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id         uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
  user_id    uuid NOT NULL,
  role       public.app_role NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT user_roles_pkey PRIMARY KEY (id),
  CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role),
  CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Tabela: categories (categorias de produtos)
CREATE TABLE IF NOT EXISTS public.categories (
  id          uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
  name        text NOT NULL,
  slug        text NOT NULL,
  description text,
  image_url   text,
  created_at  timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT categories_pkey     PRIMARY KEY (id),
  CONSTRAINT categories_name_key UNIQUE (name),
  CONSTRAINT categories_slug_key UNIQUE (slug)
);

-- Tabela: brands (marcas)
CREATE TABLE IF NOT EXISTS public.brands (
  id         uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
  name       text NOT NULL,
  slug       text NOT NULL,
  logo_url   text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT brands_pkey     PRIMARY KEY (id),
  CONSTRAINT brands_name_key UNIQUE (name),
  CONSTRAINT brands_slug_key UNIQUE (slug)
);

-- Tabela: products (produtos)
CREATE TABLE IF NOT EXISTS public.products (
  id               uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
  name             text NOT NULL,
  description      text,
  price            numeric(10,2) NOT NULL,
  original_price   numeric(10,2),
  category_id      uuid,
  brand_id         uuid,
  image_url        text NOT NULL,
  images           text[] DEFAULT '{}'::text[],
  rating           numeric(2,1),
  reviews_count    integer DEFAULT 0,
  in_stock         boolean DEFAULT true,
  stock_quantity   integer DEFAULT 0,
  badge            text,
  specifications   jsonb DEFAULT '{}'::jsonb,
  is_featured      boolean DEFAULT false,
  is_bestseller    boolean DEFAULT false,
  is_special_offer boolean DEFAULT false,
  is_trending      boolean DEFAULT false,
  seller_id        uuid,
  created_at       timestamp with time zone DEFAULT now() NOT NULL,
  updated_at       timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT products_pkey          PRIMARY KEY (id),
  CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id),
  CONSTRAINT products_brand_id_fkey    FOREIGN KEY (brand_id)    REFERENCES public.brands(id),
  CONSTRAINT products_seller_id_fkey   FOREIGN KEY (seller_id)   REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Tabela: orders (encomendas)
CREATE TABLE IF NOT EXISTS public.orders (
  id               uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
  user_id          uuid NOT NULL,
  total_amount     numeric(10,2) NOT NULL,
  status           text DEFAULT 'pending'::text NOT NULL,
  shipping_address jsonb NOT NULL,
  payment_method   text NOT NULL,
  created_at       timestamp with time zone DEFAULT now() NOT NULL,
  updated_at       timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT orders_pkey        PRIMARY KEY (id),
  CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Tabela: order_items (itens das encomendas)
CREATE TABLE IF NOT EXISTS public.order_items (
  id         uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
  order_id   uuid NOT NULL,
  product_id uuid NOT NULL,
  quantity   integer NOT NULL,
  price      numeric(10,2) NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT order_items_pkey          PRIMARY KEY (id),
  CONSTRAINT order_items_order_id_fkey   FOREIGN KEY (order_id)   REFERENCES public.orders(id)   ON DELETE CASCADE,
  CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);

-- Tabela: cart (carrinho de compras)
CREATE TABLE IF NOT EXISTS public.cart (
  id         uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
  user_id    uuid NOT NULL,
  product_id uuid NOT NULL,
  quantity   integer DEFAULT 1 NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT cart_pkey                    PRIMARY KEY (id),
  CONSTRAINT cart_user_id_product_id_key  UNIQUE (user_id, product_id),
  CONSTRAINT cart_user_id_fkey    FOREIGN KEY (user_id)    REFERENCES auth.users(id)      ON DELETE CASCADE,
  CONSTRAINT cart_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE
);

-- Tabela: news_trends (notícias e tendências)
CREATE TABLE IF NOT EXISTS public.news_trends (
  id           uuid DEFAULT gen_random_uuid() NOT NULL,
  title        text NOT NULL,
  description  text,
  content      text,
  image_url    text,
  video_url    text,
  product_id   uuid,
  is_active    boolean DEFAULT true,
  published_at timestamp with time zone DEFAULT now(),
  created_at   timestamp with time zone DEFAULT now() NOT NULL,
  updated_at   timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT news_trends_pkey          PRIMARY KEY (id),
  CONSTRAINT news_trends_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE SET NULL
);

-- Tabela: reviews (avaliações de produtos — sistema legado)
CREATE TABLE IF NOT EXISTS public.reviews (
  id                uuid DEFAULT gen_random_uuid() NOT NULL,
  product_id        uuid NOT NULL,
  user_id           uuid NOT NULL,
  rating            integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title             text,
  comment           text,
  verified_purchase boolean DEFAULT false,
  helpful_count     integer DEFAULT 0,
  created_at        timestamp with time zone DEFAULT now(),
  updated_at        timestamp with time zone DEFAULT now(),
  CONSTRAINT reviews_pkey            PRIMARY KEY (id),
  CONSTRAINT reviews_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE
);

-- Tabela: wishlist (lista de desejos)
CREATE TABLE IF NOT EXISTS public.wishlist (
  id         uuid DEFAULT gen_random_uuid() NOT NULL,
  user_id    uuid NOT NULL,
  product_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT wishlist_pkey                   PRIMARY KEY (id),
  CONSTRAINT wishlist_user_id_product_id_key UNIQUE (user_id, product_id),
  CONSTRAINT wishlist_product_id_fkey        FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE
);

-- Tabela: notifications (notificações de utilizadores)
CREATE TABLE IF NOT EXISTS public.notifications (
  id         uuid DEFAULT gen_random_uuid() NOT NULL,
  user_id    uuid NOT NULL,
  title      text NOT NULL,
  message    text NOT NULL,
  type       text NOT NULL,
  read       boolean DEFAULT false,
  link       text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (id)
);

-- Tabela: banners (banners de marketing)
CREATE TABLE IF NOT EXISTS public.banners (
  id          uuid DEFAULT gen_random_uuid() NOT NULL,
  title       text NOT NULL,
  subtitle    text,
  description text,
  cta_label   text,
  cta_link    text,
  image_url   text NOT NULL,
  position    integer NOT NULL DEFAULT 0,
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamp with time zone DEFAULT now() NOT NULL,
  updated_at  timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT banners_pkey PRIMARY KEY (id)
);

-- Tabela: short_videos (vídeos curtos de produtos)
CREATE TABLE IF NOT EXISTS public.short_videos (
  id             uuid DEFAULT gen_random_uuid() NOT NULL,
  title          text NOT NULL,
  price          numeric NOT NULL DEFAULT 0,
  original_price numeric,
  badge          text,
  video_url      text,
  thumbnail_url  text NOT NULL,
  product_link   text,
  position       integer NOT NULL DEFAULT 1,
  is_active      boolean NOT NULL DEFAULT true,
  created_at     timestamp with time zone DEFAULT now() NOT NULL,
  updated_at     timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT short_videos_pkey PRIMARY KEY (id)
);

-- Tabela: partner_applications (candidaturas de parceiros/revendedores)
CREATE TABLE IF NOT EXISTS public.partner_applications (
  id         uuid DEFAULT gen_random_uuid() NOT NULL,
  type       text NOT NULL CHECK (type IN ('revendedor', 'parceiro', 'prestador')),
  name       text NOT NULL,
  email      text NOT NULL,
  phone      text NOT NULL,
  company    text,
  province   text,
  message    text,
  status     text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT partner_applications_pkey PRIMARY KEY (id)
);

-- Tabela: tech_support_requests (pedidos de suporte técnico)
CREATE TABLE IF NOT EXISTS public.tech_support_requests (
  id                  uuid DEFAULT gen_random_uuid() NOT NULL,
  user_id             uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name                text NOT NULL,
  email               text NOT NULL,
  phone               text NOT NULL,
  device_type         text NOT NULL,
  brand_model         text,
  problem_description text NOT NULL,
  urgency             text NOT NULL DEFAULT 'normal' CHECK (urgency IN ('normal', 'urgente', 'critico')),
  province            text,
  address             text,
  preferred_date      date,
  status              text NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_analise', 'agendado', 'em_progresso', 'resolvido', 'cancelado')),
  technician_notes    text,
  created_at          timestamp with time zone DEFAULT now() NOT NULL,
  updated_at          timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT tech_support_requests_pkey PRIMARY KEY (id)
);

-- Tabela: delivery_addresses (moradas de entrega)
CREATE TABLE IF NOT EXISTS public.delivery_addresses (
  id         uuid DEFAULT gen_random_uuid() NOT NULL,
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label      text NOT NULL DEFAULT 'Casa',
  full_name  text NOT NULL,
  phone      text NOT NULL,
  address    text NOT NULL,
  city       text NOT NULL,
  province   text NOT NULL,
  notes      text,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT delivery_addresses_pkey PRIMARY KEY (id)
);

-- Tabela: product_reviews (avaliações de produtos — sistema novo)
CREATE TABLE IF NOT EXISTS public.product_reviews (
  id                uuid DEFAULT gen_random_uuid() NOT NULL,
  product_id        uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id           uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating            integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title             text,
  body              text,
  verified_purchase boolean NOT NULL DEFAULT false,
  created_at        timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT product_reviews_pkey                  PRIMARY KEY (id),
  CONSTRAINT product_reviews_product_id_user_id_key UNIQUE (product_id, user_id)
);

-- Tabela: coupons (cupões de desconto)
CREATE TABLE IF NOT EXISTS public.coupons (
  id               uuid DEFAULT gen_random_uuid() NOT NULL,
  code             text NOT NULL UNIQUE,
  type             text NOT NULL CHECK (type IN ('percent', 'fixed')),
  value            numeric NOT NULL,
  min_order_amount numeric,
  max_uses         integer,
  uses_count       integer NOT NULL DEFAULT 0,
  is_active        boolean NOT NULL DEFAULT true,
  expires_at       timestamp with time zone,
  created_at       timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT coupons_pkey PRIMARY KEY (id)
);


-- =============================================================================
-- SECÇÃO 4: ÍNDICES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_products_featured      ON public.products (is_featured)      WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_products_bestseller    ON public.products (is_bestseller)    WHERE is_bestseller = true;
CREATE INDEX IF NOT EXISTS idx_products_special_offer ON public.products (is_special_offer) WHERE is_special_offer = true;
CREATE INDEX IF NOT EXISTS idx_products_trending      ON public.products (is_trending)      WHERE is_trending = true;
CREATE INDEX IF NOT EXISTS idx_products_seller_id     ON public.products (seller_id);

CREATE INDEX IF NOT EXISTS idx_news_trends_active   ON public.news_trends (is_active, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_trends_product  ON public.news_trends (product_id);

CREATE INDEX IF NOT EXISTS idx_banners_active_position      ON public.banners (is_active, position);
CREATE INDEX IF NOT EXISTS idx_short_videos_active_position ON public.short_videos (is_active, position);

CREATE INDEX IF NOT EXISTS idx_tech_support_status ON public.tech_support_requests (status);
CREATE INDEX IF NOT EXISTS idx_tech_support_user   ON public.tech_support_requests (user_id);

CREATE INDEX IF NOT EXISTS idx_delivery_addresses_user ON public.delivery_addresses (user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product         ON public.product_reviews (product_id);


-- =============================================================================
-- SECÇÃO 5: TRIGGERS
-- =============================================================================

-- Trigger: atualizar updated_at nas tabelas relevantes
CREATE OR REPLACE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_cart_updated_at
  BEFORE UPDATE ON public.cart
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_news_trends_updated_at
  BEFORE UPDATE ON public.news_trends
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_banners_updated_at
  BEFORE UPDATE ON public.banners
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_short_videos_updated_at
  BEFORE UPDATE ON public.short_videos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_partner_applications_updated_at
  BEFORE UPDATE ON public.partner_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_tech_support_updated_at
  BEFORE UPDATE ON public.tech_support_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_delivery_addresses_updated_at
  BEFORE UPDATE ON public.delivery_addresses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger: atualizar rating do produto quando é submetida uma avaliação
CREATE OR REPLACE TRIGGER update_product_rating_on_review
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_product_rating();

-- Trigger: reduzir stock quando um item de encomenda é criado
CREATE OR REPLACE TRIGGER on_order_item_created
  AFTER INSERT ON public.order_items
  FOR EACH ROW EXECUTE FUNCTION public.reduce_stock_on_order();

-- Trigger: criar perfil automaticamente quando um utilizador se regista
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- =============================================================================
-- SECÇÃO 6: ROW LEVEL SECURITY (RLS)
-- =============================================================================

ALTER TABLE public.profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_trends        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.short_videos       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_applications  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tech_support_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_addresses    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_reviews       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons               ENABLE ROW LEVEL SECURITY;


-- =============================================================================
-- SECÇÃO 7: POLÍTICAS RLS — PROFILES
-- =============================================================================

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));


-- =============================================================================
-- SECÇÃO 8: POLÍTICAS RLS — USER_ROLES
-- =============================================================================

CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));


-- =============================================================================
-- SECÇÃO 9: POLÍTICAS RLS — CATEGORIES
-- =============================================================================

CREATE POLICY "Anyone can view categories"
  ON public.categories FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage categories"
  ON public.categories
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));


-- =============================================================================
-- SECÇÃO 10: POLÍTICAS RLS — BRANDS
-- =============================================================================

CREATE POLICY "Anyone can view brands"
  ON public.brands FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage brands"
  ON public.brands
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));


-- =============================================================================
-- SECÇÃO 11: POLÍTICAS RLS — PRODUCTS
-- =============================================================================

CREATE POLICY "Anyone can view products"
  ON public.products FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage products"
  ON public.products
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Resellers can create their own products"
  ON public.products FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'reseller'::public.app_role)
    AND auth.uid() = seller_id
  );

CREATE POLICY "Resellers can update their own products"
  ON public.products FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'reseller'::public.app_role)
    AND auth.uid() = seller_id
  );

CREATE POLICY "Resellers can delete their own products"
  ON public.products FOR DELETE TO authenticated
  USING (
    public.has_role(auth.uid(), 'reseller'::public.app_role)
    AND auth.uid() = seller_id
  );

CREATE POLICY "Resellers can view their own products"
  ON public.products FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'reseller'::public.app_role)
    AND auth.uid() = seller_id
  );


-- =============================================================================
-- SECÇÃO 12: POLÍTICAS RLS — ORDERS
-- =============================================================================

CREATE POLICY "Users can view own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders"
  ON public.orders FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can update orders"
  ON public.orders FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Resellers can view orders with their products"
  ON public.orders FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'reseller'::public.app_role)
    AND EXISTS (
      SELECT 1
      FROM public.order_items
      JOIN public.products ON products.id = order_items.product_id
      WHERE order_items.order_id = orders.id
        AND products.seller_id = auth.uid()
    )
  );


-- =============================================================================
-- SECÇÃO 13: POLÍTICAS RLS — ORDER_ITEMS
-- =============================================================================

CREATE POLICY "Users can view own order items"
  ON public.order_items FOR SELECT
  USING (public.order_belongs_to_user(order_id, auth.uid()));

CREATE POLICY "Users can create order items for own orders"
  ON public.order_items FOR INSERT
  WITH CHECK (public.order_belongs_to_user(order_id, auth.uid()));

CREATE POLICY "Admins can view all order items"
  ON public.order_items FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Resellers can view order items for their products"
  ON public.order_items FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'reseller'::public.app_role)
    AND EXISTS (
      SELECT 1 FROM public.products
      WHERE products.id = order_items.product_id
        AND products.seller_id = auth.uid()
    )
  );


-- =============================================================================
-- SECÇÃO 14: POLÍTICAS RLS — CART
-- =============================================================================

CREATE POLICY "Users can view own cart"
  ON public.cart FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own cart"
  ON public.cart
  USING (auth.uid() = user_id);


-- =============================================================================
-- SECÇÃO 15: POLÍTICAS RLS — NEWS_TRENDS
-- =============================================================================

CREATE POLICY "Anyone can view active news and trends"
  ON public.news_trends FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage news and trends"
  ON public.news_trends
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));


-- =============================================================================
-- SECÇÃO 16: POLÍTICAS RLS — REVIEWS
-- =============================================================================

CREATE POLICY "Anyone can view reviews"
  ON public.reviews FOR SELECT
  USING (true);

CREATE POLICY "Users can create reviews for purchased products"
  ON public.reviews FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.order_items oi
      JOIN public.orders o ON o.id = oi.order_id
      WHERE o.user_id = auth.uid()
        AND oi.product_id = reviews.product_id
    )
  );

CREATE POLICY "Users can update own reviews"
  ON public.reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews"
  ON public.reviews FOR DELETE
  USING (auth.uid() = user_id);


-- =============================================================================
-- SECÇÃO 17: POLÍTICAS RLS — WISHLIST
-- =============================================================================

CREATE POLICY "Users can view own wishlist"
  ON public.wishlist FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add to own wishlist"
  ON public.wishlist FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from own wishlist"
  ON public.wishlist FOR DELETE
  USING (auth.uid() = user_id);


-- =============================================================================
-- SECÇÃO 18: POLÍTICAS RLS — NOTIFICATIONS
-- =============================================================================

CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);


-- =============================================================================
-- SECÇÃO 19: POLÍTICAS RLS — BANNERS
-- =============================================================================

CREATE POLICY "Anyone can view active banners"
  ON public.banners FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage banners"
  ON public.banners FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));


-- =============================================================================
-- SECÇÃO 20: POLÍTICAS RLS — SHORT_VIDEOS
-- =============================================================================

CREATE POLICY "Anyone can view active short_videos"
  ON public.short_videos FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage short_videos"
  ON public.short_videos FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));


-- =============================================================================
-- SECÇÃO 21: POLÍTICAS RLS — PARTNER_APPLICATIONS
-- =============================================================================

CREATE POLICY "Anyone can submit applications"
  ON public.partner_applications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can manage applications"
  ON public.partner_applications FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));


-- =============================================================================
-- SECÇÃO 22: POLÍTICAS RLS — TECH_SUPPORT_REQUESTS
-- =============================================================================

CREATE POLICY "Anyone can create support requests"
  ON public.tech_support_requests FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view own requests"
  ON public.tech_support_requests FOR SELECT
  USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Admins can manage support requests"
  ON public.tech_support_requests FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));


-- =============================================================================
-- SECÇÃO 23: POLÍTICAS RLS — DELIVERY_ADDRESSES
-- =============================================================================

CREATE POLICY "Users can manage own addresses"
  ON public.delivery_addresses FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());


-- =============================================================================
-- SECÇÃO 24: POLÍTICAS RLS — PRODUCT_REVIEWS
-- =============================================================================

CREATE POLICY "Anyone can read reviews"
  ON public.product_reviews FOR SELECT
  USING (true);

CREATE POLICY "Users can manage own reviews"
  ON public.product_reviews FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all reviews"
  ON public.product_reviews FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));


-- =============================================================================
-- SECÇÃO 25: POLÍTICAS RLS — COUPONS
-- =============================================================================

CREATE POLICY "Anyone can read active coupons"
  ON public.coupons FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage coupons"
  ON public.coupons FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));


-- =============================================================================
-- SECÇÃO 26: STORAGE — BUCKET DE IMAGENS
-- =============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can view product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "Admins and resellers can upload product images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'product-images'
    AND (
      public.has_role(auth.uid(), 'admin'::public.app_role)
      OR public.has_role(auth.uid(), 'reseller'::public.app_role)
    )
  );

CREATE POLICY "Admins and resellers can update product images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'product-images'
    AND (
      public.has_role(auth.uid(), 'admin'::public.app_role)
      OR public.has_role(auth.uid(), 'reseller'::public.app_role)
    )
  );

CREATE POLICY "Admins and resellers can delete product images"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'product-images'
    AND (
      public.has_role(auth.uid(), 'admin'::public.app_role)
      OR public.has_role(auth.uid(), 'reseller'::public.app_role)
    )
  );


-- =============================================================================
-- SECÇÃO 27: DADOS INICIAIS — CATEGORIAS
-- =============================================================================

INSERT INTO public.categories (name, slug, description) VALUES
  ('Smartphones',   'smartphones',   'Telemóveis e acessórios'),
  ('Tablets',       'tablets',       'Tablets e acessórios'),
  ('Computadores',  'computadores',  'Portáteis, desktops e componentes'),
  ('Televisores',   'televisores',   'TVs e equipamento audiovisual'),
  ('Consolas',      'consolas',      'Consolas de jogos e acessórios'),
  ('Acessórios Tech','acessorios-tech','Acessórios tecnológicos diversos'),
  ('Impressoras',   'impressoras',   'Impressoras e scanners'),
  ('Armazenamento', 'armazenamento', 'Discos externos e pendrives'),
  ('Rede',          'rede',          'Routers, switches e networking'),
  ('Drones',        'drones',        'Drones e acessórios'),
  ('Fotografia',    'fotografia',    'Câmaras e equipamento fotográfico'),
  ('Smartwatches',  'smartwatches',  'Relógios inteligentes'),
  ('Headphones',    'headphones',    'Auscultadores e earbuds'),
  ('Colunas',       'colunas',       'Colunas e sistemas de som'),
  ('Carregadores',  'carregadores',  'Carregadores e power banks'),
  ('Projetores',    'projetores',    'Projetores e equipamento de apresentação'),
  ('Gaming',        'gaming',        'Equipamento para gaming'),
  ('Escritório',    'escritorio',    'Equipamento para escritório')
ON CONFLICT (slug) DO NOTHING;


-- =============================================================================
-- FIM DO SCRIPT
-- =============================================================================
-- Tabelas criadas (19):
--   profiles, user_roles, categories, brands, products, orders, order_items,
--   cart, news_trends, reviews, wishlist, notifications, banners, short_videos,
--   partner_applications, tech_support_requests, delivery_addresses,
--   product_reviews, coupons
--
-- Funções criadas (5):
--   update_updated_at_column, has_role, handle_new_user,
--   reduce_stock_on_order, update_product_rating, order_belongs_to_user
--
-- Triggers criados (13):
--   Atualização de updated_at em todas as tabelas relevantes
--   on_order_item_created (redução de stock)
--   update_product_rating_on_review (atualização de rating)
--   on_auth_user_created (criação automática de perfil)
--
-- Storage: bucket 'product-images' público com políticas de acesso
-- Dados: 18 categorias pré-carregadas
-- =============================================================================
