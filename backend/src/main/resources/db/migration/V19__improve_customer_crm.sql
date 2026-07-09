-- CRM avançado: perfil comercial do cliente
ALTER TABLE customers ADD COLUMN IF NOT EXISTS commercial_potential INTEGER CHECK (commercial_potential BETWEEN 1 AND 5);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS commercial_notes TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS business_type VARCHAR(100);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS prospect_status VARCHAR(50);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS lost_reason VARCHAR(255);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS average_ticket DECIMAL(15,2) DEFAULT 0;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS total_purchased DECIMAL(15,2) DEFAULT 0;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS last_purchase_date DATE;

-- Resultado do contato na agenda
ALTER TABLE contact_schedules ADD COLUMN IF NOT EXISTS result VARCHAR(50);
ALTER TABLE contact_schedules ADD COLUMN IF NOT EXISTS rescheduled_to DATE;
