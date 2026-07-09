ALTER TABLE customers ADD COLUMN IF NOT EXISTS contact_cadence_days INTEGER;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS next_contact_date DATE;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS last_contacted_at TIMESTAMP;

CREATE TABLE IF NOT EXISTS contact_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id),
  scheduled_date DATE NOT NULL,
  reason VARCHAR(255),
  status VARCHAR(20) NOT NULL DEFAULT 'PENDENTE',
  notes TEXT,
  completed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_contact_schedules_customer ON contact_schedules(customer_id);
CREATE INDEX IF NOT EXISTS idx_contact_schedules_date ON contact_schedules(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_contact_schedules_status ON contact_schedules(status, scheduled_date);
