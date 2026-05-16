-- ============================================================
-- Plateful — PostgreSQL Schema
-- ============================================================
-- Requires: PostgreSQL 15+ with PostGIS extension
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ──────────────────────────────────────────────────────────────
-- ENUM TYPES
-- ──────────────────────────────────────────────────────────────

CREATE TYPE user_role AS ENUM ('ROLE_CUSTOMER', 'ROLE_VENDOR', 'ROLE_ADMIN');
CREATE TYPE order_status AS ENUM ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED');
CREATE TYPE payment_status AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');

-- ──────────────────────────────────────────────────────────────
-- USERS
-- ──────────────────────────────────────────────────────────────

CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(120)    NOT NULL,
    email           VARCHAR(255)    NOT NULL UNIQUE,
    password_hash   VARCHAR(255)    NOT NULL,
    phone           VARCHAR(20),
    role            user_role       NOT NULL DEFAULT 'ROLE_CUSTOMER',
    latitude        DOUBLE PRECISION,
    longitude       DOUBLE PRECISION,
    location        GEOGRAPHY(POINT, 4326),
    avatar_url      VARCHAR(500),
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role  ON users(role);
CREATE INDEX idx_users_location ON users USING GIST(location);

-- ──────────────────────────────────────────────────────────────
-- VENDORS
-- ──────────────────────────────────────────────────────────────

CREATE TABLE vendors (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID            NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    restaurant_name VARCHAR(200)    NOT NULL,
    description     TEXT,
    address         TEXT            NOT NULL,
    latitude        DOUBLE PRECISION NOT NULL,
    longitude       DOUBLE PRECISION NOT NULL,
    location        GEOGRAPHY(POINT, 4326),
    phone           VARCHAR(20),
    logo_url        VARCHAR(500),
    verified        BOOLEAN         NOT NULL DEFAULT FALSE,
    rating          DECIMAL(2,1)    DEFAULT 0.0,
    total_ratings   INTEGER         DEFAULT 0,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_vendors_user    ON vendors(user_id);
CREATE INDEX idx_vendors_verified ON vendors(verified);
CREATE INDEX idx_vendors_location ON vendors USING GIST(location);

-- ──────────────────────────────────────────────────────────────
-- FOOD LISTINGS
-- ──────────────────────────────────────────────────────────────

CREATE TABLE food_listings (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id           UUID            NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    food_name           VARCHAR(200)    NOT NULL,
    description         TEXT,
    image_url           VARCHAR(500),
    original_price      DECIMAL(10,2)   NOT NULL,
    discount_percent    INTEGER         NOT NULL DEFAULT 0 CHECK (discount_percent BETWEEN 0 AND 100),
    selling_price       DECIMAL(10,2)   NOT NULL,
    quantity_available  INTEGER         NOT NULL CHECK (quantity_available >= 0),
    quantity_sold       INTEGER         NOT NULL DEFAULT 0,
    category            VARCHAR(50),
    pickup_start_time   TIMESTAMPTZ     NOT NULL,
    pickup_end_time     TIMESTAMPTZ     NOT NULL,
    is_active           BOOLEAN         NOT NULL DEFAULT TRUE,
    dynamic_pricing_enabled BOOLEAN     NOT NULL DEFAULT FALSE,
    minimum_price       DECIMAL(10,2),
    price_drop_threshold_hours INTEGER  DEFAULT 2,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_pickup_window CHECK (pickup_end_time > pickup_start_time),
    CONSTRAINT chk_selling_price CHECK (selling_price >= 0)
);

CREATE INDEX idx_listings_vendor   ON food_listings(vendor_id);
CREATE INDEX idx_listings_active   ON food_listings(is_active);
CREATE INDEX idx_listings_pickup   ON food_listings(pickup_start_time, pickup_end_time);
CREATE INDEX idx_listings_category ON food_listings(category);

-- ──────────────────────────────────────────────────────────────
-- ORDERS
-- ──────────────────────────────────────────────────────────────

CREATE TABLE orders (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID            NOT NULL REFERENCES users(id),
    listing_id          UUID            NOT NULL REFERENCES food_listings(id),
    vendor_id           UUID            NOT NULL REFERENCES vendors(id),
    quantity            INTEGER         NOT NULL CHECK (quantity > 0),
    unit_price          DECIMAL(10,2)   NOT NULL,
    total_amount        DECIMAL(10,2)   NOT NULL,
    payment_status      payment_status  NOT NULL DEFAULT 'PENDING',
    order_status        order_status    NOT NULL DEFAULT 'PENDING',
    payment_id          VARCHAR(255),
    razorpay_order_id   VARCHAR(255),
    razorpay_signature  VARCHAR(255),
    pickup_code         VARCHAR(6),
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_user    ON orders(user_id);
CREATE INDEX idx_orders_vendor  ON orders(vendor_id);
CREATE INDEX idx_orders_listing ON orders(listing_id);
CREATE INDEX idx_orders_status  ON orders(order_status);

-- ──────────────────────────────────────────────────────────────
-- RATINGS
-- ──────────────────────────────────────────────────────────────

CREATE TABLE ratings (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID        NOT NULL REFERENCES users(id),
    vendor_id   UUID        NOT NULL REFERENCES vendors(id),
    order_id    UUID        NOT NULL REFERENCES orders(id) UNIQUE,
    score       INTEGER     NOT NULL CHECK (score BETWEEN 1 AND 5),
    comment     TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(user_id, order_id)
);

CREATE INDEX idx_ratings_vendor ON ratings(vendor_id);

-- ──────────────────────────────────────────────────────────────
-- IMPACT METRICS (singleton / aggregated row)
-- ──────────────────────────────────────────────────────────────

CREATE TABLE impact_metrics (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meals_saved         BIGINT          NOT NULL DEFAULT 0,
    co2_saved_kg        DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
    revenue_recovered   DECIMAL(14,2)   NOT NULL DEFAULT 0.00,
    total_orders        BIGINT          NOT NULL DEFAULT 0,
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- Seed the singleton row
INSERT INTO impact_metrics (meals_saved, co2_saved_kg, revenue_recovered, total_orders)
VALUES (0, 0.00, 0.00, 0);

-- ──────────────────────────────────────────────────────────────
-- NOTIFICATIONS
-- ──────────────────────────────────────────────────────────────

CREATE TABLE notifications (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title       VARCHAR(200)    NOT NULL,
    message     TEXT            NOT NULL,
    is_read     BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);

-- ──────────────────────────────────────────────────────────────
-- HELPER FUNCTION: Update location geography from lat/lng
-- ──────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_user_location()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
        NEW.location = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_user_location
    BEFORE INSERT OR UPDATE OF latitude, longitude ON users
    FOR EACH ROW EXECUTE FUNCTION update_user_location();

CREATE OR REPLACE FUNCTION update_vendor_location()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
        NEW.location = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_vendor_location
    BEFORE INSERT OR UPDATE OF latitude, longitude ON vendors
    FOR EACH ROW EXECUTE FUNCTION update_vendor_location();

-- ──────────────────────────────────────────────────────────────
-- HELPER FUNCTION: Auto-update updated_at
-- ──────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated      BEFORE UPDATE ON users          FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER trg_vendors_updated     BEFORE UPDATE ON vendors        FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER trg_listings_updated    BEFORE UPDATE ON food_listings  FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER trg_orders_updated      BEFORE UPDATE ON orders         FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER trg_metrics_updated     BEFORE UPDATE ON impact_metrics FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- ──────────────────────────────────────────────────────────────
-- SUPABASE REALTIME
-- ──────────────────────────────────────────────────────────────

DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime;
ALTER PUBLICATION supabase_realtime ADD TABLE food_listings;
ALTER PUBLICATION supabase_realtime ADD TABLE orders;

-- ──────────────────────────────────────────────────────────────
-- MATERIALIZED VIEWS (ANALYTICS)
-- ──────────────────────────────────────────────────────────────

CREATE MATERIALIZED VIEW vendor_analytics AS
SELECT 
    vendor_id,
    COUNT(id) AS total_orders,
    SUM(total_amount) AS total_revenue,
    DATE_TRUNC('day', created_at) AS order_date
FROM orders
WHERE order_status = 'COMPLETED'
GROUP BY vendor_id, DATE_TRUNC('day', created_at);

CREATE UNIQUE INDEX idx_vendor_analytics ON vendor_analytics (vendor_id, order_date);

