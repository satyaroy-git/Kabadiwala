import { useState, useEffect, useCallback } from 'react';
import { t, onLanguageChange, loadLanguage, getLanguage } from './index';
import { TranslationKeys } from './translations';

export function useTranslation() {
  const [lang, setLang] = useState(getLanguage());

  useEffect(() => {
    // Load saved language on mount
    loadLanguage().then((savedLang) => {
      setLang(savedLang);
    });

    // Listen for language changes
    const unsubscribe = onLanguageChange(() => {
      setLang(getLanguage());
    });
    return unsubscribe;
  }, []);

  // Return t function that always uses current language
  const translate = useCallback((key: keyof TranslationKeys): string => {
    return t(key);
  }, [lang]); // Re-create when lang changes to trigger re-renders in consumers

  return { t: translate, currentLanguage: lang };
}
