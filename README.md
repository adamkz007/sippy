# ☕ Sippy

> Every coffee counts, everywhere.

Sippy is a unified cafe management platform that transforms how independent cafes operate and how customers experience specialty coffee. By combining Point-of-Sale, online ordering, table management, and a cross-cafe loyalty ecosystem, Sippy creates a network effect where every participating cafe benefits from shared customer loyalty.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- [Neon](https://neon.tech) account (free tier available)

### Setup with Neon Database

1. **Create a Neon project** at [console.neon.tech](https://console.neon.tech)
2. **Copy your connection string** from the Neon dashboard

```bash
# Install dependencies
npm install

# Create .env with your Neon database URL
cp env.template .env
# Edit .env and replace with your Neon connection string from the dashboard
```

Your `.env` should look like:
```env
DATABASE_URL="postgresql://neondb_owner:xxxxx@ep-cool-darkness-123456.us-east-2.aws.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://neondb_owner:xxxxx@ep-cool-darkness-123456.us-east-2.aws.neon.tech/neondb?sslmode=require"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

```bash
# Push database schema to Neon
npm run db:push

# Seed demo data
npm run db:seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Demo Credentials
- **Email:** demo@sippy.coffee
- **Password:** demo1234

Try the interactive POS demo at [/demo](http://localhost:3000/demo) - no database required!

---

## 🎯 What is Sippy?

Sippy combines six powerful systems into one seamless platform:

| Feature | Description |
|---------|-------------|
| **POS System** | Fast, intuitive point-of-sale for busy cafes |
| **Online Orders** | Customer-facing web app for order ahead |
| **Table Management** | Floor plans, reservations, and service flow |
| **Sales Tracking** | Real-time dashboards and historical analytics |
| **Universal Loyalty** | Cross-cafe points that work everywhere |
| **AI Coffee Profiles** | Personalized taste profiles for every customer |

## 🌟 Key Differentiators

### For Cafes
- **Network Effects**: Attract customers from other Sippy cafes
- **Enterprise Tools, Indie Pricing**: Powerful features without the complexity
- **Customer Intelligence**: Know your regulars better than ever

### For Customers
- **One App, All Cafes**: Points work at any participating cafe
- **Discover Your Taste**: AI-generated coffee profile based on your orders
- **Never Lose Rewards**: Universal vouchers across the network

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [PRD](docs/PRD.md) | Product Requirements Document - features, personas, success metrics |
| [Implementation Plan](docs/IMPLEMENTATION_PLAN.md) | Phased development roadmap with sprint details |
| [Architecture](docs/ARCHITECTURE.md) | System design, services, databases, and infrastructure |
| [Data Flow](docs/DATAFLOW.md) | How data moves through the system |

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT APPLICATIONS                      │
│  POS Terminal │ Admin Portal │ Customer App │ Online Orders │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       API GATEWAY                            │
│            Rate Limiting • Auth • Routing                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      MICROSERVICES                           │
│  Auth │ Order │ Payment │ Loyalty │ Catalog │ Analytics    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       DATA LAYER                             │
│  PostgreSQL │ Redis │ Kafka │ TimescaleDB │ Elasticsearch  │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | Next.js 14, React, TypeScript, Tailwind CSS |
| **Mobile** | React Native, Expo |
| **Backend** | Node.js, NestJS, TypeScript |
| **Database** | PostgreSQL, Redis, TimescaleDB |
| **Events** | Apache Kafka |
| **Search** | Elasticsearch |
| **ML/AI** | Python, TensorFlow, scikit-learn |
| **Infrastructure** | AWS, Kubernetes, Terraform |
| **Payments** | Stripe, Stripe Terminal |

## 📊 Core Flows

### Order Flow
```
POS → Order Service → Payment → Loyalty Points → Complete
```

### Loyalty Flow
```
Purchase at Cafe A → Earn Points → Redeem at Cafe B → Settlement
```

### AI Profile Flow
```
50+ Orders → Feature Extraction → ML Model → Coffee Profile → Recommendations
```

## 🎯 Success Metrics

| Metric | Year 1 Target |
|--------|---------------|
| Active Cafes | 500 |
| Monthly Transactions | 500K |
| Registered Customers | 100K |
| Cross-Cafe Redemptions | 10% |

## 📅 Roadmap

| Phase | Timeline | Focus |
|-------|----------|-------|
| **Foundation** | Months 1-6 | Core POS, Basic Loyalty |
| **Expansion** | Months 7-12 | Online Ordering, Mobile Apps |
| **Intelligence** | Months 13-18 | AI Profiles, Advanced Analytics |
| **Scale** | Months 19-24 | Enterprise, International |

## 💰 Pricing

| Tier | Price | Features |
|------|-------|----------|
| **Starter** | $49/mo | 1 terminal, basic reporting |
| **Professional** | $129/mo | 3 terminals, online orders, table management |
| **Enterprise** | $299/mo | Unlimited, multi-location, API access |

*Plus 0.5% platform fee on transactions*

## 🔒 Security & Compliance

- PCI DSS Level 1 compliant
- GDPR/CCPA compliant
- SOC 2 Type II certified
- End-to-end encryption
- 99.9% uptime SLA

## 📞 Contact

For more information about Sippy, please reach out to the product team.

---

*Built with ☕ for coffee lovers everywhere*

