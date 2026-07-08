-- V15: Corrige inserção de fornecedores, categorias e 135 produtos reais
-- (V14 falhou por ausência de suppliers/categories antes dos products)

-- Remove registro da migration falha
DELETE FROM flyway_schema_history WHERE version = '14';

-- Insere fornecedores
INSERT INTO suppliers (id, name, active, created_at, updated_at)
SELECT gen_random_uuid(), 'Emplay Embalagens', true, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM suppliers WHERE name = 'Emplay Embalagens');

INSERT INTO suppliers (id, name, active, created_at, updated_at)
SELECT gen_random_uuid(), 'FlexPack', true, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM suppliers WHERE name = 'FlexPack');

-- Insere categorias (slug NOT NULL)
INSERT INTO categories (id, name, slug, active, created_at, updated_at)
SELECT gen_random_uuid(), nome, slug, true, now(), now()
FROM (VALUES
  ('Sacos Plásticos PEBD',   'sacos-plasticos-pebd'),
  ('Sacos Plásticos PEAD',   'sacos-plasticos-pead'),
  ('Bobinas de Açougue',     'bobinas-de-acougue'),
  ('Bobinas Picotadas',      'bobinas-picotadas'),
  ('Bobinas Fundo Estrela',  'bobinas-fundo-estrela'),
  ('Sacolas e Sacos de Lixo','sacolas-e-sacos-de-lixo'),
  ('Separadores',            'separadores'),
  ('Fita Adesiva',           'fita-adesiva'),
  ('Suportes para Bobina',   'suportes-para-bobina'),
  ('Filme Stretch',          'filme-stretch')
) AS t(nome, slug)
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = t.nome);

-- 135 produtos
INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Saco PEBD Solda Lateral 06x25x0,06', '100638', 'Saco plástico PEBD solda lateral. Medida: 06x25x0,06. Qtd mínima: 20 kg.', 22.0, 23.1, 24.2, 25.3, 20,
  (SELECT id FROM categories WHERE name = 'Sacos Plásticos PEBD' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'Emplay Embalagens' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Saco PEBD Solda Lateral 08x25x0,06', '100553', 'Saco plástico PEBD solda lateral. Medida: 08x25x0,06. Qtd mínima: 20 kg.', 22.0, 23.1, 24.2, 25.3, 20,
  (SELECT id FROM categories WHERE name = 'Sacos Plásticos PEBD' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'Emplay Embalagens' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Saco PEBD Solda Lateral 10x15x0,06', '100459', 'Saco plástico PEBD solda lateral. Medida: 10x15x0,06. Qtd mínima: 20 kg.', 22.0, 23.1, 24.2, 25.3, 20,
  (SELECT id FROM categories WHERE name = 'Sacos Plásticos PEBD' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'Emplay Embalagens' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Saco PEBD Solda Lateral 10x20x0,06', '100454', 'Saco plástico PEBD solda lateral. Medida: 10x20x0,06. Qtd mínima: 20 kg.', 22.0, 23.1, 24.2, 25.3, 20,
  (SELECT id FROM categories WHERE name = 'Sacos Plásticos PEBD' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'Emplay Embalagens' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Saco PEBD Solda Lateral 13x25x0,06', '100001', 'Saco plástico PEBD solda lateral. Medida: 13x25x0,06. Qtd mínima: 20 kg.', 22.0, 23.1, 24.2, 25.3, 20,
  (SELECT id FROM categories WHERE name = 'Sacos Plásticos PEBD' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'Emplay Embalagens' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Saco PEBD Solda Lateral 15x20x0,06', '100464', 'Saco plástico PEBD solda lateral. Medida: 15x20x0,06. Qtd mínima: 20 kg.', 22.0, 23.1, 24.2, 25.3, 20,
  (SELECT id FROM categories WHERE name = 'Sacos Plásticos PEBD' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'Emplay Embalagens' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Saco PEBD Solda Lateral 15x25x0,06', '100002', 'Saco plástico PEBD solda lateral. Medida: 15x25x0,06. Qtd mínima: 20 kg.', 22.0, 23.1, 24.2, 25.3, 20,
  (SELECT id FROM categories WHERE name = 'Sacos Plásticos PEBD' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'Emplay Embalagens' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Saco PEBD Solda Lateral 15x30x0,06', '100003', 'Saco plástico PEBD solda lateral. Medida: 15x30x0,06. Qtd mínima: 20 kg.', 22.0, 23.1, 24.2, 25.3, 20,
  (SELECT id FROM categories WHERE name = 'Sacos Plásticos PEBD' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'Emplay Embalagens' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Saco PEBD Solda Lateral 20x30x0,06', '100004', 'Saco plástico PEBD solda lateral. Medida: 20x30x0,06. Qtd mínima: 20 kg.', 22.0, 23.1, 24.2, 25.3, 20,
  (SELECT id FROM categories WHERE name = 'Sacos Plásticos PEBD' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'Emplay Embalagens' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Saco PEBD Solda Lateral 20x40x0,06', '100467', 'Saco plástico PEBD solda lateral. Medida: 20x40x0,06. Qtd mínima: 20 kg.', 22.0, 23.1, 24.2, 25.3, 20,
  (SELECT id FROM categories WHERE name = 'Sacos Plásticos PEBD' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'Emplay Embalagens' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Saco PEBD Solda Lateral 22x45x0,06', '100007', 'Saco plástico PEBD solda lateral. Medida: 22x45x0,06. Qtd mínima: 20 kg.', 22.0, 23.1, 24.2, 25.3, 20,
  (SELECT id FROM categories WHERE name = 'Sacos Plásticos PEBD' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'Emplay Embalagens' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Saco PEBD Solda Lateral 25x35x0,06', '100005', 'Saco plástico PEBD solda lateral. Medida: 25x35x0,06. Qtd mínima: 20 kg.', 22.0, 23.1, 24.2, 25.3, 20,
  (SELECT id FROM categories WHERE name = 'Sacos Plásticos PEBD' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'Emplay Embalagens' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Saco PEBD Solda Lateral 25x45x0,06', '100008', 'Saco plástico PEBD solda lateral. Medida: 25x45x0,06. Qtd mínima: 20 kg.', 22.0, 23.1, 24.2, 25.3, 20,
  (SELECT id FROM categories WHERE name = 'Sacos Plásticos PEBD' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'Emplay Embalagens' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Saco PEBD Solda Lateral 30x40x0,06', '100006', 'Saco plástico PEBD solda lateral. Medida: 30x40x0,06. Qtd mínima: 20 kg.', 22.0, 23.1, 24.2, 25.3, 20,
  (SELECT id FROM categories WHERE name = 'Sacos Plásticos PEBD' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'Emplay Embalagens' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Saco PEBD Solda Lateral 35x45x0,06', '100009', 'Saco plástico PEBD solda lateral. Medida: 35x45x0,06. Qtd mínima: 20 kg.', 22.0, 23.1, 24.2, 25.3, 20,
  (SELECT id FROM categories WHERE name = 'Sacos Plásticos PEBD' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'Emplay Embalagens' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Saco PEBD Solda Lateral 40x60x0,06', '100010', 'Saco plástico PEBD solda lateral. Medida: 40x60x0,06. Qtd mínima: 20 kg.', 22.0, 23.1, 24.2, 25.3, 20,
  (SELECT id FROM categories WHERE name = 'Sacos Plásticos PEBD' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'Emplay Embalagens' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Saco PEBD Solda Lateral 50x70x0,06', '100456', 'Saco plástico PEBD solda lateral. Medida: 50x70x0,06. Qtd mínima: 20 kg.', 22.0, 23.1, 24.2, 25.3, 20,
  (SELECT id FROM categories WHERE name = 'Sacos Plásticos PEBD' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'Emplay Embalagens' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Saco PEBD Solda Lateral 50x80x0,06', '100453', 'Saco plástico PEBD solda lateral. Medida: 50x80x0,06. Qtd mínima: 20 kg.', 22.0, 23.1, 24.2, 25.3, 20,
  (SELECT id FROM categories WHERE name = 'Sacos Plásticos PEBD' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'Emplay Embalagens' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Saco PEBD Solda Lateral 60x80x0,06', '100462', 'Saco plástico PEBD solda lateral. Medida: 60x80x0,06. Qtd mínima: 20 kg.', 22.0, 23.1, 24.2, 25.3, 20,
  (SELECT id FROM categories WHERE name = 'Sacos Plásticos PEBD' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'Emplay Embalagens' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Saco PEBD Solda Lateral 60x90x0,06', '100455', 'Saco plástico PEBD solda lateral. Medida: 60x90x0,06. Qtd mínima: 20 kg.', 22.0, 23.1, 24.2, 25.3, 20,
  (SELECT id FROM categories WHERE name = 'Sacos Plásticos PEBD' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'Emplay Embalagens' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Saco PEBD Solda Lateral 20x30x0,10', '100458', 'Saco plástico PEBD solda lateral. Medida: 20x30x0,10. Qtd mínima: 20 kg.', 22.0, 23.1, 24.2, 25.3, 20,
  (SELECT id FROM categories WHERE name = 'Sacos Plásticos PEBD' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'Emplay Embalagens' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Saco PEBD Solda Lateral 25x35x0,10', '100457', 'Saco plástico PEBD solda lateral. Medida: 25x35x0,10. Qtd mínima: 20 kg.', 22.0, 23.1, 24.2, 25.3, 20,
  (SELECT id FROM categories WHERE name = 'Sacos Plásticos PEBD' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'Emplay Embalagens' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Saco PEBD Solda Lateral 30x40x0,10', '100463', 'Saco plástico PEBD solda lateral. Medida: 30x40x0,10. Qtd mínima: 20 kg.', 22.0, 23.1, 24.2, 25.3, 20,
  (SELECT id FROM categories WHERE name = 'Sacos Plásticos PEBD' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'Emplay Embalagens' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Saco PEBD Solda Lateral 35x45x0,10', '100466', 'Saco plástico PEBD solda lateral. Medida: 35x45x0,10. Qtd mínima: 20 kg.', 22.0, 23.1, 24.2, 25.3, 20,
  (SELECT id FROM categories WHERE name = 'Sacos Plásticos PEBD' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'Emplay Embalagens' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Saco PEBD Solda Lateral 40x60x0,10', '100011', 'Saco plástico PEBD solda lateral. Medida: 40x60x0,10. Qtd mínima: 20 kg.', 22.0, 23.1, 24.2, 25.3, 20,
  (SELECT id FROM categories WHERE name = 'Sacos Plásticos PEBD' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'Emplay Embalagens' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Saco PEBD Solda Funda 50x70x0,10', '100018', 'Saco plástico PEBD solda funda. Medida: 50x70x0,10.', 23.0, 24.15, 25.3, 26.45, 20,
  (SELECT id FROM categories WHERE name = 'Sacos Plásticos PEBD' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'Emplay Embalagens' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Saco PEBD Solda Funda 50x80x0,10', '100013', 'Saco plástico PEBD solda funda. Medida: 50x80x0,10.', 23.0, 24.15, 25.3, 26.45, 20,
  (SELECT id FROM categories WHERE name = 'Sacos Plásticos PEBD' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'Emplay Embalagens' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Saco PEBD Solda Funda 60x80x0,10', '100026', 'Saco plástico PEBD solda funda. Medida: 60x80x0,10.', 23.0, 24.15, 25.3, 26.45, 20,
  (SELECT id FROM categories WHERE name = 'Sacos Plásticos PEBD' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'Emplay Embalagens' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Saco PEBD Solda Funda 60x90x0,10', '100021', 'Saco plástico PEBD solda funda. Medida: 60x90x0,10.', 23.0, 24.15, 25.3, 26.45, 20,
  (SELECT id FROM categories WHERE name = 'Sacos Plásticos PEBD' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'Emplay Embalagens' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Saco PEBD Solda Funda 40x60x0,12', '100014', 'Saco plástico PEBD solda funda. Medida: 40x60x0,12.', 23.0, 24.15, 25.3, 26.45, 20,
  (SELECT id FROM categories WHERE name = 'Sacos Plásticos PEBD' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'Emplay Embalagens' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Saco PEBD Solda Funda 50x70x0,12', '100023', 'Saco plástico PEBD solda funda. Medida: 50x70x0,12.', 23.0, 24.15, 25.3, 26.45, 20,
  (SELECT id FROM categories WHERE name = 'Sacos Plásticos PEBD' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'Emplay Embalagens' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Saco PEBD Solda Funda 50x80x0,12', '100012', 'Saco plástico PEBD solda funda. Medida: 50x80x0,12.', 23.0, 24.15, 25.3, 26.45, 20,
  (SELECT id FROM categories WHERE name = 'Sacos Plásticos PEBD' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'Emplay Embalagens' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Saco PEBD Solda Funda 60x80x0,12', '100020', 'Saco plástico PEBD solda funda. Medida: 60x80x0,12.', 23.0, 24.15, 25.3, 26.45, 20,
  (SELECT id FROM categories WHERE name = 'Sacos Plásticos PEBD' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'Emplay Embalagens' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Saco PEBD Solda Funda 60x90x0,12', '100017', 'Saco plástico PEBD solda funda. Medida: 60x90x0,12.', 23.0, 24.15, 25.3, 26.45, 20,
  (SELECT id FROM categories WHERE name = 'Sacos Plásticos PEBD' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'Emplay Embalagens' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Saco PEBD Sanfonado 50x80x0,10', '100971', 'Saco plástico PEBD sanfonado. Medida: 50x80x0,10.', 23.5, 24.68, 25.85, 27.02, 20,
  (SELECT id FROM categories WHERE name = 'Sacos Plásticos PEBD' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'Emplay Embalagens' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Saco PEBD Sanfonado 50x80x0,12', '100975', 'Saco plástico PEBD sanfonado. Medida: 50x80x0,12.', 23.5, 24.68, 25.85, 27.02, 20,
  (SELECT id FROM categories WHERE name = 'Sacos Plásticos PEBD' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'Emplay Embalagens' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Saco PEBD 12 Furos 15x30x0,06', '100589', 'Saco plástico PEBD com 12 furos. Medida: 15x30x0,06.', 23.5, 24.68, 25.85, 27.02, 20,
  (SELECT id FROM categories WHERE name = 'Sacos Plásticos PEBD' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'Emplay Embalagens' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Saco PEBD 12 Furos 20x30x0,06', '100504', 'Saco plástico PEBD com 12 furos. Medida: 20x30x0,06.', 23.5, 24.68, 25.85, 27.02, 20,
  (SELECT id FROM categories WHERE name = 'Sacos Plásticos PEBD' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'Emplay Embalagens' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Saco PEAD Padrão 50x80x0,003', '101807', 'Saco plástico PEAD padrão. Medida: 50x80x0,003.', 24.9, 26.14, 27.39, 28.63, 20,
  (SELECT id FROM categories WHERE name = 'Sacos Plásticos PEAD' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'Emplay Embalagens' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Saco PEAD para Pão 60x90x0,003', '101439', 'Saco plástico PEAD para pão. Medida: 60x90x0,003.', 24.9, 26.14, 27.39, 28.63, 20,
  (SELECT id FROM categories WHERE name = 'Sacos Plásticos PEAD' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'Emplay Embalagens' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Saco PEAD Geladinho 4x23x0,002', '800037', 'Saco PEAD geladinho. Medida: 4x23x0,002.', 12.9, 13.55, 14.19, 14.83, 50,
  (SELECT id FROM categories WHERE name = 'Sacos Plásticos PEAD' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'Emplay Embalagens' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Saco PEAD Geladão 5x23x0,002', '800036', 'Saco PEAD geladão. Medida: 5x23x0,002.', 13.9, 14.6, 15.29, 15.98, 50,
  (SELECT id FROM categories WHERE name = 'Sacos Plásticos PEAD' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'Emplay Embalagens' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Saco PEAD Talher 6x23x0,002', '800035', 'Saco PEAD para talher. Medida: 6x23x0,002.', 14.9, 15.65, 16.39, 17.13, 50,
  (SELECT id FROM categories WHERE name = 'Sacos Plásticos PEAD' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'Emplay Embalagens' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Saco PEAD Talher 7x23x0,002', '800034', 'Saco PEAD para talher. Medida: 7x23x0,002.', 15.9, 16.7, 17.49, 18.29, 50,
  (SELECT id FROM categories WHERE name = 'Sacos Plásticos PEAD' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'Emplay Embalagens' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Saco PEAD Talher 8x23x0,002', '800033', 'Saco PEAD para talher. Medida: 8x23x0,002.', 16.9, 17.75, 18.59, 19.43, 50,
  (SELECT id FROM categories WHERE name = 'Sacos Plásticos PEAD' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'Emplay Embalagens' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Saco PEAD Saladinha 13x23x0,002', '800032', 'Saco PEAD saladinha. Medida: 13x23x0,002.', 21.9, 23.0, 24.09, 25.18, 20,
  (SELECT id FROM categories WHERE name = 'Sacos Plásticos PEAD' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'Emplay Embalagens' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Separador Hambúrguer 15x15', '800038', 'Separador de hambúrguer 15x15 cm.', 25.9, 27.2, 28.49, 29.78, 20,
  (SELECT id FROM categories WHERE name = 'Separadores' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'Emplay Embalagens' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Separador Hambúrguer 17x17', '800039', 'Separador de hambúrguer 17x17 cm.', 25.9, 27.2, 28.49, 29.78, 20,
  (SELECT id FROM categories WHERE name = 'Separadores' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'Emplay Embalagens' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Separador Hambúrguer 19x19', '800040', 'Separador de hambúrguer 19x19 cm.', 25.9, 27.2, 28.49, 29.78, 20,
  (SELECT id FROM categories WHERE name = 'Separadores' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'Emplay Embalagens' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Bobina de Açougue 25 cm', '101263', 'Bobina de açougue 25 cm. Qtd mínima: 10 unidades.', 29.8, 31.29, 32.78, 34.27, 10,
  (SELECT id FROM categories WHERE name = 'Bobinas de Açougue' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'Emplay Embalagens' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Bobina de Açougue 30 cm', '101261', 'Bobina de açougue 30 cm. Qtd mínima: 12 unidades.', 29.8, 31.29, 32.78, 34.27, 12,
  (SELECT id FROM categories WHERE name = 'Bobinas de Açougue' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'Emplay Embalagens' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Bobina de Açougue 40 cm', '101259', 'Bobina de açougue 40 cm. Qtd mínima: 14 unidades.', 29.8, 31.29, 32.78, 34.27, 14,
  (SELECT id FROM categories WHERE name = 'Bobinas de Açougue' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'Emplay Embalagens' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Bobina de Açougue 60 cm', '101262', 'Bobina de açougue 60 cm. Qtd mínima: 16 unidades.', 29.8, 31.29, 32.78, 34.27, 16,
  (SELECT id FROM categories WHERE name = 'Bobinas de Açougue' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'Emplay Embalagens' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Bobina Picotada Premium 20x30x0,005', '101112', 'Bobina picotada premium. Medida: 20x30x0,005.', 28.9, 30.34, 31.79, 33.23, 6,
  (SELECT id FROM categories WHERE name = 'Bobinas Picotadas' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'Emplay Embalagens' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Bobina Picotada Premium 25x35x0,005', '101113', 'Bobina picotada premium. Medida: 25x35x0,005.', 28.9, 30.34, 31.79, 33.23, 6,
  (SELECT id FROM categories WHERE name = 'Bobinas Picotadas' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'Emplay Embalagens' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Bobina Picotada Premium 30x40x0,005', '101114', 'Bobina picotada premium. Medida: 30x40x0,005.', 28.9, 30.34, 31.79, 33.23, 6,
  (SELECT id FROM categories WHERE name = 'Bobinas Picotadas' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'Emplay Embalagens' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Bobina Picotada Premium 35x50x0,005', '101116', 'Bobina picotada premium. Medida: 35x50x0,005.', 28.9, 30.34, 31.79, 33.23, 6,
  (SELECT id FROM categories WHERE name = 'Bobinas Picotadas' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'Emplay Embalagens' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Bobina Picotada Premium 40x60x0,005', '101117', 'Bobina picotada premium. Medida: 40x60x0,005.', 28.9, 30.34, 31.79, 33.23, 6,
  (SELECT id FROM categories WHERE name = 'Bobinas Picotadas' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'Emplay Embalagens' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Bobina Picotada Premium 50x70x0,005', '101118', 'Bobina picotada premium. Medida: 50x70x0,005.', 28.9, 30.34, 31.79, 33.23, 6,
  (SELECT id FROM categories WHERE name = 'Bobinas Picotadas' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'Emplay Embalagens' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Bobina Folha Picotada 30x40x0,025', '101267', 'Bobina folha picotada. Medida: 30x40x0,025.', 28.9, 30.34, 31.79, 33.23, 6,
  (SELECT id FROM categories WHERE name = 'Bobinas Picotadas' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'Emplay Embalagens' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Bobina Folha Picotada 40x40x0,025', '101268', 'Bobina folha picotada. Medida: 40x40x0,025.', 28.9, 30.34, 31.79, 33.23, 6,
  (SELECT id FROM categories WHERE name = 'Bobinas Picotadas' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'Emplay Embalagens' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Sacola Verde 30x40 PCT 4KG', '800095', 'Sacola verde 30x40 cm, pacote 4 kg.', 10.5, 11.03, 11.55, 12.07, 5,
  (SELECT id FROM categories WHERE name = 'Sacolas e Sacos de Lixo' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'Emplay Embalagens' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Sacola Verde 30x45 PCT 4KG', '800048', 'Sacola verde 30x45 cm, pacote 4 kg.', 10.5, 11.03, 11.55, 12.07, 5,
  (SELECT id FROM categories WHERE name = 'Sacolas e Sacos de Lixo' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'Emplay Embalagens' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Sacola Verde 40x50 PCT 4KG', '800049', 'Sacola verde 40x50 cm, pacote 4 kg.', 10.5, 11.03, 11.55, 12.07, 5,
  (SELECT id FROM categories WHERE name = 'Sacolas e Sacos de Lixo' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'Emplay Embalagens' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Sacola Verde 50x60 PCT 4KG', '800075', 'Sacola verde 50x60 cm, pacote 4 kg.', 10.5, 11.03, 11.55, 12.07, 5,
  (SELECT id FROM categories WHERE name = 'Sacolas e Sacos de Lixo' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'Emplay Embalagens' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Sacola Verde 60x80 PCT 4KG', NULL, 'Sacola verde 60x80 cm, pacote 4 kg.', 10.5, 11.03, 11.55, 12.07, 5,
  (SELECT id FROM categories WHERE name = 'Sacolas e Sacos de Lixo' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'Emplay Embalagens' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Sacola Verde 70x80 PCT 4KG', '800076', 'Sacola verde 70x80 cm, pacote 4 kg.', 10.5, 11.03, 11.55, 12.07, 5,
  (SELECT id FROM categories WHERE name = 'Sacolas e Sacos de Lixo' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'Emplay Embalagens' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Sacola Verde 90x100 PCT 4KG', '800077', 'Sacola verde 90x100 cm, pacote 4 kg.', 10.5, 11.03, 11.55, 12.07, 5,
  (SELECT id FROM categories WHERE name = 'Sacolas e Sacos de Lixo' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'Emplay Embalagens' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Sacola Branca Leitosa 30x40', NULL, 'Sacola branca leitosa 30x40 cm.', 13.5, 14.18, 14.85, 15.52, 5,
  (SELECT id FROM categories WHERE name = 'Sacolas e Sacos de Lixo' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'Emplay Embalagens' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Sacola Branca Leitosa 30x45', NULL, 'Sacola branca leitosa 30x45 cm.', 13.5, 14.18, 14.85, 15.52, 5,
  (SELECT id FROM categories WHERE name = 'Sacolas e Sacos de Lixo' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'Emplay Embalagens' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Sacola Branca Leitosa 40x50', NULL, 'Sacola branca leitosa 40x50 cm.', 13.5, 14.18, 14.85, 15.52, 5,
  (SELECT id FROM categories WHERE name = 'Sacolas e Sacos de Lixo' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'Emplay Embalagens' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Sacola Branca Leitosa 50x60', '800078', 'Sacola branca leitosa 50x60 cm.', 13.5, 14.18, 14.85, 15.52, 5,
  (SELECT id FROM categories WHERE name = 'Sacolas e Sacos de Lixo' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'Emplay Embalagens' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Saco para Lixo Reforçado 20L', NULL, 'Saco para lixo reforçado 20 litros.', 10.5, 11.03, 11.55, 12.07, 5,
  (SELECT id FROM categories WHERE name = 'Sacolas e Sacos de Lixo' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'Emplay Embalagens' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Saco para Lixo Reforçado 40L', NULL, 'Saco para lixo reforçado 40 litros.', 10.5, 11.03, 11.55, 12.07, 5,
  (SELECT id FROM categories WHERE name = 'Sacolas e Sacos de Lixo' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'Emplay Embalagens' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Saco para Lixo Reforçado 60L', NULL, 'Saco para lixo reforçado 60 litros.', 10.5, 11.03, 11.55, 12.07, 5,
  (SELECT id FROM categories WHERE name = 'Sacolas e Sacos de Lixo' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'Emplay Embalagens' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Saco para Lixo Reforçado 100L', NULL, 'Saco para lixo reforçado 100 litros.', 10.5, 11.03, 11.55, 12.07, 5,
  (SELECT id FROM categories WHERE name = 'Sacolas e Sacos de Lixo' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'Emplay Embalagens' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Saco para Lixo Reforçado 200L', NULL, 'Saco para lixo reforçado 200 litros.', 10.5, 11.03, 11.55, 12.07, 5,
  (SELECT id FROM categories WHERE name = 'Sacolas e Sacos de Lixo' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'Emplay Embalagens' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Bobina Fundo Estrela Tradicional P 30x40x0,0014', '800014', 'Bobina fundo estrela tradicional P. 600 un/kg. Caixa: 6 kg.', 179.4, 188.37, 197.34, 206.31, 1,
  (SELECT id FROM categories WHERE name = 'Bobinas Fundo Estrela' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'FlexPack' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Bobina Fundo Estrela Tradicional M 35x45x0,0014', '800015', 'Bobina fundo estrela tradicional M. 460 un/kg. Caixa: 6 kg.', 179.4, 188.37, 197.34, 206.31, 1,
  (SELECT id FROM categories WHERE name = 'Bobinas Fundo Estrela' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'FlexPack' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Bobina Fundo Estrela Tradicional G 38x55x0,0015', '800016', 'Bobina fundo estrela tradicional G. 330 un/kg. Caixa: 6 kg.', 179.4, 188.37, 197.34, 206.31, 1,
  (SELECT id FROM categories WHERE name = 'Bobinas Fundo Estrela' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'FlexPack' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Bobina Fundo Estrela Tradicional XG 43x71x0,0016', '800017', 'Bobina fundo estrela tradicional XG. 210 un/kg. Caixa: 6 kg.', 179.4, 188.37, 197.34, 206.31, 1,
  (SELECT id FROM categories WHERE name = 'Bobinas Fundo Estrela' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'FlexPack' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Bobina Fundo Estrela Gold P 30x40x0,0014', '800010', 'Bobina fundo estrela gold P. 480 un/800g. Caixa: 4,8 kg.', 143.59, 150.77, 157.95, 165.13, 1,
  (SELECT id FROM categories WHERE name = 'Bobinas Fundo Estrela' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'FlexPack' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Bobina Fundo Estrela Gold M 35x45x0,0014', '800011', 'Bobina fundo estrela gold M. 360 un/800g. Caixa: 4,8 kg.', 143.59, 150.77, 157.95, 165.13, 1,
  (SELECT id FROM categories WHERE name = 'Bobinas Fundo Estrela' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'FlexPack' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Bobina Fundo Estrela Gold G 38x55x0,0015', '800012', 'Bobina fundo estrela gold G. 260 un/800g. Caixa: 4,8 kg.', 143.59, 150.77, 157.95, 165.13, 1,
  (SELECT id FROM categories WHERE name = 'Bobinas Fundo Estrela' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'FlexPack' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Bobina Fundo Estrela Gold XG 43x71x0,0016', '800013', 'Bobina fundo estrela gold XG. 210 un/800g. Caixa: 4,8 kg.', 143.59, 150.77, 157.95, 165.13, 1,
  (SELECT id FROM categories WHERE name = 'Bobinas Fundo Estrela' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'FlexPack' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Bobina Fundo Estrela Especial P 30x40x0,0014', '800006', 'Bobina fundo estrela especial P. 360 un/600g. Caixa: 3,6 kg.', 107.65, 113.03, 118.42, 123.8, 1,
  (SELECT id FROM categories WHERE name = 'Bobinas Fundo Estrela' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'FlexPack' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Bobina Fundo Estrela Especial M 35x45x0,0014', '800007', 'Bobina fundo estrela especial M. 270 un/600g. Caixa: 3,6 kg.', 107.65, 113.03, 118.42, 123.8, 1,
  (SELECT id FROM categories WHERE name = 'Bobinas Fundo Estrela' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'FlexPack' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Bobina Fundo Estrela Especial G 38x55x0,0015', '800008', 'Bobina fundo estrela especial G. 200 un/600g. Caixa: 3,6 kg.', 107.65, 113.03, 118.42, 123.8, 1,
  (SELECT id FROM categories WHERE name = 'Bobinas Fundo Estrela' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'FlexPack' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Bobina Fundo Estrela Especial XG 43x71x0,0016', '80009', 'Bobina fundo estrela especial XG. 160 un/600g. Caixa: 3,6 kg.', 107.65, 113.03, 118.42, 123.8, 1,
  (SELECT id FROM categories WHERE name = 'Bobinas Fundo Estrela' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'FlexPack' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Bobina Fundo Estrela Eco P 30x40x0,0014', NULL, 'Bobina fundo estrela eco P. 300 un/500g. Caixa: 3 kg.', 89.99, 94.49, 98.99, 103.49, 1,
  (SELECT id FROM categories WHERE name = 'Bobinas Fundo Estrela' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'FlexPack' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Bobina Fundo Estrela Eco M 35x50x0,0014', NULL, 'Bobina fundo estrela eco M. 315 un/700g. Caixa: 4,2 kg.', 125.95, 132.25, 138.55, 144.84, 1,
  (SELECT id FROM categories WHERE name = 'Bobinas Fundo Estrela' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'FlexPack' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Bobina Fundo Estrela Eco G 40x60x0,0015', NULL, 'Bobina fundo estrela eco G. 200 un/800g. Caixa: 4,8 kg.', 143.59, 150.77, 157.95, 165.13, 1,
  (SELECT id FROM categories WHERE name = 'Bobinas Fundo Estrela' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'FlexPack' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Bobina Fundo Estrela Super P 30x40x0,0011', '800018', 'Bobina fundo estrela super P. 1075 un/1,42kg. Caixa: 8,52 kg.', 255.9, 268.69, 281.49, 294.28, 1,
  (SELECT id FROM categories WHERE name = 'Bobinas Fundo Estrela' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'FlexPack' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Bobina Fundo Estrela Super M 34x45x0,0012', '800019', 'Bobina fundo estrela super M. 875 un/1,6kg. Caixa: 9,64 kg.', 289.9, 304.39, 318.89, 333.38, 1,
  (SELECT id FROM categories WHERE name = 'Bobinas Fundo Estrela' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'FlexPack' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Bobina Fundo Estrela Super G 39x50x0,0012', '800020', 'Bobina fundo estrela super G. 700 un/1,64kg. Caixa: 9,84 kg.', 295.9, 310.69, 325.49, 340.28, 1,
  (SELECT id FROM categories WHERE name = 'Bobinas Fundo Estrela' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'FlexPack' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Bobina Fundo Estrela Super XG 43x71x0,0014', '800021', 'Bobina fundo estrela super XG. 400 un/1,7kg. Caixa: 10,2 kg.', 305.9, 321.19, 336.49, 351.78, 1,
  (SELECT id FROM categories WHERE name = 'Bobinas Fundo Estrela' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'FlexPack' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Bobina Fundo Estrela Impresso P 30x40x0,0014', '800022', 'Bobina fundo estrela impresso P. 480 un/800g. Caixa: 4,8 kg.', 151.5, 159.08, 166.65, 174.22, 1,
  (SELECT id FROM categories WHERE name = 'Bobinas Fundo Estrela' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'FlexPack' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Bobina Fundo Estrela Impresso M 35x45x0,0014', '800023', 'Bobina fundo estrela impresso M. 360 un/800g. Caixa: 4,8 kg.', 151.5, 159.08, 166.65, 174.22, 1,
  (SELECT id FROM categories WHERE name = 'Bobinas Fundo Estrela' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'FlexPack' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Bobina Fundo Estrela Impresso G 38x55x0,0015', '800024', 'Bobina fundo estrela impresso G. 260 un/800g. Caixa: 4,8 kg.', 151.5, 159.08, 166.65, 174.22, 1,
  (SELECT id FROM categories WHERE name = 'Bobinas Fundo Estrela' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'FlexPack' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Bobina Picotada Gold PEAD 20x30x0,040', '100108', 'Bobina picotada gold PEAD. Medida: 20x30x0,040.', 24.9, 26.14, 27.39, 28.63, 6,
  (SELECT id FROM categories WHERE name = 'Bobinas Picotadas' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'FlexPack' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Bobina Picotada Gold PEAD 20x35x0,040', '101693', 'Bobina picotada gold PEAD. Medida: 20x35x0,040.', 24.9, 26.14, 27.39, 28.63, 6,
  (SELECT id FROM categories WHERE name = 'Bobinas Picotadas' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'FlexPack' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Bobina Picotada Gold PEAD 25x35x0,040', '100501', 'Bobina picotada gold PEAD. Medida: 25x35x0,040.', 24.9, 26.14, 27.39, 28.63, 6,
  (SELECT id FROM categories WHERE name = 'Bobinas Picotadas' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'FlexPack' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Bobina Picotada Gold PEAD 30x40x0,040', '100199', 'Bobina picotada gold PEAD. Medida: 30x40x0,040.', 24.9, 26.14, 27.39, 28.63, 6,
  (SELECT id FROM categories WHERE name = 'Bobinas Picotadas' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'FlexPack' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Bobina Picotada Gold PEAD 35x45x0,040', '100509', 'Bobina picotada gold PEAD. Medida: 35x45x0,040.', 24.9, 26.14, 27.39, 28.63, 6,
  (SELECT id FROM categories WHERE name = 'Bobinas Picotadas' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'FlexPack' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Bobina Picotada Gold PEAD 35x50x0,040', '100512', 'Bobina picotada gold PEAD. Medida: 35x50x0,040.', 24.9, 26.14, 27.39, 28.63, 6,
  (SELECT id FROM categories WHERE name = 'Bobinas Picotadas' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'FlexPack' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Bobina Picotada Gold PEAD 40x50x0,040', '101696', 'Bobina picotada gold PEAD. Medida: 40x50x0,040.', 24.9, 26.14, 27.39, 28.63, 6,
  (SELECT id FROM categories WHERE name = 'Bobinas Picotadas' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'FlexPack' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Bobina Picotada Gold PEAD 40x60x0,040', '100514', 'Bobina picotada gold PEAD. Medida: 40x60x0,040.', 24.9, 26.14, 27.39, 28.63, 6,
  (SELECT id FROM categories WHERE name = 'Bobinas Picotadas' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'FlexPack' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Bobina Picotada Gold PEAD 50x60x0,040', '100539', 'Bobina picotada gold PEAD. Medida: 50x60x0,040.', 24.9, 26.14, 27.39, 28.63, 6,
  (SELECT id FROM categories WHERE name = 'Bobinas Picotadas' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'FlexPack' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Bobina Picotada Gold PEAD 50x70x0,040', '100520', 'Bobina picotada gold PEAD. Medida: 50x70x0,040.', 24.9, 26.14, 27.39, 28.63, 6,
  (SELECT id FROM categories WHERE name = 'Bobinas Picotadas' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'FlexPack' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Bobina Picotada Gold PEAD 50x80x0,040', '101244', 'Bobina picotada gold PEAD. Medida: 50x80x0,040.', 24.9, 26.14, 27.39, 28.63, 6,
  (SELECT id FROM categories WHERE name = 'Bobinas Picotadas' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'FlexPack' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Bobina Picotada Gold PEAD 60x80x0,040', '101241', 'Bobina picotada gold PEAD. Medida: 60x80x0,040.', 24.9, 26.14, 27.39, 28.63, 6,
  (SELECT id FROM categories WHERE name = 'Bobinas Picotadas' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'FlexPack' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Bobina Picotada Gold PEAD 60x90x0,040', '100525', 'Bobina picotada gold PEAD. Medida: 60x90x0,040.', 24.9, 26.14, 27.39, 28.63, 6,
  (SELECT id FROM categories WHERE name = 'Bobinas Picotadas' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'FlexPack' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Bobina Folha Picotada Gold PEAD 25x35x0,020', '101252', 'Bobina folha picotada gold PEAD. Medida: 25x35x0,020.', 24.9, 26.14, 27.39, 28.63, 6,
  (SELECT id FROM categories WHERE name = 'Bobinas Picotadas' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'FlexPack' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Bobina Folha Picotada Gold PEAD 30x40x0,020', '101254', 'Bobina folha picotada gold PEAD. Medida: 30x40x0,020.', 24.9, 26.14, 27.39, 28.63, 6,
  (SELECT id FROM categories WHERE name = 'Bobinas Picotadas' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'FlexPack' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Bobina Folha Picotada Gold PEAD 35x45x0,020', '101257', 'Bobina folha picotada gold PEAD. Medida: 35x45x0,020.', 24.9, 26.14, 27.39, 28.63, 6,
  (SELECT id FROM categories WHERE name = 'Bobinas Picotadas' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'FlexPack' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Fita Adesiva 45x100', '800050', 'Fita adesiva 45x100. Caixa com 80 unidades.', 416.0, 436.8, 457.6, 478.4, 1,
  (SELECT id FROM categories WHERE name = 'Fita Adesiva' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'FlexPack' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Suporte para Bobina Picotada', '800060', 'Suporte para bobina picotada.', 17.0, 17.85, 18.7, 19.55, 1,
  (SELECT id FROM categories WHERE name = 'Suportes para Bobina' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'FlexPack' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Base L para Tubo Preta', NULL, 'Base L para tubo, cor preta.', 12.5, 13.12, 13.75, 14.37, 1,
  (SELECT id FROM categories WHERE name = 'Suportes para Bobina' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'FlexPack' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Base L para Tubo Verde', NULL, 'Base L para tubo, cor verde.', 12.5, 13.12, 13.75, 14.37, 1,
  (SELECT id FROM categories WHERE name = 'Suportes para Bobina' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'FlexPack' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Base Reta para Tubo Preta com Haste', NULL, 'Base reta para tubo preta com haste.', 15.5, 16.28, 17.05, 17.82, 1,
  (SELECT id FROM categories WHERE name = 'Suportes para Bobina' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'FlexPack' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Base Reta para Tubo Verde com Haste', NULL, 'Base reta para tubo verde com haste.', 15.5, 16.28, 17.05, 17.82, 1,
  (SELECT id FROM categories WHERE name = 'Suportes para Bobina' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'FlexPack' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Duplicador para Tubo Preto com Haste', NULL, 'Duplicador para tubo preto com haste.', 17.0, 17.85, 18.7, 19.55, 1,
  (SELECT id FROM categories WHERE name = 'Suportes para Bobina' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'FlexPack' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Duplicador para Tubo Verde com Haste', NULL, 'Duplicador para tubo verde com haste.', 17.0, 17.85, 18.7, 19.55, 1,
  (SELECT id FROM categories WHERE name = 'Suportes para Bobina' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'FlexPack' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Mordente Preto com Haste', '800089', 'Mordente preto com haste.', 32.0, 33.6, 35.2, 36.8, 1,
  (SELECT id FROM categories WHERE name = 'Suportes para Bobina' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'FlexPack' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Mordente Verde com Haste', NULL, 'Mordente verde com haste.', 32.0, 33.6, 35.2, 36.8, 1,
  (SELECT id FROM categories WHERE name = 'Suportes para Bobina' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'FlexPack' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Fixador Lateral Preto com Haste', NULL, 'Fixador lateral preto com haste.', 15.5, 16.28, 17.05, 17.82, 1,
  (SELECT id FROM categories WHERE name = 'Suportes para Bobina' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'FlexPack' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Fixador Lateral Verde com Haste', NULL, 'Fixador lateral verde com haste.', 15.5, 16.28, 17.05, 17.82, 1,
  (SELECT id FROM categories WHERE name = 'Suportes para Bobina' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'FlexPack' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Tubo para Haste PVC 30 cm', '800090', 'Tubo para haste em PVC 30 cm.', 4.0, 4.2, 4.4, 4.6, 1,
  (SELECT id FROM categories WHERE name = 'Suportes para Bobina' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'FlexPack' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Ventosa', NULL, 'Ventosa para fixação.', 2.5, 2.62, 2.75, 2.88, 1,
  (SELECT id FROM categories WHERE name = 'Suportes para Bobina' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'FlexPack' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Kitcão Marrom Rajado', NULL, 'Kit suporte kitcão marrom rajado.', 70.0, 73.5, 77.0, 80.5, 1,
  (SELECT id FROM categories WHERE name = 'Suportes para Bobina' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'FlexPack' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Homepack Fumê', NULL, 'Homepack fumê.', 60.0, 63.0, 66.0, 69.0, 1,
  (SELECT id FROM categories WHERE name = 'Suportes para Bobina' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'FlexPack' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Filme Stretch 1,8 kg', '800002', 'Filme stretch 1,8 kg. Fardo com 4 unidades (7,2 kg).', 49.5, 51.98, 54.45, 56.92, 4,
  (SELECT id FROM categories WHERE name = 'Filme Stretch' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'FlexPack' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Filme Stretch 2,5 kg', '800003', 'Filme stretch 2,5 kg. Fardo com 4 unidades (10 kg).', 68.75, 72.19, 75.62, 79.06, 4,
  (SELECT id FROM categories WHERE name = 'Filme Stretch' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'FlexPack' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Filme Stretch 3,0 kg sem Tubete', '800004', 'Filme stretch 3,0 kg sem tubete. Fardo com 4 unidades (12 kg).', 84.0, 88.2, 92.4, 96.6, 4,
  (SELECT id FROM categories WHERE name = 'Filme Stretch' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'FlexPack' LIMIT 1),
  'ATIVO', now(), now());

INSERT INTO products (id, name, sku, description, purchase_price, price_a, price_b, price_c, min_quantity, category_id, supplier_id, status, created_at, updated_at)
VALUES (gen_random_uuid(), 'Filme Stretch 3,0 kg Preto', NULL, 'Filme stretch 3,0 kg preto. Fardo com 4 unidades (12 kg).', 84.0, 88.2, 92.4, 96.6, 4,
  (SELECT id FROM categories WHERE name = 'Filme Stretch' LIMIT 1),
  (SELECT id FROM suppliers WHERE name = 'FlexPack' LIMIT 1),
  'ATIVO', now(), now());
