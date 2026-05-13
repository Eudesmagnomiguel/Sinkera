create table if not exists gift_cards (
  id uuid default gen_random_uuid() primary key,
  code text unique not null,
  value numeric not null,
  remaining_value numeric not null,
  is_active boolean default true,
  expires_at timestamptz,
  created_at timestamptz default now()
);

alter table gift_cards enable row level security;

create policy "Public can read active gift cards" on gift_cards
  for select using (is_active = true);

create policy "Admin full access gift cards" on gift_cards
  for all using (true) with check (true);
