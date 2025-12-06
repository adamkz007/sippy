# Sippy - Data Flow Documentation

## Overview

This document describes how data flows through the Sippy platform, covering critical business processes from order creation to cross-cafe loyalty redemption.

---

## Core Data Flows

### 1. Order Processing Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ORDER PROCESSING FLOW                                │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│   POS    │───▶│  Order   │───▶│  Catalog │───▶│   Tax    │───▶│  Order   │
│ Terminal │    │ Service  │    │  Service │    │ Calc     │    │ Created  │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
                     │                                               │
                     │                                               ▼
                     │         ┌──────────────────────────────────────┐
                     │         │            EVENT BUS                 │
                     │         │   Topic: sippy.orders.created        │
                     │         └──────────────────────────────────────┘
                     │                          │
                     ▼                          ▼
              ┌──────────┐              ┌──────────┐
              │ Kitchen  │              │ Analytics│
              │ Display  │              │ Service  │
              └──────────┘              └──────────┘

SEQUENCE:
1. Staff selects items on POS terminal
2. Order Service validates items against Catalog Service
3. Tax calculation applied based on cafe location
4. Order created with status: PENDING
5. Event published to Kafka
6. Kitchen Display receives real-time update
7. Analytics Service ingests for reporting
```

### 2. Payment Processing Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        PAYMENT PROCESSING FLOW                               │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│   POS    │───▶│ Payment  │───▶│  Stripe  │───▶│  Bank    │
│ Terminal │    │ Service  │    │   API    │    │ Network  │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
                     │                               │
                     │        ┌──────────┐          │
                     │        │ Webhook  │◀─────────┘
                     │        │ Handler  │
                     │        └────┬─────┘
                     │             │
                     ▼             ▼
              ┌─────────────────────────┐
              │    Payment Confirmed    │
              │    Order: COMPLETED     │
              └─────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
    ┌──────────┐   ┌──────────┐   ┌──────────┐
    │ Loyalty  │   │ Receipt  │   │Analytics │
    │ Service  │   │ Service  │   │ Service  │
    └──────────┘   └──────────┘   └──────────┘

DATA CAPTURED:
- Payment intent ID
- Amount, currency
- Payment method (card last 4)
- Authorization code
- Timestamp
- Associated order ID
```

### 3. Loyalty Points Earning Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       LOYALTY POINTS EARNING FLOW                            │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐
│ Payment Complete │
│     Event        │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐     ┌──────────────────┐
│ Loyalty Service  │────▶│ Customer Lookup  │
│                  │     │                  │
└────────┬─────────┘     └──────────────────┘
         │                        │
         │    ┌───────────────────┘
         │    │
         ▼    ▼
┌──────────────────┐
│ Calculate Points │
│                  │
│ Base Rate:       │
│ $1 = 1 point     │
│                  │
│ Bonus Rules:     │
│ • Double points  │
│ • Product bonus  │
│ • Streak bonus   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐     ┌──────────────────┐
│  Points Ledger   │────▶│  Update Balance  │
│  INSERT:         │     │  Redis Cache     │
│  +100 points     │     │                  │
└────────┬─────────┘     └──────────────────┘
         │
         ▼
┌──────────────────┐
│ Notify Customer  │
│ "You earned 100  │
│  points!"        │
└──────────────────┘

LEDGER ENTRY:
{
  customer_id: "cust_123",
  cafe_id: "cafe_456",
  order_id: "ord_789",
  type: "EARN",
  points: 100,
  balance_after: 1500,
  description: "Purchase at Cafe Alpha"
}
```

### 4. Cross-Cafe Voucher Redemption Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    CROSS-CAFE VOUCHER REDEMPTION                             │
└─────────────────────────────────────────────────────────────────────────────┘

SCENARIO: Customer earned points at Cafe Alpha, redeeming at Cafe Beta

┌──────────┐    ┌──────────┐    ┌──────────┐
│ Customer │───▶│   POS    │───▶│ Loyalty  │
│ (App ID) │    │ Cafe Beta│    │ Service  │
└──────────┘    └──────────┘    └──────────┘
                                     │
                     ┌───────────────┴───────────────┐
                     │                               │
                     ▼                               ▼
              ┌──────────────┐              ┌──────────────┐
              │ Validate     │              │ Check        │
              │ Voucher      │              │ Restrictions │
              │ • Active?    │              │ • Expired?   │
              │ • Not used?  │              │ • Min order? │
              └──────┬───────┘              └──────┬───────┘
                     │                             │
                     └───────────┬─────────────────┘
                                 │
                                 ▼
                     ┌──────────────────────┐
                     │    Apply Discount    │
                     │    Order Total: $15  │
                     │    Voucher: -$5      │
                     │    Final: $10        │
                     └──────────┬───────────┘
                                │
              ┌─────────────────┼─────────────────┐
              │                 │                 │
              ▼                 ▼                 ▼
       ┌──────────┐      ┌──────────┐      ┌──────────┐
       │ Voucher  │      │Settlement│      │ Notify   │
       │ Marked   │      │ Record   │      │ Customer │
       │ USED     │      │ Created  │      │          │
       └──────────┘      └──────────┘      └──────────┘

SETTLEMENT RECORD:
{
  period: "2024-12",
  voucher_id: "vouch_123",
  points_origin_cafe: "cafe_alpha",
  redemption_cafe: "cafe_beta",
  voucher_value: 500,  // points
  monetary_value: 5.00 // dollars
}
```

### 5. AI Coffee Profile Generation Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    AI COFFEE PROFILE GENERATION                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                      DATA COLLECTION                              │
│  Orders: 50+ transactions    Products: Metadata                   │
│  Modifiers: Customizations   Time: Visit patterns                 │
└────────────────────────────────┬─────────────────────────────────┘
                                 │
                                 ▼
┌──────────────────────────────────────────────────────────────────┐
│                    FEATURE EXTRACTION                             │
│                                                                   │
│  Order History Analysis:                                          │
│  ├── Roast levels ordered (count per level)                      │
│  ├── Milk types selected (frequency)                             │
│  ├── Size preferences (small/medium/large ratio)                 │
│  ├── Temperature choices (hot vs iced)                           │
│  ├── Sweetener usage (syrups, sugar)                             │
│  ├── Time of day patterns                                        │
│  └── Product variety index                                       │
│                                                                   │
└────────────────────────────────┬─────────────────────────────────┘
                                 │
                                 ▼
┌──────────────────────────────────────────────────────────────────┐
│                    ML MODEL INFERENCE                             │
│                                                                   │
│  Input Vector:                                                    │
│  [0.8, 0.3, 0.6, 0.9, 0.2, 0.7, 0.4, 0.5, 0.8, 0.3]            │
│                                                                   │
│  Model: Taste Clustering + Collaborative Filtering                │
│                                                                   │
│  Output:                                                          │
│  ├── Cluster assignment: "Bold Explorer"                         │
│  ├── Taste vector: [0.85, 0.70, 0.45, 0.90, 0.20]               │
│  └── Confidence score: 0.87                                      │
│                                                                   │
└────────────────────────────────┬─────────────────────────────────┘
                                 │
                                 ▼
┌──────────────────────────────────────────────────────────────────┐
│                    PROFILE GENERATION                             │
│                                                                   │
│  {                                                                │
│    "customer_id": "cust_123",                                    │
│    "profile_type": "Bold Explorer",                              │
│    "dimensions": {                                                │
│      "roast_preference": 4.2,      // 1-5, dark                  │
│      "strength": 4.5,              // 1-5, strong                │
│      "milk_preference": "oat",                                   │
│      "temperature": 3.8,           // 1-5, warm-hot              │
│      "sweetness": 1.2,             // 1-5, minimal               │
│      "adventure_score": 4.0        // 1-5, explorer              │
│    },                                                             │
│    "flavor_notes": ["chocolate", "nutty", "caramel"],            │
│    "recommendations": ["Ethiopian Yirgacheffe", "Guatemala"],     │
│    "generated_at": "2024-12-06T10:00:00Z",                       │
│    "confidence": 0.87                                             │
│  }                                                                │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### 6. Online Order Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ONLINE ORDER FLOW                                    │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ Customer │───▶│   Web    │───▶│  Order   │───▶│ Capacity │
│   App    │    │   App    │    │  Service │    │  Check   │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
                                                      │
                              ┌────────────────┬──────┴──────┐
                              │                │             │
                              ▼                ▼             ▼
                        ┌──────────┐    ┌──────────┐  ┌──────────┐
                        │ Accept   │    │  Queue   │  │ Decline  │
                        │ Order    │    │  Order   │  │ (Busy)   │
                        └────┬─────┘    └──────────┘  └──────────┘
                             │
                             ▼
                        ┌──────────┐
                        │ Payment  │
                        │ Intent   │
                        └────┬─────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
        ┌──────────┐  ┌──────────┐  ┌──────────┐
        │   POS    │  │ Kitchen  │  │ Customer │
        │  Queue   │  │ Display  │  │  Notify  │
        └──────────┘  └──────────┘  └──────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │         STATUS UPDATES               │
        │                                      │
        │  RECEIVED ──▶ PREPARING ──▶ READY   │
        │      │            │           │      │
        │      ▼            ▼           ▼      │
        │   Push         Push        Push      │
        │  Notif        Notif       Notif      │
        └──────────────────────────────────────┘

WEBSOCKET EVENTS:
- order.status.received
- order.status.preparing  
- order.status.ready
- order.eta.updated
```

---

## Data Models

### Order Entity

```typescript
interface Order {
  id: string;                    // UUID
  cafe_id: string;               // Foreign key
  customer_id: string | null;    // Nullable for guests
  staff_id: string;              // Who created
  
  // Order details
  order_number: string;          // Human-readable (e.g., "A-042")
  order_type: OrderType;         // dine_in, takeaway, pickup, delivery
  status: OrderStatus;           // pending, preparing, ready, completed, cancelled
  
  // Items
  items: OrderItem[];
  
  // Financials
  subtotal: number;              // Before tax/discount
  tax_amount: number;
  discount_amount: number;
  tip_amount: number;
  total: number;
  
  // Loyalty
  points_earned: number;
  vouchers_applied: string[];
  
  // Table (if dine-in)
  table_id: string | null;
  
  // Timestamps
  created_at: Date;
  updated_at: Date;
  completed_at: Date | null;
}

interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;          // Denormalized
  quantity: number;
  unit_price: number;
  modifiers: Modifier[];
  notes: string | null;
  total: number;
}
```

### Customer Entity

```typescript
interface Customer {
  id: string;
  user_id: string;               // Auth user reference
  
  // Profile
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  
  // Loyalty
  tier: LoyaltyTier;             // bronze, silver, gold, platinum
  points_balance: number;
  lifetime_points: number;
  lifetime_spend: number;
  
  // AI Profile
  coffee_profile: CoffeeProfile | null;
  
  // Preferences
  favorite_cafe_ids: string[];
  favorite_products: string[];
  default_modifiers: Modifier[];
  
  // Metadata
  first_order_at: Date | null;
  last_order_at: Date | null;
  total_orders: number;
  created_at: Date;
}

interface CoffeeProfile {
  profile_type: string;
  roast_preference: number;      // 1-5
  strength: number;              // 1-5
  milk_preference: string;
  temperature: number;           // 1-5
  sweetness: number;             // 1-5
  adventure_score: number;       // 1-5
  flavor_notes: string[];
  generated_at: Date;
  confidence: number;
}
```

### Points Ledger Entry

```typescript
interface PointTransaction {
  id: string;
  customer_id: string;
  cafe_id: string;
  order_id: string | null;
  
  type: PointTransactionType;    // earn, redeem, expire, adjust, transfer
  points: number;                // Positive or negative
  balance_after: number;
  
  // Cross-cafe tracking
  origin_cafe_id: string | null; // For redemptions
  
  description: string;
  metadata: Record<string, any>;
  
  created_at: Date;
}
```

---

## Event Schemas

### Order Events

```typescript
// Order Created
{
  "id": "evt_abc123",
  "type": "order.created",
  "timestamp": "2024-12-06T10:30:00Z",
  "data": {
    "order_id": "ord_xyz789",
    "cafe_id": "cafe_456",
    "customer_id": "cust_123",
    "order_type": "dine_in",
    "items_count": 3,
    "total": 24.50
  }
}

// Order Status Changed
{
  "id": "evt_def456",
  "type": "order.status_changed",
  "timestamp": "2024-12-06T10:35:00Z",
  "data": {
    "order_id": "ord_xyz789",
    "previous_status": "pending",
    "new_status": "preparing",
    "changed_by": "staff_001"
  }
}
```

### Payment Events

```typescript
// Payment Completed
{
  "id": "evt_pay123",
  "type": "payment.completed",
  "timestamp": "2024-12-06T10:31:00Z",
  "data": {
    "payment_id": "pay_abc",
    "order_id": "ord_xyz789",
    "amount": 24.50,
    "currency": "USD",
    "method": "card",
    "card_last_four": "4242",
    "stripe_payment_intent": "pi_xxx"
  }
}
```

### Loyalty Events

```typescript
// Points Earned
{
  "id": "evt_loy123",
  "type": "loyalty.points_earned",
  "timestamp": "2024-12-06T10:31:05Z",
  "data": {
    "customer_id": "cust_123",
    "cafe_id": "cafe_456",
    "order_id": "ord_xyz789",
    "points_earned": 25,
    "bonus_applied": "double_points_tuesday",
    "new_balance": 1525
  }
}

// Voucher Redeemed
{
  "id": "evt_vouch123",
  "type": "loyalty.voucher_redeemed",
  "timestamp": "2024-12-06T10:30:30Z",
  "data": {
    "voucher_id": "vouch_abc",
    "customer_id": "cust_123",
    "redemption_cafe_id": "cafe_789",
    "origin_cafe_id": "cafe_456",
    "voucher_type": "free_drink",
    "value": 5.00
  }
}
```

---

## Integration Flows

### Stripe Payment Integration

```
REQUEST FLOW:
─────────────
1. Create Payment Intent
   POST https://api.stripe.com/v1/payment_intents
   {
     amount: 2450,
     currency: "usd",
     metadata: { order_id: "ord_xyz789" }
   }

2. Confirm on Terminal
   Stripe Terminal SDK collects card
   Sends to Stripe for authorization

3. Webhook Received
   POST /webhooks/stripe
   Event: payment_intent.succeeded

4. Update Order
   Mark payment complete
   Trigger loyalty points
```

### Accounting Export (Xero)

```
DAILY SYNC:
──────────
1. Aggregate daily transactions
2. Group by payment method
3. Calculate tax breakdown
4. Generate invoice records

PAYLOAD:
{
  "Type": "ACCREC",
  "Contact": { "Name": "Daily Sales" },
  "Date": "2024-12-06",
  "LineItems": [
    {
      "Description": "Card Sales",
      "Quantity": 1,
      "UnitAmount": 1250.00,
      "AccountCode": "200"
    },
    {
      "Description": "Cash Sales", 
      "Quantity": 1,
      "UnitAmount": 350.00,
      "AccountCode": "200"
    }
  ]
}
```

---

## Real-Time Data Flows

### WebSocket Subscriptions

```typescript
// POS Terminal Subscriptions
subscribe('cafe:{cafe_id}:orders')      // New orders
subscribe('cafe:{cafe_id}:tables')      // Table status
subscribe('cafe:{cafe_id}:queue')       // Order queue

// Customer App Subscriptions  
subscribe('customer:{customer_id}:order:{order_id}')  // Order status
subscribe('customer:{customer_id}:loyalty')            // Balance updates

// Kitchen Display Subscriptions
subscribe('cafe:{cafe_id}:kitchen')     // Orders to prepare
```

### Event Broadcasting

```
┌──────────────────────────────────────────────────────────────────┐
│                    REAL-TIME EVENT FLOW                          │
└──────────────────────────────────────────────────────────────────┘

                     ┌──────────────┐
                     │   Service    │
                     │   (Order)    │
                     └──────┬───────┘
                            │
                            ▼
                     ┌──────────────┐
                     │    Redis     │
                     │   Pub/Sub    │
                     └──────┬───────┘
                            │
         ┌──────────────────┼──────────────────┐
         │                  │                  │
         ▼                  ▼                  ▼
   ┌──────────┐      ┌──────────┐      ┌──────────┐
   │   POS    │      │ Kitchen  │      │ Customer │
   │ Terminal │      │ Display  │      │   App    │
   └──────────┘      └──────────┘      └──────────┘
```

---

## Settlement Data Flow

### Monthly Cross-Cafe Settlement

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    MONTHLY SETTLEMENT PROCESS                                │
└─────────────────────────────────────────────────────────────────────────────┘

DAY 1 OF MONTH (Automated):

1. AGGREGATE TRANSACTIONS
   ┌────────────────────────────────────────────────────┐
   │  For each cafe:                                    │
   │  • Points issued (liability)                       │
   │  • Points redeemed - own customers (offset)        │
   │  • Points redeemed - other cafe customers (credit) │
   │  • Own points redeemed elsewhere (debit)           │
   └────────────────────────────────────────────────────┘

2. CALCULATE NET POSITION
   ┌────────────────────────────────────────────────────┐
   │  Cafe Alpha:                                       │
   │  • Points issued: 50,000 ($500 liability)         │
   │  • Own redemptions: 30,000 ($300 offset)          │
   │  • Incoming redemptions: 15,000 ($150 credit)     │
   │  • Outgoing redemptions: 8,000 ($80 debit)        │
   │  • Net: +$70 (receives from pool)                 │
   └────────────────────────────────────────────────────┘

3. GENERATE SETTLEMENT REPORT
   ┌────────────────────────────────────────────────────┐
   │  Settlement Period: December 2024                  │
   │                                                    │
   │  Cafe Alpha:    +$70.00 (receive)                 │
   │  Cafe Beta:     -$45.00 (pay)                     │
   │  Cafe Gamma:    +$120.00 (receive)                │
   │  Cafe Delta:    -$145.00 (pay)                    │
   │  ─────────────────────────────                    │
   │  Net:           $0.00 (balanced)                  │
   └────────────────────────────────────────────────────┘

4. PROCESS PAYMENTS
   • Cafes with negative balance: Charge via Stripe
   • Cafes with positive balance: Payout via Stripe Connect
```

---

## Data Retention & Privacy

### Retention Policies

| Data Type | Retention | Reason |
|-----------|-----------|--------|
| Orders | 7 years | Tax compliance |
| Payments | 7 years | Financial records |
| Points Ledger | Forever | Audit trail |
| Customer PII | Until deletion request | GDPR |
| Session Data | 30 days | Security |
| Analytics (raw) | 90 days | Performance |
| Analytics (aggregated) | Forever | Insights |

### Data Anonymization

```
CUSTOMER DELETION REQUEST:
─────────────────────────
1. Verify identity
2. Export customer data (GDPR)
3. Anonymize orders:
   - customer_id → "DELETED_USER"
   - Remove personal notes
4. Delete from:
   - customers table
   - coffee_profiles table
   - loyalty cache
5. Retain anonymized:
   - Transaction records
   - Points history
   - Analytics
```

---

## Error Handling Flows

### Payment Failure Recovery

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      PAYMENT FAILURE HANDLING                                │
└─────────────────────────────────────────────────────────────────────────────┘

Payment Attempt
      │
      ▼
┌─────────────┐
│  Declined?  │──── No ────▶ Complete Order
└─────────────┘
      │
     Yes
      │
      ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DECLINE REASON                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Insufficient Funds ──▶ Offer alternative payment               │
│  Card Expired ────────▶ Request different card                  │
│  Fraud Suspected ─────▶ Request ID verification                 │
│  Network Error ───────▶ Auto-retry (3 attempts)                 │
│  Unknown ─────────────▶ Manual intervention                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
      │
      ▼
Order marked: PAYMENT_PENDING
Alert: Staff notification
Timeout: 15 minutes → auto-cancel
```

---

## Appendix: Data Dictionary

### Key Entities

| Entity | Primary Key | Description |
|--------|-------------|-------------|
| cafe | cafe_id | Coffee shop in the network |
| customer | customer_id | Registered app user |
| order | order_id | Transaction record |
| product | product_id | Menu item |
| voucher | voucher_id | Redeemable reward |
| point_transaction | txn_id | Points ledger entry |

### Status Enums

```typescript
enum OrderStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  PREPARING = 'preparing',
  READY = 'ready',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

enum VoucherStatus {
  ACTIVE = 'active',
  USED = 'used',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled'
}

enum LoyaltyTier {
  BRONZE = 'bronze',    // 0-999 lifetime points
  SILVER = 'silver',    // 1000-4999
  GOLD = 'gold',        // 5000-14999
  PLATINUM = 'platinum' // 15000+
}
```

