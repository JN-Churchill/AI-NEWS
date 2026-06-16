export const locales = ['zh', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'zh';

export function getLocaleFromPathname(pathname: string): Locale {
  const segments = pathname.split('/');
  const locale = segments[1] as Locale;
  if (locales.includes(locale)) {
    return locale;
  }
  return defaultLocale;
}

export function getTranslations(locale: Locale) {
  return import(`./${locale}.json`).then(module => module.default);
}

export async function getTranslation(locale: Locale, key: string): Promise<string> {
  const translations = await getTranslations(locale);
  const keys = key.split('.');
  let value: any = translations;
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return key; // Fallback to key if translation not found
    }
  }
  
  return typeof value === 'string' ? value : key;
}
