export { colors } from './colors';
export { spacing, borderRadius } from './spacing';
export { typography } from './typography';

export const theme = {
  colors: require('./colors').colors,
  spacing: require('./spacing').spacing,
  borderRadius: require('./spacing').borderRadius,
  typography: require('./typography').typography,
};

export type Theme = typeof theme;
