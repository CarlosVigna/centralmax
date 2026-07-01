-- Torna phone e document opcionais (eram NOT NULL)
ALTER TABLE customers
    ALTER COLUMN phone DROP NOT NULL,
    ALTER COLUMN document DROP NOT NULL;

-- Campos novos para soft delete e observações internas
ALTER TABLE customers ADD COLUMN notes TEXT;
ALTER TABLE customers ADD COLUMN active BOOLEAN NOT NULL DEFAULT true;

-- Unicidade de email (apenas quando preenchido)
CREATE UNIQUE INDEX uq_customers_email ON customers(email) WHERE email IS NOT NULL;

CREATE INDEX idx_customers_active ON customers(active);
