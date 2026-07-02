CREATE TABLE financial_entries (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type        VARCHAR(20)      NOT NULL,
    status      VARCHAR(20)      NOT NULL DEFAULT 'PENDENTE',
    description VARCHAR(255)     NOT NULL,
    amount      NUMERIC(12, 2)   NOT NULL,
    due_date    DATE             NOT NULL,
    paid_at     TIMESTAMP WITH TIME ZONE,
    order_id    UUID REFERENCES orders (id),
    notes       TEXT,
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_financial_type       ON financial_entries (type);
CREATE INDEX idx_financial_status     ON financial_entries (status);
CREATE INDEX idx_financial_due_date   ON financial_entries (due_date);
CREATE INDEX idx_financial_order_id   ON financial_entries (order_id);
CREATE INDEX idx_financial_paid_at    ON financial_entries (paid_at);
