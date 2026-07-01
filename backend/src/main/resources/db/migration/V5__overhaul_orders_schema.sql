-- Limpa dados de teste anteriores (schema incompatível com novo modelo)
TRUNCATE TABLE stock_movements CASCADE;
TRUNCATE TABLE order_items CASCADE;
TRUNCATE TABLE orders CASCADE;

-- Sequência global para numeração de pedidos
CREATE SEQUENCE order_number_seq START 1;

-- ============================================================
-- Tabela orders — reestruturação completa
-- ============================================================

-- Remove constraints antigas
ALTER TABLE orders DROP CONSTRAINT IF EXISTS ck_orders_status;
ALTER TABLE orders DROP CONSTRAINT IF EXISTS ck_orders_origin;

-- customer_id torna-se opcional (pedidos avulsos)
ALTER TABLE orders ALTER COLUMN customer_id DROP NOT NULL;

-- Renomeia total → total_amount
ALTER TABLE orders RENAME COLUMN total TO total_amount;

-- Remove coluna origin (não usada no novo modelo)
ALTER TABLE orders DROP COLUMN IF EXISTS origin;

-- Novas colunas
ALTER TABLE orders ADD COLUMN order_number VARCHAR(20);
ALTER TABLE orders ADD COLUMN customer_name VARCHAR(160);
ALTER TABLE orders ADD COLUMN customer_phone VARCHAR(20);
ALTER TABLE orders ADD COLUMN active BOOLEAN NOT NULL DEFAULT true;

-- Nova constraint de status
ALTER TABLE orders ADD CONSTRAINT ck_orders_status
    CHECK (status IN ('NOVO','CONFIRMADO','EM_SEPARACAO','SAIU_ENTREGA','ENTREGUE','CONCLUIDO','CANCELADO'));

-- Índices
CREATE UNIQUE INDEX uq_orders_order_number ON orders(order_number) WHERE order_number IS NOT NULL;
CREATE INDEX idx_orders_active ON orders(active);

-- ============================================================
-- Tabela order_items — adiciona snapshots
-- ============================================================

ALTER TABLE order_items ADD COLUMN product_name VARCHAR(160);
ALTER TABLE order_items ADD COLUMN subtotal NUMERIC(12,2);
