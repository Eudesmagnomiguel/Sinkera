create table if not exists promo_banners (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  badge text,
  badge_color text default '#dc2626',
  bg_color text default '#1B4FD8',
  image_url text,
  cta_label text default 'Ver Promoções',
  cta_link text default '/produtos',
  position int default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

alter table promo_banners enable row level security;

create policy "Public read active promo banners" on promo_banners
  for select using (is_active = true);

create policy "Admin full access promo banners" on promo_banners
  for all using (true) with check (true);

-- Seed com os 3 banners existentes
insert into promo_banners (title, description, badge, badge_color, bg_color, cta_label, cta_link, position) values
  ('Envio Grátis',      'Em compras acima de 50.000 Kz',           'Sem Limite',     '#2563EB', '#1B4FD8', 'Comprar Agora',    '/produtos', 0),
  ('Até 50% OFF',       'Em electrodomésticos e smartphones',       'Tempo Limitado', '#DC2626', '#111827', 'Ver Promoções',    '/produtos', 1),
  ('Oferta Relâmpago',  'Desconto de 30% — válido hoje',            'Hoje Só',        '#EA580C', '#431407', 'Aproveitar Oferta','/produtos', 2);
