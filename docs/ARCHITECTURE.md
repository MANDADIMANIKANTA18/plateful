# Plateful — System Architecture

## Vision
Plateful is a location-based surplus food redistribution platform connecting restaurants with unsold meals to nearby cost-conscious customers, reducing food waste and CO₂ emissions.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENTS                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  Customer App │  │  Vendor App  │  │  Admin Dashboard     │  │
│  │  (Next.js)   │  │  (Next.js)   │  │  (Next.js)           │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘  │
│         │                 │                      │              │
│         └─────────────────┼──────────────────────┘              │
│                           │                                     │
│                    HTTPS / REST                                  │
└───────────────────────────┼─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API GATEWAY / BACKEND                        │
│                    (Spring Boot 3.x)                            │
│                                                                 │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐               │
│  │  Auth      │  │  Food      │  │  Order     │               │
│  │  Module    │  │  Module    │  │  Module    │               │
│  ├────────────┤  ├────────────┤  ├────────────┤               │
│  │  JWT Issue │  │  CRUD      │  │  Reserve   │               │
│  │  RBAC      │  │  Geo Query │  │  Payment   │               │
│  │  BCrypt    │  │  Search    │  │  Status    │               │
│  └────────────┘  └────────────┘  └────────────┘               │
│                                                                 │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐               │
│  │  Vendor    │  │  Admin     │  │  Impact    │               │
│  │  Module    │  │  Module    │  │  Module    │               │
│  ├────────────┤  ├────────────┤  ├────────────┤               │
│  │  Listings  │  │  Verify    │  │  CO₂ Calc  │               │
│  │  Analytics │  │  Moderate  │  │  Metrics   │               │
│  │  Bookings  │  │  Dashboard │  │  Dashboard │               │
│  └────────────┘  └────────────┘  └────────────┘               │
│                                                                 │
│  ┌──────────────────────────────────────────────┐              │
│  │           Spring Security Filter Chain        │              │
│  │  JWT Filter → Auth Provider → Role Resolver   │              │
│  └──────────────────────────────────────────────┘              │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                     JDBC / JPA                                    
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                                 │
│                                                                 │
│  ┌──────────────────────────────────────────────┐              │
│  │              PostgreSQL 15+                   │              │
│  │                                               │              │
│  │  users │ vendors │ food_listings │ orders     │              │
│  │  impact_metrics │ ratings                     │              │
│  │                                               │              │
│  │  PostGIS Extension (Geolocation Queries)      │              │
│  └──────────────────────────────────────────────┘              │
└─────────────────────────────────────────────────────────────────┘

              ┌─────────────────────────┐
              │   EXTERNAL SERVICES     │
              │                         │
              │  • Razorpay (Payments)  │
              │  • Mapbox (Maps/Geo)    │
              │  • SMTP (Email)         │
              └─────────────────────────┘
```

---

## Layered Architecture (Backend)

```
┌────────────────────────────────────────┐
│           Controller Layer             │  ← REST endpoints
├────────────────────────────────────────┤
│            Service Layer               │  ← Business logic
├────────────────────────────────────────┤
│          Repository Layer              │  ← Data access (JPA)
├────────────────────────────────────────┤
│           Entity / Model               │  ← Domain objects
├────────────────────────────────────────┤
│        PostgreSQL Database             │  ← Persistence
└────────────────────────────────────────┘
```

Cross-cutting concerns:
- **Security**: JWT filter chain intercepts every request
- **DTOs**: Decouple API contracts from internal entities
- **Exception Handling**: Global `@ControllerAdvice`
- **Validation**: Bean Validation (Jakarta)

---

## Key Architectural Decisions

| Decision | Rationale |
|---|---|
| **Monolith-first** | Faster MVP delivery; decompose later when scale demands |
| **PostGIS for geo** | Native SQL distance queries; avoids external geo service dependency |
| **JWT stateless auth** | Horizontally scalable; no session storage needed |
| **Next.js SSR** | SEO for public food listings; fast initial load |
| **Razorpay sandbox** | Quick payment integration; PCI-compliant hosted checkout |
| **Docker Compose** | One-command local dev environment |

---

## Data Flow: Order Lifecycle

```
Customer browses nearby food (GET /api/foods/nearby?lat=X&lng=Y&radius=Z)
        │
        ▼
Customer selects listing → views details (GET /api/foods/{id})
        │
        ▼
Customer reserves meal (POST /api/orders)
        │
        ▼
Backend creates order (status=PENDING) → returns Razorpay order_id
        │
        ▼
Frontend opens Razorpay Checkout → user pays
        │
        ▼
Razorpay webhook/callback → Backend verifies signature
        │
        ▼
Order status → CONFIRMED, listing quantity decremented
        │
        ▼
ImpactMetrics updated (meals_saved++, co2_saved += 2.5kg)
        │
        ▼
Customer picks up food during pickup window
        │
        ▼
Vendor marks order COMPLETED
```

---

## Security Architecture

```
Request → JwtAuthenticationFilter
              │
              ├─ Extract token from Authorization header
              ├─ Validate token signature + expiry
              ├─ Load UserDetails from DB
              ├─ Set SecurityContext
              │
              ▼
         Spring Security FilterChain
              │
              ├─ /api/auth/**        → permitAll
              ├─ /api/foods/nearby   → permitAll  
              ├─ /api/orders/**      → ROLE_CUSTOMER
              ├─ /api/vendor/**      → ROLE_VENDOR
              ├─ /api/admin/**       → ROLE_ADMIN
              │
              ▼
         Controller Method Execution
```

---

## Environment & Deployment

| Environment | Infra | Database |
|---|---|---|
| Local Dev | Docker Compose | PostgreSQL container |
| Staging | Railway / Render | Managed PostgreSQL |
| Production | AWS ECS / EB | RDS PostgreSQL |

---

## Impact Calculation Formula

```
meals_saved   = Σ (order.quantity) for all COMPLETED orders
co2_saved_kg  = meals_saved × 2.5
revenue_recovered = Σ (order.quantity × listing.discounted_price)
```

Source: WRAP UK estimates ~2.5 kg CO₂e per meal wasted (production + disposal).
