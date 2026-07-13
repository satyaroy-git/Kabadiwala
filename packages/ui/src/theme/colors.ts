export const colors = {
  // Primary brand colors
  primary: {
    50: '#E8F5E9',
    100: '#C8E6C9',
    200: '#A5D6A7',
    300: '#81C784',
    400: '#66BB6A',
    500: '#4CAF50', // Main green - recycling/eco theme
    600: '#43A047',
    700: '#388E3C',
    800: '#2E7D32',
    900: '#1B5E20',
  },

  // Secondary accent
  secondary: {
    50: '#FFF3E0',
    100: '#FFE0B2',
    200: '#FFCC80',
    300: '#FFB74D',
    400: '#FFA726',
    500: '#FF9800', // Orange - energy/action
    600: '#FB8C00',
    700: '#F57C00',
    800: '#EF6C00',
    900: '#E65100',
  },

  // Neutral/Grey
  neutral: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },

  // Semantic colors
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',

  // Background
  background: {
    primary: '#FFFFFF',
    secondary: '#F8F9FA',
    tertiary: '#F0F0F0',
  },

  // Text
  text: {
    primary: '#212121',
    secondary: '#757575',
    tertiary: '#9E9E9E',
    inverse: '#FFFFFF',
    link: '#2196F3',
  },

  // Status-specific
  booking: {
    pending: '#FF9800',
    accepted: '#4CAF50',
    en_route: '#2196F3',
    arrived: '#9C27B0',
    completed: '#4CAF50',
    cancelled: '#F44336',
  },

  // White and black
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;

export type Colors = typeof colors;
