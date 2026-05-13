-- Adicionar novas categorias ao marketplace
INSERT INTO public.categories (name, slug, description) VALUES
  ('Smartphones', 'smartphones', 'Telemóveis e acessórios'),
  ('Tablets', 'tablets', 'Tablets e acessórios'),
  ('Computadores', 'computadores', 'Portáteis, desktops e componentes'),
  ('Televisores', 'televisores', 'TVs e equipamento audiovisual'),
  ('Consolas', 'consolas', 'Consolas de jogos e acessórios'),
  ('Acessórios Tech', 'acessorios-tech', 'Acessórios tecnológicos diversos'),
  ('Impressoras', 'impressoras', 'Impressoras e scanners'),
  ('Armazenamento', 'armazenamento', 'Discos externos e pendrives'),
  ('Rede', 'rede', 'Routers, switches e networking'),
  ('Drones', 'drones', 'Drones e acessórios'),
  ('Fotografia', 'fotografia', 'Câmaras e equipamento fotográfico'),
  ('Smartwatches', 'smartwatches', 'Relógios inteligentes'),
  ('Headphones', 'headphones', 'Auscultadores e earbuds'),
  ('Colunas', 'colunas', 'Colunas e sistemas de som'),
  ('Carregadores', 'carregadores', 'Carregadores e power banks'),
  ('Projetores', 'projetores', 'Projetores e equipamento de apresentação'),
  ('Gaming', 'gaming', 'Equipamento para gaming'),
  ('Escritório', 'escritorio', 'Equipamento para escritório')
ON CONFLICT (slug) DO NOTHING;