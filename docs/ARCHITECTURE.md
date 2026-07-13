# Architecture Overview

## System Design

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENTS                               │
│  ┌──────────────────┐        ┌──────────────────────────┐  │
│  │  Household App   │        │   Kabadiwala Partner App  │  │
│  │  (React Native)  │        │     (React Native)        │  │
│  └────────┬─────────┘        └───────────┬──────────────┘  │
└───────────┼──────────────────────────────┼──────────────────┘
            │                              │
            ▼                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     SUPABASE BACKEND                          │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   Auth   │  │ Database │  │ Realtime │  │ Storage  │   │
│  │(Phone OTP)│ │(Postgres)│  │  (WS)    │  │ (Files)  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                              │
│  ┌──────────────────── Edge Functions ───────────────────┐  │
│  │ match-kabadiwala │ process-payment │ send-notification │  │
│  │ update-rates     │                 │                   │  │
│  └────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
            │              │              │
            ▼              ▼              ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────────┐
│   Razorpay   │ │   Mapbox     │ │ Firebase FCM +   │
│   (Payments) │ │   (Maps)     │ │ Twilio (WhatsApp)│
└──────────────┘ └──────────────┘ └──────────────────┘
```

## Data Flow

### Booking Flow
```
Household creates booking
  → create_booking() locks rates
  → Edge Function: match-kabadiwala finds nearest dealer
  → Notification sent to kabadiwala
  → Kabadiwala accepts
  → Household notified
  → Live tracking begins (Supabase Realtime)
  → Weight entry → auto-bill
  → Edge Function: process-payment (Razorpay)
  → Payment confirmed
  → Rating collected
```

### Real-time Tracking
```
Kabadiwala app broadcasts GPS every 5s
  → INSERT into location_updates table
  → Supabase Realtime broadcasts to household
  → Household map updates in real-time
```

## Database Design Principles

1. **RLS (Row Level Security)**: Every table has policies ensuring users only see their own data
2. **Database Functions**: Business logic (billing, matching) runs server-side for security
3. **Realtime**: Only location_updates, bookings, and notifications are realtime-enabled
4. **Indexes**: Optimized for common queries (pincode lookup, status filters)

## Monorepo Structure

- `@kabadiwala/shared` — TypeScript types, constants, validators, formatters
- `@kabadiwala/ui` — React Native component library with theme system
- `@kabadiwala/household` — Household-facing Expo app
- `@kabadiwala/dealer` — Kabadiwala-facing Expo app

## Key Decisions

| Decision | Rationale |
|----------|-----------|
| Expo (not bare RN) | Faster iteration, OTA updates, managed builds |
| Supabase (not Firebase) | PostgreSQL power, realtime built-in, open source |
| pnpm workspaces | Fast installs, strict dependency resolution |
| Zustand (state) | Minimal boilerplate, TypeScript-first |
| Edge Functions | Server-side business logic without a separate backend |
| Razorpay | Best UPI support in India, no setup fee |
| Mapbox | 50k free loads, better than Google Maps pricing |

## Security

- Phone OTP authentication (no passwords)
- Aadhaar verification via DigiLocker (privacy-preserving)
- RLS policies on all tables
- Sensitive functions use SECURITY DEFINER
- API keys only stored in environment variables
- SecureStore for session tokens on mobile
