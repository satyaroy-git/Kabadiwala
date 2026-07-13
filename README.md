# Kabadiwala - Scrap Pickup Marketplace

A two-sided mobile marketplace connecting households to verified local scrap dealers (kabadiwalas) with live pricing, real-time tracking, and instant UPI payments.

## Problem

Selling old newspapers, bottles, and e-waste still means waiting for a scrap dealer to walk by or calling someone you vaguely trust. A simple app connecting households to verified local scrap dealers with live pricing doesn't really exist at scale.

## Solution

**Kabadiwala** is a two-sided marketplace:
- **Household App** — Book pickups, see live rates, track kabadiwala, get digital bills
- **Kabadiwala Partner App** — Get verified, accept pickups, weigh & bill, earn transparently

## Tech Stack

| Layer | Technology |
|-------|-----------|
| App Framework | React Native (Expo) |
| Database | Supabase (PostgreSQL + Realtime) |
| Auth | Supabase Auth + DigiLocker API |
| Payments | Razorpay (UPI) |
| Maps | Mapbox |
| Notifications | Firebase FCM + Twilio/WhatsApp |
| Monorepo | pnpm workspaces + Turborepo |

## Project Structure

```
kabadiwala/
├── apps/
│   ├── household/          # Household React Native app
│   └── kabadiwala/         # Kabadiwala Partner app
├── packages/
│   ├── shared/             # Shared types, constants, utils
│   └── ui/                 # Shared UI component library
├── supabase/
│   ├── migrations/         # Database schema & seed data
│   └── functions/          # Edge functions (matching, payments, notifications)
├── docs/                   # Documentation
├── package.json            # Monorepo root
├── pnpm-workspace.yaml     # Workspace config
└── turbo.json              # Turborepo pipeline
```

## Getting Started

### Prerequisites

- Node.js >= 18
- pnpm >= 8
- Expo CLI (`npx expo`)
- Supabase account
- Android Studio / Xcode (for mobile testing)

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/satyaroy-git/Kabadiwala.git
   cd Kabadiwala
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Fill in your Supabase, Mapbox, Razorpay, and Firebase keys
   ```

4. **Set up Supabase**
   - Create a new Supabase project
   - Run migrations: `supabase db push`
   - Deploy edge functions: `supabase functions deploy`

5. **Run the Household app**
   ```bash
   pnpm household start
   ```

6. **Run the Kabadiwala app**
   ```bash
   pnpm dealer start
   ```

## How It Works

### Household Flow
1. Open app, select scrap type (paper, metal, plastic, e-waste)
2. See live rate card — locked at booking
3. Pick date, time slot, address
4. Booking confirmed → nearest verified kabadiwala assigned
5. Track kabadiwala on map (live, like Ola)
6. Kabadiwala arrives, weighs scrap on digital scale
7. UPI payment sent immediately
8. Rate the kabadiwala (1-5 stars)

### Kabadiwala Flow
1. Register — Aadhaar + selfie + vehicle photo (10 min)
2. Set service pincode(s) and availability
3. Accept incoming pickup requests in their area
4. App shows household address and scrap details
5. Navigate using in-app map
6. Enter weight → app calculates payment automatically
7. Receive payment: platform deducts 10% commission
8. Build rating → unlock higher-value bookings

## Phase Roadmap

- **Phase 1 (MVP)**: Core booking flow, live rates, tracking, payments, ratings
- **Phase 2 (Growth)**: Impact tracker, badges, referrals, chat, multi-language
- **Phase 3 (Monetisation)**: E-waste certs, B2B leads, premium subscriptions

## Commission Model

- Platform charges **10% commission** per transaction
- Minimum commission: ₹5
- Household receives full scrap value via UPI
- Kabadiwala receives 90% (clearly shown in earnings dashboard)

## License

Private - All rights reserved.
