# Sippy - System Architecture

## Overview

Sippy follows a microservices architecture designed for scalability, reliability, and maintainability. The system is built to handle high transaction volumes while maintaining sub-second response times for critical POS operations.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
├─────────────────┬─────────────────┬──────────────────┬─────────────────────┤
│   POS Terminal  │   Admin Portal  │  Customer App    │   Online Ordering   │
│   (React/Electron)│  (Next.js)     │  (React Native)  │   (Next.js PWA)     │
└────────┬────────┴────────┬────────┴────────┬─────────┴──────────┬──────────┘
         │                 │                  │                    │
         └────────────────┼──────────────────┼────────────────────┘
                          │                  │
                          ▼                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           API GATEWAY LAYER                                  │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                     Kong / AWS API Gateway                            │  │
│  │  • Rate Limiting  • Authentication  • Request Routing  • SSL/TLS     │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SERVICE MESH (Istio)                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │    Auth     │ │    Order    │ │   Payment   │ │   Loyalty   │          │
│  │   Service   │ │   Service   │ │   Service   │ │   Service   │          │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘          │
│                                                                              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │   Catalog   │ │    Table    │ │  Analytics  │ │Notification │          │
│  │   Service   │ │   Service   │ │   Service   │ │   Service   │          │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘          │
│                                                                              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │   Report    │ │    Cafe     │ │   Profile   │ │ Settlement  │          │
│  │   Service   │ │   Service   │ │   Service   │ │   Service   │          │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DATA LAYER                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │ PostgreSQL  │ │    Redis    │ │ TimescaleDB │ │ Vercel Blob │          │
│  │  (Primary)  │ │   (Cache)   │ │  (Metrics)  │ │   (Media)   │          │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘          │
│                                                                              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                           │
│  │   Kafka     │ │Elasticsearch│ │   MLflow    │                           │
│  │  (Events)   │ │  (Search)   │ │    (ML)     │                           │
│  └─────────────┘ └─────────────┘ └─────────────┘                           │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Service Architecture

### Core Services

#### 1. Auth Service
**Purpose**: Authentication, authorization, and identity management

```
┌─────────────────────────────────────────────────┐
│                 AUTH SERVICE                     │
├─────────────────────────────────────────────────┤
│  Endpoints:                                      │
│  ├── POST /auth/login                           │
│  ├── POST /auth/register                        │
│  ├── POST /auth/refresh                         │
│  ├── POST /auth/logout                          │
│  ├── POST /auth/forgot-password                 │
│  ├── GET  /auth/me                              │
│  └── POST /auth/verify                          │
├─────────────────────────────────────────────────┤
│  Dependencies:                                   │
│  ├── PostgreSQL (user data)                     │
│  ├── Redis (sessions, rate limiting)            │
│  └── SendGrid (email verification)              │
├─────────────────────────────────────────────────┤
│  Events Published:                               │
│  ├── user.created                               │
│  ├── user.verified                              │
│  └── user.password_changed                      │
└─────────────────────────────────────────────────┘
```

**Key Features**:
- JWT with short-lived access tokens (15 min)
- Refresh token rotation
- Multi-factor authentication support
- OAuth2 integration (Google, Apple)
- Role-based access control (RBAC)

---

#### 2. Order Service
**Purpose**: Order lifecycle management

```
┌─────────────────────────────────────────────────┐
│                 ORDER SERVICE                    │
├─────────────────────────────────────────────────┤
│  Endpoints:                                      │
│  ├── POST   /orders                             │
│  ├── GET    /orders/:id                         │
│  ├── PATCH  /orders/:id                         │
│  ├── PATCH  /orders/:id/status                  │
│  ├── POST   /orders/:id/items                   │
│  ├── DELETE /orders/:id/items/:itemId           │
│  ├── GET    /cafes/:id/orders                   │
│  └── GET    /customers/:id/orders               │
├─────────────────────────────────────────────────┤
│  Dependencies:                                   │
│  ├── PostgreSQL (order data)                    │
│  ├── Redis (order cache, locks)                 │
│  ├── Catalog Service (product validation)       │
│  └── Notification Service (status updates)      │
├─────────────────────────────────────────────────┤
│  Events Published:                               │
│  ├── order.created                              │
│  ├── order.updated                              │
│  ├── order.status_changed                       │
│  └── order.completed                            │
└─────────────────────────────────────────────────┘
```

**Order State Machine**:
```
                    ┌─────────────────────────────────────┐
                    │                                     │
                    ▼                                     │
┌─────────┐    ┌─────────┐    ┌──────────┐    ┌─────────┴─┐
│ CREATED │───▶│ PENDING │───▶│PREPARING │───▶│   READY   │
└─────────┘    └─────────┘    └──────────┘    └───────────┘
     │              │              │                │
     │              │              │                │
     ▼              ▼              ▼                ▼
┌─────────────────────────────────────────────────────────┐
│                      CANCELLED                           │
└─────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────┐
│                      COMPLETED                           │
└─────────────────────────────────────────────────────────┘
```

---

#### 3. Payment Service
**Purpose**: Payment processing and financial transactions

```
┌─────────────────────────────────────────────────┐
│                PAYMENT SERVICE                   │
├─────────────────────────────────────────────────┤
│  Endpoints:                                      │
│  ├── POST   /payments/intent                    │
│  ├── POST   /payments/confirm                   │
│  ├── POST   /payments/capture                   │
│  ├── POST   /payments/refund                    │
│  ├── GET    /payments/:id                       │
│  ├── POST   /payments/cash                      │
│  └── GET    /cafes/:id/transactions             │
├─────────────────────────────────────────────────┤
│  Dependencies:                                   │
│  ├── PostgreSQL (transaction records)           │
│  ├── Stripe (card processing)                   │
│  ├── Order Service (order validation)           │
│  └── Loyalty Service (point application)        │
├─────────────────────────────────────────────────┤
│  Events Published:                               │
│  ├── payment.initiated                          │
│  ├── payment.completed                          │
│  ├── payment.failed                             │
│  └── payment.refunded                           │
└─────────────────────────────────────────────────┘
```

**Payment Flow**:
```
┌──────────┐     ┌─────────────┐     ┌────────┐     ┌────────────┐
│   POS    │────▶│   Payment   │────▶│ Stripe │────▶│   Bank     │
│ Terminal │     │   Service   │     │  API   │     │  Network   │
└──────────┘     └─────────────┘     └────────┘     └────────────┘
     │                  │                                  │
     │                  │         ┌─────────────┐         │
     │                  └────────▶│   Webhook   │◀────────┘
     │                            │   Handler   │
     │                            └─────────────┘
     │                                   │
     │                                   ▼
     │                            ┌─────────────┐
     └───────────────────────────▶│   Receipt   │
                                  │   Service   │
                                  └─────────────┘
```

---

#### 4. Loyalty Service
**Purpose**: Points, rewards, and loyalty program management

```
┌─────────────────────────────────────────────────┐
│                LOYALTY SERVICE                   │
├─────────────────────────────────────────────────┤
│  Endpoints:                                      │
│  ├── GET    /loyalty/balance/:customerId        │
│  ├── POST   /loyalty/earn                       │
│  ├── POST   /loyalty/redeem                     │
│  ├── GET    /loyalty/history/:customerId        │
│  ├── GET    /loyalty/vouchers/:customerId       │
│  ├── POST   /loyalty/vouchers/claim             │
│  ├── POST   /loyalty/vouchers/apply             │
│  └── GET    /loyalty/tiers                      │
├─────────────────────────────────────────────────┤
│  Dependencies:                                   │
│  ├── PostgreSQL (points ledger)                 │
│  ├── Redis (balance cache)                      │
│  ├── Settlement Service (cross-cafe)            │
│  └── Notification Service (tier changes)        │
├─────────────────────────────────────────────────┤
│  Events Published:                               │
│  ├── points.earned                              │
│  ├── points.redeemed                            │
│  ├── voucher.issued                             │
│  ├── voucher.used                               │
│  └── tier.changed                               │
└─────────────────────────────────────────────────┘
```

**Points Ledger Design**:
```sql
-- Double-entry bookkeeping for points
-- Every point movement has a debit and credit entry

┌─────────────────────────────────────────────────────────────┐
│                    POINTS LEDGER                             │
├──────────┬───────────┬──────────┬────────┬─────────────────┤
│ Entry ID │ Customer  │  Type    │ Amount │   Counterparty  │
├──────────┼───────────┼──────────┼────────┼─────────────────┤
│    1     │ Customer A│  CREDIT  │  +100  │   Cafe Alpha    │
│    2     │ Cafe Alpha│  DEBIT   │  -100  │   Customer A    │
│    3     │ Customer A│  DEBIT   │  -500  │   Cafe Beta     │
│    4     │ Cafe Beta │  CREDIT  │  +500  │   Customer A    │
└──────────┴───────────┴──────────┴────────┴─────────────────┘
```

---

#### 5. Catalog Service
**Purpose**: Menu and product management

```
┌─────────────────────────────────────────────────┐
│                CATALOG SERVICE                   │
├─────────────────────────────────────────────────┤
│  Endpoints:                                      │
│  ├── GET    /cafes/:id/menu                     │
│  ├── POST   /cafes/:id/categories               │
│  ├── CRUD   /categories/:id                     │
│  ├── POST   /categories/:id/products            │
│  ├── CRUD   /products/:id                       │
│  ├── CRUD   /products/:id/modifiers             │
│  └── POST   /products/:id/availability          │
├─────────────────────────────────────────────────┤
│  Dependencies:                                   │
│  ├── PostgreSQL (catalog data)                  │
│  ├── Redis (menu cache)                         │
│  ├── Vercel Blob (product images)               │
│  └── Elasticsearch (product search)             │
├─────────────────────────────────────────────────┤
│  Events Published:                               │
│  ├── menu.updated                               │
│  ├── product.created                            │
│  ├── product.updated                            │
│  └── product.availability_changed               │
└─────────────────────────────────────────────────┘
```

---

#### 6. Profile Service (AI Coffee Profile)
**Purpose**: ML-based customer taste profiling and recommendations

```
┌─────────────────────────────────────────────────┐
│                PROFILE SERVICE                   │
├─────────────────────────────────────────────────┤
│  Endpoints:                                      │
│  ├── GET    /profiles/:customerId               │
│  ├── POST   /profiles/:customerId/refresh       │
│  ├── GET    /profiles/:customerId/recommend     │
│  ├── GET    /profiles/:customerId/cafes         │
│  └── GET    /profiles/:customerId/share         │
├─────────────────────────────────────────────────┤
│  Dependencies:                                   │
│  ├── PostgreSQL (profile data)                  │
│  ├── MLflow (model serving)                     │
│  ├── Order Service (order history)              │
│  └── Catalog Service (product metadata)         │
├─────────────────────────────────────────────────┤
│  ML Pipeline:                                    │
│  ├── Feature extraction from orders             │
│  ├── Collaborative filtering                    │
│  ├── Content-based recommendations              │
│  └── Profile vector computation                 │
└─────────────────────────────────────────────────┘
```

**Profile Generation Pipeline**:
```
┌─────────────┐    ┌──────────────┐    ┌───────────────┐
│   Order     │───▶│   Feature    │───▶│    ML Model   │
│   History   │    │  Extraction  │    │   Inference   │
└─────────────┘    └──────────────┘    └───────────────┘
                                              │
┌─────────────┐    ┌──────────────┐           │
│   Coffee    │───▶│   Profile    │◀──────────┘
│   Profile   │    │  Generator   │
└─────────────┘    └──────────────┘
                          │
                          ▼
                   ┌──────────────┐
                   │Recommendation│
                   │    Engine    │
                   └──────────────┘
```

---

### Supporting Services

#### 7. Notification Service
```
Purpose: Multi-channel notifications (push, SMS, email)

Channels:
├── Push Notifications (FCM, APNs)
├── SMS (Twilio)
├── Email (SendGrid)
└── WebSocket (real-time updates)

Events Consumed:
├── order.status_changed
├── payment.completed
├── voucher.issued
└── tier.changed
```

#### 8. Analytics Service
```
Purpose: Real-time and historical analytics

Features:
├── Real-time dashboards
├── Historical reporting
├── Cohort analysis
├── Predictive analytics
└── Benchmarking

Data Sources:
├── Order events
├── Payment events
├── Customer behavior
└── Product performance
```

#### 9. Settlement Service
```
Purpose: Cross-cafe financial reconciliation

Features:
├── Point value calculation
├── Monthly settlement computation
├── Invoice generation
├── Payment processing
└── Audit trails
```

---

## Database Architecture

### Primary Database (PostgreSQL)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         DATABASE SCHEMA                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐            │
│  │    cafes     │     │    users     │     │  customers   │            │
│  ├──────────────┤     ├──────────────┤     ├──────────────┤            │
│  │ id           │     │ id           │     │ id           │            │
│  │ name         │     │ email        │     │ user_id      │◀─┐        │
│  │ slug         │     │ password_hash│     │ phone        │  │        │
│  │ address      │     │ role         │     │ tier         │  │        │
│  │ settings     │     │ cafe_id      │────▶│ created_at   │  │        │
│  │ created_at   │     │ created_at   │     └──────────────┘  │        │
│  └──────────────┘     └──────────────┘                       │        │
│         │                    │                                │        │
│         │                    │                                │        │
│         ▼                    ▼                                │        │
│  ┌──────────────┐     ┌──────────────┐                       │        │
│  │  categories  │     │    staff     │                       │        │
│  ├──────────────┤     ├──────────────┤                       │        │
│  │ id           │     │ id           │                       │        │
│  │ cafe_id      │◀────│ user_id      │───────────────────────┘        │
│  │ name         │     │ cafe_id      │                                 │
│  │ sort_order   │     │ role         │                                 │
│  └──────────────┘     │ pin          │                                 │
│         │             └──────────────┘                                 │
│         ▼                                                              │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐           │
│  │   products   │     │    orders    │     │   payments   │           │
│  ├──────────────┤     ├──────────────┤     ├──────────────┤           │
│  │ id           │     │ id           │     │ id           │           │
│  │ category_id  │◀────│ cafe_id      │     │ order_id     │◀──┐      │
│  │ name         │     │ customer_id  │────▶│ method       │   │      │
│  │ price        │     │ status       │     │ amount       │   │      │
│  │ modifiers    │     │ total        │     │ status       │   │      │
│  └──────────────┘     │ created_at   │     │ stripe_id    │   │      │
│         │             └──────────────┘     └──────────────┘   │      │
│         │                    │                                 │      │
│         ▼                    ▼                                 │      │
│  ┌──────────────┐     ┌──────────────┐                        │      │
│  │order_items   │     │point_txns    │                        │      │
│  ├──────────────┤     ├──────────────┤                        │      │
│  │ id           │     │ id           │                        │      │
│  │ order_id     │◀────│ customer_id  │────────────────────────┘      │
│  │ product_id   │     │ cafe_id      │                               │
│  │ quantity     │     │ order_id     │                               │
│  │ modifiers    │     │ points       │                               │
│  │ price        │     │ type         │                               │
│  └──────────────┘     │ balance_after│                               │
│                       └──────────────┘                               │
│                                                                       │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐          │
│  │   vouchers   │     │voucher_types │     │coffee_profiles│          │
│  ├──────────────┤     ├──────────────┤     ├──────────────┤          │
│  │ id           │     │ id           │     │ customer_id  │          │
│  │ customer_id  │     │ name         │     │ roast_pref   │          │
│  │ type_id      │────▶│ points_cost  │     │ strength     │          │
│  │ code         │     │ value        │     │ milk_pref    │          │
│  │ status       │     │ description  │     │ flavor_notes │          │
│  │ expires_at   │     └──────────────┘     │ updated_at   │          │
│  └──────────────┘                          └──────────────┘          │
│                                                                       │
└─────────────────────────────────────────────────────────────────────────┘
```

### Caching Strategy (Redis)

```
┌─────────────────────────────────────────────────────────────┐
│                    REDIS CACHE STRUCTURE                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Session Cache                                               │
│  ├── session:{session_id} → user data (TTL: 24h)           │
│  └── refresh:{user_id} → refresh token (TTL: 7d)           │
│                                                              │
│  Menu Cache                                                  │
│  ├── menu:{cafe_id} → full menu JSON (TTL: 1h)             │
│  └── product:{product_id} → product details (TTL: 1h)      │
│                                                              │
│  Loyalty Cache                                               │
│  ├── points:{customer_id} → current balance (TTL: 5m)      │
│  └── tier:{customer_id} → current tier (TTL: 1h)           │
│                                                              │
│  Real-time Data                                              │
│  ├── orders:{cafe_id}:active → active order IDs (no TTL)   │
│  ├── tables:{cafe_id} → table status map (no TTL)          │
│  └── queue:{cafe_id} → order queue (no TTL)                │
│                                                              │
│  Rate Limiting                                               │
│  ├── rate:{ip}:{endpoint} → request count (TTL: 1m)        │
│  └── rate:{user_id}:{endpoint} → request count (TTL: 1m)   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Time-Series Database (TimescaleDB)

```
Purpose: Metrics and analytics data

Tables:
├── sales_metrics (cafe_id, timestamp, revenue, orders, avg_ticket)
├── product_metrics (product_id, timestamp, quantity, revenue)
├── customer_metrics (customer_id, timestamp, visits, spend)
└── system_metrics (service, timestamp, latency, errors)

Retention:
├── Raw data: 90 days
├── Hourly aggregates: 2 years
└── Daily aggregates: Forever
```

---

## Event Architecture

### Event Bus (Kafka)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         KAFKA TOPICS                                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Domain Events                                                           │
│  ├── sippy.orders.created          (partitioned by cafe_id)            │
│  ├── sippy.orders.updated          (partitioned by cafe_id)            │
│  ├── sippy.payments.completed      (partitioned by cafe_id)            │
│  ├── sippy.loyalty.points          (partitioned by customer_id)        │
│  └── sippy.customers.activity      (partitioned by customer_id)        │
│                                                                          │
│  Integration Events                                                      │
│  ├── sippy.notifications.send      (partitioned by channel)            │
│  ├── sippy.analytics.ingest        (partitioned by metric_type)        │
│  └── sippy.settlement.calculate    (partitioned by period)             │
│                                                                          │
│  System Events                                                           │
│  ├── sippy.audit.log               (partitioned by service)            │
│  └── sippy.errors.dlq              (dead letter queue)                 │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Event Schema

```typescript
// Base Event Structure
interface BaseEvent {
  id: string;           // UUID
  type: string;         // e.g., 'order.created'
  source: string;       // Service that emitted
  timestamp: string;    // ISO 8601
  correlation_id: string;
  data: Record<string, any>;
  metadata: {
    version: string;
    cafe_id?: string;
    user_id?: string;
  };
}

// Example: Order Created Event
interface OrderCreatedEvent extends BaseEvent {
  type: 'order.created';
  data: {
    order_id: string;
    cafe_id: string;
    customer_id: string | null;
    items: Array<{
      product_id: string;
      quantity: number;
      price: number;
    }>;
    total: number;
    order_type: 'dine_in' | 'takeaway' | 'pickup';
  };
}
```

---

## Security Architecture

### Authentication Flow

```
┌────────────┐     ┌─────────────┐     ┌─────────────┐     ┌────────────┐
│   Client   │────▶│  API Gateway │────▶│Auth Service │────▶│  Database  │
└────────────┘     └─────────────┘     └─────────────┘     └────────────┘
      │                   │                   │                   │
      │  1. Login Request │                   │                   │
      │──────────────────▶│                   │                   │
      │                   │  2. Validate      │                   │
      │                   │──────────────────▶│                   │
      │                   │                   │  3. Check User    │
      │                   │                   │──────────────────▶│
      │                   │                   │◀──────────────────│
      │                   │                   │                   │
      │                   │  4. Generate JWT  │                   │
      │                   │◀──────────────────│                   │
      │  5. Return Tokens │                   │                   │
      │◀──────────────────│                   │                   │
      │                   │                   │                   │
      │  6. API Request + │                   │                   │
      │     Bearer Token  │                   │                   │
      │──────────────────▶│                   │                   │
      │                   │  7. Validate JWT  │                   │
      │                   │──────────────────▶│                   │
      │                   │◀──────────────────│                   │
      │                   │                   │                   │
      │  8. Response      │                   │                   │
      │◀──────────────────│                   │                   │
```

### Security Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    SECURITY ARCHITECTURE                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Network Layer                                               │
│  ├── WAF (AWS WAF / Cloudflare)                             │
│  ├── DDoS Protection                                        │
│  ├── SSL/TLS Termination                                    │
│  └── IP Allowlisting (for admin endpoints)                  │
│                                                              │
│  Application Layer                                           │
│  ├── Rate Limiting (per IP, per user, per endpoint)         │
│  ├── Input Validation & Sanitization                        │
│  ├── SQL Injection Prevention (parameterized queries)       │
│  └── XSS Protection (CSP headers)                           │
│                                                              │
│  Authentication Layer                                        │
│  ├── JWT with short expiry (15 min)                         │
│  ├── Refresh token rotation                                 │
│  ├── MFA support (TOTP, SMS)                                │
│  └── Session invalidation                                   │
│                                                              │
│  Authorization Layer                                         │
│  ├── RBAC (Role-Based Access Control)                       │
│  ├── Resource-level permissions                             │
│  ├── Cafe-scoped data isolation                             │
│  └── API key scoping                                        │
│                                                              │
│  Data Layer                                                  │
│  ├── Encryption at rest (AES-256)                           │
│  ├── Encryption in transit (TLS 1.3)                        │
│  ├── PII tokenization                                       │
│  └── Audit logging                                          │
│                                                              │
│  Payment Security                                            │
│  ├── PCI DSS Level 1 compliance                             │
│  ├── No card data stored                                    │
│  ├── Stripe Elements (tokenization)                         │
│  └── 3D Secure support                                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Infrastructure Architecture

### Cloud Infrastructure (AWS)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              AWS REGION                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                         VPC                                      │   │
│  │  ┌───────────────────────────────────────────────────────────┐  │   │
│  │  │                   PUBLIC SUBNET                            │  │   │
│  │  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │  │   │
│  │  │  │     ALB     │  │   NAT GW    │  │   Bastion   │       │  │   │
│  │  │  └─────────────┘  └─────────────┘  └─────────────┘       │  │   │
│  │  └───────────────────────────────────────────────────────────┘  │   │
│  │                              │                                   │   │
│  │  ┌───────────────────────────────────────────────────────────┐  │   │
│  │  │                  PRIVATE SUBNET (App)                      │  │   │
│  │  │  ┌─────────────────────────────────────────────────────┐  │  │   │
│  │  │  │                   EKS CLUSTER                        │  │  │   │
│  │  │  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │  │  │   │
│  │  │  │  │  Auth   │ │  Order  │ │ Payment │ │ Loyalty │   │  │  │   │
│  │  │  │  │ Service │ │ Service │ │ Service │ │ Service │   │  │  │   │
│  │  │  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘   │  │  │   │
│  │  │  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │  │  │   │
│  │  │  │  │ Catalog │ │Analytics│ │ Profile │ │ Notify  │   │  │  │   │
│  │  │  │  │ Service │ │ Service │ │ Service │ │ Service │   │  │  │   │
│  │  │  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘   │  │  │   │
│  │  │  └─────────────────────────────────────────────────────┘  │  │   │
│  │  └───────────────────────────────────────────────────────────┘  │   │
│  │                              │                                   │   │
│  │  ┌───────────────────────────────────────────────────────────┐  │   │
│  │  │                  PRIVATE SUBNET (Data)                     │  │   │
│  │  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │  │   │
│  │  │  │ RDS Aurora  │  │ElastiCache  │  │    MSK      │       │  │   │
│  │  │  │ (PostgreSQL)│  │  (Redis)    │  │  (Kafka)    │       │  │   │
│  │  │  └─────────────┘  └─────────────┘  └─────────────┘       │  │   │
│  │  └───────────────────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  External Services                                                       │
│  ├── Vercel Blob (Media storage)                                        │
│  ├── CloudFront (CDN)                                                   │
│  ├── Route 53 (DNS)                                                     │
│  ├── SES (Email)                                                        │
│  └── CloudWatch (Monitoring)                                            │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Kubernetes Architecture

```yaml
# Namespace Structure
namespaces:
  - sippy-production
  - sippy-staging
  - sippy-monitoring
  - sippy-ingress

# Service Deployment Pattern
apiVersion: apps/v1
kind: Deployment
metadata:
  name: order-service
  namespace: sippy-production
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  template:
    spec:
      containers:
        - name: order-service
          image: sippy/order-service:v1.2.3
          resources:
            requests:
              memory: "256Mi"
              cpu: "250m"
            limits:
              memory: "512Mi"
              cpu: "500m"
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
          readinessProbe:
            httpGet:
              path: /ready
              port: 3000
```

---

## Monitoring & Observability

### Observability Stack

```
┌─────────────────────────────────────────────────────────────┐
│                   OBSERVABILITY STACK                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Metrics (Prometheus + Grafana)                              │
│  ├── Application metrics                                    │
│  ├── Business metrics (orders/min, revenue)                 │
│  ├── Infrastructure metrics                                 │
│  └── Custom dashboards per service                          │
│                                                              │
│  Logging (ELK Stack / Datadog)                               │
│  ├── Structured JSON logging                                │
│  ├── Correlation IDs across services                        │
│  ├── Log aggregation and search                             │
│  └── Log-based alerting                                     │
│                                                              │
│  Tracing (Jaeger / Datadog APM)                              │
│  ├── Distributed request tracing                            │
│  ├── Service dependency mapping                             │
│  ├── Latency analysis                                       │
│  └── Error tracking                                         │
│                                                              │
│  Alerting (PagerDuty)                                        │
│  ├── SLO-based alerts                                       │
│  ├── On-call rotation                                       │
│  ├── Incident management                                    │
│  └── Runbook automation                                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Key Metrics & SLOs

| Metric | Target SLO | Alert Threshold |
|--------|------------|-----------------|
| API Availability | 99.9% | < 99.5% |
| Order Processing Latency (p99) | < 2s | > 3s |
| Payment Success Rate | 99.5% | < 98% |
| Error Rate | < 0.1% | > 1% |
| Database Query Latency (p95) | < 100ms | > 500ms |

---

## Deployment Strategy

### CI/CD Pipeline

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          CI/CD PIPELINE                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐             │
│  │  Push   │───▶│  Build  │───▶│  Test   │───▶│ Security│             │
│  │         │    │         │    │         │    │  Scan   │             │
│  └─────────┘    └─────────┘    └─────────┘    └─────────┘             │
│                                                       │                 │
│                                                       ▼                 │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐             │
│  │Production│◀──│ Canary  │◀──│ Staging │◀──│  Build  │             │
│  │ Deploy  │   │  Deploy │    │ Deploy  │    │  Image  │             │
│  └─────────┘    └─────────┘    └─────────┘    └─────────┘             │
│       │              │              │                                   │
│       ▼              ▼              ▼                                   │
│  ┌─────────────────────────────────────────────────────────────┐      │
│  │                    AUTOMATED TESTING                         │      │
│  │  ├── Unit Tests (Jest)                                      │      │
│  │  ├── Integration Tests (Supertest)                          │      │
│  │  ├── E2E Tests (Playwright)                                 │      │
│  │  ├── Load Tests (k6)                                        │      │
│  │  └── Security Tests (SAST/DAST)                             │      │
│  └─────────────────────────────────────────────────────────────┘      │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Deployment Stages

```
1. Development
   └── Feature branches → Preview deployments

2. Staging
   └── Main branch → Full environment replica

3. Canary (10% traffic)
   └── Tagged releases → Gradual rollout

4. Production (100% traffic)
   └── Promoted canary → Full deployment
```

---

## Disaster Recovery

### Backup Strategy

| Component | Backup Frequency | Retention | RTO | RPO |
|-----------|------------------|-----------|-----|-----|
| PostgreSQL | Continuous (WAL) + Daily full | 30 days | 1 hour | 5 minutes |
| Redis | Hourly snapshots | 7 days | 15 minutes | 1 hour |
| Vercel Blob | Edge-replicated globally | Forever | Instant | Instant |
| Kafka | Multi-AZ replication | 7 days | 5 minutes | 0 |

### Failover Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    MULTI-REGION SETUP                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  PRIMARY REGION (us-east-1)                                  │
│  ├── Active EKS cluster                                     │
│  ├── RDS Primary                                            │
│  ├── ElastiCache Primary                                    │
│  └── MSK Cluster                                            │
│           │                                                  │
│           │ Replication                                      │
│           ▼                                                  │
│  SECONDARY REGION (us-west-2)                                │
│  ├── Standby EKS cluster                                    │
│  ├── RDS Read Replica (promotable)                          │
│  ├── ElastiCache Replica                                    │
│  └── MSK Cluster (MirrorMaker)                              │
│                                                              │
│  DNS FAILOVER (Route 53)                                     │
│  ├── Health checks on primary                               │
│  ├── Automatic failover to secondary                        │
│  └── TTL: 60 seconds                                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Appendix

### Technology Stack Summary

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | Next.js, React | Web applications |
| Mobile | React Native | iOS/Android apps |
| API Gateway | Kong | Request routing, rate limiting |
| Backend | NestJS (Node.js) | Microservices |
| Database | PostgreSQL | Primary data store |
| Cache | Redis | Session, caching |
| Media Storage | Vercel Blob | Product images, cafe assets |
| Message Queue | Kafka | Event streaming |
| Search | Elasticsearch | Full-text search |
| ML | Python, TensorFlow | Coffee profiles |
| Container | Docker, Kubernetes | Orchestration |
| Cloud | AWS | Infrastructure |
| Monitoring | Datadog | Observability |
| CI/CD | GitHub Actions | Automation |

### API Versioning Strategy

- URL-based versioning: `/api/v1/`, `/api/v2/`
- Deprecation notice: 6 months before removal
- Backward compatibility within major version
- Breaking changes only in major versions

