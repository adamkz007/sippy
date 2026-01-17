## Overview
Implement the customer Rewards page enhancements to display the customer’s QR code (derived from their phone number) for cafes to scan, while also presenting available rewards. Leverage existing loyalty data and keep UI styling consistent with current components.

## Where This Lives
- Page: [loyalty/page.tsx](file:///Users/adamkz/sippy/app/(customer)/loyalty/page.tsx)
- Layout/Tab: [layout.tsx](file:///Users/adamkz/sippy/app/(customer)/layout.tsx) (already labels /loyalty as “Rewards”)
- Data source: [customer/me](file:///Users/adamkz/sippy/app/api/customer/me/route.ts) (includes user.phone and loyalty)
- Cafe lookup (for POS): [customers/lookup](file:///Users/adamkz/sippy/app/api/customers/lookup/route.ts) (normalizes phone for search)
- Schema: [schema.prisma](file:///Users/adamkz/sippy/prisma/schema.prisma#L372-L390) Customer phone; [schema.prisma](file:///Users/adamkz/sippy/prisma/schema.prisma#L410-L475) Vouchers & loyalty enums

## UI Changes
- Add a “Your QR” card near the top of the Rewards page header showing:
  - QR code encoding the normalized customer phone (digits-only).
  - The visible phone number and a Copy button.
  - Fallback: if no phone on file, show a prompt with a button linking to Profile → Settings to add phone.
- Keep existing points balance, tier progress, streak, My Vouchers, and Redeem Points sections.
- Maintain styling with current shadcn/ui components and lucide-react icons.

## QR Code Generation
- Add a lightweight client-side QR renderer (react-qr-code).
- Render within the client component; no server storage or external APIs.
- Encode a normalized phone string (remove spaces, dashes, parentheses). Example payload: "60123456789".

## Data & Normalization
- Fetch profile via /api/customer/me; use `user.phone` when present, else `customer.phone`.
- Normalize phone for QR and display the original formatted phone text for readability.
- Align normalization with cafe lookup: mirror [customers/lookup](file:///Users/adamkz/sippy/app/api/customers/lookup/route.ts#L23-L31) rules (strip spaces, dashes, parentheses).

## Available Rewards
- Reuse “Redeem Points” UI for available rewards (currently static). Keep it as a placeholder for “participating cafes” offers.
- Follow-up (separate task): introduce a backend endpoint returning active reward offers per cafe and aggregate for the customer.

## Implementation Steps
1. Add dependency: react-qr-code to package.json.
2. Update loyalty/page.tsx:
   - Fetch profile (already implemented) and derive `displayPhone` + `normalizedPhone`.
   - Insert a Card component in the Rewards tab with QRCode component rendering `normalizedPhone`.
   - Add Copy-to-clipboard button and a small instruction: “Cafe can scan this or enter your phone.”
   - Conditional empty state directing to /profile/settings if phone is missing.
3. Ensure no SSR issues (the page is already "use client").
4. Keep existing rewards UI; no backend changes required.

## Verification
- Run the app locally; sign in as a customer with/without phone.
- Confirm QR renders with correct data and visually matches design.
- Scan the QR using any QR app to verify it yields normalized digits.
- Validate cafes can lookup using those digits via the POS (already uses /customers/lookup).
- Check that vouchers and available rewards still display correctly.

## Notes
- No secrets used; QR generated client-side. BLOB storage not required.
- Future: replace static rewards with API-driven offers aggregated from participating cafes.

Please confirm, and I’ll implement these changes end-to-end.