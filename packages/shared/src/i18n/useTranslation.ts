import { useState, useEffect } from 'react';
import { t, onLanguageChange, loadLanguage, TranslationKeys } from './index';

export function useTranslation() {
  const [, setTick] = useState(0);

  useEffect(() => {
    loadLanguage();
    const unsubscribe = onLanguageChange(() => {
      setTick((prev) => prev + 1); // Force re-render
    });
    return unsubscribe;
  }, []);

  return { t };
}
