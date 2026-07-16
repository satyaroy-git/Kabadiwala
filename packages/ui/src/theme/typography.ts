import { TextStyle } from 'react-native';

export const typography: Record<string, TextStyle> = {
  // Headings
  h1: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 30,
  },
  h4: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 26,
  },

  // Body
  bodyLarge: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 26,
  },
  body: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 22,
  },
  bodySmall: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },

  // Labels
  label: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 22,
  },
  labelSmall: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },

  // Caption
  caption: {
    fontSize: 11,
    fontWeight: '400',
    lineHeight: 14,
  },

  // Button
  button: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 26,
  },
  buttonSmall: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 22,
  },

  // Numbers/Currency
  currency: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
  },
  currencyLarge: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
  },
} as const;

export type Typography = typeof typography;
