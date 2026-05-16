-- ============================================================
-- Plateful – Seed Data
-- Run AFTER Hibernate creates the schema (ddl-auto=update).
-- ============================================================

-- ─── Admin User (password: admin123) ─────────────────────────
-- BCrypt hash of "admin123"
INSERT INTO users (id, name, email, password_hash, phone, role, latitude, longitude, created_at, updated_at)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Admin',
  'admin@plateful.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  '9000000001',
  'ROLE_ADMIN',
  19.0760, 72.8777,
  NOW(), NOW()
) ON CONFLICT (email) DO NOTHING;

-- ─── Vendor Users ────────────────────────────────────────────
-- password: vendor123
INSERT INTO users (id, name, email, password_hash, phone, role, latitude, longitude, created_at, updated_at)
VALUES
  ('b0000000-0000-0000-0000-000000000001', 'Ravi Kumar', 'ravi@curryhouse.com',
   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
   '9100000001', 'ROLE_VENDOR', 19.0760, 72.8777, NOW(), NOW()),

  ('b0000000-0000-0000-0000-000000000002', 'Priya Sharma', 'priya@bakerybites.com',
   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
   '9100000002', 'ROLE_VENDOR', 19.0830, 72.8750, NOW(), NOW()),

  ('b0000000-0000-0000-0000-000000000003', 'Chen Wei', 'chen@dragonwok.com',
   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
   '9100000003', 'ROLE_VENDOR', 19.0700, 72.8800, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- ─── Customer Users ──────────────────────────────────────────
-- password: customer123
INSERT INTO users (id, name, email, password_hash, phone, role, latitude, longitude, created_at, updated_at)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'Amit Patel', 'amit@example.com',
   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
   '9200000001', 'ROLE_CUSTOMER', 19.0750, 72.8770, NOW(), NOW()),

  ('c0000000-0000-0000-0000-000000000002', 'Sara Khan', 'sara@example.com',
   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
   '9200000002', 'ROLE_CUSTOMER', 19.0800, 72.8720, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- ─── Vendor Profiles ─────────────────────────────────────────
INSERT INTO vendors (id, user_id, restaurant_name, description, address, latitude, longitude, phone, verified, rating, total_ratings, created_at, updated_at)
VALUES
  ('d0000000-0000-0000-0000-000000000001',
   'b0000000-0000-0000-0000-000000000001',
   'Curry House', 'Authentic North Indian cuisine with daily specials',
   '123 MG Road, Mumbai', 19.0760, 72.8777, '9100000001',
   true, 4.5, 12, NOW(), NOW()),

  ('d0000000-0000-0000-0000-000000000002',
   'b0000000-0000-0000-0000-000000000002',
   'Bakery Bites', 'Fresh breads, cakes, and pastries',
   '456 Hill Road, Mumbai', 19.0830, 72.8750, '9100000002',
   true, 4.8, 8, NOW(), NOW()),

  ('d0000000-0000-0000-0000-000000000003',
   'b0000000-0000-0000-0000-000000000003',
   'Dragon Wok', 'Indo-Chinese street food favorites',
   '789 Carter Road, Mumbai', 19.0700, 72.8800, '9100000003',
   false, 0.0, 0, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- ─── Food Listings ───────────────────────────────────────────
INSERT INTO food_listings (id, vendor_id, food_name, description, original_price, discount_percent, selling_price, quantity_available, quantity_sold, category, pickup_start_time, pickup_end_time, is_active, created_at, updated_at)
VALUES
  ('e0000000-0000-0000-0000-000000000001',
   'd0000000-0000-0000-0000-000000000001',
   'Butter Chicken Thali', 'Butter chicken, dal, rice, naan, salad',
   250.00, 40, 150.00, 10, 3, 'Indian',
   '18:00:00', '21:00:00', true, NOW(), NOW()),

  ('e0000000-0000-0000-0000-000000000002',
   'd0000000-0000-0000-0000-000000000001',
   'Paneer Tikka Wrap', 'Grilled paneer tikka in a whole wheat wrap',
   180.00, 35, 117.00, 8, 1, 'Indian',
   '12:00:00', '15:00:00', true, NOW(), NOW()),

  ('e0000000-0000-0000-0000-000000000003',
   'd0000000-0000-0000-0000-000000000002',
   'Assorted Bread Box', '6 mixed breads: sourdough, multigrain, garlic',
   300.00, 50, 150.00, 5, 2, 'Bakery',
   '19:00:00', '21:00:00', true, NOW(), NOW()),

  ('e0000000-0000-0000-0000-000000000004',
   'd0000000-0000-0000-0000-000000000002',
   'Chocolate Pastry Pack', '4 assorted chocolate pastries',
   400.00, 45, 220.00, 6, 0, 'Desserts',
   '17:00:00', '20:00:00', true, NOW(), NOW()),

  ('e0000000-0000-0000-0000-000000000005',
   'd0000000-0000-0000-0000-000000000003',
   'Hakka Noodles Combo', 'Veg hakka noodles + manchurian + spring rolls',
   220.00, 30, 154.00, 12, 5, 'Chinese',
   '13:00:00', '16:00:00', true, NOW(), NOW()),

  ('e0000000-0000-0000-0000-000000000006',
   'd0000000-0000-0000-0000-000000000003',
   'Dim Sum Platter', '8 pc mixed dim sum with dipping sauces',
   350.00, 40, 210.00, 4, 0, 'Chinese',
   '18:00:00', '21:00:00', true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- ─── Impact Metrics (initial) ────────────────────────────────
INSERT INTO impact_metrics (id, meals_saved, co2_saved_kg, revenue_recovered, total_orders, updated_at)
VALUES (
  'f0000000-0000-0000-0000-000000000001',
  11, 27.5, 1571.00, 11, NOW()
) ON CONFLICT DO NOTHING;
