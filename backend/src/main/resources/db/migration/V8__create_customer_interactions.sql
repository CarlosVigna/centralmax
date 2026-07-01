CREATE TABLE customer_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id),
    type VARCHAR(20) NOT NULL,
    notes TEXT,
    scheduled_at TIMESTAMP,
    completed_at TIMESTAMP,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT ck_interaction_type CHECK (type IN ('LIGACAO','WHATSAPP','EMAIL','VISITA','REUNIAO','NOTA'))
);

CREATE INDEX idx_interactions_customer_id ON customer_interactions(customer_id);
CREATE INDEX idx_interactions_scheduled_at ON customer_interactions(scheduled_at);
CREATE INDEX idx_interactions_active ON customer_interactions(active);
