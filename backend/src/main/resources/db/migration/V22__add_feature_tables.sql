-- Descontos por volume por produto
CREATE TABLE IF NOT EXISTS product_volume_discounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  min_quantity INTEGER NOT NULL,
  discount_percent DECIMAL(5,2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_volume_discounts_product ON product_volume_discounts(product_id);

-- Histórico de status do pedido
CREATE TABLE IF NOT EXISTS order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id),
  status VARCHAR(50) NOT NULL,
  changed_at TIMESTAMP NOT NULL DEFAULT now(),
  changed_by UUID REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_order_status_history_order ON order_status_history(order_id);

-- Histórico de preços do produto
CREATE TABLE IF NOT EXISTS product_price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id),
  old_purchase_price DECIMAL(15,2),
  new_purchase_price DECIMAL(15,2),
  old_price_a DECIMAL(15,2),
  new_price_a DECIMAL(15,2),
  old_price_b DECIMAL(15,2),
  new_price_b DECIMAL(15,2),
  old_price_c DECIMAL(15,2),
  new_price_c DECIMAL(15,2),
  changed_at TIMESTAMP NOT NULL DEFAULT now(),
  changed_by UUID REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_price_history_product ON product_price_history(product_id);

-- Tipo de documento do cliente
ALTER TABLE customers ADD COLUMN IF NOT EXISTS document_type VARCHAR(10) DEFAULT 'CNPJ';
