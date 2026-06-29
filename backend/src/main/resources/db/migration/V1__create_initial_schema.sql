CREATE TABLE users (
    id UUID PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(160) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT uq_users_email UNIQUE (email),
    CONSTRAINT ck_users_role CHECK (role IN ('ADMIN', 'VENDEDOR'))
);

CREATE TABLE categories (
    id UUID PRIMARY KEY,
    name VARCHAR(80) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT uq_categories_name UNIQUE (name),
    CONSTRAINT uq_categories_slug UNIQUE (slug)
);

CREATE TABLE suppliers (
    id UUID PRIMARY KEY,
    name VARCHAR(160) NOT NULL,
    document VARCHAR(20),
    phone VARCHAR(20),
    email VARCHAR(160),
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT uq_suppliers_document UNIQUE (document)
);

CREATE TABLE products (
    id UUID PRIMARY KEY,
    name VARCHAR(160) NOT NULL,
    description TEXT,
    category_id UUID NOT NULL,
    supplier_id UUID,
    price_a NUMERIC(12,2) NOT NULL,
    price_b NUMERIC(12,2) NOT NULL,
    price_c NUMERIC(12,2) NOT NULL,
    main_image_url VARCHAR(500),
    status VARCHAR(20) NOT NULL DEFAULT 'ATIVO',
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(id),
    CONSTRAINT fk_products_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
    CONSTRAINT ck_products_status CHECK (status IN ('ATIVO', 'INATIVO')),
    CONSTRAINT ck_products_price_a CHECK (price_a > 0),
    CONSTRAINT ck_products_price_b CHECK (price_b > 0),
    CONSTRAINT ck_products_price_c CHECK (price_c > 0)
);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_name_lower ON products (LOWER(name));

CREATE TABLE customers (
    id UUID PRIMARY KEY,
    name VARCHAR(160) NOT NULL,
    document VARCHAR(20) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(160),
    address VARCHAR(255),
    customer_type VARCHAR(1) NOT NULL DEFAULT 'C',
    status VARCHAR(20) NOT NULL DEFAULT 'PROSPECT',
    origin VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT uq_customers_document UNIQUE (document),
    CONSTRAINT ck_customers_type CHECK (customer_type IN ('A','B','C')),
    CONSTRAINT ck_customers_status CHECK (status IN ('PROSPECT','ATIVO','INATIVO')),
    CONSTRAINT ck_customers_origin CHECK (origin IN ('LANDING','WHATSAPP','INSTAGRAM','FACEBOOK','MERCADO_LIVRE','SHOPEE','TIKTOK','VISITA','INDICACAO','TELEFONE'))
);
CREATE INDEX idx_customers_status ON customers(status);
CREATE INDEX idx_customers_origin ON customers(origin);

CREATE TABLE orders (
    id UUID PRIMARY KEY,
    customer_id UUID NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ORCAMENTO',
    origin VARCHAR(20) NOT NULL,
    total NUMERIC(12,2) NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES customers(id),
    CONSTRAINT ck_orders_status CHECK (status IN ('ORCAMENTO','CONFIRMADO','EM_PREPARACAO','CONCLUIDO','CANCELADO')),
    CONSTRAINT ck_orders_origin CHECK (origin IN ('LANDING','WHATSAPP','INSTAGRAM','FACEBOOK','MERCADO_LIVRE','SHOPEE','TIKTOK','VISITA','INDICACAO','TELEFONE'))
);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);

CREATE TABLE order_items (
    id UUID PRIMARY KEY,
    order_id UUID NOT NULL,
    product_id UUID NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(12,2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products(id),
    CONSTRAINT ck_order_items_quantity CHECK (quantity > 0),
    CONSTRAINT ck_order_items_unit_price CHECK (unit_price > 0)
);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

CREATE TABLE stock_movements (
    id UUID PRIMARY KEY,
    product_id UUID NOT NULL,
    order_id UUID,
    type VARCHAR(10) NOT NULL,
    quantity INTEGER NOT NULL,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT fk_stock_movements_product FOREIGN KEY (product_id) REFERENCES products(id),
    CONSTRAINT fk_stock_movements_order FOREIGN KEY (order_id) REFERENCES orders(id),
    CONSTRAINT ck_stock_movements_type CHECK (type IN ('ENTRADA','SAIDA')),
    CONSTRAINT ck_stock_movements_quantity CHECK (quantity > 0)
);
CREATE INDEX idx_stock_movements_product_id ON stock_movements(product_id);
CREATE INDEX idx_stock_movements_order_id ON stock_movements(order_id);
CREATE INDEX idx_stock_movements_type ON stock_movements(type);
