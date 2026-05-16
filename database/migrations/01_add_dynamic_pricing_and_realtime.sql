-- ============================================================
-- Plateful — Migration 01
-- Description: Dynamic Pricing, Supabase Realtime, Analytics
-- ============================================================

BEGIN;

-- 1. Real-Time Synchronization
-- Drop if it already exists, then create the publication for Supabase Realtime
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime;
ALTER PUBLICATION supabase_realtime ADD TABLE food_listings;
ALTER PUBLICATION supabase_realtime ADD TABLE orders;

-- 2. Dynamic Pricing & Expiry
-- Add specific fields to support automated price dropping
ALTER TABLE food_listings
    ADD COLUMN dynamic_pricing_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN minimum_price DECIMAL(10,2),
    ADD COLUMN price_drop_threshold_hours INTEGER DEFAULT 2;

-- Update existing rows to have minimum_price equal to selling_price if needed
UPDATE food_listings SET minimum_price = selling_price WHERE minimum_price IS NULL;

-- 3. Analytics (Materialized Views)
-- Create a view for vendor dashboards
CREATE MATERIALIZED VIEW vendor_analytics AS
SELECT 
    vendor_id,
    COUNT(id) AS total_orders,
    SUM(total_amount) AS total_revenue,
    DATE_TRUNC('day', created_at) AS order_date
FROM orders
WHERE order_status = 'COMPLETED'
GROUP BY vendor_id, DATE_TRUNC('day', created_at);

-- Index to refresh the materialized view concurrently if needed
CREATE UNIQUE INDEX idx_vendor_analytics ON vendor_analytics (vendor_id, order_date);

COMMIT;
