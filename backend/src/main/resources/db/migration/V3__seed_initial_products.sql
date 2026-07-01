-- Fornecedor
INSERT INTO suppliers (id, name, document, phone, email, active, created_at, updated_at)
VALUES (
    'b0000000-0000-0000-0000-000000000001',
    'Emplay Embalagens',
    NULL,
    NULL,
    NULL,
    true,
    now(),
    now()
);

-- Categoria
INSERT INTO categories (id, name, slug, active, created_at, updated_at)
VALUES (
    'c0000000-0000-0000-0000-000000000001',
    'Sacos Plásticos',
    'sacos-plasticos',
    true,
    now(),
    now()
);

-- Produtos
INSERT INTO products (id, name, description, category_id, supplier_id, price_a, price_b, price_c, main_image_url, status, created_at, updated_at)
VALUES
(
    'd0000000-0000-0000-0000-000000000001',
    'Saco Plástico PEBD 15x25x0,06',
    'Saco plástico de polietileno de baixa densidade. 400g, 444 unidades por kg. 100% virgem, transparente, homologado para alimento.',
    'c0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    8.90,
    10.50,
    12.90,
    NULL,
    'ATIVO',
    now(),
    now()
),
(
    'd0000000-0000-0000-0000-000000000002',
    'Saco Plástico PEBD 20x30x0,06',
    'Saco plástico de polietileno de baixa densidade. 1kg, 277 unidades por kg. 100% virgem, transparente, homologado para alimento.',
    'c0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    12.90,
    15.50,
    18.90,
    NULL,
    'ATIVO',
    now(),
    now()
),
(
    'd0000000-0000-0000-0000-000000000003',
    'Saco Plástico PEBD 35x45x0,06',
    'Saco plástico de polietileno de baixa densidade. 5kg, 105 unidades por kg. 100% virgem, transparente, homologado para alimento.',
    'c0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    28.90,
    34.50,
    39.90,
    NULL,
    'ATIVO',
    now(),
    now()
),
(
    'd0000000-0000-0000-0000-000000000004',
    'Saco Plástico PEBD 40x60x0,10',
    'Saco plástico de polietileno de baixa densidade. 10kg, 41 unidades por kg. 100% virgem, transparente, homologado para alimento.',
    'c0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    42.90,
    49.50,
    57.90,
    NULL,
    'ATIVO',
    now(),
    now()
);
