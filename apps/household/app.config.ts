import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Kabadiwala',
  slug: 'kabadiwala-household',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#4CAF50',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'com.kabadiwala.household',
    config: {
      googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY,
    },
    infoPlist: {
      NSLocationWhenInUseUsageDescription:
        'We need your location to find nearby kabadiwalas and show tracking.',
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#4CAF50',
    },
    package: 'com.kabadiwala.household',
    permissions: ['ACCESS_FINE_LOCATION', 'ACCESS_COARSE_LOCATION'],
    config: {
      googleMaps: {
        apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY,
      },
    },
  },
  plugins: [
    'expo-router',
    'expo-location',
    'expo-notifications',
    'expo-secure-store',
  ],
  extra: {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    mapboxToken: process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN,
    razorpayKeyId: process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID,
  },
});
