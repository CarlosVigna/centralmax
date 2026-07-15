-- Vendor/commission fields on users
ALTER TABLE users ADD COLUMN IF NOT EXISTS commission_price_a NUMERIC(5,2);
ALTER TABLE users ADD COLUMN IF NOT EXISTS commission_price_b NUMERIC(5,2);
ALTER TABLE users ADD COLUMN IF NOT EXISTS commission_price_c NUMERIC(5,2);
ALTER TABLE users ADD COLUMN IF NOT EXISTS territory TEXT;

-- Max discount per product
ALTER TABLE products ADD COLUMN IF NOT EXISTS max_discount_percent NUMERIC(5,2) NOT NULL DEFAULT 100;

-- Track which user created each customer/order
ALTER TABLE customers ADD COLUMN IF NOT EXISTS created_by_user_id UUID;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS created_by_user_id UUID;

-- Activity feed
CREATE TABLE IF NOT EXISTS activity_feed (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    user_name VARCHAR(120) NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    entity_label VARCHAR(255),
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_activity_feed_created ON activity_feed(created_at DESC);

-- Push subscriptions
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    endpoint TEXT NOT NULL UNIQUE,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user ON push_subscriptions(user_id);
