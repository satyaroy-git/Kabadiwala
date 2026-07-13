import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Kabadiwala Partner',
  slug: 'kabadiwala-partner',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#FF9800',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'com.kabadiwala.partner',
    infoPlist: {
      NSLocationAlwaysAndWhenInUseUsageDescription:
        'We need your location to share with households during active pickups.',
      NSLocationWhenInUseUsageDescription:
        'We need your location to show nearby pickup requests.',
      NSCameraUsageDescription:
        'Camera is needed for selfie and vehicle photo during registration.',
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#FF9800',
    },
    package: 'com.kabadiwala.partner',
    permissions: [
      'ACCESS_FINE_LOCATION',
      'ACCESS_COARSE_LOCATION',
      'ACCESS_BACKGROUND_LOCATION',
      'CAMERA',
    ],
  },
  plugins: [
    'expo-router',
    'expo-location',
    'expo-notifications',
    'expo-secure-store',
    'expo-camera',
    'expo-image-picker',
  ],
  extra: {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    mapboxToken: process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN,
  },
});
