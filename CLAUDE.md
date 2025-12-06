# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Sippy is a unified cafe management platform that combines POS, online ordering, table management, and a cross-cafe loyalty ecosystem. Built with Next.js 14, TypeScript, Prisma, and PostgreSQL (Neon).

## Development Commands

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Linting
npm run lint

# Database operations
npm run db:push          # Push schema changes to database (Prisma)
npm run db:migrate       # Create and apply migrations
npm run db:seed          # Seed database with demo data
npm run db:studio        # Open Prisma Studio (database GUI)

# Setup utilities
npm run setup:superadmin # Create a superadmin user
```

## Database & ORM

- **Database**: PostgreSQL (hosted on Neon)
- **ORM**: Prisma
- **Schema Location**: `prisma/schema.prisma`
- **Client Import**: `import { prisma } from "@/lib/prisma"`

The Prisma client is instantiated globally to prevent connection exhaustion in development. Always import from `@/lib/prisma`.

After modifying the schema:
1. Run `npm run db:push` to update the database (for development)
2. Use `npm run db:migrate` for production migrations
3. Prisma client is auto-generated on `npm install` via postinstall hook

## Database Schema Architecture

The schema is organized into 6 logical sections:

1. **User & Auth**: NextAuth integration with Users, Accounts, Sessions, and role-based access (CUSTOMER, STAFF, MANAGER, OWNER, ADMIN, SUPERADMIN)
2. **Cafe & Staff**: Multi-tenant cafe management with StaffProfiles linking users to cafes with specific roles
3. **Menu & Products**: Categories, Products with modifiers (milk options, sizes, etc.) and coffee-specific metadata (roast levels, origin, flavor notes)
4. **Orders & Payments**: Complete order lifecycle with multiple payment methods, order items with modifiers stored as JSON
5. **Table Management**: Physical layout management for dine-in orders with status tracking
6. **Loyalty & Customers**: Points system with transactions, voucher redemption, tiered loyalty (Bronze/Silver/Gold/Platinum), and AI-generated coffee profiles

Key relationships:
- Users can have multiple StaffProfiles across different cafes
- Users have exactly one Customer profile for loyalty
- Orders belong to a Cafe and optionally link to Customer, Table, and Staff User
- Products have ProductModifiers with multiple ModifierOptions
- Points earned at any cafe can be redeemed at any other cafe

## Authentication & Authorization

NextAuth configuration is in `lib/auth.ts` with dual authentication:
- **Credentials Provider**: Email/password with bcrypt hashing
- **Google OAuth**: Automatic customer profile creation on sign-up

User roles determine access:
- `CUSTOMER`: Customer-facing app (home, explore, loyalty, profile)
- `STAFF/MANAGER/OWNER`: Dashboard access with cafe-specific permissions via StaffProfile
- `ADMIN/SUPERADMIN`: Platform-wide administrative access

Session data includes:
```typescript
session.user.id           // User ID
session.user.role         // UserRole enum
session.user.customerId   // Customer profile ID (if exists)
session.user.staffProfiles // Array of cafe associations
```

## Application Structure

Next.js 14 App Router with route groups for different user contexts:

- `(auth)/*`: Authentication pages (login, register, setup-cafe)
- `(customer)/*`: Customer-facing app (home, explore, order, profile, loyalty)
- `(dashboard)/*`: Cafe management dashboard (POS, orders, menu, analytics, settings)
- `(superadmin)/*`: Platform administration
- `/api/*`: API routes organized by domain (auth, cafes, customers, orders, products, etc.)
- `/demo`: Standalone POS demo (no auth required)

The dashboard layout (`app/(dashboard)/layout.tsx`) includes:
- Collapsible sidebar with cafe selector
- Role-based navigation
- Active cafe context from session

## State Management & Context

- **Auth State**: NextAuth session via `useSession()` hook
- **Currency Context**: Global currency selection in `components/currency-context.tsx` (supports MYR, AUD, USD, SGD, etc.)
- **Client Components**: Most UI is client-side with `"use client"` directive due to interactivity requirements

## API Routes

API routes follow RESTful patterns in `/api`:

```
/api/auth/*              - NextAuth endpoints + custom registration
/api/cafes/*             - Cafe CRUD and public discovery
/api/categories/*        - Menu category management
/api/products/*          - Product CRUD with modifiers
/api/orders/*            - Order creation and management
/api/customers/*         - Customer lookup and management
/api/loyalty/*           - Points and vouchers
/api/dashboard/*         - Dashboard analytics and stats
/api/pos/*               - POS-specific operations
/api/blob-upload/*       - Image uploads (Vercel Blob)
```

## UI Components

- **Component Library**: Custom components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom theme in `tailwind.config.ts`
- **Custom Colors**: `espresso-*`, `cream-*`, `latte-*`, `carbon` color palettes
- **Typography**: `font-display` for headings, system fonts for body
- **Icons**: `lucide-react` for all iconography
- **Charts**: `recharts` for analytics visualizations

Common patterns:
- Use `cn()` utility from `@/lib/utils` for conditional classes
- Import UI components from `@/components/ui/*`
- Currency formatting via `formatCurrency()` from `@/lib/utils`

## Key Utilities (`lib/utils.ts`)

```typescript
cn()                          // Merge Tailwind classes with conflict resolution
formatCurrency(amount, code)  // Format with proper locale and symbol
formatPoints(points)          // Format loyalty points
generateOrderNumber(prefix)   // Generate human-readable order numbers (e.g., "A-042")
generateVoucherCode()         // Generate 8-char alphanumeric codes
calculateLoyaltyTier()        // Determine tier from lifetime points
getTierColor(tier)            // Get Tailwind classes for tier badges
getOrderStatusColor(status)   // Get Tailwind classes for order status
```

## Image Handling

Next.js Image component is configured for remote patterns:
- `images.unsplash.com` - Stock photos
- `images.pexels.com` - Stock photos
- `public.blob.vercel-storage.com` - User uploads via Vercel Blob

Upload images through `/api/blob-upload` endpoints.

## Environment Variables

Required variables (see `env.template`):

```bash
DATABASE_URL              # Neon PostgreSQL connection string
DIRECT_URL                # Direct connection (non-pooled) for migrations
NEXTAUTH_URL              # App URL (http://localhost:3000 in dev)
NEXTAUTH_SECRET           # Random secret for session encryption
GOOGLE_CLIENT_ID          # OAuth credentials (optional)
GOOGLE_CLIENT_SECRET      # OAuth credentials (optional)
BLOB_READ_WRITE_TOKEN     # Vercel Blob for uploads (optional)
```

## Multi-tenancy Architecture

Sippy is multi-tenant at the cafe level:

1. **Data Isolation**: Most queries filter by `cafeId` to ensure data separation
2. **Staff Access**: Users link to cafes via `StaffProfile` with specific roles
3. **Loyalty Sharing**: Points and customers are global - intentionally shared across cafes for network effect
4. **Cafe Context**: Dashboard always operates within the active cafe from `session.user.staffProfiles[0]`

When building features:
- Dashboard features should filter by active `cafeId`
- Customer features should work across all cafes
- Always verify cafe ownership before mutations

## Common Patterns

### Creating an API Route

```typescript
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Query with cafe context
  const cafeId = session.user.staffProfiles?.[0]?.cafeId
  const data = await prisma.product.findMany({ where: { cafeId } })

  return NextResponse.json(data)
}
```

### Dashboard Page with Auth Check

```typescript
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.staffProfiles?.[0]) {
    redirect("/login")
  }

  const cafeId = session.user.staffProfiles[0].cafeId
  // Fetch cafe-specific data...

  return <div>...</div>
}
```

### Customer Page

```typescript
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function CustomerPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.customerId) {
    redirect("/login")
  }

  // Customer features - no cafe filtering needed
  return <div>...</div>
}
```

## Testing & Demo Data

Run `npm run db:seed` to populate:
- Demo cafe with full menu (20+ products)
- Sample customers with loyalty tiers
- Order history with various statuses
- Demo user: demo@sippy.coffee / demo1234

The `/demo` route provides a standalone POS experience without authentication for showcasing.

## Deployment

- **Platform**: Designed for Vercel deployment
- **Database**: Neon PostgreSQL (connection pooling supported)
- **Build Command**: `npm run build` (includes Prisma generation)
- **Environment**: Ensure all variables are set in Vercel dashboard

## Known Patterns to Follow

1. **Always use Server Components by default** - only add `"use client"` when necessary for interactivity
2. **Prefer Server Actions** for mutations when possible (though current implementation uses API routes)
3. **Mobile-first responsive design** - all UIs should work on small screens
4. **Optimistic UI updates** - especially in POS for fast user experience
5. **Error boundaries** - graceful error handling with user-friendly messages
6. **Loading states** - show skeleton loaders during data fetches
7. **Type safety** - leverage Prisma types, avoid `any` unless necessary
8. **Accessibility** - Radix UI components provide good defaults, maintain them

## Directory Quick Reference

```
app/                    # Next.js app directory
├── (auth)/            # Login, register, cafe setup
├── (customer)/        # Customer-facing app
├── (dashboard)/       # Cafe management
├── api/               # API routes
components/
├── ui/                # Reusable UI components (buttons, cards, etc.)
├── marketing/         # Landing page components
lib/
├── auth.ts            # NextAuth configuration
├── prisma.ts          # Prisma client singleton
├── utils.ts           # Utility functions
├── hooks/             # Custom React hooks
prisma/
├── schema.prisma      # Database schema
├── seed.ts           # Demo data seeding
scripts/               # Utility scripts
```
