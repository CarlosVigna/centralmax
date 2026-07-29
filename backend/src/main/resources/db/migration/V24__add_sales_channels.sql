CREATE TABLE IF NOT EXISTS sales_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  fixed_fee DECIMAL(15,2) NOT NULL DEFAULT 0,
  variable_fee_percent DECIMAL(5,2) NOT NULL DEFAULT 0,
  fee_base VARCHAR(20) NOT NULL DEFAULT 'TOTAL',
  -- TOTAL = sobre valor total do pedido
  -- PRODUCTS = apenas sobre valor dos produtos (sem frete)
  shipping_responsibility VARCHAR(20) DEFAULT 'CLIENT',
  -- CLIENT, SELLER, PLATFORM
  notes TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Inserir canais padrão
INSERT INTO sales_channels (id, name, fixed_fee, variable_fee_percent, fee_base, notes)
VALUES
  (gen_random_uuid(), 'WhatsApp', 0, 0, 'TOTAL', 'Venda direta via WhatsApp'),
  (gen_random_uuid(), 'Presencial', 0, 0, 'TOTAL', 'Venda presencial'),
  (gen_random_uuid(), 'Mercado Livre', 5.00, 14.0, 'TOTAL', 'Taxa ML padrão'),
  (gen_random_uuid(), 'Shopee', 0, 12.0, 'TOTAL', 'Taxa Shopee padrão'),
  (gen_random_uuid(), 'Instagram', 0, 0, 'TOTAL', 'Venda via Instagram'),
  (gen_random_uuid(), 'TikTok Shop', 0, 8.0, 'TOTAL', 'Taxa TikTok Shop'),
  (gen_random_uuid(), 'Telefone', 0, 0, 'TOTAL', 'Venda por telefone'),
  (gen_random_uuid(), 'Site', 0, 0, 'TOTAL', 'Venda pelo site')
ON CONFLICT DO NOTHING;

-- Adicionar canal ao pedido
ALTER TABLE orders ADD COLUMN IF NOT EXISTS sales_channel_id UUID REFERENCES sales_channels(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS channel_fixed_fee DECIMAL(15,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS channel_variable_fee DECIMAL(15,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS channel_total_fee DECIMAL(15,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS net_profit DECIMAL(15,2) DEFAULT 0;
-- net_profit = totalAmount - channel_total_fee - vendor_commission - product_costs
