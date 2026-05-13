-- ============================================================
-- SEED — Marcas, Categorias e Produtos iniciais
-- Execute no SQL Editor do Supabase
-- ============================================================

-- ── Categorias adicionais ─────────────────────────────────────
INSERT INTO public.categories (name, slug, description) VALUES
  ('TV e Áudio',   'tv-audio',    'Televisores, colunas e auscultadores'),
  ('Foto e Vídeo', 'photo-video', 'Câmaras e equipamento fotográfico'),
  ('Portáteis',    'laptops',     'Computadores portáteis'),
  ('Gadgets',      'gadgets',     'Tablets e gadgets diversos')
ON CONFLICT (slug) DO NOTHING;

-- ── Marcas ───────────────────────────────────────────────────
INSERT INTO public.brands (name, slug) VALUES
  ('Apple',   'apple'),
  ('Samsung', 'samsung'),
  ('Nokia',   'nokia'),
  ('Sony',    'sony'),
  ('Canon',   'canon'),
  ('Dell',    'dell'),
  ('Asus',    'asus')
ON CONFLICT (slug) DO NOTHING;

-- ── Produtos ─────────────────────────────────────────────────
INSERT INTO public.products
  (name, price, original_price, image_url, category_id, brand_id,
   rating, reviews_count, badge, in_stock, stock_quantity,
   is_featured, is_bestseller, is_special_offer, is_trending)
SELECT
  p.name, p.price, p.original_price, p.image_url,
  (SELECT id FROM public.categories WHERE slug = p.cat_slug),
  (SELECT id FROM public.brands    WHERE slug = p.brand_slug),
  p.rating, p.reviews_count, p.badge,
  p.in_stock, p.stock_quantity,
  p.is_featured, p.is_bestseller, p.is_special_offer, p.is_trending
FROM (VALUES
  ('iPhone 14 Pro, LTPO Super Retina XDR OLED 6.1"',
   1200000::numeric, 1499000::numeric,
   'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=400&h=400&fit=crop',
   'smartphones', 'apple', 4.8, 324, 'Mais Vendido', true, 50, true, true, false, true),

  ('Nokia 8210, Dual SIM, 4G',
   60000::numeric, NULL,
   'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=400&h=400&fit=crop',
   'smartphones', 'nokia', 4.2, 89, NULL, true, 30, false, false, false, false),

  ('SONY SRSXV900, Wireless Party Speaker, MEGA BASS',
   1200000::numeric, NULL,
   'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop',
   'tv-audio', 'sony', 4.6, 156, NULL, true, 20, false, true, false, true),

  ('Headphones Sony, Noise Cancelling, Bluetooth 5.0',
   920000::numeric, 1199000::numeric,
   'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
   'tv-audio', 'sony', 4.7, 203, 'Oferta', true, 40, true, false, true, false),

  ('Canon EOS R10, 4K, DIGIC X, RF-S 18-45mm',
   899000::numeric, NULL,
   'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=400&fit=crop',
   'photo-video', 'canon', 4.5, 78, NULL, true, 15, false, false, false, false),

  ('DELL Vostro 3910 MT, Intel Core i5-12400',
   1899000::numeric, 2299000::numeric,
   'https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=400&h=400&fit=crop',
   'laptops', 'dell', 4.3, 92, 'Novo', true, 10, false, false, true, false),

  ('Asus VivoBook S 14 Flip TP3402ZA Intel Core',
   2499000::numeric, NULL,
   'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop',
   'laptops', 'asus', 4.4, 67, NULL, false, 0, false, false, false, false),

  ('Sony SRS-XP700, MEGA BASS, Bluetooth, LDAC, IPX4',
   1599000::numeric, 1899000::numeric,
   'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
   'tv-audio', 'sony', 4.6, 124, 'Desconto', true, 25, false, false, true, false),

  ('Samsung Galaxy S23 Ultra 5G 256GB',
   2199000::numeric, 2699000::numeric,
   'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&h=400&fit=crop',
   'smartphones', 'samsung', 4.9, 456, 'Premium', true, 35, true, true, true, true),

  ('MacBook Pro M2 13.3" 256GB SSD 8GB RAM',
   3499000::numeric, NULL,
   'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop',
   'laptops', 'apple', 4.8, 289, NULL, true, 12, true, true, false, false),

  ('iPad Pro 12.9" M2 128GB Wi-Fi',
   2899000::numeric, 3299000::numeric,
   'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop',
   'gadgets', 'apple', 4.7, 178, 'Oferta', true, 18, true, false, true, false),

  ('AirPods Pro 2ª Geração com Case MagSafe',
   649000::numeric, 799000::numeric,
   'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400&h=400&fit=crop',
   'tv-audio', 'apple', 4.6, 334, NULL, true, 60, false, true, false, false)
) AS p(name, price, original_price, image_url, cat_slug, brand_slug,
       rating, reviews_count, badge, in_stock, stock_quantity,
       is_featured, is_bestseller, is_special_offer, is_trending);
