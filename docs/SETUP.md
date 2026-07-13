# Setup Guide

## 1. Supabase Setup

### Create Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your **Project URL** and **Anon Key** from Settings > API

### Run Migrations
```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-id

# Run all migrations
supabase db push

# Deploy edge functions
supabase functions deploy match-kabadiwala
supabase functions deploy process-payment
supabase functions deploy send-notification
supabase functions deploy update-rates
```

### Configure Auth
1. Go to Authentication > Providers
2. Enable **Phone** provider
3. Configure SMS provider (Twilio recommended)
4. Set OTP expiry to 300 seconds

### Configure Storage
1. Create a bucket named `uploads` (public)
2. Set file size limit to 10MB
3. Allow image/* content types

### Edge Function Secrets
```bash
supabase secrets set RAZORPAY_KEY_ID=your_key
supabase secrets set RAZORPAY_KEY_SECRET=your_secret
supabase secrets set FCM_SERVER_KEY=your_fcm_key
supabase secrets set TWILIO_ACCOUNT_SID=your_sid
supabase secrets set TWILIO_AUTH_TOKEN=your_token
supabase secrets set TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

## 2. Razorpay Setup

1. Create account at [razorpay.com](https://razorpay.com)
2. Get Key ID and Key Secret from Dashboard > Account & Settings > API Keys
3. Enable UPI payment method
4. Set up webhook for payment confirmations

## 3. Mapbox Setup

1. Create account at [mapbox.com](https://mapbox.com)
2. Get access token from Account > Tokens
3. Free tier: 50,000 map loads/month

## 4. Firebase Setup (Push Notifications)

1. Create project at [console.firebase.google.com](https://console.firebase.google.com)
2. Add Android & iOS apps
3. Download `google-services.json` (Android) and `GoogleService-Info.plist` (iOS)
4. Get Server Key from Project Settings > Cloud Messaging

## 5. Environment Variables

Create `.env` file in root:
```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN=your-mapbox-token
EXPO_PUBLIC_RAZORPAY_KEY_ID=your-razorpay-key
```

## 6. Running Locally

```bash
# Install all dependencies
pnpm install

# Run household app
cd apps/household && npx expo start

# Run kabadiwala app (in another terminal)
cd apps/kabadiwala && npx expo start
```

## 7. Testing

- Use Expo Go app on your phone for quick testing
- For full native features (maps, camera), build with EAS:
  ```bash
  npx eas build --platform android --profile development
  ```
