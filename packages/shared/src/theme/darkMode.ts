import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark' | 'system';

const THEME_KEY = '@kabadiwala_theme';
let currentTheme: ThemeMode = 'light';
let isDark = false;
let themeListeners: (() => void)[] = [];

export function getThemeMode(): ThemeMode {
  return currentTheme;
}

export function isDarkMode(): boolean {
  return isDark;
}

export async function loadTheme(): Promise<ThemeMode> {
  try {
    const saved = await AsyncStorage.getItem(THEME_KEY);
    if (saved === 'dark' || saved === 'light' || saved === 'system') {
      currentTheme = saved;
      isDark = saved === 'dark';
    }
  } catch {}
  return currentTheme;
}

export async function setThemeMode(mode: ThemeMode): Promise<void> {
  currentTheme = mode;
  isDark = mode === 'dark';
  await AsyncStorage.setItem(THEME_KEY, mode);
  themeListeners.forEach((fn) => fn());
}

export function onThemeChange(fn: () => void): () => void {
  themeListeners.push(fn);
  return () => { themeListeners = themeListeners.filter((l) => l !== fn); };
}

// Dark color palette
export const darkColors = {
  background: { primary: '#121212', secondary: '#1E1E1E', tertiary: '#2C2C2C' },
  text: { primary: '#FFFFFF', secondary: '#B0B0B0', tertiary: '#808080', inverse: '#000000', link: '#64B5F6' },
  card: '#1E1E1E',
  border: '#333333',
};
