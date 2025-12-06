# Sippy - Product Requirements Document

## Executive Summary

Sippy is a unified cafe management platform that transforms how independent cafes operate and how customers experience specialty coffee. By combining Point-of-Sale, online ordering, table management, and a cross-cafe loyalty ecosystem, Sippy creates a network effect where every participating cafe benefits from shared customer loyalty while maintaining their unique identity.

---

## Vision Statement

*"Every coffee counts, everywhere."*

Sippy envisions a world where coffee lovers are rewarded for their passion regardless of which cafe they visit, while cafe owners gain enterprise-level tools without enterprise-level complexity.

---

## Problem Statement

### For Cafe Owners
- **Fragmented Systems**: Managing POS, online orders, loyalty programs, and analytics through separate platforms
- **Customer Retention**: Competing against chains with sophisticated loyalty programs
- **Limited Insights**: Lack of actionable data on customer preferences and behavior
- **Operational Overhead**: Manual table management, order tracking, and inventory reconciliation

### For Customers
- **Loyalty Fatigue**: Managing multiple loyalty cards/apps for different cafes
- **No Portability**: Points earned at one cafe are worthless elsewhere
- **Discovery Friction**: Hard to find new cafes that match their taste preferences
- **Inconsistent Experience**: Varying ordering and payment experiences across cafes

---

## Target Users

### Primary Personas

#### 1. Cafe Owner - "Maya"
- Owns 1-3 specialty coffee locations
- Tech-savvy but time-poor
- Wants data-driven decisions without complexity
- Values customer relationships over transaction volume

#### 2. Cafe Staff - "Jordan"
- Barista/cashier at a busy cafe
- Needs fast, intuitive tools during rush hours
- Wants to recognize regulars and their preferences
- Motivated by tips and customer satisfaction

#### 3. Coffee Enthusiast - "Alex"
- Visits 3-5 different cafes per week
- Values quality and discovery
- Active on social media about coffee
- Willing to pay premium for great experiences

#### 4. Casual Customer - "Sam"
- Visits cafes 2-3 times per week
- Price-conscious but appreciates rewards
- Prefers mobile ordering for convenience
- Less brand-loyal, more convenience-driven

---

## Core Features

### 1. Point of Sale (POS) System

#### 1.1 Order Management
- **Quick Order Entry**: Grid-based menu with customizable layouts
- **Modifiers & Add-ons**: Milk alternatives, shots, syrups, temperatures
- **Order Types**: Dine-in, takeaway, delivery, pickup
- **Split Bills**: By item, percentage, or equal division
- **Tab Management**: Open tabs for seated customers
- **Order Notes**: Special instructions visible to baristas

#### 1.2 Payment Processing
- **Multiple Payment Methods**: Card, cash, mobile wallets, QR payments
- **Partial Payments**: Mix payment methods on single transaction
- **Tip Handling**: Suggested percentages, custom amounts
- **Refunds & Voids**: With manager authorization trails
- **Receipt Options**: Print, SMS, email, no receipt

### 2. Online Ordering

#### 2.1 Customer-Facing App/Web
- **Explore Cafe**: Find cafes nearby, get directions, save as favorite
- **Menu Browsing**: High-quality images, descriptions, allergen info
- **Customization**: Full modifier support matching in-store options
- **Scheduling**: Order ahead for specific pickup times
- **Real-Time Status**: Order received → Preparing → Ready
- **Reorder**: Quick access to past orders
- **Favorites**: Save frequent orders for one-tap reordering
- **AI Coffee Profile**: Build profile based on past orders; powered by LLM

#### 2.2 Cafe Integration
- **Order Injection**: Seamless flow into POS queue
- **Capacity Management**: Throttle orders during peak times
- **Prep Time Estimates**: Dynamic based on current queue
- **Notification System**: Alert staff of new orders
- **Dedicated Pickup Display**: Customer name/order number

### 3. Cafe & Table Management

#### 3.1 Reservations
- **Online Booking**: Customer self-service reservations
- **Walk-in Management**: Waitlist with estimated times
- **Special Occasions**: Flag birthdays, anniversaries
- **No-Show Tracking**: Customer reliability scoring

### 4. Sales Tracking & Reporting

#### 4.1 Real-Time Dashboard
- **Live Sales**: Today's revenue, orders, average ticket
- **Hourly Breakdown**: Identify peak and slow periods
- **Product Mix**: Best sellers, slow movers
- **Staff Performance**: Individual and team metrics

#### 4.2 Historical Analytics
- **Trend Analysis**: Week-over-week, month-over-month, YoY
- **Cohort Analysis**: Customer retention over time
- **Product Performance**: Margin analysis, popularity trends
- **Labor Efficiency**: Sales per labor hour

#### 4.3 Financial Reports
- **End-of-Day Summary**: Cash reconciliation, card batches
- **Tax Reports**: GST breakdown by category
- **Profit & Loss**: Revenue vs. COGS analysis
- **Export Options**: CSV, PDF, accounting software integration

### 5. Universal Loyalty Program

#### 5.1 Point Earning
- **Cross-Cafe Points**: Earn at any Sippy-connected cafe
- **Earning Rate**: Configurable per cafe (e.g., 1 point per $1)
- **Bonus Events**: Double points days, product bonuses
- **Streak Rewards**: Consecutive visit bonuses
- **Referral Points**: Earn for bringing new customers

#### 5.2 Point Redemption
- **Universal Vouchers**: Redeem at any participating cafe
- **Tiered Rewards**: Bronze, Silver, Gold, Platinum tiers
- **Voucher Types**: 
  - Free drink vouchers
  - Percentage discounts
  - Buy-one-get-one
  - Free upgrades (size, milk)
- **Partner Rewards**: Non-cafe redemptions (merchandise, experiences)

#### 5.3 Cafe Economics
- **Revenue Share**: Fair distribution when points cross cafes
- **Settlement System**: Monthly reconciliation between cafes
- **Bonus Funding**: Cafes can fund extra promotions
- **Network Benefits**: Attract customers from other cafes

### 6. Customer Analytics & AI Coffee Profile

#### 6.1 Individual Customer Insights
- **Order History**: Complete transaction record
- **Visit Patterns**: Frequency, timing, location preferences
- **Spend Analysis**: Average ticket, lifetime value
- **Preference Evolution**: How tastes change over time

#### 6.2 AI Coffee Profile
- **Taste Preferences**: 
  - Roast level (light to dark)
  - Origin preferences (single origin, blends)
  - Flavor notes (fruity, chocolatey, nutty)
  - Strength preference
  - Milk preferences
- **Brewing Method Affinity**: Espresso, filter, cold brew
- **Discovery Score**: Openness to trying new things
- **Sustainability Index**: Preference for ethical sourcing

#### 6.3 Personalized Recommendations
- **Menu Suggestions**: "You might like..." based on profile
- **New Cafe Matches**: Discover cafes aligned with taste
- **Seasonal Recommendations**: Limited offerings matched to profile
- **Social Features**: Compare profiles with friends

### 7. Cafe Discovery & Network

#### 7.1 Cafe Directory
- **Search & Filter**: Location, style, specialty, hours
- **Ratings & Reviews**: Customer feedback system
- **Menu Preview**: See offerings before visiting
- **Real-Time Status**: Open/closed, current busyness

#### 7.2 Network Benefits
- **Cross-Promotion**: Feature partner cafes
- **Event Collaboration**: Multi-cafe events and promotions
- **Roaster Partnerships**: Highlight bean suppliers
- **Community Building**: Connect cafe owners

---

## Technical Requirements

### Performance
- POS transaction completion: < 2 seconds
- Online order submission: < 3 seconds
- Dashboard load time: < 5 seconds
- 99.9% uptime SLA

### Scalability
- Support 10,000+ concurrent cafes
- Handle 1M+ daily transactions
- Real-time sync across 100+ devices per cafe

### Security
- PCI DSS Level 1 compliance
- End-to-end encryption for payment data
- SOC 2 Type II certification
- GDPR/CCPA compliance for customer data

### Media Storage
- Vercel Blob for all media assets (product images, cafe logos, receipts)
- Global CDN distribution via Vercel Edge Network
- Automatic image optimization and resizing

### Integrations
- Payment processors: Stripe, Square, Adyen
- Accounting: Xero, QuickBooks, MYOB
- Delivery: DoorDash, UberEats, Deliveroo
- Hardware: Star, Epson printers; various card terminals

---

## Success Metrics

### Platform Metrics
| Metric | Year 1 Target | Year 3 Target |
|--------|---------------|---------------|
| Active Cafes | 500 | 5,000 |
| Monthly Transactions | 500K | 10M |
| Registered Customers | 100K | 2M |
| Cross-Cafe Redemptions | 10% | 25% |

### Cafe Metrics
| Metric | Target Improvement |
|--------|-------------------|
| Customer Retention | +30% |
| Average Ticket Size | +15% |
| Staff Efficiency | +20% |
| Repeat Visit Rate | +40% |

### Customer Metrics
| Metric | Target |
|--------|--------|
| App Rating | 4.5+ stars |
| Monthly Active Users | 60% of registered |
| Points Redemption Rate | 70%+ |
| Cafe Discovery Rate | 2+ new cafes/year |

---

## Monetization Strategy

### Cafe Pricing Tiers

#### Starter - $49/month
- 1 POS terminal
- Basic reporting
- Loyalty participation
- Email support

#### Professional - $129/month
- Up to 3 terminals
- Advanced analytics
- Online ordering
- Table management
- Priority support

#### Enterprise - $299/month
- Unlimited terminals
- Multi-location management
- API access
- Dedicated account manager
- Custom integrations

### Transaction Fees
- 0.5% platform fee on all transactions
- 2.5% + $0.10 payment processing (passed through)

### Loyalty Network Fee
- 1% of transaction value when cross-cafe points are redeemed
- Split between originating and redeeming cafe

---

## Competitive Landscape

| Feature | Sippy | Square | Toast | Lightspeed |
|---------|-------|--------|-------|------------|
| Cafe-Specific Features | ✅ | ❌ | ⚠️ | ⚠️ |
| Cross-Venue Loyalty | ✅ | ❌ | ❌ | ❌ |
| AI Coffee Profiles | ✅ | ❌ | ❌ | ❌ |
| Network Effects | ✅ | ❌ | ❌ | ❌ |
| Indie-Friendly Pricing | ✅ | ✅ | ❌ | ❌ |

---

## Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Low cafe adoption | High | Medium | Strong onboarding, free trial, referral incentives |
| Customer data breach | Critical | Low | Security-first architecture, regular audits |
| Payment processing issues | High | Low | Multiple processor fallbacks |
| Cross-cafe fraud | Medium | Medium | ML-based fraud detection, velocity limits |
| Competitor response | Medium | High | Focus on network effects, community building |

---

## Roadmap Summary

### Phase 1 (Months 1-6): Foundation
- Core POS functionality
- Basic loyalty program
- Single-cafe deployment

### Phase 2 (Months 7-12): Expansion
- Online ordering
- Multi-cafe loyalty network
- Mobile apps

### Phase 3 (Months 13-18): Intelligence
- AI coffee profiles
- Advanced analytics
- Cafe discovery network

### Phase 4 (Months 19-24): Scale
- Enterprise features
- API marketplace
- International expansion

---

## Appendix

### Glossary
- **Sippy Points**: Universal loyalty currency across the Sippy network
- **Coffee Profile**: AI-generated taste preference summary
- **Network Cafe**: A cafe participating in the Sippy loyalty network
- **Cross-Redemption**: Using points earned at Cafe A to get rewards at Cafe B

### Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Dec 2024 | Product Team | Initial PRD |

