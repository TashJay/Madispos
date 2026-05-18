# MADIS — Market Analysis & Data Insight System

## Overview
MADIS is a multi-tenant cloud-based Point of Sale (POS) ecosystem built by August. It allows multiple business owners to sign up, subscribe, and run their own isolated POS dashboard — all from a single platform.

## Tech Stack
- **Frontend:** React 19 + TypeScript + Tailwind CSS 4
- **Animation:** Framer Motion
- **Backend/Database:** Firebase (Firestore + Auth)
- **Build Tool:** Vite
- **PWA:** Offline support via service worker

## Architecture

### User Flow
1. **Landing Page** — marketing page with features, pricing (KSh 1,000/yr or $1 USD), and business types
2. **Auth** — email/password or Google OAuth via Firebase Auth
3. **Subscription** — simulated M-Pesa or card payment flow (KSh 1,000/year)
4. **Business Selection** — user picks their business type (bar, spa, gym, restaurant, shop, etc.)
5. **POS Dashboard** — full point of sale system personalised for the business type

### Multi-Tenancy
Each business owner's data is scoped to their Firebase UID:
- `users/{uid}/staff`
- `users/{uid}/inventory`
- `users/{uid}/tabs`
- `users/{uid}/rooms`
- `users/{uid}/auditLogs`

Default inventory is seeded automatically based on the chosen business type.

### POS Features
- PIN-based staff login with role-based access (STAFF, SUPERVISOR, ADMIN, OWNER)
- Sales with real-time cart, quick-sell menu, and category filtering
- Open tabs, debt tracking, and tab settlement
- Inventory management with stock alerts
- Room/unit management (for hotels, rentals)
- M-Pesa + cash payment recording
- Business reports and analytics (Recharts)
- Full audit trail
- Shift close-out with revenue summary
- Offline mode with localStorage fallback

## User Preferences
- Brand name: MADIS (Market Analysis & Data Insight System)
- Built by August
- Pricing: KSh 1,000/year or $1 USD/year
- Color scheme: dark theme with neon green (#00FF88) accents
- Business types supported: bar, nightclub, restaurant, café, spa, gym, retail shop, hardware store, rental/hotel, pharmacy
