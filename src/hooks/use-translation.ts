"use client";

import { useState, useEffect } from 'react';
import { type Locale, defaultLocale } from '@/i18n/config';
import zhTranslations from '@/i18n/zh.json';
import enTranslations from '@/i18n/en.json';

type Translations = Record<string, any>;

const translationMap: Record<Locale, Translations> = {
  zh: zhTranslations,
  en: enTranslations,
};

export function useTranslation(locale: Locale = defaultLocale) {
  const [translations, setTranslations] = useState<Translations>(translationMap[locale] || translationMap[defaultLocale]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setTranslations(translationMap[locale] || translationMap[defaultLocale]);
  }, [locale]);

  const t = (key: string, fallback?: string): string => {
    const keys = key.split('.');
    let value: any = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return fallback || key;
      }
    }
    
    return typeof value === 'string' ? value : fallback || key;
  };

  return { t, loading, translations };
}
