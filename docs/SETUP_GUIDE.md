# Plateful – Complete Setup & Integration Guide

Everything you need to run, connect, and deploy Plateful.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Project Structure](#2-project-structure)
3. [Database Setup](#3-database-setup)
4. [Backend Setup](#4-backend-setup)
5. [Frontend Setup](#5-frontend-setup)
6. [Seed Sample Data](#6-seed-sample-data)
7. [Razorpay Payment Integration](#7-razorpay-payment-integration)
8. [Docker – One-Command Setup](#8-docker--one-command-setup)
9. [Environment Variables Reference](#9-environment-variables-reference)
10. [API Reference](#10-api-reference)
11. [Test Accounts](#11-test-accounts)
12. [Troubleshooting](#12-troubleshooting)

---

## 1. Prerequisites

| Tool       | Version | Check command          |
| ---------- | ------- | ---------------------- |
| Java (JDK) | 21+     | `java --version`       |
| Maven      | 3.9+    | `mvn --version`        |
| Node.js    | 20+     | `node --version`       |
| npm        | 9+      | `npm --version`        |
| PostgreSQL | 15+     | `psql --version`       |
| Docker     | 24+     | `docker --version`     |
| Docker Compose | v2  | `docker compose version` |

---

## 2. Project Structure

```
Plateful/
├── backend/                  # Spring Boot 3.2 + Java 21
│   ├── pom.xml
│   ├── Dockerfile
│   └── src/main/
│       ├── java/com/plateful/
│       │   ├── PlatefulApplication.java
│       │   ├── config/          # SecurityConfig
│       │   ├── controller/      # REST controllers
│       │   ├── dto/             # Request/Response DTOs
│       │   ├── exception/       # GlobalExceptionHandler
│       │   ├── model/           # Entities & Enums
│       │   ├── repository/      # Spring Data JPA repos
│       │   ├── security/        # JWT provider, filters
│       │   └── service/         # Business logic
│       └── resources/
│           └── application.properties
├── frontend/                 # Next.js 14 + Tailwind CSS
│   ├── package.json
│   ├── Dockerfile
│   ├── .env.local
│   └── src/
│       ├── app/              # Pages (App Router)
│       ├── components/       # Shared components
│       └── lib/              # API client & Auth context
├── database/
│   ├── schema.sql            # Reference DDL
│   └── seed.sql              # Sample data
├── docker-compose.yml        # Full-stack orchestration
└── docs/
    ├── ARCHITECTURE.md
    └── SETUP_GUIDE.md        # ← This file
```

---

## 3. Database Setup

### Option A – Local PostgreSQL

```bash
# Create the role and database
psql postgres -c "CREATE ROLE plateful WITH LOGIN PASSWORD 'plateful_secret';"
psql postgres -c "CREATE DATABASE plateful OWNER plateful;"

# Verify
psql -U plateful -d plateful -c "SELECT 1;"
```

### Option B – Docker (standalone)

```bash
docker run -d --name plateful-db \
  -e POSTGRES_USER=plateful \
  -e POSTGRES_PASSWORD=plateful_secret \
  -e POSTGRES_DB=plateful \
  -p 5432:5432 \
  postgres:16-alpine
```

### Connection Details

| Property | Value |
| -------- | ----- |
| Host     | `localhost` |
| Port     | `5432` |
| Database | `plateful` |
| Username | `plateful` |
| Password | `plateful_secret` |
| JDBC URL | `jdbc:postgresql://localhost:5432/plateful` |

The schema is auto-created by Hibernate (`ddl-auto=update`). No manual migration needed.

---

## 4. Backend Setup

```bash
cd backend

# Build
mvn clean package -DskipTests

# Run
java -jar target/plateful-api-1.0.0.jar
```

The API starts at **http://localhost:8080/api**.

### Key Config (application.properties)

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/plateful
spring.datasource.username=plateful
spring.datasource.password=plateful_secret
server.port=8080
server.servlet.context-path=/api
app.jwt.secret=<your-256-bit-secret>
app.jwt.expiration-ms=86400000
app.razorpay.key-id=<your-razorpay-key>
app.razorpay.key-secret=<your-razorpay-secret>
app.cors.allowed-origins=http://localhost:3000
```

---

## 5. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run dev server
npm run dev
```

Opens at **http://localhost:3000**.

### Environment (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXXXX
```

---

## 6. Seed Sample Data

The file `database/seed.sql` contains sample vendors, food listings, customers, and an admin user.

### Load seed data

```bash
# After the backend has run at least once (so Hibernate creates tables)
psql -U plateful -d plateful -f database/seed.sql
```

### What the seed includes

| Entity         | Count | Details |
| -------------- | ----- | ------- |
| Admin user     | 1     | `admin@plateful.com` |
| Vendor users   | 3     | Curry House, Bakery Bites, Dragon Wok |
| Customer users | 2     | Amit, Sara |
| Vendor profiles| 3     | 2 verified, 1 unverified (for admin testing) |
| Food listings  | 6     | Indian, Bakery, Chinese, Desserts |
| Impact metrics | 1     | Pre-populated stats |

> **All seed passwords** use the same BCrypt hash. The raw password is whatever you hash; the current hash in the seed file is a placeholder. To use real passwords, generate hashes with:
> ```bash
> # Using the running app - register through the UI, or use htpasswd/bcrypt CLI
> npx bcryptjs-cli hash "admin123"
> ```
> Then replace the `$2a$10$...` values in `seed.sql`.

---

## 7. Razorpay Payment Integration

### Step 1 – Create a Razorpay Account

1. Go to [https://dashboard.razorpay.com/signup](https://dashboard.razorpay.com/signup)
2. Sign up and switch to **Test Mode**
3. Navigate to **Settings → API Keys → Generate Test Key**

### Step 2 – Configure Backend

In `backend/src/main/resources/application.properties`:

```properties
app.razorpay.key-id=rzp_test_XXXXXXXXX       # Your Test Key ID
app.razorpay.key-secret=XXXXXXXXXXXXXXXX      # Your Test Key Secret
```

Or via environment variables in Docker:

```yaml
RAZORPAY_KEY_ID: rzp_test_XXXXXXXXX
RAZORPAY_KEY_SECRET: XXXXXXXXXXXXXXXX
```

### Step 3 – Configure Frontend

In `frontend/.env.local`:

```env
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_XXXXXXXXX
```

### Step 4 – Payment Flow

```
Customer places order ──→ Backend creates Order (PENDING)
                    ──→ Backend creates Razorpay Order via API
                    ──→ Frontend opens Razorpay checkout modal
                    ──→ Customer pays
                    ──→ Razorpay returns payment_id + signature
                    ──→ Frontend calls PUT /orders/{id}/confirm-payment
                    ──→ Backend verifies signature & marks PAID
```

### Step 5 – Add Razorpay Checkout to Frontend

Add the Razorpay script in your order flow:

```html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

```javascript
const options = {
  key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  amount: order.totalAmount * 100,      // in paise
  currency: "INR",
  name: "Plateful",
  description: `Order #${order.id}`,
  order_id: order.razorpayOrderId,       // from backend
  handler: async function (response) {
    await confirmPayment(order.id, {
      paymentId: response.razorpay_payment_id,
      razorpayOrderId: response.razorpay_order_id,
      razorpaySignature: response.razorpay_signature,
    });
  },
};
const rzp = new Razorpay(options);
rzp.open();
```

### Test Cards (Razorpay Test Mode)

| Card Number        | Expiry | CVV | Result   |
| ------------------ | ------ | --- | -------- |
| 4111 1111 1111 1111 | Any future | Any | Success |
| 4000 0000 0000 0002 | Any future | Any | Decline |

---

## 8. Docker – One-Command Setup

### Start everything

```bash
cd /path/to/Plateful
docker compose up --build
```

This starts:
- **PostgreSQL** on port `5432` (auto-runs `seed.sql` on first launch)
- **Backend** on port `8080`
- **Frontend** on port `3000`

### Stop everything

```bash
docker compose down
```

### Reset database

```bash
docker compose down -v    # removes the volume
docker compose up --build
```

### View logs

```bash
docker compose logs -f backend   # backend only
docker compose logs -f            # all services
```

### Rebuild a single service

```bash
docker compose up --build backend
```

---

## 9. Environment Variables Reference

### Backend

| Variable                        | Default | Description |
| ------------------------------- | ------- | ----------- |
| `SPRING_DATASOURCE_URL`        | `jdbc:postgresql://localhost:5432/plateful` | JDBC connection string |
| `SPRING_DATASOURCE_USERNAME`   | `plateful` | DB username |
| `SPRING_DATASOURCE_PASSWORD`   | `plateful_secret` | DB password |
| `JWT_SECRET`                   | *(set in props)* | 256-bit secret for HS256 JWT signing |
| `JWT_EXPIRATION`               | `86400000` | Token validity in ms (24 hours) |
| `RAZORPAY_KEY_ID`              | `rzp_test_XXX` | Razorpay API key |
| `RAZORPAY_KEY_SECRET`          | — | Razorpay API secret |
| `SERVER_PORT`                  | `8080` | HTTP port |

### Frontend

| Variable                         | Default | Description |
| -------------------------------- | ------- | ----------- |
| `NEXT_PUBLIC_API_URL`           | `http://localhost:8080/api` | Backend API base URL |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID`   | — | Razorpay publishable key |

---

## 10. API Reference

Base URL: `http://localhost:8080/api`

### Auth (Public)

| Method | Endpoint         | Body | Description |
| ------ | ---------------- | ---- | ----------- |
| POST   | `/auth/register` | `{ name, email, password, phone, role, restaurantName?, address?, latitude?, longitude? }` | Register |
| POST   | `/auth/login`    | `{ email, password }` | Login → returns JWT |

### Food Listings (Public GET, Vendor POST/DELETE)

| Method | Endpoint               | Auth | Description |
| ------ | ---------------------- | ---- | ----------- |
| GET    | `/foods`               | No   | All active listings |
| GET    | `/foods/{id}`          | No   | Single listing |
| GET    | `/foods/nearby?latitude=&longitude=&radiusKm=` | No | Geo-filtered |
| GET    | `/foods/category/{cat}` | No  | By category |

### Orders (Customer)

| Method | Endpoint                         | Auth     | Description |
| ------ | -------------------------------- | -------- | ----------- |
| POST   | `/orders`                        | Customer | Place order |
| GET    | `/orders/my`                     | Customer | My orders |
| PUT    | `/orders/{id}/confirm-payment`   | Customer | Confirm Razorpay payment |
| PUT    | `/orders/{id}/cancel`            | Customer | Cancel order |

### Vendor

| Method | Endpoint                            | Auth   | Description |
| ------ | ----------------------------------- | ------ | ----------- |
| POST   | `/vendor/listings`                  | Vendor | Create listing |
| GET    | `/vendor/listings`                  | Vendor | My listings |
| DELETE | `/vendor/listings/{id}`             | Vendor | Delete listing |
| GET    | `/vendor/orders`                    | Vendor | Orders for my listings |
| PUT    | `/vendor/orders/{id}/complete`      | Vendor | Mark order complete |

### Admin

| Method | Endpoint                          | Auth  | Description |
| ------ | --------------------------------- | ----- | ----------- |
| GET    | `/admin/vendors`                  | Admin | All vendors |
| PUT    | `/admin/vendors/{id}/verify`      | Admin | Verify vendor |
| GET    | `/admin/orders`                   | Admin | All orders |

### Impact (Public)

| Method | Endpoint   | Auth | Description |
| ------ | ---------- | ---- | ----------- |
| GET    | `/impact`  | No   | Platform metrics |

### Authentication Header

```
Authorization: Bearer <jwt_token>
```

---

## 11. Test Accounts

After seeding (see section 6), use these accounts:

| Role     | Email                  | Password (register via app or update seed hash) |
| -------- | ---------------------- | ------------------------------------------------ |
| Admin    | `admin@plateful.com`   | Register via API or update seed BCrypt hash       |
| Vendor   | `ravi@curryhouse.com`  | Same as above                                     |
| Vendor   | `priya@bakerybites.com`| Same as above                                     |
| Customer | `amit@example.com`     | Same as above                                     |

> **Quickest way to test**: Just register new users through the UI at http://localhost:3000/register. The seed data pre-populates vendor profiles and food listings.

---

## 12. Troubleshooting

### "Connection refused" on port 8080
- Is the backend running? Check `lsof -i :8080`.
- If using Docker, ensure the backend container started: `docker compose logs backend`.

### "relation does not exist"
- Hibernate needs to run once to create tables. Start the backend, then load seed data.

### CORS errors in browser
- The backend allows `http://localhost:3000` by default.
- If your frontend runs on a different port, update `app.cors.allowed-origins` in `application.properties`.

### JWT token expired
- Tokens last 24 hours. Login again to get a new one.

### Razorpay "Invalid key" error
- Ensure you're using **test mode** keys.
- Key ID goes in both backend and frontend. Key Secret is **backend only**.

### Docker build fails on M1/M2 Mac
- Add `platform: linux/amd64` under the service in `docker-compose.yml` if base images don't support ARM.

### PostgreSQL "role does not exist"
- Create it: `psql postgres -c "CREATE ROLE plateful WITH LOGIN PASSWORD 'plateful_secret';"`

---

## Quick Start Summary

```bash
# ─── Option 1: Docker (recommended) ──────────
docker compose up --build
# Open http://localhost:3000

# ─── Option 2: Manual ────────────────────────
# Terminal 1 – Database
psql postgres -c "CREATE ROLE plateful WITH LOGIN PASSWORD 'plateful_secret';"
psql postgres -c "CREATE DATABASE plateful OWNER plateful;"

# Terminal 2 – Backend
cd backend && mvn clean package -DskipTests && java -jar target/plateful-api-1.0.0.jar

# Terminal 3 – Seed data (after backend is running)
psql -U plateful -d plateful -f database/seed.sql

# Terminal 4 – Frontend
cd frontend && npm install && npm run dev

# Open http://localhost:3000
```
