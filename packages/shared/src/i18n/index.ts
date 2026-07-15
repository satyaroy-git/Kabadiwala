import AsyncStorage from '@react-native-async-storage/async-storage';
import { Language, TranslationKeys, LANGUAGES } from './translations';
import { en } from './en';
import { hi } from './hi';
import { mr } from './mr';
import { ta } from './ta';
import { te } from './te';
import { kn } from './kn';

export { Language, TranslationKeys, LANGUAGES } from './translations';

const translations: Record<Language, TranslationKeys> = { en, hi, mr, ta, te, kn };

const STORAGE_KEY = '@kabadiwala_language';
let currentLanguage: Language = 'en';
let listeners: (() => void)[] = [];

export function t(key: keyof TranslationKeys): string {
  return translations[currentLanguage]?.[key] || translations.en[key] || key;
}

export function getLanguage(): Language {
  return currentLanguage;
}

export async function loadLanguage(): Promise<Language> {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    if (saved && translations[saved as Language]) {
      currentLanguage = saved as Language;
    }
  } catch {}
  return currentLanguage;
}

export async function setLanguage(lang: Language): Promise<void> {
  currentLanguage = lang;
  await AsyncStorage.setItem(STORAGE_KEY, lang);
  listeners.forEach((fn) => fn());
}

export function onLanguageChange(fn: () => void): () => void {
  listeners.push(fn);
  return () => { listeners = listeners.filter((l) => l !== fn); };
}
